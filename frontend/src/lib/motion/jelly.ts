/** JELLY — mode-segment pill landing. See motion.css primitive 11. */

export type JellyDirection = 'left' | 'right';

const KEYFRAMES: Keyframe[] = [
  { transform: 'scaleX(1)' },
  { transform: 'scaleX(1.18)', offset: 0.28 },
  { transform: 'scaleX(0.92)', offset: 0.52 },
  { transform: 'scaleX(1.05)', offset: 0.76 },
  { transform: 'scaleX(1)' },
];

function msToken(el: HTMLElement, name: string, fallback: number): number {
  const raw = getComputedStyle(el).getPropertyValue(name).trim();
  const n = parseFloat(raw);
  return Number.isFinite(n) ? n : fallback;
}

export function jelly(el: HTMLElement, direction: JellyDirection) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const origin = direction === 'right' ? 'right center' : 'left center';
  el.style.setProperty('--jelly-origin', origin);
  el.style.transformOrigin = origin;
  el.animate(KEYFRAMES, {
    // parseFloat'd token + a resolved cubic-bezier (WAAPI can't parse a raw
    // var(--ease-pop) string); --ease-pop is that curve.
    duration: msToken(el, '--dur-jelly', 320),
    easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  });
}
