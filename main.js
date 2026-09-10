var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => BlackHolePlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian2 = require("obsidian");

// src/settings.ts
var import_obsidian = require("obsidian");

// src/config.ts
var DEFAULT_SETTINGS = {
  defaultsVersion: 1,
  enabled: true,
  language: "auto",
  sizeMode: 2,
  idlePlaybackEnabled: false,
  idlePlaybackDelaySec: 45,
  tokenMetric: "word-count",
  maxWordCount: 5e3,
  holeRadius: 0.02,
  lensDepth: 13,
  starGain: 0,
  diskInner: 1.8,
  diskOuter: 8,
  diskIncl: 1.5,
  diskRoll: 0.35,
  diskGain: 2.2,
  diskOpacity: 0.9,
  diskTemp: 5500,
  dopplerMix: 0.6,
  diskBeam: 2.5,
  diskSpeed: 5,
  diskWind: 7,
  diskContrast: 1.6,
  exposure: 1.4,
  driftSpeed: 1,
  workArea: 0.33,
  dilationMin: 0.2,
  tokenAreaMin: 0.01,
  tokenAreaMax: 0.5,
  tokenHomeX: 0.96,
  tokenHomeY: 0.04,
  tokenEase: 1,
  tokenReach: 1,
  tokenCalm: 0.04,
  tokenRush: 1.1,
  nSteps: 64,
  workPeriodMin: 55,
  breakMin: 5,
  idleFadeSec: 90,
  renderScale: 1,
  captureEnabled: false,
  captureIntervalMs: 2500
};
var NUMERIC_LIMITS = {
  defaultsVersion: [1, 1],
  sizeMode: [0, 2],
  idlePlaybackDelaySec: [5, 600],
  maxWordCount: [100, 5e4],
  holeRadius: [1e-3, 0.2],
  lensDepth: [1, 50],
  starGain: [0, 5],
  diskInner: [1.6, 10],
  diskOuter: [3, 30],
  diskIncl: [0, 3.14],
  diskRoll: [-3.14, 3.14],
  diskGain: [0, 10],
  diskOpacity: [0, 1],
  diskTemp: [1500, 4e4],
  dopplerMix: [0, 1],
  diskBeam: [0, 10],
  diskSpeed: [0, 20],
  diskWind: [0, 20],
  diskContrast: [0, 10],
  exposure: [0, 10],
  driftSpeed: [0, 10],
  workArea: [0, 0.8],
  dilationMin: [0, 1],
  tokenAreaMin: [1e-4, 1],
  tokenAreaMax: [1e-4, 1],
  tokenHomeX: [0, 1],
  tokenHomeY: [0, 1],
  tokenEase: [0.1, 10],
  tokenReach: [0, 1],
  tokenCalm: [0, 10],
  tokenRush: [0, 10],
  nSteps: [48, 96],
  workPeriodMin: [10, 120],
  breakMin: [1, 30],
  idleFadeSec: [10, 600],
  renderScale: [0.15, 1],
  captureIntervalMs: [100, 6e3]
};
function normalizeSettings(data) {
  const settings = { ...DEFAULT_SETTINGS };
  if (!data || typeof data !== "object" || Array.isArray(data)) return settings;
  const source = data;
  for (const key of Object.keys(NUMERIC_LIMITS)) {
    const value = source[key];
    if (typeof value !== "number" || !Number.isFinite(value)) continue;
    const [min, max] = NUMERIC_LIMITS[key];
    settings[key] = Math.max(min, Math.min(max, value));
  }
  if (typeof source.nSteps === "number" && source.nSteps < 48) settings.nSteps = DEFAULT_SETTINGS.nSteps;
  settings.nSteps = Math.round(settings.nSteps);
  if (!Number.isInteger(source.sizeMode)) settings.sizeMode = DEFAULT_SETTINGS.sizeMode;
  for (const key of ["enabled", "idlePlaybackEnabled", "captureEnabled"]) {
    if (typeof source[key] === "boolean") settings[key] = source[key];
  }
  if (source.language === "auto" || source.language === "en" || source.language === "zh-CN") settings.language = source.language;
  if (source.tokenMetric === "word-count" || source.tokenMetric === "global-word-count" || source.tokenMetric === "file-count" || source.tokenMetric === "tab-count") settings.tokenMetric = source.tokenMetric;
  if (source.defaultsVersion === void 0 && source.holeRadius === 0.014 && source.tokenAreaMin === 3e-3 && source.tokenAreaMax === 0.02 && source.diskOuter === 7 && source.sizeMode === 1) {
    settings.holeRadius = DEFAULT_SETTINGS.holeRadius;
    settings.tokenAreaMin = DEFAULT_SETTINGS.tokenAreaMin;
    settings.tokenAreaMax = DEFAULT_SETTINGS.tokenAreaMax;
    settings.diskOuter = DEFAULT_SETTINGS.diskOuter;
    settings.sizeMode = DEFAULT_SETTINGS.sizeMode;
    if (source.renderScale === 0.35) settings.renderScale = 0.75;
  }
  settings.tokenAreaMax = Math.max(settings.tokenAreaMin, settings.tokenAreaMax);
  settings.diskOuter = Math.max(settings.diskInner + 0.5, settings.diskOuter);
  return settings;
}
function runtimeRenderScale(settings) {
  return settings.renderScale;
}
function resetEffectSettings(current) {
  return { ...DEFAULT_SETTINGS, language: current.language, enabled: current.enabled };
}

// src/settings.ts
var BlackHoleSettingsTab = class extends import_obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    const t2 = this.plugin.t.bind(this.plugin);
    containerEl.empty();
    containerEl.createEl("h2", { text: t2("settings.title") });
    new import_obsidian.Setting(containerEl).setName(t2("settings.reset.name")).setDesc(t2("settings.reset.desc")).addButton((button) => button.setButtonText(t2("settings.reset.button")).onClick(async () => {
      button.setDisabled(true);
      try {
        await this.plugin.resetSettings();
        this.display();
      } finally {
        button.setDisabled(false);
      }
    }));
    containerEl.createEl("h3", { text: t2("settings.general") });
    new import_obsidian.Setting(containerEl).setName(t2("settings.language.name")).addDropdown((dd) => {
      dd.addOption("auto", t2("settings.language.auto"));
      dd.addOption("en", t2("settings.language.en"));
      dd.addOption("zh-CN", t2("settings.language.zh-CN"));
      dd.setValue(this.plugin.settings.language);
      dd.onChange(async (v) => {
        this.plugin.settings.language = v;
        await this.plugin.saveSettings();
        this.display();
      });
    });
    containerEl.createEl("h3", { text: t2("settings.playback") });
    new import_obsidian.Setting(containerEl).setName(t2("settings.idleOnly.name")).setDesc(t2("settings.idleOnly.desc")).addToggle((tg) => {
      tg.setValue(this.plugin.settings.idlePlaybackEnabled);
      tg.onChange(async (v) => {
        this.plugin.settings.idlePlaybackEnabled = v;
        await this.plugin.saveSettings();
        this.plugin.applyRuntimeSettings();
      });
    });
    new import_obsidian.Setting(containerEl).setName(t2("settings.idleDelay.name")).setDesc(t2("settings.idleDelay.desc")).addSlider((sl) => {
      sl.setLimits(5, 600, 5);
      sl.setValue(this.plugin.settings.idlePlaybackDelaySec);
      sl.setDynamicTooltip();
      sl.onChange(async (v) => {
        this.plugin.settings.idlePlaybackDelaySec = v;
        await this.plugin.saveSettings();
        this.plugin.applyRuntimeSettings();
      });
    });
    new import_obsidian.Setting(containerEl).setName(t2("settings.mode.name")).setDesc(t2("settings.mode.desc")).addDropdown((dd) => {
      dd.addOption("0", t2("settings.mode.pomodoro"));
      dd.addOption("1", t2("settings.mode.token"));
      dd.addOption("2", t2("settings.mode.demo"));
      dd.setValue(String(this.plugin.settings.sizeMode));
      dd.onChange(async (v) => {
        this.plugin.settings.sizeMode = parseInt(v);
        await this.plugin.saveSettings();
        this.plugin.onModeChange();
      });
    });
    new import_obsidian.Setting(containerEl).setName(t2("settings.tokenMetric.name")).setDesc(t2("settings.tokenMetric.desc")).addDropdown((dd) => {
      dd.addOption("word-count", t2("settings.tokenMetric.word"));
      dd.addOption("global-word-count", t2("settings.tokenMetric.global"));
      dd.addOption("file-count", t2("settings.tokenMetric.file"));
      dd.addOption("tab-count", t2("settings.tokenMetric.tab"));
      dd.setValue(this.plugin.settings.tokenMetric);
      dd.onChange(async (v) => {
        this.plugin.settings.tokenMetric = v;
        await this.plugin.saveSettings();
      });
    });
    new import_obsidian.Setting(containerEl).setName(t2("settings.maxWordCount.name")).setDesc(t2("settings.maxWordCount.desc")).addSlider((sl) => {
      sl.setLimits(100, 5e4, 100);
      sl.setValue(this.plugin.settings.maxWordCount);
      sl.onChange(async (v) => {
        this.plugin.settings.maxWordCount = v;
        await this.plugin.saveSettings();
      });
    });
    containerEl.createEl("h3", { text: t2("settings.section.pomodoro") });
    new import_obsidian.Setting(containerEl).setName(t2("settings.workPeriod.name")).addSlider((sl) => {
      sl.setLimits(10, 120, 1);
      sl.setValue(this.plugin.settings.workPeriodMin);
      sl.onChange(async (v) => {
        this.plugin.settings.workPeriodMin = v;
        this.plugin.onParamsChange();
        await this.plugin.saveSettings();
      });
    });
    new import_obsidian.Setting(containerEl).setName(t2("settings.break.name")).addSlider((sl) => {
      sl.setLimits(1, 30, 1);
      sl.setValue(this.plugin.settings.breakMin);
      sl.onChange(async (v) => {
        this.plugin.settings.breakMin = v;
        this.plugin.onParamsChange();
        await this.plugin.saveSettings();
      });
    });
    new import_obsidian.Setting(containerEl).setName(t2("settings.idleFade.name")).setDesc(t2("settings.idleFade.desc")).addSlider((sl) => {
      sl.setLimits(10, 600, 5);
      sl.setValue(this.plugin.settings.idleFadeSec);
      sl.onChange(async (v) => {
        this.plugin.settings.idleFadeSec = v;
        this.plugin.onParamsChange();
        await this.plugin.saveSettings();
      });
    });
    containerEl.createEl("h3", { text: t2("settings.section.hole") });
    this.slider(t2("settings.holeRadius.name"), this.plugin.settings.holeRadius, 1e-3, 0.08, 1e-3, (v) => {
      this.plugin.settings.holeRadius = v;
    });
    this.slider(t2("settings.lensDepth.name"), this.plugin.settings.lensDepth, 1, 50, 0.5, (v) => {
      this.plugin.settings.lensDepth = v;
    });
    this.slider(t2("settings.starGain.name"), this.plugin.settings.starGain, 0, 5, 0.1, (v) => {
      this.plugin.settings.starGain = v;
    });
    containerEl.createEl("h3", { text: t2("settings.section.disk") });
    this.slider(t2("settings.diskInner.name"), this.plugin.settings.diskInner, 1.6, 10, 0.1, (v) => {
      this.plugin.settings.diskInner = v;
    });
    this.slider(t2("settings.diskOuter.name"), this.plugin.settings.diskOuter, 3, 30, 0.5, (v) => {
      this.plugin.settings.diskOuter = v;
    });
    this.slider(t2("settings.diskIncl.name"), this.plugin.settings.diskIncl, 0, 3.14, 0.01, (v) => {
      this.plugin.settings.diskIncl = v;
    });
    this.slider(t2("settings.diskRoll.name"), this.plugin.settings.diskRoll, -3.14, 3.14, 0.01, (v) => {
      this.plugin.settings.diskRoll = v;
    });
    this.slider(t2("settings.diskGain.name"), this.plugin.settings.diskGain, 0, 10, 0.1, (v) => {
      this.plugin.settings.diskGain = v;
    });
    this.slider(t2("settings.diskOpacity.name"), this.plugin.settings.diskOpacity, 0, 1, 0.01, (v) => {
      this.plugin.settings.diskOpacity = v;
    });
    this.slider(t2("settings.diskTemp.name"), this.plugin.settings.diskTemp, 1500, 4e4, 100, (v) => {
      this.plugin.settings.diskTemp = v;
    });
    this.slider(t2("settings.dopplerMix.name"), this.plugin.settings.dopplerMix, 0, 1, 0.01, (v) => {
      this.plugin.settings.dopplerMix = v;
    });
    this.slider(t2("settings.diskBeam.name"), this.plugin.settings.diskBeam, 0, 10, 0.1, (v) => {
      this.plugin.settings.diskBeam = v;
    });
    containerEl.createEl("h3", { text: t2("settings.section.performance") });
    new import_obsidian.Setting(containerEl).setName(t2("settings.nSteps.name")).setDesc(t2("settings.nSteps.desc")).addSlider((sl) => {
      sl.setLimits(48, 96, 1);
      sl.setValue(this.plugin.settings.nSteps);
      sl.setDynamicTooltip();
      sl.onChange(async (v) => {
        this.plugin.settings.nSteps = v;
        await this.plugin.saveSettings();
        this.plugin.onParamsChange();
      });
    });
    new import_obsidian.Setting(containerEl).setName(t2("settings.renderScale.name")).setDesc(t2("settings.renderScale.desc")).addSlider((sl) => {
      sl.setLimits(0.15, 1, 0.05);
      sl.setValue(this.plugin.settings.renderScale);
      sl.setDynamicTooltip();
      sl.onChange(async (v) => {
        this.plugin.settings.renderScale = v;
        await this.plugin.saveSettings();
        this.plugin.applyRuntimeSettings();
      });
    });
    new import_obsidian.Setting(containerEl).setName(t2("settings.captureEnabled.name")).setDesc(t2("settings.captureEnabled.desc")).addToggle((tg) => {
      tg.setValue(this.plugin.settings.captureEnabled);
      tg.onChange(async (v) => {
        this.plugin.settings.captureEnabled = v;
        await this.plugin.saveSettings();
        this.plugin.applyRuntimeSettings();
      });
    });
    this.slider(t2("settings.tokenAreaMax.name"), this.plugin.settings.tokenAreaMax * 1e3, this.plugin.settings.tokenAreaMin * 1e3, Math.max(500, this.plugin.settings.tokenAreaMin * 1e3), 0.1, (v) => {
      this.plugin.settings.tokenAreaMax = v / 1e3;
    });
  }
  slider(name, value, min, max, step, onChange) {
    let slider;
    let text;
    const update = async (v) => {
      slider.setValue(v);
      text.setValue(String(v));
      onChange(v);
      this.plugin.onParamsChange();
      await this.plugin.saveSettings();
    };
    new import_obsidian.Setting(this.containerEl).setName(name).addSlider((sl) => {
      slider = sl;
      sl.setLimits(min, max, step);
      sl.setValue(value);
      sl.onChange(update);
    }).addText((txt) => {
      text = txt;
      txt.setValue(String(value));
      txt.onChange(async (s) => {
        const v = Number(s);
        if (s.trim() && Number.isFinite(v) && v >= min && v <= max) await update(v);
      });
    });
  }
};

