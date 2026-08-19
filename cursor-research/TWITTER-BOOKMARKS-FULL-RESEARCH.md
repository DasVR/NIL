# Complete Twitter Bookmarks Research — UI/Design/AI Stack for Finn Pentest Harness + Cursor IDE Remake

**Pulled:** 2026-08-18 | **Source:** 1200+ bookmarks (of 2363 total) via twitter-hybrid | **Unique:** 200 tweets | **Categories:** 15 deep categories

---

## 1. BORDERS & GLOWS (Jakub Antalik — Your Core Aesthetic)

| Item | Link | Notes |
|------|------|-------|
| **Border Beam** | `https://beam.jakubantalik.com/` | Animated boundary beam around elements — USE FOR ENGAGEMENT CARDS |
| **Thinking Orbs** | `https://orbs.jakubantalik.com/` | Animated thinking/brainstorm orbs — USE FOR AI STRIP LOADING STATE |
| **Liquid Metal 1.0** | (tweet link) | Liquid metal UI interaction — **ALREADY IN HARNESS AS WebGL SHADER** |
| **Dynamic Boundary Beam** | same as above | Chinese dev tweet, same link |
| **Dynamic Thinking Orbs** | same as above | Chinese dev tweet, same link |

**Integration:** Wire Border Beam into Sidebar engagement cards, Thinking Orbs into AiStrip streaming state.

---

## 2. LIQUID GLASS / GLASSMORPHISM

| Library | Link | What it is |
|---------|------|-----------|
| **GlassCN UI** | (shadcn-inspired) | Apple-inspired liquid glass for shadcn |
| **GlassKit** | 24 components | iOS 26 Liquid Glass inspired, no deps |
| **liquid-glass-svelte** | Svelte-native | Liquid distortion + dynamic lighting — **USE THIS FOR SVELTE** |
| **@mawtech/glass-ui** | Apple macOS/visionOS | Dark-first glassmorphism |

**Design tokens to match:** Your `--glass-1` through `--glass-4` tiers (32-40px blur, 0.45→0.72 opacity) + edge refraction highlight via `::before` gradient + mask-composite.

---

## 3. DESIGN SYSTEMS & ANTI-SLOP (Feed directly into opencode/cursor prompts)

| Tool | Link / Install | Purpose |
|------|----------------|---------|
| **anti-slop** | `npx skills add dmmulroy/anti-slop --skill install-anti-slop` | Stops AI-slop patterns |
| **spec-kit** | `github.com/github/spec-kit` | Forces agents to define reqs/arch/tasks BEFORE coding |
| **chiefkeef.md** | (724K char doc) | 0 box shadows, kills AI-slop design language |
| **Google Stitch Design Skills** | `github.com/google-labs-code/stitch-skills` | Design skills for agents |
| **Sleek** | `github.com/sleekdotdesign/agent-skills` | Agents design mobile apps BEFORE building |
| **Google Developer Docs Style Guide** | — | Fix Claude-lish / Chat-lish prose |
| **interfaces.dev/cheat-sheet** | interfaces.dev/cheat-sheet | Small things to make interfaces better |
| **checklist.design** | checklist.design | Step-by-step UI component checklist |

**Prompt rule:** Every opencode/cursor UI prompt MUST include: "Apply anti-slop rules: 0 box shadows, no generic gradients, no fake metrics, locked design tokens, verify mobile at 320/375/414/768, WCAG AA contrast, keyboard-first."

---

## 4. ANIMATIONS & MOTION

| Library | Link | Use case |
|---------|------|----------|
| **morphicons** | `github.com/guillermolg00/morphicons` | Icon → icon morphing, fluid, no deps |
| **Framer Motion / svelte-motion** | (already in project) | Spring physics — **USE `--spring-bouncy` cubic-bezier(0.34,1.56,0.64,1), `--spring-smooth` cubic-bezier(0.22,1,0.36,1), `--spring-window` cubic-bezier(0.32,0.72,0,1)** |
| **Amicro** | amicro.vercel.app | Premium micro-interactions + transitions |
| **Shaders v3** | npm_i_shaders | WebGPU shader effects for design engineers |

