# Wave 2 — the rest of the application, front to back

Model: **Claude Fable 5.1**, effort **high**. Same rules as
`docs/CURSOR_PROMPTS.md` — read that file's operating contract first if
you haven't; it isn't repeated in full here, but it still applies to
every prompt below: one verification pass, no self-re-review, one
prompt per session, explicit stop conditions.

Wave 1 (`docs/CURSOR_PROMPTS.md`, prompts 1–6) covered the wireframe
audit and the first round of gap-closing. This wave has two kinds of
work: **closing what wave 1's own audit found and left open**, and
**backend/architecture honesty items that go beyond what the wireframe
shows at all** — things the wireframe can't tell you because it's a
static mockup, like whether a picked model actually reaches the
provider call.

Since wave 1, a separate session (not Cursor) independently closed two
of the items wave 1's audit flagged as open — SHAKE (invalid-input
rejection) and CHECK-DRAW (task-complete checkmark), both in
`motion.css` as primitives #20/#21, wired into `StreamComposer.svelte`
and `ToolBlock.svelte`. Don't re-do these; Prompt 7 below asks you to
refresh the audit table to reflect it, not re-implement it.

---

## Prompt 7 — Refresh `docs/WIREFRAME_PARITY.md`

```
OBJECTIVE: Update the existing docs/WIREFRAME_PARITY.md audit table:
mark the two rows for "invalid-input shake" and "task-complete draw-in
check" as yes/implemented (motion.css primitives SHAKE #20 and
CHECK-DRAW #21, in StreamComposer.svelte and ToolBlock.svelte
respectively — verify these actually exist in the current tree before
marking them, don't take this prompt's word for it). Leave every other
row as-is unless you find it's ALSO changed since the audit.

CONTEXT: docs/WIREFRAME_PARITY.md was produced by an earlier prompt as
a read-only audit. Two rows are now stale.

SCOPE: Only docs/WIREFRAME_PARITY.md. Do not re-run the full audit from
scratch — diff against what's there, update only what's changed.

VERIFICATION: N/A, docs-only.

OUTPUT: One commit updating the two rows (and any others you find
genuinely stale — name them in the commit message if so).

STOP CONDITION: The table reflects current reality. Do not start
implementing anything else in this session.
```

## Prompt 8 — Hover a tool row, highlight the matching diff line

```
OBJECTIVE: docs/wireframe.html section 1, callout 06: hovering a tool
row that touched a file should highlight the specific line that
changed in the diff shown below it (the wireframe does this with a
.focus class toggled on mouseenter/mouseleave of the disclosure row's
header). This was flagged in the parity audit as the one genuine gap
in section 1 and explicitly deferred, not fixed.

CONTEXT: The real app's equivalent is ToolBlock.svelte — it renders a
disclosure header (the clickable summary row) and, when open, an
InlineDiff.svelte below it. Read InlineDiff.svelte's current props/
markup first: you need a way to mark one specific line as focused. The
wireframe's version highlights the single most-significant added line
(usually the first non-context line); pick the same heuristic unless
InlineDiff already has a better signal (e.g. if diffs carry hunk
metadata pointing at a specific line, use that instead of guessing).

SCOPE: ToolBlock.svelte and InlineDiff.svelte only. This is a hover
affordance on an already-open disclosure row — do not change whether
hovering OPENS the row (it shouldn't; only click does, per the
existing pattern and the wireframe's own callout 06 wording "hover the
row, watch the change" describes a row that's already open).

VERIFICATION: npm run check, npm run build, once each.

OUTPUT: A commit/PR wiring the hover → highlight behavior.

STOP CONDITION: Hovering an open tool row's header highlights the
correct line in its diff, verified. Do not expand into auto-scrolling
a live editor view to that line — the wireframe mentions that as a
future idea ("in the real thing this is also where it'd scroll a live
code view"), not a requirement for this prompt.
```

## Prompt 9 — Decide and implement the real status-glyph set

