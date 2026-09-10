/**
 * Opt-in, dirty-driven workspace snapshots. DOM cloning/computed styles still
 * run on the main thread: preflight limits and a circuit breaker reduce risk,
 * but neither a timeout nor a smaller output canvas can interrupt that work.
 */
import * as domToImage from 'dom-to-image-more';

const DEFAULT_INTERVAL = 1500;
const DEFAULT_SCALE = 0.25; // Output resolution only, not a DOM-cost control.
const SLOW_BACKOFF = 3;
const MAX_CONSECUTIVE_FAILURES = 5;
const MAX_PREFLIGHT_ATTEMPTS = 3;
const SETTLE_DELAY_MS = 350;
const MAX_CAPTURE_MS = 1000;
const MAX_PREFLIGHT_MS = 100;
const MAX_NODES = 1000;
const MAX_DEPTH = 80;
const MAX_TEXT_CHARS = 100_000;
const HTML_NAMESPACE = 'http://www.w3.org/1999/xhtml';
const EXCLUDED_TAGS = new Set([
  'img', 'picture', 'source', 'video', 'audio', 'track', 'canvas',
  'iframe', 'frame', 'frameset', 'object', 'embed', 'script', 'style',
  'link', 'base', 'meta', 'svg', 'image', 'use', 'input', 'slot', 'template',
]);

// dom-to-image-more has module-global render state. Even a replacement instance
// must wait for a destroyed instance's underlying operation to actually settle.
let libraryBusy = false;

export type CaptureRect = { left: number; top: number; width: number; height: number };
type CaptureListener = (canvas: HTMLCanvasElement, captureTime: number, rect: CaptureRect | null) => void;
type AvailabilityListener = (available: boolean) => void;
type CaptureOptions = domToImage.Options & {
  filterUrls?: (url: string, baseUrl?: string) => boolean;
  preserveScroll?: boolean;
  loadExternalStyleSheet?: boolean;
  adjustPseudoElement?: () => false;
};

function includeNode(node: Node): boolean {
  if (node.nodeType !== 1) return node.nodeType === 3;
  const el = node as Element;
  // Avoid resource-bearing nodes BEFORE cloneNode(false), not in onclone when
  // assigning src may already have started a load. Custom elements/shadow hosts
  // are excluded because their constructors/rendered subtree aren't bounded here.
  return el.namespaceURI === HTML_NAMESPACE &&
    !EXCLUDED_TAGS.has(el.localName) && !el.localName.includes('-') &&
    !el.hasAttribute('is') && !el.shadowRoot &&
    !el.classList.contains('blackhole-canvas');
}

function placeholderFor(el: Element, style: CSSStyleDeclaration): HTMLElement | null {
  if (/^(script|style|link|base|meta|source|track|template|slot)$/.test(el.localName)) return null;
  const rect = el.getBoundingClientRect();
  if (!rect.width || !rect.height) return null;
  const box = el.ownerDocument.createElement('span');
  // Never clone a resource/custom element; preserve only its measured layout box.
  for (const name of ['display', 'position', 'float', 'clear', 'vertical-align',
    'margin-top', 'margin-right', 'margin-bottom', 'margin-left', 'top', 'left',
    'right', 'bottom', 'align-self', 'order', 'grid-area', 'flex-shrink', 'flex-grow']) {
    box.style.setProperty(name, style.getPropertyValue(name));
  }
  box.style.display = style.display === 'inline' ? 'inline-block' : style.display;
  box.style.boxSizing = 'border-box';
  box.style.width = `${rect.width}px`;
  box.style.height = `${rect.height}px`;
  box.style.visibility = 'hidden';
  return box;
}

function includeStyle(_node: Node, name: string): boolean {
  if (name === 'background-color') return true; // Pure colors cannot fetch resources.
  // Strip common CSS resource-bearing properties, including custom properties
  // that could feed them. This is defense in depth, not a zero-request guarantee:
  // browser style copying and third-party internals are not a network sandbox.
  return !/^(--|background|border-image|list-style|mask|-webkit-mask|cursor|content|filter|backdrop-filter|-webkit-filter|clip-path|shape-outside|offset-path|animation|transition)/.test(name);
}

