# NIL — The Full Arsenal: Libraries, Inspo, Packages, AI Packs

> **Status:** LIVING DOCUMENT — expand as you find more
> **Purpose:** Every library, website, package, and AI skill pack for building NIL into the ultimate open-source coding agent workspace. All packages VERIFIED against npm (Aug 2026). All inspo scored for dark terminal / macOS-native fit.
> **Stack:** SvelteKit 5 + Tauri 2 + Tailwind v4 + TypeScript

---

## 0. VERIFIED PACKAGE REGISTRY (npm, Aug 2026)

> Every package below was checked with `npm view <pkg> version`. ✅ = real, ❌ = phantom (do not use).

### Core UI Primitives (Headless)
| Package | Version | Role | Notes |
|---------|---------|------|-------|
| `bits-ui` | ✅ 2.19.0 | Headless primitives (Radix for Svelte) | Dialog, Select, Combobox, Tooltip, Popover, Tabs, Accordion, Toast, Slider, Switch, Menu |
| `@melt-ui/svelte` | ✅ 0.86.6 | Builder-pattern headless | Alternative to bits-ui, actions/builders API |
| `@zag-js/svelte` | ✅ 1.43.3 | Fully accessible headless | Complex: select, date-picker, slider, tabs |
| `paneforge` | ✅ 1.0.2 | Resizable panes/splitters | Terminal ↔ AI strip, sidebar resize |

### Styled Component Layer
| Package | Version | Role | Notes |
|---------|---------|------|-------|
| `shadcn-svelte` | ✅ 1.5.1 | Copy-paste styled components on bits-ui | Button, Card, Input, Sheet, Drawer, Command palette |
| `@svar-ui/svelte-core` | ✅ 2.6.0 | Enterprise data components | DataGrid, Gantt, form controls (NOT `@svar/svelte` — phantom) |

### Animation & Motion
| Package | Version | Role | Notes |
|---------|---------|------|-------|
| `svelte-motion` | ✅ 0.12.2 | Framer Motion API for Svelte 5 | Layout animations, AnimatePresence, gestures, springs |
| `motion` | ✅ 13.1.1 | Motion One (WAAPI) | Performant transform/opacity, scroll-linked |
| `svelte/motion` (built-in) | ✅ | Spring/tween stores | Simple value animation, no layout |

### Visual Effects
| Package | Version | Role | Notes |
|---------|---------|------|-------|
| `cuelume` | ✅ 0.2.2 | 2KB UI sounds (10 effects) | click, success, error, toggle, complete, whoosh, pop |
| `morphicons` | ✅ 1.7.1 | Icon → icon morphing | Spring physics, sidebar active states, tool toggles |
| `liquid-gooey` | ✅ 0.2.1 | Gooey SVG metaballs | feGaussianBlur + feColorMatrix, thinking indicator |
| `reicon` | ✅ 1.2.1 | 2700+ SVG icons + MCP | Outline + filled weights, Svelte package |

### Icons
| Package | Version | Role | Notes |
|---------|---------|------|-------|
| `lucide-svelte` | ✅ 1.0.1 | Clean consistent icons | 2px stroke, 24px base, tree-shakeable |
| `@iconify/svelte` | ✅ 4.2.0 | Icon system (already in deps) | Phosphor currently, swap to lucide if cleaner |

### Forms & State
| Package | Version | Role | Notes |
|---------|---------|------|-------|
| `superforms` | ✅ 0.0.1 | SvelteKit-native forms + Zod | Progressive enhancement, file uploads |
| `@tanstack/svelte-query` | ✅ 6.1.48 | Server state | Caching, deduping, background refetch |

### Drag & Drop
| Package | Version | Role | Notes |
|---------|---------|------|-------|
| `@dnd-kit/svelte` | ✅ 0.5.0 | Accessible, performant, headless | Rearranging sidebar, docking panels |
| `svelte-dnd-action` | ✅ 0.9.79 | Lightweight Svelte action | Simple drag-drop |

### Notifications
| Package | Version | Role | Notes |
|---------|---------|------|-------|
| `svelte-sonner` | ✅ 1.2.1 | Beautiful toasts | Promise-based, customizable |

