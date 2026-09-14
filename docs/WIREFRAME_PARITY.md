# Wireframe ↔ app parity

Every distinct interactive pattern demoed in `docs/wireframe.html` (rev. 15),
checked against the real app under `frontend/src/`. This is a read-only audit —
gaps are closed by separate prompts, not here.

Legend: **yes** = implemented and matches the wireframe intent · **partial** =
present but diverges from the wireframe in a named way · **no** = not in the app.

| Pattern | Wireframe section | Implemented? | Real file(s) | Notes |
|---|---|---|---|---|
| Icon rail (collapsed by default, hover reveals label, click pins the panel) | 1 (shell) | yes | `lib/components/shell/Sidebar.svelte` | Files / Terminal / Diffs / Pentest rail; `data-tip` tooltip on hover; `clickRail` pins. |
| Hover-reveal terminal dock — slides in while running, folds away when idle | 1, callout 02 | yes | `lib/components/shell/ToolDock.svelte`, `routes/+layout.svelte`, `lib/stores/workspace.svelte.ts` (`openDock`/`updateDock`/`dockLinger`) | `in:settle` slide-in; 900ms linger then unmount on non-running status. |
| Same dock behavior generalized to **any** long-running tool (test/build/lint), not just the PTY | 1, callout 07 | yes | `routes/+layout.svelte` (`classifyDock(runningTool.name)`), `lib/stores/workspace.svelte.ts` (`DockJob.kind`) | Any running tool step opens a dock keyed by `classifyDock` (test/build/lint/command); folds away on completion. Prompt 5 target — already satisfied. |
| Tool calls as disclosure rows (collapsed, one-line summary + chevron; open shows the diff) | 1 | yes | `lib/components/ui/ToolBlock.svelte` | `nil-reveal` accordion; diff bodies render `InlineDiff`. |
| Diffs on one accent — additions tint ember, deletions dim + strikethrough | 1, callout 04 | yes | `lib/ui/InlineDiff.svelte` | `.add` = `--brand-ember-300` + 12% tint; `.del` = `--nil-ink-3` + `line-through`. |
| Hovering a tool row highlights the exact changed line in the diff | 1, callout 06 | no | — | The stream sets the active diff on tool completion (`workspace.setDiff`) but there is no row-hover → diff-line highlight wiring. Not required by prompts 2–6. |
| Mode moved into the composer as a segmented control | 1, callout 01 / 4 | yes | `lib/components/shell/StreamComposer.svelte` | Build / Pentest segment. |
| Model chip opens a real picker (name + description + active check, divider, Effort, More models) | 1, callout 05 | yes | `lib/components/shell/StreamComposer.svelte` | Popover with model list, effort row, "More models". |
| Hover a branch name → copy affordance appears | 1, callout 03 | yes | `lib/components/shell/Titlebar.svelte`, `lib/components/shell/SourceControl.svelte`, `lib/ui/CopyAffordance.svelte` | Icon-only copy that morphs to a check. |
| Font system — Plus Jakarta Sans (UI) + JetBrains Mono (machine) | 2 | yes | `lib/styles/tokens.css`, `app.html` | Already landed; confirm-only per the brief. |
| Status glyph — idle (`·`) | 3 | partial | `lib/components/shell/StatusBar.svelte` | A connection dot exists, but there is no unified idle/thinking/editing state-glyph set as the wireframe frames it. |
| Status glyph — thinking (`⋯`) | 3 | partial | `lib/components/ui/AgentRunBar.svelte` (`runHint`) | Surfaced as text ("Almost done thinking…"), not a distinct glyph. |
| Status glyph — editing files (`±`, ember) | 3 | no | — | No distinct editing-files glyph in the chrome. |
| Status glyph — running (`⠿`) | 3 | partial | `lib/components/shell/StatusBar.svelte` (`nil-scan`) | The app uses SCANLINE for "working" (per motion law), not the braille glyph. The wireframe marks the running glyph as an open question, not spec-final — left as-is on purpose. |
| Status glyph — **needs you** (thin ring + bright spinning arc) | 3 | no | — | No distinct "waiting on a person" indicator in the status chrome; `StatusBar` only shows the words "awaiting approval". **Prompt 3 target.** |
| Streaming text — ash particles build one letter at a time | 4 | yes | `lib/ui/AshText.svelte`, `lib/motion/ashText.ts` | Used for assistant messages in `AgentStream.svelte`. |
| Running-process spinner | 4 | yes (by substitution) | `lib/styles/motion.css` (`nil-scan`) | The wireframe braille spinner is replaced by SCANLINE, the sanctioned "agent working" loop. Deliberate divergence, not a gap. |
| Pentest idle rain | 4 / 5 | yes | `lib/ui/MatrixRain.svelte`, `lib/components/shell/PentestEmpty.svelte`, `lib/components/shell/Sidebar.svelte` (faint behind the Pentest rail icon) | Empty-state wash + faint rail-icon version; not run behind live content. |
| On-device dictation retraction — backspace to the diverging clause, then type forward | 4 / 6 | yes | `lib/motion/dictation.ts`, `lib/components/shell/StreamComposer.svelte` | `sharedPrefix` + backspace-to-prefix + type-forward — the exact algorithm from the wireframe's `initDictation`. Clause-level retraction is emergent from the common-prefix diff. **Prompt 2 target — already satisfied.** |
| Task-complete — check draws in (doesn't pop) | 4 | yes | `lib/styles/motion.css` (CHECK-DRAW primitive #21), `lib/components/ui/ToolBlock.svelte` | Landed after this audit (PR #45). The `ok` glyph is an SVG polyline with `pathLength="1"`; `stroke-dashoffset` transitions 1→0 when `data-drawn="true"` lands one frame after `step.state` flips to `ok`, so it draws in rather than appearing pre-drawn. |
| Invalid-input shake | 4 | yes | `lib/styles/motion.css` (SHAKE primitive #20), `lib/components/shell/StreamComposer.svelte` | Landed after this audit (PR #45). Rejected sends (empty input, unresolvable @-mention) re-add `.nil-shake` on the same element after a forced reflow so repeat rejections replay; a momentary hot border rides along. |
| Copy — icon morphs to a checkmark, flashes a label | 4 / 8 | yes | `lib/ui/CopyAffordance.svelte` (`.nil-morph` / `.nil-morph-label`) | Used across tool cards, titlebar, findings, SCM, approvals. **Prompt 4 (MORPH) target — already satisfied.** |
| Mode switch "jellies" against the wall it lands on | 4 | yes | `lib/components/shell/StreamComposer.svelte`, `lib/motion/jelly.ts`, `lib/styles/motion.css` (JELLY #11) | `element.animate()` keyframes anchored to the landing edge. |
| Row hover — water-droplet fill from the cursor entry point | 4 (motion) | yes | `lib/motion/droplet.ts`, `lib/styles/motion.css` (DROPLET #12) | Used on `ToggleRow`, mention rows, model picker rows; row hosts carry `.nil-row-host`. |
| Settings — grouped toggle rows, only the label brightens/grows | 5 | yes | `lib/ui/ToggleRow.svelte` | `.row.on .label` brightens + `scale(1.04)`; row background stays flat. |
| Command palette (⌘K) — live filter, arrow nav, Enter runs | 5 | yes | `lib/components/shell/CommandPalette.svelte` | |
| Findings list — severity ramp | 5 | yes | `lib/components/ui/FindingRow.svelte`, `lib/components/ui/FindingCard.svelte` | The one screen where `--sev-*` color is the point. |
| Source control panel — branch + diff stat + CI status | 5 | partial | `lib/components/shell/SourceControl.svelte`, `vite-plugin-nil-workspace.ts` (`/__nil/git`) | Works, but a missing/failed `gh` collapses to a silent empty CI panel with no signal. **Prompt 6.2 target.** |
| GitHub panel — repo + PR/issue summary | 5 | partial | `lib/components/shell/GitHubPanel.svelte`, `vite-plugin-nil-workspace.ts` (`/__nil/github`) | Same silent-`gh`-failure gap. **Prompt 6.2 target.** |
| MCP tools panel — connected servers + toggles | 5 | yes | `lib/components/shell/McpPanel.svelte`, `vite-plugin-nil-workspace.ts` (`/__nil/mcp`) | |
| Conversation — agent responding (status line + progress meta) | 6 | yes | `lib/components/ui/AgentStatus.svelte`, `lib/components/ui/AgentRunBar.svelte` | "Searched code, read N files…" + duration/tokens/hint. |
| Conversation — you talking (reactive waveform, live vs paused) | 6 | yes | `lib/components/ui/DictationWave.svelte`, `lib/components/ui/OnDeviceHint.svelte` | `data-live`/`data-hot` drive the bars; static at rest. |
| Clarifying-question card (title, pager, numbered options, "something else" → text field, reply bar, footer hint) | 6 | yes | `lib/components/ui/ClarifyCard.svelte` | Confirmed live via screenshot per the brief. |
| Binary confirm — glowing edge on the committing button | 6 | yes | `lib/components/ui/ConfirmCard.svelte` (`.nil-pulse`) | PULSE #16 on the Continue button. |
| Welcome / cold open — greeting, composer, recent sessions | 7 | yes | `lib/components/shell/Welcome.svelte`, `lib/gl/ColdOpen.svelte` | |
| Welcome — dithered waterfall wash | 7 | yes | `lib/ui/DitherWaterfall.svelte` | Also on the report cover. |
| Button feel — press-down + bouncy release + hover lift | 8 | yes | `lib/styles/motion.css` (LIFT #01 / PRESS #02) | Applied at the shared button level. |
| Toggles / segments / focus rings share the one overshoot ease | 8 | yes | `lib/styles/motion.css` (`--ease-spring` / `--ease-pop`, HALO #03) | |
| Dither wipe — 8×8 Bayer, identity beats | 9 | yes | `lib/ui/DitherWipe.svelte`, `lib/motion/dither.ts` | Used for session handoff (`AgentStream`) and the report cover. |
| Dither dissolve variant — flat overlay reveals an arriving sheet | 9 | yes | `lib/ui/DitherWipe.svelte` (`mode="dissolve"`) | Used by `SettingsSheet` and `CommandPalette`. |
| Identity monogram — rasterized pixel grid | 1 | yes | `lib/components/ui/NilMonogram.svelte` | Pixel-art chunkiness kept intentional. |
| HOLD — press-and-hold to confirm a destructive action | motion.css primitive | yes | `lib/ui/HoldConfirm.svelte`, `lib/components/shell/Sidebar.svelte` ("Delete target") | **Prompt 4 (HOLD) target — already wired to a real destructive action.** |

## Gap summary (drives prompts 2–6)

- **Prompt 2 — dictation retraction:** already implemented; `dictation.ts` mirrors the wireframe's diff-and-retype engine exactly. No code change.
- **Prompt 3 — "needs you" status glyph:** **missing.** No distinct spinning-ring indicator in the status chrome. Real work.
- **Prompt 4 — HOLD / MORPH primitives:** both already wired (HOLD → "Delete target" in `Sidebar`; MORPH → `CopyAffordance` across the app). No code change.
- **Prompt 5 — generalize the terminal dock:** already generalized in `+layout.svelte` via `classifyDock`. No code change.
- **Prompt 6 — backend-honesty pass:** four real gaps — the `@`-mention flow sends only a literal `@path`; `gh` failures collapse to silent empty panels; `Titlebar` uses `role="banner"`; `run.svelte.ts` leaks `console.error` in the reject path.
