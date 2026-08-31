---
name: nil-motion
description: Spring physics, reduced-motion, animation rules for NIL. 4 spring curves, edge refraction, prefers-reduced-motion mandatory.
---

# NIL Motion — Spring Physics & Animation Rules

## The 4 Spring Curves (LOCKED)

```css
:root {
  --spring-bouncy:  cubic-bezier(0.34, 1.56, 0.64, 1);   /* playful: hover, badges, toasts, orbit */
  --spring-smooth:  cubic-bezier(0.22, 1, 0.36, 1);      /* UI: panels, layout shifts, strip expand */
  --spring-window:  cubic-bezier(0.32, 0.72, 0, 1);      /* windows, sheets, modals, command palette */
  --spring-snappy:  cubic-bezier(0.25, 0.9, 0.25, 1);    /* quick: buttons, toggles, sidebar items */
}
```

## When to Use Each

| Curve | Use For | Duration |
|-------|---------|----------|
| `--spring-bouncy` | Hover lifts, badge pop-in, toast enter, ThinkingOrbs orbit, BorderBeam sweep | 300-400ms |
| `--spring-smooth` | AI strip expand/collapse, panel resize, sidebar collapse, card flip | 200-300ms |
| `--spring-window` | Settings sheet, command palette, modal, popover | 250-350ms |
| `--spring-snappy` | Button press, toggle flip, sidebar item select, tab switch | 100-150ms |

## Animation Properties (ONLY these)

```css
/* ALLOWED — GPU accelerated */
transform: translateX() translateY() scale() rotate();
opacity;

/* FORBIDDEN — layout thrashing, jank */
width, height, top, left, right, bottom, margin, padding, border-width;
```

## Reduced Motion (MANDATORY)

Every animation must have TWO fallbacks:

```css
/* 1. OS-level preference */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  
  /* Specific overrides for our components */
  .thinking-orbs { animation: none; }
  .border-beam { animation: none; }
  .liquid-metal { animation: none; }
  .spring-transition { transition: none; }
}

/* 2. In-app override (Settings → Accessibility → Reduce Motion) */
html.reduce-motion *,
html.reduce-motion *::before,
html.reduce-motion *::after {
  animation-duration: 0.01ms !important;
  animation-iteration-count: 1 !important;
  transition-duration: 0.01ms !important;
}
```

**Reduced motion behavior:**
- Freezes flow animations (ThinkingOrbs orbit, BorderBeam sweep, liquid metal flow)
- Keeps static state legible (pending block still reads as pending)
- Never removes information
- Instant transitions (0.01ms)

## Edge Refraction (Glass Highlight)

All glass elements get a refractive edge via `::before`:

```css
.glass-element {
  position: relative;
  backdrop-filter: blur(var(--glass-2-blur)) saturate(1.55);
  background: rgba(10, 10, 14, 0.55);
  border: 1px solid var(--surface-border);
}

.glass-element::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: var(--glass-edge);
  -webkit-mask: linear-gradient(#fff, #fff) content-box, 
                linear-gradient(#fff, #fff);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
}
```

## Component Animation Specs

### Sidebar Item
```css
.sidebar-item {
  transition: background-color var(--spring-snappy),
              color var(--spring-snappy),
              transform var(--spring-snappy);
}
.sidebar-item:hover { background: var(--sidebar-item-hover); }
.sidebar-item.active { background: var(--sidebar-item-active); }
.sidebar-item:active { transform: scale(0.98); }
```

### AI Strip Expand
```css
.ai-strip {
  transition: height var(--spring-smooth),
              opacity var(--spring-smooth),
              transform var(--spring-smooth);
}
.ai-strip.collapsed { height: 0; opacity: 0; transform: translateY(10px); }
.ai-strip.composer { height: 120px; }
.ai-strip.running { height: 200px; }
.ai-strip.review { height: 300px; }
```

### Approval Block (BorderBeam)
```css
.approval-block {
  position: relative;
  border: 1px solid var(--surface-border);
}
.approval-block.pending::before {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: inherit;
  background: conic-gradient(from 0deg, var(--accent-primary), transparent 30%);
  animation: border-beam 2s var(--spring-bouncy) infinite;
  mask: linear-gradient(#fff, #fff) content-box, linear-gradient(#fff, #fff);
  mask-composite: exclude;
}
@keyframes border-beam { to { transform: rotate(360deg); } }
```

### ThinkingOrbs
```css
.thinking-orb {
  width: 8px; height: 8px;
  border-radius: 50%;
  background: var(--accent-danger); /* or var(--accent-secondary) */
  animation: orbit 3s var(--spring-bouncy) infinite;
}
.thinking-orb:nth-child(2) { animation-delay: -1s; }
.thinking-orb:nth-child(3) { animation-delay: -2s; }
@keyframes orbit {
  0%, 100% { transform: translate(0, 0) scale(1); }
  25% { transform: translate(12px, -4px) scale(1.2); }
  50% { transform: translate(0, -12px) scale(1); }
  75% { transform: translate(-12px, -4px) scale(0.8); }
}
```

### Liquid Metal Titlebar (WebGL)
- Single shared canvas, 40px height
- Flowing metal simulation (Navier-Stokes simplified)
- Chromatic aberration on edges
- `prefers-reduced-motion` = static gradient

## Svelte Motion Integration

```svelte
<script>
  import { spring } from 'svelte/motion';
  import { animate } from 'svelte/animate';
  import { crossfade } from 'svelte/transition';
  import { fly, fade, slide } from 'svelte/transition';
</script>

<!-- Spring store for values -->
<script>
  const height = spring(0, { stiffness: 0.15, damping: 0.25 });
</script>

<!-- Layout transitions -->
<div animate:flip={{ delay: 100, duration: 300, easing: 'spring-smooth' }}>

<!-- Enter/exit -->
<div in:fly={{ y: 20, duration: 200, easing: 'spring-snappy' }}>
<div out:fade={{ duration: 150 }}>
```

## Performance Rules

1. **Single WebGL context** — liquid metal titlebar only
2. **CSS transforms only** — no layout animations
3. **Will-change** — only on actively animating elements
4. **GPU layers** — `transform: translateZ(0)` on animated elements
5. **Reduced motion** — tested on every PR
6. **60fps target** — profile with Chrome DevTools Performance tab