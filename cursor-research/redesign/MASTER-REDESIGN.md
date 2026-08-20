# FINN WORKSTATION — FULL REDESIGN SYSTEM (v4)

> **Status:** UNBIASED REDESIGN. Grounded 100% in Arriq's Twitter bookmarks — NOT generic AI web design.
> **Product:** A first-party macOS pentest workstation. Terminal is the soul. Finn is a senior sitting beside the terminal — never the homepage.
> **Why this exists:** v3 had the right bones (tokens, glass, springs) but still read as "AI web app" in the moments that matter. This is the surgical kill of that.

---

## 0. THE ONE-PAGE VERDICT

The v3 shell has good tokens but the WRONG POSTURE. Here's the problem in one line:

**The effects (liquid metal, dither, glass, scanlines) were applied ON TOP of an unresolved information architecture.** The result is a themed web app, not a Mac tool.

Top-tier Mac apps do the reverse: **lock IA and density first, then spend motion budget on a handful of moments.**

### What reads "AI web app" right now (and the bookmark fix for each)

| AI-web-app tell | The bookmark that kills it |
|---|---|
| Chat-first home / "Ask anything" hero | Cursor + Linear: editor IS the product, AI is a pane you summon |
| Fake terminal chrome ($ prompts, green blocks) | Warp: blocks wrap real PTY output, never costume |
| Rounded user pills + avatar columns | Claude app: quiet dark UI, no consumer-chatbot chips |
| Box shadows everywhere / generic gradients | chiefkeef.md anti-slop: **0 box shadows** |
| 44px iPhone hit targets | Linear: 28px sidebar rows, density with calm |
| Linear easing on everything | spring curves: bouncy / smooth / window |
| Emoji empty states (⚡🔧) | Folk: empty states are *actions*, not illustrations |
| Chat bubbles as the AI strip | AiStrip should be structured cards, not user/assistant pills |

### The north star
Open the app → you are inside last engagement's terminal, scope in the sidebar, severity glowing quietly in the inspector. Finn is a 26px bar until you ask. `Cmd+K` does everything. YOLO is always visible, never cute.

---

## 1. WHAT YOUR BOOKMARKS SAY (THE REAL DESIGN LANGUAGE)

### 1.1 Jakub Antalik — your CORE aesthetic
These keep showing up in your bookmarks. They ARE your look:
- **Border Beam** — `beam.jakubantalik.com` — animated boundary beam around elements → engagement cards
- **Thinking Orbs** — `orbs.jakubantalik.com` — animated brainstorm orbs → AI strip loading state
- **Liquid Metal 1.0** — already in harness as WebGL shader → titlebar ONLY
- **Dynamic Boundary Beam** / **Dynamic Thinking Orbs** — Chinese dev, same links

**Rule:** Liquid metal is ONE shared context, titlebar-only. Not wallpaper, not a second WebGL plane.

### 1.2 anti-slop / design quality skills (feed into Cursor prompt)
- **anti-slop** — `npx skills add dmmulroy/anti-slop --skill install-anti-slop`
- **chiefkeef.md** — 724K char doc, 0 box shadows, kills AI-slop design language
- **Google Stitch** — `github.com/google-labs-code/stitch-skills`
- **spec-kit** — `github.com/github/spec-kit` — define reqs/arch/tasks BEFORE coding
- **interfaces.dev/cheat-sheet** — small things to make interfaces better
- **checklist.design** — step-by-step UI component checklist

**THE PROMPT RULE** (every Cursor UI task MUST include):
```
Apply anti-slop rules: 0 box shadows, no generic gradients, no fake metrics,
locked design tokens, verify mobile at 320/375/414/768, WCAG AA contrast, keyboard-first.
```

### 1.3 glassmorphism (Apple Liquid Glass)
- **GlassKit** — 24 components, iOS 26 Liquid Glass inspired, no deps
- **liquid-glass-svelte** — Svelte-native, liquid distortion + dynamic lighting — **USE THIS**
- **@mawtech/glass-ui** — Apple macOS/visionOS dark-first glassmorphism

