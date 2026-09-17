import { reducedMotion } from './tokens';

/**
 * MORPH pop (motion.css primitive 14) as a one-shot on any control: the send
 * button on a successful send, a confirm that just committed. Same replay
 * pattern as SHAKE — drop the class, force a reflow, re-add — so two sends in
 * a row both pop instead of the second one silently no-op'ing.
 */
export function pop(el: HTMLElement | null | undefined) {
  if (!el || reducedMotion()) return;
  el.classList.remove('nil-pop');
  void el.offsetWidth;
  el.classList.add('nil-pop');
  el.addEventListener('animationend', () => el.classList.remove('nil-pop'), { once: true });
}