```
OBJECTIVE: docs/wireframe.html section 3 proposes five status glyphs —
idle, thinking, editing-files, running, needs-you. needs-you is done
(PR #43, if merged by the time you read this — check). The parity
audit marked idle/thinking/editing-files as "partial": the app has
SOME signal for these states but not as a unified, glanceable glyph
system the way the wireframe frames it — idle is a connection dot,
thinking is prose text ("Almost done thinking…"), editing-files has no
distinct signal at all. The wireframe itself marks the "running" glyph
as an explicit open question (a placeholder, not spec) — leave that
one alone, everything else here is spec-final in the wireframe.

CONTEXT: Read AgentRunBar.svelte, AgentStatus.svelte, and
StatusBar.svelte together first — there may be three different places
partially implementing pieces of this, which is itself likely part of
why it reads as fragmented rather than a system. Decide where a
unified glyph actually belongs (probably AgentRunBar, since that's
where RING/needs-you already landed) rather than scattering one more
partial signal into a fourth location.

SCOPE: Implement idle (·), thinking (⋯ or similar), and editing-files
(±, ember-colored per the wireframe — this is a sanctioned, deliberate
exception to "color means risk," not a violation of it, since the
wireframe explicitly calls it out as "Ember, always"). Do NOT touch
the running glyph — it's genuinely undecided, and inventing an answer
here would be scope creep past what's actually specified.

VERIFICATION: npm run check, npm run build, once each.

OUTPUT: A commit/PR. If you conclude the existing text-based signals
(the "Almost done thinking…" prose, etc.) should stay ALONGSIDE the
new glyphs rather than being replaced, say so and why in the PR —
that's a legitimate design call, not something to silently decide
without flagging it.

STOP CONDITION: idle/thinking/editing-files have a real, distinct,
glanceable glyph, verified. The running glyph remains whatever it
already is — do not touch it.
```

## Prompt 10 — Token streaming: wire it for real, or remove the dead path

```
OBJECTIVE: An earlier audit found agentRun.applyEvent() (chat.delta /
chat.token handling in run.svelte.ts) is dead code — there is no
EventSource/WebSocket/SSE transport anywhere in frontend/src that could
ever deliver those events, so "ash" (the streaming-text reveal) only
ever plays on a completed HTTP response, not real token-by-token
streaming. This prompt asks you to make a call, not guess at one:
either wire a real streaming transport from finn_pentest/'s /v1/chat
endpoint, or remove the dead-code path and be honest in the UI/docs
that replies are not actually streamed.

CONTEXT: Read finn_pentest/api/app.py and wherever /v1/chat is
implemented first — does the provider call (finn_pentest/providers/)
support streaming responses from the underlying LLM API at all? If the
provider layer already streams internally and only the HTTP boundary
to the frontend is blocking, wiring SSE is a contained, worthwhile fix
(FastAPI supports StreamingResponse natively). If the provider layer
itself is synchronous end-to-end, real streaming is a much bigger
change than this prompt's scope — in that case, the right move is
removing the dead applyEvent()/chat.delta handling in run.svelte.ts
(or leaving it with a clear comment that it's aspirational/unused)
rather than leaving a "streaming" code path that has never once run.

SCOPE: This is the one prompt in this wave allowed to touch
finn_pentest/ beyond what's already been touched (PR #44's @-mention
work) IF you determine real streaming is contained enough to be worth
doing now. If it's not, scope shrinks to frontend/src/lib/agent/
run.svelte.ts only (removing or clearly marking the dead path).

VERIFICATION: For a streaming implementation: manually confirm tokens
arrive incrementally in the browser network tab against a real
provider call, once. For a removal: npm run check + npm run build,
once each, plus the finn_pentest/ test suite if you touched anything
there.

OUTPUT: Either a real streaming implementation, or a small, honest
cleanup — both are acceptable outcomes of this prompt. State which one
you chose and why in the PR description; this is a judgment call this
prompt deliberately hands to you rather than prescribing.

STOP CONDITION: One of the two outcomes above is shipped and verified.
Do not leave it half-wired (e.g., backend streams but frontend still
doesn't consume it, or vice versa).
```

## Prompt 11 — Wire model/effort selection into the real provider call

