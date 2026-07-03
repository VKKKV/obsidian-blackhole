import { Plugin, Notice, MarkdownView, EventRef, debounce } from 'obsidian';
import {
  BlackHoleSettings, BlackHoleSettingsTab, DEFAULT_SETTINGS,
} from './settings';
import { BlackHoleRenderer } from './renderer';
import { WorkspaceCapture } from './capture';
import { PluginLanguage, t as translate, TranslationKey } from './i18n';
import { ShaderParams } from './shader';

const MAX_RENDER_SCALE = 0.35;
const MAX_RENDER_SCALE_SOFTWARE = 0.22;
const MAX_SHADER_STEPS = 10;
const MAX_HOLE_RADIUS = 0.014;
const MAX_TOKEN_AREA_MIN = 0.003;
const MAX_TOKEN_AREA_MAX = 0.02;
const MAX_DISK_OUTER = 7.0;

export default class BlackHolePlugin extends Plugin {
  settings: BlackHoleSettings = { ...DEFAULT_SETTINGS };
  private renderer: BlackHoleRenderer | null = null;
  private capture: WorkspaceCapture | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private enabled = true;

  private lastActivity = 0;
  private captureIntervalId: number = 0;
  private metricIntervalId: number = 0;
  private leafChangeRef: EventRef | null = null;
  private layoutChangeRef: EventRef | null = null;
  private idleResumeTimeoutId: number = 0;
  private playbackSuspended = false;

  async onload() {
    await this.loadSettings();
    this.addSettingTab(new BlackHoleSettingsTab(this.app, this));

    this.addRibbonIcon('circle-dot', this.t('ribbon.toggle'), () => {
      this.enabled = !this.enabled;
      if (this.enabled) this.start();
      else this.stop();
      new Notice(this.enabled ? this.t('notice.enabled') : this.t('notice.disabled'));
    });

    // Defer the first start until the workspace DOM is laid out — querying or
    // capturing before layout-ready can grab a zero-size element or throw.
    this.app.workspace.onLayoutReady(() => {
      if (this.enabled) this.start();
    });
  }

  onunload() {
    this.stop();
  }

  start() {
    if (this.renderer) return;
    try {
      this.startInternal();
    } catch (e) {
      console.error('BlackHole: failed to start.', e);
      new Notice(this.t('notice.startFailed'));
      this.stop();
      this.enabled = false;
    }
  }

  private startInternal() {
    // create overlay canvas
    const canvas = document.createElement('canvas');
    canvas.className = 'blackhole-canvas';
    this.canvas = canvas;

    // Mount over the whole Obsidian window so the hole can roam everywhere
    // (workspace, sidebars, ribbon). The canvas is transparent except near the
    // hole, and pointer-events:none keeps everything underneath interactive.
    const host = document.querySelector('.app-container') ?? document.body;
    host.appendChild(canvas);

    // init renderer
    this.renderer = new BlackHoleRenderer(canvas, this.toShaderParams());
    if (!this.renderer.init()) {
      console.error('BlackHole: WebGL2 not available');
      new Notice(this.t('notice.requireWebgl2'));
      canvas.remove();
      this.renderer = null;
      this.canvas = null;
      return;
    }

    // init capture
    const capture = new WorkspaceCapture();
    capture.setElement(this.findCaptureTarget());
    capture.onCapture = (canvas) => {
      if (this.capture !== capture || !this.renderer) return;
      this.renderer.updateTexture(canvas);
    };
    this.capture = capture;
    // blank initial texture
    const blank = WorkspaceCapture.blankCanvas(window.innerWidth, window.innerHeight);
    this.renderer.updateTexture(blank);
    this.lastActivity = performance.now();

    // apply perf settings; if no GPU (software renderer), drop quality so the
    // heavy geodesic shader doesn't freeze the UI.
    if (this.renderer.softwareRenderer && this.settings.renderScale >= 0.5) {
      new Notice(this.t('notice.softwareReduced'));
    }
    this.applyRuntimeSettings();

    // kick off a capture immediately so we don't render against blank for ~350ms
    this.capture.capture(performance.now());

    // wire state
    this.renderer.sizeMode = this.settings.sizeMode;
    this.renderer.lastActivity = this.lastActivity / 1000;
    this.renderer.tokenLevel = this.computeTokenLevel();

    // start rendering
    this.renderer.start();
    this.syncPlaybackGate();

    // activity tracking
    document.addEventListener('keydown', this.activityHandler);
    document.addEventListener('mousedown', this.activityHandler);
    document.addEventListener('touchstart', this.activityHandler);
    document.addEventListener('wheel', this.activityHandler, { passive: true });

    // Capture poll. dom-to-image is heavy and main-thread, so we DON'T capture
    // every frame — the GPU animates the lens against the last snapshot. This
    // poll just checks whether a fresh capture is due; completed captures push
    // their canvas back through WorkspaceCapture.onCapture.
    this.captureIntervalId = window.setInterval(() => {
      try {
        if (!this.renderer || !this.capture || this.playbackSuspended) return;
        this.capture.capture(performance.now());
      } catch (e) {
        console.error('BlackHole: capture tick failed.', e);
      }
    }, 1000);

    // metric polling for token mode
    this.metricIntervalId = window.setInterval(() => {
      try {
        if (!this.renderer || this.settings.sizeMode !== 1 || this.playbackSuspended) return;
        this.renderer.tokenLevel = this.computeTokenLevel();
      } catch (e) {
        console.error('BlackHole: metric tick failed.', e);
      }
    }, 1000);

    // Re-capture when content actually changes — switching notes, layout
    // changes, or after scrolling settles — instead of continuously. Keeps the
    // snapshot fresh without the per-frame dom-to-image cost.
    const refresh = () => {
      try {
        this.capture?.setElement(this.findCaptureTarget());
        this.capture?.requestSoon();
      } catch (e) {
        console.error('BlackHole: capture-target refresh failed.', e);
      }
    };
    this.leafChangeRef = this.app.workspace.on('active-leaf-change', refresh);
    this.layoutChangeRef = this.app.workspace.on('layout-change', refresh);
    document.addEventListener('scroll', this.scrollHandler, { capture: true, passive: true });
  }

