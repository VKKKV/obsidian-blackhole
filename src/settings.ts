import { App, PluginSettingTab, Setting } from 'obsidian';
import BlackHolePlugin from './main';

export const MODE_LABELS: Record<number, string> = {
  0: 'Pomodoro',
  1: 'Token / Word Count',
  2: 'Demo',
};

export interface BlackHoleSettings {
  sizeMode: number;
  tokenMetric: 'word-count' | 'global-word-count' | 'file-count' | 'tab-count';
  maxWordCount: number;
  holeRadius: number;
  lensDepth: number;
  starGain: number;
  diskInner: number;
  diskOuter: number;
  diskIncl: number;
  diskRoll: number;
  diskGain: number;
  diskOpacity: number;
  diskTemp: number;
  dopplerMix: number;
  diskBeam: number;
  diskSpeed: number;
  diskWind: number;
  diskContrast: number;
  exposure: number;
  driftSpeed: number;
  workArea: number;
  dilationMin: number;
  tokenAreaMin: number;
  tokenAreaMax: number;
  tokenHomeX: number;
  tokenHomeY: number;
  tokenEase: number;
  tokenReach: number;
  tokenCalm: number;
  tokenRush: number;
  nSteps: number;
  workPeriodMin: number;
  breakMin: number;
  idleFadeSec: number;
}

export const DEFAULT_SETTINGS: BlackHoleSettings = {
  sizeMode: 1,
  tokenMetric: 'word-count',
  maxWordCount: 5000,
  holeRadius: 0.0200,
  lensDepth: 13.0000,
  starGain: 0.0,
  diskInner: 1.8000,
  diskOuter: 8.0000,
  diskIncl: 1.5000,
  diskRoll: 0.3500,
  diskGain: 2.2000,
  diskOpacity: 0.9000,
  diskTemp: 5500.0,
  dopplerMix: 0.6000,
  diskBeam: 2.5000,
  diskSpeed: 5.0000,
  diskWind: 7.0000,
  diskContrast: 1.6000,
  exposure: 1.4000,
  driftSpeed: 1.0000,
  workArea: 0.3300,
  dilationMin: 0.2000,
  tokenAreaMin: 0.0100,
  tokenAreaMax: 0.5000,
  tokenHomeX: 0.9600,
  tokenHomeY: 0.0400,
  tokenEase: 1.0000,
  tokenReach: 1.0000,
  tokenCalm: 0.0400,
  tokenRush: 1.1000,
  nSteps: 48,
  workPeriodMin: 55,
  breakMin: 5,
  idleFadeSec: 90,
};

export class BlackHoleSettingsTab extends PluginSettingTab {
  plugin: BlackHolePlugin;