```
OBJECTIVE: appState/workspace already carry `selectedModel`/`effort`
(or `modelId`/`effort` — check current naming, it may have changed)
and the composer UI lets a user pick a model, but per the api.ts
comment "the harness uses the enabled provider until it reads this" —
picking Opus 5 vs. Sonnet 5 vs. Haiku 4.5 in the UI does not change
which model finn_pentest/ actually calls. Close that gap for real.

CONTEXT: Read finn_pentest/providers/ and wherever run_turn (or its
equivalent) resolves which provider/model to call. The ChatRequest
body already includes model/effort (confirmed in an earlier audit of
run.svelte.ts and api.ts) — the gap is entirely on the finn_pentest/
side: the request carries the field, nothing reads it.

SCOPE: finn_pentest/ changes to actually honor the model field on
incoming chat requests, routing to the corresponding provider/model.
If the three UI-offered options (Opus 5/Sonnet 5/Haiku 4.5) don't map
cleanly onto whatever providers finn_pentest/ actually has configured
today, don't invent fake provider wiring — instead, make the UI's
options match what's real (this may mean changing MODEL_OPTIONS in the
frontend to reflect actually-available models rather than aspirational
ones), and say so in the PR.

VERIFICATION: finn_pentest/'s own test suite, once. If you can
exercise a real chat request end-to-end with two different models and
confirm the response metadata reflects which model actually ran,
do that once as well.

OUTPUT: A commit/PR — either full wiring, or a documented, honest
narrowing of the UI to only offer models that are real.

STOP CONDITION: Selecting a model in the composer provably changes
which provider/model handles the request, OR the UI has been made
honest about only offering what's real. No in-between state where the
picker still offers options that silently do nothing.
```

## Prompt 12 — Production bridge for Source Control / GitHub / MCP panels

```
OBJECTIVE: SourceControl.svelte, GitHubPanel.svelte, and McpPanel.svelte
all depend on frontend/vite-plugin-nil-workspace.ts — a dev-only Vite
middleware. In any production or static build (not just Tauri, ANY
deployed web build), these panels silently go empty with no bridge
behind them at all. Give them a real backend, served by finn_pentest/'s
actual API, not Vite.

CONTEXT: vite-plugin-nil-workspace.ts's routes (/__nil/files, /__nil/
file, /__nil/git, /__nil/github, /__nil/mcp) are the full spec for what
these panels need — read it end to end, it's ~430 lines and already
handles path-traversal safety (safePath()), gh-availability detection,
and MCP config file discovery. The job here is porting that surface
into a real finn_pentest/api/ route module (FastAPI), not redesigning
it — the frontend-side contract (what shape of JSON project.svelte.ts
expects back) should stay the same so SourceControl/GitHubPanel/
McpPanel need minimal or no changes.

SCOPE: New finn_pentest/api/ routes mirroring the Vite plugin's
surface; project.svelte.ts pointed at the new routes (behind a runtime
check — prefer the real backend when available, fall back to the Vite
dev bridge only in local dev if that's simpler than a flag). Keep the
path-traversal guard's security properties identical or stronger — do
not regress safePath()'s protection in the port.

VERIFICATION: finn_pentest/'s test suite once. Manually confirm all
three panels (Source Control, GitHub, MCP) render real data against a
production-style build (npm run build + npm run preview, not npm run
dev) at least once — this is the actual bug being fixed, so confirming
it in dev mode alone would not prove anything.

OUTPUT: A commit/PR. This is the largest prompt in this wave — if it
turns out to be too large for one session, it's fine to scope down to
ONE of the three panels (Source Control is the most valuable) and say
so explicitly, rather than attempting all three and leaving all of
them half-done.

STOP CONDITION: At least Source Control works against a production
build, verified with npm run preview, not just npm run dev. If GitHub
and MCP didn't fit in this session, name them as follow-up work in the
PR rather than leaving silent gaps.
```

## Prompt 13 — Test coverage for the pure-logic and security-relevant code