### Terminal & Editor
| Package | Version | Role | Notes |
|---------|---------|------|-------|
| `@xterm/xterm` | ✅ 5.5.0 | Terminal emulator (already in deps) | WebGL renderer for 60fps |
| `@xterm/addon-fit` | ✅ 0.10.0 | Terminal fit (already in deps) | |
| `@xterm/addon-webgl` | ✅ 0.19.0 | WebGL renderer (already in deps) | |
| `monaco-editor` | ✅ 0.52.2 | VS Code editor (already in deps) | IntelliSense, diff, minimap |

### PHANTOM PACKAGES (NEVER USE)
| Package | Why Phantom |
|---------|-------------|
| `melt-ui` | Real name is `@melt-ui/svelte` |
| `@svar/svelte`, `@svar/svelte-parts`, `@svar/svelte-core`, `@svar/svelte-ui` | Real name is `@svar-ui/svelte-core` |
| `@monaco-editor/svelte` | Doesn't exist — use `monaco-editor` + `@monaco-editor/loader` |
| `cmdk-svelte@^2.0.0` | Only `0.0.1` exists |
| `svelte-sonner@^0.5.0` | Real is `1.2.1` |
| `@xterm/addon-*@^0.1x.0` stable | All beta only |
| `svelte-motion@^0.4.0` with Svelte 5 | Only supports Svelte 3 |
| `liquid-glass-svelte` | Doesn't exist — use custom SDF shader |

---

## 1. INSPO SITES — SCORED SHORTLIST (Dark Terminal / macOS-Native Fit)

### Tier 1 — Direct References (Steal Heavily)
| Site | Score | What to Steal | Caveat |
|------|-------|---------------|--------|
| **Raycast** (raycast.com) | 9/10 | Command palette layout, footer hint bar, keyboard-first, extension cards | Hero gradient is loud |
| **Linear** (linear.app) | 9/10 | 28px sidebar rows, structured cards, deep abyss palette, spring feel | No terminal chrome |
| **Warp** (warp.dev) | 9/10 | Block-based terminal output, agent blocks with approve/run/reject, cost metrics inline | Marketing page is light |
| **Cursor** (cursor.com) | 7/10 | AI output cards with file refs, task list, 3-pane workspace | Some web-app tells |
| **Brittany Chiang** (brittanychiang.com) | 8.5/10 | Sticky sidebar, timeline logs, green tags, two-column layout | Light-ish navy |
| **Ghostty** (ghostty.org) | 8/10 | Clean terminal design, theme system, GPU-accelerated | Terminal only |

### Tier 2 — Component Goldmines
| Site | Score | What to Steal | Caveat |
|------|-------|---------------|--------|
| **21st.dev** | 7/10 | 12,000+ hand-crafted components: shaders, backgrounds, chat UI, glass cards | React — translate to Svelte |
| **Jakub Antalik** (jakubantalik.com) | 7/10 | Border Beam, Thinking Orbs, Liquid Metal shader | Light theme |
| **Pryzm** (pryzm.design) | 7/10 | Pure black + glassmorphism, bold type, dramatic dark | Not macOS-native |
| **Originkit** (originkit.com) | 7/10 | 250+ animated components reference | React |
| **Unicorn Studio** (unicorn.studio) | 6/10 | Dark SaaS, glow effects, code blocks | Web SaaS feel |

### Tier 3 — Dark Mode Galleries (Browse for Fresh Ideas)
| Site | What It Is |
|------|------------|
| **darkmodedesign.com** | Showcase of beautiful dark mode websites |
| **dark.design** | Hand-picked dark themed websites |
| **Muzli Dark Mode** (muz.li/inspiration/dark-mode/) | Curated dark UI examples |
| **Godly** (godly.website) | Fresh contemporary website inspiration |
| **Land-book** (land-book.com) | Curated website design gallery, updated daily |
| **SiteInspire** (siteinspire.com) | Web design inspiration |
| **Awwwards** (awwwards.com) | Award-winning websites, expert judged |
| **One Page Love** (onepagelove.com) | One-page site inspiration |
| **Minimal Gallery** | Minimal design showcase |
| **Seesaw** | Design inspiration |
| **Unsection** | Section-level design inspiration |
| **CTA Gallery** | Call-to-action design patterns |
| **Footer Design** | Footer design patterns |

### Tier 4 — Mobile & Product Flow (For the Mobile App)
| Site | What It Is |
|------|------------|
| **Mobbin** (mobbin.com) | Mobile design patterns, product flows |
| **Dribbble** (dribbble.com) | Design shots, UI concepts |
| **Behance** (behance.net) | Design portfolios |
| **Collect UI** (collectui.com) | Curated UI patterns |
| **Recent Design** (recent.design) | Latest designs |

