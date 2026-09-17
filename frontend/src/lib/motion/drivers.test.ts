import { describe, expect, it } from 'vitest';
import { expoIn, expoOut } from 'svelte/easing';
import { durToken, easeIn, easeOut, reducedMotion } from './tokens';
import { dissolve, settle } from './settle';
import { reveal } from './reveal';

// Node has no document/matchMedia: the drivers must fall back cleanly rather
// than throw, and every css() string they emit must stay transform/opacity
// (plus the one sanctioned block-size job in REVEAL).

describe('tokens', () => {
  it('falls back to the given ms when no stylesheet is reachable', () => {
    expect(durToken('--dur-enter', 160)).toBe(160);
    expect(durToken('--dur-panel', 260)).toBe(260);
  });

  it('reports no reduced-motion preference without matchMedia', () => {
    expect(reducedMotion()).toBe(false);
  });

  it('easing pair is the expo curves behind --ease-out / --ease-in', () => {
    expect(easeOut).toBe(expoOut);
    expect(easeIn).toBe(expoIn);
    expect(easeOut(0)).toBe(0);
    expect(easeOut(1)).toBe(1);
    expect(easeIn(0)).toBe(0);
    expect(easeIn(1)).toBe(1);
  });
});

const node = {} as Element;

describe('settle', () => {
  it('lands at rest with no residual transform and lifts 4px / 3% at the start', () => {
    const t = settle(node);
    expect(t.duration).toBe(160);
    expect(t.css(1, 0)).toBe('opacity: 1; transform:  scale(1) translateY(0px);');
    expect(t.css(0, 1)).toBe('opacity: 0; transform:  scale(0.97) translateY(4px);');
  });

  it('keeps a positioning base transform through the animation', () => {
    const t = settle(node, { base: 'translateX(-50%)' });
    expect(t.css(1, 0)).toContain('translateX(-50%) scale(1)');
  });

  it('dissolve is opacity only', () => {
    const t = dissolve(node);
    expect(t.duration).toBe(260);
    expect(t.css(0.5)).toBe('opacity: 0.5;');
  });
});

describe('reveal', () => {
  it('runs max-block-size 0 → measured height with opacity and a 4px lift', () => {
    const t = reveal({ offsetHeight: 48 } as HTMLElement);
    expect(t.duration).toBe(260);
    expect(t.css(0, 1)).toBe('overflow: hidden; max-block-size: 0px; opacity: 0; transform: translateY(4px);');
    expect(t.css(1, 0)).toBe('overflow: hidden; max-block-size: 48px; opacity: 1; transform: translateY(0px);');
  });

  it('honours an explicit duration', () => {
    expect(reveal({ offsetHeight: 10 } as HTMLElement, { duration: 160 }).duration).toBe(160);
  });
});
