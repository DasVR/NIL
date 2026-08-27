# NIL Coding Agent Workspace — Library Research & Spec

**Target:** Tauri + SvelteKit desktop app (like Cursor but better)
**Design DNA:** Dark abyss #050507, violet/coral accents, JetBrains Mono + Inter, spring physics, liquid glass tiers, zero box-shadows, anti-slop

---

## 0. REFERENCE-FIRST WORKFLOW (Pengsonal Method)

> "I'm not a designer, so instead of asking AI to invent the whole UI, I give it good references and let it build with them like Lego."

**Core principle:** Never ask agents to invent UI from scratch. Give them reference resources, let them inspect components, pick what fits.

### Reference Resources (send to your coding agent)
- **beautifului.dev** — curated beautiful UI
- **beui.dev** — component patterns
- **rareui.com** — rare/unique UI patterns
- **transitions.dev** — motion/transition references
- **ui.shadcn.com** — shadcn/ui official
- **ui-skills.com** — skill-based UI components
- **coss.com/ui** — component gallery
- **designsystemchecklist.com** — design system audit
- **reui.io/components** — React UI components
- **emilkowal.ski/ui/you-dont-need-javascript** — CSS-only patterns

### MCP-Enabled Reference Servers
- **Mobbin MCP** — `mobbin.com/mcp` — mobile design patterns
- **Canvas UI** — `canvasui.dev` — design canvas
- **60fps Design MCP** — `60fps.design/mcp` — 60fps motion patterns
- **Recent Design** — `recent.design` — latest designs
- **Collect UI** — `collectui.com` — curated UI

---

## 1. CORE UI FRAMEWORK & COMPONENTS

### SvelteKit + Tauri (Already chosen)
- **SvelteKit 2.x** — SSR + SPA hybrid, file-based routing
- **Tauri 2.x** — Rust backend, native windows, system tray, <20MB binary
- **shadcn-svelte** — copy-paste accessible components, fully customizable
  - https://github.com/huntabyte/shadcn-svelte
  - Use as base, restyle to our tokens

### Alternative: bits-ui (headless, unstyled)
- https://github.com/bits-ui/bits-ui
- Radix-equivalent for Svelte, zero styles, full control
- Better for building custom design system from scratch

**Recommendation:** **bits-ui** for primitives + our own styled components. Avoids fighting shadcn defaults.

---

## 2. ANIMATION & MOTION

### svelte-motion (Framer Motion for Svelte)
- Spring physics, layout animations, shared layout transitions
- Our curves: `--spring-bouncy`, `--spring-smooth`, `--spring-window`, `--spring-snappy`
- https://github.com/svelte-motion/svelte-motion

### tailwindcss-animate (if using Tailwind)
- Pre-built animation utilities
- But we're token-based, so custom CSS springs preferred

### CSS-only springs (lightest)
```css
@keyframes spring-bouncy { ... }
```
Use `linear()` easing functions for spring curves in pure CSS.

---

## 3. GLASSMORPHISM / LIQUID GLASS (Svelte)

### liquid-glass-svelte
- https://github.com/your-repo/liquid-glass-svelte
- Apple iOS 26 liquid glass: distortion + dynamic lighting
- Svelte-native, no deps

### @mawtech/glass-ui
- Dark-first glassmorphism, Apple macOS/visionOS style
- https://github.com/mawtech/glass-ui

### Custom implementation (our glass tiers)
We already have `--glass-1` through `--glass-4` tokens. Implement as:
```css
.glass-1 { backdrop-filter: blur(32px) saturate(1.7); background: rgba(5,5,7,0.45); }
.glass-1::before { /* edge refraction highlight */ }
```
No library needed — just our tokens + CSS.

---

## 4. TERMINAL & CODE EDITING

### xterm.js + xterm-addon-webgl
- Full terminal emulator in browser
- WebGL renderer for 60fps
- https://github.com/xtermjs/xterm.js
- Addons: fit, search, web-links, unicode11

### @xterm/addon-serial (for hardware)
- Not needed for our use case

### monaco-editor (VS Code editor)
- Full IDE editing: IntelliSense, diff, minimap
- https://github.com/microsoft/monaco-editor
- @monaco-editor/svelte wrapper

### Alternative: CodeMirror 6
- Lighter, more modular
- https://codemirror.net/6/
- @codemirror/language packages for syntax highlighting

**Recommendation:** **monaco-editor** for the "Cursor feel" — users expect that editing experience.

---

## 5. COMMAND PALETTE (Raycast-level)

### kbd (keyboard shortcuts)
- https://github.com/kbd-rs/kbd (Rust) or Svelte equivalent
- For global shortcuts + palette

### cmdk-svelte (shadcn-svelte command palette)
- https://github.com/huntabyte/shadcn-svelte/tree/main/packages/cmdk-svelte
- Fast, fuzzy search, keyboard-first

