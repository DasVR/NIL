# FINN WORKSTATION — FULL REDESIGN SYSTEM (v5)

> **Status:** Research only — not the living product spec.
> Workstation IA is [`UX_REDESIGN.md`](../../UX_REDESIGN.md) (v3, terminal-first).
> Install, welcome, and per-OS first launch are [`docs/WELCOME.md`](../../docs/WELCOME.md).
> This file is an Agents-window exploration (Claude conversation × Cursor Agents). Do not
> implement it as a chat homepage, and do not let it override the installer catalog.
>
> Historical note: "like Claude, with the UI design of cursor AGENTS."
> **Product (shipped):** A first-party pentest workstation. Finn is a summoned column.
> **Grounded 100% in Arriq's Twitter bookmarks** — NOT generic AI web design.

---

## 0. THE ONE-PAGE DIRECTION

The user's direction, translated:

- **Claude's UI** = quiet, almost no decoration, high-signal typography, deep dark abyss, calm. Chat composer with auto-grow, mode chips, artifacts render in the center. Streaming replaces thinking state.
- **Cursor's AGENTS window** = the AI agent is a first-class panel that plans, runs tools, shows structured output (diffs, terminal blocks, todos), approvals inline, command palette, dense but clean.

**The fusion:** The AI agent (Finn) is the WORKSPACE. You talk to Finn like Claude, but Finn works like Cursor's agent — it plans, runs tools, produces diffs/blocks/findings, asks for approval on commands. The window chrome is Cursor-style (overlay titlebar, palette, settings sheet), the feel is Claude-quiet.

**NOT a "terminal-first where AI is a 26px bar."** That was v4. This is the opposite: **Finn IS the interface.** Terminal and artifacts are what Finn produces beside the conversation.

---

## 1. THE VISUAL MODEL

```
┌─ overlay titlebar (liquid metal, native traffic lights) ─────────────────────┐
│  [•••]   Finn · acme-corp     ⌘K  ● api · HUNT · SAFE/YOLO                │
├──────────────────┬──────────────────────────────────────────┬────────────────┤
│                  │  ⌘K Ask Finn…                              │                │
│  SPACE           │──────────────────────────────────────────│  INSPECTOR     │
│  sidebar         │                                          │  Findings      │
│  targets         │        THE CONVERSATION (Claude-style)    │  Evidence      │
│  services        │     ↳ Finn replies as structured cards    │  Timeline      │
│  creds           │     ↳ tool runs = inline blocks (Cursor)   │  Notes         │
│  plugins         │     ↳ diffs/artifacts beside the talk      │                │
│                  │                                          │                │
├──────────────────┴──────────────────────────────────────────┴────────────────┤
│  api · hunt · 10.0.1.5 · last: nmap 0 97s · sandbox ready · YOLO off · v0.5 │
└──────────────────────────────────────────────────────────────────────────────┘
```

**The conversation is the main surface.** Not a raw terminal. Like Claude. When Finn needs to run a command, it becomes an inline structured block (Cursor agent style) inside the conversation.

### The decisive difference from v4
| v4 (killed) | v5 (this) |
|---|---|
| Terminal-first, AI hidden in a 26px strip | **AI-first**, Finn IS the interface |
| "AI is contextual, never a destination" | **Finn is the destination** — like Cursor's Agents window |
| Fake terminal chrome avoided at all costs | Tool runs render as **clean structured blocks** in the convo (Cursor agent style) |
| Emoji-free empty state "Add first target" | **"What should we do?"** — a Claude-style composer, mode chips, ready to act |

---

## 2. CURSOR AGENTS WINDOW — THE INTERACTION MODEL

This is what makes it feel like Cursor's Agents, not a generic chatbot:

### 2.1 The agent loop, visualized
Every Finn turn shows the **plan → act → verify → summarize** arc:
```
┌ FINN · HUNT ─────────────────────────────────────────────┐
│ ▶ Planning                                                 │
│   "I'll enumerate subdomains, scan the top ports, then    │
│    check the API endpoint for auth bypass."                │
│ ▶ Running                                                     │
│   $ nuclei -l targets.txt -t ~/.finn-tools/nuclei-templates  │
│   [✓ done · 4 results]                                       │
│ ▶ Verified                                                   │
│   ✗ api.acme.test/token  401 auth bypass         [diff]    │
│   ✓ /graphql            introspection enabled    [diff]    │
│ ───────────────────────────────────────────────────────────│
│  [Approve next] [Save as evidence] [Draft report]          │
└────────────────────────────────────────────────────────────┘
```

### 2.2 Structured output, not markdown dumps
Finn doesn't dump raw markdown. It emits **typed blocks** (Cursor-agent style):
- **plan** — numbered steps
- **tool** — a command run + status + output
- **diff** — a proposed change (patch)
- **finding** — a discovered issue with severity
- **artifact** — a draft report/PoC
- **ask** — a clarifying question
- **approval** — a gate awaiting Approve/Edit/Reject