// src/shader.ts
var VS = `#version 300 es
layout(location = 0) in vec2 aPos;
out vec2 vUv;
void main() {
    vUv = aPos * 0.5 + 0.5;
    gl_Position = vec4(aPos, 0.0, 1.0);
}
`;
function makeFS(p) {
  return `#version 300 es
precision highp float;
precision highp int;

// ---- uniforms (set by renderer every frame) ----
uniform vec2  uResolution;
uniform float uTime;
uniform float uDemoTime;
uniform sampler2D uTexture;
uniform vec4 uCaptureRect;
uniform int   uSizeMode;
uniform int   uCaptureEnabled;
uniform vec2  uViewportOrigin;
uniform vec2  uViewportSize;
uniform vec4 uEffect; // center (top-left UV), radius, intensity

in vec2 vUv;
out vec4 fragColor;

// ---- tunable consts (injected from settings) ----
const float LENS_DEPTH    = ${p.lensDepth.toFixed(4)};
const float STAR_GAIN     = ${p.starGain.toFixed(4)};
const float DISK_INNER    = ${p.diskInner.toFixed(4)};
const float DISK_OUTER    = ${p.diskOuter.toFixed(4)};
const float DISK_INCL     = ${p.diskIncl.toFixed(4)};
const float DISK_ROLL     = ${p.diskRoll.toFixed(4)};
const float DISK_GAIN     = ${p.diskGain.toFixed(4)};
const float DISK_OPACITY  = ${p.diskOpacity.toFixed(4)};
const float DISK_TEMP     = ${p.diskTemp.toFixed(4)};
const float DOPPLER_MIX   = ${p.dopplerMix.toFixed(4)};
const float DISK_BEAM     = ${p.diskBeam.toFixed(4)};
const float DISK_SPEED    = ${p.diskSpeed.toFixed(4)};
const float DISK_WIND     = ${p.diskWind.toFixed(4)};
const float DISK_CONTRAST = ${p.diskContrast.toFixed(4)};
const float EXPOSURE      = ${p.exposure.toFixed(4)};
const float DRIFT_SPEED   = ${p.driftSpeed.toFixed(4)};
const float DILATION_MIN  = ${p.dilationMin.toFixed(4)};
const float DEMO_SEC        = 42.0000;
const float DEMO_XFADE      = 0.1800;
const float ALPHA_EPS       = 0.0100;

const int N_STEPS = ${p.nSteps};
const int MODE_POMODORO = 0;
const int MODE_TOKENS   = 1;
const int MODE_DEMO     = 2;
#define B_CRIT 2.5980762

// ------------------------------------------------------------------- noise --
float hash21(vec2 p) {
    p = fract(p * vec2(234.34, 435.345));
    p += dot(p, p + 34.23);
    return fract(p.x * p.y);
}

float vnoiseWrapY(vec2 p, float perY) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float y0 = mod(i.y, perY), y1 = mod(i.y + 1.0, perY);
    return mix(mix(hash21(vec2(i.x, y0)),       hash21(vec2(i.x + 1.0, y0)), f.x),
               mix(hash21(vec2(i.x, y1)),       hash21(vec2(i.x + 1.0, y1)), f.x),
               f.y);
}

vec4 workspaceSample(vec2 screenUV) {
    vec2 uv = (screenUV - uCaptureRect.xy) / max(uCaptureRect.zw, vec2(1e-6));
    if (any(lessThan(uv, vec2(0.0))) || any(greaterThan(uv, vec2(1.0)))) return vec4(0.0);
    return texture(uTexture, uv);
}

vec4 lensSample(vec2 destination, vec2 source) {
    vec2 dest = (destination - uCaptureRect.xy) / max(uCaptureRect.zw, vec2(1e-6));
    if (any(lessThan(dest, vec2(0.0))) || any(greaterThan(dest, vec2(1.0)))) return vec4(0.0);
    vec2 local = (source - uCaptureRect.xy) / max(uCaptureRect.zw, vec2(1e-6));
    vec2 inset = 0.5 / vec2(textureSize(uTexture, 0));
    return texture(uTexture, clamp(local, inset, vec2(1.0) - inset));
}

vec2 mirrorUV(vec2 u) { return 1.0 - abs(1.0 - mod(u, 2.0)); }

vec2 rot(vec2 v, float a) {
    float c = cos(a), s = sin(a);
    return vec2(c * v.x - s * v.y, s * v.x + c * v.y);
}

vec2 lissa(float t) {
    return vec2(0.75 * sin(t * 0.37) + 0.25 * sin(t * 0.83 + 1.0),
                0.70 * sin(t * 0.54 + 2.1) + 0.30 * sin(t * 1.07));
}

vec3 blackbody(float T) {
    float t = clamp(T, 1500.0, 40000.0) / 100.0;
    float r = t <= 66.0 ? 1.0
                        : clamp(1.292936 * pow(t - 60.0, -0.1332047), 0.0, 1.0);
    float g = t <= 66.0 ? clamp(0.3900816 * log(t) - 0.6318414, 0.0, 1.0)
                        : clamp(1.1298909 * pow(t - 60.0, -0.0755148), 0.0, 1.0);
    float b = t >= 66.0 ? 1.0
                        : (t <= 19.0 ? 0.0
                                     : clamp(0.5432068 * log(t - 10.0) - 1.1962540, 0.0, 1.0));
    return vec3(r, g, b);
}

vec3 stars(vec3 d) {
    vec2 sph = vec2(atan(d.x, -d.z), asin(clamp(d.y, -1.0, 1.0)));
    vec2 g   = sph * 40.0;
    vec2 id  = floor(g);
    float h  = hash21(id);
    if (h < 0.92) return vec3(0.0);
    vec2 f   = fract(g) - 0.5;
    vec2 off = (vec2(hash21(id + 17.3), hash21(id + 31.7)) - 0.5) * 0.7;
    float spark = smoothstep(0.10, 0.0, length(f - off));
    float tw    = 0.7 + 0.3 * sin(uTime * (0.5 + 2.0 * hash21(id + 5.1)) + 40.0 * h);
    vec3 tint   = mix(vec3(1.0, 0.82, 0.60), vec3(0.75, 0.85, 1.0), hash21(id + 2.9));
    return tint * spark * tw * ((h - 0.92) / 0.08);
}

// ------------------------------------------------------------- demo look --
struct DiskLook {
    float temp, incl, roll, inner, outer, opac, dopp, beam,
          gain, contr, wind, speed, expo, star;
};

const DiskLook LOOK_DEFAULT = DiskLook(
    DISK_TEMP, DISK_INCL, DISK_ROLL, DISK_INNER, DISK_OUTER, DISK_OPACITY,
    DOPPLER_MIX, DISK_BEAM, DISK_GAIN, DISK_CONTRAST, DISK_WIND, DISK_SPEED,
    EXPOSURE, STAR_GAIN);

#define DEMO_N 8
const DiskLook DEMO_TOUR[DEMO_N] = DiskLook[DEMO_N](
    DiskLook( 5500.0, 1.50,  0.35, 1.8,  8.0, 0.90, 0.60, 2.5, 2.2, 1.6, 7.0, 5.0, 1.40, 0.0),
    DiskLook( 4500.0, 1.52,  0.10, 2.2,  7.0, 0.85, 0.35, 2.0, 1.4, 0.5, 7.0, 5.0, 1.20, 0.0),
    DiskLook( 3800.0, 0.55, -0.30, 2.2,  6.0, 0.45, 0.90, 3.5, 1.6, 0.4, 3.0, 2.5, 1.10, 0.0),
    DiskLook( 6500.0, 0.30,  0.00, 3.0, 10.0, 0.50, 0.80, 2.5, 1.0, 1.1, 7.0, 5.0, 1.00, 0.0),
    DiskLook(15000.0, 1.30,  0.35, 3.0, 14.0, 0.35, 1.00, 4.0, 1.2, 1.3, 8.0, 5.0, 0.80, 0.0),
    DiskLook(18000.0, 1.05,  0.55, 3.0, 16.0, 0.30, 1.00, 5.0, 1.0, 1.5, 9.0, 6.0, 0.75, 0.0),
    DiskLook( 5500.0, 1.50,  0.35, 1.8,  8.0, 0.00, 1.00, 2.5, 0.0, 1.6, 7.0, 5.0, 1.00, 0.6),
    DiskLook( 5500.0, 1.50,  0.35, 1.8,  8.0, 0.90, 0.60, 2.5, 2.2, 1.6, 7.0, 5.0, 1.40, 0.0));

DiskLook mixLook(DiskLook a, DiskLook b, float f) {
    return DiskLook(
        mix(a.temp,  b.temp,  f), mix(a.incl,  b.incl,  f),
        mix(a.roll,  b.roll,  f), mix(a.inner, b.inner, f),
        mix(a.outer, b.outer, f), mix(a.opac,  b.opac,  f),
        mix(a.dopp,  b.dopp,  f), mix(a.beam,  b.beam,  f),
        mix(a.gain,  b.gain,  f), mix(a.contr, b.contr, f),
        mix(a.wind,  b.wind,  f), mix(a.speed, b.speed, f),
        mix(a.expo,  b.expo,  f), mix(a.star,  b.star,  f));
}

DiskLook demoLook() {
    float u = mod(uDemoTime, DEMO_SEC) / DEMO_SEC * float(DEMO_N);
    int   i = int(min(u, float(DEMO_N) - 0.001));
    float f = smoothstep(1.0 - DEMO_XFADE, 1.0, fract(u));
    return mixLook(DEMO_TOUR[i], DEMO_TOUR[(i + 1) % DEMO_N], f);
}

// ------------------------------------------------------------------- image --
void main() {
    vec2 uv = uViewportOrigin + vec2(vUv.x, 1.0 - vUv.y) * uViewportSize;
    vec2  res    = uResolution;
    float aspect = res.x / res.y;
    float t = uTime * DRIFT_SPEED;

    DiskLook L = LOOK_DEFAULT;
    if (uSizeMode == MODE_DEMO) L = demoLook();

    float rin  = max(L.inner, 1.6);
    float rout = max(L.outer, rin + 0.5);

    float I = uEffect.w;
    vec2 center = uEffect.xy;
    float rh = uEffect.z;
    float vis = smoothstep(0.0, 0.10, I);
    if (vis <= 0.0 || rh <= 0.0) { fragColor = vec4(0.0); return; }
    float dil = mix(1.0, DILATION_MIN, I);
    // Overlay model: the canvas is transparent except near the hole, so the
    // live Obsidian DOM shows through everywhere else. "shield" is the effect
    // coverage; we no longer gate it to a work-area band \u2014 the hole roams the
    // whole window.
    float shield = vis;

    vec2  p    = (uv - center) * vec2(aspect, 1.0);
    float plen = length(p);

    float W  = B_CRIT / max(rh, 1e-4);
    vec2  pr = rot(vec2(p.x, -p.y), L.roll) * W;
    float b  = length(pr);

    float window = exp(-pow(plen / (7.0 * rh), 2.0));
    float cover = window * shield;
    // Fade coordinates to identity BEFORE fading opacity. Blending displaced
    // text with live, undisplaced DOM draws two copies of every glyph.
    float warp = cover * smoothstep(0.04, 0.10, cover);
    float replacement = smoothstep(ALPHA_EPS, 0.03, cover);
    if (uCaptureEnabled != 0) {
        vec2 edge = min(uv - uCaptureRect.xy, uCaptureRect.xy + uCaptureRect.zw - uv) * res;
        float edgePx = min(edge.x, edge.y);
        warp *= smoothstep(8.0, 24.0, edgePx);
        replacement *= smoothstep(0.0, 4.0, edgePx);
    }
    if (cover < ALPHA_EPS) {
        fragColor = vec4(0.0);
        return;
    }

    float bmax = rout + 3.0;
    float Z0   = max(14.0, rout + 5.0);

    // far field
    if (b >= bmax) {
        vec3  term = vec3(0.0);
        float sampleAlpha = 0.0;
        if (uCaptureEnabled != 0) {
            float uu   = Z0 * inversesqrt(Z0 * Z0 + b * b);
            float defl = (2.0 / (W * W)) / max(plen, 1e-4)
                       * (1.29 * uu + 0.07) * max(LENS_DEPTH - 2.14 * uu + 0.75, 0.0)
                       * warp;
            vec2  dir  = p / max(plen, 1e-5);
            vec2  sp   = p - dir * defl;
            vec2  suv  = mirrorUV(center + sp / vec2(aspect, 1.0));
            vec4 sampleColor = lensSample(uv, suv);
            term = sampleColor.rgb;
            sampleAlpha = sampleColor.a;
        }
        vec3 sky = vec3(0.0);
        if (L.star > 0.0) {
            vec3 dd = normalize(vec3(-(pr / b) * (2.0 / b), -1.0));
            sky = stars(dd) * L.star * cover;
        }
        // straight-alpha overlay: coverage fades out away from the hole so the
        // live DOM shows through; near the hole we reveal the lensed sample.
        float a = clamp(max(replacement * sampleAlpha, max(sky.r, max(sky.g, sky.b))), 0.0, 1.0);
        fragColor = vec4(term + sky, a);
        return;
    }

    // near field: geodesic trace
    vec3  x  = vec3(pr, Z0);
    vec3  v  = vec3(0.0, 0.0, -1.0);
    float h2 = dot(pr, pr);

    float ci = cos(L.incl), si = sin(L.incl);
    vec3  n  = vec3(0.0, si, ci);
    vec3  e2 = vec3(0.0, ci, -si);
    float sdir = L.speed < 0.0 ? -1.0 : 1.0;
    float spd  = abs(L.speed);

    vec3  emitc = vec3(0.0);
    float trans = 1.0;
    bool  captured = false;
    float sPrev = dot(x, n);
    vec3  xPrev = x;

    for (int i = 0; i < N_STEPS; i++) {
        float r2 = dot(x, x);
        if (r2 < 1.0) { captured = true; break; }
        if (x.z < -Z0 && v.z < 0.0) break;
        if (r2 > 4.0 * Z0 * Z0) break;
        float r  = sqrt(r2);
        float dt = clamp(0.16 * r, 0.03, 1.5);
        vec3 a = -1.5 * h2 * x / (r2 * r2 * r);
        v += a * (0.5 * dt);
        x += v * dt;
        r2 = dot(x, x);
        r  = sqrt(r2);
        a  = -1.5 * h2 * x / (r2 * r2 * r);
        v += a * (0.5 * dt);

        float s = dot(x, n);
        if (s * sPrev < 0.0 && trans > 0.02) {
            float tc = sPrev / (sPrev - s);
            vec3  xc = mix(xPrev, x, tc);
            float rc = length(xc);
            if (rc > rin && rc < rout) {
                float band = smoothstep(rin, rin * 1.25, rc)
                           * (1.0 - smoothstep(rout * 0.70, rout, rc));
                float phi   = atan(dot(xc, e2), xc.x);
                float turns = phi / 6.2831853;
                float kep   = pow(rin / rc, 1.5);
                float gloc  = sqrt(max(1.0 - 1.5 / rc, 0.02));
                float swirl = rc * L.wind * 0.12 - t * kep * spd * gloc * dil * sdir;
                float streaks = vnoiseWrapY(vec2(rc * 2.8, turns * 19.0 + swirl * 3.0), 19.0) * 0.65 +
                                vnoiseWrapY(vec2(rc * 1.0, turns * 9.0  + swirl * 1.5 + 7.0), 9.0) * 0.35;
                streaks = 0.35 + L.contr * streaks * streaks;
                vec3  gasdir = normalize(cross(n, xc)) * sdir;
                float beta   = clamp(inversesqrt(max(2.0 * (rc - 1.0), 0.2)), 0.0, 0.99);
                float gg     = gloc / max(1.0 + beta * dot(gasdir, normalize(v)), 0.05);
                gg = mix(1.0, gg, L.dopp);
                float xpr   = max(1.0 - sqrt(rin / rc), 0.0);
                float tprof = pow(rin / rc, 0.75) * pow(xpr, 0.25) / 0.488;
                vec3  cbb   = blackbody(L.temp * tprof * gg);
                float boost = pow(gg, L.beam);
                float density = band * streaks;
                emitc += trans * cbb * (L.gain * 2.2 * density * tprof * tprof * boost);
                trans *= 1.0 - clamp(L.opac * density, 0.0, 1.0);
            }
        }
        sPrev = s;
        xPrev = x;
    }
    if (!captured && dot(x, x) < 4.0) captured = true;

    vec3 bg = vec3(0.0);
    // Even a ray that turns away from the captured plane must occlude the
    // original note. Otherwise the photon-ring region leaks unwarped glyphs.
    float sampleAlpha = uCaptureEnabled != 0 ? workspaceSample(uv).a : 0.0;
    if (!captured) {
        vec3 dd = normalize(v);
        if (L.star > 0.0) {
            bg += stars(dd) * L.star * cover;
        }
        if (uCaptureEnabled != 0 && dd.z < -0.05) {
            float tpl = (-LENS_DEPTH - x.z) / dd.z;
            vec3  hp  = x + dd * tpl;
            vec2  q   = rot(hp.xy, -L.roll) / W;
            vec2  sp  = vec2(q.x, -q.y);
            vec2  suv = mirrorUV(center + (p + (sp - p) * warp) / vec2(aspect, 1.0));
            float toward = smoothstep(0.05, 0.35, -dd.z);
            vec4 sampleColor = lensSample(uv, suv);
            sampleAlpha = max(sampleAlpha, sampleColor.a);
            bg += sampleColor.rgb * sampleColor.a * toward;
        }
    }

    vec3 emitRGB = vec3(1.0) - exp(-emitc * L.expo);
    float emitLum = max(emitRGB.r, max(emitRGB.g, emitRGB.b));
    vec3 col = bg * trans + emitRGB;
    // Coverage: opaque inside the shadow, bright where the disk emits, and the
    // lensing window elsewhere \u2014 transparent (live DOM) far from the hole.
    float a = captured ? 1.0 : clamp(max(replacement * sampleAlpha, max(emitLum, max(bg.r, max(bg.g, bg.b)))), 0.0, 1.0);
    fragColor = vec4(col, a);
}
`;
}

