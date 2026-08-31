---
name: nil-typography
description: NIL typography system — Inter for human prose, JetBrains Mono for machine data. Hierarchy, weights, line heights, responsive scaling.
---

# NIL Typography — Inter + JetBrains Mono

## Font Stack (LOCKED)

```css
:root {
  --font-sans: "Inter", system-ui, -apple-system, sans-serif;
  --font-mono: "JetBrains Mono", "SF Mono", "Fira Code", monospace;
  --font-display: "Inter", system-ui, -apple-system, sans-serif;
}
```

## Type Scale (rem-based, fluid)

```css
:root {
  /* Display */
  --text-display-xl: clamp(2.5rem, 5vw, 4rem);    /* 40-64px */
  --text-display-lg: clamp(2rem, 4vw, 3rem);      /* 32-48px */
  --text-display-md: clamp(1.5rem, 3vw, 2.25rem); /* 24-36px */
  --text-display-sm: clamp(1.25rem, 2.5vw, 1.75rem); /* 20-28px */

  /* Headings */
  --text-h1: clamp(1.75rem, 3vw, 2.5rem);  /* 28-40px */
  --text-h2: clamp(1.5rem, 2.5vw, 2rem);   /* 24-32px */
  --text-h3: clamp(1.25rem, 2vw, 1.5rem);  /* 20-24px */
  --text-h4: 1.125rem;                      /* 18px */

  /* Body */
  --text-lg: 1.125rem;    /* 18px — lead paragraph */
  --text-base: 1rem;      /* 16px — default body */
  --text-sm: 0.875rem;    /* 14px — secondary */
  --text-xs: 0.75rem;     /* 12px — meta, timestamps */
  --text-micro: 0.6875rem; /* 11px — micro labels */

  /* Code */
  --text-code: 0.875rem;  /* 14px — inline code, terminal */
  --text-code-lg: 1rem;   /* 16px — code blocks */
}
```

## Font Weights

```css
:root {
  --weight-light: 300;
  --weight-normal: 400;
  --weight-medium: 500;
  --weight-semibold: 600;
  --weight-bold: 700;
}
```

## Line Heights

```css
:root {
  --leading-none: 1;
  --leading-tight: 1.1;
  --leading-snug: 1.375;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;
  --leading-loose: 2;
  --leading-terminal: 1.45;  /* terminal-specific */
}
```

## Usage Rules

| Content | Font | Weight | Size | Leading |
|---------|------|--------|------|---------|
| Page title | Inter (display) | 600 | display-lg | tight |
| Section heading | Inter | 600 | h2 | snug |
| Subsection | Inter | 500 | h3 | snug |
| UI label | Inter | 500 | micro | none |
| Body prose | Inter | 400 | base | normal |
| Secondary text | Inter | 400 | sm | normal |
| Timestamp/meta | Inter | 400 | xs | normal |
| Placeholder | Inter | 400 | base | normal |
| **File path** | **JetBrains Mono** | **400** | **sm** | **normal** |
| **Command** | **JetBrains Mono** | **400** | **sm** | **normal** |
| **Terminal output** | **JetBrains Mono** | **400** | **code** | **terminal** |
| **Code block** | **JetBrains Mono** | **400** | **code-lg** | **normal** |
| **Exit code** | **JetBrains Mono** | **500** | **xs** | **none** |
| **Port/IP/Hash** | **JetBrains Mono** | **400** | **sm** | **normal** |
| Button | Inter | 500 | sm | none |
| Input | Inter | 400 | base | normal |

## Inter Variable Font Features

```css
:root {
  /* Optical sizing — auto-adjusts for size */
  --font-inter-opsz: 1 opsz;
  
  /* Variable weight axis */
  --font-inter-wght: 1 wght;
}
```

Enable in `@font-face`:
```css
@font-face {
  font-family: "Inter";
  src: url("/fonts/InterVariable.woff2") format("woff2-variations");
  font-weight: 100 900;
  font-stretch: 75% 125%;
  font-display: swap;
}
```

## JetBrains Mono Features

```css
@font-face {
  font-family: "JetBrains Mono";
  src: url("/fonts/JetBrainsMono-Variable.woff2") format("woff2-variations");
  font-weight: 100 800;
  font-display: swap;
}

/* Ligatures for code (optional, off by default in terminal) */
.code-ligatures { font-variant-ligatures: common-ligatures; }
.terminal { font-variant-ligatures: none; }
```

## Responsive Behavior

```css
/* Fluid type clamp — no breakpoints needed */
html {
  font-size: clamp(14px, 1.2vw, 16px);
}

/* Container queries for component-level scaling */
@container (max-width: 400px) {
  .card-title { font-size: var(--text-h4); }
}
```

## Anti-Patterns (FORBIDDEN)

- ❌ Italic headings
- ❌ All-caps body text (micro labels only, 0.08em letter-spacing)
- ❌ Mixed fonts in one text run (pick sans OR mono)
- ❌ Bold body text (semantic weight only: headings, buttons, labels)
- ❌ Font sizes outside the scale
- ❌ Line heights outside the scale
- ❌ Letter-spacing on body text
- ❌ Web fonts without `font-display: swap`
- ❌ Missing fallback fonts

## Accessibility

- Minimum 16px for body text (WCAG)
- 4.5:1 contrast ratio (text on abyss)
- 3:1 contrast ratio (large text 18px+)
- Respect `prefers-reduced-motion` for font loading animations
- No text in images