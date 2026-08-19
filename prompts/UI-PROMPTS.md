# OpenCode + Cursor UI Prompts — Finn Pentest Harness

Drop these into opencode (`opencode`) or Cursor (Cmd+Shift+P → open agent / composer).
Each is a complete, self-contained build prompt. Reference the DESIGN.md for tokens.

---

## 1. FULL UI OVERHAUL (run first)
```
You are redesigning the SvelteKit frontend at /home/das/projects/finn-pentest-harness/web to feel like a native macOS app (Cursor IDE / Linear / Raycast quality). NOT a web app in a trench coat.

Read DESIGN.md in the repo root FIRST for the full design system. Then read web/src/app.css for the existing CSS tokens.

Ground rules:
- Use the existing design tokens (--abyss #050507, --green #00d992, JetBrains Mono + Inter, glass tiers, spring curves). Do NOT invent new colors.
- macOS feel = density, spring physics, subtle glass, keyboard-first. No fake terminal chrome ($ prompts, green-tinted blocks). NO traffic lights — this is a web app.
- Honor prefers-reduced-motion everywhere.
- 60fps, Safari-compatible, mobile responsive (breakpoint 1024px).

Components to polish in order:
1. Sidebar.svelte — tighten density (6-8px padding), active state, targets tree
2. TerminalPane.svelte — clean chrome, no fake terminal decorations
3. AiStrip.svelte — 4 states: collapsed / focused / streaming / pinned. Clean structured cards, subtle meta header (Finn name + model tag), rounded corners, NO terminal blocks
4. EmptyState.svelte — like opening Cursor on a new project. Engagement templates + recent engagements + "New Engagement" flow, NOT "Ask Finn anything"
5. Dock.svelte — spring magnification, badges, tooltips
6. RightSidebar.svelte — findings/timeline density
7. StatusBar.svelte — 26px, status + safety indicator

Verify with: cd web && npm run build && npm run check
Fix all errors before finishing.
```

---

## 2. FIX SPECIFIC BROKEN / UGLY AREAS
```
In /home/das/projects/finn-pentest-harness/web, find and fix these UI problems:
[PASTE SPECIFIC ISSUES HERE — e.g. "sidebar active state doesn't highlight", "terminal chrome has fake decorations", "AI strip looks like a terminal block"]
Keep the existing design tokens. Match the macOS/Linear/Cursor aesthetic. Build and check after. npm run build && npm run check must pass.
```

---

## 3. ADD A NEW FEATURE
```
In /home/das/projects/finn-pentest-harness/web, add a new feature: [DESCRIBE IT]
- Match the existing component architecture (Svelte 5 runes, $lib/components)
- Use the design tokens from app.css
- macOS-native feel, spring physics, keyboard-first, reduced-motion support
- Wire it into stores.svelte.ts if it needs shared state
- npm run build && npm run check must pass
- Add the keyboard shortcut in src/routes/app/+layout.svelte onKey()
```

---

## 4. SET UP OPENCODE (once)
```
opencode            # from /home/das/projects/finn-pentest-harness
# configure provider: pick a free model (opencode bundles free models)
# then run: opencode --model <model>
```

---

## Quick reference
- Dev server: `cd web && npm run dev` (or port 5199)
- Build: `cd web && npm run build`
- Type check: `cd web && npm run check`
- Repo: `/home/das/projects/finn-pentest-harness`
- Push: commit + push to origin/master (DasVR/finn-pentest-harness)
