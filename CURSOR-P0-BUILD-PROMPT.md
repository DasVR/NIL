# NIL P0 Build Prompt — IA Shell (Cursor Agent)

## Context
You are building **NIL**, an open-source AI coding agent workspace (Tauri 2 + SvelteKit 5). This is **P0: IA Shell** — the complete workspace layout with titlebar, sidebar, main workspace, right sidebar, AI strip, and status bar.

**Repo:** `/home/das/projects/finn-pentest-harness` (branch `master`)
**Frontend:** `frontend/` (SvelteKit 5 + TypeScript)
**Skills:** Read all `.cursor/skills/*.md` and `.cursor/rules/*.mdc` — they are your source of truth.

---

## Mandatory Pre-Build Reading

Read these files FIRST — they contain locked tokens, rules, and component specs:

```
.cursor/skills/nil-design-system/SKILL.md       → ALL tokens (primitive/semantic/component)
.cursor/skills/nil-anti-slop/SKILL.md           → forbidden patterns, verification checklist
.cursor/skills/nil-components/SKILL.md          → component primitives (Button, Input, Card, etc.)
.cursor/skills/nil-motion/SKILL.md              → 4 spring curves, reduced-motion
.cursor/skills/nil-typography/SKILL.md          → Inter + JetBrains Mono rules
.cursor/skills/nil-terminal-ui/SKILL.md         → terminal-first IA, AI strip 4 states
.cursor/skills/nil-reference-workflow/SKILL.md  → reference-first methodology
.cursor/rules/nil-workspace.mdc                 → build rules, mandatory checks
.cursor/rules/nil-design-system.mdc             → auto-applied token/anti-slop rules
```

---

## References to Inspect (Pengsonal Method)

Before building, inspect these for patterns to adapt:

| Reference | What to Steal |
|-----------|---------------|
| `raycast.com` | Command palette footer hints, keyboard-first, sidebar density |
| `linear.app` | 28px rows, structured cards, abyss palette, spring feel |
| `warp.dev` | Block terminal output, agent blocks, cost metrics inline |
| `jakubantalik.com` | Border Beam, Thinking Orbs, Liquid Metal shader |
| `21st.dev` | Glass cards, shaders, command palette (translate React→Svelte) |

---

## P0 Scope — IA Shell (exact components)

### 1. Titlebar (40px, Liquid Metal)
- **Component:** `Titlebar.svelte`
- **Features:** Liquid metal WebGL canvas (single shared context), window controls (traffic lights on macOS via `titleBarStyle: overlay`, custom on Windows/Linux), ThinkingLogo top-right
- **Tokens:** `--titlebar-h: 40px`, liquid metal shader
- **Reduced motion:** Static gradient

### 2. Sidebar (280px, Targets Tree)
- **Component:** `Sidebar.svelte`
- **Features:** 28px rows (`--row-h`), spring expand/collapse, target tree with findings badges, context menu (right-click), "New Target" button
- **Tokens:** `--sidebar-w: 280px`, `--row-h: 28px`, glass-2 cards
- **Keyboard:** Arrow keys navigate, Enter expands, Cmd+N new target

### 3. Main Workspace (Flex-1)
- **Component:** `MainWorkspace.svelte`
- **Features:** Tabbed interface (Terminal / Editor / Preview / Diff / Chat), real xterm.js PTY for Terminal tab, monaco-editor for Editor tab
- **Tokens:** Full height minus titlebar/statusbar/AI strip

### 4. Right Sidebar / Inspector (320px)
- **Component:** `RightSidebar.svelte`
- **Features:** Tabs: Findings | Timeline | Evidence | Context, 28px rows, finding cards with severity borders, click → detail
- **Tokens:** `--rightbar-w: 320px`, glass-2 panels

