---
name: finn-ui
description: Design rules for the Finn workstation UI in web/. Use when editing anything under web/src — components, app.css, routes, motion, glass, density, or keyboard shortcuts.
---

# Finn workstation UI

The living spec is `UX_REDESIGN.md` (v3). `DESIGN.md` is v2 history — read it for token
lineage, never for information architecture. `docs/history/design-v1.md` is the v1 costume.
`cursor-research/TWITTER-BOOKMARKS-FULL-RESEARCH.md` is polish input only; where it
contradicts v3, v3 wins.

The product is an engagement, not a chatbot. Terminal is the default surface. Finn is a
column you summon, never the homepage.

## Tokens

Every token lives in `web/src/app.css` `:root`. Use them; do not invent colors.

| Group | Tokens |
|---|---|
| Surface | `--abyss` `--abyss-1..4` |
| Accent | `--green` `--green-dim` `--green-glow` `--green-soft` |
| Text | `--text` `--text-dim` `--text-faint` |
| Severity | `--critical` `--danger` `--warning` `--info` (+ `-soft` variants) |
| Glass | `--glass-1..4` `--glass-border` `--glass-border-strong` `--glass-blur` `--glass-saturate` |
| Motion | `--spring-panel` `--spring-control` `--spring-layout` `--spring-bouncy` `--spring-smooth` `--spring-snappy` `--spring-window` |
| Metrics | `--titlebar-height` `--statusbar-height` `--sidebar-width` `--rightbar-width` `--row-h` |

`--accent`, `--text-primary`, `--navy` are back-compat aliases for the marketing routes.
Do not introduce new usages in `/app`.

## Density

Workstation density is Linear/Cursor, not iOS.

| Surface | Rule |
|---|---|
| Sidebar / list row | 28px (`--row-h`), 6px vertical, 8px horizontal padding |
| Micro label | 10–11px, `letter-spacing: 0.08em`, uppercase, `--text-faint` (`.label-micro`) |
| Toolbar button | 24–28px, `min-height: unset` |
| Dialog primary button | 32px |
| Status bar | 26px |
| Terminal line | 6px vertical, 1.45 line-height |

`.workstation button` already clears `min-height`. Marketing keeps 40px. Never ship a 44px
control inside `/app`.

Use `gap` in flex/grid. Do not build margin stacks. Hierarchy comes from 1px borders at 8%
white plus 4–8px gaps, not 16px margins.

## Type

- Inter (`--font-sans`): labels, prose, buttons, finding narrative.
- JetBrains Mono (`--font-mono`, `.mono`): hosts, IPs, ports, commands, timestamps, exit
  codes, CVSS, hashes, status values, any number inside prose.

## Materials

Glass must refract real content underneath. Glass on solid `--abyss` is a muddy fill — use
`--abyss-2` plus a 1px border instead.

| Material | Allowed |
|---|---|
| Liquid metal | Titlebar only, the single `LiquidMetal.svelte` instance. Never a second WebGL context. |
| Liquid glass | Command palette, settings sheet, Finn column over the terminal, popovers (`.glass-overlay` / `.liquid-glass`) |
| Grain | Static SVG via `.grain-on`, opt-in, off by default. Never an animated canvas. |
| Scanlines | Terminal only, opt-in |
| Border beam | Pending-approval block only — it is the one attention object |

## Motion

Use the existing spring curves. Animate `transform` and `opacity`. Cap overshoot around 8%.

Every new animation needs a reduced-motion path. Two mechanisms exist and both must be
honored:

- `@media (prefers-reduced-motion: reduce)` — the OS setting.
- `html.reduce-motion` — the in-app Settings override, applied by `appState.applyAppearance()`.

Write both selectors. Reduced motion freezes flow and keeps the static state legible; it
never removes the information (a pending block still reads as pending).

## Anti-slop rules

From the bookmarks research, applied to every UI change:

- No generic gradients, no decorative drop-shadows on idle cards or buttons. The panel,
  modal, and critical-finding shadows in `app.css` are the shadow budget.
- No fake metrics, placeholder counts, or lorem content.
- Locked design tokens — no new hex values.
- WCAG AA contrast on `--abyss` and on glass.
- Keyboard-first: a primary task that needs a mouse is a broken IA.
- No emoji in product UI.

## Kill list

Never reintroduce:

- A permanent large chat area as the default view
- "Message Finn…" / "Ask anything about your scope" hero copy
- Rounded chat bubbles or avatar columns for Finn output
- The in-app macOS Dock (`Dock.svelte` stays unmounted)
- CSS traffic lights
- `window.prompt` / `window.confirm` in product flows
- Glass on every surface, or a second WebGL metal plane
- Two settings surfaces
- Blue focus rings (focus is a 2px `--green` ring, 2px offset)
- Findings duplicated in two sidebars
- Navigating to a new page to run a plugin

## Keyboard

Shortcuts resolve in `web/src/lib/keymap.ts` and dispatch in
`web/src/routes/app/+layout.svelte`. Add new shortcuts in both, plus `SHORTCUT_HELP` so the
palette footer and Settings → Keyboard stay accurate.

`Esc` peels exactly one layer.

## Verify

```bash
cd web && npm run check && npm run build
```

Both must pass before you finish.