  stop() {
    if (this.renderer) {
      this.renderer.destroy();
      this.renderer = null;
    }
    this.capture = null;
    if (this.canvas) {
      this.canvas.remove();
      this.canvas = null;
    }
    window.clearInterval(this.captureIntervalId);
    window.clearInterval(this.metricIntervalId);
    window.clearTimeout(this.idleResumeTimeoutId);
    this.captureIntervalId = 0;
    this.metricIntervalId = 0;
    this.idleResumeTimeoutId = 0;
    this.playbackSuspended = false;

    document.removeEventListener('keydown', this.activityHandler);
    document.removeEventListener('mousedown', this.activityHandler);
    document.removeEventListener('touchstart', this.activityHandler);
    document.removeEventListener('wheel', this.activityHandler);
    document.removeEventListener('scroll', this.scrollHandler, { capture: true } as any);

    if (this.leafChangeRef) { this.app.workspace.offref(this.leafChangeRef); this.leafChangeRef = null; }
    if (this.layoutChangeRef) { this.app.workspace.offref(this.layoutChangeRef); this.layoutChangeRef = null; }
  }

  onModeChange() {
    if (!this.renderer) return;
    // sizeMode is a uniform, not a baked const — no recompile needed.
    this.renderer.sizeMode = this.settings.sizeMode;
    this.renderer.tokenLevel = this.computeTokenLevel();
    this.capture?.reset();
  }

  /**
   * Tunable params are baked into the shader as compile-time consts, so changing
   * one requires a recompile. Debounced so dragging a slider doesn't recompile
   * the shader on every tick — only ~once the user pauses.
   */
  onParamsChange() {
    this.recompileSoon();
  }

  /** Apply non-shader runtime settings (render scale, capture cadence). */
  applyRuntimeSettings() {
    if (this.renderer) {
      this.renderer.captureEnabled = this.settings.captureEnabled;
      const effectiveScale = this.renderer.softwareRenderer
        ? Math.min(this.settings.renderScale, MAX_RENDER_SCALE_SOFTWARE)
        : Math.min(this.settings.renderScale, MAX_RENDER_SCALE);
      this.renderer.setRenderScale(effectiveScale);
    }
    this.capture?.setOptions({
      enabled: this.settings.captureEnabled,
      intervalMs: Math.max(this.settings.captureIntervalMs, 2500),
    });
    this.syncPlaybackGate();
  }

  private recompileSoon = debounce(() => {
    if (this.renderer) this.renderer.recompile(this.toShaderParams());
  }, 200, true);

  // Re-capture once scrolling settles (trailing debounce) rather than on every
  // scroll event — keeps the snapshot current without thrashing dom-to-image.
  private requestCaptureSoon = debounce(() => {
    this.capture?.requestSoon();
  }, 250, true);
  private scrollHandler = () => { this.requestCaptureSoon(); };

  async saveSettings() { await this.saveData(this.settings); }

  private async loadSettings() {
    const data = await this.loadData();
    if (data) this.settings = { ...DEFAULT_SETTINGS, ...data };
    const changed = this.normalizeSettings();
    if (changed) await this.saveSettings();
  }

  t(key: TranslationKey): string {
    return translate(this.settings.language as PluginLanguage, key);
  }

