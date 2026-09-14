# Finish PRs #42, #43, #44 — review passed, close them out

Model: **Claude Fable 5.1**, effort **high**. Single session. This is a
finishing prompt, not new design work — everything here has already been
reviewed by a human and independently re-verified by a second Claude
session (not just your own self-report). Follow the operating contract
in `docs/CURSOR_PROMPTS.md` (one verification pass, no self-re-review,
explicit stop condition) — it applies here too.

## Context

You opened three PRs against `master`, each answering one prompt from
`docs/CURSOR_PROMPTS.md`:

- **#42** — `docs/WIREFRAME_PARITY.md` audit table (docs-only)
- **#43** — the "needs you" spinning-ring status glyph (`motion.css`
  primitive #19, wired into `StatusBar.svelte` and `AgentRunBar.svelte`)
- **#44** — backend-honesty pass: real `@`-mention file-content
  attachment through `readProjectFile`, `gh`-missing vs. `gh`-failed
  error states in `SourceControl`/`GitHubPanel`, `role="banner"`
  removed from `Titlebar`, the `console.error` leak in `run.svelte.ts`'s
  reject path replaced with an intentional, commented no-op.

All three were independently re-verified outside your own session: a
second Claude session checked out each branch fresh, ran `npm run
check` and `npm run build` itself (not trusting the self-reported
"Verification" section in your PR bodies, since this repo's CI only
runs GitGuardian — no test/build pipeline actually gates these PRs),
and confirmed 0 errors/warnings and successful builds on all three. The
`@`-mention fix was also traced end-to-end: `readProjectFile` →
`/__nil/file` → `safePath()`'s traversal guard, confirmed no new
path-traversal surface was introduced by reading arbitrary attached
file content into the turn payload.

Review verdict per PR:

- **#42**: correct and, notably, proof the anti-loop operating contract
  worked — you found Prompts 2, 4, and 5 were already satisfied by
  earlier work and correctly reported "no code change" instead of
  re-implementing something that already existed. No changes requested.
- **#43**: correct. Ring stays greyscale/ink (not ember) per the "color
  means risk" law, reduced-motion handled, no scope creep into the
  still-undecided running glyph. No changes requested.
- **#44**: correct, and the strongest of the three — the per-file/
  per-turn size caps and truncation marker on the `@`-mention fix, and
  the "not installed" vs. "installed but failed" distinction on the
  `gh` error states, are both real engineering, not just closing the
  ticket. One thing noted, not a blocker: the reject-path fix now
  silently swallows a real backend failure (with a comment explaining
  why) rather than surfacing it anywhere. Acceptable as shipped — do
  not change it in this prompt, it's called out for awareness only,
  not as a review comment to address.

## Objective

1. Mark all three PRs "Ready for review" (they're currently drafts —
   that was presumably deliberate on your end, but the review is done,
   so flip them).
2. Merge them into `master` in this order: **#42 first** (docs-only,
   zero file overlap with the other two, trivially safe), then **#43**
   and **#44** in either order — confirmed no file overlap between
   those two either (#43 touches `StatusBar.svelte`, `AgentRunBar.svelte`,
   `motion.css`; #44 touches `run.svelte.ts`, `GitHubPanel.svelte`,
   `SourceControl.svelte`, `StreamComposer.svelte`, `Titlebar.svelte`,
   `project.svelte.ts`, `vite-plugin-nil-workspace.ts`). Use a squash
   merge to match the existing history's convention on this repo.
3. After all three are merged, do **one** fresh `npm run check` +
   `npm run build` on `master`'s new tip to confirm the merges
   themselves didn't introduce anything the individual branches
   couldn't have shown — this is the ONE verification pass for this
   prompt, not per-PR. If it fails, fix and re-run once; if still
   failing, stop and report rather than iterating further.

## Scope

Only these three PRs and the post-merge verification. Do not start any
new prompt from `docs/CURSOR_PROMPTS.md` in this session, even if you
notice one is quick. That includes the one new gap #42 itself
surfaced (hovering a tool row doesn't highlight the matching diff
line, wireframe callout 06) — name it in your final report as a
candidate for a future prompt, do not fix it here.

## Verification

Exactly as described in step 3 above — one pass, one retry on failure,
then stop.

## Output

A short final report (not a new doc file) listing: which PRs merged,
the resulting `master` SHA, and the post-merge check/build result.

## Stop condition

All three PRs are merged, `master` builds clean, and you've reported
back. End the session there — do not proceed into any follow-up prompt
unprompted.