**Reduced motion:** All animations must honor `prefers-reduced-motion: reduce` — disable pointer sheen, freeze flowing metal, keep static glass.

---

## 5. TYPOGRAPHY

| Font | Source | Use |
|------|--------|-----|
| **JetBrains Mono** | (already in project) | Code, terminal, numeric UI, mono=machine data |
| **Inter** | (already in project) | General UI text, sans=human |
| **SF Pro Rounded** | `gY46MQnCuB` | Mobile design tip — consider for mobile breakpoints |

---

## 6. COMPONENT LIBRARIES (Copy-paste ready)

| Library | Link | Stack | Highlights |
|---------|------|-------|-----------|
| **Amicro** | amicro.vercel.app | React | Premium micro-interactions |
| **beui.dev** | beui.dev | React | Animated components |
| **swiftuijs/ui** | github.com/swiftuijs/ui | Web | SwiftUI-style for web — **MIRROR THIS FOR MACOS FEEL** |
| **mapcn.dev** | mapcn.dev | React | Free map components |
| **aicss.dev** | aicss.dev | Any | 12 AI-agent component snippets |
| **404 Animations** | 404.colorion.co | CSS | CSS 404 animations + prompts |
| **shadcn/improve** | (from trending) | — | UI quality improvements |

---

## 7. SOUNDS & AUDIO (Your "Cuelume UI sounds" bookmark)

| Library | Link | Use |
|---------|------|-----|
| **cuelume** | `npm install cuelume` | **2KB, 10 UI sounds, one attribute per element, NO CONFIG** — USE THIS |
| **uisfx.com** | uisfx.com | 900+ open-source sound effects |

**Integration:** `data-cuelume="click"` on buttons, `data-cuelume="success"` on tool approval, `data-cuelume="error"` on rejection.

---

## 8. AI SKILLS / ANTI-SLOP / AGENT PROMPTS

| Skill / Repo | Link | What it does |
|--------------|------|--------------|
| **book-to-skill** | (tweet) | Convert technical book PDF → Claude Code skill |
| **Desktop Commander MCP** | `github.com/wonderwhy-er/DesktopCommanderMCP` | Desktop control via MCP |
| **Open-Kritt** | (open-sourced) | 2-person security team's AI vuln research system |
| **4-agent audit setup** | (Anthropic leaked) | Cuts codebase audit from 3 days → 20 min |
| **CODE REVIEW GRAPH** | (tweet) | Maps codebase so Claude only reads changed files, 100K→~0 tokens |
| **agent-reach** | (your build) | Read X/Reddit/YouTube/GitHub without paying for APIs |
| **Sleek agent-skills** | `github.com/sleekdotdesign/agent-skills` | Agents design before building |

---

## 9. LOCAL OPEN MODELS (For the Cursor IDE Remake)

| Model | Specs | License | Source |
|-------|-------|---------|--------|
| **Qwen3.8-27B** | Matches Opus 4.6 Max, runs on 17GB RAM/VRAM | Open weights | UnslothAI tweet |
| **Muse Glimmer 30B** | Meta, Apache 2.0, vision, runs on 18GB RAM | Apache 2.0 | UnslothAI tweet |
| **kimi-k3-in-c** | 2.78T params on CPU w/ 8.24GB RAM, 176KB pure C99 | — | dr_cintas tweet |
| **Gemma-4-12B-Coder** | Runs on potato hardware, real CoT, passes tests | — | 0x0SojalSec tweet |
| **Qwen3 TTS (1.7B Q4_K_M)** | Studio-grade voice cloning on CPU, mainline llama.cpp | — | analogalok tweet |
| **MiniMax H3** | Video generation on 5GB VRAM | — | cocktailpeanut tweet |