**Design tokens:** `--glass-1` → `--glass-4` (32-40px blur, 0.45→0.72 opacity) + edge refraction highlight via `::before` gradient + mask-composite.

### 1.4 motion & springs
- **morphicons** — `github.com/guillermolg00/morphicons` — icon→icon morphing, fluid, no deps
- **Framer Motion / svelte-motion** — spring physics, use these curves:
  - `--spring-bouncy: cubic-bezier(0.34, 1.56, 0.64, 1)`
  - `--spring-smooth: cubic-bezier(0.22, 1, 0.36, 1)`
  - `--spring-window: cubic-bezier(0.32, 0.72, 0, 1)`
- **Amicro** — amicro.vercel.app — premium micro-interactions + transitions
- **Shaders v3** — WebGPU shader effects

**Reduced motion:** ALL animations must honor `prefers-reduced-motion: reduce` — disable pointer sheen, freeze flowing metal, keep static glass.

### 1.5 terminal / CLI UX (your Warp/Raycast/Linear inspo)
| Reference | What to steal |
|-----------|---------------|
| **Warp Terminal** | Blocks, AI commands, Agents 3.0 block model |
| **Raycast** | Command palette king, extension ecosystem, HUD, sub-50ms |
| **Linear** | Sidebar density, spring physics, keyboard-first |
| **Cursor** | Settings sheet, command palette, window chrome |
| **Arc** | Sidebar + spaces + spatial memory |
| **Claude (app)** | Chat composer, artifacts, clean dark UI |

---

## 2. INFORMATION ARCHITECTURE (locked FIRST)

### 2.1 Window anatomy
```
┌─ overlay titlebar (liquid metal, native traffic lights) ─────────────────────┐
│  [•••]   acme-corp    10.0.1.5:443    HUNT    SAFE/YOLO              • api  │
├──────────────────┬──────────────────────────────────────────┬────────────────┤
│                  │  view switcher: Terminal · Artifact · Map │                │
│  SPACE           │──────────────────────────────────────────│  INSPECTOR     │
│  sidebar         │                                          │  Findings      │
│                  │           PRIMARY SURFACE                │  Evidence      │
│  Search ⌘K       │     Block terminal (default)             │  Timeline      │
│  Targets         │     or Artifact (report/PoC/note)        │  Notes         │
│  Services        │     or split (⌘\)                        │                │
│  Creds           │                                          │                │
│  Plugins         │──────────────────────────────────────────│                │
│                  │  AI strip (hidden | 26px | 280px pinned) │                │
├──────────────────┴──────────────────────────────────────────┴────────────────┤
│  api · hunt · 10.0.1.5 · last: nmap 0 97s · sandbox ready · YOLO off · v0.3 │
└──────────────────────────────────────────────────────────────────────────────┘
```

Widths: left 240–280px (default 260), inspector 280–320px (default 300), both collapsible. Persist per Space.

### 2.2 Spaces, not pages
An engagement is a **Space** (Arc). Switching Space is the most important animation (horizontal spring, 8% overshoot, ~280ms). Restore per Space:
- Target selection + tree expansion
- Open terminal blocks + scroll
- Inspector tab (findings/evidence/timeline/notes)
- AI strip pin + last thread
- YOLO + mode + split layout

Space switcher lives in sidebar header AND titlebar engagement name AND `Ctrl+1..9` / palette.

### 2.3 Left sidebar — engagement tree
Not site nav. An object tree for the CURRENT Space.
```
[F] acme-corp
⌘K Search…
──────────────────────────────
TARGETS                        +
  ● 10.0.1.5        22,80,443
  ○ api.acme.test   443
  ○ 10.0.1.0/24     scope
──────────────────────────────
SERVICES
  ssh/22   OpenSSH 8.9
  http/80  nginx 1.22
──────────────────────────────
CREDS                          3
PLUGINS                        4
```
Rows 28px, 6px vertical padding, 8px horizontal. Mono for hosts/ports. Active target: 2px green leading edge + 4% white fill. Hover reveals actions. Findings do NOT duplicate here.