// src/renderer.ts
var POSITION_ATTRIB_LOCATION = 0;
var MODE_POMODORO = 0;
var MODE_DEMO = 2;
var DEMO_SEC = 42;
var DEMO_GROW_SEC = 40;
var B_CRIT = 2.5980762;
var EFFECT_ALPHA_CUTOFF = 0.01;
var MAX_RENDER_PIXELS = 2097152;
var MAX_RENDER_DIMENSION = 4096;
var MAX_DEVICE_PIXEL_RATIO = 2;
var VIEWPORT_PAD_PX = 24;
var VIEWPORT_SNAP_PX = 32;
var DEFAULT_FRAME_INTERVAL_MS = 1e3 / 60;
var SOFTWARE_FRAME_INTERVAL_MS = 1e3 / 10;
function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
function mix(a, b, t2) {
  return a + (b - a) * t2;
}
function smoothstep(edge0, edge1, value) {
  if (edge0 === edge1) return value < edge0 ? 0 : 1;
  const t2 = clamp((value - edge0) / (edge1 - edge0), 0, 1);
  return t2 * t2 * (3 - 2 * t2);
}
function positiveMod(value, mod) {
  return (value % mod + mod) % mod;
}
function lissa(t2) {
  return {
    x: 0.75 * Math.sin(t2 * 0.37) + 0.25 * Math.sin(t2 * 0.83 + 1),
    y: 0.7 * Math.sin(t2 * 0.54 + 2.1) + 0.3 * Math.sin(t2 * 1.07)
  };
}
var BlackHoleRenderer = class {
  constructor(canvas, params) {
    this.gl = null;
    this.program = null;
    this.vao = null;
    this.vertexBuffer = null;
    this.animId = 0;
    this.running = false;
    this.workspaceTex = null;
    this.demoStart = performance.now() / 1e3;
    this.gpuFence = null;
    this.fenceCreatedAt = 0;
    this.captureRect = { x: 0, y: 0, width: 1, height: 1 };
    // state
    this.tokenLevel = 0;
    this.prevTokenLevel = 0;
    this.lastTokenChange = 0;
    this.lastTokenLevel = 0;
    this.lastActivity = 0;
    this.sizeMode = 1;
    this.captureEnabled = false;
    // perf
    this.softwareRenderer = false;
    /** When true, auto-drop render scale if frames stay slow. */
    this.autoQuality = true;
    /** Requested fraction of display resolution; pixel and GPU budgets apply below. */
    this.renderScale = 1;
    this.qualityFactor = 1;
    this.minQualityFactor = 0.25;
    this.minRenderScale = 0.15;
    this.dtAvg = 0;
    // EMA of frame time (s)
    this.lastScaleAdjust = 0;
    // timestamp guard for auto-downscale
    this.prevTime = 0;
    this.nextDrawTime = 0;
    this.startTime = 0;
    this.frameIntervalMs = DEFAULT_FRAME_INTERVAL_MS;
    this.viewportRect = null;
    this.disposed = false;
    this.compileGeneration = 0;
    this.effectState = { x: 0.5, y: 0.5, radius: 0, intensity: 0 };
    this.onFatalError = null;
    this.lastError = "";
    this.onEffectFrame = null;
    this.contextLost = (event) => {
      event.preventDefault();
      this.stop();
      this.lastError = "WebGL context lost; toggle the effect to retry.";
      this.onFatalError?.(this.lastError);
    };
    this.loop = (now) => {
      if (!this.running || !this.gl || !this.program) return;
      this.animId = requestAnimationFrame(this.loop);
      if (now + 0.5 < this.nextDrawTime) return;
      if (this.gpuFence) {
        const gl = this.gl;
        const status = gl.clientWaitSync(this.gpuFence, 0, 0);
        if (status === gl.TIMEOUT_EXPIRED) {
          if (now - this.fenceCreatedAt > 2e3) {
            this.stop();
            this.onFatalError?.("GPU frame exceeded the 2s safety budget.");
          }
          return;
        }
        gl.deleteSync(this.gpuFence);
        this.gpuFence = null;
        if (status === gl.WAIT_FAILED) {
          this.stop();
          this.onFatalError?.("GPU frame synchronization failed.");
          return;
        }
      }
      try {
        this.renderFrame(now);
        this.nextDrawTime = this.nextDrawTime ? this.nextDrawTime + Math.max(1, Math.floor((now + 0.5 - this.nextDrawTime) / this.frameIntervalMs) + 1) * this.frameIntervalMs : now + this.frameIntervalMs;
      } catch (e) {
        console.error("BlackHole: render loop error \u2014 stopping renderer.", e);
        this.stop();
        this.onFatalError?.("Render loop failed.");
      }
    };
    this.canvas = canvas;
    this.params = { ...params };
    this.resizeObserver = new ResizeObserver(() => this.resize());
  }
  async init(options = {}) {
    const gl = this.canvas.getContext("webgl2", {
      alpha: true,
      premultipliedAlpha: false,
      antialias: false,
      preserveDrawingBuffer: false,
      // Ask the OS/Electron for the discrete/high-performance GPU rather than
      // an integrated or software fallback — the geodesic shader is heavy.
      powerPreference: "high-performance",
      // Normal compositor presentation retains the last image between draws;
      // low-latency desynchronized scanout can expose clears on some drivers.
      desynchronized: false
    });
    if (!gl) {
      this.lastError = "WebGL2 context unavailable.";
      return false;
    }
    this.gl = gl;
    this.canvas.addEventListener("webglcontextlost", this.contextLost);
    try {
      const dbg = gl.getExtension("WEBGL_debug_renderer_info");
      const rendererName = dbg ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL)) : "";
      console.info("BlackHole: WebGL renderer =", rendererName || "(unknown)");
      this.softwareRenderer = /swiftshader|llvmpipe|software|basic render/i.test(rendererName);
      if (this.softwareRenderer) {
        this.frameIntervalMs = SOFTWARE_FRAME_INTERVAL_MS;
        if (!options.allowSoftware) {
          this.lastError = "Software WebGL detected. Effect disabled to protect the editor; enable hardware acceleration and restart Obsidian.";
          console.warn("BlackHole:", this.lastError);
          return false;
        }
      }
    } catch {
    }
    if (!await this.buildProgram(this.params)) return false;
    if (this.disposed || this.gl !== gl || gl.isContextLost()) return false;
    this.vao = gl.createVertexArray();
    gl.bindVertexArray(this.vao);
    this.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    );
    gl.enableVertexAttribArray(POSITION_ATTRIB_LOCATION);
    gl.vertexAttribPointer(POSITION_ATTRIB_LOCATION, 2, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);
    this.workspaceTex = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.workspaceTex);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      1,
      1,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      new Uint8Array([0, 0, 0, 255])
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.uniform1i(this.uTexture, 0);
    gl.clearColor(0, 0, 0, 0);
    this.canvas.style.left = "0";
    this.canvas.style.top = "0";
    this.canvas.style.width = "1px";
    this.canvas.style.height = "1px";
    this.canvas.style.transform = "translate3d(0, 0, 0)";
    this.resize();
    this.resizeObserver.observe(this.canvas.parentElement ?? document.body);
    return true;
  }
  /** Recompile with new shader params (e.g. after settings change). */
  async recompile(params) {
    return this.buildProgram({ ...params });
  }
  start() {
    if (this.running || this.disposed || !this.program) return;
    this.running = true;
    this.prevTime = performance.now();
    this.dtAvg = 0;
    this.nextDrawTime = 0;
    this.startTime = this.prevTime;
    this.animId = requestAnimationFrame(this.loop);
  }
  stop() {
    this.running = false;
    if (this.animId) cancelAnimationFrame(this.animId);
    this.animId = 0;
  }
  /** Upload a captured workspace canvas to the texture. */
  updateTexture(captureCanvas, rect = { x: 0, y: 0, width: 1, height: 1 }) {
    if (!this.gl || !this.workspaceTex) return;
    const gl = this.gl;
    this.captureRect = { ...rect };
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.workspaceTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, captureCanvas);
  }
  resize() {
    if (!this.gl) return;
    this.viewportRect = null;
  }
  /** Request a backing-store scale change for the next complete draw. */
  setRenderScale(scale) {
    if (!Number.isFinite(scale)) return;
    const requested = Math.max(this.minRenderScale, Math.min(1, scale));
    if (requested !== this.renderScale) this.qualityFactor = 1;
    this.renderScale = requested;
  }
  getSize() {
    return { width: this.canvas.width, height: this.canvas.height };
  }
  destroy() {
    this.disposed = true;
    this.compileGeneration++;
    this.stop();
    this.canvas.removeEventListener("webglcontextlost", this.contextLost);
    this.resizeObserver.disconnect();
    const gl = this.gl;
    if (gl && this.gpuFence) gl.deleteSync(this.gpuFence);
    this.gpuFence = null;
    if (gl && this.program) gl.deleteProgram(this.program);
    if (gl && this.vao) gl.deleteVertexArray(this.vao);
    if (gl && this.vertexBuffer) gl.deleteBuffer(this.vertexBuffer);
    if (gl && this.workspaceTex) gl.deleteTexture(this.workspaceTex);
    this.program = null;
    this.vao = null;
    this.vertexBuffer = null;
    this.workspaceTex = null;
    this.gl = null;
    this.onEffectFrame = null;
  }
  // ---- internal ----
  async buildProgram(params) {
    const gl = this.gl;
    if (!gl || this.disposed) return false;
    const generation = ++this.compileGeneration;
    const vs = gl.createShader(gl.VERTEX_SHADER);
    const fs = gl.createShader(gl.FRAGMENT_SHADER);
    const prog = gl.createProgram();
    if (!vs || !fs || !prog) {
      if (vs) gl.deleteShader(vs);
      if (fs) gl.deleteShader(fs);
      if (prog) gl.deleteProgram(prog);
      this.lastError = "Unable to allocate WebGL program.";
      return false;
    }
    let accepted = false;
    try {
      gl.shaderSource(vs, VS);
      gl.shaderSource(fs, makeFS(params));
      gl.compileShader(vs);
      gl.compileShader(fs);
      gl.attachShader(prog, vs);
      gl.attachShader(prog, fs);
      gl.bindAttribLocation(prog, POSITION_ATTRIB_LOCATION, "aPos");
      gl.linkProgram(prog);
      const parallel = gl.getExtension("KHR_parallel_shader_compile");
      const deadline = performance.now() + 5e3;
      if (parallel) {
        while (!gl.getProgramParameter(prog, parallel.COMPLETION_STATUS_KHR)) {
          if (this.disposed || generation !== this.compileGeneration || gl.isContextLost()) return false;
          if (performance.now() > deadline) throw new Error("Shader compilation exceeded 5s budget.");
          await new Promise((resolve) => setTimeout(resolve, 16));
        }
      } else {
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
      if (this.disposed || generation !== this.compileGeneration || gl.isContextLost()) return false;
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        throw new Error(gl.getProgramInfoLog(prog) || gl.getShaderInfoLog(fs) || "Shader link failed");
      }
      const oldProgram = this.program;
      this.program = prog;
      this.params = params;
      gl.useProgram(prog);
      if (oldProgram) gl.deleteProgram(oldProgram);
      accepted = true;
      this.uResolution = gl.getUniformLocation(prog, "uResolution");
      this.uTime = gl.getUniformLocation(prog, "uTime");
      this.uDemoTime = gl.getUniformLocation(prog, "uDemoTime");
      this.uTexture = gl.getUniformLocation(prog, "uTexture");
      this.uCaptureRect = gl.getUniformLocation(prog, "uCaptureRect");
      this.uSizeMode = gl.getUniformLocation(prog, "uSizeMode");
      this.uCaptureEnabled = gl.getUniformLocation(prog, "uCaptureEnabled");
      this.uViewportOrigin = gl.getUniformLocation(prog, "uViewportOrigin");
      this.uViewportSize = gl.getUniformLocation(prog, "uViewportSize");
      this.uEffect = gl.getUniformLocation(prog, "uEffect");
      return true;
    } catch (error) {
      this.lastError = String(error);
      console.error("BlackHole: shader build failed", error);
      return false;
    } finally {
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      if (!accepted) gl.deleteProgram(prog);
    }
  }
  renderFrame(now) {
    const gl = this.gl;
    const dt = Math.min((now - this.prevTime) / 1e3, 1);
    this.prevTime = now;
    const targetSeconds = this.frameIntervalMs / 1e3;
    this.dtAvg = this.dtAvg ? this.dtAvg * 0.9 + dt * 0.1 : dt;
    if (this.autoQuality && this.viewportRect && now - this.startTime > 3e3 && this.dtAvg > Math.max(0.05, targetSeconds * 1.8) && now - this.lastScaleAdjust > 2e3) {
      this.lastScaleAdjust = now;
      if (this.qualityFactor > this.minQualityFactor) {
        this.qualityFactor = Math.max(this.minQualityFactor, this.qualityFactor * 0.8);
      } else {
        this.stop();
        this.onFatalError?.("Rendering exceeded the frame budget at minimum quality.");
        return;
      }
      this.dtAvg = targetSeconds;
    }
    if (this.lastTokenLevel !== this.tokenLevel) {
      const current = this.glidedToken(now / 1e3, this.lastTokenLevel);
      this.prevTokenLevel = current;
      this.lastTokenLevel = this.tokenLevel;
      this.lastTokenChange = now / 1e3;
    }
    gl.useProgram(this.program);
    const d = /* @__PURE__ */ new Date();
    const viewportSize = this.getViewportSize();
    if (!viewportSize) {
      this.hideCanvas();
      return;
    }
    const bounds = this.computeEffectBounds(now / 1e3, d, viewportSize.width, viewportSize.height);
    if (!bounds) {
      this.hideCanvas();
      return;
    }
    const viewportRect = this.ensureViewportRect(bounds, viewportSize.width, viewportSize.height);
    this.updateViewportRect(viewportRect);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform2f(this.uResolution, viewportSize.width, viewportSize.height);
    gl.uniform2f(
      this.uViewportOrigin,
      viewportRect.x / viewportSize.width,
      viewportRect.y / viewportSize.height
    );
    gl.uniform2f(
      this.uViewportSize,
      viewportRect.width / viewportSize.width,
      viewportRect.height / viewportSize.height
    );
    gl.uniform1f(this.uTime, this.sizeMode === MODE_DEMO ? Math.max(0, now / 1e3 - this.demoStart) : now / 1e3);
    gl.uniform1f(this.uDemoTime, Math.max(0, now / 1e3 - this.demoStart));
    gl.uniform1i(this.uSizeMode, this.sizeMode);
    gl.uniform1i(this.uCaptureEnabled, this.captureEnabled ? 1 : 0);
    gl.uniform4f(
      this.uCaptureRect,
      this.captureRect.x,
      this.captureRect.y,
      this.captureRect.width,
      this.captureRect.height
    );
    gl.uniform4f(
      this.uEffect,
      this.effectState.x,
      this.effectState.y,
      this.effectState.radius,
      this.effectState.intensity
    );
    gl.bindVertexArray(this.vao);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.bindVertexArray(null);
    if (this.gpuFence) gl.deleteSync(this.gpuFence);
    this.gpuFence = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    this.fenceCreatedAt = now;
    gl.flush();
    this.onEffectFrame?.({
      x: this.effectState.x * viewportSize.width,
      y: this.effectState.y * viewportSize.height,
      radius: this.effectState.radius * viewportSize.height,
      intensity: this.effectState.intensity,
      width: viewportSize.width,
      height: viewportSize.height,
      depth: this.params.lensDepth
    });
  }
  computeEffectBounds(nowSec, date, viewportWidth, viewportHeight) {
    const p = this.params;
    const aspect = viewportWidth / viewportHeight;
    const holeRadius = Math.max(p.holeRadius, 1e-4);
    let intensity = 0;
    let size = 0;
    let center;
    if (this.sizeMode === MODE_POMODORO) {
      const workSec = p.workPeriodMin * 60;
      const cycleSec = workSec + p.breakMin * 60;
      const wall = date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds();
      const phase = positiveMod(wall, cycleSec);
      const collapse = Math.min(60, workSec * 0.15);
      const grow = clamp(phase / workSec, 0, 1) * (1 - smoothstep(workSec - collapse, workSec, phase));
      intensity = mix(0.12, 1, grow);
      const idle = Math.max(0, nowSec - this.lastActivity);
      intensity *= 1 - smoothstep(
        p.idleFadeSec,
        Math.max(p.breakMin * 60, p.idleFadeSec + 1),
        idle
      );
      size = mix(0.22, 1, intensity);
      const diskOuter = Math.max(p.diskOuter, Math.max(p.diskInner, 1.6) + 0.5);
      const ext = diskOuter / B_CRIT * holeRadius * size;
      const yLo = p.workArea + 0.12 + ext;
      const yHi = Math.max(yLo, 0.9 - ext);
      const speed = mix(0.35, 1, intensity);
      const t2 = nowSec * p.driftSpeed;
      center = {
        x: 0.5 + (0.24 * Math.sin(t2 * 0.21) + 0.05 * Math.sin(t2 * 0.083)) * speed,
        y: 1 - mix(
          yLo,
          yHi,
          0.5 + (0.42 * Math.sin(t2 * 0.157 + 2) + 0.08 * Math.sin(t2 * 0.117)) * speed
        )
      };
      center = {
        x: center.x + intensity * (0.04 * Math.sin(t2 * 0.83) + 0.02 * Math.sin(t2 * 1.31)),
        y: center.y + intensity * (0.03 * Math.sin(t2 * 1.03 + 1))
      };
    } else {
      const level = this.sizeMode === MODE_DEMO ? Math.min(positiveMod(Math.max(0, nowSec - this.demoStart), DEMO_SEC) / DEMO_GROW_SEC, 1) : this.glidedToken(nowSec);
      if (level < 0) return null;
      const g = Math.pow(clamp(level, 0, 1), p.tokenEase);
      intensity = mix(0.1, 1, g);
      const rhMin = Math.sqrt(p.tokenAreaMin * aspect / Math.PI);
      const rhMax = Math.sqrt(p.tokenAreaMax * aspect / Math.PI);
      const rhT = mix(rhMin, rhMax, g) * (holeRadius / 0.08);
      size = rhT / holeRadius;
      const margin = Math.min(rhT * mix(1.45, 0.9, g), 0.5 * (1 - p.workArea - 0.03));
      const xPad = margin / aspect;
      const fullLo = { x: Math.min(xPad, 0.5), y: margin };
      const fullHi = {
        x: Math.max(0.5, 1 - xPad),
        y: Math.max(margin, 1 - (p.workArea + 0.03 + margin))
      };
      const corner = {
        x: clamp(p.tokenHomeX, fullLo.x, fullHi.x),
        y: clamp(p.tokenHomeY, fullLo.y, fullHi.y)
      };
      const reach = mix(0.06, Math.max(p.tokenReach, 0.06), g);
      const lo = { x: mix(corner.x, fullLo.x, reach), y: fullLo.y };
      const hi = { x: fullHi.x, y: mix(corner.y, fullHi.y, reach) };
      const room = {
        x: Math.max((hi.x - lo.x) * 0.5, 0),
        y: Math.max((hi.y - lo.y) * 0.5, 0)
      };
      const wobble = {
        x: Math.min(0.01 + 0.03 * g, Math.max(room.x * 0.35, 6e-3)),
        y: Math.min(0.01 + 0.03 * g, Math.max(room.y * 0.35, 6e-3))
      };
      const amplitude = {
        x: Math.max(room.x - wobble.x, 0),
        y: Math.max(room.y - wobble.y, 0)
      };
      const t2 = (this.sizeMode === MODE_DEMO ? Math.max(0, nowSec - this.demoStart) : nowSec) * p.driftSpeed;
      const calm = lissa(t2 * p.tokenCalm);
      const rush = lissa(t2 * p.tokenRush);
      const wander = {
        x: mix(calm.x, rush.x, g),
        y: mix(calm.y, rush.y, g)
      };
      center = {
        x: (lo.x + hi.x) * 0.5 + wander.x * amplitude.x + wobble.x * Math.cos(t2 * 0.8),
        y: (lo.y + hi.y) * 0.5 + wander.y * amplitude.y + wobble.y * Math.sin(t2 * 1)
      };
    }
    const shield = smoothstep(0, 0.1, intensity);
    if (shield <= 0) return null;
    const rh = holeRadius * size;
    this.effectState = { x: center.x, y: center.y, radius: rh, intensity };
    const effectRadius = Math.max(
      rh * 3,
      7 * rh * Math.sqrt(-Math.log(EFFECT_ALPHA_CUTOFF / Math.max(shield, EFFECT_ALPHA_CUTOFF)))
    ) + rh * 2;
    const radiusX = effectRadius / Math.max(aspect, 1e-4);
    const radiusY = effectRadius;
    const x0 = clamp(Math.floor((center.x - radiusX) * viewportWidth), 0, viewportWidth);
    const x1 = clamp(Math.ceil((center.x + radiusX) * viewportWidth), 0, viewportWidth);
    const y0 = clamp(Math.floor((center.y - radiusY) * viewportHeight), 0, viewportHeight);
    const y1 = clamp(Math.ceil((center.y + radiusY) * viewportHeight), 0, viewportHeight);
    if (x1 <= x0 || y1 <= y0) return null;
    return { x: x0, y: y0, width: x1 - x0, height: y1 - y0 };
  }
  getViewportSize() {
    const parent = this.canvas.parentElement;
    if (!parent) return null;
    const doc = this.canvas.ownerDocument;
    const viewport = parent === doc?.body ? doc.defaultView : null;
    const width = viewport?.innerWidth ?? parent.clientWidth;
    const height = viewport?.innerHeight ?? parent.clientHeight;
    if (width === 0 || height === 0) return null;
    return { width, height };
  }
  ensureViewportRect(bounds, viewportWidth, viewportHeight) {
    const prev = this.viewportRect;
    if (prev && prev.x <= bounds.x && prev.y <= bounds.y && prev.x + prev.width >= bounds.x + bounds.width && prev.y + prev.height >= bounds.y + bounds.height && prev.x + prev.width <= viewportWidth && prev.y + prev.height <= viewportHeight) return prev;
    const width = Math.min(viewportWidth, Math.max(
      prev?.width ?? 0,
      Math.ceil((bounds.width + VIEWPORT_PAD_PX * 2) / VIEWPORT_SNAP_PX) * VIEWPORT_SNAP_PX
    ));
    const height = Math.min(viewportHeight, Math.max(
      prev?.height ?? 0,
      Math.ceil((bounds.height + VIEWPORT_PAD_PX * 2) / VIEWPORT_SNAP_PX) * VIEWPORT_SNAP_PX
    ));
    const next = {
      x: clamp(Math.floor(bounds.x + bounds.width / 2 - width / 2), 0, viewportWidth - width),
      y: clamp(Math.floor(bounds.y + bounds.height / 2 - height / 2), 0, viewportHeight - height),
      width,
      height
    };
    this.viewportRect = next;
    return next;
  }
  updateViewportRect(rect) {
    if (!this.gl) return;
    const rawDpr = this.canvas.ownerDocument?.defaultView?.devicePixelRatio ?? 1;
    const dpr = Number.isFinite(rawDpr) ? clamp(rawDpr, 1, MAX_DEVICE_PIXEL_RATIO) : 1;
    const requestedScale = clamp(this.renderScale, this.minRenderScale, 1) * dpr;
    const renderScale = Math.min(
      requestedScale,
      Math.sqrt(MAX_RENDER_PIXELS / (rect.width * rect.height)),
      MAX_RENDER_DIMENSION / rect.width,
      MAX_RENDER_DIMENSION / rect.height
    ) * this.qualityFactor;
    const backingWidth = Math.max(1, Math.floor(rect.width * renderScale));
    const backingHeight = Math.max(1, Math.floor(rect.height * renderScale));
    if (this.canvas.width !== backingWidth || this.canvas.height !== backingHeight) {
      this.canvas.width = backingWidth;
      this.canvas.height = backingHeight;
      this.gl.viewport(0, 0, backingWidth, backingHeight);
    }
    rect.x = Math.round(rect.x * backingWidth / rect.width) * rect.width / backingWidth;
    rect.y = Math.round(rect.y * backingHeight / rect.height) * rect.height / backingHeight;
    this.canvas.style.visibility = "visible";
    this.canvas.style.width = `${rect.width}px`;
    this.canvas.style.height = `${rect.height}px`;
    this.canvas.style.transform = `translate3d(${rect.x}px, ${rect.y}px, 0)`;
  }
  hideCanvas() {
    this.viewportRect = null;
    this.canvas.style.visibility = "hidden";
    this.onEffectFrame?.(null);
  }
  glidedToken(nowSec, cur = this.tokenLevel) {
    const prev = this.prevTokenLevel;
    if (cur < 0) return -1;
    if (prev < 0) return cur;
    const duration = clamp(
      Math.abs(cur - prev) * this.params.tokenGlideRate,
      this.params.tokenGlideMin,
      this.params.tokenGlideMax
    );
    return mix(prev, cur, smoothstep(0, duration, nowSec - this.lastTokenChange));
  }
};

