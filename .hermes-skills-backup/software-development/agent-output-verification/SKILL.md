---
name: agent-output-verification
description: Verify what coding agents actually changed before claiming success.
version: 1.0.0
author: Arriq Aalraee (DasVR), Hermes Agent
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [agents, cursor, codex, claude-code, verification, git, diff]
    related_skills: [project-repo-verification, frontend-verification-guru, cursor-agent-bridge, claude-code, codex, opencode]
---

# Agent Output Verification

Coding agents (Cursor Cloud, Codex, Claude Code, OpenCode) routinely claim they modified files when they didn't. This skill forces me to verify their actual output against the host filesystem before telling the user anything is done.

## When to Use

- Immediately after any coding agent / subagent / bridge claims to have made changes.
- User says "did it actually do it?" or "check if the agent worked."
- Before continuing from a delegated task.
- Before committing agent-produced code.
- After any Cursor Cloud agent run, no matter how detailed its summary looks.

## When NOT to Use

- For my own direct file edits where I already used `write_file`/`patch` and saw the result.
- For tasks where the agent explicitly returned only text/analysis and no code.

## The Golden Rule

> **A coding agent's summary is NOT proof. `git status` + `git diff --stat` + syntax checks are proof.**

## Step 1: Check Git Status and Diff

After ANY agent run claiming file changes, run:

```bash
cd /path/to/project
git status --short
git diff --stat
git diff --name-only
```

If the output is empty or doesn't match the claimed files, the agent did NOT write to the host filesystem.

## Step 2: Inspect the Actual Diff

For files that did change:

```bash
git diff path/to/file
```

Look for:
- Missing braces, dangling tokens, half-written functions (common after multi-agent file corruption).
- Duplicate code blocks from repeated edits.
- Imports for packages that don't exist.
- Changes to the WRONG file.

## Step 3: Run Syntax / Build Checks

Per language:

```bash
# Python
python3 -m py_compile file.py
find . -name "*.py" -exec python3 -m py_compile {} \;

# JavaScript / TypeScript
npx tsc --noEmit
node --check file.js

# SvelteKit
npm run build
npm run check
npm run lint

# FastAPI / Python backend
python -m pytest

# Docker / Compose
docker compose config
```

Do not skip this. Multi-agent corruption often shows up only at syntax-check time.

## Step 4: Cross-Check the Agent's `files` Array

If the agent response includes a `files` array, compare it to `git status`:

| Agent `files` | Git status | Verdict |
|---|---|---|
| Lists files | Matches | Possible real changes — still verify contents |
| Lists files | Empty | Agent ran in remote/container; files never reached host |
| Empty | Empty | Agent did nothing or could not deliver |
| Empty | Has changes | Host side-effect from another source; investigate |

## Step 5: Handle the Cursor Cloud Specifics

Cursor Cloud agents:
- Run in remote containers, NOT on the host filesystem.
- Cannot reliably push to GitHub without credentials (often `PUSH_BLOCKED`).
- Their reliable delivery mechanism is **branch → push → PR → merge**.
- Even then, `result.files` is often empty despite a detailed summary.

What to do:
1. Run `git status --short` after the agent summary.
2. If empty, check GitHub for a new branch/PR from the agent.
3. If no PR exists, the work is trapped in the container and must be redone by hand or via a new dispatch.
4. For mechanical wiring tasks, prefer writing code directly on the host instead of delegating.

## Step 6: Verify Branch and Remote State

Before trusting agent work:

```bash
git branch -a
git log --all --oneline -10
git remote -v
```

Check that:
- You are on the correct branch.
- The agent didn't create commits in the wrong repo.
- Remote URL matches the intended project (e.g., `DasVR/NIL.git`, not old `DasVR/finn-pentest-harness`).

## Step 7: Ask the User Only When Necessary

If after verification the agent produced nothing, report clearly:

> "The agent claimed X files changed, but `git status` is empty. No work reached the host filesystem. Need me to redo it directly?"

Do not guess or makeup what the agent did. Report the evidence.

## Verification Checklist

After every agent run that claims code changes:

- [ ] `git status --short` inspected.
- [ ] `git diff --stat` inspected.
- [ ] Agent `files` array compared to git output.
- [ ] Changed files reviewed for corruption/duplication.
- [ ] Syntax checks run for each affected language.
- [ ] Build/check/lint commands run for frontend projects.
- [ ] Branch and remote state verified.
- [ ] If nothing changed on host: report clearly, propose next step.

## Pitfalls

- **Believing the agent's natural-language summary.** Agents generate confident summaries for work that never happened.
- **Skipping verification because the task was "simple."** The simplest tasks are the ones agents most often claim and fail to deliver.
- **Committing unverified agent output.** Always verify before `git add -A`.
- **Assuming Cursor Cloud writes to the host.** It does not. Verify branches/PRs on GitHub.
- **Not checking for syntax errors after another agent touched the file.** Run `node --check` or `python3 -m py_compile` immediately.

## Common Agent Failure Signatures

| Symptom | Likely Cause | Fix |
|---|---|---|
| `files` array empty, summary detailed | Agent ran remotely; no host writes | Redo on host or check GitHub PR |
| `git status` empty after agent | Same as above, or agent crashed silently | Verify GitHub branches |
| Syntax error in file agent touched | Multi-agent corruption / partial write | Read full file, restore boundaries |
| Missing imports after agent run | Agent hallucinated package names | Verify with `npm view` or `pip search` |
| Wrong repo modified | Agent/container path confusion | Revert, redo in correct repo |
