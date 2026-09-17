import { durToken, EASE_POP, reducedMotion } from './tokens';

/** JELLY — mode-segment pill landing. See motion.css primitive 11. */

export type JellyDirection = 'left' | 'right';

const KEYFRAMES: Keyframe[] = [
  { transform: 'scaleX(1)' },
  { transform: 'scaleX(1.18)', offset: 0.28 },
  { transform: 'scaleX(0.92)', offset: 0.52 },
  { transform: 'scaleX(1.05)', offset: 0.76 },
  { transform: 'scaleX(1)' },
];

export function jelly(el: HTMLElement, direction: JellyDirection) {
  if (reducedMotion()) return;
  const origin = direction === 'right' ? 'right center' : 'left center';
  el.style.setProperty('--jelly-origin', origin);
  el.style.transformOrigin = origin;
  el.animate(KEYFRAMES, {
    duration: durToken('--dur-jelly', 320, el),
    easing: EASE_POP,
  });
}