function captureBackgrounds(root: HTMLElement): string[] {
  const view = root.ownerDocument?.defaultView;
  const colors: string[] = [];
  if (!view) return colors;
  // The root's own background is already in the snapshot. Only paint ancestors
  // behind it afterwards; the library's bgcolor option overwrites the root.
  let node = root.parentElement;
  for (let depth = 0; node && depth < 80; depth++, node = node.parentElement) {
    colors.push(view.getComputedStyle(node).backgroundColor);
  }
  colors.push('#ffffff');
  return colors;
}

function notify(callback: (() => void) | null): boolean {
  if (!callback) return true;
  try {
    // Async functions are assignable to void callbacks; consume their rejection
    // too, without letting listener failures escape the capture promise chain.
    void Promise.resolve(callback()).catch((error: unknown) => {
      console.error('BlackHole: capture listener rejected.', error);
    });
    return true;
  } catch (error) {
    console.error('BlackHole: capture listener threw.', error);
    return false;
  }
}

export class WorkspaceCapture {
  private el: HTMLElement | null = null;
  private failed = false;
  private failures = 0;
  private preflightFailures = 0;
  private notBefore = 0;
  private observer: MutationObserver | null = null;
  private observedElement: HTMLElement | null = null;
  private onNoteScroll = () => this.waitForLayout();
  private inFlight = false;
  private generation = 0;
  private dirty = true;
  private suspended = false;
  private destroyed = false;
  private captureEnabled = false;
  private available = false;
  private availabilityListener: AvailabilityListener | null = null;
  private lastCompletion = -Infinity;
  private lastDuration = 0;
  private baseInterval = DEFAULT_INTERVAL;
  private scale = DEFAULT_SCALE;
  private deadlineTimer: ReturnType<typeof setTimeout> | null = null;

  public onCapture: CaptureListener | null = null;
  public onBlocked: ((reason: string) => void) | null = null;
  latestCanvas: HTMLCanvasElement | null = null;
  /** Time of the latest successful capture (performance.now() clock). */
  latestCaptureTime = 0;

  get enabled(): boolean { return this.captureEnabled; }
  set enabled(value: boolean) {
    if (this.destroyed || value === this.captureEnabled) return;
    this.captureEnabled = value;
    if (value) this.reset();
    else this.invalidate();
    this.watchContent();
  }

  get onAvailabilityChange(): AvailabilityListener | null {
    return this.availabilityListener;
  }
  set onAvailabilityChange(listener: AvailabilityListener | null) {
    if (this.destroyed) return;
    this.availabilityListener = listener;
    // A newly wired renderer must learn that no snapshot exists yet.
    if (listener) notify(() => listener(this.available));
  }

  setElement(el: HTMLElement | null) {
    if (this.destroyed || this.el === el) return;
    this.el = el;
    this.reset();
    this.watchContent();
  }

  setSuspended(suspended: boolean) {
    if (this.destroyed || suspended === this.suspended) return;
    this.suspended = suspended;
    this.invalidate();
    this.watchContent();
  }

  /** Tune cadence / output resolution / opt-in state; invalid numbers are ignored. */
  setOptions(opts: { enabled?: boolean; intervalMs?: number; scale?: number }) {
    if (this.destroyed) return;
    if (opts.intervalMs !== undefined && Number.isFinite(opts.intervalMs)) {
      this.baseInterval = Math.max(100, opts.intervalMs);
    }
    if (opts.scale !== undefined && Number.isFinite(opts.scale)) {
      const scale = Math.max(0.1, Math.min(1, opts.scale));
      if (scale !== this.scale) {
        this.scale = scale;
        this.invalidate();
      }
    }
    if (opts.enabled !== undefined) this.enabled = opts.enabled;
  }