### Custom: build on bits-ui Combobox
- Full control, our styling, our shortcuts

---

## 6. ICONS & ICON TRANSITIONS

### lucide-svelte
- Clean, consistent, 2px stroke, 24px base
- https://github.com/lucide-icons/lucide-svelte
- Tree-shakeable

### morphicons
- Icon → icon morphing, fluid, no deps
- https://github.com/guillermolg00/morphicons
- Use for: terminal ↔ editor ↔ AI view switches, mode chips

### tabler-icons-svelte
- Alternative, larger set

### reicon (skills.sh)
- 2700+ SVG icons, 24×24 grid, outline + filled weights
- React/Vue/Svelte/CDN/Figma/VS Code/MCP packages
- https://github.com/dqev/reicon

### tech-logos (200+ tech logos)
- Every tech logo as clean optimized SVGs
- React/HTML/JS/Docker components

---

## 7. SOUNDS & AUDIO

### cuelume (PRIMARY — your bookmark)
- **2KB, 10 UI sounds, one attribute per element, NO CONFIG**
- `npm install cuelume`
- Usage: `<button data-cuelume="click">` / `data-cuelume="success"` / `data-cuelume="error"`
- Sounds: click, success, error, notification, complete, deny, select, hover, scroll, back

### uisfx.com
- 900+ open-source sound effects
- For custom/notification sounds beyond cuelume's 10

### Web Audio API wrapper (howler.js)
- If we need spatial/3D audio for immersive moments
- https://howlerjs.com/

---

## 8. THINKING LOGO SYSTEM (NIL Brand Animation)

### Concept
The NIL blocky N monogram becomes the **agent state indicator** — 4 states matching the AI strip:

| State | Visual | Tokens |
|-------|--------|--------|
| **Idle** | Static N, violet #452a84 on abyss | `--violet` on `--abyss` |
| **Thinking** | N's notches breathe + 2-3 ThinkingOrbs orbit (coral + lavender) | `--coral` + `--violet-light` orbs, spring physics |
| **Streaming** | Orbs converge into N, it glows, BorderBeam sweeps edge | `--violet-light` glow, BorderBeam animation |
| **Done** | N snaps to solid cream, soft pulse | `--cream` fill, snappy spring |

### Implementation
- `ThinkingLogo.svelte` — wraps `ThinkingOrbs.svelte` + N monogram SVG
- Lives in top-right of titlebar / sidebar header / AI strip
- Single shared WebGL context with `LiquidMetalTitlebar` (if we combine)
- `prefers-reduced-motion` = static N only, no orbs/beam

### Inspiration References
- **Jakub Antalik Thinking Orbs** — https://orbs.jakubantalik.com/ (already in harness as ThinkingOrbs.svelte)
- **Jakub Antalik Border Beam** — https://beam.jakubantalik.com/ (already in harness as BorderBeam.svelte)
- **@pengsonal workflow** — give agent reference, let it inspect, pick what fits
- **Skills.sh tier list** — HERMES-AGENT at S++, NIL should target that tier

---

## 9. BORDERS & GLOWS (Jakub Antalik — your core aesthetic)

### Border Beam
- Animated boundary beam around elements
- https://beam.jakubantalik.com/
- React implementation — port to Svelte or use via web component

### Thinking Orbs
- Animated thinking/brainstorm orbs
- https://orbs.jakubantalik.com/
- Use for: AI strip streaming state, agent "thinking" indicator

### Implementation approach
- Build Svelte components wrapping the Canvas/WebGL logic
- BorderBeam.svelte: `<BorderBeam>{children}</BorderBeam>` with animated gradient border
- ThinkingOrbs.svelte: `<ThinkingOrbs count={3} />` for loading states

---

## 9. WEBGL / SHADERS

### Our Liquid Metal shader (already in harness)
- Titlebar only (40px), single shared WebGL context
- Simplex noise FBM, metallic pools, dynamic lighting, mouse sheen
- Frozen on `prefers-reduced-motion`

### shaders-v3 / npm_i_shaders
- WebGPU shader effects for design engineers
- https://github.com/your-repo/shaders-v3
- Presets: Particles, Crystal, 3D Logo
- Use sparingly: hero, loading, critical moments only

### three.js / @threlte (Svelte Three.js)
- If we need 3D scenes
- https://threlte.xyz/

---

## 10. STATE MANAGEMENT

### svelte/store (built-in)
- Writable, readable, derived stores
- Enough for most UI state

### nanostores (if cross-framework)
- Tiny, framework-agnostic
- https://github.com/nanostores/nanostores

### @tanstack/svelte-query (server state)
- Caching, deduping, background refetch
- For API calls to backend

---

## 11. FORMS & VALIDATION

