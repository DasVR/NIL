---
name: project-repo-verification
description: Verify target repo before any build to prevent cross-repo errors.
version: 2.0.0
author: Arriq Aalraee (DasVR), Hermes Agent
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [git, repo, verification, frontend, svelte, nil, cursor]
    related_skills: [frontend-verification-guru, agent-output-verification, pentest-workstation-dev, sveltekit-package-verification]
---

# Project Repo Verification

The user maintains multiple projects across multiple GitHub repos. Building in the wrong repo is one of the fastest ways to frustrate them. This skill enforces verification BEFORE any build action.

## When to Use

- User says "build X", "scaffold Y", "write docs for Z", "create components for..."
- User mentions any project name (leadvine, finn-pentest-harness, NIL, portfolio-v2, etc.).
- About to run any command that modifies files outside the current working directory.
- Before accepting AI agent output as "done."

## The Golden Rule

> **Never assume which repo the user wants. Verify first. Every time.**

## Step 1: ALWAYS Verify Target Repo First

```bash
cd /path/to/project
git remote -v    # Shows which repo this actually is
pwd              # Shows current directory
```

### Expected Repo Targets (Current)

| Project | Expected Path | Expected Remote |
|---|---|---|
| Portfolio v5 | `/home/das/portfolio-v2/` | `DasVR/Das-web` |
| NIL (formerly Finn Pentest Harness) | `/home/das/projects/finn-pentest-harness/` | `DasVR/NIL.git` |
| LeadVine | `/home/das/projects/leadvine/` | Local or remote — verify |
| Discord Voice Bot | `/home/das/projects/discord-voice-robot/` | `DasVR/discord-voice-robot` |
| Finn Godmode API | `/home/das/projects/finn-godmode-api/` | `DasVR/finn-godmode-api` |
| Smart Display | `/home/das/projects/smart-display/` | `DasVR/smart-display` |

**Critical:** NIL's remote was renamed from `DasVR/finn-pentest-harness` to `DasVR/NIL`. If `git remote -v` still points to the old name, update it immediately:

```bash
git remote set-url origin https://github.com/DasVR/NIL.git
```

### Path Rules for NIL

- **SvelteKit frontend:** `/home/das/projects/finn-pentest-harness/web/`
- **NOT `frontend/`:** That directory belongs to the portfolio website and should not be modified for NIL work.

If the user says "work on the pentest harness UI" or "work on NIL frontend," navigate to `web/` inside `finn-pentest-harness/`.

### When Wrong Repo Detected

1. **STOP immediately** — do not write a single file.
2. **Tell the user**: "I see we're in [wrong repo], but this should be in [correct repo]. Let me switch."
3. **Navigate to correct repo**: `cd /path/to/correct/repo`
4. **Verify again**: `git remote -v` + `pwd`
5. **Only then**: begin building

## Step 2: Fetch Latest and Inspect Branches

When returning to a project after time away (especially if Cursor or other agents may have worked on it):

```bash
git fetch origin
git branch -a
git log --all --oneline -15
```

Other agents push feature branches that get merged to master. The local checkout can be many commits behind even though `git status` looks clean. Missing this means rebuilding code that already exists.

## Step 3: Confirm Project Scope

Before scaffolding, confirm:

- Single-repo projects: Portfolio → portfolio-v2 only. NIL → finn-pentest-harness only.
- Multi-repo split projects: verify frontend and backend repo targets separately.
- **Never mix unrelated projects in one repo.** If a document contains features from two different projects, extract each into its correct repo and delete the mixed document.

## Step 4: Audit `package.json` Before Install

AI agents (Cursor Cloud, Codex, Claude Code, Finn) often hallucinate dependency versions. Before running `npm install`:

```bash
# Verify 3–5 key/suspicious packages
npm view @monaco-editor/svelte version    # should fail — use monaco-editor + @monaco-editor/loader
npm view cmdk-svelte versions              # expect only ["0.0.1"]
npm view svelte-sonner@0.5.0 version     # should fail
npm view @xterm/addon-fit version          # expect "0.10.0"
npm view svelte-motion peerDependencies    # for Svelte 5, must include ^5.0.0
npm view @sveltejs/vite-plugin-svelte@3 version  # for SvelteKit 2.x
```

See `frontend-verification-guru` for the full dependency verification procedure.

## Step 5: Handle Agent Output Correctly

Coding agents (especially Cursor Cloud) do NOT write to the host filesystem reliably.

### Cursor Cloud Agent Workflow

- Cloud agents run in remote containers, not on the host.
- They CANNOT push to GitHub without credentials (often `PUSH_BLOCKED`).
- Reliable delivery mechanism: **branch → push → PR → merge**.
- After ANY agent run claiming changes, verify with:

```bash
git status --short
git diff --stat
```

If empty, the work is trapped in the container. Check GitHub for a new branch/PR.

### For Mechanical Wiring Tasks

Prefer writing code directly on the host instead of delegating to a cloud agent. Verify with `npm run build` + `npm run check`.

See `agent-output-verification` skill for full procedure.

## Step 6: Audit Tokens/Env Before Making Changes

Before modifying `.env`, `requirements.txt`, or any credential/config file:

```bash
grep -rh 'sk-' .env .env.example 2>/dev/null | grep -v '^#' | head -20
grep -rh 'OLLAMA\|OPENAI\|DISCORD\|API_KEY' .env .env.example 2>/dev/null | head -20
```

**Rule:** Never overwrite existing tokens. Never add a new provider without checking if one is already configured. The user's existing tokens are the source of truth.

## Pitfalls

- **"I already know which repo this is."** WRONG. Verify every time.
- **Building before confirming.** Verify costs 5 seconds. Fixing costs 5 minutes.
- **Mixing LeadVine + NIL + portfolio docs.** Separate projects, separate repos.
- **Trusting a generated `package.json` without verification.** Always run `npm view` on suspicious packages.
- **Believing agent summaries without `git status`.** Agents claim success when nothing reached the host.
- **Outdated remote URL after repo rename.** Run `git remote -v` and update to `DasVR/NIL.git` if needed.
- **Working in `frontend/` for NIL.** The SvelteKit app is in `web/`.

## Verification Checklist

Before any `write_file`, `patch`, or `git commit`:
- [ ] `pwd` shows expected path.
- [ ] `git remote -v` shows expected remote.
- [ ] `git fetch origin` run and local branch is up to date.
- [ ] All remote branches inspected for agent/Cursor work.
- [ ] Project name in user's message matches current repo name.
- [ ] No unrelated project names are in the files being written.
- [ ] Existing tokens/env audited before adding new ones.
- [ ] `package.json` versions verified before `npm install`.
- [ ] If agent claimed changes: `git status --short` + `git diff --stat` reviewed.
- [ ] If unsure: ask the user to confirm target repo.
