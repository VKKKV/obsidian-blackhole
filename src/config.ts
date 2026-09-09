import type { PluginLanguage } from './i18n';

export interface BlackHoleSettings {
  defaultsVersion: number;
  enabled: boolean;
  language: PluginLanguage;
  sizeMode: number;
  idlePlaybackEnabled: boolean;
  idlePlaybackDelaySec: number;
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
  renderScale: number;
  captureEnabled: boolean;
  captureIntervalMs: number;
}

export const DEFAULT_SETTINGS: BlackHoleSettings = {
  defaultsVersion: 1,
  enabled: true,
  language: 'auto',
  sizeMode: 2,
  idlePlaybackEnabled: false,
  idlePlaybackDelaySec: 45,
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
  nSteps: 64,
  workPeriodMin: 55,
  breakMin: 5,
  idleFadeSec: 90,
  renderScale: 0.75,
  captureEnabled: false,
  captureIntervalMs: 2500,
};

type NumericKey = { [K in keyof BlackHoleSettings]: BlackHoleSettings[K] extends number ? K : never }[keyof BlackHoleSettings];

/** Storage validation, not the runtime GPU budget. */
export const NUMERIC_LIMITS: Record<NumericKey, readonly [number, number]> = {
  defaultsVersion: [1, 1], sizeMode: [0, 2], idlePlaybackDelaySec: [5, 600], maxWordCount: [100, 50000],
  holeRadius: [0.001, 0.2], lensDepth: [1, 50], starGain: [0, 5],
  diskInner: [1.6, 10], diskOuter: [3, 30], diskIncl: [0, 3.14], diskRoll: [-3.14, 3.14],
  diskGain: [0, 10], diskOpacity: [0, 1], diskTemp: [1500, 40000], dopplerMix: [0, 1],
  diskBeam: [0, 10], diskSpeed: [0, 20], diskWind: [0, 20], diskContrast: [0, 10],
  exposure: [0, 10], driftSpeed: [0, 10], workArea: [0, 0.8], dilationMin: [0, 1],
  tokenAreaMin: [0.0001, 1], tokenAreaMax: [0.0001, 1], tokenHomeX: [0, 1], tokenHomeY: [0, 1],
  tokenEase: [0.1, 10], tokenReach: [0, 1], tokenCalm: [0, 10], tokenRush: [0, 10],
  nSteps: [48, 96], workPeriodMin: [10, 120], breakMin: [1, 30], idleFadeSec: [10, 600],
  renderScale: [0.15, 1], captureIntervalMs: [100, 6000],
};

export function normalizeSettings(data: unknown): BlackHoleSettings {
  const settings = { ...DEFAULT_SETTINGS };
  if (!data || typeof data !== 'object' || Array.isArray(data)) return settings;
  const source = data as Record<string, unknown>;
  for (const key of Object.keys(NUMERIC_LIMITS) as NumericKey[]) {
    const value = source[key];
    if (typeof value !== 'number' || !Number.isFinite(value)) continue;
    const [min, max] = NUMERIC_LIMITS[key];
    settings[key] = Math.max(min, Math.min(max, value));
  }
  // Old releases forced 6–10 steps, which never reached the integration domain.
  if (typeof source.nSteps === 'number' && source.nSteps < 48) settings.nSteps = DEFAULT_SETTINGS.nSteps;
  settings.nSteps = Math.round(settings.nSteps);
  if (!Number.isInteger(source.sizeMode)) settings.sizeMode = DEFAULT_SETTINGS.sizeMode;
  for (const key of ['enabled', 'idlePlaybackEnabled', 'captureEnabled'] as const) {
    if (typeof source[key] === 'boolean') settings[key] = source[key];
  }
  if (source.language === 'auto' || source.language === 'en' || source.language === 'zh-CN') settings.language = source.language;
  if (source.tokenMetric === 'word-count' || source.tokenMetric === 'global-word-count'
      || source.tokenMetric === 'file-count' || source.tokenMetric === 'tab-count') settings.tokenMetric = source.tokenMetric;
  // Upgrade only the old untouched visual preset, not customized configurations.
  if (source.defaultsVersion === undefined && source.holeRadius === 0.014
      && source.tokenAreaMin === 0.003 && source.tokenAreaMax === 0.02
      && source.diskOuter === 7 && source.sizeMode === 1) {
    settings.holeRadius = DEFAULT_SETTINGS.holeRadius;
    settings.tokenAreaMin = DEFAULT_SETTINGS.tokenAreaMin;
    settings.tokenAreaMax = DEFAULT_SETTINGS.tokenAreaMax;
    settings.diskOuter = DEFAULT_SETTINGS.diskOuter;
    settings.sizeMode = DEFAULT_SETTINGS.sizeMode;
    if (source.renderScale === 0.35) settings.renderScale = DEFAULT_SETTINGS.renderScale;
  }
  settings.tokenAreaMax = Math.max(settings.tokenAreaMin, settings.tokenAreaMax);
  settings.diskOuter = Math.max(settings.diskInner + 0.5, settings.diskOuter);
  return settings;
}

/** Pixel budget is enforced against actual crop area by the renderer. */
export function runtimeRenderScale(settings: BlackHoleSettings): number {
  return settings.renderScale;
}

/** Reset effect/performance parameters without changing language or the on/off switch. */
export function resetEffectSettings(current: BlackHoleSettings): BlackHoleSettings {
  return { ...DEFAULT_SETTINGS, language: current.language, enabled: current.enabled };
}