  /** Poll using performance.now(); returns true only when toCanvas was started. */
  capture(now: number): boolean {
    if (this.destroyed || !this.enabled || this.suspended || this.failed ||
        !this.el || this.inFlight || libraryBusy || !this.dirty) return false;
    if (this.observer?.takeRecords().length) { this.waitForLayout(); return false; }
    // Cool down AFTER completion. No cap may shorten the user's base interval.
    const interval = Math.max(this.baseInterval, this.lastDuration * SLOW_BACKOFF);
    if (!Number.isFinite(now) || now < this.notBefore || now - this.lastCompletion < interval) return false;

    const el = this.el;
    const generation = this.generation;
    const started = performance.now();
    let width: number;
    let height: number;
    let backgrounds: string[] = [];
    let rect: CaptureRect | null = null;
    const hiddenNodes = new WeakSet<Node>();
    const placeholders = new WeakMap<Node, HTMLElement>();
    const clones = new WeakMap<Node, Node>();
    try {
      if (!el.isConnected) {
        this.invalidate();
        return false;
      }
      const unsafe = this.preflight(el, started, hiddenNodes, placeholders);
      if (unsafe) {
        this.deferPreflight(unsafe, started);
        return false;
      }
      rect = el.getBoundingClientRect?.() ?? null;
      width = el.offsetWidth;
      height = el.offsetHeight;
      if (width <= 0 || height <= 0) {
        this.invalidate();
        return false;
      }
      backgrounds = captureBackgrounds(el);
      if (performance.now() - started > MAX_PREFLIGHT_MS) {
        this.deferPreflight('DOM preflight/layout exceeded its time budget', started);
        return false;
      }
    } catch (error) {
      this.recordCompletion(started);
      this.noteFailure(error);
      return false;
    }

    this.inFlight = true;
    libraryBusy = true;
    this.dirty = false;
    this.deadlineTimer = setTimeout(() => {
      this.deadlineTimer = null;
      if (this.isCurrent(generation, el)) this.trip('capture deadline exceeded');
      // Do NOT release either lock here: the library operation is still running.
      // Timers also cannot preempt synchronous cloning or a microtask backlog.
    }, MAX_CAPTURE_MS);

    const settle = (canvas: HTMLCanvasElement | null, error?: unknown) => {
      this.clearDeadline();
      this.recordCompletion(started);
      try {
        if (!this.isCurrent(generation, el)) return;
        if (!el.isConnected) {
          this.invalidate();
          return;
        }
        if (this.lastDuration >= MAX_CAPTURE_MS) {
          this.trip('capture exceeded its time budget');
          return;
        }
        if (!canvas) {
          this.noteFailure(error);
          return;
        }
        const currentRect = el.getBoundingClientRect?.();
        if (rect && currentRect && ['left', 'top', 'width', 'height'].some(key =>
          Math.abs(rect![key as keyof CaptureRect] - currentRect[key as keyof CaptureRect]) > 1)) {
          this.invalidate();
          return;
        }
        if (backgrounds.length) {
          const ctx = canvas.getContext('2d');
          if (!ctx) throw new Error('Snapshot 2D context unavailable');
          ctx.save();
          ctx.setTransform(1, 0, 0, 1, 0, 0);
          ctx.globalCompositeOperation = 'destination-over';
          for (const color of backgrounds) {
            ctx.fillStyle = color;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }
          ctx.restore();
          this.recordCompletion(started);
          if (this.lastDuration >= MAX_CAPTURE_MS) { this.trip('capture exceeded its time budget'); return; }
        }
        this.latestCanvas = canvas;
        this.latestCaptureTime = this.lastCompletion;
        this.failures = 0;
        this.preflightFailures = 0;
        const listener = this.onCapture;
        const delivered = notify(listener ? () => listener(canvas, this.latestCaptureTime, rect) : null);
        // Listeners may disable, change the target, reset, or destroy us.
        if (!this.isCurrent(generation, el)) return;
        if (!delivered) {
          this.noteFailure(new Error('capture listener failed'));
          return;
        }
        this.setAvailability(true);
      } finally {
        // Only real settlement releases the lock, including stale generations.
        this.inFlight = false;
        libraryBusy = false;
      }
    };

    try {
      const options: CaptureOptions = {
        width,
        height,
        scale: Math.min(this.scale, Math.sqrt(1_048_576 / (width * height)), 4096 / width, 4096 / height),
        preserveScroll: true,
        // Keep resource inlining disabled, especially for Obsidian app:// URLs.
        disableEmbedFonts: true,
        disableInlineImages: true,
        ignoreCSSRuleErrors: true,
        loadExternalStyleSheet: false,
        styleCaching: 'relaxed',
        filterUrls: (url: string) => url.startsWith('data:'),
        filter: (node: Node) => !hiddenNodes.has(node) && includeNode(node),
        filterStyles: includeStyle,
        adjustClonedNode: (original: Node, clone: Node, after: boolean) => {
          clones.set(original, clone);
          if (after) {
            // Children excluded by filter still occupy their original layout slot.
            let next: Node | null = null;
            for (let child = original.lastChild; child; child = child.previousSibling) {
              const box = placeholders.get(child);
              if (box) { clone.insertBefore(box, next); next = box; }
              else {
                const childClone = clones.get(child);
                if (childClone?.parentNode === clone) next = childClone;
              }
            }
          }
          if (clone.nodeType !== 1) return clone;
          const element = clone as Element;
          // Original inline styles otherwise bypass filterStyles in the library.
          // This hook runs before computed-style copying (also after children).
          element.removeAttribute('style');
          for (const attribute of Array.from(element.attributes)) {
            if (/^(on|src|poster$|background$|data$|href$|xlink:href$)/i.test(attribute.name)) {
              element.removeAttribute(attribute.name);
            }
          }
          return clone;
        },
        // Pseudo-elements can contain url() resources independent of filterStyles.
        adjustPseudoElement: () => false,
      };
      void Promise.resolve(domToImage.toCanvas(el, options)).then(
        (canvas: HTMLCanvasElement) => settle(canvas),
        (error: unknown) => settle(null, error),
      ).catch((error: unknown) => {
        // Last-resort containment for unexpected settlement/DOM accessor errors.
        if (this.isCurrent(generation, el)) this.noteFailure(error);
      });
      return true;
    } catch (error) {
      settle(null, error);
      return false;
    }
  }

