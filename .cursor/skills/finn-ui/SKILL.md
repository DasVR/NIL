---
name: finn-ui
description: NIL workspace UI rules. Use when editing frontend/src — components, app.css, routes, motion, glass, density, or keyboard shortcuts.
---

# NIL Workspace UI

The living spec is `MASTER-REDESIGN.md` and `DESIGN-TOKENS.md` in repo root. `CURSOR-REDESIGN-PROMPT.md` is the build brief. `cursor-research/THE-FULL-ARSENAL.md` is the library/inspo registry.

The product is a **coding agent workspace**, not a chatbot. Terminal is the default surface. The AI strip is summoned (Cmd+J), never the homepage.

## Tokens

Every token lives in `frontend/src/app.css` `:root`. Use them; do not invent colors.

| Group | Tokens |
|---|---|
| Surface | `--color-abyss-0..5` |
| Accent | `--color-violet`, `--color-violet-light`, `--color-coral`, `--color-cream` |
| Text | `--color-text`, `--color-text-dim`, `--color-text-faint`, `--color-text-muted` |
| Status | `--color-danger`, `--color-warning`, `--color-info`, `--color-success` (use sparingly) |
| Glass | `--glass-1..4` + edge refraction `::before` |
| Motion | `--spring-bouncy`, `--spring-smooth`, `--spring-window`, `--spring-snappy` |
| Density | `--row-h` 28px, `--statusbar-h` 26px, `--titlebar-h` 40px |

## Density

Workstation density is Linear/Cursor, not iOS.

| Surface | Rule |
|---|---|
| Sidebar / list row | 28px (`--row-h`), 6px vertical, 8px horizontal padding |
| Micro label | 11px, `letter-spacing: 0.08em`, uppercase, `--color-text-faint` |
| Toolbar button | 24–28px |
| Dialog primary button | 32px |
| Status bar | 26px |
| Terminal line | 6px vertical, 1.45 line-height |

Never ship a 44px control inside the workspace. Use `gap` in flex/grid, not margin stacks.

## Type

- **Inter** (`--font-sans`): labels, prose, buttons, human UI.
- **JetBrains Mono** (`--font-mono`): file paths, commands, timestamps, exit codes, any number inside prose.

## Materials

| Material | Allowed |
|---|---|
| Liquid metal | Titlebar only, one shared WebGL context |
| Liquid glass | Command palette, settings sheet, AI strip, popovers |
| Grain | Static SVG `feTurbulence`, 3% opacity, opt-in |
| Scanlines | Terminal only, opt-in |
| Border beam | Pending-approval block only — the one attention object |

## Motion

Use the spring curves. Animate `transform` and `opacity` only. Every animation needs `@media (prefers-reduced-motion: reduce)` fallback.

## Anti-slop rules

- No generic gradients or decorative drop-shadows on idle cards
- No fake metrics or placeholder content
- Locked tokens — no new hex values
- WCAG AA contrast
- Keyboard-first
- No emoji in product UI
- No chat bubbles — structured cards with meta headers
- No fake terminal chrome (`$` prompts as decoration)

## Layout

```
┌─ Titlebar (liquid metal) ─────────────────────────────────┐
├────────────┬─────────────────────────────┬────────────────┤
│  Sidebar   │      Main Workspace         │  RightSidebar  │
│  (files/   │   (Terminal / Editor /      │  (Inspector/   │
│   targets) │    Preview / Diff / Chat)   │   Findings/    │
├────────────┴─────────────────────────────┴────────────────┤
│  AI Strip (collapsed, Cmd+J)  |  Status Bar (26px)       │
└────────────────────────────────────────────────────────────┘
```

## Verify

```bash
cd frontend && npm run check && npm run build
```

Both must pass before you finish.