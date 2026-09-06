---
name: nil-motion
description: NIL motion pointer. Canonical primitives live in motion.css, not here — this skill exists to stop this file from re-drifting into a second source of truth.
---

# NIL Motion

> **Superseded 2026-09-04.** This skill used to inline four `--spring-*` curves and a
> ThinkingOrbs orbit. Those values are not in the codebase. It is not reproduced here
> again — read the actual files.

## Canonical sources

- Law: `.cursor/rules/10-nil-motion.mdc`
- Primitives, durations, easing: `frontend/src/lib/styles/motion.css`
- GPU zones (cold open / lock / handoff / cover are WebGL, not these primitives):
  `.cursor/rules/40-nil-gpu.mdc`

## The ten primitives

LIFT, PRESS, HALO, MAGNETIC, SCANLINE, TICK, REVEAL, SETTLE, TRACE, SCRAMBLE.
Each has a named duration (`--dur-flip`, `--dur-enter`, `--dur-panel`, `--dur-stage`,
`--dur-decode`) and easing (`--ease-out`, `--ease-in`, `--ease-mono`, `--ease-spring`).

SCANLINE is the only infinite animation. MAGNETIC max three per screen. No bespoke
`@keyframes` in Zone B/C components. If you need a new behavior, add it to `motion.css`
with a number and a name, then use it.

## Reduced motion

`prefers-reduced-motion: reduce` kills travel and loops but keeps opacity and color
changes. SCANLINE becomes a static hairline. Do not write `animation: none` alone —
that erases the working indicator.
