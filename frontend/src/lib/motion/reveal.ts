import { durToken, easeOut, reducedMotion } from './tokens';

/**
 * REVEAL (motion.css primitive 07) as a Svelte transition, for in-flow regions
 * that mount and unmount with {#if} — the run bar, the tool dock, a status
 * list — where the CSS class can't reach a node that no longer exists.
 *
 * A region arriving in the flow is a "region resizing" job (--dur-panel), not
 * a top-layer SETTLE: the neighbours have to move to make room, so the height
 * is what animates. The node's intrinsic block size is measured once when the
 * transition starts, then max-block-size runs 0 → that, with opacity and a 4px
 * lift riding along. This is the one sanctioned layout property (Law 3's
 * block-size exception), used once per mount, never in a loop.
 *
 * Put this on a wrapper with no min-block-size of its own — min wins over max
 * in CSS, so a min-height on the animated node would pin it open.
 */
export function reveal(node: HTMLElement, { duration }: { duration?: number } = {}) {
  const reduced = reducedMotion();
  const dur = duration ?? durToken('--dur-panel', 260);
  const size = node.offsetHeight;
  return {
    duration: reduced ? 80 : dur,
    easing: easeOut,
    css: (t: number, u: number) =>
      reduced
        ? `opacity: ${t};`
        : `overflow: hidden; max-block-size: ${t * size}px; opacity: ${t}; transform: translateY(${u * 4}px);`,
  };
}