### 5. AI Strip (Bottom, Cmd+J — 4 States)
- **Component:** `AIStrip.svelte`
- **States (exactly 4):**
  - `collapsed` — 0px, hidden
  - `composer` — 120px, auto-grow input, mode chips (hunt/chat/code/report), drag-drop files
  - `running` — 200px, live tool blocks streaming, cost metrics, cancel button
  - `review` — 300px, diff blocks, approval buttons, finding cards
- **Tokens:** `--ai-strip-h: 200px` (running), spring-smooth transitions
- **Keyboard:** Cmd+J cycles states, Esc collapses

### 6. Status Bar (26px)
- **Component:** `StatusBar.svelte`
- **Features:** Git branch, last command duration, token cost, connection status, clock
- **Tokens:** `--statusbar-h: 26px`, mono font, `--text-secondary`

### 7. Command Palette (Cmd+K)
- **Component:** `CommandPalette.svelte` (cmdk-svelte)
- **Features:** Raycast-level search, footer hints, sections, shortcuts shown
- **Tokens:** glass-1, spring-window

### 8. Settings Sheet (Cmd+,)
- **Component:** `SettingsSheet.svelte`
- **Features:** Left sidebar categories, cross-category search, grouped control rows with section headers, glass-2, spring-window
- **Categories:** General, Appearance, Editor, Terminal, AI, Plugins, Shortcuts, Advanced

---

## File Structure to Create

```
frontend/src/
├── app.css                    # UPDATE: add all P0 tokens
├── routes/
│   ├── +layout.svelte         # REWRITE: complete shell
│   ├── +page.svelte           # Empty state (New Engagement)
│   └── app/
│       ├── +layout.svelte     # Auth-protected layout
│       └── engagement/
│           └── [id]/
│               ├── +page.svelte
│               ├── terminal/+page.svelte
│               ├── findings/+page.svelte
│               ├── timeline/+page.svelte
│               └── settings/+page.svelte
├── lib/
│   ├── components/
│   │   ├── Titlebar.svelte
│   │   ├── Sidebar.svelte
│   │   ├── MainWorkspace.svelte
│   │   ├── RightSidebar.svelte
│   │   ├── AIStrip.svelte
│   │   ├── StatusBar.svelte
│   │   ├── CommandPalette.svelte
│   │   ├── SettingsSheet.svelte
│   │   ├── ThinkingLogo.svelte
│   │   ├── BorderBeam.svelte
│   │   ├── ThinkingOrbs.svelte
│   │   ├── LiquidMetal.svelte
│   │   └── ui/                # primitives (Button, Input, Card, etc.)
│   ├── stores/
│   │   ├── appState.ts        # sidebar, rightbar, aiStrip, yolo, theme
│   │   ├── terminalStore.ts
│   │   ├── engagementStore.ts
│   │   ├── paletteStore.ts
│   │   └── keymap.ts
│   ├── pty.ts
│   └── tauri-events.ts
├── styles/
│   ├── glass.css
│   ├── motion.css
│   └── density.css
└── static/fonts/
    ├── InterVariable.woff2
    └── JetBrainsMono-Variable.woff2
```

---

## Exact Tokens to Add to app.css

```css
/* Add to :root in frontend/src/app.css */

/* Density */
--row-h: 28px;
--statusbar-h: 26px;
--titlebar-h: 40px;
--sidebar-w: 280px;
--rightbar-w: 320px;
--ai-strip-h: 200px;

/* Radius */
--radius-badge: 6px;
--radius-control: 8px;
--radius-panel: 12px;
--radius-window: 10px;

/* Z-Index */
--z-base: 0;
--z-dropdown: 100;
--z-sticky: 200;
--z-modal: 300;
--z-toast: 400;
--z-tooltip: 500;
--z-cursor: 600;
```

---

## Verification Gates (MUST PASS)

```bash
cd frontend && npm run check && npm run build
```

**Both must pass.** No exceptions.

