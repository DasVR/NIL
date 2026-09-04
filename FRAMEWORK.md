# NIL — design framework

A design and interaction system for NIL, derived from three sources: the DasDev visual
language, macOS workstation conventions, and the way modern agent clients showcase their
own work.

---

## 1. The idea

NIL is a terminal-first security assessment workstation. The design problem is not
"make a hacker app look cool" — it's that a practitioner will stare at this for six hours
and needs to find the one critical finding in a wall of machine output.

That produces the organizing law:

> **Color means risk. Nothing else in the app is allowed to be colorful.**

No brand accent, no colored primary button, no gradient, no green-on-black. Chrome is a
five-step greyscale. The only saturated pixels on screen are severity values, and their
chroma falls as severity falls — so Critical is the visually loudest thing in the
interface by construction, not by convention.

The second law does the same job for typography:

> **The typeface says who is speaking.** Mono = the machine (hosts, ports, CVEs, hashes,
> raw output). Sans = NIL (labels, buttons, assessment prose).

In most dark developer tools mono is a texture choice. Here it's a semantic boundary: you
can tell at a glance whether you're reading evidence or reading an interpretation of
evidence. In a security tool that distinction is the whole product.

The third law is about *where* to spend the GPU, not whether to:

> **GPU spend is zoned.** Zone A (cold open, lock, idle) is full WebGL2 — shaders,
> dithering, metal, liquid glass. Zone B (app chrome) is one metered context at ≤30fps.
> Zone C (stream, findings, terminal) is transform and opacity only.

Zone C isn't taste. A shader loop behind a six-hour streaming log costs battery, spins
fans on a laptop during an on-site engagement, and competes with text rasterization for
compositor time. Zone A has none of those problems — nothing else is running, it lasts
five seconds, and it's the identity moment of the product. Spend it all there.

---

## 2. What carries over from dasdev.net — and what changes

Each lab study is ported with a *job*, not as decoration:

| dasdev.net study | Role in NIL |
|---|---|
| Dot matrix wordmark | The cold open's payoff — the mark precipitates out of dithered metal; also the title-bar run-state glyph |
| Grain & vignette | Once on the shell at 2.2% — atmosphere for long low-light sessions |
| Snappy cursor | Dropped. A custom cursor in a tool with text selection and terminal focus is a liability |
| Text scramble | **SCRAMBLE** — fires only when the machine resolves a value (hostname, CVE, CVSS) |
| (new) | **COLD OPEN** — WebGL2: brushed metal, Bayer dither, liquid glass. Zone A only |
| Magnetic buttons | **MAGNETIC** — primary CTAs only, max 3/screen, never on destructive actions |
| SVG connector line | **TRACE** — the spine down the agent stream's left gutter, drawing as steps commit |
| `· · · + · · ·` divider | **TICK** — a scan-phase progress spine. Rendering it idle would lie about state |
| `/Work(01)` gutter indices | Kept, restricted to genuinely sequential content (kill-chain phases, ranked findings) |

The deliberate subtraction: dasdev.net is an editorial marketing site with generous
whitespace and section reveals. NIL inverts the density — 13px body, 28–32px rows, no
per-section entrance animation. The visual language survives; the pacing doesn't.

**What I deliberately did not do:** the obvious move here is near-black with one acid
accent — the default "security tool" look, and one of the most reliable tells of a
generated design. Rejecting it is what freed color up to carry severity, which is the
better idea anyway.

---

## 3. Layout

macOS workstation, three zones, panels floating in a well:

```
┌─────────────────────────────────────────────────────────────┐
│ ● ● ●   nil ── engagement/acme-q3        [hunt] chat code report │
├──────────┬──────────────────────────────────────┬───────────┤
│ TARGETS  │  /Stream(01)                          │ /Findings │
│          │                                        │   (03)    │
│ ▸ scope  │  │ 01  ▸ nmap · 10.0.4.0/24    ok     │  ┌──────┐ │
│ ▸ 10.0.4 │  │         └ 14 hosts, 61 ports  ⌄    │  │ 9.1  │ │
│   ├ .12  │  │                                     │  │ CRIT │ │
│   └ .31  │  │ 02  ▸ httpx · :8080         ⣾run   │  └──────┘ │
│          │  │         ────────────────────        │  evidence │
│ ▸ creds  │  │                                     │  vector   │
│          │  │ ⌷ streaming…                        │  remedy   │
│          │  ├──────────────────────────────────── │           │
│ · · + ·  │  │ > _                          ⌘K     │           │
└──────────┴──────────────────────────────────────┴───────────┘
   sidebar          center stage (the showcase)       inspector
```

Left is navigation, center is the agent stream, right is evidence. All content is left
aligned — centered text in a data-dense tool costs scan speed and buys nothing. The
center stage is the only place craft is visible; the rails stay quiet on purpose.

---

## 3b. The cold open

A single fullscreen triangle and one fragment shader — no geometry, no loaders, ~6KB.
Four movements driven by `uTime`:

| | Movement | What happens |
|---|---|---|
| 0.0–2.4s | **METAL** | A raking light sweeps across anisotropic brushed steel. The anisotropy is the whole trick: value noise stretched ~90:1 along X reads as machined strokes; isotropic noise reads as concrete. |
| 1.7–3.1s | **DITHER** | The wordmark *precipitates* out of the metal — an 8×8 Bayer threshold falling over time, punched through a dot-matrix grid. Not a cross-fade. |
| 2.5–4.1s | **GLASS** | A slab grows from a sliver into the app-shell rect. Refraction is screen-space: resample the scene function at a UV bent along the SDF gradient, split per channel for dispersion, add a Fresnel rim and a slow noise field so the surface never reads flat. |
| 4.0–4.8s | **HANDOFF** | Alpha falls out — not a fade to black. The DOM shell cross-dissolves in underneath. |

