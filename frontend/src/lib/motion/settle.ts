import { cubicOut } from 'svelte/easing';

/**
 * SETTLE (motion.css primitive 08) as a Svelte transition, for top-layer
 * surfaces that aren't a native <dialog>/[popover] — CommandPalette,
 * SettingsSheet — where @starting-style can't reach an {#if}-removed node.
 * Mirrors --dur-enter / --ease-out / the 0.97 scale + 4px lift by hand.
 */
interface SettleOpts {
  duration?: number;
  /** Prepended to the transform — pass a positioning transform (e.g. centering) that must survive the animation. */
  base?: string;
}

export function settle(_node: Element, { duration = 160, base = '' }: SettleOpts = {}) {
  return {
    duration,
    easing: cubicOut,
    css: (t: number, u: number) => `
      opacity: ${t};
      transform: ${base} scale(${1 - u * 0.03}) translateY(${u * 4}px);
    `,
  };
}
