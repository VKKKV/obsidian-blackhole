import { Plugin, Notice, MarkdownView, EventRef, debounce } from 'obsidian';
import {
  BlackHoleSettings, BlackHoleSettingsTab, DEFAULT_SETTINGS,
} from './settings';
import { BlackHoleRenderer } from './renderer';
import { WorkspaceCapture } from './capture';
import { ShaderParams } from './shader';

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
  private lastUploadTime = 0;
  private lastWordCountLen = -1;
  private lastWordCountResult = 0;

  async onload() {
    await this.loadSettings();
    this.addSettingTab(new BlackHoleSettingsTab(this.app, this));

    this.addRibbonIcon('circle-dot', 'Toggle Black Hole', () => {
      this.enabled = !this.enabled;
      if (this.enabled) this.start();
      else this.stop();
      new Notice(`Black hole ${this.enabled ? 'ON' : 'OFF'}`);
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
      new Notice('Black Hole failed to start — see console for details.');
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
      new Notice('Black Hole plugin requires WebGL2');
      canvas.remove();
      this.renderer = null;
      this.canvas = null;
      return;
    }

    // init capture
    this.capture = new WorkspaceCapture();
    this.capture.setElement(this.findCaptureTarget());
    // blank initial texture
    const blank = WorkspaceCapture.blankCanvas(window.innerWidth, window.innerHeight);
    this.renderer.updateTexture(blank);

    // apply perf settings; if no GPU (software renderer), drop quality so the
    // heavy geodesic shader doesn't freeze the UI.
    if (this.renderer.softwareRenderer && this.settings.renderScale > 0.6) {
      this.renderer.setRenderScale(0.5);
      new Notice('Black Hole: no GPU acceleration detected — quality reduced. Tune it under Settings → Performance.');
    }
    this.applyRuntimeSettings();

    // kick off a capture immediately so we don't render against blank for ~350ms
    this.capture.capture(performance.now());

    // wire state
    this.renderer.sizeMode = this.settings.sizeMode;
    this.renderer.lastActivity = performance.now() / 1000;
    this.lastActivity = performance.now();

    // start rendering
    this.renderer.start();

    // activity tracking
    document.addEventListener('keydown', this.activityHandler);
    document.addEventListener('mousedown', this.activityHandler);
    document.addEventListener('touchstart', this.activityHandler);
    document.addEventListener('wheel', this.activityHandler, { passive: true });

    // Capture poll. dom-to-image is heavy and main-thread, so we DON'T capture
    // every frame — the GPU animates the lens against the last snapshot. This
    // poll just checks whether a fresh capture is due (capture() self-throttles
    // to the configured interval) and uploads any new result.
    this.captureIntervalId = window.setInterval(() => {
      try {
        if (!this.renderer || !this.capture) return;
        this.capture.capture(performance.now());
        // upload only when there's a genuinely new capture
        const cap = this.capture.latestCanvas;
        if (cap && this.capture.latestCaptureTime !== this.lastUploadTime) {
          this.lastUploadTime = this.capture.latestCaptureTime;
          this.renderer.updateTexture(cap);
        }
      } catch (e) {
        console.error('BlackHole: capture tick failed.', e);
      }
    }, 1000);

    // metric polling for token mode
    this.metricIntervalId = window.setInterval(() => {
      try {
        if (!this.renderer || this.settings.sizeMode !== 1) return;
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
    this.captureIntervalId = 0;
    this.metricIntervalId = 0;

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
    this.renderer?.setRenderScale(this.settings.renderScale);
    this.capture?.setOptions({
      enabled: this.settings.captureEnabled,
      intervalMs: this.settings.captureIntervalMs,
    });
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
  }

  toShaderParams(): ShaderParams {
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
      tokenAreaMin: this.settings.tokenAreaMin,
      tokenAreaMax: this.settings.tokenAreaMax,
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

  private activityHandler = () => {
    this.lastActivity = performance.now();
    if (this.renderer) this.renderer.lastActivity = this.lastActivity / 1000;
  };

  private computeTokenLevel(): number {
    if (this.settings.sizeMode !== 1) return -1;
    try {
      switch (this.settings.tokenMetric) {
        case 'word-count': {
          const mdView = this.app.workspace.getActiveViewOfType(MarkdownView);
          if (!mdView) return -1;
          const text: string = mdView.editor?.getValue() ?? '';
          // skip recomputation if content length hasn't changed (cheap O(1) check)
          if (text.length === this.lastWordCountLen) return this.lastWordCountResult;
          this.lastWordCountLen = text.length;
          const words = text.split(/\s+/).filter((w: string) => w.length > 0).length;
          this.lastWordCountResult = Math.min(words / this.settings.maxWordCount, 1.0);
          return this.lastWordCountResult;
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