  constructor(app: App, plugin: BlackHolePlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl('h2', { text: 'Black Hole Settings' });

    // ---- mode ----
    new Setting(containerEl)
      .setName('Size Mode')
      .setDesc('What drives the hole\'s growth')
      .addDropdown((dd) => {
        dd.addOption('0', 'Pomodoro — wall-clock work/break cycle');
        dd.addOption('1', 'Token — word count / custom metric');
        dd.addOption('2', 'Demo — self-running showcase loop');
        dd.setValue(String(this.plugin.settings.sizeMode));
        dd.onChange(async (v) => {
          this.plugin.settings.sizeMode = parseInt(v);
          await this.plugin.saveSettings();
          this.plugin.onModeChange();
        });
      });

    // ---- token metric ----
    new Setting(containerEl)
      .setName('Token Metric')
      .setDesc('What drives the hole in token mode')
      .addDropdown((dd) => {
        dd.addOption('word-count', 'Current note word count');
        dd.addOption('global-word-count', 'Vault-wide word count');
        dd.addOption('file-count', 'Vault file count');
        dd.addOption('tab-count', 'Open tab count');
        dd.setValue(this.plugin.settings.tokenMetric);
        dd.onChange(async (v) => {
          this.plugin.settings.tokenMetric = v as any;
          await this.plugin.saveSettings();
        });
      });

    new Setting(containerEl)
      .setName('Max Word Count')
      .setDesc('Word count at which the hole reaches 100% size (token mode)')
      .addSlider((sl) => {
        sl.setLimits(100, 50000, 100);
        sl.setValue(this.plugin.settings.maxWordCount);
        sl.onChange(async (v) => {
          this.plugin.settings.maxWordCount = v;
          await this.plugin.saveSettings();
        });
      });

    // ---- pomodoro ----
    containerEl.createEl('h3', { text: 'Pomodoro' });
    new Setting(containerEl)
      .setName('Work Period (min)')
      .addSlider((sl) => {
        sl.setLimits(10, 120, 1); sl.setValue(this.plugin.settings.workPeriodMin);
        sl.onChange(async (v) => { this.plugin.settings.workPeriodMin = v; await this.plugin.saveSettings(); });
      });
    new Setting(containerEl)
      .setName('Break (min)')
      .addSlider((sl) => {
        sl.setLimits(1, 30, 1); sl.setValue(this.plugin.settings.breakMin);
        sl.onChange(async (v) => { this.plugin.settings.breakMin = v; await this.plugin.saveSettings(); });
      });
    new Setting(containerEl)
      .setName('Idle Fade (sec)')
      .setDesc('Typing pause after which the hole starts to shrink')
      .addSlider((sl) => {
        sl.setLimits(10, 600, 5); sl.setValue(this.plugin.settings.idleFadeSec);
        sl.onChange(async (v) => { this.plugin.settings.idleFadeSec = v; await this.plugin.saveSettings(); });
      });

    // ---- hole & lensing ----
    containerEl.createEl('h3', { text: 'Hole & Lensing' });
    this.slider('Hole Radius', this.plugin.settings.holeRadius, 0.001, 0.2, 0.001, (v) => { this.plugin.settings.holeRadius = v; });
    this.slider('Lens Depth', this.plugin.settings.lensDepth, 1, 50, 0.5, (v) => { this.plugin.settings.lensDepth = v; });
    this.slider('Star Gain', this.plugin.settings.starGain, 0, 5, 0.1, (v) => { this.plugin.settings.starGain = v; });

    // ---- accretion disk ----
    containerEl.createEl('h3', { text: 'Accretion Disk' });
    this.slider('Disk Inner', this.plugin.settings.diskInner, 1.6, 10, 0.1, (v) => { this.plugin.settings.diskInner = v; });
    this.slider('Disk Outer', this.plugin.settings.diskOuter, 3, 30, 0.5, (v) => { this.plugin.settings.diskOuter = v; });
    this.slider('Inclination', this.plugin.settings.diskIncl, 0, 3.14, 0.01, (v) => { this.plugin.settings.diskIncl = v; });
    this.slider('Roll', this.plugin.settings.diskRoll, -3.14, 3.14, 0.01, (v) => { this.plugin.settings.diskRoll = v; });
    this.slider('Gain', this.plugin.settings.diskGain, 0, 10, 0.1, (v) => { this.plugin.settings.diskGain = v; });
    this.slider('Opacity', this.plugin.settings.diskOpacity, 0, 1, 0.01, (v) => { this.plugin.settings.diskOpacity = v; });
    this.slider('Temperature (K)', this.plugin.settings.diskTemp, 1500, 40000, 100, (v) => { this.plugin.settings.diskTemp = v; });
    this.slider('Doppler Mix', this.plugin.settings.dopplerMix, 0, 1, 0.01, (v) => { this.plugin.settings.dopplerMix = v; });
    this.slider('Beaming', this.plugin.settings.diskBeam, 0, 10, 0.1, (v) => { this.plugin.settings.diskBeam = v; });

    // ---- performance ----
    containerEl.createEl('h3', { text: 'Performance' });
    new Setting(containerEl)
      .setName('Integration Steps')
      .setDesc('Geodesic steps per pixel — higher = more accurate but slower')
      .addSlider((sl) => {
        sl.setLimits(8, 128, 2); sl.setValue(this.plugin.settings.nSteps);
        sl.onChange(async (v) => { this.plugin.settings.nSteps = v; await this.plugin.saveSettings(); });
      });
    this.slider('Token Area Max (×1e-3)', this.plugin.settings.tokenAreaMax * 1000, 0.1, 20, 0.1, (v) => { this.plugin.settings.tokenAreaMax = v / 1000; });
  }

  private slider(
    name: string, value: number, min: number, max: number, step: number,
    onChange: (v: number) => void,
  ) {
    new Setting(this.containerEl)
      .setName(name)
      .addSlider((sl) => {
        sl.setLimits(min, max, step);
        sl.setValue(value);
        sl.onChange(async (v) => {
          onChange(v);
          await this.plugin.saveSettings();
          this.plugin.onParamsChange(); // debounced shader recompile with new consts
        });
      })
      .addText((txt) => {
        txt.setValue(String(value));
        txt.onChange(async (s) => {
          const v = parseFloat(s);
          if (!isNaN(v) && v >= min && v <= max) {
            onChange(v);
            await this.plugin.saveSettings();
            this.plugin.onParamsChange();
          }
        });
      });
  }
}