  toShaderParams(): ShaderParams {
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
      tokenAreaMin: Math.min(this.settings.tokenAreaMin, MAX_TOKEN_AREA_MIN),
      tokenAreaMax: Math.min(this.settings.tokenAreaMax, MAX_TOKEN_AREA_MAX),
      tokenHomeX: this.settings.tokenHomeX,
      tokenHomeY: this.settings.tokenHomeY,
      tokenEase: this.settings.tokenEase,
      tokenReach: this.settings.tokenReach,
      tokenCalm: this.settings.tokenCalm,
      tokenRush: this.settings.tokenRush,
      nSteps: Math.min(this.settings.nSteps, MAX_SHADER_STEPS),
      workPeriodMin: this.settings.workPeriodMin,
      breakMin: this.settings.breakMin,
      idleFadeSec: this.settings.idleFadeSec,
      tokenGlideMin: 0.3,
      tokenGlideMax: 1.5,
      tokenGlideRate: 10.0,
    };
  }

  private normalizeSettings(): boolean {
    const before = JSON.stringify(this.settings);
    this.settings.holeRadius = Math.min(this.settings.holeRadius, MAX_HOLE_RADIUS);
    this.settings.tokenAreaMin = Math.min(this.settings.tokenAreaMin, MAX_TOKEN_AREA_MIN);
    this.settings.tokenAreaMax = Math.min(this.settings.tokenAreaMax, MAX_TOKEN_AREA_MAX);
    this.settings.diskOuter = Math.min(this.settings.diskOuter, MAX_DISK_OUTER);
    this.settings.nSteps = Math.min(this.settings.nSteps, MAX_SHADER_STEPS);
    this.settings.renderScale = Math.min(this.settings.renderScale, MAX_RENDER_SCALE);
    this.settings.captureIntervalMs = Math.max(this.settings.captureIntervalMs, 2500);
    this.settings.idlePlaybackDelaySec = Math.max(this.settings.idlePlaybackDelaySec, 5);
    return JSON.stringify(this.settings) !== before;
  }

  private activityHandler = () => {
    this.lastActivity = performance.now();
    if (this.renderer) this.renderer.lastActivity = this.lastActivity / 1000;
    if (this.settings.idlePlaybackEnabled) {
      this.setPlaybackSuspended(true);
      this.scheduleIdleResume();
    }
  };

  private scheduleIdleResume() {
    window.clearTimeout(this.idleResumeTimeoutId);
    if (!this.settings.idlePlaybackEnabled) return;
    const delayMs = this.settings.idlePlaybackDelaySec * 1000;
    this.idleResumeTimeoutId = window.setTimeout(() => {
      const idleFor = performance.now() - this.lastActivity;
      if (idleFor >= delayMs) this.setPlaybackSuspended(false);
    }, delayMs);
  }

  private syncPlaybackGate() {
    if (!this.renderer) return;
    if (!this.settings.idlePlaybackEnabled) {
      window.clearTimeout(this.idleResumeTimeoutId);
      this.setPlaybackSuspended(false);
      return;
    }

    const delayMs = this.settings.idlePlaybackDelaySec * 1000;
    const idleFor = performance.now() - this.lastActivity;
    if (idleFor >= delayMs) this.setPlaybackSuspended(false);
    else {
      this.setPlaybackSuspended(true);
      this.scheduleIdleResume();
    }
  }

  private setPlaybackSuspended(suspended: boolean) {
    if (this.playbackSuspended === suspended) return;
    this.playbackSuspended = suspended;
    this.canvas?.classList.toggle('hidden', suspended);
    if (!this.renderer) return;
    if (suspended) {
      this.renderer.stop();
      return;
    }
    this.capture?.requestSoon();
    this.renderer.start();
  }

  private computeTokenLevel(): number {
    if (this.settings.sizeMode !== 1) return -1;
    try {
      switch (this.settings.tokenMetric) {
        case 'word-count': {
          const mdView = this.app.workspace.getActiveViewOfType(MarkdownView);
          if (!mdView) return -1;
          const text: string = mdView.editor?.getValue() ?? '';
          const words = text.match(/\S+/g)?.length ?? 0;
          return Math.min(words / this.settings.maxWordCount, 1.0);
        }
        case 'global-word-count': {
          const files = this.app.vault.getMarkdownFiles();
          return Math.min(files.length * 500 / this.settings.maxWordCount, 1.0);
        }
        case 'file-count': {
          const files = this.app.vault.getMarkdownFiles();
          return Math.min(files.length / 1000, 1.0);
        }
        case 'tab-count': {
          const leaves = this.app.workspace.getLeavesOfType('markdown');
          return Math.min(leaves.length / 20, 1.0);
        }
        default: return -1;
      }
    } catch (e) {
      console.error('BlackHole: token-metric computation failed.', e);
      return -1;
    }
  }

  private findCaptureTarget(): HTMLElement | null {
    // Capture the whole window so the lensed snapshot lines up with whatever
    // the (window-wide) canvas is drawn over.
    return (document.querySelector('.app-container')
      ?? document.querySelector('.workspace')
      ?? document.body) as HTMLElement | null;
  }
}