Two structural decisions worth keeping if you rewrite it. First, the scene is a *function*
(`scene(uv, …)`), which is why glass works in one pass: refraction is just resampling it at
an offset. Second, dithering appears twice — visibly, as the wordmark's emergence, and
invisibly, as `(bayer8(fragCoord) - 0.5) / 255.0` on the final color, which kills 8-bit
banding across the dark gradient for free.

The lifecycle is non-negotiable and lives in `40-nil-gpu.mdc`: the shell mounts and loads
data *underneath* the canvas so boot is never blocked; any input skips it; no WebGL2,
failed compile, or sub-45fps bails instantly to the plain shell (never a degraded shader);
DPR is capped at 2; `prefers-reduced-motion` holds the final frame rather than skipping the
visual; and teardown calls `loseContext()` so a five-second animation doesn't hold a GPU
context for a six-hour session.

---

## 4. The ten primitives

Every micro-interaction in the app is one of these or a composition of two. This is the
answer to "hundreds of micro-interactions": not a list of hundreds of one-offs, but ten
composable primitives with defined triggers, so the hundredth interaction someone builds
next year still feels like the first.

| # | Name | Trigger | Where |
|---|------|---------|-------|
| 01 | LIFT | hover any interactive surface | CSS |
| 02 | PRESS | active, always paired with LIFT | CSS |
| 03 | HALO | `:focus-visible` only | CSS |
| 04 | MAGNETIC | pointer near a primary CTA | JS attachment |
| 05 | SCANLINE | agent/scan working — replaces the spinner | CSS |
| 06 | TICK | scan phase clears | CSS |
| 07 | REVEAL | tool result / evidence expanding | CSS (`calc-size()`) |
| 08 | SETTLE | popover, dialog, command palette | CSS (`@starting-style`) |
| 09 | TRACE | agent step commits | CSS (scroll-driven) |
| 10 | SCRAMBLE | machine-resolved value arrives | JS attachment |

Budgets that keep this from becoming noise: one orchestrated moment per interaction;
SCANLINE is the only infinite animation in the app; MAGNETIC capped at three per screen;
SCRAMBLE is semantic and never decorative.

---

## 5. The agent surface

This is where NIL earns its reputation, and it takes its cues from how good agent clients
show their work: **a tool call is a first-class inspectable object, not a log line.**

A tool card has four zones — header (tool name in sans, primary arg in mono), state
(pending → running → ok/error, with SCANLINE on running), result (collapsed, REVEAL to
intrinsic height), and gutter (index + TRACE segment).

The rules that matter most:

- **Failed calls expand by default.** A collapsed error is a hidden error.
- **Never show prose about output instead of the output.** The agent's summary sits
  beside the raw result, never in place of it.
- **Pinned autoscroll.** The stream follows new tokens only while the user is at the
  bottom. Scrolling up releases the pin and surfaces "Jump to latest". Yanking a reading
  user back down is the worst bug this surface can ship.
- **Always interruptible.** A visible Stop at all times; stopping preserves the partial
  stream, labeled as interrupted.
- **A finding leads with evidence.** Severity chip, CVSS vector, verbatim evidence in
  mono — then assessment and remediation in NIL's voice. A score without its vector is
  not a finding.

---

## 6. Files

```
.cursor/
  rules/
    00-nil-design-language.mdc   alwaysApply — the three laws, surfaces, writing
    10-nil-motion.mdc            globs css/svelte — primitives, budgets, reduced motion
    20-nil-svelte5.mdc           globs svelte/ts — runes, streaming state, boundaries
    30-nil-agent-surface.mdc     globs agent/findings — tool cards, streaming, inspector
  skills/
    nil-interaction-primitives/  magnetic, scramble, pinned autoscroll, command palette
    40-nil-gpu.mdc               globs gl/frag — zones, lifecycle, shader authoring
src/lib/styles/
  tokens.css                     color, type, space, depth
  motion.css                     the ten primitives + reduced-motion contract
src/lib/gl/
  coldopen.frag                  the shader
  ColdOpen.svelte                harness — gates, perf bail, teardown
preview/
  coldopen.html                  self-contained, open in a browser
```

Import both stylesheets once in the root layout. Rule `00` is always on; the rest scope
themselves by glob so Cursor isn't carrying the whole system on every edit.

---

## 7. Build order

1. Drop in `tokens.css` + `motion.css` and the five rules. Nothing else changes yet.
2. Convert the app shell: well, floating panels, grain once, `--r-window`.
3. Build the tool card — it's the highest-leverage component and validates REVEAL,
   SCANLINE, and TRACE at once.
4. Wire pinned autoscroll and the Stop control before adding any more polish. These are
   correctness, not craft.
5. Findings inspector with the severity ramp.
6. Command palette last, once the verb list is stable — the palette is a mirror of the
   app's actions and shouldn't be built before they settle.

The cold open can land any time — it's fully decoupled by design. Tune it against the real
wordmark early though, since the dither timing is the thing most worth getting right and it
depends on the mark's stroke weight.
