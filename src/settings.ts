import { App, PluginSettingTab, Setting, SliderComponent, TextComponent } from 'obsidian';
import { PluginLanguage } from './i18n';
import type BlackHolePlugin from './main';
import type { BlackHoleSettings } from './config';
export { DEFAULT_SETTINGS } from './config';
export type { BlackHoleSettings } from './config';

export const MODE_LABELS: Record<number, string> = {
  0: 'Pomodoro',
  1: 'Token / Word Count',
  2: 'Demo',
};

export class BlackHoleSettingsTab extends PluginSettingTab {
  plugin: BlackHolePlugin;

  constructor(app: App, plugin: BlackHolePlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    const t = this.plugin.t.bind(this.plugin);
    containerEl.empty();
    containerEl.createEl('h2', { text: t('settings.title') });

    new Setting(containerEl)
      .setName(t('settings.reset.name'))
      .setDesc(t('settings.reset.desc'))
      .addButton(button => button.setButtonText(t('settings.reset.button')).onClick(async () => {
        button.setDisabled(true);
        try { await this.plugin.resetSettings(); this.display(); }
        finally { button.setDisabled(false); }
      }));

    containerEl.createEl('h3', { text: t('settings.general') });
    new Setting(containerEl)
      .setName(t('settings.language.name'))
      .setDesc(t('settings.language.desc'))
      .addDropdown((dd) => {
        dd.addOption('auto', t('settings.language.auto'));
        dd.addOption('en', t('settings.language.en'));
        dd.addOption('zh-CN', t('settings.language.zh-CN'));
        dd.setValue(this.plugin.settings.language);
        dd.onChange(async (v) => {
          this.plugin.settings.language = v as PluginLanguage;
          await this.plugin.saveSettings();
          this.display();
        });
      });

    containerEl.createEl('h3', { text: t('settings.playback') });
    new Setting(containerEl)
      .setName(t('settings.idleOnly.name'))
      .setDesc(t('settings.idleOnly.desc'))
      .addToggle((tg) => {
        tg.setValue(this.plugin.settings.idlePlaybackEnabled);
        tg.onChange(async (v) => {
          this.plugin.settings.idlePlaybackEnabled = v;
          await this.plugin.saveSettings();
          this.plugin.applyRuntimeSettings();
        });
      });

    new Setting(containerEl)
      .setName(t('settings.idleDelay.name'))
      .setDesc(t('settings.idleDelay.desc'))
      .addSlider((sl) => {
        sl.setLimits(5, 600, 5);
        sl.setValue(this.plugin.settings.idlePlaybackDelaySec);
        sl.setDynamicTooltip();
        sl.onChange(async (v) => {
          this.plugin.settings.idlePlaybackDelaySec = v;
          await this.plugin.saveSettings();
          this.plugin.applyRuntimeSettings();
        });
      });

    // ---- mode ----
    new Setting(containerEl)
      .setName(t('settings.mode.name'))
      .setDesc(t('settings.mode.desc'))
      .addDropdown((dd) => {
        dd.addOption('0', t('settings.mode.pomodoro'));
        dd.addOption('1', t('settings.mode.token'));
        dd.addOption('2', t('settings.mode.demo'));
        dd.setValue(String(this.plugin.settings.sizeMode));
        dd.onChange(async (v) => {
          this.plugin.settings.sizeMode = parseInt(v);
          await this.plugin.saveSettings();
          this.plugin.onModeChange();
        });
      });

    // ---- token metric ----
    new Setting(containerEl)
      .setName(t('settings.tokenMetric.name'))
      .setDesc(t('settings.tokenMetric.desc'))
      .addDropdown((dd) => {
        dd.addOption('word-count', t('settings.tokenMetric.word'));
        dd.addOption('global-word-count', t('settings.tokenMetric.global'));
        dd.addOption('file-count', t('settings.tokenMetric.file'));
        dd.addOption('tab-count', t('settings.tokenMetric.tab'));
        dd.setValue(this.plugin.settings.tokenMetric);
        dd.onChange(async (v) => {
          this.plugin.settings.tokenMetric = v as BlackHoleSettings['tokenMetric'];
          await this.plugin.saveSettings();
        });
      });

    new Setting(containerEl)
      .setName(t('settings.maxWordCount.name'))
      .setDesc(t('settings.maxWordCount.desc'))
      .addSlider((sl) => {
        sl.setLimits(100, 50000, 100);
        sl.setValue(this.plugin.settings.maxWordCount);
        sl.onChange(async (v) => {
          this.plugin.settings.maxWordCount = v;
          await this.plugin.saveSettings();
        });
      });

    // ---- pomodoro ----
    containerEl.createEl('h3', { text: t('settings.section.pomodoro') });
    new Setting(containerEl)
      .setName(t('settings.workPeriod.name'))
      .addSlider((sl) => {
        sl.setLimits(10, 120, 1); sl.setValue(this.plugin.settings.workPeriodMin);
        sl.onChange(async (v) => { this.plugin.settings.workPeriodMin = v; this.plugin.onParamsChange(); await this.plugin.saveSettings(); });
      });
    new Setting(containerEl)
      .setName(t('settings.break.name'))
      .addSlider((sl) => {
        sl.setLimits(1, 30, 1); sl.setValue(this.plugin.settings.breakMin);
        sl.onChange(async (v) => { this.plugin.settings.breakMin = v; this.plugin.onParamsChange(); await this.plugin.saveSettings(); });
      });
    new Setting(containerEl)
      .setName(t('settings.idleFade.name'))
      .setDesc(t('settings.idleFade.desc'))
      .addSlider((sl) => {
        sl.setLimits(10, 600, 5); sl.setValue(this.plugin.settings.idleFadeSec);
        sl.onChange(async (v) => { this.plugin.settings.idleFadeSec = v; this.plugin.onParamsChange(); await this.plugin.saveSettings(); });
      });

    // ---- hole & lensing ----
    containerEl.createEl('h3', { text: t('settings.section.hole') });
    this.slider(t('settings.holeRadius.name'), this.plugin.settings.holeRadius, 0.001, 0.08, 0.001, (v) => { this.plugin.settings.holeRadius = v; });
    this.slider(t('settings.lensDepth.name'), this.plugin.settings.lensDepth, 1, 50, 0.5, (v) => { this.plugin.settings.lensDepth = v; });
    this.slider(t('settings.starGain.name'), this.plugin.settings.starGain, 0, 5, 0.1, (v) => { this.plugin.settings.starGain = v; });

    // ---- accretion disk ----
    containerEl.createEl('h3', { text: t('settings.section.disk') });
    this.slider(t('settings.diskInner.name'), this.plugin.settings.diskInner, 1.6, 10, 0.1, (v) => { this.plugin.settings.diskInner = v; });
    this.slider(t('settings.diskOuter.name'), this.plugin.settings.diskOuter, 3, 30, 0.5, (v) => { this.plugin.settings.diskOuter = v; });
    this.slider(t('settings.diskIncl.name'), this.plugin.settings.diskIncl, 0, 3.14, 0.01, (v) => { this.plugin.settings.diskIncl = v; });
    this.slider(t('settings.diskRoll.name'), this.plugin.settings.diskRoll, -3.14, 3.14, 0.01, (v) => { this.plugin.settings.diskRoll = v; });
    this.slider(t('settings.diskGain.name'), this.plugin.settings.diskGain, 0, 10, 0.1, (v) => { this.plugin.settings.diskGain = v; });
    this.slider(t('settings.diskOpacity.name'), this.plugin.settings.diskOpacity, 0, 1, 0.01, (v) => { this.plugin.settings.diskOpacity = v; });
    this.slider(t('settings.diskTemp.name'), this.plugin.settings.diskTemp, 1500, 40000, 100, (v) => { this.plugin.settings.diskTemp = v; });
    this.slider(t('settings.dopplerMix.name'), this.plugin.settings.dopplerMix, 0, 1, 0.01, (v) => { this.plugin.settings.dopplerMix = v; });
    this.slider(t('settings.diskBeam.name'), this.plugin.settings.diskBeam, 0, 10, 0.1, (v) => { this.plugin.settings.diskBeam = v; });

    // ---- performance ----
    containerEl.createEl('h3', { text: t('settings.section.performance') });
    new Setting(containerEl)
      .setName(t('settings.nSteps.name'))
      .setDesc(t('settings.nSteps.desc'))
      .addSlider((sl) => {
        sl.setLimits(48, 96, 1); sl.setValue(this.plugin.settings.nSteps);
        sl.setDynamicTooltip();
        sl.onChange(async (v) => {
          this.plugin.settings.nSteps = v;
          await this.plugin.saveSettings();
          this.plugin.onParamsChange(); // baked const — needs recompile
        });
      });

    new Setting(containerEl)
      .setName(t('settings.renderScale.name'))
      .setDesc(t('settings.renderScale.desc'))
      .addSlider((sl) => {
        sl.setLimits(0.15, 1, 0.05); sl.setValue(this.plugin.settings.renderScale);
        sl.setDynamicTooltip();
        sl.onChange(async (v) => {
          this.plugin.settings.renderScale = v;
          await this.plugin.saveSettings();
          this.plugin.applyRuntimeSettings();
        });
      });

    new Setting(containerEl)
      .setName(t('settings.captureEnabled.name'))
      .setDesc(t('settings.captureEnabled.desc'))
      .addToggle((tg) => {
        tg.setValue(this.plugin.settings.captureEnabled);
        tg.onChange(async (v) => {
          this.plugin.settings.captureEnabled = v;
          await this.plugin.saveSettings();
          this.plugin.applyRuntimeSettings();
        });
      });

    new Setting(containerEl)
      .setName(t('settings.captureInterval.name'))
      .setDesc(t('settings.captureInterval.desc'))
      .addSlider((sl) => {
        sl.setLimits(2500, 6000, 250); sl.setValue(this.plugin.settings.captureIntervalMs);
        sl.setDynamicTooltip();
        sl.onChange(async (v) => {
          this.plugin.settings.captureIntervalMs = v;
          await this.plugin.saveSettings();
          this.plugin.applyRuntimeSettings();
        });
      });

    this.slider(t('settings.tokenAreaMax.name'), this.plugin.settings.tokenAreaMax * 1000, this.plugin.settings.tokenAreaMin * 1000, Math.max(500, this.plugin.settings.tokenAreaMin * 1000), 0.1, (v) => { this.plugin.settings.tokenAreaMax = v / 1000; });
  }

  private slider(
    name: string, value: number, min: number, max: number, step: number,
    onChange: (v: number) => void,
  ) {
    let slider: SliderComponent;
    let text: TextComponent;
    const update = async (v: number) => {
      slider.setValue(v);
      text.setValue(String(v));
      onChange(v);
      this.plugin.onParamsChange();
      await this.plugin.saveSettings();
    };
    new Setting(this.containerEl)
      .setName(name)
      .addSlider((sl) => {
        slider = sl;
        sl.setLimits(min, max, step);
        sl.setValue(value);
        sl.onChange(update);
      })
      .addText((txt) => {
        text = txt;
        txt.setValue(String(value));
        txt.onChange(async (s) => {
          const v = Number(s);
          if (s.trim() && Number.isFinite(v) && v >= min && v <= max) await update(v);
        });
      });
  }
}
