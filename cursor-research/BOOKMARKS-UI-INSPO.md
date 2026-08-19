# UI / Design / AI Stack Inspiration — From Your Twitter Bookmarks

Pulled from 400 bookmarks (of 2363 total). Categorized for the pentest harness UI + Cursor-IDE remake. All links verified from bookmark data.

---

## 1. CORE DESIGN LIBRARIES (Jakub Antalik — your go-to)

These keep showing up in your bookmarks. You already reference them. For the border-glow / thinking-orb / liquid-metal effects:

- **Border Beam** — `https://beam.jakubantalik.com/` — animated boundary beam around elements
- **Thinking Orbs** — `https://orbs.jakubantalik.com/` — animated thinking/brainstorm orbs
- **Liquid Metal 1.0** — `https://mzcNGMCKT5` — liquid metal UI interaction (you have this in the pentest harness as WebGL shader)
- **Dynamic Boundary Beam** + **Dynamic Thinking Orbs** (Chinese tweet, same links)

**USE:** these are the glowing-border + thinking-orb effects you asked about. Already partially in the harness.

---

## 2. UI COMPONENTS / EFFECTS LIBRARIES

| Library | Link | What it is |
|---------|------|-----------|
| **morphicons** | github.com/guillermolg00/morphicons | Icon → icon morphing, no deps, fluid |
| **cuelume** | cuelume (npm) | 2KB, adds 10 UI sound effects, one attribute per element, no config |
| **uisfx** | uisfx.com | 900+ open-source sound effects |
| **Amicro** | amicro.vercel.app | Premium micro-interactions + transitions (React) |
| **beui.dev** | beui.dev | Animated React components |
| **swiftuijs/ui** | github.com/swiftuijs/ui | SwiftUI-style components for web |
| **mapcn.dev** | mapcn.dev | Free copy-paste map components (React) |
| **aicss.dev** | aicss.dev | AI agent-specific components, 12 ready-to-use snippets |
| **404 Animations** | 404.colorion.co | CSS 404 animations + prompts |
| **interface cheat sheet** | interfaces.dev/cheat-sheet | Small things to make interfaces better |
| **checklist.design** | checklist.design | Step-by-step UI component checklist |

---

## 3. ANTI-SLOP / QUALITY SKILLS (for the AI build prompts)

You've bookmarked several "make AI stop producing slop" tools. These go DIRECTLY into the UI prompts for opencode/cursor:

- **anti-slop** — `github.com/dmmulroy/anti-slop` → `npx skills add dmmulroy/anti-slop --skill install-anti-slop`
- **Google Stitch Design Skills** — `github.com/google-labs-code/stitch-skills` (mentioned in trending)
- **spec-kit** — `github.com/github/spec-kit` — forces AI agents to define requirements/architecture/tasks before writing code
- **chiefkeef.md** — 724K+ char .MD trained to ignore AI-slop design (0 box shadows rule)
- **Sleek** — `github.com/sleekdotdesign/agent-skills` — lets coding agents design mobile apps BEFORE building
- **Google Developer Docs Style Guide** — fix Claude-lish / Chat-lish prose

---

## 4. AI AGENT / CODING STACK (for the IDE remake)

Open models that matter right now (your bookmarks):

- **Qwen3.8-27B** — matches Opus 4.6 Max, runs locally on 17GB RAM/VRAM, open weights
- **Muse Glimmer 30B** — Meta, Apache 2.0, vision, runs on 18GB RAM
- **kimi-k3-in-c** — 2.78T parameter model running on CPU w/ 8.24GB RAM (176KB pure C99 engine)
- **Gemma-4-12B-Coder** — runs locally on potato, real chain-of-thought, passes tests
- **Qwen3 TTS (1.7B Q4_K_M)** — studio-grade voice cloning on CPU, mainline llama.cpp

Free-API / routing references:
- **public-apis** — free APIs for everything
- **free-for-dev** — free tier list
- **coolify** — turn your server into a private Vercel
- **RTK** (rtk-ai) — compress tokens that don't need to be there (context compression)

---

## 5. AGENT-PACK SKILLS (Claude/Cursor/Opencode)

- **Anthropic Cybersecurity Skills** — 817 production-grade security skills (already saved separately, github.com/mukul975/Anthropic-Cybersecurity-Skills)
- **book-to-skill** — convert a technical book PDF into a Claude Code skill
- **Desktop Commander MCP** — desktop control via MCP
- **Open-Kritt** — 2-person security team's AI vuln research system, open-sourced
- **4-agent audit setup** — Anthropic leaked setup, cuts codebase audit from 3 days to 20 min
- **CODE REVIEW GRAPH** — maps codebase so Claude only reads what changed, 100K → ~0 tokens
- **agent-reach** — (you already built this) read X/Reddit/YouTube/GitHub without paying for APIs

---

## 6. WHAT THIS MEANS FOR THE BUILD

**For the pentest harness UI polish:**
- Use the anti-slop rules in the opencode/cursor prompts (already in `prompts/UI-PROMPTS.md`, add `chiefkeef.md` 0-box-shadow rule)
- Border Beam / Thinking Orbs for the glow effects you wanted
- cuelume / uisfx for subtle UI sounds (matches your "Cuelume UI sounds" bookmark)
- morphicons for icon transitions
- interfaces.dev cheat-sheet for density rules

**For the Cursor-IDE remake:**
- Qwen3.8-27B + Muse Glimmer + kimi-k3-in-c as local model backends
- public-apis + free-for-dev for the "gathering free APIs" feature
- spec-kit-style architecture enforcement
- code-review-graph-style token savings
- Desktop Commander MCP for desktop control

---

*Source: DasVR Twitter bookmarks, pulled 2026-08-18. 200 unique of 2363 total.*
