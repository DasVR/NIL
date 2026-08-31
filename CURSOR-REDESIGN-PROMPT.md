# NIL — Cursor Redesign Build Prompt

> **Usage:** Drop this entire file into Cursor (Cmd+K → "Build from this prompt") or give to any AI coding agent. Self-contained, no external context needed.

---

## OBJECTIVE

Redesign NIL from "AI web app" → **native macOS coding workspace**. Terminal-first, density with calm, spring physics, locked tokens, zero AI slop.

**Repo:** `/home/das/projects/finn-pentest-harness/` (remote: DasVR/NIL)
**Stack:** SvelteKit 5 + Tailwind + svelte-motion, frontend/ directory
**Design Source:** MASTER-REDESIGN.md (this repo root) — follow it exactly.

---

## ANTI-SLOP RULES (Enforced)

- **0 box shadows** — borders + glass only
- **Locked tokens** — never inline hex/rgb, always `var(--token)`
- **Glass is accent** — max 2 glass elements visible at once
- **Radius hierarchy** — 6px badges, 8px controls, 12px panels, 10px windows
- **No generic AI icons** — sparkle, star, magic, lightning, diamond, orb, robot forbidden
- **Typography purity** — no italic headers, Inter (humans), JetBrains Mono (machines)
- **Specific CTAs only** — "Open Workspace", "New Project", "Run Command"
- **One attention object** — pending approval OR live run OR critical finding (pick ONE)
- **Linear easing forbidden** — spring curves only (see tokens)
- **Mobile verified** — 320/375/414/768px, no horizontal overflow

---

## FILES TO MODIFY (In Order)

### 1. `frontend/src/app.css` — Design Tokens
Replace entire file with NIL tokens from DESIGN-TOKENS.md:
- Colors: abyss/violet/lavender/coral/cream (NO green)
- 4 glass tiers with edge refraction
- 4 spring curves
- Density tokens (28px rows, 26px statusbar, 40px titlebar)
- Typography scale (Inter + JetBrains Mono)
- Reduced-motion fallbacks

### 2. `frontend/src/routes/+layout.svelte` — IA Shell
**Replace completely.** New structure:
```svelte
<svelte:head>
  <title>NIL — {projectName || 'Welcome'}</title>
</svelte:head>

<div class="app-shell">
  <LiquidMetal />              <!-- Shared WebGL titlebar background -->
  <Titlebar />                 <!-- Engagement · branch · YOLO · Safe -->
  
  <div class="workbench">
    <Sidebar />                <!-- File tree + project targets, 28px rows -->
    <main class="workspace">
      <WorkspaceCenter />      <!-- Terminal / Editor / Preview / Diff -->
      <AiStrip />              <!-- 4 states: hidden/thin/expanded/pinned -->
    </main>
    <RightSidebar />           <!-- Inspector / Findings / Timeline / Git -->
  </div>
  
  <CommandPalette />           <!-- Cmd+K, Raycast-level -->
  <Dock />                     <!-- Project actions, quick commands -->
  <StatusBar />                <!-- Mode · sandbox · last run · YOLO · version -->
  <GrainOverlay />             <!-- feTurbulence 3% on abyss -->
</div>

<svelte:window onkeydown={handleGlobalKeys} />
```

**Keyboard handlers (global):**
- Cmd+K → CommandPalette
- Cmd+J → AiStrip toggle (Hidden ↔ Expanded)
- Cmd+Shift+J → AiStrip pin toggle
- Cmd+T / Cmd+E / Cmd+P / Cmd+\ / Cmd+B → focus panes
- Esc → peel one layer

### 3. `frontend/src/lib/components/shell/AiStrip.svelte` — 4 Exact States
**Replace completely.** Four states, no ambiguity:

```ts
type AiState = 'hidden' | 'thin' | 'expanded' | 'pinned';
let state = $state<AiState>('hidden');
let height = $derived(
  state === 'hidden' ? 0 :
  state === 'thin' ? 26 :
  280
);
```

**State transitions:**
- Hidden → Expanded: Cmd+J, high-signal event, click action
- Expanded → Hidden: Esc (if not pinned), close button
- Expanded → Thin: auto after 8s inactivity
- Thin → Expanded: click thin bar, Cmd+J
- Any → Pinned: pin icon, Cmd+Shift+J (persists in localStorage)

**Content:**
- **Thin**: last status line + pulsing dot when agent working
- **Expanded**: structured cards (not chat bubbles)
  - User block: `<span class="block-prompt mono">$ {msg}</span>`
  - Assistant block: meta header (name + model), code block, prose
  - Tool call card: approve / edit / reject buttons (THE attention object)

