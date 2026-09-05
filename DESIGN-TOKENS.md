# NIL — Design Tokens Reference

> **Status:** SUPERSEDED 2026-09-04. This file previously described the violet/coral/cream
> "NIL Identity" palette and a `--spring-*`/glass-tier motion system. Neither exists in the
> codebase anymore — `.cursor/rules/00-nil-design-language.mdc` replaced both with the
> color-means-risk law and the ten-primitive motion system below. This file is now a
> human-readable mirror of the real source of truth; if it ever disagrees with the CSS,
> the CSS wins.
>
> **Canonical sources:** `frontend/src/lib/styles/tokens.css` (colors, surfaces, space,
> radius) and `frontend/src/lib/styles/motion.css` (durations, easing, the ten primitives).
> Do not duplicate values here beyond this summary — that duplication is exactly how this
> file drifted out of date the first time.

---

## Color — the law in one line

The only saturated color in the workstation (chrome, nav, buttons, focus, "agent
working," terminal, findings) is a CVSS severity value. Everything else is greyscale,
ink-derived from `--nil-*`. One narrow exception exists for four Zone A identity
moments — see below.

```css
:root {
  /* surfaces — a "well" with panels floating in it */
  --nil-void, --nil-panel, --nil-raised, --nil-line, --nil-line-hot;

  /* ink — warm off-white, never pure #fff */
  --nil-ink, --nil-ink-2, --nil-ink-3, --nil-ink-4;

  /* severity ramp — the only saturated color allowed in Zone B/C */
  --sev-critical, --sev-high, --sev-medium, --sev-low, --sev-info;

  /* brand ember — Zone A identity ONLY (cold open, lock screen, session
     handoff, report cover). Never in chrome. Replaces --color-violet*. */
  --brand-ember-900, --brand-ember-700, --brand-ember-500, --brand-ember-300;
}
```

Retired: `--color-violet`, `--color-violet-light`, `--color-violet-dark`,
`--color-coral`, `--color-cream`, `--color-abyss-*` (renamed `--nil-void`/`--nil-panel`/
`--nil-raised`), and the whole glass-tier system (`--glass-1..4-*`). `app.css` still
carries compatibility aliases (`--color-abyss-0` → `--nil-void`, etc.) for components
that haven't migrated their variable names yet — new code should reference `--nil-*` /
`--sev-*` / `--brand-ember-*` directly, not the aliases.

## Motion

There is no `--spring-*` token anymore. Motion is ten named primitives in
`motion.css` (LIFT, PRESS, HALO, MAGNETIC, SCANLINE, TICK, REVEAL, SETTLE, TRACE,
SCRAMBLE), each with a named duration (`--dur-flip`, `--dur-enter`, `--dur-panel`,
`--dur-stage`, `--dur-decode`) and easing (`--ease-out`, `--ease-in`, `--ease-mono`,
`--ease-spring`). No bespoke `@keyframes` in components — see
`.cursor/rules/10-nil-motion.mdc`.

## Type, space, radius

Unchanged in spirit from the original system, values live in `tokens.css`:
`--font-machine` (JetBrains Mono) for anything the target/scanner/agent produced,
`--font-ui` (Inter) for anything NIL says; `--t-*` type scale; `--s-*` 4px-base spacing;
`--r-chip` < `--r-field` < `--r-card` < `--r-panel` < `--r-window` radius hierarchy.

## Verification checklist

- No inline hex/rgb outside `tokens.css` / `app.css` / shaders (`.frag`) — run the grep
  in `.cursor/rules/nil-workspace.mdc`.
- Nothing in Zone B/C is colored except `--sev-*`.
- `--brand-ember-*` appears only in Zone A files (cold open, lock screen, session
  handoff, report cover) — grep for it anywhere else and treat a hit as a bug.
- No bespoke `@keyframes` in a component; SCANLINE is the only infinite animation.
- Contrast ≥4.5:1 normal text, ≥3:1 large text. Focus rings (`--nil-halo`) visible on
  every interactive element.
