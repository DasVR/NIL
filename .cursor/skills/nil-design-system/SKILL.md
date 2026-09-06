---
name: nil-design-system
description: NIL token architecture pointer. Canonical values live in tokens.css/motion.css, not here — this skill exists to stop this file from re-drifting into a second source of truth.
---

# NIL Design System — Token Architecture

> **Superseded 2026-09-04.** This skill used to inline a full "LOCKED" primitive table
> (violet/coral/cream accents, four glass tiers, `--spring-*` easings). That table drifted
> out of sync with the real CSS and is exactly the bug that caused the violet leftovers
> this rewrite removed. It is not reproduced here again — read the actual files.

## Canonical sources

- Laws: `.cursor/rules/00-nil-design-language.mdc`
- Color + surface + type + space tokens: `frontend/src/lib/styles/tokens.css`
- Motion (ten primitives, durations, easing): `frontend/src/lib/styles/motion.css`
- GPU zones (where `--brand-ember-*` is allowed): `.cursor/rules/40-nil-gpu.mdc`
- Human-readable mirror (summary only, not a second source of truth):
  `DESIGN-TOKENS.md`

## The three-layer system, in words

Primitive (`--nil-void`, `--sev-critical`, `--brand-ember-500`) → semantic
(`--accent-danger` and similar role aliases in `app.css`) → component-scoped `<style>`
blocks that consume the semantic layer. Components never hardcode hex. Read
`tokens.css` before inventing a name — if the thing you need already exists as
`--nil-*` or `--sev-*`, use it; do not add a fourth alias for the same value.

## The one rule worth restating here

Color means risk everywhere except four Zone A identity moments (cold open, lock
screen, session handoff, report export cover), where `--brand-ember-*` is allowed as a
restrained highlight. `--color-violet*` do not exist. If you're about to write a hex
value or invent a new color token, stop and open `00-nil-design-language.mdc` first.
