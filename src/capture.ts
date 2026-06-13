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

export class WorkspaceCapture {
  private lastCapture = 0;
  private el: HTMLElement | null = null;
  private failed = false;

  /** The most recent successfully captured canvas. */
  latestCanvas: HTMLCanvasElement | null = null;

  /** Time of the latest successful capture (monotonic). */
  latestCaptureTime = 0;

  setElement(el: HTMLElement | null) { this.el = el; }

  /**
   * Trigger an async capture. Returns `true` if a capture was initiated.
   * Resolves by updating `latestCanvas` when dom-to-image finishes.
   * Rate-limited internally.
   */
  capture(now: number): boolean {
    if (this.failed || !this.el) return false;
    if (now - this.lastCapture < CAPTURE_INTERVAL) return false;
    this.lastCapture = now;

    const el = this.el;
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    if (w === 0 || h === 0) return false;

    domToImage.toCanvas(el, {
      width: Math.round(w * CAPTURE_SCALE),
      height: Math.round(h * CAPTURE_SCALE),
      scale: CAPTURE_SCALE,
      filter: (n: Node) => {
        // skip the blackhole canvas to avoid infinite recursion
        if (n instanceof HTMLElement && n.classList.contains('blackhole-canvas'))
          return false;
        return true;
      },
    }).then((canvas: HTMLCanvasElement) => {
      this.latestCanvas = canvas;
      this.latestCaptureTime = performance.now();
    }).catch(() => {
      // silent fallback — shader renders against transparent bg
    });

    return true;
  }

  /** Reset failure state. */
  reset() { this.failed = false; }

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
