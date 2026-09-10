import { VS, makeFS, ShaderParams } from './shader';
import type { LensFrame } from './backdrop';

const POSITION_ATTRIB_LOCATION = 0;
const MODE_POMODORO = 0;
const MODE_DEMO = 2;
const DEMO_SEC = 42;
const DEMO_GROW_SEC = 40;
const B_CRIT = 2.5980762;
const EFFECT_ALPHA_CUTOFF = 0.01;
const MAX_RENDER_PIXELS = 2_097_152;
const MAX_RENDER_DIMENSION = 4096;
const MAX_DEVICE_PIXEL_RATIO = 2;
const VIEWPORT_PAD_PX = 24;
const VIEWPORT_SNAP_PX = 32;
const DEFAULT_FRAME_INTERVAL_MS = 1000 / 60;
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
  private uDemoTime!: WebGLUniformLocation;
  private readonly demoStart = performance.now() / 1000;
  private gpuFence: WebGLSync | null = null;
  private fenceCreatedAt = 0;
  private uTexture!: WebGLUniformLocation;
  private uCaptureRect!: WebGLUniformLocation;
  private captureRect: EffectBounds = { x: 0, y: 0, width: 1, height: 1 };
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
  /** Requested fraction of display resolution; pixel and GPU budgets apply below. */
  public renderScale = 1;
  private qualityFactor = 1;
  private readonly minQualityFactor = 0.25;
  private readonly minRenderScale = 0.15;
  private dtAvg = 0;            // EMA of frame time (s)
  private lastScaleAdjust = 0;  // timestamp guard for auto-downscale

  private prevTime = 0;
  private nextDrawTime = 0;
  private startTime = 0;
  private frameIntervalMs = DEFAULT_FRAME_INTERVAL_MS;
  private viewportRect: EffectBounds | null = null;
  private resizeObserver: ResizeObserver;
  private disposed = false;
  private compileGeneration = 0;
  private effectState = { x: 0.5, y: 0.5, radius: 0, intensity: 0 };
  private uEffect!: WebGLUniformLocation;
  public onFatalError: ((reason: string) => void) | null = null;
  public lastError = '';
  public onEffectFrame: ((frame: LensFrame | null) => void) | null = null;
  private contextLost = (event: Event) => {
    event.preventDefault();
    this.stop();
    this.lastError = 'WebGL context lost; toggle the effect to retry.';
    this.onFatalError?.(this.lastError);
  };

  constructor(canvas: HTMLCanvasElement, params: ShaderParams) {
    this.canvas = canvas;
    this.params = { ...params };
    this.resizeObserver = new ResizeObserver(() => this.resize());
  }

  async init(options: { allowSoftware?: boolean } = {}): Promise<boolean> {
    const gl = this.canvas.getContext('webgl2', {
      alpha: true, premultipliedAlpha: false,
      antialias: false, preserveDrawingBuffer: false,
      // Ask the OS/Electron for the discrete/high-performance GPU rather than
      // an integrated or software fallback — the geodesic shader is heavy.
      powerPreference: 'high-performance',
      // Normal compositor presentation retains the last image between draws;
      // low-latency desynchronized scanout can expose clears on some drivers.
      desynchronized: false,
    });
    if (!gl) { this.lastError = 'WebGL2 context unavailable.'; return false; }
    this.gl = gl;
    this.canvas.addEventListener('webglcontextlost', this.contextLost);

    // Report which GPU we actually got. If Electron handed us a software
    // rasterizer (SwiftShader / llvmpipe), the shader will be unusably slow —
    // reject it before compiling the heavy shader in the production plugin.
    try {
      const dbg = gl.getExtension('WEBGL_debug_renderer_info');
      const rendererName = dbg
        ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL))
        : '';
      console.info('BlackHole: WebGL renderer =', rendererName || '(unknown)');
      this.softwareRenderer = /swiftshader|llvmpipe|software|basic render/i.test(rendererName);
      if (this.softwareRenderer) {
        this.frameIntervalMs = SOFTWARE_FRAME_INTERVAL_MS;
        if (!options.allowSoftware) {
          this.lastError = 'Software WebGL detected. Effect disabled to protect the editor; enable hardware acceleration and restart Obsidian.';
          console.warn('BlackHole:', this.lastError);
          return false;
        }
      }
    } catch { /* debug ext unavailable — assume hardware */ }

    if (!await this.buildProgram(this.params)) return false;
    if (this.disposed || this.gl !== gl || gl.isContextLost()) return false;

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
  async recompile(params: ShaderParams): Promise<boolean> {
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
  updateTexture(captureCanvas: HTMLCanvasElement, rect: EffectBounds = { x: 0, y: 0, width: 1, height: 1 }) {
    if (!this.gl || !this.workspaceTex) return;
    const gl = this.gl;
    this.captureRect = { ...rect };
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.workspaceTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, captureCanvas);
  }

  resize() {
    if (!this.gl) return;
    // Invalidate geometry only; clearing the backing store here produces a blank
    // frame before the next RAF (ResizeObserver runs after RAF).
    this.viewportRect = null;
  }

  /** Request a backing-store scale change for the next complete draw. */
  setRenderScale(scale: number) {
    if (!Number.isFinite(scale)) return;
    const requested = Math.max(this.minRenderScale, Math.min(1, scale));
    if (requested !== this.renderScale) this.qualityFactor = 1;
    this.renderScale = requested;
    // The next draw applies the backing-store change atomically with new pixels.
  }

  getSize(): { width: number; height: number } {
    return { width: this.canvas.width, height: this.canvas.height };
  }

  destroy() {
    this.disposed = true;
    this.compileGeneration++;
    this.stop();
    this.canvas.removeEventListener('webglcontextlost', this.contextLost);
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

  private async buildProgram(params: ShaderParams): Promise<boolean> {
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
      this.lastError = 'Unable to allocate WebGL program.';
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
      gl.bindAttribLocation(prog, POSITION_ATTRIB_LOCATION, 'aPos');
      gl.linkProgram(prog);
      const parallel = gl.getExtension('KHR_parallel_shader_compile');
      const deadline = performance.now() + 5000;
      if (parallel) {
        while (!gl.getProgramParameter(prog, parallel.COMPLETION_STATUS_KHR)) {
          if (this.disposed || generation !== this.compileGeneration || gl.isContextLost()) return false;
          if (performance.now() > deadline) throw new Error('Shader compilation exceeded 5s budget.');
          await new Promise<void>(resolve => setTimeout(resolve, 16));
        }
      } else {
        // Yield before the driver status query. Without the extension this query
        // can still block; a JS timeout cannot preempt a stalled driver.
        await new Promise<void>(resolve => setTimeout(resolve, 0));
      }
      if (this.disposed || generation !== this.compileGeneration || gl.isContextLost()) return false;
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        throw new Error(gl.getProgramInfoLog(prog) || gl.getShaderInfoLog(fs) || 'Shader link failed');
      }
      const oldProgram = this.program;
      this.program = prog;
      this.params = params;
      gl.useProgram(prog);
      if (oldProgram) gl.deleteProgram(oldProgram);
      accepted = true;
    // locate uniforms
    this.uResolution = gl.getUniformLocation(prog, 'uResolution')!;
    this.uTime = gl.getUniformLocation(prog, 'uTime')!;
    this.uDemoTime = gl.getUniformLocation(prog, 'uDemoTime')!;
    this.uTexture = gl.getUniformLocation(prog, 'uTexture')!;
    this.uCaptureRect = gl.getUniformLocation(prog, 'uCaptureRect')!;
    this.uSizeMode = gl.getUniformLocation(prog, 'uSizeMode')!;
    this.uCaptureEnabled = gl.getUniformLocation(prog, 'uCaptureEnabled')!;
    this.uViewportOrigin = gl.getUniformLocation(prog, 'uViewportOrigin')!;
    this.uViewportSize = gl.getUniformLocation(prog, 'uViewportSize')!;

      this.uEffect = gl.getUniformLocation(prog, 'uEffect')!;
      return true;
    } catch (error) {
      this.lastError = String(error);
      console.error('BlackHole: shader build failed', error);
      return false;
    } finally {
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      if (!accepted) gl.deleteProgram(prog);
    }
  }

  private loop = (now: number) => {
    if (!this.running || !this.gl || !this.program) return;
    this.animId = requestAnimationFrame(this.loop);
    if (now + 0.5 < this.nextDrawTime) return;
    // Never queue multiple expensive frames while the GPU is still rendering.
    // Timeout zero polls completion without blocking the editor thread.
    if (this.gpuFence) {
      const gl = this.gl;
      const status = gl.clientWaitSync(this.gpuFence, 0, 0);
      if (status === gl.TIMEOUT_EXPIRED) {
        if (now - this.fenceCreatedAt > 2000) {
          this.stop();
          this.onFatalError?.('GPU frame exceeded the 2s safety budget.');
        }
        return;
      }
      gl.deleteSync(this.gpuFence);
      this.gpuFence = null;
      if (status === gl.WAIT_FAILED) {
        this.stop();
        this.onFatalError?.('GPU frame synchronization failed.');
        return;
      }
    }

    try {
      this.renderFrame(now);
      // Advance a deadline, not a floating-point modulo of the last timestamp.
      // No catch-up draws: after a stall only the next future slot is scheduled.
      this.nextDrawTime = this.nextDrawTime
        ? this.nextDrawTime + Math.max(1, Math.floor((now + 0.5 - this.nextDrawTime) / this.frameIntervalMs) + 1) * this.frameIntervalMs
        : now + this.frameIntervalMs;
    } catch (e) {
      // A throw here would otherwise fire as an uncaught error every frame.
      // Log it once and stop the loop rather than spam the console.
      console.error('BlackHole: render loop error — stopping renderer.', e);
      this.stop();
      this.onFatalError?.('Render loop failed.');
    }
  };

  private renderFrame(now: number) {
    const gl = this.gl!;
    const dt = Math.min((now - this.prevTime) / 1000, 1);
    this.prevTime = now;

    // Adapt only for sustained misses; a 30 Hz display is not a GPU failure.
    const targetSeconds = this.frameIntervalMs / 1000;
    this.dtAvg = this.dtAvg ? this.dtAvg * 0.9 + dt * 0.1 : dt;
    if (this.autoQuality && this.viewportRect && now - this.startTime > 3000
        && this.dtAvg > Math.max(0.05, targetSeconds * 1.8) && now - this.lastScaleAdjust > 2000) {
      this.lastScaleAdjust = now;
      if (this.qualityFactor > this.minQualityFactor) {
        this.qualityFactor = Math.max(this.minQualityFactor, this.qualityFactor * 0.8);
      }
      else {
        this.stop();
        this.onFatalError?.('Rendering exceeded the frame budget at minimum quality.');
        return;
      }
      this.dtAvg = targetSeconds;
    }
    if (this.lastTokenLevel !== this.tokenLevel) {
      const current = this.glidedToken(now / 1000, this.lastTokenLevel);
      this.prevTokenLevel = current;
      this.lastTokenLevel = this.tokenLevel;
      this.lastTokenChange = now / 1000;
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
    this.updateViewportRect(viewportRect);
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
    gl.uniform1f(this.uTime, this.sizeMode === MODE_DEMO ? Math.max(0, now / 1000 - this.demoStart) : now / 1000);
    gl.uniform1f(this.uDemoTime, Math.max(0, now / 1000 - this.demoStart));

    gl.uniform1i(this.uSizeMode, this.sizeMode);
    gl.uniform1i(this.uCaptureEnabled, this.captureEnabled ? 1 : 0);
    gl.uniform4f(this.uCaptureRect, this.captureRect.x, this.captureRect.y,
      this.captureRect.width, this.captureRect.height);
    gl.uniform4f(this.uEffect, this.effectState.x, this.effectState.y,
      this.effectState.radius, this.effectState.intensity);
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
      intensity: this.effectState.intensity, width: viewportSize.width,
      height: viewportSize.height, depth: this.params.lensDepth,
    });
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
      const ext = (diskOuter / B_CRIT) * holeRadius * size;
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
        ? Math.min(positiveMod(Math.max(0, nowSec - this.demoStart), DEMO_SEC) / DEMO_GROW_SEC, 1.0)
        : this.glidedToken(nowSec);
      if (level < 0) return null;
      const g = Math.pow(clamp(level, 0, 1), p.tokenEase);
      intensity = mix(0.10, 1.0, g);
      const rhMin = Math.sqrt((p.tokenAreaMin * aspect) / Math.PI);
      const rhMax = Math.sqrt((p.tokenAreaMax * aspect) / Math.PI);
      const rhT = mix(rhMin, rhMax, g) * (holeRadius / 0.08);
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
      const t = (this.sizeMode === MODE_DEMO ? Math.max(0, nowSec - this.demoStart) : nowSec) * p.driftSpeed;
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

    const rh = holeRadius * size;
    this.effectState = { x: center.x, y: center.y, radius: rh, intensity };
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
    const doc = this.canvas.ownerDocument;
    const viewport = parent === doc?.body ? doc.defaultView : null;
    const width = viewport?.innerWidth ?? parent.clientWidth;
    const height = viewport?.innerHeight ?? parent.clientHeight;
    if (width === 0 || height === 0) return null;
    return { width, height };
  }

  private ensureViewportRect(
    bounds: EffectBounds,
    viewportWidth: number,
    viewportHeight: number,
  ): EffectBounds {
    const prev = this.viewportRect;
    if (prev && prev.x <= bounds.x && prev.y <= bounds.y
        && prev.x + prev.width >= bounds.x + bounds.width
        && prev.y + prev.height >= bounds.y + bounds.height
        && prev.x + prev.width <= viewportWidth && prev.y + prev.height <= viewportHeight) return prev;
    // Keep backing dimensions stable as the effect moves. Grow only when needed;
    // rebasing inside a padded crop must not resize the canvas every grid crossing.
    const width = Math.min(viewportWidth, Math.max(prev?.width ?? 0,
      Math.ceil((bounds.width + VIEWPORT_PAD_PX * 2) / VIEWPORT_SNAP_PX) * VIEWPORT_SNAP_PX));
    const height = Math.min(viewportHeight, Math.max(prev?.height ?? 0,
      Math.ceil((bounds.height + VIEWPORT_PAD_PX * 2) / VIEWPORT_SNAP_PX) * VIEWPORT_SNAP_PX));
    const next = {
      x: clamp(Math.floor(bounds.x + bounds.width / 2 - width / 2), 0, viewportWidth - width),
      y: clamp(Math.floor(bounds.y + bounds.height / 2 - height / 2), 0, viewportHeight - height),
      width, height,
    };
    this.viewportRect = next;
    return next;
  }

  private updateViewportRect(rect: EffectBounds) {
    if (!this.gl) return;
    const rawDpr = this.canvas.ownerDocument?.defaultView?.devicePixelRatio ?? 1;
    const dpr = Number.isFinite(rawDpr) ? clamp(rawDpr, 1, MAX_DEVICE_PIXEL_RATIO) : 1;
    const requestedScale = clamp(this.renderScale, this.minRenderScale, 1) * dpr;
    // Apply adaptation AFTER all hard caps: every quality drop must reduce real
    // fragments, even when a large/HiDPI crop already hits the pixel ceiling.
    const renderScale = Math.min(
      requestedScale,
      Math.sqrt(MAX_RENDER_PIXELS / (rect.width * rect.height)),
      MAX_RENDER_DIMENSION / rect.width,
      MAX_RENDER_DIMENSION / rect.height,
    ) * this.qualityFactor;
    const backingWidth = Math.max(1, Math.floor(rect.width * renderScale));
    const backingHeight = Math.max(1, Math.floor(rect.height * renderScale));
    if (this.canvas.width !== backingWidth || this.canvas.height !== backingHeight) {
      this.canvas.width = backingWidth;
      this.canvas.height = backingHeight;
      this.gl.viewport(0, 0, backingWidth, backingHeight);
    }
    // Place the crop on the global backing-pixel grid, not an arbitrary CSS
    // grid: a fractional sample phase change makes thin bright rings shimmer.
    rect.x = Math.round(rect.x * backingWidth / rect.width) * rect.width / backingWidth;
    rect.y = Math.round(rect.y * backingHeight / rect.height) * rect.height / backingHeight;
    this.canvas.style.visibility = 'visible';
    this.canvas.style.width = `${rect.width}px`;
    this.canvas.style.height = `${rect.height}px`;
    this.canvas.style.transform = `translate3d(${rect.x}px, ${rect.y}px, 0)`;
  }

  private hideCanvas() {
    this.viewportRect = null;
    this.canvas.style.visibility = 'hidden';
    this.onEffectFrame?.(null);
  }

  private glidedToken(nowSec: number, cur = this.tokenLevel): number {
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
