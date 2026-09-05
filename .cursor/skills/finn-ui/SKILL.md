---
name: finn-ui
description: NIL workspace UI rules. Use when editing frontend/src — components, tokens, routes, motion, or keyboard shortcuts.
---

# NIL Workspace UI

The living spec is `FRAMEWORK.md`. Tokens live in `frontend/src/lib/styles/tokens.css`.
Motion primitives live in `frontend/src/lib/styles/motion.css`.
Design law: `.cursor/rules/00-nil-design-language.mdc`.

The product is a **terminal-first security assessment workstation**. Center stage is the agent stream. Terminal/editor remain tabs. Color means risk. `--brand-ember-*` is Zone A identity only.

## Tokens

Use `--nil-*` for chrome, `--sev-*` for severity. `--brand-ember-*` only in Zone A (cold open, lock screen, session handoff, report cover). No new hex in components.

| Group | Tokens |
|---|---|
| Surface | `--nil-void`, `--nil-panel`, `--nil-raised`, `--nil-line`, `--nil-line-hot` |
| Ink | `--nil-ink` … `--nil-ink-4` |
| Severity | `--sev-critical` … `--sev-info` |
| Ember (Zone A) | `--brand-ember-900` … `--brand-ember-300` |
| Type | `--font-ui`, `--font-machine`, `--t-micro` … `--t-display` |
| Motion | `--dur-flip` / `--dur-enter` / `--dur-panel` / `--ease-out` |
| Density | `--row-h` 28px, `--statusbar-h` 26px, `--titlebar-h` 40px |

## Density

Workstation density. Rows 28–32px. Body `--t-body` (13px). Never ship a 44px control.

## Type

- **Inter** (`--font-ui`): labels, prose, buttons, assessment.
- **JetBrains Mono** (`--font-machine`): hosts, ports, CVEs, hashes, raw output.

## Materials

| Material | Allowed |
|---|---|
| Cold open | Zone A WebGL2, then `loseContext()` |
| Titlebar metal | Zone B, one context, ≤30fps, pause while streaming |
| Grain | Once on the shell at `--grain-opacity` |
| SCANLINE | Agent/scan working — replaces the spinner |

## Motion

The ten primitives in `motion.css`. No bespoke keyframes in components.

## Layout

Left = targets, center = agent stream, right = findings inspector, composer at the bottom of center. Cmd+J focuses the composer.

## Verify

```bash
cd frontend && npm run check && npm run build
```