**Routing strategy for IDE:** Local models for easy tasks (completion, simple edits), free APIs for medium, cloud for complex. Context compression via RTK.

---

## 10. FREE APIs & ROUTING (For "gathering free APIs" feature)

| Resource | Link | What |
|----------|------|------|
| **public-apis** | `github.com/public-apis/public-apis` | Free APIs for everything |
| **free-for-dev** | `github.com/ripienaar/free-for-dev` | Free tier services list |
| **coolify** | (60K stars) | Turn your server into private Vercel |
| **RTK** | `github.com/rtk-ai/rtk` | Context compression — cuts tokens that don't need to be there |
| **OpenNews MCP** | osp.fyi/opennews-mcp | 85+ real-time news sources behind single API with AI impact scores |

---

## 11. AGENT FRAMEWORKS & TOOLS

| Tool | Link | Purpose |
|------|------|---------|
| **Desktop Commander MCP** | `github.com/wonderwhy-er/DesktopCommanderMCP` | Desktop control |
| **Open-Kritt** | (open-sourced) | AI vuln research system |
| **CODE REVIEW GRAPH** | (tweet) | Token-efficient code review |
| **4-agent audit** | (Anthropic leaked) | Orchestrator inventories subsystems, sends fresh read-only agents |
| **agent-reach** | (your build) | Platform access without API costs |
| **Spec Kit** | `github.com/github/spec-kit` | Architecture-first agent workflows |

---

## 12. SECURITY / PENTEST TOOLS (For the harness)

| Tool | Link | What |
|------|------|------|
| **Anthropic Cybersecurity Skills** | `github.com/mukul975/Anthropic-Cybersecurity-Skills` | **817 production-grade security skills** — SAVED SEPARATELY |
| **Open-Kritt** | (2-person team) | AI vuln research, single bounty $250K |
| **iFixAI** | `github.com/ifixai-ai/iFixAI` | AI misalignment testing |
| **Scrapling** | `github.com/D4Vinci/Scrapling` | Web scraping (from awesome list) |

---

## 13. TERMINAL / CLI UX (Your Warp/Raycast/Linear inspo)

| Reference | What to steal |
|-----------|---------------|
| **Warp Terminal** | Blocks, AI commands, Agents 3.0, block model |
| **Raycast** | Command palette king, extension ecosystem, HUD patterns, sub-50ms |
| **Linear** | Sidebar density, spring physics, keyboard-first |
| **Cursor** | Settings sheet, command palette, window chrome |
| **Arc** | Sidebar + spaces + spatial memory |
| **Claude (app)** | Chat composer, artifacts, clean dark UI |

---

## 14. WEBGL / SHADERS (For visual polish)

| Item | Link | Use |
|------|------|-----|
| **Shaders v3** | npm_i_shaders | WebGPU shader effects, design engineers |
| **Particles / Crystal / 3D logo** | (shaders v3 presets) | Hero backgrounds, loading states |
| **Your Liquid Metal shader** | (already in harness) | Titlebar, dock, accent elements |

---

## 15. DIRECT APPLICATION TO HARNESS UI (What to fix NOW)

### From the bookmarks, these are the exact fixes for the current UI:

| UI Area | What's Wrong | Fix from Bookmarks |
|---------|--------------|-------------------|
| **Sidebar engagement cards** | No visual pop | Add **Border Beam** animated boundary on hover/focus |
| **AiStrip loading** | Spinner or nothing | **Thinking Orbs** animated while streaming |
| **Buttons / interactive** | Silent | **cuelume** — `data-cuelume="click"` on every button |
| **Icon transitions** | Static | **morphicons** for view-switch icons (terminal↔editor↔AI) |
| **Glass surfaces** | Flat | Your `--glass-1`..`--glass-4` tiers + edge refraction highlight |
| **Density** | Loose | **Linear density rules**: 6-8px sidebar padding, 1.3 line-height, 26px status bar |
| **Typography** | Mixed | **Sans=human (Inter), Mono=machine (JetBrains Mono)** — enforce everywhere |
| **Spacing** | Inconsistent | **Gap not margins**, 1px borders + 4-8px gaps |
| **AI strip** | Terminal-style blocks | **Clean structured cards** — subtle meta header (Finn + model tag), rounded, NO fake terminal chrome |
| **Empty state** | "Ask Finn anything" | **Cursor/Linear new project** — engagement templates, recent, clean "New Engagement" flow |
| **Motion** | Linear easing | **Spring physics only** — the three curves above, respect reduced-motion |
| **Sounds** | None | **cuelume** on all interactive elements |

