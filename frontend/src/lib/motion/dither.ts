/** DITHER — 8×8 Bayer wipe / overlay dissolve. Identity beats only. */

export const BAYER_8 = [
  [0, 32, 8, 40, 2, 34, 10, 42],
  [48, 16, 56, 24, 50, 18, 58, 26],
  [12, 44, 4, 36, 14, 46, 6, 38],
  [60, 28, 52, 20, 62, 30, 54, 22],
  [3, 35, 11, 43, 1, 33, 9, 41],
  [51, 19, 59, 27, 49, 17, 57, 25],
  [15, 47, 7, 39, 13, 45, 5, 37],
  [63, 31, 55, 23, 61, 29, 53, 21],
] as const;

export function tokenColor(name: string, fallback: string): string {
  if (typeof document === 'undefined') return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

function parseRgb(color: string): [number, number, number, number] {
  const hex = color.startsWith('#') ? color.slice(1) : '';
  if (hex.length === 6) {
    return [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16), 255];
  }
  const m = color.match(/rgba?\(([^)]+)\)/);
  if (m) {
    const p = m[1].split(',').map((s) => parseFloat(s.trim()));
    return [p[0] ?? 0, p[1] ?? 0, p[2] ?? 0, Math.round((p[3] ?? 1) * 255)];
  }
  return [10, 9, 8, 255];
}

export function easeDither(t: number): number {
  // cubic-bezier(.22,.61,.36,1) approximated via cubic-bezier sample
  return cubicBezier(0.22, 0.61, 0.36, 1, t);
}

function cubicBezier(p1x: number, p1y: number, p2x: number, p2y: number, t: number): number {
  // Newton on x, return y. Good enough for a 720ms wipe.
  let x = t;
  for (let i = 0; i < 6; i++) {
    const cx = 3 * p1x;
    const bx = 3 * (p2x - p1x) - cx;
    const ax = 1 - cx - bx;
    const dx = ((ax * x + bx) * x + cx) * x - t;
    const ddx = (3 * ax * x + 2 * bx) * x + cx;
    if (Math.abs(ddx) < 1e-6) break;
    x -= dx / ddx;
  }
  const cy = 3 * p1y;
  const by = 3 * (p2y - p1y) - cy;
  const ay = 1 - cy - by;
  return ((ay * x + by) * x + cy) * x;
}

export function paintBayer(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  progress: number,
  fill: string,
  invert = false,
) {
  const [r, g, b, a] = parseRgb(fill);
  const img = ctx.createImageData(width, height);
  const data = img.data;
  const p = Math.max(0, Math.min(1, progress));
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const threshold = (BAYER_8[y & 7][x & 7] + 0.5) / 64;
      const on = invert ? p < threshold : p > threshold;
      if (on) {
        const i = (y * width + x) * 4;
        data[i] = r;
        data[i + 1] = g;
        data[i + 2] = b;
        data[i + 3] = a;
      }
    }
  }
  ctx.putImageData(img, 0, 0);
}

export type DitherMode = 'wipe' | 'dissolve';

export function playDither(
  canvas: HTMLCanvasElement,
  opts: { mode?: DitherMode; duration?: number; color?: string; invert?: boolean } = {},
): Promise<void> {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mode = opts.mode ?? 'wipe';
  const color = opts.color ?? tokenColor('--nil-void', '#0a0908');
  const duration = opts.duration ?? 720;

  const fit = () => {
    const r = canvas.getBoundingClientRect();
    const w = Math.max(1, Math.round(r.width));
    const h = Math.max(1, Math.round(r.height));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
  };

  fit();
  const ctx = canvas.getContext('2d');
  if (!ctx) return Promise.resolve();

  if (reduced) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const t0 = performance.now();
    const tick = (now: number) => {
      fit();
      const t = Math.min(1, (now - t0) / duration);
      const p = easeDither(t);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (mode === 'dissolve') {
        // Single flat overlay dissolving by Bayer threshold — no per-frame flicker.
        paintBayer(ctx, canvas.width, canvas.height, 1 - p, color, false);
      } else {
        paintBayer(ctx, canvas.width, canvas.height, p, color, opts.invert ?? false);
      }
      if (t < 1) requestAnimationFrame(tick);
      else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        resolve();
      }
    };
    requestAnimationFrame(tick);
  });
}

/** Static 8×8 dithered waterfall wash. Sized to the canvas at draw time. */
export function paintWaterfall(canvas: HTMLCanvasElement, ink: string, voidColor: string) {
  const r = canvas.getBoundingClientRect();
  const w = Math.max(1, Math.round(r.width));
  const h = Math.max(1, Math.round(r.height));
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const [ir, ig, ib] = parseRgb(ink);
  const [vr, vg, vb] = parseRgb(voidColor);
  const img = ctx.createImageData(w, h);
  const data = img.data;
  for (let y = 0; y < h; y++) {
    const fall = 1 - y / h;
    const density = Math.pow(Math.max(0, fall), 1.35);
    for (let x = 0; x < w; x++) {
      const threshold = (BAYER_8[y & 7][x & 7] + 0.5) / 64;
      const on = density > threshold;
      const i = (y * w + x) * 4;
      if (on) {
        data[i] = ir;
        data[i + 1] = ig;
        data[i + 2] = ib;
        data[i + 3] = Math.round(40 + density * 90);
      } else {
        data[i] = vr;
        data[i + 1] = vg;
        data[i + 2] = vb;
        data[i + 3] = 0;
      }
    }
  }
  ctx.putImageData(img, 0, 0);
}