// src/backdrop.ts
var SVG_NS = "http://www.w3.org/2000/svg";
var MAP_SIZE = 128;
var MAX_FILTER_PIXELS = 1048576;
var nextId = 0;
function displacementMap(size = MAP_SIZE) {
  const data = new Uint8ClampedArray(size * size * 4);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const nx = (x + 0.5) / size * 2 - 1, ny = (y + 0.5) / size * 2 - 1;
    const r2 = nx * nx + ny * ny;
    const weight = r2 < 1 ? (1 - r2) ** 2 : 0;
    const i = (y * size + x) * 4;
    data[i] = Math.round(128 - 127 * nx * weight);
    data[i + 1] = Math.round(128 - 127 * ny * weight);
    data[i + 2] = 128;
    data[i + 3] = 255;
  }
  return data;
}
function lensGeometry(frame, note, dpr) {
  if (![
    frame.x,
    frame.y,
    frame.radius,
    frame.intensity,
    frame.depth,
    note.left,
    note.top,
    note.right,
    note.bottom
  ].every(Number.isFinite)) return null;
  if (frame.radius <= 0 || frame.intensity <= 0 || frame.depth <= 0) return null;
  if (frame.x <= note.left + 2 || frame.x >= note.right - 2 || frame.y <= note.top + 2 || frame.y >= note.bottom - 2) return null;
  const pixelRatio = Number.isFinite(dpr) ? Math.max(1, dpr) : 1;
  const radius = Math.min(frame.radius * 6, Math.sqrt(MAX_FILTER_PIXELS) / (2 * pixelRatio));
  if (radius < 2) return null;
  const left = Math.max(note.left + 1, frame.x - radius);
  const top = Math.max(note.top + 1, frame.y - radius);
  const right = Math.min(note.right - 1, frame.x + radius);
  const bottom = Math.min(note.bottom - 1, frame.y + radius);
  if (right <= left || bottom <= top) return null;
  return {
    left,
    top,
    width: right - left,
    height: bottom - top,
    mapX: frame.x - radius - left,
    mapY: frame.y - radius - top,
    diameter: radius * 2,
    scale: radius * Math.min(1.6, frame.depth / 13 * 0.9) * Math.min(1, frame.intensity / 0.1)
  };
}
var BackdropLens = class {
  constructor(host) {
    this.host = host;
    this.target = null;
    this.suspended = true;
    this.enabled = false;
    this.disposed = false;
    this.lastFrame = null;
    this.geometryKey = "";
    const doc = host.ownerDocument;
    this.supported = !!doc.defaultView?.CSS?.supports("backdrop-filter", "url(#blackhole-probe)");
    const make = (tag) => doc.createElementNS(SVG_NS, tag);
    this.layer = doc.createElement("div");
    this.layer.className = "blackhole-backdrop";
    this.layer.setAttribute("aria-hidden", "true");
    this.layer.style.display = "none";
    this.svg = make("svg");
    this.svg.setAttribute("width", "0");
    this.svg.setAttribute("height", "0");
    this.svg.style.position = "absolute";
    this.svg.setAttribute("aria-hidden", "true");
    this.svg.classList.add("blackhole-filter-defs");
    this.filter = make("filter");
    this.filter.id = `blackhole-lens-${++nextId}`;
    this.filter.setAttribute("filterUnits", "userSpaceOnUse");
    this.filter.setAttribute("primitiveUnits", "userSpaceOnUse");
    this.filter.setAttribute("color-interpolation-filters", "sRGB");
    this.filter.setAttribute("x", "0");
    this.filter.setAttribute("y", "0");
    this.image = make("feImage");
    this.image.setAttribute("result", "encoded-map");
    this.image.setAttribute("preserveAspectRatio", "none");
    const transfer = make("feComponentTransfer");
    transfer.setAttribute("in", "encoded-map");
    transfer.setAttribute("result", "map");
    for (const tag of ["feFuncR", "feFuncG"]) {
      const fn = make(tag);
      fn.setAttribute("type", "linear");
      fn.setAttribute("slope", String(255 / 254));
      fn.setAttribute("intercept", String(-1 / 254));
      transfer.appendChild(fn);
    }
    this.displacement = make("feDisplacementMap");
    this.displacement.setAttribute("in", "SourceGraphic");
    this.displacement.setAttribute("in2", "map");
    this.displacement.setAttribute("xChannelSelector", "R");
    this.displacement.setAttribute("yChannelSelector", "G");
    this.filter.append(this.image, transfer, this.displacement);
    this.svg.appendChild(this.filter);
    if (this.supported) {
      const canvas = doc.createElement("canvas");
      canvas.width = canvas.height = MAP_SIZE;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Unable to create lens displacement map");
      const pixels = ctx.createImageData(MAP_SIZE, MAP_SIZE);
      pixels.data.set(displacementMap());
      ctx.putImageData(pixels, 0, 0);
      this.image.setAttribute("href", canvas.toDataURL("image/png"));
      this.layer.style.backdropFilter = `url(#${this.filter.id})`;
      host.append(this.svg, this.layer);
    }
  }
  setTarget(target) {
    this.target = target?.ownerDocument === this.host.ownerDocument ? target : null;
    this.hide();
  }
  setEnabled(enabled) {
    this.enabled = enabled;
    if (!enabled) this.hide();
  }
  setSuspended(suspended) {
    this.suspended = suspended;
    if (suspended) this.hide();
  }
  hide() {
    this.layer.style.display = "none";
  }
  update(frame) {
    this.lastFrame = frame;
    if (this.disposed || !this.supported || !this.enabled || this.suspended || !frame || !this.target?.isConnected || this.target.getClientRects().length === 0) {
      this.hide();
      return;
    }
    const view = this.host.ownerDocument.defaultView;
    const rect = this.target.getBoundingClientRect();
    const note = {
      left: Math.max(0, rect.left),
      top: Math.max(0, rect.top),
      right: Math.min(view.innerWidth, rect.right),
      bottom: Math.min(view.innerHeight, rect.bottom)
    };
    const geometry = lensGeometry(frame, note, view.devicePixelRatio);
    if (!geometry) {
      this.hide();
      return;
    }
    const g = geometry;
    const key = [g.left, g.top, g.width, g.height, g.mapX, g.mapY, g.diameter, g.scale].join(",");
    if (key === this.geometryKey) {
      this.layer.style.display = "block";
      return;
    }
    this.geometryKey = key;
    this.layer.style.left = `${g.left}px`;
    this.layer.style.top = `${g.top}px`;
    this.layer.style.width = `${g.width}px`;
    this.layer.style.height = `${g.height}px`;
    this.filter.setAttribute("width", String(g.width));
    this.filter.setAttribute("height", String(g.height));
    this.image.setAttribute("x", String(g.mapX));
    this.image.setAttribute("y", String(g.mapY));
    this.image.setAttribute("width", String(g.diameter));
    this.image.setAttribute("height", String(g.diameter));
    this.displacement.setAttribute("scale", String(g.scale));
    this.layer.style.display = "block";
  }
  refresh() {
    this.update(this.lastFrame);
  }
  destroy() {
    this.disposed = true;
    this.target = null;
    this.lastFrame = null;
    this.layer.remove();
    this.svg.remove();
  }
};

