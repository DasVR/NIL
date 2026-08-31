# NIL — Bookmark Sourcing Ledger

> **Purpose:** Every design decision traced to a specific bookmark URL + verified package. No generic inspo. This is the receipt.

---

## CORE AESTHETIC EFFECTS

| Effect | Bookmark Source | Verified Package | Implementation |
|--------|-----------------|------------------|----------------|
| **Liquid Metal Titlebar** | @Jakubantalik (Border Beam, Thinking Orbs) | Custom shader (from smart-display) | `LiquidMetal.svelte` — single WebGL canvas, FBM + fresnel |
| **Border Beam** | @Jakubantalik | Custom (CSS gradient + animation) | `BorderBeam.svelte` — animated border on focused element |
| **Thinking Orbs** | @Jakubantalik | Custom (SVG + spring motion) | `ThinkingOrbs.svelte` — 2-3 orbiting orbs around N monogram |
| **Dithering / Noise Overlay** | tripwire.sh/dither-kit, @paper-design/neuro-noise | CSS `feTurbulence` (no package) | `NoiseOverlay.svelte` — 3% opacity on abyss |
| **Liquid Glass (SDF Refraction)** | Your smart-display project (SDF shader) | Custom shader | `LiquidMetal.svelte` — SDF panel sync for true refraction |
| **Gooey SVG Metaballs** | @cuelume, @morphicons | `liquid-gooey` (verify) | `ThinkingLogo.svelte` — feGaussianBlur + feColorMatrix |
| **Spring Physics Curves** | Framer springs, Amicro interactions | `svelte-motion` ✅ | 4 curves in DESIGN-TOKENS.md |
| **Magnetic Cursor** | @paper-design/magnetic-cursor | Custom (tight follow + expand) | Global cursor component |
| **Ambient Dots** | Portfolio reference (your site) | Custom | `AmbientDots.svelte` — sparse particle field |

---

## ANTI-SLOP RULES (Bookmark-Grounded)

| Rule | Bookmark Source | Enforcement |
|------|-----------------|-------------|
| **0 box shadows** | chiefkeef.md (your bookmark) | Anti-slop rules: borders + glass only |
| **Locked tokens** | hallmark skill, design-system skill | DESIGN-TOKENS.md — no inline hex |
| **Glass is accent (max 2)** | hallmark R-10, dark-native-web-ui | Glass tier map in DESIGN-TOKENS.md |
| **Radius hierarchy** | hallmark R-11, Linear density | 6/8/12/10/16px in DESIGN-TOKENS.md |
| **No generic AI icons** | hallmark R-04, your bookmarks | SVG only, relevant to function |
| **Typography purity** | hallmark R-06, impeccable.style | No italic headers, Inter/JetBrains only |
| **Specific CTAs** | hallmark R-15, Folk empty states | "Open Workspace" not "Get Started" |
| **One attention object** | dark-native-web-ui, Cursor UX | ApprovalCard = only pulsing element |
| **Spring curves only** | dark-native-web-ui, Framer | 4 curves, reduced-motion fallbacks |
| **Density with calm** | Linear, Cursor, Workstation spec | 28px rows, 26px statusbar, 40px titlebar |

---

## MACOS APP REFERENCES (Your Bookmarks)

| App | What We Steal | Bookmark Evidence |
|-----|---------------|-------------------|
| **Cursor IDE** | Terminal default, AI summoned (Cmd+J), structured cards not bubbles, density | Your explicit references |
| **Linear** | 28px sidebar rows, mono for data/Inter for prose, quiet dark UI, action empty states | Your bookmarks + dark-native-web-ui |
| **Raycast** | Command palette speed, keyboard-first, spring animations, sheet presentation | Your bookmarks |
| **Warp** | Real PTY blocks, no fake terminal chrome, blocks wrap output | Your bookmarks |
| **Arc Browser** | Spaces not pages, keyboard as GUI, contextual AI | Your bookmarks |
| **Claude Desktop** | Quiet dark UI, structured cards with meta headers, no user/assistant pills | Your bookmarks |
| **Framer** | Spring physics, micro-interactions, motion with purpose | Amicro interactions bookmark |

---

## VERIFIED PACKAGE REGISTRY

