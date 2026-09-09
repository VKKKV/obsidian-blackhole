import { Plugin, Notice, MarkdownView } from 'obsidian';
import { BlackHoleSettingsTab } from './settings';
import { BlackHoleSettings, DEFAULT_SETTINGS, normalizeSettings, runtimeRenderScale } from './config';
import { BlackHoleRenderer } from './renderer';
import { WorkspaceCapture } from './capture';
import { t as translate, TranslationKey } from './i18n';
import { ShaderParams } from './shader';
import { MetricCache } from './metrics';

const MAX_HOLE_RADIUS = 0.014;
const MAX_TOKEN_AREA_MIN = 0.003;
const MAX_TOKEN_AREA_MAX = 0.02;
const MAX_DISK_OUTER = 7.0;

export default class BlackHolePlugin extends Plugin {
  settings: BlackHoleSettings = { ...DEFAULT_SETTINGS };
  private renderer: BlackHoleRenderer | null = null;
  private capture: WorkspaceCapture | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private unloaded = false;
  private layoutReady = false;
  private runtimeBlocked = false;
  private generation = 0;
  private ready = false;
  private compiling = false;
  private paramsVersion = 0;
  private lastActivity = 0;
  private playbackSuspended = true;
  private captureAvailable = false;
  private captureIntervalId = 0;
  private metricIntervalId = 0;
  private idleResumeTimeoutId = 0;
  private recompileTimeoutId = 0;
  private scrollTimeoutId = 0;
  private metrics = new MetricCache({
    currentText: () => this.app.workspace.getActiveViewOfType(MarkdownView)?.editor?.getValue() ?? null,
    markdownFileCount: () => this.app.vault.getMarkdownFiles().length,
    markdownTabCount: () => this.app.workspace.getLeavesOfType('markdown').length,
  });

  async onload() {
    await this.loadSettings();
    if (this.unloaded) return;
    this.lastActivity = performance.now();
    this.addSettingTab(new BlackHoleSettingsTab(this.app, this));
    this.addRibbonIcon('circle-dot', this.t('ribbon.toggle'), () => {
      void this.setEnabled(!this.settings.enabled);
    });
    this.registerDomEvent(document, 'keydown', this.activityHandler);
    this.registerDomEvent(document, 'mousedown', this.activityHandler);
    this.registerDomEvent(document, 'touchstart', this.activityHandler);
    this.registerDomEvent(document, 'wheel', this.activityHandler, { passive: true });
    this.registerDomEvent(document, 'visibilitychange', this.visibilityHandler);
    this.registerDomEvent(document, 'scroll', this.scrollHandler, { capture: true, passive: true });
    this.registerEvent(this.app.workspace.on('editor-change', () => {
      this.metrics.invalidate('word-count');
      this.capture?.requestSoon();
    }));
    this.registerEvent(this.app.workspace.on('active-leaf-change', this.refreshTarget));
    this.registerEvent(this.app.workspace.on('file-open', this.refreshTarget));
    this.registerEvent(this.app.workspace.on('layout-change', this.refreshTarget));
    const invalidateFiles = () => this.metrics.invalidate('word-count', 'file-count', 'global-word-count');
    this.registerEvent(this.app.vault.on('create', invalidateFiles));
    this.registerEvent(this.app.vault.on('delete', invalidateFiles));
    this.registerEvent(this.app.vault.on('rename', invalidateFiles));
    this.registerEvent(this.app.vault.on('modify', invalidateFiles));
    // Obsidian does not expose cancellation for this callback; the lifetime guard is mandatory.
    this.app.workspace.onLayoutReady(() => {
      if (this.unloaded) return;
      this.layoutReady = true;
      this.syncPlaybackGate();
    });
  }

  onunload() {
    this.unloaded = true;
    this.stop();
  }

  async setEnabled(enabled: boolean) {
    if (this.unloaded) return;
    this.settings.enabled = enabled;
    this.runtimeBlocked = false;
    if (enabled) this.start();
    else this.stop();
    new Notice(enabled ? this.t('notice.enabled') : this.t('notice.disabled'));
    await this.saveSettings();
  }

  start() { this.syncPlaybackGate(); }

  private isCurrent(renderer: BlackHoleRenderer, generation: number) {
    return !this.unloaded && this.settings.enabled && this.renderer === renderer && this.generation === generation;
  }