  /** Bounded traversal: no full querySelectorAll/clone/style read during preflight. */
  private preflight(root: HTMLElement, started: number, hiddenNodes: WeakSet<Node>, placeholders: WeakMap<Node, HTMLElement>): string | null {
    if (!includeNode(root)) return 'unsupported capture root';
    let node: Node | null = root;
    let count = 0;
    let depth = 0;
    let textChars = 0;
    while (node) {
      if (++count > MAX_NODES || depth > MAX_DEPTH) return 'DOM node/depth limit exceeded';
      if (node.nodeType === 3) textChars += (node.nodeValue ?? '').length;
      if (textChars > MAX_TEXT_CHARS) return 'DOM text limit exceeded';
      if ((count & 31) === 0 && performance.now() - started > MAX_PREFLIGHT_MS) {
        return 'DOM preflight exceeded its time budget';
      }
      if (node.nodeType === 1) {
        const view = node.ownerDocument?.defaultView;
        if (view) {
          const style = view.getComputedStyle(node as Element);
          if (style.display === 'none') hiddenNodes.add(node);
          else if (!includeNode(node)) {
            const box = placeholderFor(node as Element, style);
            if (box) placeholders.set(node, box);
          }
        }
      }
      if (!hiddenNodes.has(node) && includeNode(node) && node.firstChild) {
        node = node.firstChild;
        depth++;
        continue;
      }
      while (node !== root && !node.nextSibling) {
        node = node.parentNode;
        depth--;
        if (!node) return 'DOM changed during preflight';
      }
      if (node === root) break;
      node = node.nextSibling;
    }
    return null;
  }