// src/i18n.ts
var translations = {
  en: {
    "ribbon.toggle": "Toggle Black Hole",
    "notice.enabled": "Black hole ON",
    "notice.disabled": "Black hole OFF",
    "notice.startFailed": "Black Hole failed to start \u2014 see console for details.",
    "notice.requireWebgl2": "Black Hole plugin requires WebGL2",
    "notice.softwareUnsupported": "Hardware acceleration required. Animation stopped.",
    "notice.lensUnsupported": "Live text lens is not supported here.",
    "notice.captureComplex": "Legacy capture: note exceeds the limit.",
    "notice.captureLayout": "Legacy capture: layout stayed busy.",
    "notice.captureSlow": "Legacy capture: time limit exceeded.",
    "notice.captureFailed": "Legacy capture: repeated failure.",
    "settings.reset.name": "Reset settings",
    "settings.reset.desc": "Reset animation settings.",
    "settings.reset.button": "Reset",
    "settings.title": "Black Hole Settings",
    "settings.general": "General",
    "settings.language.name": "Language",
    "settings.language.desc": "",
    "settings.language.auto": "Auto",
    "settings.language.en": "English",
    "settings.language.zh-CN": "Simplified Chinese",
    "settings.playback": "Playback",
    "settings.idleOnly.name": "Idle-Only Playback",
    "settings.idleOnly.desc": "Pause when you resume typing or scrolling.",
    "settings.idleDelay.name": "Idle Start Delay (sec)",
    "settings.idleDelay.desc": "Wait this long after your last input.",
    "settings.mode.name": "Size Mode",
    "settings.mode.desc": "Choose how the black hole grows.",
    "settings.mode.pomodoro": "Pomodoro",
    "settings.mode.token": "Word count",
    "settings.mode.demo": "Demo (42-second loop)",
    "settings.tokenMetric.name": "Token Metric",
    "settings.tokenMetric.desc": "Controls size in Word count mode.",
    "settings.tokenMetric.word": "Current note word count",
    "settings.tokenMetric.global": "Estimated vault word count (500 per Markdown file)",
    "settings.tokenMetric.file": "Vault file count",
    "settings.tokenMetric.tab": "Open tab count",
    "settings.maxWordCount.name": "Max Word Count",
    "settings.maxWordCount.desc": "Word count for full size.",
    "settings.section.pomodoro": "Pomodoro",
    "settings.workPeriod.name": "Work Period (min)",
    "settings.break.name": "Break (min)",
    "settings.idleFade.name": "Idle Fade (sec)",
    "settings.idleFade.desc": "Start shrinking after this idle time.",
    "settings.section.hole": "Hole & Lensing",
    "settings.holeRadius.name": "Hole Radius",
    "settings.lensDepth.name": "Lens Depth",
    "settings.starGain.name": "Star Gain",
    "settings.section.disk": "Accretion Disk",
    "settings.diskInner.name": "Disk Inner",
    "settings.diskOuter.name": "Disk Outer",
    "settings.diskIncl.name": "Inclination",
    "settings.diskRoll.name": "Roll",
    "settings.diskGain.name": "Gain",
    "settings.diskOpacity.name": "Opacity",
    "settings.diskTemp.name": "Temperature (K)",
    "settings.dopplerMix.name": "Doppler Mix",
    "settings.diskBeam.name": "Beaming",
    "settings.section.performance": "Performance",
    "settings.nSteps.name": "Integration Steps",
    "settings.nSteps.desc": "Higher is more accurate, but slower.",
    "settings.renderScale.name": "Resolution",
    "settings.renderScale.desc": "Higher is sharper and uses more GPU.",
    "settings.captureEnabled.name": "Text lens",
    "settings.captureEnabled.desc": "Live SVG backdrop lens. No screenshots; uses GPU.",
    "settings.tokenAreaMax.name": "Token Area Max (\xD71e-3)"
  },
  "zh-CN": {
    "ribbon.toggle": "\u5207\u6362\u9ED1\u6D1E",
    "notice.enabled": "\u9ED1\u6D1E\u5DF2\u5F00\u542F",
    "notice.disabled": "\u9ED1\u6D1E\u5DF2\u5173\u95ED",
    "notice.startFailed": "\u9ED1\u6D1E\u63D2\u4EF6\u542F\u52A8\u5931\u8D25\uFF0C\u8BF7\u67E5\u770B\u63A7\u5236\u53F0\u65E5\u5FD7\u3002",
    "notice.requireWebgl2": "\u9ED1\u6D1E\u63D2\u4EF6\u9700\u8981 WebGL2 \u624D\u80FD\u8FD0\u884C",
    "notice.softwareUnsupported": "\u9700\u8981\u786C\u4EF6\u52A0\u901F\uFF0C\u52A8\u753B\u5DF2\u505C\u6B62\u3002",
    "notice.lensUnsupported": "\u5F53\u524D\u73AF\u5883\u4E0D\u652F\u6301\u5B9E\u65F6\u6587\u5B57\u900F\u955C\u3002",
    "notice.captureComplex": "\u65E7\u7248\u622A\u56FE\u8BCA\u65AD\uFF1A\u7B14\u8BB0\u8D85\u51FA\u5BB9\u91CF\u3002",
    "notice.captureLayout": "\u65E7\u7248\u622A\u56FE\u8BCA\u65AD\uFF1A\u5E03\u5C40\u4ECD\u7E41\u5FD9\u3002",
    "notice.captureSlow": "\u65E7\u7248\u622A\u56FE\u8BCA\u65AD\uFF1A\u8017\u65F6\u8D85\u9650\u3002",
    "notice.captureFailed": "\u65E7\u7248\u622A\u56FE\u8BCA\u65AD\uFF1A\u8FDE\u7EED\u5931\u8D25\u3002",
    "settings.reset.name": "\u6062\u590D\u9ED8\u8BA4",
    "settings.reset.desc": "\u91CD\u7F6E\u52A8\u753B\u53C2\u6570\u3002",
    "settings.reset.button": "\u6062\u590D\u9ED8\u8BA4",
    "settings.title": "\u9ED1\u6D1E\u8BBE\u7F6E",
    "settings.general": "\u901A\u7528",
    "settings.language.name": "\u8BED\u8A00",
    "settings.language.desc": "",
    "settings.language.auto": "\u81EA\u52A8",
    "settings.language.en": "\u82F1\u6587",
    "settings.language.zh-CN": "\u7B80\u4F53\u4E2D\u6587",
    "settings.playback": "\u64AD\u653E\u63A7\u5236",
    "settings.idleOnly.name": "\u4EC5\u5728\u95F2\u7F6E\u65F6\u64AD\u653E",
    "settings.idleOnly.desc": "\u8F93\u5165\u6216\u6EDA\u52A8\u65F6\u6682\u505C\u3002",
    "settings.idleDelay.name": "\u95F2\u7F6E\u542F\u52A8\u5EF6\u65F6\uFF08\u79D2\uFF09",
    "settings.idleDelay.desc": "\u505C\u6B62\u64CD\u4F5C\u540E\u7B49\u5F85\u7684\u65F6\u95F4\u3002",
    "settings.mode.name": "\u5C3A\u5BF8\u6A21\u5F0F",
    "settings.mode.desc": "\u9009\u62E9\u9ED1\u6D1E\u7684\u589E\u957F\u65B9\u5F0F\u3002",
    "settings.mode.pomodoro": "\u756A\u8304\u949F",
    "settings.mode.token": "\u5B57\u6570",
    "settings.mode.demo": "\u6F14\u793A\uFF0842 \u79D2\u5FAA\u73AF\uFF09",
    "settings.tokenMetric.name": "\u5B57\u6570\u6307\u6807",
    "settings.tokenMetric.desc": "\u5B57\u6570\u6A21\u5F0F\u4E0B\u7684\u5927\u5C0F\u4F9D\u636E\u3002",
    "settings.tokenMetric.word": "\u5F53\u524D\u7B14\u8BB0\u5B57\u6570",
    "settings.tokenMetric.global": "\u6574\u4E2A\u4ED3\u5E93\u4F30\u7B97\u5B57\u6570",
    "settings.tokenMetric.file": "\u4ED3\u5E93\u6587\u4EF6\u6570",
    "settings.tokenMetric.tab": "\u5DF2\u6253\u5F00\u6807\u7B7E\u6570",
    "settings.maxWordCount.name": "\u6700\u5927\u5B57\u6570",
    "settings.maxWordCount.desc": "\u8FBE\u5230\u6B64\u5B57\u6570\u65F6\u6700\u5927\u3002",
    "settings.section.pomodoro": "\u756A\u8304\u949F",
    "settings.workPeriod.name": "\u5DE5\u4F5C\u65F6\u957F\uFF08\u5206\u949F\uFF09",
    "settings.break.name": "\u4F11\u606F\u65F6\u957F\uFF08\u5206\u949F\uFF09",
    "settings.idleFade.name": "\u7A7A\u95F2\u6DE1\u51FA\uFF08\u79D2\uFF09",
    "settings.idleFade.desc": "\u95F2\u7F6E\u591A\u4E45\u540E\u5F00\u59CB\u7F29\u5C0F\u3002",
    "settings.section.hole": "\u9ED1\u6D1E\u4E0E\u5F15\u529B\u900F\u955C",
    "settings.holeRadius.name": "\u9ED1\u6D1E\u534A\u5F84",
    "settings.lensDepth.name": "\u900F\u955C\u6DF1\u5EA6",
    "settings.starGain.name": "\u661F\u573A\u5F3A\u5EA6",
    "settings.section.disk": "\u5438\u79EF\u76D8",
    "settings.diskInner.name": "\u5185\u534A\u5F84",
    "settings.diskOuter.name": "\u5916\u534A\u5F84",
    "settings.diskIncl.name": "\u503E\u89D2",
    "settings.diskRoll.name": "\u6EDA\u8F6C",
    "settings.diskGain.name": "\u589E\u76CA",
    "settings.diskOpacity.name": "\u900F\u660E\u5EA6",
    "settings.diskTemp.name": "\u6E29\u5EA6\uFF08K\uFF09",
    "settings.dopplerMix.name": "\u591A\u666E\u52D2\u6DF7\u5408",
    "settings.diskBeam.name": "\u675F\u5C04\u5F3A\u5EA6",
    "settings.section.performance": "\u6027\u80FD",
    "settings.nSteps.name": "\u79EF\u5206\u6B65\u6570",
    "settings.nSteps.desc": "\u8D8A\u9AD8\u8D8A\u7CBE\u786E\uFF0C\u4E5F\u8D8A\u6162\u3002",
    "settings.renderScale.name": "\u5206\u8FA8\u7387",
    "settings.renderScale.desc": "\u8D8A\u9AD8\u8D8A\u6E05\u6670\uFF0C\u4E5F\u66F4\u5360 GPU\u3002",
    "settings.captureEnabled.name": "\u6587\u5B57\u626D\u66F2",
    "settings.captureEnabled.desc": "SVG \u5B9E\u65F6\u80CC\u666F\u900F\u955C\u3002\u4E0D\u622A\u56FE\uFF0C\u5360\u7528 GPU\u3002",
    "settings.tokenAreaMax.name": "\u5B57\u6570\u6A21\u5F0F\u6700\u5927\u9762\u79EF\uFF08\xD71e-3\uFF09"
  }
};
function resolveLocale(language) {
  if (language === "en" || language === "zh-CN") return language;
  const detected = (typeof navigator !== "undefined" ? navigator.language : "en").toLowerCase();
  return detected.startsWith("zh") ? "zh-CN" : "en";
}
function t(language, key) {
  const locale = resolveLocale(language);
  return translations[locale][key] ?? translations.en[key];
}