  private async startInternal() {
    const generation = ++this.generation;
    try {
      const canvas = document.createElement('canvas');
      canvas.className = 'blackhole-canvas hidden';
      this.canvas = canvas;
      (document.querySelector('.app-container') ?? document.body).appendChild(canvas);
      const renderer = new BlackHoleRenderer(canvas, this.toShaderParams());
      this.renderer = renderer;
      renderer.onFatalError = (reason) => {
        if (this.isCurrent(renderer, generation)) this.fail(reason);
      };
      const version = this.paramsVersion;
      const initStart = performance.now();
      const initialized = await renderer.init();
      console.info(`BlackHole: renderer initialization ${(performance.now() - initStart).toFixed(1)}ms`);
      if (!this.isCurrent(renderer, generation)) return;
      if (!initialized || renderer.softwareRenderer) {
        this.fail(renderer.softwareRenderer ? this.t('notice.softwareUnsupported') : renderer.lastError || this.t('notice.startFailed'));
        return;
      }
      // Settings may have changed while the driver compiled the initial program.
      let compiledVersion = version;
      while (compiledVersion !== this.paramsVersion) {
        compiledVersion = this.paramsVersion;
        const ok = await renderer.recompile(this.toShaderParams());
        if (!this.isCurrent(renderer, generation)) return;
        if (!ok) { this.fail(renderer.lastError || this.t('notice.startFailed')); return; }
      }
      const capture = new WorkspaceCapture();
      this.capture = capture;
      capture.setSuspended(true);
      capture.setElement(this.findCaptureTarget());
      capture.onAvailabilityChange = (available) => {
        if (!this.isCurrent(renderer, generation) || this.capture !== capture) return;
        this.captureAvailable = available;
        renderer.captureEnabled = this.settings.captureEnabled && available;
      };
      capture.onCapture = (image) => {
        if (!this.isCurrent(renderer, generation) || this.capture !== capture
            || this.playbackSuspended || !this.settings.captureEnabled) return;
        try { renderer.updateTexture(image); }
        catch (error) { this.fail(String(error)); }
      };
      this.ready = true;
      renderer.sizeMode = this.settings.sizeMode;
      renderer.lastActivity = this.lastActivity / 1000;
      this.updateMetric();
      this.captureIntervalId = window.setInterval(() => {
        if (!this.playbackSuspended && !document.hidden) this.capture?.capture(performance.now());
      }, 1000);
      this.metricIntervalId = window.setInterval(() => {
        if (!this.playbackSuspended && !document.hidden) this.updateMetric();
      }, 1000);
      this.applyRuntimeSettings();
    } catch (error) {
      if (this.generation === generation && !this.unloaded) this.fail(String(error));
    }
  }

  private fail(reason: string) {
    console.error('BlackHole:', reason);
    this.runtimeBlocked = true;
    this.stop();
    new Notice(reason || this.t('notice.startFailed'));
  }

  stop() {
    ++this.generation;
    window.clearInterval(this.captureIntervalId);
    window.clearInterval(this.metricIntervalId);
    window.clearTimeout(this.idleResumeTimeoutId);
    window.clearTimeout(this.recompileTimeoutId);
    window.clearTimeout(this.scrollTimeoutId);
    this.captureIntervalId = this.metricIntervalId = this.idleResumeTimeoutId = 0;
    this.recompileTimeoutId = this.scrollTimeoutId = 0;
    const renderer = this.renderer;
    const capture = this.capture;
    this.renderer = null;
    this.capture = null;
    this.ready = false;
    this.compiling = false;
    this.captureAvailable = false;
    this.playbackSuspended = true;
    this.metrics.clear();
    try { capture?.destroy(); }
    finally {
      try { renderer?.destroy(); }
      finally { this.canvas?.remove(); this.canvas = null; }
    }
  }

  onModeChange() {
    if (!this.renderer) return;
    this.renderer.sizeMode = this.settings.sizeMode;
    this.updateMetric();
  }

  onParamsChange() {
    this.settings = normalizeSettings(this.settings);
    ++this.paramsVersion;
    window.clearTimeout(this.recompileTimeoutId);
    if (!this.renderer || !this.ready || this.unloaded) return;
    const generation = this.generation;
    this.recompileTimeoutId = window.setTimeout(() => {
      this.recompileTimeoutId = 0;
      if (generation === this.generation) void this.recompile();
    }, 200);
  }

  private async recompile() {
    const renderer = this.renderer;
    if (!renderer || !this.ready || this.compiling) return;
    const generation = this.generation;
    this.compiling = true;
    this.syncPlaybackGate();
    try {
      let version: number;
      do {
        version = this.paramsVersion;
        const ok = await renderer.recompile(this.toShaderParams());
        if (!this.isCurrent(renderer, generation)) return;
        if (!ok) { this.fail(renderer.lastError || this.t('notice.startFailed')); return; }
      } while (version !== this.paramsVersion);
    } catch (error) {
      if (this.isCurrent(renderer, generation)) this.fail(String(error));
    } finally {
      if (this.isCurrent(renderer, generation)) {
        this.compiling = false;
        this.syncPlaybackGate();
      }
    }
  }

  applyRuntimeSettings() {
    if (this.renderer && this.ready) {
      this.renderer.captureEnabled = this.settings.captureEnabled && this.captureAvailable;
      this.renderer.setRenderScale(runtimeRenderScale(this.settings));
    }
    this.capture?.setOptions({ enabled: this.settings.captureEnabled, intervalMs: Math.max(this.settings.captureIntervalMs, 2500) });
    this.syncPlaybackGate();
  }

