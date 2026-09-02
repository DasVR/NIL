---
name: frontend-verification-guru
description: Verify npm installs, builds, and tests before claiming done.
version: 1.0.0
author: Arriq Aalraee (DasVR), Hermes Agent
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [frontend, svelte, npm, testing, build, qa, verification]
    related_skills: [sveltekit-package-verification, project-repo-verification, svelte-5-runes-migration, nextjs-static-sites, dark-native-web-ui]
---

# Frontend Verification Guru

Never say "the build works" until a real command proves it. This skill makes me stop hallucinating frontend success and actually run the checks.

## When to Use

- Before `npm install` on any Node/SvelteKit/Next.js/Vite project.
- After an AI agent (Cursor, Codex, Claude Code, Finn) modifies `package.json`, frontend code, or config.
- User says "it doesn't work," "build fails," "errors on page," or "test it."
- Before pushing any frontend change to GitHub.
- Before declaring a UI feature "done."

## When NOT to Use

- For backend-only Python/FastAPI changes (use `python -m py_compile` instead).
- For pure design/spacing opinions without a build target.

## Prerequisites

- Node.js installed (verify with `node -v && npm -v`).
- Project uses `package.json` with `scripts` defined.
- Git repo verified via `project-repo-verification` skill.

## The Golden Rule

> **If I did not run at least `npm install` + `npm run build` + `npm run check` (or equivalent), I do not claim the frontend works.**

## Step 1: Verify Target Repo and Path

Before touching anything:

```bash
cd /path/to/project
git remote -v
pwd
```

Critical path rules (from user memory):
- NIL/SvelteKit app lives at `/home/das/projects/finn-pentest-harness/web/` (NOT `frontend/`, which is portfolio website).
- Portfolio v5 lives at `/home/das/portfolio-v2/`.
- LeadVine lives at `/home/das/projects/leadvine/`.
- Never mix project code or design tokens between repos.

## Step 2: Verify `package.json` Dependency Versions

AI agents hallucinate npm versions constantly. Before running `npm install`:

1. Read `package.json`.
2. Identify 3–5 suspicious or critical packages.
3. Verify each with `npm view <pkg>@<version>`.

Known hallucinations (update this list as we find more):

| Fake Package / Version | Why It Fails | Real Replacement |
|---|---|---|
| `@monaco-editor/svelte` | Does not exist. | `monaco-editor` + `@monaco-editor/loader` |
| `cmdk-svelte@^2.0.0` | Only `0.0.1` exists; Svelte 3 only. | Build custom command palette |
| `svelte-sonner@^0.5.0` | Does not exist. | Build custom toast or `svelte-5-snackbar` |
| `@xterm/addon-*@stable` | All beta-only; stable is `^0.10.0`. | Verify `npm view @xterm/addon-fit version` |
| `svelte-motion@^0.4.0` | Only supports Svelte 3. | `svelte-motion@^0.12.2` for Svelte 5 |
| `@sveltejs/vite-plugin-svelte@latest` with SvelteKit 2.x | v7 is ESM-only/incompatible. | Pin `@sveltejs/vite-plugin-svelte@3` |

Quick bulk check script:

```bash
for pkg in $(jq -r '.dependencies | keys[]' package.json); do
  ver=$(jq -r ".dependencies[\"$pkg\"]" package.json)
  echo -n "$pkg@$ver: "
  npm view "$pkg@$ver" version 2>/dev/null || echo "NOT FOUND"
done
```

## Step 3: Clean Install Strategy

Do not blindly run `npm install --force`. Follow this escalation:

1. **Delete lock/node_modules only if needed:**
   ```bash
   rm -rf node_modules package-lock.json
   ```
2. **Try clean install:**
   ```bash
   npm install
   ```
3. **If peer-dep conflicts:**
   ```bash
   npm install --legacy-peer-deps
   ```
4. **Only as last resort:**
   ```bash
   npm install --force
   ```

After install, immediately run:

```bash
npm run build
npm run check
```

If either fails, fix the underlying issue before declaring success.

## Step 4: Run the Verification Stack

For SvelteKit/Vite projects, the minimum verification set is:

```bash
npm run build
npm run check
```

If available, also run:

```bash
npm run lint
npm run test
npm run test:unit
npm run test:integration
npx playwright test
```

Run each command separately so failures are isolated and clear.

## Step 5: Fix Common Failures

### TypeScript / Svelte Check Errors

Read the first error carefully. Common causes:
- Missing type definitions: `npm install -D @types/<pkg>`
- Svelte 5 runes migration needed (see `svelte-5-runes-migration` skill).
- Imports from wrong path (check `src/lib/`, `src/routes/` aliases).
- Props not typed with `$props()`.

### Build Errors

- Vite/rollup plugin issues → check plugin versions.
- `Cannot find module` → verify package exists in `node_modules`.
- Static adapter missing `prerender` config → add fallback route config.

### Test Failures

- Is test data stale? Regenerate fixtures.
- Is a component mocking a browser API? Use `jsdom` or `vitest` environment config.
- Is Playwright failing due to missing browsers? Run `npx playwright install`.

## Step 6: Verify Runtime in Browser (When Applicable)

For UI-heavy changes, start the dev server and use `browser_exec` or `computer_use`:

```bash
npm run dev
```

Then check:
- No console errors on load.
- Interactions work (buttons, navigation, modals).
- Mobile width does not break layout.
- `prefers-reduced-motion` respected.

## Step 7: Git Status and Diff Review

Before committing:

```bash
git status --short
git diff --stat
git diff package.json  # especially important after AI dependency changes
```

Reject any change that:
- Adds `.venv/` or `node_modules/`.
- Commits a broken `package-lock.json`.
- Includes unrelated project files.

## Verification Checklist

Before claiming frontend success:

- [ ] Correct repo and path confirmed.
- [ ] `package.json` dependency versions verified (3–5 key packages).
- [ ] `npm install` completed without `--force` unless justified.
- [ ] `npm run build` passes.
- [ ] `npm run check` passes.
- [ ] `npm run lint` passes if script exists.
- [ ] Unit/integration tests pass if script exists.
- [ ] Playwright/smoke tests pass if configured.
- [ ] Browser runtime verified for UI changes.
- [ ] `git status` and `git diff` reviewed.
- [ ] Changes committed and pushed.

## Pitfalls

- **Saying "build passes" without running it.** The user will test it and catch the lie. Always run commands.
- **Using `--force` as first fix.** It hides real conflicts and creates fragile lock files.
- **Trusting AI-generated `package.json` blindly.** Verify versions first, every time.
- **Mixing `frontend/` and `web/` paths for NIL.** The SvelteKit app is in `web/`, not `frontend/`.
- **Skipping `npm run check`.** SvelteKit builds can succeed while type/runes checks fail.
- **Not checking browser console.** A page that renders but throws on interaction is not done.