### 4. `frontend/src/lib/components/shell/Sidebar.svelte` — File Tree + Targets
- 260px → collapsible to 48px (icons only)
- 28px row height, 6-8px vertical padding, 1.3 line-height
- Section headers: 11px uppercase, 0.08em tracking, 28px row
- File tree: real FS data (not mock), mono for paths, Inter for labels
- Targets section: hostname/IP/port in mono, status pills
- No emoji, no generic icons — relevant SVGs only

### 5. `frontend/src/lib/components/shell/RightSidebar.svelte` — 4 Tabs
Tabs: **Inspector** | **Findings** | **Timeline** | **Git**
- Inspector: symbol info, dependencies, quick actions
- Findings: severity left border (critical=red, high=orange), mono details
- Timeline: compact log, tool runs, agent decisions
- Git: status, staged/unstaged, diff, commit message, push

### 6. `frontend/src/lib/components/shell/Terminal.svelte` — Real PTY
- `@xterm/xterm` + FitAddon + WebglAddon (already in deps)
- NIL theme: abyss bg, violet/coral/cream accents
- 6px line height, 1.45 line-height, JetBrains Mono
- WebSocket to backend `/v1/ws/terminal/{project}`

### 7. `frontend/src/lib/components/shell/CommandPalette.svelte` — Raycast-Level
- Cmd+K opens, <100ms
- Dynamic commands from live data: files, symbols, tools, git, AI actions
- Grouped with icons, shortcut hints, pill selection
- Keyboard-only navigation (arrows, enter, esc)

### 8. `frontend/src/lib/components/shell/Dock.svelte` — Project Actions
- Bottom bar, hidden <1024px
- 28px SVG icons, hover labels, spring scale 1.1x
- Items: New File, New Terminal, Run Command, Toggle AI, Settings, Project Picker
- Active dot indicator

### 9. `frontend/src/lib/components/shell/StatusBar.svelte` — Always Visible
- Height 26px, 11px mono values + 10px sans labels
- Left: connection dot, mode pill (HUNT/CHAT/CODE/REPORT), target
- Center: last tool run (`npm run dev` + exit code), sandbox status
- Right: YOLO toggle (exact state), version, settings gear
- Background: `--glass-3`, border-top 1px

### 10. `frontend/src/lib/components/effects/ThinkingLogo.svelte` — 4-State N Monogram
Wraps `ThinkingOrbs.svelte` + N monogram SVG:
- **Idle**: static N, violet on abyss
- **Thinking**: notches breathe + 2-3 orbs orbit (coral + lavender)
- **Streaming**: orbs converge into N, glow + BorderBeam sweeps edge
- **Done**: N snaps to cream, soft pulse
- `prefers-reduced-motion` = static N only

### 11. `frontend/src/lib/components/shell/LiquidMetal.svelte` — Shared WebGL
- Single canvas, `z-index: 0`, `opacity: 0.18`, `mix-blend-mode: screen`
- FBM viscosity `t * 0.07`, color ramp violet→lavender→white specular
- DPR cap 1.5, `powerPreference: 'low-power'`
- MutationObserver syncs `.glass-panel` rects as `u_panels[8]`
- Frozen on `prefers-reduced-motion`

### 12. `frontend/src/lib/components/shell/ApprovalCard.svelte` — The ONE Attention Object
- Appears in AiStrip Expanded when tool needs approval
- Shows: tool name, args preview, rationale, risk level
- Actions: **Approve** (Cmd+Enter), **Edit**, **Reject** (Cmd+Shift+Enter)
- Pulses coral (not green) — only pulsing element in UI
- Auto-focuses Approve button

### 13. `frontend/src/lib/components/shell/ProjectPicker.svelte` — Empty State
- Recent projects (real from localStorage/workspace)
- "New Project": folder select + template (Node/Python/Rust/Go/Blank)
- Feels like Cursor/Linear welcome

---

## NEW FILES TO CREATE

| File | Purpose |
|------|---------|
| `frontend/src/lib/components/shell/ThinkingOrbs.svelte` | Orbiting orbs for thinking state |
| `frontend/src/lib/components/shell/BorderBeam.svelte` | Animated border gradient on focus |
| `frontend/src/lib/components/shell/FileTree.svelte` | Left sidebar file tree |
| `frontend/src/lib/components/shell/InspectorPanel.svelte` | Right sidebar inspector |
| `frontend/src/lib/components/shell/GitPanel.svelte` | Right sidebar git |
| `frontend/src/lib/components/shell/WorkspaceCenter.svelte` | Center pane router (terminal/editor/preview/diff) |
| `frontend/src/lib/components/shell/MonacoEditor.svelte` | Full IDE editor (verify existing) |
| `frontend/src/lib/components/shell/Titlebar.svelte` | Liquid metal titlebar with engagement context |

