# /goal — NIL frontend rebuild

Paste this whole file into Cursor as the standing goal/context for this work. It's long on purpose — every section answers a question a fresh agent would otherwise have to guess at.

## What NIL is, right now

NIL is a pentest workstation: a SvelteKit frontend (`frontend/`) driving a Python backend/engine (`finn_pentest/`) — target management, an AI hunt loop, findings, reports. The frontend already has a real, considered design system (`frontend/src/lib/styles/tokens.css`, `frontend/src/app.css`) — three-layer tokens (primitive → semantic → component), a severity ramp, an ember brand accent used sparingly. That foundation is good. Keep it. This isn't a rewrite from zero; it's a deliberate evolution toward a specific, validated design.

## The actual goal

Turn NIL into a general-purpose AI coding agent workstation that happens to also do pentesting as one mode — not a pentest tool with a chat window bolted on. Think "Claude Code's desktop experience, but as its own product, with a security mode built in at the same level as the coding mode." Premium, warm, quiet — never a VS Code plugin, never a generic AI-assistant template.

**What stays untouched:** `finn_pentest/` — the engine, the hunt loop, the AI provider plumbing, the API contracts the frontend talks to. Don't refactor it as part of this work. If the frontend needs a new endpoint or a shape change from the backend, that's a separate, explicit ask — don't quietly change both at once.

**What's in scope:** everything under `frontend/`.

## Source of truth for the visual design

