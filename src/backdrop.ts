export interface LensFrame {
  x: number;
  y: number;
  radius: number;
  intensity: number;
  width: number;
  height: number;
  depth: number;
}

const SVG_NS = 'http://www.w3.org/2000/svg';
const MAP_SIZE = 128;
const MAX_FILTER_PIXELS = 1_048_576;
let nextId = 0;

/** Inward-only sampling: every source lies between the destination and center. */
export function displacementMap(size = MAP_SIZE): Uint8ClampedArray {
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

export interface LensGeometry {
  left: number; top: number; width: number; height: number;
  mapX: number; mapY: number; diameter: number; scale: number;
}

export function lensGeometry(frame: LensFrame, note: {left: number; top: number; right: number; bottom: number},
  dpr: number): LensGeometry | null {
  if (![frame.x, frame.y, frame.radius, frame.intensity, frame.depth,
    note.left, note.top, note.right, note.bottom].every(Number.isFinite)) return null;
  if (frame.radius <= 0 || frame.intensity <= 0 || frame.depth <= 0) return null;
  // Do not refract another pane when the moving hole is outside the active note.
  if (frame.x <= note.left + 2 || frame.x >= note.right - 2
    || frame.y <= note.top + 2 || frame.y >= note.bottom - 2) return null;
  const pixelRatio = Number.isFinite(dpr) ? Math.max(1, dpr) : 1;
  const radius = Math.min(frame.radius * 6, Math.sqrt(MAX_FILTER_PIXELS) / (2 * pixelRatio));
  if (radius < 2) return null;
  const left = Math.max(note.left + 1, frame.x - radius);
  const top = Math.max(note.top + 1, frame.y - radius);
  const right = Math.min(note.right - 1, frame.x + radius);
  const bottom = Math.min(note.bottom - 1, frame.y + radius);
  if (right <= left || bottom <= top) return null;
  return {left, top, width: right - left, height: bottom - top,
    mapX: frame.x - radius - left, mapY: frame.y - radius - top, diameter: radius * 2,
    scale: radius * Math.min(1.6, frame.depth / 13 * 0.9) * Math.min(1, frame.intensity / 0.1)};
}

/** Real-time compositor lens. No note traversal, snapshots, timers or observers. */
export class BackdropLens {
  readonly supported: boolean;
  private layer: HTMLDivElement;
  private svg: SVGSVGElement;
  private filter: SVGFilterElement;
  private image: SVGFEImageElement;
  private displacement: SVGFEDisplacementMapElement;
  private target: HTMLElement | null = null;
  private suspended = true;
  private enabled = false;
  private disposed = false;
  private lastFrame: LensFrame | null = null;
  private geometryKey = '';

  constructor(private host: HTMLElement) {
    const doc = host.ownerDocument;
    this.supported = !!doc.defaultView?.CSS?.supports('backdrop-filter', 'url(#blackhole-probe)');
    const make = <K extends keyof SVGElementTagNameMap>(tag: K) => doc.createElementNS(SVG_NS, tag);
    this.layer = doc.createElement('div');
    this.layer.className = 'blackhole-backdrop';
    this.layer.setAttribute('aria-hidden', 'true');
    this.layer.style.display = 'none';
    this.svg = make('svg');
    this.svg.setAttribute('width', '0'); this.svg.setAttribute('height', '0');
    this.svg.style.position = 'absolute'; this.svg.setAttribute('aria-hidden', 'true');
    this.svg.classList.add('blackhole-filter-defs');
    this.filter = make('filter');
    this.filter.id = `blackhole-lens-${++nextId}`;
    this.filter.setAttribute('filterUnits', 'userSpaceOnUse');
    this.filter.setAttribute('primitiveUnits', 'userSpaceOnUse');
    this.filter.setAttribute('color-interpolation-filters', 'sRGB');
    this.filter.setAttribute('x', '0'); this.filter.setAttribute('y', '0');
    this.image = make('feImage'); this.image.setAttribute('result', 'encoded-map');
    this.image.setAttribute('preserveAspectRatio', 'none');
    // Map 128 to EXACTLY .5; otherwise 8-bit neutral gray drifts live text.
    const transfer = make('feComponentTransfer');
    transfer.setAttribute('in', 'encoded-map'); transfer.setAttribute('result', 'map');
    for (const tag of ['feFuncR', 'feFuncG'] as const) {
      const fn = make(tag); fn.setAttribute('type', 'linear');
      fn.setAttribute('slope', String(255 / 254)); fn.setAttribute('intercept', String(-1 / 254));
      transfer.appendChild(fn);
    }
    this.displacement = make('feDisplacementMap');
    this.displacement.setAttribute('in', 'SourceGraphic'); this.displacement.setAttribute('in2', 'map');
    this.displacement.setAttribute('xChannelSelector', 'R'); this.displacement.setAttribute('yChannelSelector', 'G');
    this.filter.append(this.image, transfer, this.displacement); this.svg.appendChild(this.filter);
    if (this.supported) {
      const canvas = doc.createElement('canvas'); canvas.width = canvas.height = MAP_SIZE;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Unable to create lens displacement map');
      const pixels = ctx.createImageData(MAP_SIZE, MAP_SIZE); pixels.data.set(displacementMap());
      ctx.putImageData(pixels, 0, 0); this.image.setAttribute('href', canvas.toDataURL('image/png'));
      this.layer.style.backdropFilter = `url(#${this.filter.id})`;
      host.append(this.svg, this.layer);
    }
  }

  setTarget(target: HTMLElement | null) {
    this.target = target?.ownerDocument === this.host.ownerDocument ? target : null;
    this.hide();
  }
  setEnabled(enabled: boolean) { this.enabled = enabled; if (!enabled) this.hide(); }
  setSuspended(suspended: boolean) { this.suspended = suspended; if (suspended) this.hide(); }
  private hide() { this.layer.style.display = 'none'; }

  update(frame: LensFrame | null) {
    this.lastFrame = frame;
    if (this.disposed || !this.supported || !this.enabled || this.suspended || !frame
      || !this.target?.isConnected || this.target.getClientRects().length === 0) { this.hide(); return; }
    const view = this.host.ownerDocument.defaultView!;
    const rect = this.target.getBoundingClientRect();
    const note = {left: Math.max(0, rect.left), top: Math.max(0, rect.top),
      right: Math.min(view.innerWidth, rect.right), bottom: Math.min(view.innerHeight, rect.bottom)};
    const geometry = lensGeometry(frame, note, view.devicePixelRatio);
    if (!geometry) { this.hide(); return; }
    const g = geometry;
    const key = [g.left, g.top, g.width, g.height, g.mapX, g.mapY, g.diameter, g.scale].join(',');
    if (key === this.geometryKey) { this.layer.style.display = 'block'; return; }
    this.geometryKey = key;
    this.layer.style.left = `${g.left}px`; this.layer.style.top = `${g.top}px`;
    this.layer.style.width = `${g.width}px`; this.layer.style.height = `${g.height}px`;
    this.filter.setAttribute('width', String(g.width)); this.filter.setAttribute('height', String(g.height));
    this.image.setAttribute('x', String(g.mapX)); this.image.setAttribute('y', String(g.mapY));
    this.image.setAttribute('width', String(g.diameter)); this.image.setAttribute('height', String(g.diameter));
    this.displacement.setAttribute('scale', String(g.scale));
    this.layer.style.display = 'block';
  }

  refresh() { this.update(this.lastFrame); }
  destroy() { this.disposed = true; this.target = null; this.lastFrame = null; this.layer.remove(); this.svg.remove(); }
}