### superforms + zod
- SvelteKit-native forms with Zod validation
- https://github.com/ciscoheat/superforms
- Progressive enhancement, file uploads

### formsnap (shadcn-svelte forms)
- If using shadcn components

---

## 12. DRAG & DROP

### @dnd-kit/svelte
- Accessible, performant, headless
- https://github.com/clauderic/dnd-kit
- For: rearranging sidebar items, docking panels, file uploads

### svelte-dnd-action
- Lightweight Svelte action
- https://github.com/dnd-svelte/svelte-dnd-action

---

## 13. NOTIFICATIONS / TOASTS

### svelte-sonner
- Svelte port of sonner (beautiful toasts)
- https://github.com/your-repo/svelte-sonner
- Promise-based, customizable

### Custom toast system (our design)
- Use our glass tiers + spring curves + cuelume sounds
- Single attention object rule

---

## 14. THEMING / COLOR SCHEME

### Custom CSS custom properties (already defined)
- `--abyss` through `--abyss-4`
- `--violet`, `--coral`, `--lavender`, `--cream`
- `--glass-1` through `--glass-4`
- `--spring-*` curves
- Dark-only (no light mode needed for this app)

### mode-watcher (for system preference)
- https://github.com/your-repo/mode-watcher
- But we're dark-only

---

## 15. ACCESSIBILITY (mandatory)

### @zag-js/svelte (headless UI primitives)
- Fully accessible, unstyled
- https://zagjs.com/
- For complex components: select, date-picker, slider, tabs

### Focus management
- `focus-visible` polyfill if needed
- Rogue focus trapping in modals/sheets

---

## 16. BUILD TOOLS & DEVEX

### vite + @sveltejs/vite-plugin-svelte
- Already in SvelteKit

### tailwindcss (optional)
- Only if we want utility classes for rapid prototyping
- Our design is token-based, so maybe skip

### eslint + prettier + svelte-check
- Standard

### vitest + @playwright/test
- Unit + E2E

---

## 17. TAURI-SPECIFIC

### tauri-plugin-shell
- Run sidecar binaries, spawn commands
- For: spawning the agent loop, tool execution

### tauri-plugin-fs
- File system access
- For: reading/writing project files

### tauri-plugin-dialog
- Open/save dialogs
- For: project open, export

### tauri-plugin-clipboard
- Clipboard access

### tauri-plugin-global-shortcut
- Global hotkeys (Cmd+K, Cmd+Shift+F)

### tauri-plugin-notification
- System notifications

### tauri-plugin-updater
- Auto-updates

### Sidecar: agent backend (Rust or Node)
- The "brain" runs as a sidecar process
- Communicates via IPC / stdin-stdout

---

## 18. LIBRARY SUMMARY — WHAT TO INSTALL

### Anti-Slop / Design Skills (skills.sh)
```bash
# Core anti-slop skills — these are non-negotiable
npx skills@latest add emilkowalski/skills           # design engineering (120k)
npx skills add https://github.com/Leonxlnx/taste-skill --skill "design-taste-frontend"  # taste-skill (80k)
npx skills add impeccable.style                      # impeccable (62k)
npx skills add hallmark                              # hallmark (26k)
npx skills add stop-slop                             # stop-slop (16k)
```

### Core UI Primitives
```bash
npm i -D bits-ui lucide-svelte svelte-motion
npm i @monaco-editor/svelte xterm @xterm/addon-fit @xterm/addon-webgl @xterm/addon-search @xterm/addon-web-links
```

### Command Palette
```bash
npm i cmdk-svelte
```

### Forms
```bash
npm i superforms zod
```

### Drag & Drop
```bash
npm i @dnd-kit/svelte
```

### State
```bash
npm i @tanstack/svelte-query
```

### Notifications
```bash
npm i svelte-sonner
```

### Sounds
```bash
npm i cuelume
```

### Morphicons (icon transitions)
```bash
npm i morphicons
```

### WebGL/Shaders (if needed)
```bash
npm i three @threlte/core
```

### Liquid/Gooey Effects
```bash
npm i liquid-gooey
```

### Reference MCP Servers (for agents to inspect)
```bash
# These run as MCP servers that agents can query
# Mobbin: mobbin.com/mcp
# 60fps Design: 60fps.design/mcp
# Canvas UI: canvasui.dev
```

### Dither/Animation Libraries
```bash
# dither-kit — zero-dep canvas dithering
# tripwire.sh/dither-kit
# 404.colorion.co — 404 animations
# circleloaders.dominikakissi.com — SVG loaders
```

### Dev
```bash
npm i -D vitest @playwright/test svelte-check
```

### Tauri plugins (in Cargo.toml)
```toml
# tauri-plugin-shell, tauri-plugin-fs, tauri-plugin-dialog,
# tauri-plugin-clipboard, tauri-plugin-global-shortcut,
# tauri-plugin-notification, tauri-plugin-updater
```

