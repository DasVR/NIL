# Prompts for Cursor (Fable 5.1) — wireframe parity + gap closure

Model: **Claude Fable 5.1**. Run these **one at a time, in separate Cursor
sessions/chats** — not stacked into one giant prompt. That's not a style
preference, it's the anti-loop fix below in practice: a fresh session per
prompt keeps context bounded to one objective, so the agent has nothing
stale to re-verify or second-guess.

## Why this doc exists

`docs/UI_REBUILD_GOAL.md` is the original brief. `docs/wireframe.html` is
the visual/motion source of truth (rev. 15, now actually in the repo).
This doc is the third piece: a set of **fully self-contained, scoped
prompts** that close the specific gaps found by auditing Cursor's own PRs
(#37, #38, #40) against both of those — plus an operating contract every
prompt below inherits, aimed at a failure mode Cursor hit for real on this
project: agents that loop on their own review step instead of finishing.

---

## Operating contract — paste this into `.cursor/rules` or the start of every session

```
OPERATING CONTRACT (applies to this entire session):

1. ONE VERIFICATION PASS. Run `npm run check` and `npm run build` exactly
   once after you believe you're done. If either fails, fix the specific
   reported error and re-run ONCE more. If it still fails after that
   second run, STOP and report the exact failure — do not attempt a third
   fix-and-rerun cycle, do not start re-reading unrelated files "just in
   case," do not re-derive the same diagnosis a different way.

2. NO SELF-RE-REVIEW. Once you've made a change and it passes verification,
   do not re-open the same file again to "double check" it unless a LATER
   step's verification failure specifically points back to it. Reading a
   file you already read this session, with no new information since,
   is wasted context and the #1 cause of agents looping on their own
   review step instead of finishing (this is a documented Cursor failure
   mode, not hypothetical — see forum.cursor.com bug reports on agents
   stuck repeating the same review message).

3. DEFINE THE OUTCOME, NOT THE STEPS. Each prompt below states what done
   looks like. Decide your own implementation path. Do not ask for
   permission mid-task for decisions already implied by the OBJECTIVE,
   CONTEXT, and SCOPE sections — those ARE the permission.

4. APPEND-ONLY PROGRESS. If you're keeping any kind of running notes or
   TODO list for a multi-step prompt, only add to it — don't rewrite
   earlier entries to "clean them up." Rewriting your own history is
   how agents lose track of what they already tried and re-attempt it.

5. EXPLICIT STOP CONDITION. Each prompt ends with one. When you hit it,
   stop — commit, and end the turn. "While I'm in here, let me also..."
   is explicitly out of scope unless the prompt's SCOPE section says
   otherwise. If you notice something else broken, name it in your
   final report; do not fix it in the same pass.

6. EFFORT LEVEL: start at HIGH. Only drop to MEDIUM if a prompt is purely
   mechanical (renames, single-file fixes) — this is Anthropic's own
   guidance for Fable 5.1: higher effort isn't automatically better, use
   the cheapest level that reliably finishes the task.

7. BATCH INDEPENDENT READS. When you need to read multiple files that
   don't depend on each other, read them in the same turn, not
   sequentially one-by-one waiting on each result.

8. COMMIT MESSAGE = YOUR OUTPUT. Don't produce a separate summary document
   describing what you did — the commit message and PR description ARE
   the deliverable. If you catch yourself writing more than a paragraph
   of prose outside of code and commit messages, you've drifted from the
   task.
```

---

## Prompt 1 — Wireframe-vs-app parity audit (do this one first)

```
OBJECTIVE: Produce a single markdown table, committed as
docs/WIREFRAME_PARITY.md, listing every distinct interactive pattern
demoed in docs/wireframe.html against whether the real app
(frontend/src/) implements it, and if so, where.

CONTEXT: docs/wireframe.html is a rev. 15 self-contained HTML file — the
visual/motion source of truth for this rebuild. It was pulled out of a
design-review session's Claude Artifact and only just landed in this
repo, so nothing has been checked against it directly yet — prior work
was checked against the prose description in docs/UI_REBUILD_GOAL.md,
which is a lossy summary of the file, not the file itself. Sections
worth enumerating as separate rows: the icon rail + hover-reveal
terminal + disclosure rows (section 1), the font system (section 2,
already implemented — confirm only), the status glyphs including the
"needs you" spinning ring (section 3), the six motion demos — ash
streaming text, running-process spinner, pentest idle rain, on-device
dictation retraction, task-complete draw-in check, invalid-input shake,
copy-confirms-with-icon (section 4), the dither wipe and welcome
waterfall (sections referenced in Sidebar/Welcome work), the model
picker popover (section on model picker), settings row hover/brighten
behavior, and the clarifying-question card (already confirmed live via
screenshot, mark as implemented).

SCOPE: Read-only. Do not fix anything found missing in this pass — that
is what Prompts 2-5 are for. Do not modify any file except creating
docs/WIREFRAME_PARITY.md.

VERIFICATION: N/A (docs-only change) — just confirm the file you wrote
renders as a valid markdown table.

OUTPUT: docs/WIREFRAME_PARITY.md with columns: Pattern | Wireframe
section | Implemented? (yes/partial/no) | Real file(s) | Notes. Commit
message: "Audit: wireframe-vs-app parity table". One commit, one PR.

STOP CONDITION: The table is written, committed, and covers every
pattern named above. Do not start implementing fixes — end the turn and
let the next prompt pick a specific row.
```

## Prompt 2 — Port the real dictation retraction engine

```
OBJECTIVE: The composer's dictation feature should backspace to the
exact clause that changed on a self-correction ("default it to system"
→ "default it to" → "light"), then type forward from there — not
jump-cut the whole string to the corrected sentence.

CONTEXT: docs/wireframe.html's "Dictation — corrects itself, on-device"
demo (section 4) implements this with a real diff-and-retype engine, not
a string swap — read its <script> block for the exact algorithm (look
for the dictation demo's JS, roughly: diff two candidate transcripts,
find the common prefix, animate deleting back to the divergence point,
then type the new suffix forward). frontend/src/lib/motion/dictation.ts
already exists from the PR #37 rebuild — read it first and determine
whether it already does this or is a simpler string-swap/replace. Check
docs/WIREFRAME_PARITY.md (from Prompt 1) for what was already found here
before re-deriving it yourself.

SCOPE: frontend/src/lib/motion/dictation.ts and whatever composer
component consumes it. Do not touch unrelated composer features
(mentions, chips, model picker).

VERIFICATION: npm run check, npm run build — once each, per the
operating contract. If there's a way to exercise dictation without a
live mic (a text-fixture test or a dev-only trigger), use it to confirm
the backspace-then-retype animation actually fires on a changed
transcript; if no such harness exists, don't build one from scratch for
this prompt — note that gap in your commit message instead.

OUTPUT: A commit (and PR against master) that either confirms
dictation.ts already implements this correctly (in which case: no code
change needed — just note it in a one-line PR comment and stop), or
ports the missing backspace/retype behavior from the wireframe.

STOP CONDITION: Either the retraction engine matches the wireframe's
behavior and is verified, or you've confirmed it already did and there
is nothing to change. Do not expand into other dictation UI polish.
```

## Prompt 3 — Close the status-glyph gap ("needs you" ring)

```
OBJECTIVE: Confirm whether the app has a distinct visual state for "the
agent is waiting on a person to answer a question" versus "the agent is
thinking" versus "the agent is running a tool." If the "needs you" state
reuses the thinking or running glyph, give it its own: a thin ring with
a bright arc spinning continuously around it — visually distinct from a
generic loading spinner because it never completes a "task," it just
waits.

CONTEXT: docs/wireframe.html section 3 ("Glanceable status") proposes
five states — idle (·), thinking (⋯), editing files (± in ember),
running (placeholder glyph, explicitly marked "see below" in the
wireframe — do not treat the running glyph as spec-final), and needs-you
(a spinning ring, CSS in the wireframe under .spin-ring). The
clarifying-question card (confirmed live in the running app via
screenshot already) is the UI that appears WHEN the agent needs you —
this prompt is about the small status glyph/indicator elsewhere in the
chrome (title bar, status bar, run bar) that should signal "waiting on
you" at a glance, before the user even opens the clarifying card.

SCOPE: Find wherever the app currently renders agent-state glyphs
(likely StatusBar.svelte, or the run bar mentioned in Cursor's own PR
#37 summary — "the run bar ticks live duration with an expandable tool
list"). Add or fix the needs-you state there. Do not touch the running
glyph — the wireframe itself says that one's still an open question, not
a spec.

VERIFICATION: npm run check, npm run build, once each.

OUTPUT: A commit/PR adding the distinct needs-you indicator wherever
agent status is shown outside the clarifying card itself.

STOP CONDITION: The needs-you state is visually distinguishable from
thinking/running in the status chrome, verified, committed. Do not
redesign the whole status system.
```

## Prompt 4 — Wire the unused HOLD and MORPH motion primitives

```
OBJECTIVE: frontend/src/lib/styles/motion.css defines two documented
primitives — HOLD (.nil-hold / .nil-hold-fill, press-and-hold to
confirm) and MORPH (.nil-morph / .nil-morph[data-confirmed="true"],
copy-button-becomes-checkmark) — that were added during the motion.css
reconciliation pass but may never have been wired into an actual
component. Find out, and if they're unused, wire them into the places
that need them.

CONTEXT: grep the frontend/src tree for ".nil-hold" and ".nil-morph" —
if the only matches are inside motion.css itself, these are dead CSS.
HOLD belongs on any irreversible/destructive action — deleting an
engagement, rejecting a pending tool approval, clearing context.
docs/wireframe.html has a live HOLD demo under the "hold-confirm"
class if you need the exact fill-timing reference. MORPH belongs on
copy buttons — check frontend/src/lib/ui/CopyAffordance.svelte (added
in the PR #37 rebuild) first, since that may already cover this need
with different markup than .nil-morph expects; don't force MORPH onto
something CopyAffordance.svelte already does well.

SCOPE: Wire HOLD into at minimum one real destructive-action button.
Wire MORPH only if CopyAffordance.svelte does NOT already provide
equivalent copy-confirms behavior — check before adding a second,
competing pattern for the same interaction.

VERIFICATION: npm run check, npm run build, once each.

OUTPUT: A commit/PR wiring HOLD (and MORPH, if genuinely needed) into
real components, or — if you find they're already covered by other
components under different class names — a one-line note in the PR
saying so and no code change.

STOP CONDITION: HOLD is used somewhere real and verified. Do not go
hunting for every possible place these primitives could apply — one
solid usage each is the bar, not exhaustive coverage.
```

## Prompt 5 — Generalize the terminal dock pattern to any long-running tool

```
OBJECTIVE: docs/wireframe.html section 1, callout 07, states the
slide-in-while-running / fold-away-when-idle behavior should apply to
ANY long-running tool call — a test suite, a build, a lint pass — not
be special-cased to the terminal. Confirm the real app's terminal dock
is actually terminal-only, and if so, generalize it.

CONTEXT: Per an earlier audit of this codebase, SettingsTerminal.svelte
shows the terminal is Tauri-only with a browser notice, and the
terminal-slide-in dock described in PR #37's own summary ("Terminal
slides in under the composer as a dock with a real PTY") sounds
architecturally tied to a PTY specifically, which build/lint/test runs
don't need — they need "show live output, fold away on completion," not
a full pseudo-terminal. Read how tool-call results are currently
rendered in the stream (the disclosure-row pattern from
docs/wireframe.html section 1 — "reading X" / "editing Y" rows) before
assuming you need to touch the PTY/terminal code at all: it's possible
the right fix is extending the disclosure-row pattern to show live
streaming output for long tool calls, rather than reusing the terminal
dock's PTY machinery for non-terminal tools.

SCOPE: Identify the smallest change that gives a long-running non-
terminal tool call (e.g. a lint run) the same "occupies temporary space,
folds away when idle" behavior the terminal has. Do not attempt to make
every tool call route through the terminal dock itself if that's not
architecturally sound — use your judgment on disclosure-row vs.
terminal-dock reuse, and say which you picked and why in the PR.

VERIFICATION: npm run check, npm run build, once each. If there's a way
to trigger a real long-running tool call in dev to visually confirm the
fold-away behavior, do it once; don't loop trying to get a "perfect"
screenshot.

STOP CONDITION: One concrete long-running tool type (pick one — lint is
a reasonable default) gets the slide-in/fold-away treatment, verified.
Do not attempt to retrofit every tool type in this pass.
```

## Prompt 6 — Backend-honesty pass (the gaps from the Cursor audit)

```
OBJECTIVE: Close or clearly flag the gaps found when auditing PR #37/#38
against the actual code (not just Cursor's own self-reported summary).
This is a cleanup/honesty prompt, not a new-feature prompt — the goal is
either real functionality or an honest "not implemented" signal, never
UI that implies something works when it doesn't.

CONTEXT (each of these was independently verified against the code,
not assumed):
1. The @-mention/context-chip "attach" flow only appends a literal
   "@path" string to the outgoing message — no file content is read or
   sent, and finn_pentest/ has zero code parsing @-mention tokens. Pick
   ONE: either wire real file-content attachment through to the backend
   call, or change the UI copy/affordance so it doesn't imply the file
   content was sent when it wasn't.
2. `gh` CLI calls in vite-plugin-nil-workspace.ts (the /__nil/git and
   /__nil/github routes) swallow all errors into a silent empty panel
   with zero "gh not found" signal. Add a real error state.
3. Titlebar.svelte uses role="banner" on the window chrome — that's a
   page-header landmark role, not appropriate for a window titlebar.
   Fix or remove it.
4. run.svelte.ts has a stray console.error left in the reject-tool path
   (search for `.catch(console.error)`). Replace with real error
   handling or an intentional, commented no-op — not a debug leftover.

SCOPE: These four are independent — fix all four, but each is a small,
separate concern; don't let fixing #1 turn into a redesign of the
composer. If #1 turns out to require backend changes beyond
frontend/src (i.e. finn_pentest/ needs new code to parse attachments),
that's in scope — finn_pentest/ is not off-limits for this specific
fix, unlike the rest of this rebuild.

VERIFICATION: npm run check, npm run build once each for the frontend
changes; if finn_pentest/ changes, run its existing test suite once
(check pyproject.toml / tests/ for the runner) rather than hand-testing
manually in a loop.

OUTPUT: One PR covering all four (they're small enough not to need
separate PRs) with each fix called out as a separate paragraph in the
description, so a reviewer can evaluate them independently even though
they're one diff.

STOP CONDITION: All four are either fixed or — if #1 turns out to be
large enough to need its own dedicated multi-session effort — explicitly
descoped in the PR description with a one-sentence reason, and the other
three are still fixed in this same PR. Do not let #1 block #2-4.
```

---

## Notes on Fable 5.1 specifically (from Anthropic's own docs + community reports)

- Fable 5.1 has five effort levels (low/medium/high/xhigh/max) — start at
  **high** per Anthropic's own recommendation, drop to medium only for
  purely mechanical prompts.
- Define the **outcome**, not the steps — every prompt above states what
  "done" looks like rather than a numbered implementation sequence, on
  purpose.
- Long-running agent sessions specifically benefit from append-only
  progress tracking and an explicit stop condition — both are in the
  operating contract above, because Cursor's own community forum has
  multiple open bug reports of agents looping endlessly on a review step
  without them.
- Ask for structured output when you want a report back rather than just
  a diff (Prompt 1 does this — a table, not prose).

Sources:
- [Prompting Claude Fable 5.1 — Claude Platform Docs](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-fable-5-1)
- [Prompting best practices — Claude Platform Docs](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices)
- [Claude Fable 5.1 | Cursor Docs](https://cursor.com/docs/models/claude-fable-5-1)
- [Cursor agent enters endless loop without progressing past review step — Cursor Community Forum](https://forum.cursor.com/t/cursor-agent-enters-endless-loop-without-progressing-past-review-step/126815)
- [Agents keep on looping on the first prompt — Cursor Community Forum](https://forum.cursor.com/t/agents-keep-on-looping-on-the-first-prompt/142133)
- [Why agents get stuck in loops and how to prevent it — DEV Community](https://dev.to/gantz/why-agents-get-stuck-in-loops-and-how-to-prevent-it-nob)
- [Best Models for Cursor (September 2026) — modelgrep.com](https://modelgrep.com/best-models-for/cursor)
