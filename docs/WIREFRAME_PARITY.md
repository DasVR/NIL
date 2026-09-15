# Wireframe ↔ app parity

Every distinct interactive pattern demoed in `docs/wireframe.html` (rev. 15),
checked against the real app under `frontend/src/`. Sequential merge of PRs
#42–#54 plus the Law 1 / a11y pass on this branch.

Legend: **yes** = implemented and matches the wireframe intent · **partial** =
present but diverges from the wireframe in a named way · **no** = not in the app.

| Pattern | Wireframe section | Implemented? | Real file(s) | Notes |
|---|---|---|---|---|
| Icon rail (collapsed by default, hover reveals label, click pins the panel) | 1 (shell) | yes | `lib/components/shell/Sidebar.svelte` | Files / Terminal / Diffs / Pentest rail; `data-tip` tooltip on hover; `clickRail` pins. |
| Hover-reveal terminal dock — slides in while running, folds away when idle | 1, callout 02 | yes | `lib/components/shell/ToolDock.svelte`, `routes/+layout.svelte`, `lib/stores/workspace.svelte.ts` (`openDock`/`updateDock`/`dockLinger`) | `in:settle` slide-in; 900ms linger then unmount on non-running status. |
| Same dock behavior generalized to **any** long-running tool (test/build/lint), not just the PTY | 1, callout 07 | yes | `routes/+layout.svelte` (`classifyDock(runningTool.name)`), `lib/stores/workspace.svelte.ts` (`DockJob.kind`) | Any running tool step opens a dock keyed by `classifyDock` (test/build/lint/command); folds away on completion. |
| Tool calls as disclosure rows (collapsed, one-line summary + chevron; open shows the diff) | 1 | yes | `lib/components/ui/ToolBlock.svelte` | `nil-reveal` accordion; diff bodies render `InlineDiff`. |
| Diffs on one accent — additions tint ember, deletions dim + strikethrough | 1, callout 04 | partial | `lib/ui/InlineDiff.svelte` | Law 1: Zone C diffs stay greyscale. Adds are brighter ink + a `+` gutter; dels are dim + strikethrough + a `-` gutter. Hover-focus overlay is opacity-only ink, not ember. |
| Hovering a tool row highlights the exact changed line in the diff | 1, callout 06 | yes | `lib/components/ui/ToolBlock.svelte`, `lib/ui/InlineDiff.svelte` | Header hover *and* keyboard focusin light the first add (else first del). Hover never opens the row. |
| Mode moved into the composer as a segmented control | 1, callout 01 / 4 | yes | `lib/components/shell/StreamComposer.svelte` | Build / Pentest segment. |
| Model chip opens a real picker (name + description + active check, divider, Effort, More models) | 1, callout 05 | yes | `lib/components/shell/StreamComposer.svelte` | WAI-ARIA menu-button (`menuitemradio`); effort group; "More models" opens settings. |
| Hover a branch name → copy affordance appears | 1, callout 03 | yes | `lib/components/shell/Titlebar.svelte`, `lib/components/shell/SourceControl.svelte`, `lib/ui/CopyAffordance.svelte` | Icon-only copy that morphs to a check. |
| Font system — Plus Jakarta Sans (UI) + JetBrains Mono (machine) | 2 | yes | `lib/styles/tokens.css`, `app.html` | Tokens are the source of truth (`--font-ui` / `--font-machine`). |
| Status glyph — idle (`·`) | 3 | yes | `lib/components/ui/AgentGlyph.svelte`, `lib/agent/phase.ts` | Unified set; idle is a dim `·`. |
| Status glyph — thinking (`⋯`) | 3 | yes | `lib/components/ui/AgentGlyph.svelte` | Distinct `⋯` while a turn is in flight with no mutating tool. |
| Status glyph — editing files (`±`) | 3 | yes | `lib/components/ui/AgentGlyph.svelte` | `±` in ink (not ember — Law 1). Label still reads "Editing files". |
| Status glyph — running (`⠿`) | 3 | partial | `lib/components/shell/StatusBar.svelte` (`nil-scan`) | SCANLINE for "working" (motion law), not the braille glyph. Wireframe marks running as an open question. |
| Status glyph — **needs you** (thin ring + bright spinning arc) | 3 | yes | `lib/styles/motion.css` (RING #19), `lib/components/ui/AgentGlyph.svelte` | Greyscale conic ring; reduced-motion keeps a static ring plus the text label. |
| Streaming text — ash particles build one letter at a time | 4 | yes | `lib/ui/AshText.svelte`, `lib/motion/ashText.ts` | Used for assistant messages in `AgentStream.svelte`. |
| Running-process spinner | 4 | yes (by substitution) | `lib/styles/motion.css` (`nil-scan`) | Braille spinner replaced by SCANLINE. Deliberate divergence. |
| Pentest idle rain | 4 / 5 | yes | `lib/ui/MatrixRain.svelte`, `lib/components/shell/PentestEmpty.svelte`, `lib/components/shell/Sidebar.svelte` | Empty-state wash + faint rail-icon version; not run behind live content. |
| On-device dictation retraction — backspace to the diverging clause, then type forward | 4 / 6 | yes | `lib/motion/dictation.ts`, `lib/components/shell/StreamComposer.svelte` | `sharedPrefix` + backspace-to-prefix + type-forward. |
| Task-complete — check draws in (doesn't pop) | 4 | yes | `lib/styles/motion.css` (CHECK-DRAW #21), `lib/components/ui/ToolBlock.svelte` | SVG polyline `pathLength="1"`; `data-drawn` flips one frame after `ok`. |
| Invalid-input shake | 4 | yes | `lib/styles/motion.css` (SHAKE #20), `lib/components/shell/StreamComposer.svelte` | Rejected sends re-add `.nil-shake` after a forced reflow. Hot border is `--nil-line-hot` (not ember). |
| Copy — icon morphs to a checkmark, flashes a label | 4 / 8 | yes | `lib/ui/CopyAffordance.svelte` (`.nil-morph` / `.nil-morph-label`) | |
| Mode switch "jellies" against the wall it lands on | 4 | yes | `lib/components/shell/StreamComposer.svelte`, `lib/motion/jelly.ts`, `lib/styles/motion.css` (JELLY #11) | |
| Row hover — water-droplet fill from the cursor entry point | 4 (motion) | yes | `lib/motion/droplet.ts`, `lib/styles/motion.css` (DROPLET #12) | |
| Settings — grouped toggle rows, only the label brightens/grows | 5 | yes | `lib/ui/ToggleRow.svelte` | Native checkbox exposed as `role="switch"`. |
| Command palette (⌘K) — live filter, arrow nav, Enter runs | 5 | yes | `lib/components/shell/CommandPalette.svelte` | Combobox + listbox + focus trap; `:focus-visible` halo on the search field. |
| Findings list — severity ramp | 5 | yes | `lib/components/ui/FindingRow.svelte`, `lib/components/ui/FindingCard.svelte`, `lib/findings/display.ts` | Hue + shape glyph (`■▲●◆○`) + text label. Unconfirmed leads drop hue/shape. |
| Source control panel — branch + diff stat + CI status | 5 | yes | `lib/components/shell/SourceControl.svelte` | `gh` failure surfaces an error state (no silent empty panel). |
| GitHub panel — repo + PR/issue summary | 5 | yes | `lib/components/shell/GitHubPanel.svelte` | Same: failed `gh` is an error, not a blank list. |
| MCP tools panel — connected servers + toggles | 5 | yes | `lib/components/shell/McpPanel.svelte` | |
| Conversation — agent responding (status line + progress meta) | 6 | yes | `lib/components/ui/AgentStatus.svelte`, `lib/components/ui/AgentRunBar.svelte` | |
| Conversation — you talking (reactive waveform, live vs paused) | 6 | yes | `lib/components/ui/DictationWave.svelte`, `lib/components/ui/OnDeviceHint.svelte` | |
| Clarifying-question card (title, pager, numbered options, "something else" → text field, reply bar, footer hint) | 6 | yes | `lib/components/ui/ClarifyCard.svelte` | `:focus-visible` halo on the other/reply fields. |
| Binary confirm — glowing edge on the committing button | 6 | yes | `lib/components/ui/ConfirmCard.svelte` (`.nil-pulse`) | PULSE #16 on Continue. |
| Welcome / cold open — greeting, composer, recent sessions | 7 | yes | `lib/components/shell/Welcome.svelte`, `lib/gl/ColdOpen.svelte` | |
| Welcome — dithered waterfall wash | 7 | yes | `lib/ui/DitherWaterfall.svelte` | Also on the report cover. |
| Button feel — press-down + bouncy release + hover lift | 8 | yes | `lib/styles/motion.css` (LIFT #01 / PRESS #02) | |
| Toggles / segments / focus rings share the one overshoot ease | 8 | yes | `lib/styles/motion.css` (`--ease-spring` / `--ease-pop`, HALO #03) | |
| Dither wipe — 8×8 Bayer, identity beats | 9 | yes | `lib/ui/DitherWipe.svelte`, `lib/motion/dither.ts` | |
| Dither dissolve variant — flat overlay reveals an arriving sheet | 9 | yes | `lib/ui/DitherWipe.svelte` (`mode="dissolve"`) | Settings sheet and command palette. |
| Identity monogram — rasterized pixel grid | 1 | yes | `lib/components/ui/NilMonogram.svelte` | Zone A identity; ember is allowed here. |
| HOLD — press-and-hold to confirm a destructive action | motion.css primitive | yes | `lib/ui/HoldConfirm.svelte`, `lib/components/shell/Sidebar.svelte` ("Delete target") | |
| Skip to workspace | a11y | yes | `routes/+layout.svelte`, `app.css` | First Tab reveals a skip link targeting `#workspace`. |

## Closed by sequential merge

- **Needs-you RING** — PR #43 / #49.
- **Unified status glyphs** — PR #49.
- **SHAKE / CHECK-DRAW** — PR #45 landed on master; parity refresh #47.
- **Honor model pick + real token streaming** — PR #51 / #52.
- **Backend honesty** (`@`-mention contents, `gh` errors, titlebar not a banner, reject-path) — PR #44.
- **Tool-row hover → diff line** — PR #48.
- **Workspace API bridge** — PR #53.
- **Palette / settings / picker / findings a11y** — PR #54.