```
OBJECTIVE: Zero tests exist anywhere under frontend/. Add unit tests
for the highest-value untested code: logic that's either
security-relevant or has a documented invariant that's currently only
protected by a code comment.

CONTEXT — four specific targets, in priority order:
1. vite-plugin-nil-workspace.ts's safePath() — a path-traversal guard
   with no test coverage at all. Highest priority: this is the one
   function in the codebase where a regression is a real vulnerability,
   not a visual bug.
2. frontend/src/lib/motion/monogramGrid.ts's monogramCells() — the
   mirror-symmetry invariant (mark(grid-1-x, y)) is currently only
   protected by a code comment referencing a bug that was hit twice
   before being fixed this way. A test asserting left/right symmetry
   would catch a regression a diff review might miss.
3. frontend/src/lib/motion/dictation.ts's diff/retraction logic — the
   common-prefix-then-retype algorithm has clear input/output pairs
   that are easy to assert on without needing a live mic.
4. StreamComposer.svelte's composeTurn() attachment truncation
   (ATTACH_MAX_PER_FILE/ATTACH_MAX_TOTAL caps, from PR #44 if merged)
   — the budget math (per-file cap, running total, truncation marker)
   is exactly the kind of off-by-one-prone logic worth pinning down.

SCOPE: Pick a test runner already available or trivially addable
(check package.json for vitest/@testing-library/svelte first — this
repo may already have test infra partially set up from create-svelte
scaffolding). Cover items 1 and 2 at minimum; 3 and 4 if time allows
within the one-session scope this wave's prompts otherwise hold to.

VERIFICATION: The new tests themselves passing is the verification —
run them once, fix once on failure, then stop per the standing
contract.

OUTPUT: A commit/PR adding the test file(s) plus whatever minimal
test-runner config was missing.

STOP CONDITION: safePath() and monogramCells() have real test
coverage, verified passing. Items 3/4 are a bonus, not a requirement —
don't let chasing all four turn this into an open-ended session.
```

## Prompt 14 — Accessibility pass across the surfaces not yet spot-checked

```
OBJECTIVE: Accessibility work so far has been reactive (fixing
role="banner" on the titlebar when it was flagged) rather than a
systematic pass. Audit the surfaces that haven't been explicitly
checked yet and fix what you find.

CONTEXT: Already known-good (do not re-audit): TargetTree.svelte
(documented roving-tabindex tree pattern), the sidebar resize handle
(documented window-splitter pattern), Titlebar.svelte (role fixed).
NOT yet explicitly audited: CommandPalette.svelte (does it trap focus
correctly, announce results count to screen readers, handle Escape
consistently?), SettingsSheet.svelte and its sub-panels (are toggle
rows real accessible switches, or divs with a class?), the model
picker popover in StreamComposer.svelte (proper role="menu"/
"menuitem" semantics, or just styled divs?), FindingCard.svelte/
FindingRow.svelte (is severity conveyed by color alone anywhere, which
would fail for colorblind users — the codebase's own "Law 1: color
means risk" section implies severity needs a second channel, verify
it has one, like a text label or icon, everywhere color appears).

SCOPE: Read-and-fix, not read-and-report — this isn't an audit-only
prompt like #7. Fix what you find in each of the four surfaces named
above. If a fix would be genuinely large (e.g. CommandPalette needs a
real focus trap and doesn't have one), do the fix — this is exactly
the kind of gap this prompt exists to close, not to defer again.

VERIFICATION: npm run check, npm run build, once each. If browser
devtools accessibility tree inspection is available to you, spot-check
at least the command palette and model picker once against it.

OUTPUT: A commit/PR covering all four surfaces, each called out
separately in the PR description even though they ship as one diff
(same pattern as PR #44).

STOP CONDITION: All four named surfaces have been checked and any real
issues found are fixed. Do not expand into surfaces not named above —
if you notice something elsewhere, name it in the PR for a future
prompt rather than fixing it here.
```

---

## Explicitly NOT in scope for this wave

- **Mobile** — docs/wireframe.html section 9 says this is deliberately
  shelved pending reference material the user hasn't provided yet. Do
  not start mobile work from any prompt in this wave.
- **The running-status glyph** — the wireframe itself marks this as an
  open question, not a spec. Prompt 9 explicitly excludes it.
- **A full finn_pentest/ rewrite or refactor** — prompts 10-12 touch
  finn_pentest/ only where a specific frontend-facing gap requires it,
  not as an invitation to refactor the backend generally.