  private isCurrent(generation: number, el: HTMLElement): boolean {
    return generation === this.generation && this.el === el &&
      !this.destroyed && this.enabled && !this.suspended && !this.failed;
  }

  private recordCompletion(started: number) {
    this.lastCompletion = performance.now();
    this.lastDuration = Math.max(0, this.lastCompletion - started);
  }

  private setAvailability(available: boolean) {
    this.available = available;
    const listener = this.availabilityListener;
    if (listener) notify(() => listener(available));
  }

  private invalidate() {
    this.generation++;
    this.dirty = true;
    this.latestCanvas = null;
    this.latestCaptureTime = 0;
    this.setAvailability(false);
  }

  private deferPreflight(reason: string, started: number) {
    this.recordCompletion(started);
    this.preflightFailures++;
    if (this.preflightFailures >= MAX_PREFLIGHT_ATTEMPTS) {
      this.trip(reason);
      return;
    }
    // Aborting preflight is cheap; retry after the normal cooldown. Never retry
    // an expensive completed capture automatically or reset its in-flight lock.
    this.invalidate();
    console.debug('BlackHole: capture preflight deferred:', reason);
  }

  private watchContent() {
    this.observer?.disconnect();
    this.observer = null;
    this.observedElement?.removeEventListener('scroll', this.onNoteScroll, true);
    this.observedElement = null;
    if (!this.el || !this.enabled || this.suspended || this.destroyed) return;
    const Observer = this.el.ownerDocument?.defaultView?.MutationObserver;
    if (!Observer) return;
    this.observer = new Observer(() => this.waitForLayout());
    // Watch only actual note content, not the application or animated canvas.
    // Attribute changes such as cursor blinking must not starve capture forever.
    this.observer.observe(this.el, { childList: true, characterData: true, subtree: true });
    this.observedElement = this.el;
    this.el.addEventListener('scroll', this.onNoteScroll, { capture: true, passive: true });
  }

  /** Discard old-note results and wait for editor/layout transitions to settle. */
  waitForLayout() {
    if (this.destroyed) return;
    this.notBefore = Math.max(this.notBefore, performance.now() + SETTLE_DELAY_MS);
    this.invalidate();
  }

  private trip(reason: string) {
    this.failed = true;
    this.invalidate();
    console.warn(`BlackHole: workspace capture disabled: ${reason}. Toggle capture off/on to retry.`);
    const listener = this.onBlocked;
    if (listener) notify(() => listener(reason));
  }

  private noteFailure(error: unknown) {
    this.failures++;
    if (this.failures >= MAX_CONSECUTIVE_FAILURES) { this.trip('capture repeatedly failed'); return; }
    this.invalidate();
    console.warn('BlackHole: workspace capture failed; using background only.', error);
  }

  /** Explicit retry after a failure. Never releases a running operation or cooldown. */
  reset() {
    if (this.destroyed) return;
    this.failed = false;
    this.failures = 0;
    this.preflightFailures = 0;
    this.invalidate();
  }

  /** Mark changed content; does not bypass cooldown, suspension, or a tripped circuit. */
  requestSoon() { if (!this.destroyed) this.dirty = true; }

  destroy() {
    if (this.destroyed) return;
    this.destroyed = true;
    this.watchContent();
    this.captureEnabled = false;
    this.el = null;
    this.clearDeadline();
    this.invalidate();
    this.onCapture = null;
    this.onBlocked = null;
    this.availabilityListener = null;
  }

  private clearDeadline() {
    if (this.deadlineTimer !== null) clearTimeout(this.deadlineTimer);
    this.deadlineTimer = null;
  }

  /** A transparent placeholder canvas to seed the texture before first capture. */
  static blankCanvas(w: number, h: number): HTMLCanvasElement {
    const c = document.createElement('canvas');
    c.width = Math.max(1, Math.round(w * DEFAULT_SCALE));
    c.height = Math.max(1, Math.round(h * DEFAULT_SCALE));
    return c;
  }
}
