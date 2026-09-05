# NIL — Master Redesign Document

> **Superseded 2026-09-04** by `.cursor/rules/00-nil-design-language.mdc` +
> `frontend/src/lib/styles/tokens.css` (color-means-risk law, ten-primitive motion
> system). Kept for historical context; do not use the violet/coral/cream palette or
> `--spring-*` values below for new work.
>
> **Status:** AUTHORITATIVE SOURCE OF TRUTH  
> **Scope:** Full IA + visual redesign of NIL from "AI web app" → native macOS coding workspace  
> **Methodology:** Bookmark-grounded (Twitter bookmarks = design language), anti-slop enforced, Cursor-ready  
> **Stack:** SvelteKit 5 + Tailwind + svelte-motion, Tauri 2 desktop wrapper optional

---

## 1. VERDICT: Current State vs Target

| Current (AI Web App Tell) | Target (Native Mac Tool) |
|---------------------------|-------------------------|
| Chat-first landing / "Ask Finn anything" | **Terminal IS the product** — AI is a pane you summon (Cursor/Linear) |
| Fake terminal chrome ($ prompts, green blocks) | **Real PTY** — blocks wrap actual output (Warp), no costume |
| Rounded user pills + avatar columns | **Quiet dark UI**, structured cards with meta headers (Claude app) |
| Box shadows / generic gradients | **0 box shadows** (chiefkeef.md rule), no generic gradients |
| 44px iPhone hit targets | **28px sidebar rows**, density with calm (Linear) |
| Emoji empty states (⚡🔧) | **Action-oriented empty states** — "Add first target" (Folk) |
| Linear easing on all transitions | **Spring physics only** — bouncy/smooth/window curves |
| Chat bubbles as AI strip | **Structured cards** with meta headers, not user/assistant pills |
| Liquid metal on everything | **ONE shared WebGL context**, titlebar only |
| Generic "stats" / fake metrics | **Only real data**, never fabricated numbers |
| "Get Started", "Learn More" CTAs | **Specific CTAs**: "Open Workstation", "Run Scan", "New Project" |

---

## 2. BOOKMARK DESIGN LANGUAGE (Extracted)

### Core Aesthetic Effects (from your bookmarks)
| Effect | Source | Implementation |
|--------|--------|----------------|
| **Liquid Metal** | @Jakubantalik Border Beam + Thinking Orbs | Single WebGL shader, titlebar only, FBM + fresnel |
| **Border Beam** | @Jakubantalik | Animated border gradient on focused element |
| **Thinking Orbs** | @Jakubantalik | 2-3 orbiting orbs around N monogram during thought |
| **Dithering / Noise** | tripwire.sh/dither-kit, paper-design/neuro-noise | feTurbulence at 3%, Bayer ordered dither |
| **Liquid Glass** | SDF shader (your smart-display) | True refraction + chromatic aberration via SDF |
| **Gooey SVG** | Cuelume / morphicons | feGaussianBlur + feColorMatrix metaballs |
| **Spring Physics** | Framer springs, Amicro | cubic-bezier(0.34,1.56,0.64,1) bouncy, etc. |
| **Magnetic Cursor** | @paper-design magnetic cursor | Tight follow + expand on interactive hover |

### Anti-Slop Rules (from your bookmarks + hallmark)
- **0 box shadows** — use borders + glass only
- **Locked tokens** — never inline hex/rgb, always `var(--token)`
- **Glass is accent** — max 1-2 glass elements, not character
- **Radius is hierarchy** — 6px badges, 8px controls, 12px panels, 10px windows
- **No generic AI icons** — sparkle, star, magic, lightning, diamond, orb, robot forbidden
- **Typography purity** — no italic headers, Inter for humans, JetBrains Mono for machines
- **Specific CTAs only** — "Open Workstation", not "Get Started"

### Verified Packages (from your bookmarks)
| Package | Status | Purpose |
|---------|--------|---------|
| `svelte-motion` | ✅ verified | Framer Motion for Svelte 5 |
| `cuelume` | ✅ verified | 2KB UI sounds (10 effects) |
| `reicon` | ✅ verified | 2700+ SVG icons + MCP |
| `bits-ui` | ✅ verified | Headless primitives (radix alternative) |
| `shadcn-svelte` | ✅ verified | shadcn for Svelte |
| `liquid-glass-svelte` | ❌ phantom | **Drop — doesn't exist** |
| `morphicons` | ⚠️ check | Icon morphing — verify |
| `tasteskill` | ✅ verified | Anti-slop frontend skills |

---

## 3. INFORMATION ARCHITECTURE (Locked First)

### Layout: Terminal-First Workstation

```
┌─ Titlebar (liquid metal) ──────────────────────────────────────────────┐
│ ● ● ●   NIL  ·  project-name  ·  branch  ·  YOLO  ·  Safe             │
├────────────┬──────────────────────────────────────────────┬────────────┤
│  Sidebar   │           Main Workspace                     │  RightSidebar│
│  (files/   │  (Terminal default / Monaco / Preview /     │  (Inspector/ │
│   targets) │   Diff / Chat)                               │   Findings/  │
│  260px     │                                              │   Timeline)  │
│  collapsible│                                              │  280px      │
│            ├──────────────────────────────────────────────┤            │
│            │  Contextual AI Strip (4 states)              │            │
└────────────┴──────────────────────────────────────────────┴────────────┘
│ Dock / Status bar (always visible)                                    │
```

