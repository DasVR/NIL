# NIL — Design Tokens Reference

> **Status:** LOCKED — all components must consume these tokens by name. No inline hex/rgb/oklch.

---

## COLOR PRIMITIVES

```css
:root {
  /* Abyss Scale (Backgrounds) */
  --color-abyss-0:  #050507;  /* Base background */
  --color-abyss-1:  #0a0a0c;  /* Surface */
  --color-abyss-2:  #0a0a0e;  /* Elevated surface */
  --color-abyss-3:  #101016;  /* Card background */
  --color-abyss-4:  #16161d;  /* Panel / sidebar */
  --color-abyss-5:  #1c1c24;  /* Deep panel */

  /* Accents (NIL Brand — NO GREEN) */
  --color-violet:       #452a84;  /* Primary: monogram, active states, focus */
  --color-violet-light: #a9b1f0;  /* Secondary: glow, highlights, thinking orbs */
  --color-violet-dark:  #321e60;  /* Pressed active */
  --color-coral:        #fe6f69;  /* Tertiary: thinking orbs, warnings, attention */
  --color-coral-dark:   #c94a45;  /* Pressed warning */
  --color-cream:        #f5f2ec;  /* Done state, high-contrast text */

  /* Text Scale */
  --color-text:      #e8e8e6;  /* Primary */
  --color-text-dim:  #9a9a94;  /* Secondary */
  --color-text-faint:#6a6a62;  /* Tertiary */
  --color-text-muted:#55554f;  /* Disabled / placeholder */

  /* Status (Semantic) */
  --color-danger:  #ff5c5c;  /* Errors, YOLO indicator, critical */
  --color-warning: #ffb454;  /* Warnings */
  --color-info:    #5cb8ff;  /* Info, links */
  --color-success: #00d992;  /* Success — legacy green, use sparingly */
}
```

---

## SEMANTIC ALIASES (What Components Actually Use)

```css
:root {
  /* Surfaces */
  --surface-base:      var(--color-abyss-0);
  --surface-raised:    var(--color-abyss-1);
  --surface-elevated:  var(--color-abyss-2);
  --surface-overlay:   var(--color-abyss-3);
  --surface-float:     var(--color-abyss-4);

  /* Borders */
  --border-subtle:  rgba(245, 242, 236, 0.06);  /* cream 6% */
  --border-default: rgba(245, 242, 236, 0.10);  /* cream 10% */
  --border-strong:  rgba(245, 242, 236, 0.16);  /* cream 16% */

  /* Accents by Role */
  --accent-primary:   var(--color-violet);
  --accent-secondary: var(--color-violet-light);
  --accent-tertiary:  var(--color-coral);
  --accent-done:      var(--color-cream);

  /* Status by Role */
  --status-danger:  var(--color-danger);
  --status-warning: var(--color-warning);
  --status-info:    var(--color-info);
  --status-success: var(--color-success);

  /* Text by Role */
  --text-primary:   var(--color-text);
  --text-secondary: var(--color-text-dim);
  --text-tertiary:  var(--color-text-faint);
  --text-muted:     var(--color-text-muted);
}
```

---

## GLASS TIERS (4 Levels Max — Accent Only)

```css
:root {
  /* Blur values */
  --glass-blur-1: 32px;  /* Modals, large surfaces */
  --glass-blur-2: 24px;  /* Cards, panels */
  --glass-blur-3: 16px;  /* Inputs, buttons */
  --glass-blur-4: 12px;  /* Small controls, badges */

  /* Opacity values */
  --glass-opacity-1: 0.45;
  --glass-opacity-2: 0.55;
  --glass-opacity-3: 0.65;
  --glass-opacity-4: 0.72;

  /* Composite classes (apply one per element) */
  --glass-1-bg:  rgba(10, 10, 12, var(--glass-opacity-1));
  --glass-2-bg:  rgba(12, 12, 18, var(--glass-opacity-2));
  --glass-3-bg:  rgba(16, 16, 24, var(--glass-opacity-3));
  --glass-4-bg:  rgba(22, 22, 29, var(--glass-opacity-4));

  --glass-border: var(--border-default);
}

/* Utility classes — components extend these */
.glass-1 { backdrop-filter: blur(var(--glass-blur-1)) saturate(1.6); background: var(--glass-1-bg); border: 1px solid var(--glass-border); }
.glass-2 { backdrop-filter: blur(var(--glass-blur-2)) saturate(1.6); background: var(--glass-2-bg); border: 1px solid var(--glass-border); }
.glass-3 { backdrop-filter: blur(var(--glass-blur-3)) saturate(1.5); background: var(--glass-3-bg); border: 1px solid var(--glass-border); }
.glass-4 { backdrop-filter: blur(var(--glass-blur-4)) saturate(1.4); background: var(--glass-4-bg); border: 1px solid var(--glass-border); }

/* Edge refraction highlight — apply via ::before on glass panels */
.glass-edge::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding-top: 1px;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.10) 0%,
    rgba(255, 255, 255, 0.02) 8%,
    transparent 100%
  );
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
}
```