### 2.3 Approvals are Cursor-style
- Finn proposes a tool run → it appears as a **pending block** with Approve / Edit / Reject right in the convo (NOT hidden in a terminal).
- **YOLO** = auto-approve (Cursor's "always allow"), still logged, still a block.
- The pending block is the ONE pulsing attention object.

### 2.4 The composer is the Claude composer
- Auto-grows, mode chips in the chrome (hunt/chat/code/report), stop button, drag-drop files as context.
- `Enter` = send, `Shift+Enter` = newline, `Esc` hides.

---

## 3. WHAT TO KEEP FROM v4 (the good bones)

- **Spaces/engagements** (Arc) — switching Space swaps the whole window state
- **Raycast palette** (`Cmd+K`) — the OS of the app
- **Sidebar density** (Linear 28px), **spring physics**, **keyboard-first**
- **Locked tokens**: abyss #050507, green #00d992, JetBrains Mono + Inter, glass tiers, spring curves
- **One shared liquid-metal titlebar** (WebGL, titlebar only)
- **anti-slop**: 0 box-shadows, no generic gradients, no fake metrics, reduced-motion honored

## 4. WHAT'S KILLED FROM THE CURRENT CODE

| File | v5 fix |
|------|--------|
| `web/src/lib/components/ChatPanel.svelte` | This is ALMOST the model — but it's consumer-chatbot chrome. Rebuild as **Cursor-agent conversation**: plan/tool/diff/finding blocks, not user/assistant bubble pills. |
| `web/src/lib/components/AiStrip.svelte` | **Promote to the main surface.** It becomes the primary view (like Cursor Agents). Remove the "hidden 26px strip" posture. |
| `web/src/lib/components/Dock.svelte` | Not mounted, reserved padding. Remove. |
| `web/src/lib/components/Sidebar.svelte` | Keep, Cursor-style: workspaces, targets, plugins. Fix empty `selectTarget()`. |
| `web/src/lib/components/EmptyState.svelte` | "What should we work on?" — Claude-style composer + mode chips, ready to act. |
| Global 44px button target | 28px inside the conversation chrome. |
| `window.prompt()` new engagement | Cursor/Claude-style sheet. |
| Terminal costume (`$`, green blocks) | Real xterm embedded as a **deployable artifact**, not a fake decoration. |

---

## 4. THE LIQUID METAL + DITHER (STILL FIRE, STILL ONE PLACE)

- **Liquid metal:** ONE shared WebGL context in the **40px titlebar only**. Simplex noise FBM, metallic pools, dynamic lighting, mouse-sheen subtle. Frozen on reduced-motion. NOT wallpaper.
- **Dither/grain:** static SVG grain at 2-3% opacity, 0ms after paint. Never per-pixel canvas.
- **Glass:** only where layers overlap.

**"Absolutely fire graphics" = these three moments, done at AAA quality.** Not effects everywhere.

---

## 5. ANTI-SLOP CHECKLIST (still mandatory)
```
0 box-shadows · no generic gradients · no fake metrics · locked tokens
keyboard-first · density with calm · verify mobile 320/375/414/768
WCAG AA · reduced-motion honored · no emoji empty states · no "as an AI"
```

---

## 6. PHASE ORDER (Cursor-driven)

**Phase A — Make Finn the interface**
1. `AiStrip.svelte` → primary Agent conversation surface (typed blocks, not pills)
2. `ChatPanel.svelte` → refactor into Agent block renderer or remove
3. Remove Dock padding, promote conversation to main surface

**Phase B — Cursor agent interaction model**
1. Typed blocks: plan/tool/diff/finding/artifact/todo/approval
2. Inline approvals (Approve/Edit/Reject) in the convo
3. YOLO = auto-approve, still logged, still a block

**Phase C — Claude chrome**
1. Composer: auto-grow, mode chips, drag-drop, Esc+K
2. Artifacts deployable in center split (report/PoC/diff)
3. Clean dark UI, no consumer-chatbot pills/avatars

**Phase D — keyboard-first + polish**
1. `Cmd+K` palette (Raycast), focus shortcuts
2. Liquid metal titlebar (shared GL), static grain
3. One spring moment, reduced-motion done

---

## 7. THE RESULT

Open the app → you're greeted by a clean Claude-dark composer: **"What should we work on, acme?"** You type a task. Finn plans, runs tools (inline blocks), finds things, asks approval on dangerous ones, drafts the report — all in one flowing agent conversation that feels like Cursor's Agents window in Claude's skin.

**Finn IS the interface. The terminal is a tool Finn deploys. The engagement is the context.**
