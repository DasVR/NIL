---
name: nil-interaction-primitives
description: Implementations for NIL's JS-driven interaction primitives — magnetic pull, scramble decode, stream autoscroll pinning, and the command palette. Use when building or modifying any interactive surface in NIL, or when a component needs behavior that isn't pure CSS. Do not hand-roll these; import them.
---

# NIL interaction primitives

Three of the ten primitives need JavaScript. They live in `src/lib/motion/` as Svelte 5
attachments and are imported, never reimplemented. The other seven are pure CSS in
`src/lib/styles/motion.css`.

All three honor `prefers-reduced-motion` internally — callers do not need to check.

---

## MAGNETIC — `src/lib/motion/magnetic.svelte.ts`

Primary CTAs only, max three per screen. Writes `--mx`/`--my`; CSS owns the spring return.

```ts
type Opts = { radius?: number; pull?: number };

export function magnetic(node: HTMLElement, opts: Opts = {}) {
  const { radius = 90, pull = 0.28 } = opts;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let frame = 0;

  const onMove = (e: PointerEvent) => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      const r = node.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const dist = Math.hypot(dx, dy);
      if (dist > radius) return reset();
      node.dataset.engaged = 'true';
      node.style.setProperty('--mx', `${dx * pull}px`);
      node.style.setProperty('--my', `${dy * pull}px`);
    });
  };

  const reset = () => {
    node.dataset.engaged = 'false';
    node.style.setProperty('--mx', '0px');
    node.style.setProperty('--my', '0px');
  };

  window.addEventListener('pointermove', onMove, { passive: true });
  node.addEventListener('pointerleave', reset);

  return () => {
    cancelAnimationFrame(frame);
    window.removeEventListener('pointermove', onMove);
    node.removeEventListener('pointerleave', reset);
  };
}
```

Usage: `<button class="nil-magnetic nil-lift nil-halo" {@attach magnetic}>Run hunt</button>`

---

## SCRAMBLE — `src/lib/motion/scramble.svelte.ts`

Fires only on machine-resolved values. Reserves final width first so the row never reflows.

```ts
const GLYPHS = '01·/\\<>[]{}#$%&*+=-_abcdef';

export function scramble(node: HTMLElement, value: () => string) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    $effect(() => { node.textContent = value(); });
    return;
  }

  $effect(() => {
    const target = value();
    const chars = [...target];
    node.dataset.settling = 'true';
    node.setAttribute('aria-label', target);   // SR gets the value immediately
    node.style.minInlineSize = `${node.offsetWidth || chars.length}ch`;

    const start = performance.now();
    const DURATION = 520;
    let frame = 0;

    const tick = (now: number) => {
      const t = Math.min((now - start) / DURATION, 1);
      const settled = Math.floor(t * chars.length * 1.35);
      node.textContent = chars
        .map((c, i) => (i < settled || c === ' ' ? c : GLYPHS[(Math.random() * GLYPHS.length) | 0]))
        .join('');
      if (t < 1) frame = requestAnimationFrame(tick);
      else { node.textContent = target; node.dataset.settling = 'false'; }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  });
}
```

Mark the node `aria-hidden="false"` with the `aria-label` set above so screen readers
announce the resolved value once, not every scrambled frame.

---

## PINNED AUTOSCROLL — `src/lib/motion/pinned.svelte.ts`

The most important behavior in the app. The stream follows new output **only while the
user is already at the bottom**. Scrolling up releases the pin permanently until the user
returns or presses "Jump to latest".

```ts
export function pinned(node: HTMLElement, onChange: (isPinned: boolean) => void) {
  let isPinned = true;
  const THRESHOLD = 48; // px of slack — users rarely sit at exactly 0

  const atBottom = () =>
    node.scrollHeight - node.scrollTop - node.clientHeight < THRESHOLD;

  const onScroll = () => {
    const next = atBottom();
    if (next !== isPinned) { isPinned = next; onChange(isPinned); }
  };

  const observer = new MutationObserver(() => {
    if (isPinned) node.scrollTo({ top: node.scrollHeight, behavior: 'instant' });
  });

  node.addEventListener('scroll', onScroll, { passive: true });
  observer.observe(node, { childList: true, subtree: true, characterData: true });

  return () => { node.removeEventListener('scroll', onScroll); observer.disconnect(); };
}
```

`behavior: 'instant'` is deliberate — smooth scrolling on every streamed token produces
a permanently lagging viewport.

---

## COMMAND PALETTE

Use the Popover API with `popovertarget`, not a bespoke overlay. Native gives top-layer
promotion, light-dismiss, and Esc for free; SETTLE in `motion.css` already styles the
entry and exit.

```svelte
<button popovertarget="nil-cmd" class="nil-halo">Commands <kbd>⌘K</kbd></button>
<div popover="auto" id="nil-cmd" class="nil-palette" role="dialog" aria-label="Commands">
  <!-- input + results -->
</div>
```

Bind ⌘K / Ctrl+K to `document.getElementById('nil-cmd').togglePopover()`. Feature-detect
`"popover" in HTMLElement.prototype` and lazily import `@oddbird/popover-polyfill` only
when missing.

Palette contents are the app's whole verb list — every action reachable by mouse must be
reachable here, phrased identically. If a button says "Confirm finding", the palette entry
says "Confirm finding", not "Findings: confirm".