| Package | `npm view` Status | Purpose | Used In |
|---------|-------------------|---------|---------|
| `svelte-motion` | ✅ 0.12.2 exists | Framer Motion for Svelte 5 | All spring animations |
| `cuelume` | ✅ 1.0.0 exists | 2KB UI sounds (10 effects) | Button clicks, transitions, notifications |
| `reicon` | ✅ 1.0.0 exists | 2700+ SVG icons + MCP | All icons (no emoji) |
| `bits-ui` | ✅ 0.21.0 exists | Headless primitives (radix alt) | Select, dialog, tooltip, popover |
| `shadcn-svelte` | ✅ 0.2.0 exists | shadcn for Svelte | Form components, consistent base |
| `liquid-glass-svelte` | ❌ **phantom** | Liquid glass panels | **DROP — use custom SDF shader** |
| `morphicons` | ⚠️ check `npm view` | Icon morphing | Verify before use |
| `tasteskill` | ✅ CLI installable | Anti-slop frontend skills | Cursor skill pack |
| `@iconify/svelte` | ✅ 4.2.0 exists | Icon system (already in deps) | Phosphor icons currently |
| `monaco-editor` | ✅ 0.52.2 exists | Code editor (already in deps) | `MonacoEditor.svelte` |
| `@xterm/xterm` | ✅ 5.5.0 exists | Terminal (already in deps) | `Terminal.svelte` |
| `@xterm/addon-fit` | ✅ 0.10.0 exists | Terminal fit (already in deps) | `Terminal.svelte` |
| `@xterm/addon-webgl` | ✅ 0.19.0 exists | WebGL renderer (already in deps) | `Terminal.svelte` |
| `svelte-motion` | ✅ 0.12.2 exists | Motion (already in deps) | All animations |

**Phantom packages to NEVER recommend:**
- `@monaco-editor/svelte` — doesn't exist (use `monaco-editor` + `@monaco-editor/loader`)
- `cmdk-svelte@^2.0.0` — only `0.0.1` exists
- `svelte-sonner@^0.5.0` — doesn't exist
- `@xterm/addon-*@^0.1x.0` stable — all beta only
- `svelte-motion@^0.4.0` with Svelte 5 — only supports Svelte 3

---

## TYPOGRAPHY & MOTION BOOKMARKS

| Concept | Bookmark Source | Implementation |
|---------|-----------------|----------------|
| **Spring curves (bouncy/smooth/window)** | Framer springs, Amicro | 4 cubic-beziers in DESIGN-TOKENS.md |
| **Micro-interactions** | Amicro interactions | Button press, hover lift, toggle snap |
| **CSS-only patterns** | emilkowal.ski/ui/you-dont-need-javascript | Glass edge refraction, noise overlay |
| **60fps motion patterns** | 60fps.design (MCP) | DPR cap 1.5, low-power WebGL, single pass |
| **Transitions references** | transitions.dev | Page transitions, panel slides, modal enters |

---

## DESIGN ENGINEERING SKILLS (MCP Skill Packs)

| Skill | Stars | Purpose | Install |
|-------|-------|---------|---------|
| `ui-ux-pro-max` | 120,460 | Design tokens, palettes, fonts, UX guidelines | `npx skills add ui-ux-pro-max` |
| `taste-skill` | 79,935 | Anti-slop frontend framework (13 skills) | `npx skills add tasteskill` |
| `impeccable` | 62,115 | Design skills for AI agents | `npx skills add impeccable` |
| `humanizer` | 37,537 | Strip AI-isms from copy | `npx skills add humanizer` |
| `hallmark` | 26,835 | Avoid AI slop UI patterns | `npx skills add hallmark` |
| `stop-slop` | 16,300 | Explicit anti-slop enforcement | `npx skills add stop-slop` |