  private activityHandler = () => {
    if (this.unloaded) return;
    this.lastActivity = performance.now();
    if (this.renderer) this.renderer.lastActivity = this.lastActivity / 1000;
    this.syncPlaybackGate();
  };

  private visibilityHandler = () => {
    if (!document.hidden) this.lastActivity = performance.now();
    if (this.renderer) this.renderer.lastActivity = this.lastActivity / 1000;
    this.syncPlaybackGate();
  };

  /** The only path allowed to start rendering or resume capture. */
  private syncPlaybackGate() {
    window.clearTimeout(this.idleResumeTimeoutId);
    this.idleResumeTimeoutId = 0;
    const eligible = !this.unloaded && this.layoutReady && this.settings.enabled && !this.runtimeBlocked && !document.hidden;
    const remaining = this.settings.idlePlaybackEnabled
      ? this.settings.idlePlaybackDelaySec * 1000 - (performance.now() - this.lastActivity) : 0;
    if (eligible && remaining > 0) {
      const generation = this.generation;
      this.idleResumeTimeoutId = window.setTimeout(() => {
        this.idleResumeTimeoutId = 0;
        if (generation === this.generation) this.syncPlaybackGate();
      }, remaining);
    }
    const allowed = eligible && remaining <= 0;
    if (allowed && !this.renderer) { void this.startInternal(); return; }
    const suspended = !allowed || !this.ready || this.compiling;
    this.canvas?.classList.toggle('hidden', suspended);
    this.capture?.setSuspended(suspended);
    if (!this.renderer || !this.ready) return;
    if (suspended) this.renderer.stop();
    else if (this.playbackSuspended) {
      this.updateMetric();
      this.capture?.requestSoon();
      this.renderer.start();
    }
    this.playbackSuspended = suspended;
  }

  private refreshTarget = () => {
    if (this.unloaded) return;
    this.metrics.invalidate('word-count', 'tab-count');
    this.capture?.setElement(this.findCaptureTarget());
    this.capture?.requestSoon();
  };

  private scrollHandler = () => {
    window.clearTimeout(this.scrollTimeoutId);
    if (!this.capture || this.playbackSuspended) return;
    const generation = this.generation;
    this.scrollTimeoutId = window.setTimeout(() => {
      this.scrollTimeoutId = 0;
      if (generation === this.generation && !this.playbackSuspended) this.capture?.requestSoon();
    }, 250);
  };

  private updateMetric() {
    if (!this.renderer) return;
    try { this.renderer.tokenLevel = this.metrics.level(this.settings, performance.now()); }
    catch (error) {
      this.renderer.tokenLevel = -1;
      console.error('BlackHole: token metric failed.', error);
    }
  }

  async saveSettings() { await this.saveData(this.settings); }
  private async loadSettings() { this.settings = normalizeSettings(await this.loadData()); }
  t(key: TranslationKey): string { return translate(this.settings.language, key); }

  toShaderParams(): ShaderParams {
    const minArea = Math.min(this.settings.tokenAreaMin, MAX_TOKEN_AREA_MIN);
    return {
      holeRadius: Math.min(this.settings.holeRadius, MAX_HOLE_RADIUS),
      lensDepth: this.settings.lensDepth,
      starGain: this.settings.starGain,
      diskInner: this.settings.diskInner,
      diskOuter: Math.min(this.settings.diskOuter, MAX_DISK_OUTER),
      diskIncl: this.settings.diskIncl,
      diskRoll: this.settings.diskRoll,
      diskGain: this.settings.diskGain,
      diskOpacity: this.settings.diskOpacity,
      diskTemp: this.settings.diskTemp,
      dopplerMix: this.settings.dopplerMix,
      diskBeam: this.settings.diskBeam,
      diskSpeed: this.settings.diskSpeed,
      diskWind: this.settings.diskWind,
      diskContrast: this.settings.diskContrast,
      exposure: this.settings.exposure,
      driftSpeed: this.settings.driftSpeed,
      workArea: this.settings.workArea,
      dilationMin: this.settings.dilationMin,
      tokenAreaMin: minArea,
      tokenAreaMax: Math.max(minArea, Math.min(this.settings.tokenAreaMax, MAX_TOKEN_AREA_MAX)),
      tokenHomeX: this.settings.tokenHomeX,
      tokenHomeY: this.settings.tokenHomeY,
      tokenEase: this.settings.tokenEase,
      tokenReach: this.settings.tokenReach,
      tokenCalm: this.settings.tokenCalm,
      tokenRush: this.settings.tokenRush,
      nSteps: this.settings.nSteps,
      workPeriodMin: this.settings.workPeriodMin,
      breakMin: this.settings.breakMin,
      idleFadeSec: this.settings.idleFadeSec,
      tokenGlideMin: 0.3,
      tokenGlideMax: 1.5,
      tokenGlideRate: 10.0,
    };
  }


  private findCaptureTarget(): HTMLElement | null {
    return document.querySelector<HTMLElement>('.app-container')
      ?? document.querySelector<HTMLElement>('.workspace') ?? document.body;
  }
}