### Key Principles (Non-Negotiable)
1. **Terminal is the soul** — every surface is a lens onto files, commands, evidence
2. **Spaces, not pages** — user moves between objects in one window
3. **Keyboard is the GUI** — if mouse required for primary task, IA is wrong
4. **AI is contextual** — Hidden → Thin → Expanded → Pinned. Never a destination.
5. **Density with calm** — Linear numbers. Inter for humans, JetBrains Mono for machines.
4. **Materials are honest** — Metal = titlebar, Glass = overlaps, Abyss = work surface
5. **One attention object** — pick ONE to pulse (pending approval, live run, critical finding)

---

## 4. BLOCK TERMINAL SPEC (The Hero)

### Default State
- Real `@xterm/xterm` + FitAddon + WebglAddon (already in frontend)
- NIL token theme (abyss/violet/coral/cream)
- 6px line height, 1.45 line-height, JetBrains Mono
- No fake `$` prompts as decoration — real PTY only

### Alternate Views (Center Pane)
| View | Trigger | Purpose |
|------|---------|---------|
| **Terminal** | Default / Cmd+T | Primary work surface |
| **Monaco Editor** | Cmd+E / click file | Code editing with full LSP |
| **Preview** | Cmd+P / port detected | Live preview for web servers |
| **Diff** | Git changes | Side-by-side diff |
| **Chat** | Cmd+J expanded | Agent conversation |

---

## 5. LIQUID METAL RULES

### Where It Lives
- **Titlebar only** — one shared WebGL canvas, `z-index: 0`, `opacity: 0.18`, `mix-blend-mode: screen`
- **Not on cards, not on sidebar, not on AI strip**

### Shader Spec (from your smart-display SDF approach)
- Single-pass fragment shader
- FBM viscosity: `t * 0.07` (slower = heavier, molten feel)
- Color ramp: deep violet valley → lavender wave body → near-white specular hot
- DPR cap: 1.5, `powerPreference: 'low-power'`
- Frozen on `prefers-reduced-motion`

### Panel Sync
```js
// Collect .glass-panel / .panel rects in UV space
// Pass as vec4 u_panels[8] = [cx, cy, halfW, halfH]
// MutationObserver re-collects on view change
```

---

## 6. AI STRIP — 4 EXACT STATES (No Ambiguity)

| State | Height | Content | Trigger |
|-------|--------|---------|---------|
| **Hidden** | 0 | Nothing | Default, no recent agent activity, not pinned |
| **Thin** | 26px | Last status line OR subtle thinking indicator (pulsing dot) | Auto after 8s inactivity from Expanded |
| **Expanded** | 280px | **Structured cards** with meta header (name + model tag), rounded corners. **No chat bubbles.** | Cmd+J, high-signal update, "Explain"/"Draft" action |
| **Pinned** | 280px | Stays Expanded across routes | Cmd+Shift+J or pin icon, survives session (localStorage) |

### Transitions
- Hidden → Expanded: Cmd+J, high-signal, click action
- Expanded → Hidden: Esc (if not pinned) / close
- Expanded → Thin: auto 8s after agent finishes
- Thin → Expanded: click thin bar / Cmd+J
- Any → Pinned: pin icon / Cmd+Shift+J

### Card Structure (Assistant Output)
```svelte
<div class="block assistant-block glass-card">
  <div class="block-head mono">
    <span class="block-tag">nil</span>
    <span class="block-model">{model}</span>
  </div>
  <pre class="block-code mono"><code>{code}</code></pre>
  <div class="block-text mono">{prose}</div>
</div>
```

### User Input Block
```svelte
<div class="block user-block">
  <span class="block-prompt mono">$ {userMsg}</span>
</div>
```

---

## 7. COMPONENT GAP TABLE (Current → Target)

| File | Current Problem | Fix |
|------|-----------------|-----|
| `frontend/src/routes/+layout.svelte` | Chat-first, generic dock, pentest engagements | Terminal-first IA, project-based, NIL brand |
| `frontend/src/lib/components/shell/AiStrip.svelte` | Chat bubbles, vague "collapsed" | 4 exact states, structured cards, no bubbles |
| `frontend/src/lib/components/shell/Sidebar.svelte` | Pentest targets tree | File tree + project targets, 28px rows |
| `frontend/src/lib/components/shell/RightSidebar.svelte` | Findings/timeline (pentest) | Inspector / Findings / Timeline / Git |
| `frontend/src/lib/components/shell/Terminal.svelte` | Basic xterm | Full PTY, NIL theme, FitAddon, WebglAddon |
| `frontend/src/lib/components/shell/Dock.svelte` | Marketing nav (Home/Work/Lab/About) | Project actions, quick commands |
| `frontend/src/lib/components/shell/CommandPalette.svelte` | Basic search | Raycast-level: dynamic commands, shortcuts, grouped |
| `frontend/src/lib/components/shell/StatusBar.svelte` | Generic | Mode pill, sandbox status, YOLO, last run, version |
| `frontend/src/app.css` | Old abyss/green tokens, no glass tiers | NIL tokens (violet/coral/cream), 4 glass tiers, spring curves |
| `frontend/src/lib/components/effects/ThinkingLogo.svelte` | Basic SVG | 4-state animated N monogram + ThinkingOrbs |
| `frontend/src/lib/components/shell/GrainOverlay.svelte` | feTurbulence | Keep, verify 3% opacity |

