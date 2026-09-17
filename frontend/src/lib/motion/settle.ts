import { durToken, easeOut, reducedMotion } from './tokens';

/**
 * SETTLE (motion.css primitive 08) as a Svelte transition, for top-layer
 * surfaces that aren't a native <dialog>/[popover] — mention lists, the model
 * picker, the jump-to-latest badge, prompt cards — where @starting-style can't
 * reach an {#if}-removed node. Mirrors --dur-enter / --ease-out / the 0.97
 * scale + 4px lift by hand. Under reduced motion the travel collapses and only
 * the opacity remains, matching the CSS rule.
 */
interface SettleOpts {
  duration?: number;
  /** Prepended to the transform — pass a positioning transform (e.g. centering) that must survive the animation. */
  base?: string;
}

export function settle(_node: Element, { duration, base = '' }: SettleOpts = {}) {
  const reduced = reducedMotion();
  const dur = duration ?? durToken('--dur-enter', 160);
  return {
    duration: reduced ? 80 : dur,
    easing: easeOut,
    css: (t: number, u: number) =>
      reduced
        ? `opacity: ${t};${base ? ` transform: ${base};` : ''}`
        : `opacity: ${t}; transform: ${base} scale(${1 - u * 0.03}) translateY(${u * 4}px);`,
  };
}

/**
 * Opacity-only companion to SETTLE for a region that is being clipped away by
 * its parent (a rail panel while the rail's width collapses). No travel: the
 * parent already moves, a second transform would fight it.
 */
export function dissolve(_node: Element, { duration }: { duration?: number } = {}) {
  const dur = duration ?? durToken('--dur-panel', 260);
  return {
    duration: reducedMotion() ? 80 : dur,
    easing: easeOut,
    css: (t: number) => `opacity: ${t};`,
  };
}
