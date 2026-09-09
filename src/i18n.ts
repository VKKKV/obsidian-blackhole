export type PluginLanguage = 'auto' | 'en' | 'zh-CN';

type SupportedLocale = 'en' | 'zh-CN';

export type TranslationKey =
  | 'ribbon.toggle'
  | 'notice.enabled'
  | 'notice.disabled'
  | 'notice.startFailed'
  | 'notice.requireWebgl2'
  | 'notice.softwareUnsupported'
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
  | 'settings.captureInterval.name'
  | 'settings.captureInterval.desc'
  | 'settings.tokenAreaMax.name';

const translations: Record<SupportedLocale, Record<TranslationKey, string>> = {
  en: {
    'ribbon.toggle': 'Toggle Black Hole',
    'notice.enabled': 'Black hole ON',
    'notice.disabled': 'Black hole OFF',
    'notice.startFailed': 'Black Hole failed to start — see console for details.',
    'notice.requireWebgl2': 'Black Hole plugin requires WebGL2',
    'notice.softwareUnsupported': 'Black Hole: software rendering is not supported. Animation is stopped to protect the UI. Enable hardware acceleration and check your GPU drivers before retrying.',
    'settings.title': 'Black Hole Settings',
    'settings.general': 'General',
    'settings.language.name': 'Language',
    'settings.language.desc': 'UI language for this plugin',
    'settings.language.auto': 'Auto',
    'settings.language.en': 'English',
    'settings.language.zh-CN': 'Simplified Chinese',
    'settings.playback': 'Playback',
    'settings.idleOnly.name': 'Idle-Only Playback',
    'settings.idleOnly.desc': 'Only play the black hole after you have been idle for the configured delay. Any new activity stops it immediately.',
    'settings.idleDelay.name': 'Idle Start Delay (sec)',
    'settings.idleDelay.desc': 'How long you must stay inactive before the animation starts',
    'settings.mode.name': 'Size Mode',
    'settings.mode.desc': 'What drives the hole\'s growth',
    'settings.mode.pomodoro': 'Pomodoro — wall-clock work/break cycle',
    'settings.mode.token': 'Token — word count / custom metric',
    'settings.mode.demo': 'Demo — self-running showcase loop',
    'settings.tokenMetric.name': 'Token Metric',
    'settings.tokenMetric.desc': 'What drives the hole in token mode',
    'settings.tokenMetric.word': 'Current note word count',
    'settings.tokenMetric.global': 'Estimated vault word count (500 per Markdown file)',
    'settings.tokenMetric.file': 'Vault file count',
    'settings.tokenMetric.tab': 'Open tab count',
    'settings.maxWordCount.name': 'Max Word Count',
    'settings.maxWordCount.desc': 'Word count at which the hole reaches 100% size (token mode)',
    'settings.section.pomodoro': 'Pomodoro',
    'settings.workPeriod.name': 'Work Period (min)',
    'settings.break.name': 'Break (min)',
    'settings.idleFade.name': 'Idle Fade (sec)',
    'settings.idleFade.desc': 'Typing pause after which the hole starts to shrink',
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
    'settings.nSteps.desc': 'Geodesic steps per pixel — higher = more accurate but slower',
    'settings.renderScale.name': 'Render Scale',
    'settings.renderScale.desc': 'Requested shader resolution scale (0.15–1). The hardware runtime budget caps it at 0.35 without changing this setting. Software rendering is not supported.',
    'settings.captureEnabled.name': 'Capture Workspace',
    'settings.captureEnabled.desc': 'Warp your actual notes into the lens. Turn OFF if the UI stutters — the hole then lenses the starfield only.',
    'settings.captureInterval.name': 'Capture Interval (ms)',
    'settings.captureInterval.desc': 'How often the workspace is re-captured. Higher = smoother UI, less responsive lensing.',
    'settings.tokenAreaMax.name': 'Token Area Max (×1e-3)',
  },
  'zh-CN': {
    'ribbon.toggle': '切换黑洞',
    'notice.enabled': '黑洞已开启',
    'notice.disabled': '黑洞已关闭',
    'notice.startFailed': '黑洞插件启动失败，请查看控制台日志。',
    'notice.requireWebgl2': '黑洞插件需要 WebGL2 才能运行',
    'notice.softwareUnsupported': '黑洞不支持软件渲染，已停止动画以避免界面卡死。请启用硬件加速并检查 GPU 驱动后重试。',
    'settings.title': '黑洞设置',
    'settings.general': '通用',
    'settings.language.name': '语言',
    'settings.language.desc': '此插件的界面语言',
    'settings.language.auto': '自动',
    'settings.language.en': '英文',
    'settings.language.zh-CN': '简体中文',
    'settings.playback': '播放控制',
    'settings.idleOnly.name': '仅在闲置时播放',
    'settings.idleOnly.desc': '只有在你停止操作达到设定时长后才播放黑洞动画，一旦重新操作就立即停止。',
    'settings.idleDelay.name': '闲置启动延时（秒）',
    'settings.idleDelay.desc': '需要保持无操作多久后才开始播放动画',
    'settings.mode.name': '尺寸模式',
    'settings.mode.desc': '决定黑洞增长方式',
    'settings.mode.pomodoro': '番茄钟：按工作 / 休息时间循环变化',
    'settings.mode.token': '字数：按字数 / 指标变化',
    'settings.mode.demo': '演示：自动展示效果',
    'settings.tokenMetric.name': '字数指标',
    'settings.tokenMetric.desc': '字数模式下用于驱动黑洞的指标',
    'settings.tokenMetric.word': '当前笔记字数',
    'settings.tokenMetric.global': '整个仓库估算字数',
    'settings.tokenMetric.file': '仓库文件数',
    'settings.tokenMetric.tab': '已打开标签数',
    'settings.maxWordCount.name': '最大字数',
    'settings.maxWordCount.desc': '达到该字数时黑洞增长到 100%（字数模式）',
    'settings.section.pomodoro': '番茄钟',
    'settings.workPeriod.name': '工作时长（分钟）',
    'settings.break.name': '休息时长（分钟）',
    'settings.idleFade.name': '空闲淡出（秒）',
    'settings.idleFade.desc': '在番茄钟模式下，停止输入多久后黑洞开始缩小',
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
    'settings.nSteps.desc': '每像素的测地线积分步数，越高越精确但越慢',
    'settings.renderScale.name': '渲染缩放',
    'settings.renderScale.desc': '期望的渲染比例（0.15–1）。硬件运行预算最高为 0.35，不会改写此设置；不支持软件渲染。',
    'settings.captureEnabled.name': '捕获工作区',
    'settings.captureEnabled.desc': '把真实笔记内容扭曲进透镜中。如果界面卡顿请关闭，此时只渲染星场。',
    'settings.captureInterval.name': '捕获间隔（毫秒）',
    'settings.captureInterval.desc': '重新捕获工作区的频率。越高越流畅，但透镜响应越慢。',
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
