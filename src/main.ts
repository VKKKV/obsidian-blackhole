import { Plugin, Notice, MarkdownView } from 'obsidian';
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
  private domObserver: MutationObserver | null = null;

  async onload() {
    await this.loadSettings();
    this.addSettingTab(new BlackHoleSettingsTab(this.app, this));

    this.addRibbonIcon('goal', 'Toggle Black Hole', () => {
      this.enabled = !this.enabled;
      if (this.enabled) this.start();
      else this.stop();
      new Notice(`Black hole ${this.enabled ? 'ON' : 'OFF'}`);
    });

    if (this.enabled) this.start();
  }

  onunload() {
    this.stop();
  }

  start() {
    if (this.renderer) return;

    // create overlay canvas
    const canvas = document.createElement('canvas');
    canvas.className = 'blackhole-canvas';
    this.canvas = canvas;

    const workspace = document.querySelector('.workspace');
    if (workspace) workspace.appendChild(canvas);
    else document.body.appendChild(canvas);

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

    // capture loop — trigger async capture every ~350ms, push to texture when ready
    this.captureIntervalId = window.setInterval(() => {
      if (!this.renderer || !this.capture) return;
      // initiate capture (async — will store result in latestCanvas)
      this.capture.capture(performance.now());
      // if a result accumulated since last check, upload it
      const cap = this.capture.latestCanvas;
      if (cap) {
        this.renderer.updateTexture(cap);
      }
    }, 300);

    // metric polling for token mode
    this.metricIntervalId = window.setInterval(() => {
      if (!this.renderer || this.settings.sizeMode !== 1) return;
      this.renderer.tokenLevel = this.computeTokenLevel();
    }, 500);

    // observe DOM for leaf changes
    this.domObserver = new MutationObserver(() => {
      if (this.capture) this.capture.setElement(this.findCaptureTarget());
    });
    this.domObserver.observe(document.body, { childList: true, subtree: true });
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

    this.domObserver?.disconnect();
    this.domObserver = null;
  }

  onModeChange() {
    if (!this.renderer) return;
    this.renderer.sizeMode = this.settings.sizeMode;
    this.renderer.recompile(this.toShaderParams());
    this.capture?.reset();
  }

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
    switch (this.settings.tokenMetric) {
      case 'word-count': {
        const mdView = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (!mdView) return -1;
        const text: string = mdView.editor?.getValue() ?? '';
        const words = text.split(/\s+/).filter((w: string) => w.length > 0).length;
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
  }

  private findCaptureTarget(): HTMLElement | null {
    const activeLeaf = this.app.workspace.activeLeaf;
    if (activeLeaf) {
      const container = (activeLeaf as any).containerEl;
      if (container) {
        const vc = container.querySelector('.view-content') as HTMLElement;
        return vc ?? container;
      }
    }
    return document.querySelector('.view-content') as HTMLElement ?? null;
  }
}