### Anti-Slop Audit
```bash
# 1. No inline hex
grep -r "#[0-9a-fA-F]\{3,8\}" frontend/src --include="*.svelte" --include="*.css" | grep -v "app.css"
# 2. No box-shadow
grep -r "box-shadow" frontend/src --include="*.svelte" --include="*.css" | grep -v "app.css"
# 3. No linear easing
grep -r "ease\|linear\|cubic-bezier" frontend/src --include="*.svelte" --include="*.css" | grep -v "spring\|app.css"
# 4. No emoji
grep -rP "[\x{1F300}-\x{1FAFF}]" frontend/src --include="*.svelte" --include="*.ts"
# 5. No chat bubbles
grep -r "chat-bubble\|avatar\|message.*bubble" frontend/src --include="*.svelte"
```

All should return **NOTHING**.

### Reduced Motion Test
1. Enable "Reduce Motion" in OS
2. Reload — all animations stop instantly
3. Pending blocks still readable

### Mobile Test
Test at 320px, 375px, 414px, 768px — no horizontal overflow, text ≥16px.

---

## Deliverables

1. **Complete `frontend/src/app.css`** with all tokens
2. **Complete shell layout** in `routes/+layout.svelte`
3. **All 8 shell components** in `lib/components/`
4. **All 5 stores** in `lib/stores/`
5. **PTY + Tauri event wiring** in `lib/pty.ts` + `lib/tauri-events.ts`
6. **Font files** in `static/fonts/`
7. **Build passes** — `npm run check && npm run build`

---

## Cursor Agent Instructions

```
You are building P0 IA Shell for NIL workspace.

STRICT RULES:
1. Use ONLY tokens from app.css — no inline values
2. bits-ui for ALL primitives — no raw HTML buttons/inputs
3. Spring curves ONLY — no linear/ease
4. Reduced-motion mandatory on EVERY animation
4. Glass = max 2 visible, edge refraction via ::before
5. Inter (human) / JetBrains Mono (machine) — never mix
6. 28px rows, 6px v / 8px h padding
7. No chat bubbles, no fake terminal chrome, no emoji
8. One attention object max (BorderBeam on pending approval)

WORKFLOW:
1. Read all .cursor/skills/*.md first
2. Inspect reference sites for patterns
3. Build components in order: Titlebar → Sidebar → Main → RightSidebar → AIStrip → StatusBar → Palette → Settings
4. Wire stores and keyboard shortcuts
5. Run verification gates
6. If any gate fails, FIX before continuing

MODEL: Use composer-2.5 (free, reliable) or grok-4.5 if available.
THINKING: Ultra. Fast mode: OFF.
```

---

## Parallel Delegation (if using multiple agents)

| Agent | Task |
|-------|------|
| Agent 1 | Titlebar + LiquidMetal + ThinkingLogo + BorderBeam + ThinkingOrbs |
| Agent 2 | Sidebar + RightSidebar + stores (appState, engagement) |
| Agent 3 | MainWorkspace + PTY + Terminal tab + xterm.js setup |
| Agent 4 | AIStrip (4 states) + CommandPalette + SettingsSheet |
| Agent 5 | StatusBar + keymap + tauri-events + font setup |
| Agent 6 | app.css tokens + glass.css + motion.css + density.css + verification |

---

## Success Criteria

✅ App launches, shows complete shell
✅ Titlebar renders (liquid metal + ThinkingLogo)
✅ Sidebar toggles, 28px rows, spring physics
✅ Main workspace tabs work (Terminal shows real PTY)
✅ Right sidebar tabs switch, findings render
✅ AI strip cycles 4 states via Cmd+J
✅ Status bar shows mono data
✅ Cmd+K opens palette, Cmd+, opens settings
✅ `npm run check && npm run build` PASS
✅ All anti-slop audits return nothing
✅ Reduced motion works
✅ Mobile responsive at 320px

---

**When done:** Commit with message `feat(p0): complete IA shell — titlebar, sidebar, workspace, rightbar, AI strip, statusbar, palette, settings`

**Push to origin/master** so the repo stays current.