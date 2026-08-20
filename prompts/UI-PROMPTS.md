# OpenCode + Cursor UI Prompts — Finn Pentest Harness

Drop these into opencode (`opencode`) or Cursor (Cmd+Shift+P → open agent / composer).
Each is a complete, self-contained build prompt.

The v3 workstation shell already shipped in `/app` (Spaces, block terminal, inspector,
command palette, overlay titlebar). These prompts polish it — they do not rebuild the
information architecture.

- `UX_REDESIGN.md` (repo root) is the living IA spec. Read it first.
- `DESIGN.md` is v2 token history. Use it for color/spring lineage only, never for layout.
- `cursor-research/TWITTER-BOOKMARKS-FULL-RESEARCH.md` is the polish backlog (materials,
  sounds, density fixes). Where it contradicts `UX_REDESIGN.md`, the v3 spec wins.
- The `.cursor/skills/finn-ui` skill has the token table, density rules, and kill list.

Anti-slop rule — paste into every UI prompt:

> Apply anti-slop rules: no generic gradients, no decorative drop-shadows on idle cards or
> buttons, no fake metrics, locked design tokens (no new hex), WCAG AA contrast on abyss and
> glass, keyboard-first, no emoji. Honor both `prefers-reduced-motion` and the in-app
> `html.reduce-motion` override.

---

## 1. UI POLISH PASS (run first)
```
You are polishing the SvelteKit workstation at web/ to feel like a native macOS tool
(Cursor / Linear / Raycast / Warp quality). The v3 shell already exists — do NOT rebuild
the layout, add routes, or reintroduce a chat-home.

Read UX_REDESIGN.md for the IA, then web/src/app.css for the tokens, then the
.cursor/skills/finn-ui skill for density and the kill list.

Ground rules:
- Use existing design tokens (--abyss, --green, glass tiers, spring curves). No new colors.
- Terminal is the default surface. Finn is a summoned column, never the homepage.
- Glass only where content refracts through it. Sidebars stay on solid --abyss-2.
- Liquid metal is the single titlebar instance. Never add a second WebGL context.
- Honor prefers-reduced-motion AND html.reduce-motion everywhere.
- Workstation controls are 24-32px. No 44px buttons in /app.
[paste anti-slop rule]

Polish in order:
1. AiStrip.svelte — structured Finn cards (meta header "Finn · model", markdown/code,
   command-proposal blocks reusing Approve/Reject). No chat bubbles, no "You" pills.
2. TerminalBlocks.svelte — border beam on the pending block only; static border on reduced
   motion.
3. Sidebar.svelte — 6-8px row density, active-target green edge, mono hosts/ports.
4. StatusBar.svelte — 26px, last-block aware.

Verify: cd web && npm run check && npm run build
```

---

## 2. FIX SPECIFIC BROKEN / UGLY AREAS
```
In web/, fix these UI problems:
[PASTE SPECIFIC ISSUES HERE]
Keep the existing design tokens and the v3 IA (UX_REDESIGN.md). Match the
macOS/Linear/Cursor/Warp aesthetic. [paste anti-slop rule]
npm run check && npm run build must pass after.
```

---

## 3. ADD A NEW FEATURE
```
In web/, add: [DESCRIBE IT]
- Match the component architecture (Svelte 5 runes, $lib/components).
- Use tokens from app.css; follow the .cursor/skills/finn-ui density and material rules.
- macOS-native feel, spring physics, keyboard-first, reduced-motion support.
- Wire shared state into stores.svelte.ts.
- Add any shortcut in BOTH web/src/lib/keymap.ts and web/src/routes/app/+layout.svelte
  onKey(), plus SHORTCUT_HELP.
- [paste anti-slop rule]
- npm run check && npm run build must pass.
```

---

## 4. SET UP OPENCODE (once)
```
opencode            # from the repo root
# configure provider: pick a free model (opencode bundles free models)
# then run: opencode --model <model>
```

---

## Quick reference
- Dev server: `cd web && npm run dev`
- Build: `cd web && npm run build`
- Type check: `cd web && npm run check`
- Push: commit + push to origin/master (DasVR/finn-pentest-harness)