// src/metrics.ts
var CJK = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/u;
var WORD = /[\p{L}\p{N}_]/u;
var MARK = /\p{M}/u;
function countWords(text) {
  let count = 0;
  let inWord = false;
  for (const char of text) {
    if (CJK.test(char)) {
      count++;
      inWord = false;
    } else if (WORD.test(char)) {
      if (!inWord) count++;
      inWord = true;
    } else if (!(inWord && (MARK.test(char) || char === "'" || char === "\u2019"))) {
      inWord = false;
    }
  }
  return count;
}
var MetricCache = class {
  constructor(source, throttleMs = 1e3) {
    this.source = source;
    this.throttleMs = throttleMs;
    this.values = /* @__PURE__ */ new Map();
    this.dirty = /* @__PURE__ */ new Set();
    this.lastRead = /* @__PURE__ */ new Map();
  }
  invalidate(...metrics) {
    for (const metric of metrics) this.dirty.add(metric);
  }
  clear() {
    this.values.clear();
    this.dirty.clear();
    this.lastRead.clear();
  }
  level(settings, now) {
    if (settings.sizeMode !== 1) return -1;
    const metric = settings.tokenMetric;
    if (!this.values.has(metric) || this.dirty.has(metric) && now - (this.lastRead.get(metric) ?? -Infinity) >= this.throttleMs) {
      let count2;
      switch (metric) {
        case "word-count": {
          const text = this.source.currentText();
          count2 = text === null ? -1 : countWords(text);
          break;
        }
        // Kept as an explicitly labelled estimate, not a vault-wide text scan.
        case "global-word-count":
          count2 = this.source.markdownFileCount() * 500;
          break;
        case "file-count":
          count2 = this.source.markdownFileCount();
          break;
        case "tab-count":
          count2 = this.source.markdownTabCount();
          break;
      }
      this.values.set(metric, count2);
      this.lastRead.set(metric, now);
      this.dirty.delete(metric);
    }
    const count = this.values.get(metric);
    if (count < 0) return -1;
    const max = metric === "file-count" ? 1e3 : metric === "tab-count" ? 20 : settings.maxWordCount;
    return Math.min(count / max, 1);
  }
};

