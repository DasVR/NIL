---
name: nil-design-system
description: NIL token architecture — primitive → semantic → component. Locked palette, glass tiers, spring curves, density rules.
---

# NIL Design System — Token Architecture

## The Three-Layer System

```
Primitive (raw values)     →  Semantic (purpose aliases)  →  Component (specific use)
--color-violet #452a84          --accent-primary                --button-bg
--color-coral #fe6f69           --accent-danger                 --error-border
--color-cream #f5f2ec           --surface-elevated              --card-bg
```

## Primitive Tokens (LOCKED — never change)

```css
:root {
  /* Backgrounds — Abyss Scale */
  --color-abyss-0: #050507;   /* deepest — main bg */
  --color-abyss-1: #0a0a0c;   /* surface — panels */
  --color-abyss-2: #0a0a0e;   /* elevated — cards */
  --color-abyss-3: #101016;   /* hover — interactive */
  --color-abyss-4: #16161d;   /* border — subtle */
  --color-abyss-5: #1e1e26;   /* input — text fields */

  /* Accents — NIL Identity */
  --color-violet: #452a84;        /* primary brand */
  --color-violet-light: #a9b1f0;  /* secondary brand */
  --color-coral: #fe6f69;         /* danger/attention */
  --color-cream: #f5f2ec;         /* done/success state */

  /* Text */
  --color-text: #e8e8e6;        /* primary — headings, prose */
  --color-text-dim: #9a9a94;    /* secondary — labels, meta */
  --color-text-faint: #55554f;  /* tertiary — timestamps, disabled */
  --color-text-muted: #3a3a36;  /* placeholder, ghost */

  /* Status (semantic — used directly in components) */
  --color-danger: #ff5c5c;
  --color-warning: #ffb454;
  --color-info: #5cb8ff;
  --color-success: #5cff8a;     /* use sparingly */

  /* Glass Tiers — True iOS-style */
  --glass-1-blur: 32px;   --glass-1-opacity: 0.45;  /* heaviest — modal, palette */
  --glass-2-blur: 24px;   --glass-2-opacity: 0.55;  /* sheets, AI strip */
  --glass-3-blur: 16px;   --glass-3-opacity: 0.65;  /* cards, popovers */
  --glass-4-blur: 12px;   --glass-4-opacity: 0.72;  /* light overlays */

  /* Edge Refraction Highlight (apply to all glass via ::before) */
  --glass-edge-angle: 45deg;
  --glass-edge-stops: 0%, 50%, 100%;
  --glass-edge-colors: rgba(255,255,255,0.08), rgba(255,255,255,0.02), transparent;

  /* Spring Curves — macOS native feel */
  --spring-bouncy: cubic-bezier(0.34, 1.56, 0.64, 1);    /* playful: hover, badges, toasts */
  --spring-smooth: cubic-bezier(0.22, 1, 0.36, 1);      /* UI: panels, layout shifts */
  --spring-window: cubic-bezier(0.32, 0.72, 0, 1);      /* windows, sheets, modals */
  --spring-snappy: cubic-bezier(0.25, 0.9, 0.25, 1);    /* quick: buttons, toggles */

  /* Density Metrics */
  --row-h: 28px;           /* sidebar/list rows */
  --statusbar-h: 26px;     /* bottom status bar */
  --titlebar-h: 40px;      /* liquid metal titlebar */
  --sidebar-w: 280px;      /* left sidebar */
  --rightbar-w: 320px;     /* right inspector */
  --ai-strip-h: 200px;     /* AI strip expanded */

  /* Radius Hierarchy */
  --radius-badge: 6px;     /* badges, pills */
  --radius-control: 8px;   /* buttons, inputs, small cards */
  --radius-panel: 12px;    /* panels, sheets, popovers */
  --radius-window: 10px;   /* window chrome (if not native) */

  /* Fonts */
  --font-sans: "Inter", sans-serif;           /* human prose */
  --font-mono: "JetBrains Mono", monospace;   /* machine/data */
  --font-display: "Inter", sans-serif;        /* headings, UI labels */

  /* Z-Index Scale */
  --z-base: 0;
  --z-dropdown: 100;
  --z-sticky: 200;
  --z-modal: 300;
  --z-toast: 400;
  --z-tooltip: 500;
  --z-cursor: 600;
}
```

## Semantic Tokens (derivative — reference these in components)

```css
:root {
  /* Surface */
  --surface-base: var(--color-abyss-0);
  --surface-panel: var(--color-abyss-1);
  --surface-card: var(--color-abyss-2);
  --surface-hover: var(--color-abyss-3);
  --surface-border: var(--color-abyss-4);
  --surface-input: var(--color-abyss-5);

  /* Glass Composites */
  --glass-1: var(--glass-1-blur) var(--glass-1-opacity);
  --glass-2: var(--glass-2-blur) var(--glass-2-opacity);
  --glass-3: var(--glass-3-blur) var(--glass-3-opacity);
  --glass-4: var(--glass-4-blur) var(--glass-4-opacity);

  /* Glass Edge Highlight — all glass elements get this */
  --glass-edge: linear-gradient(
    var(--glass-edge-angle),
    var(--glass-edge-colors)
  );

  /* Accent Aliases */
  --accent-primary: var(--color-violet);
  --accent-secondary: var(--color-violet-light);
  --accent-danger: var(--color-coral);
  --accent-done: var(--color-cream);

  /* Text Aliases */
  --text-primary: var(--color-text);
  --text-secondary: var(--color-text-dim);
  --text-tertiary: var(--color-text-faint);
  --text-muted: var(--color-text-muted);
}
```

## Component Tokens (specific — never used outside their component)

```css
:root {
  /* Button */
  --btn-primary-bg: var(--accent-primary);
  --btn-primary-text: var(--color-abyss-0);
  --btn-secondary-bg: var(--surface-card);
  --btn-secondary-text: var(--text-primary);
  --btn-secondary-border: var(--surface-border);
  --btn-ghost-bg: transparent;
  --btn-ghost-hover: var(--surface-hover);
  --btn-danger-bg: var(--accent-danger);
  --btn-danger-text: var(--color-abyss-0);

  /* Input */
  --input-bg: var(--surface-input);
  --input-border: var(--surface-border);
  --input-border-focus: var(--accent-primary);
  --input-text: var(--text-primary);
  --input-placeholder: var(--text-muted);

  /* Card */
  --card-bg: var(--surface-card);
  --card-border: var(--surface-border);
  --card-glass: var(--glass-2);

  /* Sidebar */
  --sidebar-bg: var(--surface-panel);
  --sidebar-border: var(--surface-border);
  --sidebar-item-hover: var(--surface-hover);
  --sidebar-item-active: var(--accent-primary);
  --sidebar-item-active-text: var(--color-abyss-0);

  /* Status Bar */
  --statusbar-bg: var(--surface-panel);
  --statusbar-border: var(--surface-border);
  --statusbar-text: var(--text-secondary);

  /* AI Strip */
  --ai-strip-bg: var(--surface-panel);
  --ai-strip-border: var(--surface-border);
  --ai-strip-glass: var(--glass-2);
}
```

## Usage Rules

1. **Components import `app.css` tokens only** — no inline hex/rgb
2. **Primitive tokens** = source of truth, never used directly in components
3. **Semantic tokens** = what components actually reference
4. **Component tokens** = final mapping, scoped to one component
5. **Glass** = always use edge refraction via `::before` + `mask-composite`
6. **Reduced motion** = `@media (prefers-reduced-motion: reduce)` + `html.reduce-motion`
7. **Contrast** = WCAG AA on all text against all surfaces