---

## 8. MISSING COMPONENTS (Need to Build)

| Component | Purpose | Reference |
|-----------|---------|-----------|
| `MonacoEditor.svelte` | Full IDE editor with LSP | Already exists — verify |
| `FileTree.svelte` | Left sidebar file/project tree | Linear density |
| `InspectorPanel.svelte` | Right sidebar: symbol info, deps | Cursor inspector |
| `GitPanel.svelte` | Right sidebar: status, diff, commit | Cursor Source Control |
| `ProjectPicker.svelte` | Empty state: open/create project | Cursor welcome |
| `ApprovalCard.svelte` | Pending tool call: approve/edit/reject | The ONE attention object |
| `ThinkingOrbs.svelte` | Orbiting orbs for thinking state | @Jakubantalik |
| `BorderBeam.svelte` | Animated border on focus | @Jakubantalik |
| `LiquidMetal.svelte` | Shared WebGL titlebar shader | Your smart-display |
| `AmbientDots.svelte` | Sparse particle field background | Portfolio reference |
| `NoiseOverlay.svelte` | feTurbulence 3% on abyss | Already exists |

---

## 9. PHASE ORDER (Do Not Skip)

| Phase | Goal | Files Touched | Verify |
|-------|------|---------------|--------|
| **P0: IA Shell** | New layout: titlebar + 3-pane + AI strip states | `+layout.svelte`, `Sidebar`, `RightSidebar`, `AiStrip`, `Terminal` | `npm run check` + visual: terminal default, AI hidden |
| **P1: Tokens + Glass** | NIL tokens, 4 glass tiers, spring curves, radius hierarchy | `app.css`, all components consume tokens | `npm run check`, reduced-motion test |
| **P2: Titlebar + Liquid Metal** | Shared WebGL liquid metal titlebar | `LiquidMetal.svelte`, titlebar in layout | 60fps on iGPU, DPR 1.5 cap |
| **P3: Command Palette** | Raycast-level Cmd+K with dynamic commands | `CommandPalette.svelte`, keyboard handling | <100ms open, keyboard-only |
| **P4: Structured Findings/Inspector** | Right sidebar tabs with real data | `InspectorPanel`, `GitPanel`, `FileTree` | Real file data, no mock |
| **P5: Thinking Logo System** | 4-state N monogram + orbs + border beam | `ThinkingLogo.svelte`, `ThinkingOrbs.svelte`, `BorderBeam.svelte` | Reduced-motion = static |
| **P6: Polish + Accessibility** | WCAG AA, focus rings, empty states, mobile | All components | Audit checklist |
| **P7: Tauri Desktop** | Native window, vibrancy, global shortcuts | `desktop/`, `tauri.conf.json` | macOS: titleBarStyle overlay |

---

## 10. KEYBOARD MAP (Locked)

| Shortcut | Action |
|----------|--------|
| `Cmd+K` | Command Palette |
| `Cmd+J` | Toggle AI Strip (Hidden ↔ Expanded) |
| `Cmd+Shift+J` | Toggle Pin AI Strip |
| `Cmd+T` | Focus Terminal |
| `Cmd+E` | Focus Editor |
| `Cmd+P` | Quick Open / Preview |
| `Cmd+\\` | Toggle Right Sidebar |
| `Cmd+B` | Toggle Left Sidebar |
| `Cmd+Shift+P` | Project Picker |
| `Esc` | Peel one layer (close palette, collapse AI, dismiss) |
| `Cmd+Enter` | Approve pending tool |
| `Cmd+Shift+Enter` | Reject pending tool |
| `Cmd+Y` | Toggle YOLO |

---

## 11. EMPTY / FIRST-RUN STATE

**Not "Ask NIL anything"**

Show:
- Recent projects (real, from localStorage / workspace)
- "New Project" flow: folder select + template (Node, Python, Rust, Go, Blank)
- Last session summary if exists
- Feels like opening Cursor or Linear on a new project

---

## 12. SETTINGS SHEET (macOS-Style)

- Sheet presentation (not centered modal)
- Left sidebar categories with pill selection
- Global search across all settings
- Grouped sections with rounded headers
- iOS-style switches + styled sliders
- `kbd` chips for shortcuts
- Traffic lights ONLY if `titleBarStyle: overlay` in Tauri macOS

---

*End of MASTER-REDESIGN.md — this is the IA source of truth. All build decisions trace here.*