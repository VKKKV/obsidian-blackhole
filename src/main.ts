import { Plugin, Notice, MarkdownView } from 'obsidian';
import { BlackHoleSettingsTab } from './settings';
import { BlackHoleSettings, DEFAULT_SETTINGS, normalizeSettings, resetEffectSettings, runtimeRenderScale } from './config';
import { BlackHoleRenderer } from './renderer';
import { BackdropLens } from './backdrop';
import { t as translate, TranslationKey } from './i18n';
import { ShaderParams } from './shader';
import { MetricCache } from './metrics';

export default class BlackHolePlugin extends Plugin {
  settings: BlackHoleSettings = { ...DEFAULT_SETTINGS };
  private renderer: BlackHoleRenderer | null = null;
  private lens: BackdropLens | null = null;
  private lensUnsupportedNotified = false;
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
  private metricIntervalId = 0;
  private idleResumeTimeoutId = 0;
  private recompileTimeoutId = 0;
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
    this.registerEvent(this.app.workspace.on('editor-change', () => {
      this.metrics.invalidate('word-count');
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
      // Keep both viewport-fixed overlays outside theme-created workspace backdrop roots.
      document.body.appendChild(canvas);
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
      const lens = new BackdropLens(canvas.parentElement!);
      this.lens = lens;
      lens.setTarget(this.findLensTarget());
      renderer.onEffectFrame = frame => {
        if (this.isCurrent(renderer, generation) && this.lens === lens) lens.update(frame);
      };
      this.ready = true;
      renderer.sizeMode = this.settings.sizeMode;
      renderer.lastActivity = this.lastActivity / 1000;
      this.updateMetric();
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
    window.clearInterval(this.metricIntervalId);
    window.clearTimeout(this.idleResumeTimeoutId);
    window.clearTimeout(this.recompileTimeoutId);
    this.metricIntervalId = this.idleResumeTimeoutId = 0;
    this.recompileTimeoutId = 0;
    const renderer = this.renderer;
    const lens = this.lens;
    this.renderer = null;
    this.lens = null;
    this.ready = false;
    this.compiling = false;
    this.playbackSuspended = true;
    this.metrics.clear();
    try { lens?.destroy(); }
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
      // The desktop text lens is a live backdrop, never a sampled DOM texture.
      this.renderer.captureEnabled = false;
      this.renderer.setRenderScale(runtimeRenderScale(this.settings));
    }
    this.lens?.setEnabled(this.settings.captureEnabled);
    this.lens?.setTarget(this.findLensTarget());
    if (this.settings.captureEnabled && this.lens && !this.lens.supported && !this.lensUnsupportedNotified) {
      this.lensUnsupportedNotified = true;
      new Notice(this.t('notice.lensUnsupported'));
    }
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

  /** The only path allowed to start rendering or resume the lens. */
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
    this.lens?.setSuspended(suspended);
    if (!this.renderer || !this.ready) return;
    if (suspended) this.renderer.stop();
    else if (this.playbackSuspended) {
      this.updateMetric();
      this.renderer.start();
    }
    this.playbackSuspended = suspended;
  }

  private refreshTarget = () => {
    if (this.unloaded) return;
    this.metrics.invalidate('word-count', 'tab-count');
    this.lens?.setTarget(this.findLensTarget());
    this.lens?.refresh();
  };

  private updateMetric() {
    if (!this.renderer) return;
    try { this.renderer.tokenLevel = this.metrics.level(this.settings, performance.now()); }
    catch (error) {
      this.renderer.tokenLevel = -1;
      console.error('BlackHole: token metric failed.', error);
    }
  }

  async resetSettings() {
    if (this.unloaded) return;
    this.stop();
    this.settings = resetEffectSettings(this.settings);
    this.runtimeBlocked = false;
    this.lastActivity = performance.now();
    this.syncPlaybackGate();
    await this.saveSettings();
  }

  async saveSettings() { await this.saveData(this.settings); }
  private async loadSettings() { this.settings = normalizeSettings(await this.loadData()); }
  t(key: TranslationKey): string { return translate(this.settings.language, key); }

  toShaderParams(): ShaderParams {
    const minArea = this.settings.tokenAreaMin;
    return {
      holeRadius: this.settings.holeRadius,
      lensDepth: this.settings.lensDepth,
      starGain: this.settings.starGain,
      diskInner: this.settings.diskInner,
      diskOuter: this.settings.diskOuter,
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
      tokenAreaMax: Math.max(minArea, this.settings.tokenAreaMax),
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


  private findLensTarget(): HTMLElement | null {
    // Do not lens settings, canvases, sidebars or a different native window.
    const view = this.app.workspace.getActiveViewOfType(MarkdownView);
    return view?.contentEl ?? null;
  }
}
