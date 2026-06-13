/**
 * Workspace capture module.
 *
 * Captures the active Obsidian workspace leaf content to a canvas using
 * `dom-to-image-more`. The plugin periodically triggers captures and uploads
 * the result to the WebGL texture.
 *
 * Rate-limited: captures at most once per CAPTURE_INTERVAL ms.
 * On failure, falls back silently — the shader renders disk/starfield only.
 */

import * as domToImage from 'dom-to-image-more';

const CAPTURE_INTERVAL = 350; // ms between captures (~2.8 fps)
const CAPTURE_SCALE = 0.5; // half-res for performance
const MAX_CONSECUTIVE_FAILURES = 5; // give up capturing after this many in a row

export class WorkspaceCapture {
  private lastCapture = 0;
  private el: HTMLElement | null = null;
  private failed = false;
  private failures = 0;

  /** The most recent successfully captured canvas. */
  latestCanvas: HTMLCanvasElement | null = null;

  /** Time of the latest successful capture (monotonic). */
  latestCaptureTime = 0;

  setElement(el: HTMLElement | null) { this.el = el; }

  /**
   * Trigger an async capture. Returns `true` if a capture was initiated.
   * Resolves by updating `latestCanvas` when dom-to-image finishes.
   * Rate-limited internally. After repeated failures it disables itself so a
   * persistently broken DOM/CSS can't throw on every tick.
   */
  capture(now: number): boolean {
    if (this.failed || !this.el) return false;
    if (now - this.lastCapture < CAPTURE_INTERVAL) return false;
    this.lastCapture = now;

    const el = this.el;
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    if (w === 0 || h === 0) return false;

    try {
      domToImage.toCanvas(el, {
        width: Math.round(w * CAPTURE_SCALE),
        height: Math.round(h * CAPTURE_SCALE),
        scale: CAPTURE_SCALE,
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
      }).catch((e: unknown) => {
        this.noteFailure(e);
      });
    } catch (e) {
      // dom-to-image can throw synchronously (e.g. reading cross-origin
      // stylesheet rules) before it ever returns a promise.
      this.noteFailure(e);
      return false;
    }

    return true;
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

  /** Reset failure state (e.g. after a mode change). */
  reset() { this.failed = false; this.failures = 0; }

  /**
   * Try to take a synchronous capture (won't reflect latest DOM changes
   * but gives us something to start with).
   */
  static blankCanvas(w: number, h: number): HTMLCanvasElement {
    const c = document.createElement('canvas');
    c.width = Math.round(w * CAPTURE_SCALE);
    c.height = Math.round(h * CAPTURE_SCALE);
    return c;
  }
}
