export type PluginLanguage = 'auto' | 'en' | 'zh-CN';

type SupportedLocale = 'en' | 'zh-CN';

export type TranslationKey =
  | 'ribbon.toggle'
  | 'notice.enabled'
  | 'notice.disabled'
  | 'notice.startFailed'
  | 'notice.requireWebgl2'
  | 'notice.softwareUnsupported'
  | 'notice.lensUnsupported'
  // Legacy capture diagnostics; not used by the live backdrop lens.
  | 'notice.captureComplex'
  | 'notice.captureLayout'
  | 'notice.captureSlow'
  | 'notice.captureFailed'
  | 'settings.reset.name'
  | 'settings.reset.desc'
  | 'settings.reset.button'
  | 'settings.title'
  | 'settings.general'
  | 'settings.language.name'
  | 'settings.language.desc'
  | 'settings.language.auto'
  | 'settings.language.en'
  | 'settings.language.zh-CN'
  | 'settings.playback'
  | 'settings.idleOnly.name'
  | 'settings.idleOnly.desc'
  | 'settings.idleDelay.name'
  | 'settings.idleDelay.desc'
  | 'settings.mode.name'
  | 'settings.mode.desc'
  | 'settings.mode.pomodoro'
  | 'settings.mode.token'
  | 'settings.mode.demo'
  | 'settings.tokenMetric.name'
  | 'settings.tokenMetric.desc'
  | 'settings.tokenMetric.word'
  | 'settings.tokenMetric.global'
  | 'settings.tokenMetric.file'
  | 'settings.tokenMetric.tab'
  | 'settings.maxWordCount.name'
  | 'settings.maxWordCount.desc'
  | 'settings.section.pomodoro'
  | 'settings.workPeriod.name'
  | 'settings.break.name'
  | 'settings.idleFade.name'
  | 'settings.idleFade.desc'
  | 'settings.section.hole'
  | 'settings.holeRadius.name'
  | 'settings.lensDepth.name'
  | 'settings.starGain.name'
  | 'settings.section.disk'
  | 'settings.diskInner.name'
  | 'settings.diskOuter.name'
  | 'settings.diskIncl.name'
  | 'settings.diskRoll.name'
  | 'settings.diskGain.name'
  | 'settings.diskOpacity.name'
  | 'settings.diskTemp.name'
  | 'settings.dopplerMix.name'
  | 'settings.diskBeam.name'
  | 'settings.section.performance'
  | 'settings.nSteps.name'
  | 'settings.nSteps.desc'
  | 'settings.renderScale.name'
  | 'settings.renderScale.desc'
  | 'settings.captureEnabled.name'
  | 'settings.captureEnabled.desc'
  | 'settings.tokenAreaMax.name';

