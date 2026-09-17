import { expoIn, expoOut } from 'svelte/easing';

/**
 * Bridge between motion.css and JS-driven motion (Svelte `css` transitions,
 * element.animate()). Every driver reads its numbers through here so a retune
 * in motion.css lands everywhere at once.
 *
 * The easing pair is exact, not approximate: --ease-out is
 * cubic-bezier(0.16, 1, 0.3, 1), which is easeOutExpo, and --ease-in is
 * cubic-bezier(0.7, 0, 0.84, 0), which is easeInExpo. A Svelte transition on
 * `easeOut` lands on the same curve as a CSS transition on var(--ease-out).
 */
export const easeOut = expoOut;
export const easeIn = expoIn;

/** Resolved cubic-bezier for --ease-pop; WAAPI can't parse a raw var(). */
export const EASE_POP = 'cubic-bezier(0.34, 1.56, 0.64, 1)';

/** A --dur-* token in milliseconds, read off `el` (defaults to :root). */
export function durToken(name: string, fallback: number, el?: Element): number {
  if (typeof document === 'undefined') return fallback;
  const raw = getComputedStyle(el ?? document.documentElement).getPropertyValue(name).trim();
  const n = parseFloat(raw);
  return Number.isFinite(n) ? n : fallback;
}

export function reducedMotion(): boolean {
  if (typeof matchMedia === 'undefined') return false;
  return matchMedia('(prefers-reduced-motion: reduce)').matches;
}