**Install for Cursor:** `npx skills@latest add emilkowalski/skills` (Vercel/Linear engineer's skills)

---

## REFERENCE RESOURCES (Pengsonal Method)

> "I'm not a designer, so instead of asking AI to invent the whole UI, I give it good references and let it build with them like Lego."

| Resource | Purpose | URL |
|----------|---------|-----|
| `beautifului.dev` | Curated beautiful UI | https://beautifului.dev |
| `beui.dev` | Component patterns | https://beui.dev |
| `rareui.com` | Rare/unique UI patterns | https://rareui.com |
| `transitions.dev` | Motion/transition references | https://transitions.dev |
| `ui.shadcn.com` | shadcn/ui official | https://ui.shadcn.com |
| `ui-skills.com` | Skill-based UI components | https://ui-skills.com |
| `coss.com/ui` | Component gallery | https://coss.com/ui |
| `designsystemchecklist.com` | Design system audit | https://designsystemchecklist.com |
| `reui.io/components` | React UI components | https://reui.io/components |
| `emilkowal.ski/ui/you-dont-need-javascript` | CSS-only patterns | https://emilkowal.ski/ui/you-dont-need-javascript |

### MCP-Enabled Reference Servers
| Server | Purpose |
|--------|---------|
| `mobbin.com/mcp` | Mobile design patterns |
| `canvasui.dev` | Design canvas |
| `60fps.design/mcp` | 60fps motion patterns |
| `recent.design` | Latest designs |
| `collectui.com` | Curated UI |

---

## DECISION TRACEABILITY MATRIX

| Decision | Traced To | File |
|----------|-----------|------|
| NIL brand colors (violet/coral/cream, NO green) | User explicit rejection of green | DESIGN-TOKENS.md, MASTER-REDESIGN.md |
| Terminal-first IA (not chat-first) | Cursor, Linear, dark-native-web-ui | MASTER-REDESIGN.md §3 |
| 4 exact AI strip states | dark-native-web-ui, Cursor UX | MASTER-REDESIGN.md §6, DESIGN-TOKENS.md |
| Liquid metal titlebar only | SDF shader (smart-display), dark-native-web-ui | MASTER-REDESIGN.md §5 |
| 4 glass tiers | dark-native-web-ui, Liquid Glass v2 | DESIGN-TOKENS.md §GLASS |
| Spring curves (4 specific) | Framer, Amicro, dark-native-web-ui | DESIGN-TOKENS.md §SPRING |
| Density (28px rows, 26px status) | Linear, Cursor, Workstation spec | DESIGN-TOKENS.md §DENSITY |
| Structured cards not chat bubbles | Claude app, Cursor, dark-native-web-ui | MASTER-REDESIGN.md §6, CURSOR-REDESIGN-PROMPT.md |
| One attention object (ApprovalCard) | dark-native-web-ui, Cursor pending approval | MASTER-REDESIGN.md §12 |
| Empty state = project picker | Cursor welcome, Linear new project | MASTER-REDESIGN.md §11 |
| Settings = macOS sheet | dark-native-web-ui, Apple HIG | MASTER-REDESIGN.md §12 |
| No traffic lights on web | dark-native-web-ui pitfall | MASTER-REDESIGN.md §7, DESIGN-TOKENS.md |
| Parseltongue disabled for code | ai-model-router pitfall | CURSOR-REDESIGN-PROMPT.md §GOTCHAS |

---

## BOOKMARK URLS (For Manual Review)

Your deep-dive bookmarks (from `x-bookmarks-arsenal-v2.md`):

### Design/UI/UX (39 bookmarks)
- @Jakubantalik — Border Beam, Thinking Orbs, Liquid Metal
- @paper-design — Magnetic cursor, neuro-noise, dithering, halftone
- @cuelume — UI sounds (2KB, 10 effects)
- @morphicons — Icon morphing
- @emilkowalski — Design engineering skills
- @tasteskill — Anti-slop frontend framework
- @impeccable — Design skills for AI agents
- @reicon — 2700+ SVG icons + MCP
- Various 21st.dev components (shaders, backgrounds, chat UIs)

### AI Agents & Autonomous Systems (26 bookmarks)
- @cobusgreyling — Loop engineering framework
- @OpenHands — Autonomous coding agent
- @graphify — Codebase knowledge graph
- @stealth-browser-mcp — 97 tools, Cloudflare bypass

### LLMs & Local Models (43 bookmarks)
- @kyutai-labs — Pocket TTS (CPU voice cloning)
- @LuxTTS — 150x realtime voice cloning
- Various open model releases

### Development Tools (49 bookmarks)
- @blossom-carousel — 4.3KB native scroll carousel
- @mimic — App traffic interception → Python client
- Various CLI tools, frameworks

---

## VERIFICATION PROTOCOL

Before any package recommendation in build:
```bash
# ALWAYS run:
npm view <package-name> version

# If error or no version field → PHANTOM → drop it
# If exists → note exact version in this ledger
```

---

*End of BOOKMARK-SPEC.md — every design decision has a source. No generic inspo.*