// src/main.ts
var BlackHolePlugin = class extends import_obsidian2.Plugin {
  constructor() {
    super(...arguments);
    this.settings = { ...DEFAULT_SETTINGS };
    this.renderer = null;
    this.lens = null;
    this.lensUnsupportedNotified = false;
    this.canvas = null;
    this.unloaded = false;
    this.layoutReady = false;
    this.runtimeBlocked = false;
    this.generation = 0;
    this.ready = false;
    this.compiling = false;
    this.paramsVersion = 0;
    this.lastActivity = 0;
    this.playbackSuspended = true;
    this.metricIntervalId = 0;
    this.idleResumeTimeoutId = 0;
    this.recompileTimeoutId = 0;
    this.metrics = new MetricCache({
      currentText: () => this.app.workspace.getActiveViewOfType(import_obsidian2.MarkdownView)?.editor?.getValue() ?? null,
      markdownFileCount: () => this.app.vault.getMarkdownFiles().length,
      markdownTabCount: () => this.app.workspace.getLeavesOfType("markdown").length
    });
    this.activityHandler = () => {
      if (this.unloaded) return;
      this.lastActivity = performance.now();
      if (this.renderer) this.renderer.lastActivity = this.lastActivity / 1e3;
      this.syncPlaybackGate();
    };
    this.visibilityHandler = () => {
      if (!document.hidden) this.lastActivity = performance.now();
      if (this.renderer) this.renderer.lastActivity = this.lastActivity / 1e3;
      this.syncPlaybackGate();
    };
    this.refreshTarget = () => {
      if (this.unloaded) return;
      this.metrics.invalidate("word-count", "tab-count");
      this.lens?.setTarget(this.findLensTarget());
      this.lens?.refresh();
    };
  }
  async onload() {
    await this.loadSettings();
    if (this.unloaded) return;
    this.lastActivity = performance.now();
    this.addSettingTab(new BlackHoleSettingsTab(this.app, this));
    this.addRibbonIcon("circle-dot", this.t("ribbon.toggle"), () => {
      void this.setEnabled(!this.settings.enabled);
    });
    this.registerDomEvent(document, "keydown", this.activityHandler);
    this.registerDomEvent(document, "mousedown", this.activityHandler);
    this.registerDomEvent(document, "touchstart", this.activityHandler);
    this.registerDomEvent(document, "wheel", this.activityHandler, { passive: true });
    this.registerDomEvent(document, "visibilitychange", this.visibilityHandler);
    this.registerEvent(this.app.workspace.on("editor-change", () => {
      this.metrics.invalidate("word-count");
    }));
    this.registerEvent(this.app.workspace.on("active-leaf-change", this.refreshTarget));
    this.registerEvent(this.app.workspace.on("file-open", this.refreshTarget));
    this.registerEvent(this.app.workspace.on("layout-change", this.refreshTarget));
    const invalidateFiles = () => this.metrics.invalidate("word-count", "file-count", "global-word-count");
    this.registerEvent(this.app.vault.on("create", invalidateFiles));
    this.registerEvent(this.app.vault.on("delete", invalidateFiles));
    this.registerEvent(this.app.vault.on("rename", invalidateFiles));
    this.registerEvent(this.app.vault.on("modify", invalidateFiles));
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
  async setEnabled(enabled) {
    if (this.unloaded) return;
    this.settings.enabled = enabled;
    this.runtimeBlocked = false;
    if (enabled) this.start();
    else this.stop();
    new import_obsidian2.Notice(enabled ? this.t("notice.enabled") : this.t("notice.disabled"));
    await this.saveSettings();
  }
  start() {
    this.syncPlaybackGate();
  }
  isCurrent(renderer, generation) {
    return !this.unloaded && this.settings.enabled && this.renderer === renderer && this.generation === generation;
  }
  async startInternal() {
    const generation = ++this.generation;
    try {
      const canvas = document.createElement("canvas");
      canvas.className = "blackhole-canvas hidden";
      this.canvas = canvas;
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
        this.fail(renderer.softwareRenderer ? this.t("notice.softwareUnsupported") : renderer.lastError || this.t("notice.startFailed"));
        return;
      }
      let compiledVersion = version;
      while (compiledVersion !== this.paramsVersion) {
        compiledVersion = this.paramsVersion;
        const ok = await renderer.recompile(this.toShaderParams());
        if (!this.isCurrent(renderer, generation)) return;
        if (!ok) {
          this.fail(renderer.lastError || this.t("notice.startFailed"));
          return;
        }
      }
      const lens = new BackdropLens(canvas.parentElement);
      this.lens = lens;
      lens.setTarget(this.findLensTarget());
      renderer.onEffectFrame = (frame) => {
        if (this.isCurrent(renderer, generation) && this.lens === lens) lens.update(frame);
      };
      this.ready = true;
      renderer.sizeMode = this.settings.sizeMode;
      renderer.lastActivity = this.lastActivity / 1e3;
      this.updateMetric();
      this.metricIntervalId = window.setInterval(() => {
        if (!this.playbackSuspended && !document.hidden) this.updateMetric();
      }, 1e3);
      this.applyRuntimeSettings();
    } catch (error) {
      if (this.generation === generation && !this.unloaded) this.fail(String(error));
    }
  }
  fail(reason) {
    console.error("BlackHole:", reason);
    this.runtimeBlocked = true;
    this.stop();
    new import_obsidian2.Notice(reason || this.t("notice.startFailed"));
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
    try {
      lens?.destroy();
    } finally {
      try {
        renderer?.destroy();
      } finally {
        this.canvas?.remove();
        this.canvas = null;
      }
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
  async recompile() {
    const renderer = this.renderer;
    if (!renderer || !this.ready || this.compiling) return;
    const generation = this.generation;
    this.compiling = true;
    this.syncPlaybackGate();
    try {
      let version;
      do {
        version = this.paramsVersion;
        const ok = await renderer.recompile(this.toShaderParams());
        if (!this.isCurrent(renderer, generation)) return;
        if (!ok) {
          this.fail(renderer.lastError || this.t("notice.startFailed"));
          return;
        }
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
      this.renderer.captureEnabled = false;
      this.renderer.setRenderScale(runtimeRenderScale(this.settings));
    }
    this.lens?.setEnabled(this.settings.captureEnabled);
    this.lens?.setTarget(this.findLensTarget());
    if (this.settings.captureEnabled && this.lens && !this.lens.supported && !this.lensUnsupportedNotified) {
      this.lensUnsupportedNotified = true;
      new import_obsidian2.Notice(this.t("notice.lensUnsupported"));
    }
    this.syncPlaybackGate();
  }
  /** The only path allowed to start rendering or resume the lens. */
  syncPlaybackGate() {
    window.clearTimeout(this.idleResumeTimeoutId);
    this.idleResumeTimeoutId = 0;
    const eligible = !this.unloaded && this.layoutReady && this.settings.enabled && !this.runtimeBlocked && !document.hidden;
    const remaining = this.settings.idlePlaybackEnabled ? this.settings.idlePlaybackDelaySec * 1e3 - (performance.now() - this.lastActivity) : 0;
    if (eligible && remaining > 0) {
      const generation = this.generation;
      this.idleResumeTimeoutId = window.setTimeout(() => {
        this.idleResumeTimeoutId = 0;
        if (generation === this.generation) this.syncPlaybackGate();
      }, remaining);
    }
    const allowed = eligible && remaining <= 0;
    if (allowed && !this.renderer) {
      void this.startInternal();
      return;
    }
    const suspended = !allowed || !this.ready || this.compiling;
    this.canvas?.classList.toggle("hidden", suspended);
    this.lens?.setSuspended(suspended);
    if (!this.renderer || !this.ready) return;
    if (suspended) this.renderer.stop();
    else if (this.playbackSuspended) {
      this.updateMetric();
      this.renderer.start();
    }
    this.playbackSuspended = suspended;
  }
  updateMetric() {
    if (!this.renderer) return;
    try {
      this.renderer.tokenLevel = this.metrics.level(this.settings, performance.now());
    } catch (error) {
      this.renderer.tokenLevel = -1;
      console.error("BlackHole: token metric failed.", error);
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
  async saveSettings() {
    await this.saveData(this.settings);
  }
  async loadSettings() {
    this.settings = normalizeSettings(await this.loadData());
  }
  t(key) {
    return t(this.settings.language, key);
  }
  toShaderParams() {
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
      tokenGlideRate: 10
    };
  }
  findLensTarget() {
    const view = this.app.workspace.getActiveViewOfType(import_obsidian2.MarkdownView);
    return view?.contentEl ?? null;
  }
};
