# v0.2.0 — Tactical Telemetry & Spatial Ergonomics

Second workstation pass. Scope: composer, inspector gutter, approval gate,
agent stream, target tree. Command palette and titlebar are untouched —
next pass.

## Shipped

**StreamComposer** (`frontend/src/lib/components/shell/StreamComposer.svelte`)
- Mode picker consolidated into the composer; the titlebar now carries
  identity only (`nil ── engagement-path`). One control, one place.
- Inactive chip color moved `--nil-ink-3` → `--nil-ink-2`, raising contrast
  on `--nil-panel` from ≈3.9:1 to ≈7.2:1 (both measured against the real
  token hex values, not assumed).
- `Send` gets a `<kbd>↵</kbd>` keycap.
- `--dur-flip` / `--ease-out` transitions on chip state changes — flips no
  longer snap.
- **Charter amendment, 2026-09-07** (`.cursor/rules/00-nil-design-language.mdc`):
  two named, scoped exceptions were added to the source-of-truth doc for this
  release — a 1px conic chromatic ring under `:focus-within` only (Law 1),
  and an SVG goo filter (`#nil-goo-surface`) confined to the mode chips'
  background layer only, never the label (Law 3). Both are static under
  `prefers-reduced-motion`. These are the only two departures from
  greyscale-chrome / transform-opacity-only in the whole workstation —
  everywhere else, saturation still means severity.

**RightSidebar** (`RightSidebar.svelte`)
- Gutter repainted as a 1px hairline (`::after`): idle `--nil-line`, hover
  `--nil-line-hot`, drag-active `--nil-ink-2` — no painted slab.
- WAI-ARIA "window splitter" pattern: `role="separator"`, arrow-key
  stepping in `--s-4` (16px) increments, Home/End to the shared
  `MIN_W`/`MAX_W` bounds, live `aria-valuenow`.
- 8px transparent hit target over the 1px visual line (Fitts's law).

**ApprovalBlock** (`ApprovalBlock.svelte`) + composer gate exit
- `role="alertdialog"`, `aria-live="assertive"`, autofocus on the primary
  action.
- `⌘↵` / `⌘⇧↵` keycaps raised to `--nil-ink-2` for AA contrast on
  `--nil-raised`.
- Gate resolution exit: 160ms `--dur-enter` cubic-in (opacity + 4px
  translateY, Law 3 — transform/opacity only), falling back to an 80ms
  opacity-only fade under `prefers-reduced-motion`.
- Rejected in review: a `--nil-line-hot` focus ring on the gate (1.9:1 on
  `--nil-raised` — fails AA), and a phantom "Inspect Diff" button with no
  wired action. Kept the compliant `nil-halo` and dropped the dead control.

**AgentStream / ToolBlock** (`AgentStream.svelte`, `ToolBlock.svelte`)
- Fixed-width telemetry columns: 8ch timestamp (`HH:MM:SS`, stamped once
  per step, no re-render drift), fixed glyph/state cells, right-aligned 6ch
  duration from real `startTime`/`endTime` — blank cell when absent, never
  a fabricated value.
- `contain: content` on log rows isolates append layout cost; `overflow-anchor:
  none` on the scroller kills scroll jitter; scroll writes batch through
  `requestAnimationFrame` in `pinned.svelte.ts`.
- `<kbd>G</kbd>` jump-to-latest badge, backed by a real keymap binding
  (`keymap.svelte.ts`) — bare `G` outside an editable field dispatches
  `nil:jump-latest`.
- Rejected in review: fabricated sub-second (`.mmm`) timing and mock hex
  memory addresses — the evidence-first law means blank beats invented.

**TargetTree** (`TargetTree.svelte`)
- Removed an `{@html renderNode()}` interpolation — dead icon markup and an
  XSS surface — and rebuilt the list as keyed `{#each}` rows.
- Fold state decoupled from derived app state (`toggled: Set<string>`);
  selecting a leaf target now resolves the root `engagementId` without
  corrupting sibling fold state.
- `role="tree"` with a roving-tabindex keyboard walker (arrows, Enter,
  Space), continuation-aware hairline guides at `--s-4` (16px) indent
  steps, status rendered strictly in ink levels (active `--nil-ink-2`,
  paused `--nil-ink-3`, completed `--nil-ink-4`).

## Housekeeping (this release)

- All 21 pre-existing `svelte-check` a11y/reactivity warnings resolved —
  `npm run check` now reports 0 errors, 0 warnings. Fixes were either real
  corrections (an `aria-activedescendant` that was on the wrong element,
  invalid `aria-selected` on a native button, a non-reactive `bind:this`
  target) or documented `svelte-ignore`s for patterns the linter doesn't
  recognize (roving-tabindex trees, focusable ARIA separators, the Tauri
  window-drag region).
- `npm run build` verified clean.

## Known gaps, deliberately not touched this release

- Command palette (`CommandPalette.svelte`) still runs the older, pre-`--nil-*`
  token vocabulary (`--surface-border`, `--text-tertiary`, `--spring-snappy`,
  etc.) — untouched by this pass. Flagged for the token-cleanup phase, not
  silently migrated as a side effect of an a11y fix.
- Titlebar/engagement breadcrumb: unchanged.
- No screenshot exists for a live approval gate, streaming tool call, or a
  populated target tree — those states need a running engagement (backend +
  agent run), which this static-build verification pass doesn't have. The
  two screenshots shipped with this release (empty command-center home,
  and the composer's focus state) are the only ones actually captured
  against the real build; nothing here is a mockup.