const translations: Record<SupportedLocale, Record<TranslationKey, string>> = {
  en: {
    'ribbon.toggle': 'Toggle Black Hole',
    'notice.enabled': 'Black hole ON',
    'notice.disabled': 'Black hole OFF',
    'notice.startFailed': 'Black Hole failed to start — see console for details.',
    'notice.requireWebgl2': 'Black Hole plugin requires WebGL2',
    'notice.softwareUnsupported': 'Hardware acceleration required. Animation stopped.',
    'notice.lensUnsupported': 'Live text lens is not supported here.',
    'notice.captureComplex': 'Legacy capture: note exceeds the limit.',
    'notice.captureLayout': 'Legacy capture: layout stayed busy.',
    'notice.captureSlow': 'Legacy capture: time limit exceeded.',
    'notice.captureFailed': 'Legacy capture: repeated failure.',
    'settings.reset.name': 'Reset settings',
    'settings.reset.desc': 'Reset animation settings.',
    'settings.reset.button': 'Reset',
    'settings.title': 'Black Hole Settings',
    'settings.general': 'General',
    'settings.language.name': 'Language',
    'settings.language.desc': '',
    'settings.language.auto': 'Auto',
    'settings.language.en': 'English',
    'settings.language.zh-CN': 'Simplified Chinese',
    'settings.playback': 'Playback',
    'settings.idleOnly.name': 'Idle-Only Playback',
    'settings.idleOnly.desc': 'Pause when you resume typing or scrolling.',
    'settings.idleDelay.name': 'Idle Start Delay (sec)',
    'settings.idleDelay.desc': 'Wait this long after your last input.',
    'settings.mode.name': 'Size Mode',
    'settings.mode.desc': 'Choose how the black hole grows.',
    'settings.mode.pomodoro': 'Pomodoro',
    'settings.mode.token': 'Word count',
    'settings.mode.demo': 'Demo (42-second loop)',
    'settings.tokenMetric.name': 'Token Metric',
    'settings.tokenMetric.desc': 'Controls size in Word count mode.',
    'settings.tokenMetric.word': 'Current note word count',
    'settings.tokenMetric.global': 'Estimated vault word count (500 per Markdown file)',
    'settings.tokenMetric.file': 'Vault file count',
    'settings.tokenMetric.tab': 'Open tab count',
    'settings.maxWordCount.name': 'Max Word Count',
    'settings.maxWordCount.desc': 'Word count for full size.',
    'settings.section.pomodoro': 'Pomodoro',
    'settings.workPeriod.name': 'Work Period (min)',
    'settings.break.name': 'Break (min)',
    'settings.idleFade.name': 'Idle Fade (sec)',
    'settings.idleFade.desc': 'Start shrinking after this idle time.',
    'settings.section.hole': 'Hole & Lensing',
    'settings.holeRadius.name': 'Hole Radius',
    'settings.lensDepth.name': 'Lens Depth',
    'settings.starGain.name': 'Star Gain',
    'settings.section.disk': 'Accretion Disk',
    'settings.diskInner.name': 'Disk Inner',
    'settings.diskOuter.name': 'Disk Outer',
    'settings.diskIncl.name': 'Inclination',
    'settings.diskRoll.name': 'Roll',
    'settings.diskGain.name': 'Gain',
    'settings.diskOpacity.name': 'Opacity',
    'settings.diskTemp.name': 'Temperature (K)',
    'settings.dopplerMix.name': 'Doppler Mix',
    'settings.diskBeam.name': 'Beaming',
    'settings.section.performance': 'Performance',
    'settings.nSteps.name': 'Integration Steps',
    'settings.nSteps.desc': 'Higher is more accurate, but slower.',
    'settings.renderScale.name': 'Resolution',
    'settings.renderScale.desc': 'Higher is sharper and uses more GPU.',
    'settings.captureEnabled.name': 'Text lens',
    'settings.captureEnabled.desc': 'Live SVG backdrop lens. No screenshots; uses GPU.',
    'settings.tokenAreaMax.name': 'Token Area Max (×1e-3)',
  },
  'zh-CN': {
    'ribbon.toggle': '切换黑洞',
    'notice.enabled': '黑洞已开启',
    'notice.disabled': '黑洞已关闭',
    'notice.startFailed': '黑洞插件启动失败，请查看控制台日志。',
    'notice.requireWebgl2': '黑洞插件需要 WebGL2 才能运行',
    'notice.softwareUnsupported': '需要硬件加速，动画已停止。',
    'notice.lensUnsupported': '当前环境不支持实时文字透镜。',
    'notice.captureComplex': '旧版截图诊断：笔记超出容量。',
    'notice.captureLayout': '旧版截图诊断：布局仍繁忙。',
    'notice.captureSlow': '旧版截图诊断：耗时超限。',
    'notice.captureFailed': '旧版截图诊断：连续失败。',
    'settings.reset.name': '恢复默认',
    'settings.reset.desc': '重置动画参数。',
    'settings.reset.button': '恢复默认',
    'settings.title': '黑洞设置',
    'settings.general': '通用',
    'settings.language.name': '语言',
    'settings.language.desc': '',
    'settings.language.auto': '自动',
    'settings.language.en': '英文',
    'settings.language.zh-CN': '简体中文',
    'settings.playback': '播放控制',
    'settings.idleOnly.name': '仅在闲置时播放',
    'settings.idleOnly.desc': '输入或滚动时暂停。',
    'settings.idleDelay.name': '闲置启动延时（秒）',
    'settings.idleDelay.desc': '停止操作后等待的时间。',
    'settings.mode.name': '尺寸模式',
    'settings.mode.desc': '选择黑洞的增长方式。',
    'settings.mode.pomodoro': '番茄钟',
    'settings.mode.token': '字数',
    'settings.mode.demo': '演示（42 秒循环）',
    'settings.tokenMetric.name': '字数指标',
    'settings.tokenMetric.desc': '字数模式下的大小依据。',
    'settings.tokenMetric.word': '当前笔记字数',
    'settings.tokenMetric.global': '整个仓库估算字数',
    'settings.tokenMetric.file': '仓库文件数',
    'settings.tokenMetric.tab': '已打开标签数',
    'settings.maxWordCount.name': '最大字数',
    'settings.maxWordCount.desc': '达到此字数时最大。',
    'settings.section.pomodoro': '番茄钟',
    'settings.workPeriod.name': '工作时长（分钟）',
    'settings.break.name': '休息时长（分钟）',
    'settings.idleFade.name': '空闲淡出（秒）',
    'settings.idleFade.desc': '闲置多久后开始缩小。',
    'settings.section.hole': '黑洞与引力透镜',
    'settings.holeRadius.name': '黑洞半径',
    'settings.lensDepth.name': '透镜深度',
    'settings.starGain.name': '星场强度',
    'settings.section.disk': '吸积盘',
    'settings.diskInner.name': '内半径',
    'settings.diskOuter.name': '外半径',
    'settings.diskIncl.name': '倾角',
    'settings.diskRoll.name': '滚转',
    'settings.diskGain.name': '增益',
    'settings.diskOpacity.name': '透明度',
    'settings.diskTemp.name': '温度（K）',
    'settings.dopplerMix.name': '多普勒混合',
    'settings.diskBeam.name': '束射强度',
    'settings.section.performance': '性能',
    'settings.nSteps.name': '积分步数',
    'settings.nSteps.desc': '越高越精确，也越慢。',
    'settings.renderScale.name': '分辨率',
    'settings.renderScale.desc': '越高越清晰，也更占 GPU。',
    'settings.captureEnabled.name': '文字扭曲',
    'settings.captureEnabled.desc': 'SVG 实时背景透镜。不截图，占用 GPU。',
    'settings.tokenAreaMax.name': '字数模式最大面积（×1e-3）',
  },
};

function resolveLocale(language: PluginLanguage): SupportedLocale {
  if (language === 'en' || language === 'zh-CN') return language;
  const detected = (typeof navigator !== 'undefined' ? navigator.language : 'en').toLowerCase();
  return detected.startsWith('zh') ? 'zh-CN' : 'en';
}

export function t(language: PluginLanguage, key: TranslationKey): string {
  const locale = resolveLocale(language);
  return translations[locale][key] ?? translations.en[key];
}
