/**
 * Workspace capture module.
 *
 * Captures the active Obsidian workspace leaf content to a canvas using
 * `dom-to-image-more`. The plugin periodically triggers captures and uploads
 * the result to the WebGL texture.
 *
 * dom-to-image clones the DOM subtree and computes styles for every node on
 * the MAIN THREAD — for a large note this can take hundreds of ms and freeze
 * the UI. To stay responsive we:
 *   - capture at a modest base cadence (not every frame),
 *   - measure how long each capture took and back the interval off when slow
 *     (so a slow vault can never spend more time capturing than rendering),
 *   - allow capture to be disabled entirely (the lens then warps the
 *     starfield/background only — still a black hole, zero main-thread cost),
 *   - disable ourselves after repeated failures.
 */

import * as domToImage from 'dom-to-image-more';

const DEFAULT_INTERVAL = 700;   // ms between captures (base cadence)
const MAX_INTERVAL = 4000;      // upper bound when backing off
const DEFAULT_SCALE = 0.4;      // sub-res capture for performance
const SLOW_BACKOFF = 3;         // next interval >= lastDuration × this
const MAX_CONSECUTIVE_FAILURES = 5;

export class WorkspaceCapture {
  private lastCapture = 0;
  private el: HTMLElement | null = null;
  private failed = false;
  private failures = 0;
  private inFlight = false;          // don't overlap captures
  private baseInterval = DEFAULT_INTERVAL;
  private currentInterval = DEFAULT_INTERVAL;
  private scale = DEFAULT_SCALE;

  public enabled = true;

  /** The most recent successfully captured canvas. */
  latestCanvas: HTMLCanvasElement | null = null;

  /** Time of the latest successful capture (monotonic). */
  latestCaptureTime = 0;

  setElement(el: HTMLElement | null) { this.el = el; }

  /** Tune cadence / resolution / on-off from settings. */
  setOptions(opts: { enabled?: boolean; intervalMs?: number; scale?: number }) {
    if (opts.enabled !== undefined) this.enabled = opts.enabled;
    if (opts.intervalMs !== undefined) {
      this.baseInterval = Math.max(100, opts.intervalMs);
      this.currentInterval = Math.max(this.currentInterval, this.baseInterval);
    }
    if (opts.scale !== undefined) this.scale = Math.max(0.1, Math.min(1, opts.scale));
  }

  /**
   * Trigger an async capture. Returns `true` if a capture was initiated.
   * Resolves by updating `latestCanvas` when dom-to-image finishes.
   * Rate-limited and self-throttling.
   */
  capture(now: number): boolean {
    if (!this.enabled || this.failed || !this.el || this.inFlight) return false;
    if (now - this.lastCapture < this.currentInterval) return false;
    this.lastCapture = now;

    const el = this.el;
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    if (w === 0 || h === 0) return false;

    const started = performance.now();
    this.inFlight = true;
    try {
      domToImage.toCanvas(el, {
        width: Math.round(w * this.scale),
        height: Math.round(h * this.scale),
        scale: this.scale,
        // CRITICAL: do not let dom-to-image fetch fonts or images. In Obsidian
        // those resolve to `app://` URLs served by the *main process* protocol
        // handler, which decodeURIComponent()s the path and throws an uncaught
        // "URI malformed" — crashing the whole app. A renderer try/catch can't
        // catch a main-process throw, so we must avoid issuing the request.
        // The lensed texture only needs the workspace text/layout, not media.
        disableEmbedFonts: true,
        disableInlineImages: true,
        // reading cross-origin stylesheet cssRules can also throw synchronously
        ignoreCSSRuleErrors: true,
        // belt-and-suspenders: block any remaining non-data URL from being fetched
        filterUrls: (url: string) => url.startsWith('data:'),
        filter: (n: Node) => {
          // skip the blackhole canvas to avoid infinite recursion
          if (n instanceof HTMLElement && n.classList.contains('blackhole-canvas'))
            return false;
          return true;
        },
      }).then((canvas: HTMLCanvasElement) => {
        this.latestCanvas = canvas;
        this.latestCaptureTime = performance.now();
        this.failures = 0;
        this.adjustInterval(performance.now() - started);
      }).catch((e: unknown) => {
        this.noteFailure(e);
      }).then(() => {
        this.inFlight = false;
      });
    } catch (e) {
      // dom-to-image can throw synchronously (e.g. reading cross-origin
      // stylesheet rules) before it ever returns a promise.
      this.inFlight = false;
      this.noteFailure(e);
      return false;
    }

    return true;
  }

  /** Widen the interval when a capture is expensive so we never spend more
   *  time blocking the main thread than the budget allows. */
  private adjustInterval(durationMs: number) {
    this.currentInterval = Math.min(
      MAX_INTERVAL,
      Math.max(this.baseInterval, Math.round(durationMs * SLOW_BACKOFF)),
    );
  }

  private noteFailure(e: unknown) {
    this.failures++;
    if (this.failures >= MAX_CONSECUTIVE_FAILURES) {
      this.failed = true;
      console.error(
        `BlackHole: workspace capture failed ${this.failures}× — disabling capture; ` +
        `the shader will render disk/starfield only.`, e,
      );
    }
  }

  /** Reset failure/backoff state (e.g. after a mode change). */
  reset() {
    this.failed = false;
    this.failures = 0;
    this.currentInterval = this.baseInterval;
  }

  /** A transparent placeholder canvas to seed the texture before first capture. */
  static blankCanvas(w: number, h: number): HTMLCanvasElement {
    const c = document.createElement('canvas');
    c.width = Math.max(1, Math.round(w * DEFAULT_SCALE));
    c.height = Math.max(1, Math.round(h * DEFAULT_SCALE));
    return c;
  }
}
