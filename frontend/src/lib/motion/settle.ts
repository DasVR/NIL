import { durToken, easeIn, easeOut, reducedMotion } from './tokens';

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
 * The exit half of SETTLE: the same 4px of travel back down, on --ease-in
 * (exits accelerate away, entrances decelerate in), opacity out. Default is
 * --dur-enter for a single element; pass --dur-panel's value when the leaving
 * thing is a region the neighbours have to close over (the approval gate).
 *
 * Reminder for callers of either half: Svelte transitions are local by
 * default, so an `in:`/`out:` on a node created together with its own
 * {#each}/{#if} block never plays. Add `|global` when the node arrives or
 * leaves as part of a fresh block (a new stream row, the first populate of a
 * list, a whole empty state giving way).
 */
export function leave(_node: Element, { duration }: { duration?: number } = {}) {
  const reduced = reducedMotion();
  const dur = duration ?? durToken('--dur-enter', 160);
  return {
    duration: reduced ? 80 : dur,
    easing: easeIn,
    css: (t: number, u: number) =>
      reduced ? `opacity: ${t};` : `opacity: ${t}; transform: translateY(${u * 4}px);`,
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