### 2.4 Center — primary surface (terminal default)
```
Terminal (⌘T) — Warp block terminal, split capable
Artifact (⌘E) — Claude-style document (report, PoC, code, diff)
Split (⌘\)   — terminal + artifact or terminal + finding
```

**Block terminal:** Each tool run = a block. Approval-gated runs are warning-state blocks with Approve/Edit/Reject in the header — the ONE attention object. The prompt is a composer at the bottom (cwd, shell, multiline, history), not the AI strip.

### 2.5 Inspector — right sidebar
One surface, four tabs, not stacked truncated lists.

| Tab | Role |
|-----|------|
| Findings | Folk list, severity-sorted, Perplexity answer cards |
| Evidence | Loot, screenshots, block bookmarks, Burp imports |
| Timeline | Real events, filter by tool/Finn/user |
| Notes | Running notes + scope editor, Cmd+S |

---

## 3. THE ANTI-REFUSAL UI IS A "SPACES + BLOCKS" DIALOGUE

When Finn runs a command against a model, the result is a **block** — not a bubble. This maps directly to Warp's block model and keeps the terminal-as-soul principle.

### 3.1 The block lifecycle
```
┌ Finn · hunt · gemma4:31b ───────────────────────────────┐
│ "Enumerate subdomains on target"                         │
│                                                           │
│ ┌ nmap -sV 10.0.1.5                          exit 0  97.2s │
│ │ Starting Nmap 7.94 ...                                   │
│ └ [Copy] [Send to Finn] [Save as evidence] [Re-run]       │
└──────────────────────────────────────────────────────────┘
```

### 3.2 The four AI states (in the strip, NOT as the page)
1. **Hidden** — not occupying space. Finn is a status-bar chip.
2. **26px thin** — a slim hint that Finn is awake and sees the Space.
3. **Expanded (280px)** — the composer + last result, contextual.
4. **Pinned** — stays open while you work in terminal/artifact.

### 3.3 Response rendering — structured, not bubbles
Finn's answer is a **structured card**, not a markdown transcript:
```
┌ finn · hunt · gemma4:31b ──────────────────────┐
│ 3 subdomains found                              │
│   api.acme.test   443   nginx/1.22   [nuclei] │
│   dev.acme.test   8080  python      [nmap]   │
│   staging.acme     22   OpenSSH 8.9           │
└────────────────────────────────────────────────┘
```

---

## 4. WHAT THE CURRENT CODE DOES WRONG (CURSOR MUST FIX)

| File | Problem | Fix |
|------|---------|-----|
| `web/src/lib/components/ChatPanel.svelte` | Full Claude-style chat transcript | **Not mounted**. Replace with block cards or refactor into the AI strip structure. |
| `web/src/lib/components/Dock.svelte` | Reserved padding but not mounted | Remove the dock entirely, or restrict to the native overlay |
| `web/src/routes/app/+layout.svelte` | `padding-bottom: 72px` for unmounted dock | Remove; density with calm |
| `web/src/lib/components/Sidebar.svelte` | `selectTarget()` empty; tree not wired | Implement target selection + active chrome |
| `web/src/lib/components/AiStrip.svelte` | Uses user/assistant pills + cards | Convert to structured cards + block rendering |
| Global `button { min-height: 44px }` | iPhone HIG, fights Linear density | Use 28-32px rows / 26px status bar |
| `ChatPanel.svelte` still uses `--accent` | Doesn't theme with v4 tokens | Migrate to `--green` / `--text` |
| New engagement `window.prompt()` | Not a Mac flow | Modal sheet with scope + template chips |
| Empty states with emoji (⚡🔧) | Not on-brand | Action-oriented empty states ("Add first target") |

---