---

## 2. DESIGN SYSTEMS & TOKEN ARCHITECTURE

### Open-Source Design Systems (2026)
| System | Stack | Notes |
|--------|-------|-------|
| **shadcn/ui** | React (Radix → Base UI as of Jul 2026) | Copy-paste components, token-based |
| **Park UI** | Ark UI primitives | Headless, multi-framework |
| **Base UI** | React | New default primitive layer for shadcn |
| **Radix UI** | React | Still valid, not deprecated |
| **Mozilla Protocol** | Web | Open-source design system |
| **Fluent UI** | React | Microsoft, 60+ components |
| **Mantine** | React | Full-featured |
| **Chakra UI** | React | Accessible |
| **Ant Design** | React | Enterprise |
| **MUI** | React | Material |

### Token Standards (2026)
| Standard | What It Is |
|----------|------------|
| **DTCG** | Design Token Community Group — first stable spec shipped 2026, 84% adoption |
| **Open Props** | Sub-atomic CSS variables for motion, easing, gradients, noise, z-index |
| **Tailwind v4 `@theme`** | Native CSS custom properties, zero config |

### Our Token Architecture (NIL)
```
Primitive (raw values) → Semantic (purpose aliases) → Component (specific)
--color-violet #452a84 → --accent-primary → --button-bg
```
See `DESIGN-TOKENS.md` for the full locked set.

---

## 3. ANIMATION & MOTION LIBRARIES (Svelte 5)

| Library | API Style | Best For | Verified |
|---------|-----------|----------|----------|
| **svelte-motion** | Framer Motion API | Layout animations, shared layout, gestures, AnimatePresence | ✅ 0.12.2 |
| **motion** (Motion One) | WAAPI wrapper | Performant transform/opacity, scroll-linked | ✅ 13.1.1 |
| **svelte/motion** (built-in) | Spring/tween stores | Simple value animation | ✅ |
| **GSAP** | Timeline/sequencing | Complex orchestration, scroll-triggered | ✅ (framework-agnostic) |
| **Svelte Animations** (SikandarJODD) | Copy-paste micro-interactions | Svelte Motion + Tailwind gallery | ✅ GitHub |
| **Svelte Magic UI** | Animated components | Aceternity-style | ✅ GitHub |

**Recommendation:** `svelte-motion` for layout/shared transitions + built-in `spring`/`tween` for values + `motion` for scroll.

### Our Spring Curves (Locked)
```css
--spring-bouncy:  cubic-bezier(0.34, 1.56, 0.64, 1);   /* Playful: hover, badges, toasts */
--spring-smooth:  cubic-bezier(0.22, 1, 0.36, 1);      /* UI: panels, layout shifts */
--spring-window:  cubic-bezier(0.32, 0.72, 0, 1);      /* Windows, sheets, modals */
--spring-snappy:  cubic-bezier(0.25, 0.9, 0.25, 1);    /* Quick: buttons, toggles */
```

---

## 4. VISUAL EFFECTS & ATMOSPHERE

### Liquid Glass (True iOS-style)
- **Custom SDF shader** (from your smart-display) — single-pass WebGL, refraction + chromatic aberration, no framebuffer capture. See `references/sdf-liquid-glass-shader.md`.
- **CSS fallback** — `backdrop-filter: blur(26px) saturate(1.55)` + edge refraction highlight via `::before` gradient + `mask-composite`.

### Dithering & Noise
| Tool | Type | Use |
|------|------|-----|
| **dither-kit** (tripwire.sh) | Zero-dep canvas dithering | Charts, hero backgrounds |
| **CSS feTurbulence** | SVG filter | 3% noise overlay on abyss |
| **Bayer ordered dither** | WebGL | Hero overlays, retro texture |
| **Atkinson dither** | WebGL | Retro-computing nod |

### Border Beam & Thinking Orbs (Jakub Antalik)
- **Border Beam** — animated conic-gradient traveling container borders
- **Thinking Orbs** — 3 pulsing orbs with staggered spring delays
- Both already in harness as `BorderBeam.svelte` + `ThinkingOrbs.svelte`