---

## 19. CUSTOM COMPONENTS TO BUILD (not in libraries)

These we build ourselves using the primitives above:

| Component | Purpose | Uses |
|-----------|---------|------|
| `BorderBeam` | Animated gradient border on hover/focus | Canvas/WebGL, bits-ui |
| `ThinkingOrbs` | AI streaming indicator | Canvas, svelte-motion |
| `ThinkingLogo` | NIL brand N + orbiting orbs, 4 states | ThinkingOrbs, BorderBeam, SVG |
| `LiquidMetalTitlebar` | 40px WebGL titlebar | three.js / raw WebGL |
| `AgentConversation` | Main surface — plan/tool/diff/finding blocks | bits-ui, svelte-motion |
| `AgentComposer` | Auto-grow, mode chips, drag-drop | bits-ui, superforms |
| `StructuredBlock` | Tool run, diff, finding, artifact, approval | bits-ui, monaco-editor |
| `ApprovalBlock` | Inline Approve/Edit/Reject | bits-ui, cuelume |
| `Sidebar` | Linear-density, spring physics | bits-ui, svelte-motion |
| `Inspector` | Findings, evidence, timeline | bits-ui |
| `StatusBar` | 26px, phosphor green data | Custom |
| `CommandPalette` | Raycast-level, everything searchable | cmdk-svelte |
| `SettingsSheet` | macOS-style, left sidebar categories | bits-ui, glass tiers |
| `EmptyState` | Engagement templates, recent, "New Engagement" | bits-ui |
| `GlassCard` | Our glass tiers + edge highlight | CSS tokens |
| `SpringTransition` | Shared layout transitions | svelte-motion |

---

## 20. PENPOT DESIGN WORKFLOW

### Penpot at localhost:9001
1. Create new file: **NIL Workspace Design System**
2. Pages:
   - **00 Tokens** — color, glass, spring, type, density
   - **01 Components** — buttons, inputs, cards, blocks, badges
   - **02 Layouts** — main window, sidebar, inspector, composer, empty state
   - **03 Flows** — agent loop, approval flow, Space switch, settings
   - **04 States** — loading, error, empty, YOLO, streaming
   - **05 Specs** — handoff: CSS tokens, component props, interaction specs

### Penpot → Code handoff
- Export design tokens as CSS custom properties JSON
- Use Penpot's developer handoff (Inspect panel) for spacing, colors, shadows
- Components built in Svelte match Penpot 1:1

---

## 21. ANTI-SLOP SKILLS ECOSYSTEM (skills.sh)

From the skills.sh tier list (HERMES-AGENT at S++) — these are the design/anti-slop skills to install as MCP-enabled skill packs for agents:

| Skill | Stars | Purpose | Install |
|-------|-------|---------|---------|
| **ui-ux-pro-max** | 120,460 | Design tokens, palettes, font pairings, UX guidelines | `npx skills@latest add ui-ux-pro-max` |
| **taste-skill** | 79,935 | Anti-slop frontend framework (13 skills) | `npx skills add taste-skill` |
| **impeccable** | 62,115 | Design skills for AI agents | `npx skills add impeccable.style` |
| **humanizer** | 37,537 | Strip AI-isms, add real voice | `npx skills add humanizer` |
| **hallmark** | 26,835 | Avoid AI slop UI patterns | `npx skills add hallmark` |
| **stop-slop** | 16,300 | Explicit anti-slop enforcement | `npx skills add stop-slop` |
| **archify** | 15,280 | Architecture diagrams | `npx skills add archify` |
| **diagram-design** | 26,212 | Diagram components | `npx skills add diagram-design` |
| **design.md** | 27,479 | Google's design token spec | `npx skills add design.md` |
| **answer-first** | mine, free | Answer-first communication pattern | already yours |
| **voiceprint** | mine, free | Voice/identity system | already yours |

These skills can be loaded by agents at runtime via the skills.sh MCP server — they act as guardrails so agents don't pick wrong easings, borders, shadows, etc.

---

## 22. NEXT STEPS

1. **Design in Penpot** (you + me):
   - Set up tokens page with our exact values
   - Design component library (buttons, inputs, cards, blocks)
   - Design main window layouts (3-4 key screens)
   - Design interaction flows (agent loop, approval, composer)

2. **Scaffold Tauri + SvelteKit** with the library stack above

3. **Build component library** matching Penpot designs

4. **Wire agent loop backend** (the "brain" — godmode API + tool executor)

5. **Integrate**: conversation surface + terminal + Monaco + sidebar + inspector

6. **Install anti-slop skills** via skills.sh MCP so every agent gets guardrails automatically

---

*This doc lives at `cursor-research/LIBRARY-SPEC.md` in the repo.*