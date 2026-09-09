// =============================================================================
// Standalone shader harness
//
// Runs the WebGL2 BlackHoleRenderer in a plain browser page — no Obsidian, no
// dom-to-image. A procedurally drawn "workspace" canvas stands in for the
// captured notes so you can see the gravitational lensing distortion while
// tweaking shader params live. Build + serve with `npm run harness`.
// =============================================================================
import { BlackHoleRenderer } from '../src/renderer';
import { ShaderParams } from '../src/shader';

import { DEFAULT_SETTINGS } from '../src/config';

const DEFAULTS: ShaderParams = { ...DEFAULT_SETTINGS, tokenGlideMin: 0.3, tokenGlideMax: 1.5, tokenGlideRate: 10 };

// A curated subset of tunables exposed as sliders (the visually interesting
// ones). [key, label, min, max, step]
const CONTROLS: [keyof ShaderParams, string, number, number, number][] = [
  ['holeRadius', 'Hole radius', 0.001, 0.2, 0.001],
  ['lensDepth', 'Lens depth', 1, 50, 0.5],
  ['starGain', 'Star gain', 0, 5, 0.1],
  ['diskInner', 'Disk inner', 1.6, 10, 0.1],
  ['diskOuter', 'Disk outer', 3, 30, 0.5],
  ['diskIncl', 'Inclination', 0, 3.14, 0.01],
  ['diskRoll', 'Roll', -3.14, 3.14, 0.01],
  ['diskGain', 'Disk gain', 0, 10, 0.1],
  ['diskOpacity', 'Opacity', 0, 1, 0.01],
  ['diskTemp', 'Temperature (K)', 1500, 40000, 100],
  ['dopplerMix', 'Doppler mix', 0, 1, 0.01],
  ['diskBeam', 'Beaming', 0, 10, 0.1],
  ['diskSpeed', 'Disk speed', 0, 10, 0.1],
  ['exposure', 'Exposure', 0.2, 3, 0.05],
  ['nSteps', 'N steps', 48, 96, 8],
  ['tokenEase', 'Token ease', 0.2, 4, 0.1],
];

/** Draw a fake "workspace" — grid + text bars + colour blocks — so the lensing
 *  distortion is clearly visible when the shader warps the texture. */
function makeMockTexture(w: number, h: number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const x = c.getContext('2d')!;
  x.fillStyle = '#1b1f24';
  x.fillRect(0, 0, w, h);

  // grid
  x.strokeStyle = 'rgba(120,140,160,0.25)';
  x.lineWidth = 1;
  const step = 48;
  for (let gx = 0; gx <= w; gx += step) { x.beginPath(); x.moveTo(gx, 0); x.lineTo(gx, h); x.stroke(); }
  for (let gy = 0; gy <= h; gy += step) { x.beginPath(); x.moveTo(0, gy); x.lineTo(w, gy); x.stroke(); }

  // fake paragraphs of text (bars of varying width)
  x.fillStyle = 'rgba(220,225,230,0.85)';
  let y = 60;
  for (let p = 0; p < 18; p++) {
    const lines = 3 + Math.floor((p * 7) % 4);
    for (let l = 0; l < lines; l++) {
      const lw = 220 + ((p * 53 + l * 97) % (w - 320));
      x.fillRect(70, y, lw, 10);
      y += 22;
    }
    y += 26;
    if (y > h - 40) { y = 60; }
  }

  // a few accent blocks
  const blocks: [number, number, number, number, string][] = [
    [w * 0.62, h * 0.12, 220, 140, '#c0563a'],
    [w * 0.10, h * 0.55, 180, 120, '#2f7d6b'],
    [w * 0.70, h * 0.62, 200, 160, '#3a6ec0'],
  ];
  for (const [bx, by, bw, bh, col] of blocks) {
    x.fillStyle = col; x.fillRect(bx, by, bw, bh);
  }
  return c;
}

function buildUI(
  renderer: BlackHoleRenderer,
  params: ShaderParams,
  onParam: () => void,
) {
  const panel = document.getElementById('controls')!;

  // mode
  const modeRow = document.createElement('div');
  modeRow.className = 'row';
  modeRow.innerHTML = '<label>Mode</label>';
  const sel = document.createElement('select');
  ['Pomodoro', 'Token', 'Demo'].forEach((m, i) => {
    const o = document.createElement('option');
    o.value = String(i); o.textContent = m; sel.appendChild(o);
  });
  sel.value = '2'; // demo by default — immediate motion
  sel.onchange = () => { renderer.sizeMode = parseInt(sel.value); };
  modeRow.appendChild(sel);
  panel.appendChild(modeRow);

  // token level (only meaningful in Token mode)
  const tokRow = document.createElement('div');
  tokRow.className = 'row';
  const tokVal = document.createElement('span');
  tokVal.className = 'val'; tokVal.textContent = '0.30';
  tokRow.innerHTML = '<label>Token level</label>';
  const tok = document.createElement('input');
  tok.type = 'range'; tok.min = '0'; tok.max = '1'; tok.step = '0.01'; tok.value = '0.3';
  renderer.tokenLevel = 0.3;
  tok.oninput = () => { renderer.tokenLevel = parseFloat(tok.value); tokVal.textContent = tok.value; };
  tokRow.appendChild(tok); tokRow.appendChild(tokVal);
  panel.appendChild(tokRow);

  // param sliders
  for (const [key, label, min, max, stepv] of CONTROLS) {
    const row = document.createElement('div');
    row.className = 'row';
    const val = document.createElement('span');
    val.className = 'val';
    val.textContent = String(params[key]);
    row.innerHTML = `<label>${label}</label>`;
    const sl = document.createElement('input');
    sl.type = 'range'; sl.min = String(min); sl.max = String(max);
    sl.step = String(stepv); sl.value = String(params[key]);
    sl.oninput = () => {
      const v = parseFloat(sl.value);
      (params as any)[key] = key === 'nSteps' ? Math.round(v) : v;
      val.textContent = String((params as any)[key]);
      onParam();
    };
    row.appendChild(sl); row.appendChild(val);
    panel.appendChild(row);
  }
}

async function start() {
  const stage = document.getElementById('stage')!;
  const canvas = document.createElement('canvas');
  stage.appendChild(canvas);

  const params: ShaderParams = { ...DEFAULTS };
  const renderer = new BlackHoleRenderer(canvas, params);
  if (!await renderer.init({ allowSoftware: true })) {
    stage.innerHTML = '<p style="color:#f66;padding:2rem">WebGL2 not available in this browser.</p>';
    return;
  }

  renderer.setRenderScale(DEFAULT_SETTINGS.renderScale);
  renderer.captureEnabled = true;
  renderer.updateTexture(makeMockTexture(1600, 1000));
  renderer.sizeMode = 2; // demo
  renderer.lastActivity = performance.now() / 1000;
  renderer.start();

  // keep activity fresh so Pomodoro mode doesn't idle-fade while testing
  setInterval(() => { renderer.lastActivity = performance.now() / 1000; }, 1000);

  // debounce recompiles a touch so dragging stays smooth
  let pending = 0;
  const onParam = () => {
    if (pending) return;
    pending = window.setTimeout(() => { pending = 0; void renderer.recompile(params); }, 60);
  };

  buildUI(renderer, params, onParam);
}

start();