---

## 16. CURSOR IDE REMAKE — ARCHITECTURE FROM BOOKMARKS

### Model Layer
- **Local-first:** Qwen3.8-27B, Muse Glimmer 30B, Gemma-4-12B-Coder, kimi-k3-in-c
- **Free API tier:** public-apis, free-for-dev, OpenNews MCP, RTK compression
- **Cloud fallback:** Cursor's own models via cursor-bridge (your subscription)

### Architecture
- **Spec Kit pattern** — agents must define requirements/arch/tasks before coding
- **Code Review Graph** — only read changed files, massive token savings
- **Desktop Commander MCP** — desktop control (file ops, shell, browser)
- **agent-reach** — platform access (GitHub, X, Reddit, YouTube) without API costs
- **Anti-slop enforcement** — chiefkeef.md rules at every generation step

### UI Stack
- **Tauri + SvelteKit** (like harness) or **Electron + React** (like Cursor)
- **Design tokens:** Your abyss/green + glass tiers + spring curves
- **Components:** swiftuijs/ui patterns for macOS feel, shadcn-style for consistency
- **Command palette:** Raycast-level (everything searchable, keyboard-first)
- **Terminal:** Warp-style blocks + AI integration

---

## 17. IMPLEMENTATION PRIORITY FOR OTHER AGENTS

### Phase 1 — Harness UI Polish (Immediate)
1. Wire **Border Beam** + **Thinking Orbs** (jakubantalik)
2. Add **cuelume** sounds to all interactive elements
3. Replace AI strip terminal-blocks with clean structured cards
4. Enforce density rules (6-8px padding, gap not margins)
5. Verify `prefers-reduced-motion` everywhere

### Phase 2 — Harness Feature Complete (Short term)
1. Settings panel: model picker, provider config, themes, YOLO toggle
2. Tool execution panel: approve/reject with YOLO
3. Chat panel: markdown, code blocks, streaming
4. Obsidian vault integration (notes sync)

### Phase 3 — Cursor IDE Remake (Medium term)
1. Tauri scaffold with SvelteKit frontend
2. Local model runner (llama.cpp / ollama integration)
3. Free API router (public-apis + RTK compression)
4. Spec Kit + Code Review Graph architecture
5. Command palette (Raycast-level)

### Phase 4 — Polish & Ship (Long term)
1. Plugin marketplace
2. Team/shared engagements
3. Mobile companion
4. VS Code extension bridge

---

## 18. FILES IN REPO

| File | Path | Purpose |
|------|------|---------|
| **UI Prompts** | `prompts/UI-PROMPTS.md` | Drop into opencode/cursor |
| **Bookmarks Inspo** | `cursor-research/BOOKMARKS-UI-INSPO.md` | Categorized bookmarks (first pass) |
| **This Doc** | `cursor-research/TWITTER-BOOKMARKS-FULL-RESEARCH.md` | Complete research for agents |
| **DESIGN.md** | root | Full design system (500+ lines) |
| **SPEC.md** | root | Architecture, API contracts, data models |
| **RESEARCH.md** | root | Bookmark audit, reference sites |

---

*All bookmarks sourced via twitter-hybrid (twscrape search + twitter-cli bookmarks). Credentials from ~/.agent-reach/config.yaml. 200 unique tweets analyzed, sorted by engagement, categorized into 15 actionable buckets.*