## 5. THE LIQUID METAL SPEC (NOT SHITTY WEB DESIGN)

**Requirement:** liquid metal that is "absolutely fire graphics", not decorative web design.

### 5.1 Technical spec (matches godmod3/Linear-quality)
- **One shared WebGL context** — never a second context per component. A shared `LiquidMetal.svelte` at the titlebar level.
- **No per-pixel canvas each frame.** The metal lives in a single high-res pass, composited once.
- **Jakeian-smoothing via simplex noise FBM.** Not a cheap CSS gradient.
- **Metallic pools + dynamic lighting** (from liquid-metal-svelte).
- **Mouse interaction** — a subtle light follows cursor, but not "the whole bg"
- **Frozen on `prefers-reduced-motion`** — static metal, not flowing.
- **Safari + mobile safe.** If WebGL breaks perf, fall back to static metal SVG/texture.

**Where metal goes:** ONLY the 40px titlebar. That's it. ONE metal surface = identity. Two = demo.

---

## 6. THE COMMAND PALETTE (Raycast-level, the OS of the app)

Empty query → Recents + pinned commands (New engagement, Toggle YOLO, Focus terminal).
```
"acme"       → Space / engagement
"10.0."      → Targets
"sqli"       → Findings
"nmap"       → Plugin + last runs
"> hunt"     → Mode switch (prefix verbs)
"? how do I" → AI ask (handoff into strip, don't trap chat in palette)
```
Every result has a primary action (Enter) + Action Panel (`⌘K` inside palette). Inline shortcuts `⌘1`–`⌘9`, section headers, icons in 22px wells, footer hint row. Esc peels: clear query → close. Drill-in with Enter, back with Esc/Backspace.

---

## 7. ANTI-SLOP CHECKLIST (run before every render)

```
✓ 0 box-shadows (use borders + glass, not drop-shadow)
✓ No generic gradients (only the green → metal titlebar accent)
✓ No fake metrics, no "stats" that aren't real
✓ Locked design tokens (don't invent colors)
✓ Keyboard-first: every primary task has a shortcut printed in the UI
✓ density with calm: 6-8px rows, 1px hairline separators
✓ verify mobile 320/375/414/768
✓ WCAG AA contrast
✓ reduced-motion honored
```

---

## 8. WHAT TO BUILD — PHASE ORDER (Cursor-driven)

### Phase A — Kill the chat-as-home identity
1. Remove `ChatPanel.svelte` from `+layout` if mounted; neutralize
2. Remove Dock padding, unmounted dock, fix sidebars
3. Rename /app to "Workspace" (not "Chat")
4. StatusBar: 26px, status + safety + YOLO
5. EmptyState → action-oriented, not "Ask Finn anything"

### Phase B — Terminal-first workstation
1. Block terminal (wrap xterm/PTY, not fake blocks)
2. Composer at bottom of terminal (cwd, multiline)
3. Approval gate as warning blocks in the terminal
4. Inspector with 4 tabs (Findings/Evidence/Timeline/Notes)
5. Space switcher (Arc-style) + `Ctrl+1..9`

### Phase C — Raycast palette + keyboard-first
1. Command palette with drill-in + Action Panel
2. Focus shortcuts (⌘T terminal, ⌘E artifact, ⌘\ split)
3. Roving tabindex on lists

### Phase D — Liquid metal + dither + glass (ONE shared context)
1. Shared GL liquid metal titlebar only
2. Static SVG grain + dithering (not per-pixel)
3. Glass only where layers overlap

---

## 9. FINAL: THE RESULT

**If a proposed widget does not sit on the diagram below, it does not ship:**
```
          Arc Spaces
              │
              ▼
   Linear density sidebar ──► Cursor overlay chrome
              │
              ▼
     Warp block terminal  ◄──►  Claude artifacts
              │
              ▼
   Perplexity finding cards + Folk lists
              │
              ▼
         Raycast palette (the OS)
              │
              ▼
   Apple Liquid Glass (only at real overlaps)
```