---

## VERIFICATION COMMANDS (Run After Each Phase)

```bash
cd /home/das/projects/finn-pentest-harness/frontend

# 1. Syntax + types
npm run check

# 2. Build
npm run build

# 3. Dev server (manual visual check)
npm run dev
# Open http://localhost:5173
# Verify: terminal default, AI hidden, no horizontal overflow at 320px

# 4. Reduced motion test
# Firefox: about:config → ui.prefersReducedMotion = 1
# Chrome: DevTools → Rendering → Emulate prefers-reduced-motion
# Verify: ALL animations instant/ease, liquid metal frozen, orbs static

# 5. Focus ring audit
# Tab through entire UI — every interactive element has visible focus ring

# 6. Mobile viewport test
# DevTools device toolbar: 320px, 375px, 414px, 768px
# No horizontal scroll, tap targets ≥44px (but 28px rows in sidebar OK)

# 7. Contrast audit
# DevTools → Elements → select text → check computed contrast ≥4.5:1
```

---

## PHASE GATES (Do Not Proceed Until Pass)

| Phase | Gate |
|-------|------|
| P0 IA Shell | `npm run check` passes, terminal default view, AI strip hidden, 3-pane layout renders |
| P1 Tokens | All components consume tokens (no inline hex), glass tiers applied correctly, spring curves used |
| P2 Liquid Metal | 60fps on iGPU, DPR 1.5 cap works, reduced-motion freezes it, only on titlebar |
| P3 Command Palette | <100ms open, keyboard-only, dynamic commands from real data |
| P4 Right Sidebar | Real file data in Inspector/Git, no mock data |
| P5 Thinking Logo | 4 states work, reduced-motion = static, orbs orbit correctly |
| P6 Polish | WCAG AA pass, focus rings everywhere, empty states action-oriented, mobile clean |

---

## BACKEND CONTRACT (What Frontend Expects)

| Endpoint | Purpose |
|----------|---------|
| `GET /v1/projects` | List projects (name, path, lastOpened) |
| `POST /v1/projects` | Create project (path, template) |
| `GET /v1/projects/{id}/files` | File tree for sidebar |
| `GET /v1/projects/{id}/git/status` | Git status for GitPanel |
| `GET /v1/projects/{id}/git/diff` | Diff for GitPanel |
| `WS /v1/ws/terminal/{id}` | PTY terminal |
| `WS /v1/ws/agent/{id}` | Agent stream (plan → tool → result) |
| `POST /v1/agent/{id}/approve` | Approve pending tool |
| `POST /v1/agent/{id}/reject` | Reject pending tool |
| `POST /v1/agent/{id}/edit` | Edit + approve pending tool |

---

## GOTCHAS FROM PREVIOUS ATTEMPTS

- **Concurrent agent corruption** — before any write, `git status` to detect sibling agent changes. If another agent left broken syntax, read file, diagnose, repair first.
- **AI strip "terminal-style blocks"** — user means structured cards with subtle meta headers (name + model), rounded corners, clean typography. NOT literal terminal chrome ($ prompts, bordered panes, green tint).
- **Traffic lights** — ONLY for true macOS Tauri with `titleBarStyle: overlay`. Web/Tauri cross-platform = clean titlebar.
- **Parseltongue breaks code** — disable obfuscation for coding mode in godmode pipeline.
- **npm phantom packages** — verify `npm view <pkg> version` before recommending. Known fakes: `@monaco-editor/svelte`, `cmdk-svelte@^2.0.0`, `svelte-sonner@^0.5.0`, `@xterm/addon-*` stable, `svelte-motion@^0.4`.

---

## SUCCESS CRITERIA

When done, the workspace should feel like:
- Opening **Cursor** on a new project (terminal default, AI summoned)
- Density of **Linear** (28px rows, mono for data, Inter for prose)
- Motion of **Raycast** (spring curves, purposeful only)
- Materials of **macOS** (liquid metal titlebar, glass overlaps, abyss surface)
- Zero "AI web app" tells — no chat bubbles, no fake terminal, no emoji, no generic CTAs

---

**Start with P0: IA Shell. Read MASTER-REDESIGN.md first. Then modify `+layout.svelte` and the 4 shell components. Run verification. Report results.**