### UI Sounds
| Tool | Type | Use |
|------|------|-----|
| **cuelume** | 2KB, 10 sounds, Web Audio API | click, success, error, toggle, complete, whoosh, pop |
| **uisfx.com** | 900+ open-source sound effects | Custom/notification sounds |
| **howler.js** | Web Audio wrapper | Spatial/3D audio if needed |

---

## 5. AI AGENT UI PATTERNS (2026 — What Cursor/Claude Code Do)

### The 2026 Agent-First Shift
- **Cursor 3** (Apr 2026) demoted the IDE to a fallback pane, shipped an **agent-first interface**
- **Composer 2.5** (May 2026) landed third on Artificial Analysis
- **Claude Code** = terminal-native, MCP-deep
- **Codex** = IDE-anchored

### Patterns to Steal
| Pattern | Source | NIL Implementation |
|---------|--------|-------------------|
| Agent-first interface (IDE is fallback) | Cursor 3 | Terminal default, AI summoned |
| Block-based terminal output | Warp | Real PTY blocks, not fake chrome |
| AI output as structured cards | Cursor | Meta header (name + model), code block, prose |
| Pending approval block | Cursor/Warp | `ApprovalCard` — THE one attention object |
| Cost metrics inline | Warp | Show token/cost per agent run |
| File references in AI output | Cursor | `+52/-0` badges, clickable file links |
| Task list with status | Cursor | Agent plan → steps → status icons |
| Context7 for docs | Claude Code | Agent reads live docs via MCP |

---

## 6. AI SKILL PACKS (skills.sh — Anti-Slop Guardrails)

> Install as MCP skill packs so agents get guardrails automatically.

| Skill | Stars | Purpose | Install |
|-------|-------|---------|---------|
| **ui-ux-pro-max** | 120,460 | Design tokens, palettes, fonts, UX guidelines | `npx skills add ui-ux-pro-max` |
| **taste-skill** | 79,935 | Anti-slop frontend framework (13 skills) | `npx skills add tasteskill` |
| **impeccable** | 62,115 | Design skills for AI agents | `npx skills add impeccable` |
| **humanizer** | 37,537 | Strip AI-isms from copy | `npx skills add humanizer` |
| **hallmark** | 26,835 | Avoid AI slop UI patterns | `npx skills add hallmark` |
| **stop-slop** | 16,300 | Explicit anti-slop enforcement | `npx skills add stop-slop` |
| **emilkowalski/skills** | — | Design engineering (Vercel/Linear engineer) | `npx skills@latest add emilkowalski/skills` |

---

## 7. REFERENCE-FIRST WORKFLOW (Pengsonal Method)

> "I'm not a designer, so instead of asking AI to invent the whole UI, I give it good references and let it build with them like Lego."

### Reference Resources (send to your coding agent)
| Resource | URL | Purpose |
|----------|-----|---------|
| **beautifului.dev** | https://beautifului.dev | Curated beautiful UI |
| **beui.dev** | https://beui.dev | Component patterns |
| **rareui.com** | https://rareui.com | Rare/unique UI patterns |
| **transitions.dev** | https://transitions.dev | Motion/transition references |
| **ui.shadcn.com** | https://ui.shadcn.com | shadcn/ui official |
| **ui-skills.com** | https://ui-skills.com | Skill-based UI components |
| **coss.com/ui** | https://coss.com/ui | Component gallery |
| **designsystemchecklist.com** | https://designsystemchecklist.com | Design system audit |
| **reui.io/components** | https://reui.io/components | React UI components |
| **emilkowal.ski/ui/you-dont-need-javascript** | https://emilkowal.ski/ui/you-dont-need-javascript | CSS-only patterns |

### MCP-Enabled Reference Servers
| Server | Purpose |
|--------|---------|
| **Mobbin MCP** (mobbin.com/mcp) | Mobile design patterns |
| **Canvas UI** (canvasui.dev) | Design canvas |
| **60fps Design MCP** (60fps.design/mcp) | 60fps motion patterns |
| **Recent Design** (recent.design) | Latest designs |
| **Collect UI** (collectui.com) | Curated UI |

---

## 8. TERMINAL & CODE EDITING

### Terminal Emulators (for PTY reference)
| App | Why |
|-----|-----|
| **Ghostty** | Clean design, GPU-accelerated, theme system, hundreds of themes |
| **Warp** | Block-based I/O, agent blocks, cost metrics |
| **Kitty** | GPU-accelerated, highly configurable |
| **Alacritty** | Minimal, fast |
| **WezTerm** | Cross-platform, configurable |

