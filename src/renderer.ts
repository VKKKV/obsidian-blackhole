import { VS, makeFS, ShaderParams } from './shader';

/**
 * WebGL2 renderer — compiles the shader, manages uniforms, runs the render loop.
 * Settings that change const values trigger a shader recompile via `recompile()`.
 */
export class BlackHoleRenderer {
  private canvas: HTMLCanvasElement;
  private gl: WebGL2RenderingContext | null = null;
  private program: WebGLProgram | null = null;
  private vao: WebGLVertexArrayObject | null = null;
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

  // state
  public tokenLevel = 0.0;
  public prevTokenLevel = 0.0;
  public lastTokenChange = 0.0;
  private lastTokenLevel = 0.0;
  public lastActivity = 0.0;
  public sizeMode = 1;

  private prevTime = 0;
  private frameCount = 0;
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
    });
    if (!gl) return false;
    this.gl = gl;

    if (!this.buildProgram()) return false;

    // fullscreen quad VAO
    this.vao = gl.createVertexArray()!;
    gl.bindVertexArray(this.vao);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(this.program!, 'aPos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
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
    const parent = this.canvas.parentElement;
    if (!parent) return;
    const w = parent.clientWidth;
    const h = parent.clientHeight;
    if (w === 0 || h === 0) return;
    this.canvas.width = w;
    this.canvas.height = h;
    this.gl.viewport(0, 0, w, h);
  }

  getSize(): { width: number; height: number } {
    return { width: this.canvas.width, height: this.canvas.height };
  }

  destroy() {
    this.stop();
    this.resizeObserver.disconnect();
    const gl = this.gl;
    if (gl && this.program) gl.deleteProgram(this.program);
    if (gl && this.workspaceTex) gl.deleteTexture(this.workspaceTex);
    this.gl = null;
  }

  // ---- internal ----

  private buildProgram(): boolean {
    const gl = this.gl!;

    const vs = this.compile(gl.VERTEX_SHADER, VS);
    const fs = this.compile(gl.FRAGMENT_SHADER, makeFS(this.params));
    if (!vs || !fs) return false;

    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error('Shader link error:', gl.getProgramInfoLog(prog));
      return false;
    }

    // clean up intermediate shaders
    gl.deleteShader(vs);
    gl.deleteShader(fs);

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

    const gl = this.gl;
    const dt = Math.min((now - this.prevTime) / 1000, 0.1);
    this.prevTime = now;
    this.frameCount++;

    gl.useProgram(this.program);
    gl.uniform2f(this.uResolution, this.canvas.width, this.canvas.height);
    gl.uniform1f(this.uTime, now / 1000);
    gl.uniform1f(this.uTimeDelta, dt);
    gl.uniform1i(this.uFrame, this.frameCount);
    gl.uniform1f(this.uLastActivity, this.lastActivity);

    const d = new Date();
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

    gl.bindVertexArray(this.vao);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.bindVertexArray(null);
  };
}
