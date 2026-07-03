import { VS, makeFS, ShaderParams } from './shader';

const POSITION_ATTRIB_LOCATION = 0;
const MODE_POMODORO = 0;
const MODE_DEMO = 2;
const DEMO_SEC = 42;
const DEMO_GROW_SEC = 40;
const B_CRIT = 2.5980762;
const EFFECT_ALPHA_CUTOFF = 0.01;
const SIZE_GAIN = 0.55;
const VIEWPORT_PAD_PX = 24;
const VIEWPORT_SNAP_PX = 32;
const DEFAULT_FRAME_INTERVAL_MS = 1000 / 18;
const SOFTWARE_FRAME_INTERVAL_MS = 1000 / 10;

type EffectBounds = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type Vec2 = {
  x: number;
  y: number;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function mix(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function smoothstep(edge0: number, edge1: number, value: number): number {
  if (edge0 === edge1) return value < edge0 ? 0 : 1;
  const t = clamp((value - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

function positiveMod(value: number, mod: number): number {
  return ((value % mod) + mod) % mod;
}

function lissa(t: number): Vec2 {
  return {
    x: 0.75 * Math.sin(t * 0.37) + 0.25 * Math.sin(t * 0.83 + 1.0),
    y: 0.70 * Math.sin(t * 0.54 + 2.1) + 0.30 * Math.sin(t * 1.07),
  };
}

/**
 * WebGL2 renderer — compiles the shader, manages uniforms, runs the render loop.
 * Settings that change const values trigger a shader recompile via `recompile()`.
 */
export class BlackHoleRenderer {
  private canvas: HTMLCanvasElement;
  private gl: WebGL2RenderingContext | null = null;
  private program: WebGLProgram | null = null;
  private vao: WebGLVertexArrayObject | null = null;
  private vertexBuffer: WebGLBuffer | null = null;
  private animId: number = 0;
  private running = false;
  private params: ShaderParams;

  private workspaceTex: WebGLTexture | null = null;

  // uniform locations
  private uResolution!: WebGLUniformLocation;
  private uTime!: WebGLUniformLocation;
  private uTimeDelta!: WebGLUniformLocation;
  private uFrame!: WebGLUniformLocation;
  private uTexture!: WebGLUniformLocation;
  private uDate!: WebGLUniformLocation;
  private uLastActivity!: WebGLUniformLocation;
  private uTokenLevel!: WebGLUniformLocation;
  private uTokenPrev!: WebGLUniformLocation;
  private uTokenChangeTime!: WebGLUniformLocation;
  private uSizeMode!: WebGLUniformLocation;
  private uCaptureEnabled!: WebGLUniformLocation;
  private uViewportOrigin!: WebGLUniformLocation;
  private uViewportSize!: WebGLUniformLocation;

  // state
  public tokenLevel = 0.0;
  public prevTokenLevel = 0.0;
  public lastTokenChange = 0.0;
  private lastTokenLevel = 0.0;
  public lastActivity = 0.0;
  public sizeMode = 1;
  public captureEnabled = false;

  // perf
  public softwareRenderer = false;
  /** When true, auto-drop render scale if frames stay slow. */
  public autoQuality = true;
  /** Backing-store resolution factor (CSS px × this). The canvas is stretched
   *  to 100% via CSS, so < 1 renders fewer fragments — a big GPU win. */
  public renderScale = 1.0;
  private readonly minRenderScale = 0.25;
  private dtAvg = 0;            // EMA of frame time (s)
  private lastScaleAdjust = 0;  // timestamp guard for auto-downscale

  private prevTime = 0;
  private lastDrawTime = 0;
  private frameCount = 0;
  private startTime = 0;
  private frameIntervalMs = DEFAULT_FRAME_INTERVAL_MS;
  private viewportRect: EffectBounds | null = null;
  private resizeObserver: ResizeObserver;

  constructor(canvas: HTMLCanvasElement, params: ShaderParams) {
    this.canvas = canvas;
    this.params = { ...params };
    this.resizeObserver = new ResizeObserver(() => this.resize());
  }

  init(): boolean {
    const gl = this.canvas.getContext('webgl2', {
      alpha: true, premultipliedAlpha: false,
      antialias: false, preserveDrawingBuffer: false,
      // Ask the OS/Electron for the discrete/high-performance GPU rather than
      // an integrated or software fallback — the geodesic shader is heavy.
      powerPreference: 'high-performance',
      // Let the compositor present without forcing main-thread sync each frame.
      desynchronized: true,
    });
    if (!gl) return false;
    this.gl = gl;

    // Report which GPU we actually got. If Electron handed us a software
    // rasterizer (SwiftShader / llvmpipe), the shader will be unusably slow —
    // flag it so we can drop quality automatically.
    try {
      const dbg = gl.getExtension('WEBGL_debug_renderer_info');
      const rendererName = dbg
        ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL))
        : '';
      console.info('BlackHole: WebGL renderer =', rendererName || '(unknown)');
      this.softwareRenderer = /swiftshader|llvmpipe|software|basic render/i.test(rendererName);
      if (this.softwareRenderer) {
        this.frameIntervalMs = SOFTWARE_FRAME_INTERVAL_MS;
        const isWayland = typeof navigator !== 'undefined' && /Wayland|wayland/i.test(navigator.userAgent);
        console.warn(
          'BlackHole: running on a SOFTWARE WebGL renderer (' + rendererName + '). ' +
          'Hardware GPU is not being used for WebGL.\n' +
          (isWayland
            ? 'This is a known Electron+Wayland+NVIDIA issue. Fix:\n' +
              '  Run Obsidian with --ozone-platform=x11 via ~/.config/obsidian/user-flags.conf\n' +
              '  (created automatically — restart Obsidian to apply).'
            : 'Check that your GPU drivers are installed and Obsidian/Electron is not started with --disable-gpu.\n' +
              '  See Settings > Appearance > Advanced and ensure "Hardware acceleration" is ON.'),
        );
      }
    } catch { /* debug ext unavailable — assume hardware */ }

    if (!this.buildProgram()) return false;

    // fullscreen quad VAO
    this.vao = gl.createVertexArray()!;
    gl.bindVertexArray(this.vao);
    this.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(POSITION_ATTRIB_LOCATION);
    gl.vertexAttribPointer(POSITION_ATTRIB_LOCATION, 2, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);

    // workspace texture (blank initial)
    this.workspaceTex = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.workspaceTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA,
                  gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 255]));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.uniform1i(this.uTexture, 0);
    gl.clearColor(0, 0, 0, 0);
    this.canvas.style.left = '0';
    this.canvas.style.top = '0';
    this.canvas.style.width = '1px';
    this.canvas.style.height = '1px';
    this.canvas.style.transform = 'translate3d(0, 0, 0)';

    this.resize();
    this.resizeObserver.observe(this.canvas.parentElement ?? document.body);
    return true;
  }

  /** Recompile with new shader params (e.g. after settings change). */
  recompile(params: ShaderParams) {
    this.params = { ...params };
    const oldProgram = this.program;
    if (!this.buildProgram()) return;
    if (oldProgram && this.gl) this.gl.deleteProgram(oldProgram);
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.prevTime = performance.now();
    this.lastDrawTime = 0;
    this.startTime = this.prevTime;
    this.loop(this.prevTime);
  }

  stop() {
    this.running = false;
    if (this.animId) cancelAnimationFrame(this.animId);
    this.animId = 0;
  }

  /** Upload a captured workspace canvas to the texture. */
  updateTexture(captureCanvas: HTMLCanvasElement) {
    if (!this.gl || !this.workspaceTex) return;
    const gl = this.gl;
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.workspaceTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, captureCanvas);
  }

  resize() {
    if (!this.gl) return;
    this.viewportRect = null;
    this.updateViewportRect({ x: 0, y: 0, width: 1, height: 1 });
  }

  /** Set the backing-store resolution factor and re-size immediately. */
  setRenderScale(scale: number) {
    this.renderScale = Math.max(this.minRenderScale, Math.min(1, scale));
    if (this.viewportRect) this.updateViewportRect(this.viewportRect);
    else this.resize();
  }

  getSize(): { width: number; height: number } {
    return { width: this.canvas.width, height: this.canvas.height };
  }

  destroy() {
    this.stop();
    this.resizeObserver.disconnect();
    const gl = this.gl;
    if (gl && this.program) gl.deleteProgram(this.program);
    if (gl && this.vao) gl.deleteVertexArray(this.vao);
    if (gl && this.vertexBuffer) gl.deleteBuffer(this.vertexBuffer);
    if (gl && this.workspaceTex) gl.deleteTexture(this.workspaceTex);
    this.program = null;
    this.vao = null;
    this.vertexBuffer = null;
    this.workspaceTex = null;
    this.gl = null;
  }

  // ---- internal ----

  private buildProgram(): boolean {
    const gl = this.gl!;

    const vs = this.compile(gl.VERTEX_SHADER, VS);
    const fs = this.compile(gl.FRAGMENT_SHADER, makeFS(this.params, this.softwareRenderer));
    if (!vs || !fs) return false;

    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.bindAttribLocation(prog, POSITION_ATTRIB_LOCATION, 'aPos');
    gl.linkProgram(prog);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error('Shader link error:', gl.getProgramInfoLog(prog));
      gl.deleteProgram(prog);
      return false;
    }

    this.program = prog;
    gl.useProgram(prog);

    // locate uniforms
    this.uResolution = gl.getUniformLocation(prog, 'uResolution')!;
    this.uTime = gl.getUniformLocation(prog, 'uTime')!;
    this.uTimeDelta = gl.getUniformLocation(prog, 'uTimeDelta')!;
    this.uFrame = gl.getUniformLocation(prog, 'uFrame')!;
    this.uTexture = gl.getUniformLocation(prog, 'uTexture')!;
    this.uDate = gl.getUniformLocation(prog, 'uDate')!;
    this.uLastActivity = gl.getUniformLocation(prog, 'uLastActivity')!;
    this.uTokenLevel = gl.getUniformLocation(prog, 'uTokenLevel')!;
    this.uTokenPrev = gl.getUniformLocation(prog, 'uTokenPrev')!;
    this.uTokenChangeTime = gl.getUniformLocation(prog, 'uTokenChangeTime')!;
    this.uSizeMode = gl.getUniformLocation(prog, 'uSizeMode')!;
    this.uCaptureEnabled = gl.getUniformLocation(prog, 'uCaptureEnabled')!;
    this.uViewportOrigin = gl.getUniformLocation(prog, 'uViewportOrigin')!;
    this.uViewportSize = gl.getUniformLocation(prog, 'uViewportSize')!;

    return true;
  }

  private compile(type: number, source: string): WebGLShader | null {
    const gl = this.gl!;
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Shader compile error:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  private loop = (now: number) => {
    if (!this.running || !this.gl || !this.program) return;
    this.animId = requestAnimationFrame(this.loop);
    if (this.lastDrawTime && now - this.lastDrawTime < this.frameIntervalMs) return;

    try {
      this.renderFrame(now);
      this.lastDrawTime = now;
    } catch (e) {
      // A throw here would otherwise fire as an uncaught error every frame.
      // Log it once and stop the loop rather than spam the console.
      console.error('BlackHole: render loop error — stopping renderer.', e);
      this.stop();
    }
  };

  private renderFrame(now: number) {
    const gl = this.gl!;
    const dt = Math.min((now - this.prevTime) / 1000, 0.1);
    this.prevTime = now;
    this.frameCount++;

    // Adaptive quality: if frames stay slow, drop the render scale (never auto
    // -raise). This self-recovers even when the UI is too frozen to reach
    // settings — the most likely escape hatch on a software renderer.
    this.dtAvg = this.dtAvg ? this.dtAvg * 0.9 + dt * 0.1 : dt;
    if (this.autoQuality && (now - this.startTime) > 3000 && this.dtAvg > 0.033
        && this.renderScale > this.minRenderScale && now - this.lastScaleAdjust > 2000) {
      this.lastScaleAdjust = now;
      this.setRenderScale(this.renderScale - 0.15);
      console.warn(
        `BlackHole: low FPS (~${Math.round(1 / this.dtAvg)}) — render scale → ${this.renderScale.toFixed(2)}`,
      );
      this.dtAvg = 0.025; // settle before re-evaluating
    }

    gl.useProgram(this.program);
    const d = new Date();
    const viewportSize = this.getViewportSize();
    if (!viewportSize) {
      this.hideCanvas();
      return;
    }
    const bounds = this.computeEffectBounds(now / 1000, d, viewportSize.width, viewportSize.height);
    if (!bounds) {
      this.hideCanvas();
      return;
    }

    const viewportRect = this.ensureViewportRect(bounds, viewportSize.width, viewportSize.height);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.uniform2f(this.uResolution, viewportSize.width, viewportSize.height);
    gl.uniform2f(
      this.uViewportOrigin,
      viewportRect.x / viewportSize.width,
      viewportRect.y / viewportSize.height,
    );
    gl.uniform2f(
      this.uViewportSize,
      viewportRect.width / viewportSize.width,
      viewportRect.height / viewportSize.height,
    );
    gl.uniform1f(this.uTime, now / 1000);
    gl.uniform1f(this.uTimeDelta, dt);
    gl.uniform1i(this.uFrame, this.frameCount);
    gl.uniform1f(this.uLastActivity, this.lastActivity);
    gl.uniform4f(this.uDate, d.getFullYear(), d.getMonth() + 1, d.getDate(),
                 d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds());

    // detect target changes: hold the pre-change value as the glide start
    if (this.lastTokenLevel !== this.tokenLevel) {
      this.prevTokenLevel = this.lastTokenLevel;
      this.lastTokenLevel = this.tokenLevel;
      this.lastTokenChange = now / 1000;
    }
    gl.uniform1f(this.uTokenLevel, this.tokenLevel);
    gl.uniform1f(this.uTokenPrev, this.prevTokenLevel);
    gl.uniform1f(this.uTokenChangeTime, this.lastTokenChange);
    gl.uniform1i(this.uSizeMode, this.sizeMode);
    gl.uniform1i(this.uCaptureEnabled, this.captureEnabled ? 1 : 0);
    gl.bindVertexArray(this.vao);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.bindVertexArray(null);
  }

  private computeEffectBounds(
    nowSec: number,
    date: Date,
    viewportWidth: number,
    viewportHeight: number,
  ): EffectBounds | null {
    const p = this.params;
    const aspect = viewportWidth / viewportHeight;
    const holeRadius = Math.max(p.holeRadius, 1e-4);
    let intensity = 0;
    let size = 0;
    let center: Vec2;

    if (this.sizeMode === MODE_POMODORO) {
      const workSec = p.workPeriodMin * 60;
      const cycleSec = workSec + p.breakMin * 60;
      const wall = date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds();
      const phase = positiveMod(wall, cycleSec);
      const collapse = Math.min(60, workSec * 0.15);
      const grow = clamp(phase / workSec, 0, 1)
        * (1 - smoothstep(workSec - collapse, workSec, phase));
      intensity = mix(0.12, 1.0, grow);
      const idle = Math.max(0, nowSec - this.lastActivity);
      intensity *= 1 - smoothstep(
        p.idleFadeSec,
        Math.max(p.breakMin * 60, p.idleFadeSec + 1),
        idle,
      );
      size = mix(0.22, 1.0, intensity);
      const diskOuter = Math.max(p.diskOuter, Math.max(p.diskInner, 1.6) + 0.5);
      const ext = (diskOuter / B_CRIT) * holeRadius * size * SIZE_GAIN;
      const yLo = p.workArea + 0.12 + ext;
      const yHi = Math.max(yLo, 0.90 - ext);
      const speed = mix(0.35, 1.0, intensity);
      const t = nowSec * p.driftSpeed;
      center = {
        x: 0.5 + (0.24 * Math.sin(t * 0.21) + 0.05 * Math.sin(t * 0.083)) * speed,
        y: 1.0 - mix(
          yLo,
          yHi,
          0.5 + (0.42 * Math.sin(t * 0.157 + 2.0) + 0.08 * Math.sin(t * 0.117)) * speed,
        ),
      };
      center = {
        x: center.x + intensity * (0.040 * Math.sin(t * 0.83) + 0.020 * Math.sin(t * 1.31)),
        y: center.y + intensity * (0.030 * Math.sin(t * 1.03 + 1.0)),
      };
    } else {
      const level = this.sizeMode === MODE_DEMO
        ? Math.min(positiveMod(nowSec, DEMO_SEC) / DEMO_GROW_SEC, 1.0)
        : this.glidedToken(nowSec);
      if (level < 0) return null;
      const g = Math.pow(clamp(level, 0, 1), p.tokenEase);
      intensity = mix(0.10, 1.0, g);
      const rhMin = Math.sqrt((p.tokenAreaMin * aspect) / Math.PI);
      const rhMax = Math.sqrt((p.tokenAreaMax * aspect) / Math.PI);
      const rhT = mix(rhMin, rhMax, g) * (holeRadius / 0.08) * SIZE_GAIN;
      size = rhT / holeRadius;
      const margin = Math.min(rhT * mix(1.45, 0.90, g), 0.5 * (1.0 - p.workArea - 0.03));
      const xPad = margin / aspect;
      const fullLo = { x: Math.min(xPad, 0.5), y: margin };
      const fullHi = {
        x: Math.max(0.5, 1.0 - xPad),
        y: Math.max(margin, 1.0 - (p.workArea + 0.03 + margin)),
      };
      const corner = {
        x: clamp(p.tokenHomeX, fullLo.x, fullHi.x),
        y: clamp(p.tokenHomeY, fullLo.y, fullHi.y),
      };
      const reach = mix(0.06, Math.max(p.tokenReach, 0.06), g);
      const lo = { x: mix(corner.x, fullLo.x, reach), y: fullLo.y };
      const hi = { x: fullHi.x, y: mix(corner.y, fullHi.y, reach) };
      const room = {
        x: Math.max((hi.x - lo.x) * 0.5, 0),
        y: Math.max((hi.y - lo.y) * 0.5, 0),
      };
      const wobble = {
        x: Math.min(0.010 + 0.030 * g, Math.max(room.x * 0.35, 0.006)),
        y: Math.min(0.010 + 0.030 * g, Math.max(room.y * 0.35, 0.006)),
      };
      const amplitude = {
        x: Math.max(room.x - wobble.x, 0),
        y: Math.max(room.y - wobble.y, 0),
      };
      const t = nowSec * p.driftSpeed;
      const calm = lissa(t * p.tokenCalm);
      const rush = lissa(t * p.tokenRush);
      const wander = {
        x: mix(calm.x, rush.x, g),
        y: mix(calm.y, rush.y, g),
      };
      center = {
        x: (lo.x + hi.x) * 0.5 + wander.x * amplitude.x + wobble.x * Math.cos(t * 0.8),
        y: (lo.y + hi.y) * 0.5 + wander.y * amplitude.y + wobble.y * Math.sin(t * 1.0),
      };
    }

    const shield = smoothstep(0.0, 0.10, intensity);
    if (shield <= 0) return null;

    const rh = holeRadius * size * SIZE_GAIN;
    const effectRadius = Math.max(
      rh * 3,
      7 * rh * Math.sqrt(-Math.log(EFFECT_ALPHA_CUTOFF / Math.max(shield, EFFECT_ALPHA_CUTOFF))),
    ) + rh * 2.0;
    const radiusX = effectRadius / Math.max(aspect, 1e-4);
    const radiusY = effectRadius;

    const x0 = clamp(Math.floor((center.x - radiusX) * viewportWidth), 0, viewportWidth);
    const x1 = clamp(Math.ceil((center.x + radiusX) * viewportWidth), 0, viewportWidth);
    const y0 = clamp(Math.floor((center.y - radiusY) * viewportHeight), 0, viewportHeight);
    const y1 = clamp(Math.ceil((center.y + radiusY) * viewportHeight), 0, viewportHeight);
    if (x1 <= x0 || y1 <= y0) return null;

    return { x: x0, y: y0, width: x1 - x0, height: y1 - y0 };
  }

  private getViewportSize(): { width: number; height: number } | null {
    const parent = this.canvas.parentElement;
    if (!parent) return null;
    const width = parent.clientWidth;
    const height = parent.clientHeight;
    if (width === 0 || height === 0) return null;
    return { width, height };
  }

  private ensureViewportRect(
    bounds: EffectBounds,
    viewportWidth: number,
    viewportHeight: number,
  ): EffectBounds {
    const pad = VIEWPORT_PAD_PX;
    const snap = VIEWPORT_SNAP_PX;
    const x0 = clamp(Math.floor((bounds.x - pad) / snap) * snap, 0, viewportWidth);
    const y0 = clamp(Math.floor((bounds.y - pad) / snap) * snap, 0, viewportHeight);
    const x1 = clamp(Math.ceil((bounds.x + bounds.width + pad) / snap) * snap, 1, viewportWidth);
    const y1 = clamp(Math.ceil((bounds.y + bounds.height + pad) / snap) * snap, 1, viewportHeight);
    const next = {
      x: x0,
      y: y0,
      width: Math.max(1, x1 - x0),
      height: Math.max(1, y1 - y0),
    };
    const prev = this.viewportRect;
    if (!prev
        || prev.x !== next.x
        || prev.y !== next.y
        || prev.width !== next.width
        || prev.height !== next.height) {
      this.viewportRect = next;
      this.updateViewportRect(next);
      return next;
    }
    return prev;
  }

  private updateViewportRect(rect: EffectBounds) {
    if (!this.gl) return;
    const renderScale = Math.max(this.minRenderScale, Math.min(1, this.renderScale));
    const backingWidth = Math.max(1, Math.round(rect.width * renderScale));
    const backingHeight = Math.max(1, Math.round(rect.height * renderScale));
    if (this.canvas.width !== backingWidth || this.canvas.height !== backingHeight) {
      this.canvas.width = backingWidth;
      this.canvas.height = backingHeight;
      this.gl.viewport(0, 0, backingWidth, backingHeight);
    }
    this.canvas.style.width = `${rect.width}px`;
    this.canvas.style.height = `${rect.height}px`;
    this.canvas.style.transform = `translate3d(${rect.x}px, ${rect.y}px, 0)`;
  }

  private hideCanvas() {
    this.viewportRect = null;
    this.canvas.style.width = '0px';
    this.canvas.style.height = '0px';
  }

  private glidedToken(nowSec: number): number {
    const cur = this.tokenLevel;
    const prev = this.prevTokenLevel;
    if (cur < 0) return -1;
    if (prev < 0) return cur;
    const duration = clamp(
      Math.abs(cur - prev) * this.params.tokenGlideRate,
      this.params.tokenGlideMin,
      this.params.tokenGlideMax,
    );
    return mix(prev, cur, smoothstep(0.0, duration, nowSec - this.lastTokenChange));
  }
}