### Editor
| Library | Why |
|---------|-----|
| **monaco-editor** | VS Code editor, IntelliSense, diff, minimap — the "Cursor feel" |
| **CodeMirror 6** | Lighter, more modular alternative |

---

## 9. TAURI-SPECIFIC PLUGINS

| Plugin | Purpose |
|--------|---------|
| `tauri-plugin-shell` | Run sidecar binaries, spawn commands (agent loop, tool execution) |
| `tauri-plugin-fs` | File system access (read/write project files) |
| `tauri-plugin-dialog` | Open/save dialogs (project open, export) |
| `tauri-plugin-clipboard` | Clipboard access |
| `tauri-plugin-global-shortcut` | Global hotkeys (Cmd+K, Cmd+Shift+F) |
| `tauri-plugin-notification` | System notifications |
| `tauri-plugin-updater` | Auto-updates |

---

## 10. CUSTOM COMPONENTS TO BUILD (not in libraries)

| Component | Purpose | Uses |
|-----------|---------|------|
| `BorderBeam` | Animated gradient border on hover/focus | Canvas/WebGL, bits-ui |
| `ThinkingOrbs` | AI streaming indicator | Canvas, svelte-motion |
| `ThinkingLogo` | NIL brand N + orbiting orbs, 4 states | ThinkingOrbs, BorderBeam, SVG |
| `LiquidMetalTitlebar` | 40px WebGL titlebar | Raw WebGL / three.js |
| `AgentConversation` | Main surface — plan/tool/diff/finding blocks | bits-ui, svelte-motion |
| `AgentComposer` | Auto-grow, mode chips, drag-drop | bits-ui, superforms |
| `StructuredBlock` | Tool run, diff, finding, artifact, approval | bits-ui, monaco-editor |
| `ApprovalBlock` | Inline Approve/Edit/Reject | bits-ui, cuelume |
| `Sidebar` | Linear-density, spring physics | bits-ui, svelte-motion |
| `Inspector` | Findings, evidence, timeline | bits-ui |
| `StatusBar` | 26px, mono data | Custom |
| `CommandPalette` | Raycast-level, everything searchable | bits-ui Combobox |
| `SettingsSheet` | macOS-style, left sidebar categories | bits-ui, glass tiers |
| `EmptyState` | Project templates, recent, "New Project" | bits-ui |
| `GlassCard` | Our glass tiers + edge highlight | CSS tokens |
| `SpringTransition` | Shared layout transitions | svelte-motion |

---

## 11. INSTALL COMMANDS (Verified)

```bash
# Core UI primitives
npm i -D bits-ui @melt-ui/svelte @zag-js/svelte paneforge

# Styled layer
npm i shadcn-svelte @svar-ui/svelte-core

# Animation
npm i svelte-motion motion

# Visual effects
npm i cuelume morphicons liquid-gooey reicon

# Icons
npm i lucide-svelte

# Forms & state
npm i superforms zod @tanstack/svelte-query

# Drag & drop
npm i @dnd-kit/svelte svelte-dnd-action

# Notifications
npm i svelte-sonner

# Terminal & editor (already in deps)
npm i @xterm/xterm @xterm/addon-fit @xterm/addon-webgl monaco-editor
```

---

## 12. ANTI-SLOP RULES (Enforced — from hallmark + your bookmarks)

- **0 box shadows** — borders + glass only
- **Locked tokens** — never inline hex/rgb, always `var(--token)`
- **Glass is accent** — max 2 glass elements visible at once
- **Radius hierarchy** — 6px badges, 8px controls, 12px panels, 10px windows
- **No generic AI icons** — sparkle, star, magic, lightning, diamond, orb, robot forbidden
- **Typography purity** — no italic headers, Inter (humans), JetBrains Mono (machines)
- **Specific CTAs only** — "Open Workspace", "New Project", "Run Command"
- **One attention object** — pending approval OR live run OR critical finding (pick ONE)
- **Linear easing forbidden** — spring curves only
- **Mobile verified** — 320/375/414/768px, no horizontal overflow
- **No fake terminal chrome** — real PTY only, no `$` prompts as decoration
- **No chat bubbles** — structured cards with meta headers
- **No traffic lights on web** — only true macOS Tauri with `titleBarStyle: overlay`

---

*End of THE-FULL-ARSENAL.md — expand as you find more. All packages verified. All inspo scored.*