---

## SPRING CURVES (Motion DNA)

```css
:root {
  /* Durations */
  --dur-fast:  150ms;
  --dur-base:  220ms;
  --dur-slow:  320ms;

  /* Spring easings — USE THESE, NOT linear/ease */
  --spring-bouncy:  cubic-bezier(0.34, 1.56, 0.64, 1);   /* Playful: hover, badges, toasts */
  --spring-smooth:  cubic-bezier(0.22, 1, 0.36, 1);      /* UI: panels, layout shifts */
  --spring-window:  cubic-bezier(0.32, 0.72, 0, 1);      /* Windows, sheets, modals */
  --spring-snappy:  cubic-bezier(0.25, 0.9, 0.25, 1);    /* Quick: buttons, toggles */

  /* Fallbacks for reduced-motion */
  --ease-out:      cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in-out:   cubic-bezier(0.65, 0, 0.35, 1);
}

/* Reduced motion — ALL animations fall back */
@media (prefers-reduced-motion: reduce) {
  :root {
    --spring-bouncy:  var(--ease-out);
    --spring-smooth:  var(--ease-out);
    --spring-window:  var(--ease-out);
    --spring-snappy:  var(--ease-out);
  }
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## TYPOGRAPHY

```css
:root {
  /* Fonts */
  --font-sans:  'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-mono:  'JetBrains Mono', 'SF Mono', 'Fira Code', monospace;

  /* Scale (clamp for zoom safety) */
  --step--2: clamp(0.69rem, 0.67rem + 0.11vw, 0.75rem);   /* 11px — micro labels */
  --step--1: clamp(0.83rem, 0.80rem + 0.17vw, 0.94rem);   /* 12px — captions */
  --step-0:  clamp(1.00rem, 0.95rem + 0.25vw, 1.13rem);  /* 14-16px — body */
  --step-1:  clamp(1.20rem, 1.13rem + 0.37vw, 1.41rem);   /* 18-20px — headings */
  --step-2:  clamp(1.44rem, 1.34rem + 0.53vw, 1.76rem);   /* 24px — display */
  --step-3:  clamp(1.73rem, 1.58rem + 0.75vw, 2.20rem);   /* 30px */
  --step-4:  clamp(2.07rem, 1.87rem + 1.04vw, 2.75rem);   /* 38px */
  --step-5:  clamp(2.49rem, 2.20rem + 1.43vw, 3.43rem);   /* 48px */

  /* Line heights */
  --leading-tight:   1.1;
  --leading-snug:    1.3;
  --leading-normal:  1.5;
  --leading-relaxed: 1.6;

  /* Weights */
  --weight-normal: 400;
  --weight-medium: 500;
  --weight-semibold: 600;
  --weight-bold: 700;

  /* Letter spacing */
  --tracking-tight: -0.02em;
  --tracking-normal: 0;
  --tracking-wide: 0.08em;  /* Micro labels */
}
```

### Usage Rules
| Content | Font | Weight | Size |
|---------|------|--------|------|
| UI labels, buttons, headings, prose | Inter | 500/600 | step-0 to step-2 |
| Code, terminal, file paths, IPs, ports, timestamps, hashes, status values | JetBrains Mono | 400/500 | step--1 to step-0 |
| Sidebar rows, status bar | JetBrains Mono (data) + Inter (labels) | 400 | step--1 |
| Micro labels (section headers) | Inter | 600 | step--2, tracking-wide |

**Numbers inside prose always switch to mono.**

---

## SPACING & DENSITY

```css
:root {
  /* 4px base ladder */
  --space-1: 0.25rem;   /* 4px  */
  --space-2: 0.5rem;    /* 8px  */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-5: 1.5rem;    /* 24px */
  --space-6: 2rem;      /* 32px */
  --space-7: 3rem;      /* 48px */
  --space-8: 4rem;      /* 64px */

  /* Workstation density (Linear numbers) */
  --row-h:        1.75rem;      /* 28px — sidebar rows, list items */
  --statusbar-h:  1.625rem;     /* 26px — status/safety bar */
  --titlebar-h:   2.5rem;       /* 40px — titlebar */
  --ai-strip-thin: 1.625rem;    /* 26px — thin AI strip */
  --ai-strip-expanded: 17.5rem; /* 280px — expanded AI strip */

  /* Gaps (use gap, not margin stacks) */
  --gap-1: var(--space-1);
  --gap-2: var(--space-2);
  --gap-3: var(--space-3);
  --gap-4: var(--space-4);

  /* Borders */
  --radius-sm:  0.375rem;  /* 6px — badges, chips */
  --radius-md:  0.5rem;    /* 8px — controls, inputs */
  --radius-lg:  0.75rem;   /* 12px — panels, cards */
  --radius-xl:  1rem;      /* 16px — large surfaces */
  --radius-window: 0.625rem; /* 10px — titlebar, window chrome */
  --radius-full: 9999px;   /* Pills only where intentional */
}
```

### Spacing Rules
- Use `gap` inside flex/grid, never margin stacks
- 1px borders + 4-8px gaps create hierarchy better than 16px margins
- Only modals, empty-state cards, and terminal host exceed 12px padding
- Sidebar section header: 28px row height, no extra margin below

---

## Z-INDEX SCALE

```css
:root {
  --z-base:      0;      /* Liquid metal canvas */
  --z-content:   10;     /* Main content */
  --z-sticky:    50;     /* Sidebar headers */
  --z-overlay:   100;    /* Glass panels, popovers */
  --z-modal:     200;    /* Sheets, modals */
  --z-toast:     300;    /* Toasts, notifications */
  --z-palette:   400;    /* Command palette */
  --z-tooltip:   500;    /* Tooltips */
}
```

---

## COMPONENT TOKEN CONSUMPTION MAP

| Component | Tokens Consumed |
|-----------|-----------------|
| `Titlebar` | `--surface-float`, `--glass-1-bg`, `--glass-blur-1`, `--text-primary`, `--text-secondary`, `--accent-primary`, `--status-danger`, `--status-warning`, `--radius-window`, `--titlebar-h`, `--spring-window` |
| `Sidebar` | `--surface-base`, `--surface-raised`, `--row-h`, `--gap-2`, `--text-primary`, `--text-secondary`, `--text-muted`, `--font-mono`, `--font-sans`, `--radius-md`, `--spring-smooth` |
| `WorkspaceCenter` | `--surface-base`, `--row-h`, `--gap-2` |
| `Terminal` | `--surface-base`, `--color-abyss-0`, `--color-violet`, `--color-coral`, `--color-cream`, `--font-mono`, `--leading-relaxed` |
| `AiStrip` | `--glass-2-bg`, `--glass-blur-2`, `--border-default`, `--ai-strip-thin`, `--ai-strip-expanded`, `--spring-bouncy`, `--spring-smooth`, `--accent-tertiary` |
| `RightSidebar` | `--surface-float`, `--glass-2-bg`, `--glass-blur-2`, `--row-h`, `--gap-2`, `--radius-lg` |
| `CommandPalette` | `--glass-1-bg`, `--glass-blur-1`, `--accent-primary`, `--spring-snappy`, `--radius-lg` |
| `Dock` | `--glass-2-bg`, `--glass-blur-2`, `--spring-bouncy`, `--radius-md` |
| `StatusBar` | `--glass-3-bg`, `--glass-blur-3`, `--statusbar-h`, `--font-mono`, `--font-sans`, `--text-secondary`, `--status-danger`, `--status-success` |
| `ApprovalCard` | `--glass-1-bg`, `--glass-blur-1`, `--accent-tertiary`, `--spring-bouncy`, `--radius-lg` |
| `ThinkingLogo` | `--accent-primary`, `--accent-secondary`, `--accent-tertiary`, `--accent-done`, `--spring-bouncy`, `--spring-smooth` |
| `LiquidMetal` | `--color-violet`, `--color-violet-light`, `--color-abyss-0` (shader uniforms) |

---

## VERIFICATION CHECKLIST

Before any component ships:
- [ ] No inline hex/rgb/oklch — all colors via `var(--token)`
- [ ] Glass tier matches purpose (not everything glass-1)
- [ ] Spring curve used for all transitions (no `ease`, `linear`, `ease-in-out` unless reduced-motion)
- [ ] Radius matches hierarchy (6/8/12/10/16)
- [ ] Typography: Inter for humans, JetBrains Mono for machines
- [ ] Density: 28px rows, 26px statusbar, 40px titlebar
- [ ] Reduced-motion: animations instant, liquid metal frozen
- [ ] Contrast: all text ≥4.5:1 (normal), ≥3:1 (large)
- [ ] Focus rings visible on every interactive element