A full interactive wireframe exists at **`docs/wireframe.html`** and is the spec for every visual/motion decision below — colors, spacing, exact animation curves, copy tone. It's a single self-contained HTML file (no build step) you can open directly in a browser to see and interact with every pattern described here: hover states, the command palette filtering, the dictation demo, the dither wipe, all of it. Do not guess at a color, easing curve, or copy line that's specified there when you could just open the file and look. (Note: it's rev. 15 of an iterative design session — read it alongside `motion.css`, which is the authoritative version wherever the two disagree, per the note below.)

## Design tokens — already updated, this is the target state

`frontend/src/lib/styles/tokens.css` and `frontend/src/app.html`'s font `<link>` have already been updated to:

- **Font:** Plus Jakarta Sans (UI) + JetBrains Mono (machine/code) — replaces Inter. The typographic law is unchanged: mono is *always* "the machine speaking" (paths, hashes, CVEs, terminal, code), sans is *always* "the application speaking" (labels, prose, buttons). Never mix roles on the same string.
- **Palette:** every surface/ink token nudged a few degrees warmer (toward the ember hue) — `--nil-void:#0a0908`, `--nil-panel:#141210`, `--nil-raised:#1c1916`, `--nil-line:#2a2622`, `--nil-line-hot:#3c352e`, `--nil-ink:#efe9e0`, `--nil-ink-2:#a39a8e`, `--nil-ink-3:#736a5f`. Ember refreshed to `--brand-ember-500:#c2652f` / `--brand-ember-300:#e6a35c`.
- **The one hard rule, unchanged and non-negotiable:** color means risk. Chrome (panels, borders, most text) is greyscale. `--sev-*` severity colors exist only for pentest findings. `--brand-ember-*` exists only for Zone A identity moments (cold open / welcome screen, session handoff, "this action is changing your files," a destructive-action's committing button) — never as generic UI decoration, never as a second "brand blue" or any other new hue. If you're about to add a color and it isn't a severity or ember-in-Zone-A, stop and use ink instead.

Do not add new named colors to the palette without discussing it first — the whole point of this system is that it stays this disciplined.

## Icons — pick one, then commit

The wireframe's icon demos are hand-drawn placeholders (built without CDN access to a real icon library) — they are not the deliverable. For the real app:

- The current codebase already uses `@iconify/svelte` with Phosphor (`ph:*`) icons. That's a legitimate, curated icon set — the earlier complaint about the wireframe was about raw Unicode characters (◧ ⌘ ◫), which doesn't apply here.
- Decide once, explicitly: stay on Phosphor, or move to **Lucide** (closer in weight/warmth to what Claude's own UI uses — thinner stroke, rounder joins). Don't mix icon families in the same view.
- Whichever you pick: 16px default size, 19–20px only on primary navigation (the rail) where the icon *is* the control, not a label next to one. No 24px toolbar icons. No icon-plus-text rows stacked densely like an IDE sidebar — that's the exact "VS Code plugin" look to avoid.
- The monogram (an "N" flanked by nested signal-wave brackets, built as a rasterized pixel grid — see `ui/NilMonogram.svelte`, which already exists) is the one place pixel-art chunkiness is intentional. Don't smooth it into a vector icon.

## Layout — the shell

Current: a resizable labeled sidebar (`Sidebar.svelte` + `TargetTree.svelte`) plus a main workspace plus a right sidebar. Target: collapse the left side into a **thin icon rail** (Claude/Grok pattern) — hover to reveal a label via tooltip, click to pin open into the full target tree when you actually need it. Files/targets, Terminal, Diffs, and Pentest mode each get one rail icon. This is a real layout change to `Sidebar.svelte`; treat it as "add a collapsed-by-default icon-only state that's the new default," not a full component rewrite, since the resize/pin mechanics already exist and are worth keeping.

The terminal is not a permanent pane. It slides in under the composer only while a command is actually running and folds away once it's idle — generalize this to *any* tool that needs temporary space (a running test suite, a build log, a lint pass), not just the terminal specifically.

Tool calls in the agent stream are disclosure rows (collapsed by default, one-line summary + a chevron), and opening one that touched a file shows the real diff — additions tinted ember (same "this is changing your files" rule as everywhere else), deletions dimmed with a strikethrough, never a second diff-specific color pair.

## The composer

Rebuild `StreamComposer.svelte` to carry real state above the input, the way Claude's own composer does — not hidden in a settings menu:

- **Context chips** for attached files, each dismissible (shrink + fade together on the `×`, not an instant disappearance).
- **A mode segment** (Build / Pentest) as a sliding two-state control, not a separate toggle elsewhere in the chrome. The active pill's motion has personality: it "jellies" against whichever side it's arriving at — the leading edge settles solid, the trailing edge overshoots and wobbles back (`element.animate()` with a few keyframed `scaleX` values anchored via `transform-origin` at the landing edge — the wireframe has the exact keyframe list).
- **A model chip** that opens into a real picker: model name + one-line description + a checkmark on the active one, then a divider, then Effort and "More models."
- **@-mention**: typing `@` opens a filtered file/line picker inline, Tab or Enter inserts it as a chip-like token. This is new functionality — a real autocomplete against the target's file list, not a static demo.
- Mic + a filled waveform icon for voice input (voice UI itself is out of scope for this pass — just the composer affordance).

## Motion vocabulary is now the source of truth in `motion.css`

`frontend/src/lib/styles/motion.css` already had a real, documented "primitives" system before this rebuild — durations named by job, a `--ease-spring` overshoot curve, ten named patterns (LIFT, PRESS, HALO, MAGNETIC, SCANLINE, TICK, REVEAL, SETTLE, TRACE, SCRAMBLE), each with an explicit usage rule. That system has now been **updated, not replaced**, to fold in the ideas below: `--ease-spring` is documented as the app's one general overshoot curve (was previously scoped to magnetic/popover only), a JS-keyframe equivalent `--ease-pop` was added for places `element.animate()` needs a cubic-bezier instead of `linear()`, and four new primitives were added — `JELLY` (the mode-segment pill), `DROPLET` (row hover water-fill, including the exact stacking-context footgun already hit and fixed once — read the comment before touching it), `HOLD` (press-and-hold to confirm), `MORPH` (copy/check confirmation). Read `motion.css` itself for the authoritative version of all of this — don't re-derive it from the wireframe file if the two ever disagree, `motion.css` wins now.

## Motion vocabulary — implement each of these as reusable primitives, not one-offs

All of them are demonstrated live in the reference wireframe; the descriptions below are the "why," not a substitute for looking at the actual code there.

1. **The dither wipe.** An 8×8 ordered (Bayer) dither transition, eased on a cubic curve (`cubic-bezier(.22,.61,.36,1)` in, standard ease-out timing), used for session handoff / "build complete" beats — not routine navigation. A second variant dissolves a single flat overlay color (a darker tint of the panel background, **no random per-frame flicker** — that reads as broken static, not a deliberate effect) to reveal a panel that's arriving (a settings sheet, a popover), rather than sliding or fading in.
2. **Streaming text.** Builds one letter at a time: a small fixed-count burst of ember-colored "ash" particles converges onto each letter's position, the letter resolves into real type, then the next letter starts its own burst. Not a global particle scatter — cheap regardless of string length.
3. **Dictation.** A real backspace/type text engine (compute the common prefix between two states, animate deleting back to it, then type forward) — not a string swap. It has to be able to play a genuine "oh wait, never mind" retraction: back up to the specific clause that changed, not the whole sentence. Pair with a lock icon and copy that's explicit that this runs on-device.
4. **Row hover.** A "water-droplet" fill: a circle grows from wherever the cursor entered the row, sized dynamically to the farthest corner of that row so it always fully covers it regardless of entry point; on mouse-leave it re-anchors to the exit point and shrinks back toward it. Implementation footgun already hit and fixed once: the fill element needs `position: relative; z-index: 0` on the *row itself* (not just `position: relative`) so a negative-z-index fill element is contained within the row's own stacking context — otherwise it either paints over inline text (unpositioned text always paints above a `z-index: 0` positioned sibling) or, if you reach for `z-index: -1` without giving the row its own stacking context, it escapes and sinks behind the entire parent panel and disappears. Both bugs are real and both got hit while building this — don't reintroduce either.
5. **Buttons.** A quick press-down (~70ms, scale ~0.955) and a bouncier release using a "back" ease with slight overshoot (`cubic-bezier(.34,1.56,.64,1)`) — plus a small hover lift (translateY -1px + soft shadow). This is the *default* button feel, not a one-off demo — apply it at the shared button component level.
6. **Toggles / segmented controls / focus rings** all use that same overshoot ease — one motion vocabulary, not a different curve per component.
7. **Hold-to-confirm.** For destructive actions: press and hold fills the button (or a ring around it) over ~850ms; releasing early cancels cleanly with no half-committed state. Use this instead of a click-then-modal-confirm pattern for things like deleting scope/targets.
8. **Copy affordance.** Icon-only (no "copy" text label), pops on hover, morphs to a checkmark and flashes a small sliding "Copied" label on click, then reverts. Reuse this pattern anywhere something is copyable (branch names, hashes, file paths) — not just one instance.

## Screens to build (beyond the shell + composer)

Reference the wireframe for exact layout/copy on each:

- **Welcome / cold open** — greeting, composer, recent sessions. This is Zone A, so it's one of the only places ember is allowed to be more than a sliver, plus a static 8×8 dithered "waterfall" wash falling from the top edge (sized to the actual rendered box at draw time — don't hardcode a canvas resolution and stretch it, that's a real bug that happened once already). A scrim keeps text legible over the densest part of the dither.
- **Command palette (⌘K)** — live filtering as you type, arrow-key selection, Enter runs the selected row.
- **Findings list** — the one screen where the severity color ramp is the point; everywhere else stays grayscale-and-ember.
- **Settings** — grouped toggle rows. Only the row's *label* brightens/grows slightly when its toggle is on; don't tint the whole row's background.
- **Source control, GitHub, MCP tools** — three new panels: current branch + diff stat + CI status; connected repo + PR/issue summary; a list of connected MCP servers with per-server enable toggles.
- **Pentest empty state** — the matrix-rain motif (already exists conceptually in the codebase's identity) lives here specifically: the background wash before a target is loaded, and a much fainter/slower version behind the rail's Pentest icon while that mode is active but idle. It never runs behind actual findings or scan output once there's real content on screen.
- **Conversation states** — three distinct moments, not just "the shell at rest": the agent responding mid-task (a one-line status like "Searched code, read 2 files, ran a command" with a chevron to expand, plus "3m 19s · 169 tokens · Almost done thinking…" underneath), you talking to it (a waveform that reacts to whether speech/dictation is actually active vs. paused — not a fixed decorative loop), and a full clarifying-question card modeled directly on Claude's own UI: a title question, a "1 of 3" pager with prev/next, numbered options, a "something else" row that turns into a real text field on click, a reply-directly composer underneath, and a footer hint (`↑↓ to navigate · ↵ to select`). Keep the simpler binary Cancel/Continue confirm too, for genuinely yes/no moments — give its committing button a subtle pulsing glow around the edge.

## Sequencing

1. Tokens/fonts (done — verify nothing visually broke).
2. Icon library decision (Phosphor vs. Lucide) — one PR, discussed first.
3. Shell: rail collapse behavior on `Sidebar.svelte`.
4. Composer rebuild (chips, mode segment, model picker, @-mention).
5. Shared motion primitives (button press physics, the overshoot ease, the row-hover droplet) as reusable CSS/actions, not per-component copies.
6. New screens, roughly in the order listed above.
7. Conversation-state screens last — they depend on the composer and motion primitives being solid first.

## Guardrails

- Don't touch `finn_pentest/` as part of this.
- Don't introduce a new named color outside `--sev-*` / `--brand-ember-*`.
- Don't reach for a 24px icon or a dense icon+label row — that's the VS Code look this is explicitly moving away from.
- Don't add a loading spinner or motion pattern that isn't one of the ones above without checking first — the whole point is one coherent vocabulary, not a different trick per screen.
- Keep `frontend/` building and `svelte-check` clean after each step; don't let multiple screens go in half-finished at once.
