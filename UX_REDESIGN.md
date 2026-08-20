# Finn Workstation — UI/UX Redesign Plan (v3)

> **Status:** Implemented as v1.1.1 (`APP_TAG = v1.1.1`). `/app` is the Space workstation. This file remains the IA source of truth.
> **Product:** A first-party macOS pentest workstation that happens to have the best AI operator sitting next to you.
> **Rule:** The engagement is the product. Finn is a senior sitting beside the terminal — never the homepage.

This document is the plan to completely rebuild the desktop/web UI. It is grounded in:

1. Current design docs (`DESIGN.md`, `docs/history/design-v1.md`, `SPEC.md`, historical `RESEARCH.md` UI chapter)
2. A code-level review of `web/` + Tauri chrome
3. Apple HIG for macOS 26/27 (Liquid Glass, concentric windows, edge-to-edge sidebars)
4. The twelve apps this product was originally pulled from

Implementation PRs land against this file. When a phase ships, fold the relevant section into `DESIGN.md`.

---

## 0. Verdict in one page

The v2 shell is pointed the right way and still does not feel like a product.

`DESIGN.md` v2 correctly killed chat-as-home and specified a three-pane terminal workstation. The code started that migration (`web/src/routes/app/+layout.svelte`, `AiStrip.svelte`, `StatusBar.svelte`) and then stopped halfway. The result is two products occupying one window:

| Direction A (orphaned, still in tree) | Direction B (partially shipped) |
|---|---|
| Claude / HackerAI chat workspace | Cursor / Linear / Burp workstation |
| `ChatPanel.svelte`, `Dock.svelte` | 3-pane layout, AI strip, status bar |
| "Ask anything about your scope" | "Terminal is the soul" |
| Dock padding still reserved in CSS | Dock is not mounted |
| `/app` labelled **Chat** in the titlebar | `/app` renders a terminal |

That split is why the UI feels like a themed web app instead of a Mac tool. Effects (liquid metal, dither, scanlines, glass) were applied on top of an unresolved information architecture. Top-tier Mac apps do the reverse: lock IA and density first, then spend motion budget on a handful of moments.

**The redesign is not a new theme.** It is a new product shape:

- Engagements become **Spaces** (Arc)
- The center pane is a **block terminal** (Warp) that can split into editor / report artifacts (Claude)
- Everything is reachable from **one palette** (Raycast)
- Sidebars are **dense, dim, and spatial** (Linear + Cursor)
- Findings are **sourced answer cards** (Perplexity), not markdown dumps
- Lists are **rewarding to scan** (Folk)
- The Mac window is **native chrome**, not a CSS traffic-light costume
- Marketing is **bold and product-true** (Wegonorth + Framer), not three feature cards

---

## 1. What the docs already decided (and contradicted)

### 1.1 Design lineage

| Doc | What it actually says | What shipped |
|---|---|---|
| Historical `RESEARCH.md` (Aug 13) | Apple HIG springs, Jakub Antalik effects, Mac dock, **chat bubbles**, clarifying questions about scope | Effects components + chat-first instinct |
| `docs/history/design-v1.md` | Full macOS costume: traffic lights, dock magnification, chat bubbles, dither, scanlines, liquid metal everywhere | Partial: Dock, WindowChrome, LiquidMetal, ChatPanel |
| `DESIGN.md` v2 | Terminal-first 3-pane, AI strip with 4 states, Raycast palette, kill chat-as-home | Partial shell. AI strip still uses user/assistant bubbles. Palette is substring filter. |
| `SPEC.md` | Dual TUI + desktop; Phase 4 still lists "chat bubbles with markdown" | TUI is still a chat Log + "Message the copilot…" |
| Current `RESEARCH.md` | Anti-refusal / model research. UI chapter was overwritten. | No living UI research in-repo until this file |

The original clarifying questions in research were never closed in a spec:

- Desktop vs web-first → both, one Svelte UI
- Liquid metal → yes, but should be one shared context, titlebar-only
- Chat vs pages → v2 said workspace views; code still has eight routes
- First build → layout was built, then effects, then neither was finished

### 1.2 Code review — concrete gaps

These are in the tree today. They are the reasons a reskin would fail.

**Identity conflict**

- `WindowChrome.svelte` maps `/app` → label `Chat`.
- `Dock.svelte` (unmounted) still has Chat as item 0.
- `ChatPanel.svelte` is a full Claude-style transcript with "Ask anything about your scope" — unused by routes, still the highest-effort UI file in the repo.
- `AiStrip.svelte` claims "not chat bubbles" and then renders user pills + assistant rounded cards.
- Settings help text still says `Cmd+J` = new chat. Layout uses `Cmd+J` = toggle AI strip.

**Shell bugs and leftovers**

- App layout adds `padding-bottom: 72px` for a dock that is not rendered (`has-dock`).
- `Cmd+Shift+B` never fires: the handler checks `ev.key.toLowerCase() === 'shift'` on a keydown whose `key` is `b`.
- `selectTarget()` in `Sidebar.svelte` is empty. Active-target chrome in the titlebar cannot be driven from the tree.
- New engagement uses `window.prompt()`.
- `activeView === 'editor'` is a button with no editor. Monaco is specified, not present.
- Findings live in the left sidebar *and* the right sidebar *and* `/app/findings`.

**Density vs HIG mismatch**

- Global `button { min-height: 44px }` is iPhone HIG. Linear/Cursor sidebars are 28–32px rows. Every toolbar control currently fights the density rules in `DESIGN.md` §2.3.
- Token split: `app.css` uses `--green` / `--text`. `ChatPanel.svelte` / `Dock.svelte` still use `--accent` / `--text-primary`. Half the orphaned files would not even theme correctly if remounted.

**Native Mac window**

- Tauri `decorations: true`, `transparent: false`, no `titleBarStyle: "overlay"`, no vibrancy. Custom CSS titlebar sits *inside* the system titlebar. Double chrome on macOS; fake-native on web.
- Traffic lights were correctly removed (`197458e`) after looking wrong. Nothing replaced them with overlay + native controls.

**Motion and materials**

- Springs are CSS cubic-beziers, not a solver. Linear/Framer-quality motion needs mass/stiffness/damping with interruptible velocity.
- `LiquidMetal.svelte` creates its own WebGL context (v1 shader, not the shared-context rule in `DESIGN.md`).
- `DitherOverlay.svelte` can write per-pixel noise on a canvas every frame — the opposite of the "static SVG grain, 0ms after paint" spec.
- Glass is painted on sidebars that sit on solid `--abyss`, so blur has nothing to refract. Glass without overlap is just a muddy fill.

**Secondary pages**

- `/app/settings` is a crude form. `SettingsPanel.svelte` is a better sheet. Two settings surfaces.
- `/app/notes` splits notes on blank lines and assigns `crypto.randomUUID()` every derive — list keys thrash.
- Empty states use emoji (`⚡`, `🔧`).
- Tools page has `const toolRuns = $derived({})` — dead.

**TUI**

- Still chat-primary (`Log` named chat, composer "Message the copilot…"). Desktop v2 and TUI have drifted apart, violating `SPEC.md`'s "same data, same shape."

---

## 2. Research — macOS, then the twelve apps

### 2.1 Common language of great Mac apps (2026)

From Apple HIG / WWDC25–26 (macOS 26 Tahoe Liquid Glass → macOS 27 Golden Gate refinements) plus the apps operators actually live in (Cursor, Linear, Raycast, Arc, Warp, Things, Craft, Xcode, Burp).

| Pattern | What it means for Finn |
|---|---|
| **Split view, not a website** | `NSSplitViewController` analog: sidebar + content + inspector. Sidebars are edge-to-edge (macOS 27), inspectors are edge-to-edge glass beside content. No floating in-app Dock. |
| **Overlay titlebar** | Content goes under the traffic lights. Title is the document (engagement), not the app name. Double-click to zoom. No CSS traffic lights. |
| **Toolbar floats on glass** | A thin grouping of controls above content, not a second titlebar. Adapts to what's underneath. |
| **Concentric corners** | Window radius and inner panel radii related, not 14px on everything. Controls inset from the window curve. |
| **Sidebar recedes** | Linear 2024/25: nav is a few notches dimmer than the work surface. Selection is semi-bold + color icon, not a loud fill. |
| **Keyboard is the GUI** | If a mouse is required for a primary task, the IA is wrong. Palette, then arrows, then Enter. Esc always peels one layer. |
| **Materials are layered, not wallpaper** | Glass only where two layers overlap. Vibrancy on macOS via `NSVisualEffectView`. Solid `--abyss` fallback elsewhere. |
| **One attention object** | One beam, one live status, one pending approval. Two pulsing greens is noise. |
| **State restoration** | Spaces remember sidebar widths, inspector tab, terminal scroll, AI pin. Launching the app returns you to the engagement, not an empty chat. |
| **Density with calm** | 6–8px sidebar rows. 11px micro labels. 1px separators at 8% white. Type and space create hierarchy, not cards-in-cards. |

**Do not copy iOS.** 44px hit targets, tab bars, and sheets-from-bottom are wrong for a 1280×800 workstation. Touch is a companion layout at `≤1024px`, not the default.

### 2.2 What we take from each reference (and what we refuse)

#### Cursor IDE — settings sheet, command palette, window chrome

**Take**

- The *editor* (for us: terminal + artifacts) is the product. AI is a pane you summon.
- Overlay chrome: traffic lights, then project name, then a compact toolbar. No app-name hero.
- `Cmd+,` is a **sheet** over the workspace (searchable, left-rail categories), never a route that unmounts the terminal.
- `Cmd+P` jumps to a thing (file / for us: host). `Cmd+Shift+P` / `Cmd+K` runs a command. Separate "go to" and "do".
- Agent output is structured (diffs, terminals, todos) — not a bubble transcript as the main view.

**Refuse**

- VS Code chrome density without VS Code's information. Empty 8-icon activity bars.
- Making the Agents Window the default. Cursor's own users fight this. Finn already made that mistake as Chat-home.

#### Linear — sidebar density, spring physics, keyboard-first

**Take**

- Sidebar is dimmer than the canvas. Structure is felt (soft 1px rules), not seen (heavy borders).
- Springs with real mass. Issue rows *land*. Command bar drops like a rail-mounted drawer. Interruptible.
- `C` / `X` / `Cmd+K` muscle memory. Every list is arrow-navigable with a roving tabindex.
- Icon restraint. Color only for status (severity, YOLO, live scan).

**Refuse**

- Project-management metaphors (cycles, estimates, boards) painted onto pentest objects.
- Softening springs "to feel enterprise." This app should feel machined.

#### Raycast — command palette as a product

**Take**

- Root search is the OS of the app. Apps, commands, files, AI — one field, fuzzy, recents on empty query.
- Every result has a **primary action** (Enter) and an **Action Panel** (Cmd+K *inside* the palette, or `⌘↵` secondary).
- Inline shortcuts (`⌘1`…`⌘9`), section headers, icons in 22px wells, footer hint row.
- Esc peels: clear query → close. Drill-in with Enter, back with Esc/Backspace.
- HUD toasts for silent success (copied, approved, YOLO on) — not modal alerts.

**Refuse**

- Turning Finn into a launcher that lives outside the engagement. The palette serves the open Space.

**Finn mapping**

```
Empty query     → Recents + pinned commands (New engagement, Toggle YOLO, Focus terminal)
"acme"          → Engagement / Space
"10.0."         → Targets
"sqli"          → Findings
"nmap"          → Plugin + last runs
"> hunt"        → Mode switch (prefix verbs)
"? how do I"    → AI ask (handoff into strip, do not trap a chat in the palette)
```

#### Arc browser — sidebar + spaces + spatial memory

**Take**

- **Spaces = engagements.** Switching Space swaps the whole window: pinned targets, unpinned scratch hosts, theme tint, terminal session, inspector tab, AI context.
- Vertical sidebar with stable positions. Operators remember "that Jenkins box is third from the top."
- Swipe / `Ctrl+1..9` to change Space. Peek on hover (host summary, last scan, open ports).
- Split view as a first-class layout (terminal | finding detail, terminal | artifact).

**Refuse**

- Per-Space wallpaper chaos. One abyss. A *subtle* green/metal tint on the titlebar when a Space is active is enough.
- Tab overload. A Space contains targets and views, not 40 web tabs.

#### Warp terminal — blocks + AI in the stream

**Take**

- Each command is a **block**: prompt, command, status chip (exit, duration, tool), collapsible output, copy/share/send-to-Finn actions.
- Input is a real editor (multiline, cursor, completions), not a hidden xterm prompt only.
- AI suggests / explains *the selected block*, not the whole buffer.
- Search within a block. Bookmark a block to a finding as evidence.

**Refuse**

- Replacing the shell. Blocks wrap `xterm`/PTY output; they do not invent a toy terminal.
- AI as the prompt. The prompt is the operator. Finn is `Cmd+J` or a block action.

#### Claude (app) — composer, artifacts, clean dark UI

**Take**

- Composer: auto-grow, mode chips in the chrome (hunt/chat/code/report), stop button, drag-drop as context — **in the strip**, not as the page.
- **Artifacts**: report drafts, PoCs, finding write-ups, graphs render in the center split, beside the terminal. Iterate in place.
- Dark UI that is quiet. Almost no decoration. High signal typography.
- Streaming that replaces a thinking state rather than stacking bubbles forever.

**Refuse**

- Full-height chat as home.
- Rounded user pills and avatar columns. Those read as "consumer chatbot."
- Follow-up chip spam under every message.

#### Folk — CRM-ish lists

**Take**

- Lists you enjoy scanning: 1px hairline, hover-revealed actions, person/host as the row hero, meta in mono on the right.
- Keyboard: `j`/`k`, Enter to open, `e` to edit. Multi-select with Shift.
- Empty states are *actions* ("Add first target") not illustrations.

**Refuse**

- Pastel CRM playfulness. Keep abyss + phosphor. Steal the *interaction*, not the brand.

#### Sana — AI workspace feel

**Take**

- Calm workspace: one question, structured answer, sources, next action. Knowledge feels *filed*, not dumped.
- AI output is a document you keep (notes/findings), not a scroll you lose.

**Refuse**

- LMS/course energy. This is an engagement, not a classroom.

#### Perplexity — answer cards with sources

**Take**

- A finding is an **answer card**: claim, severity, affected asset, evidence links, citations (tool output blocks, loot, notes).
- Right rail = sources / evidence. Center = the finding. Chrome recedes.
- Anti-animation on reading surfaces. Motion is for chrome, not for prose.

**Refuse**

- Consumer search landing. No "Ask anything" hero inside the workstation.

#### Qatalog — team/OS navigation

**Take**

- The app as a small OS: universal search, consistent object types, everything has a place in a graph (engagement → host → service → finding → evidence).
- Navigation by object, not by "pages named after database tables."

**Refuse**

- Enterprise work-graph chrome. No extra products (goals, OKRs, home dashboards).

#### Framer — motion + presentation quality

**Take**

- Motion is craft: appear from the originating control, 8% max overshoot, GPU only (`transform`/`opacity`).
- Marketing and product share a visual language. The landing page should look like a still from the app, not a generic SaaS kit.
- Breakpoints as composed layouts, not scaled padding.

**Refuse**

- Decorative looping hero blobs. One metal titlebar is identity; a second WebGL plane is a demo.

#### Wegonorth — hero + bold type

**Take**

- Marketing: oversized type, one sentence that is the product, a single primary CTA, editorial spacing.
- Hero is the workstation frame (real chrome, real terminal snippet), not an isometric illustration.

**Refuse**

- Agency-portfolio maximalism inside the app. Bold type is for `/` and `/download`. Inside `/app`, Inter 13 / Mono 12.

### 2.3 Synthesis — the Finn hybrid

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

If a proposed widget does not sit on this diagram, it does not ship.

---

## 3. North star

Feel like a first-party macOS developer tool that pentest operators cannot put down.

Open the app → you are inside last engagement's terminal, with scope in the sidebar and severity glowing quietly on the inspector. Finn is a 26px bar until you ask. `Cmd+K` can do anything. YOLO is always visible and never cute.

**Awe in 5 seconds comes from:**

1. Native window (overlay titlebar, correct traffic-light inset, metal only in that 40px)
2. A live block terminal, not an empty chat
3. One perfect spring (palette or Space switch)
4. A critical finding already sitting in the inspector if one exists

Not from scanlines, not from a bouncing dock, not from "Message Finn…"

### 3.1 Principles

1. **Terminal is the soul.** Every other surface is a lens onto hosts, commands, and evidence.
2. **Spaces, not pages.** Routes may exist internally; the user moves between objects in one window.
3. **Keyboard is faster than the mouse.** Every primary task has a shortcut that is printed in the UI.
4. **AI is contextual.** Hidden → thin → expanded → pinned. Never a destination.
5. **Density with calm.** Linear numbers. Inter for humans, JetBrains Mono for machines.
6. **Materials are honest.** Glass refracts content. Metal is the titlebar. Abyss is the work surface.
7. **One attention object.** Pending approval, live scan, or critical finding — pick one to pulse.
8. **Performance is a feature.** 60fps on a 2020 Air. Shared GL. Frozen metal on reduced motion.
9. **Native where the OS already solved it.** Overlay titlebar, vibrancy, menu bar, sheets.
10. **Same shape on TUI.** Three panes, terminal-first, same shortcuts (Ctrl where Cmd).

### 3.2 Explicitly not

- A dark-themed chatbot with a terminal widget
- A Mac-skin over eight CRUD pages
- An effects demo (dither/scanline/beam as identity)
- iOS-first touch layout
- A VS Code fork with a green accent

---

## 4. Information architecture

### 4.1 Window anatomy

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

### 4.2 Spaces (engagements)

An engagement is a Space. Switching Space is the most important animation in the app (horizontal spring, 8% overshoot, ~280ms). State restored per Space:

- Target selection and tree expansion
- Open terminal blocks + scroll position
- Inspector tab (findings / evidence / timeline / notes)
- AI strip pin + last thread
- YOLO + mode
- Split layout

Space switcher lives in the sidebar header (Arc-style icon row or compact select) **and** in the titlebar engagement name (click → list) **and** in `Ctrl+1..9` / palette.

Creating a Space is a **modal sheet** (name, scope paste, template chips). Never `prompt()`.

### 4.3 Left sidebar — engagement tree

Not a site nav. An object tree for the *current* Space.

```
[F] acme-corp                         [ ]
⌘K Search…
────────────────────────────────────
TARGETS                         +
  ● 10.0.1.5        22,80,443
  ○ api.acme.test   443
  ○ 10.0.1.0/24     scope
────────────────────────────────────
SERVICES
  ssh/22   OpenSSH 8.9
  http/80  nginx 1.22
────────────────────────────────────
CREDS                           3
PLUGINS                         4
```

Rules:

- Rows 28px, 6px vertical padding, 8px horizontal. Mono for hosts/ports.
- Active target: 2px green leading edge + 4% white fill. Optional 8% metal sheen, not a second WebGL surface.
- Hover reveals: copy, add to scope, ask Finn, run nmap.
- Findings do **not** duplicate here. Severity badges can live on the host row (`2H` / `1C`).
- Plugins open a **popover** to run against the selected target, output lands as a terminal block. `/app/tools` ceases to be a place you "go."

Collapsed (72px): icons + Space mark. `Cmd+B`.

### 4.4 Center — primary surface

Three interchangeable views, same chrome:

| View | Shortcut | Content |
|---|---|---|
| Terminal | `Cmd+T` | Warp-style block session for this Space |
| Artifact | `Cmd+E` | Claude-style document (report, PoC, note, generated graph) |
| Split | `Cmd+\` | Terminal + artifact or terminal + finding |

Default on Space open: Terminal.

**Block terminal**

Each tool run / shell command is a block:

```
┌ nmap -sV -sC 10.0.1.5                          exit 0  97.2s  [Approve was YOLO]
│ Starting Nmap 7.94 ...
│ ...
└ [Copy] [Send to Finn] [Save as evidence] [Re-run] [Collapse]
```

Pending commands (approval gate) are blocks in a warning state with Approve / Edit / Reject in the block header — the primary attention object. YOLO auto-runs and still creates the block.

The prompt is a composer at the bottom of the terminal (not the AI strip): cwd, shell, multiline, history. xterm.js remains the output renderer inside the block body (fit addon, token theme).

**Artifacts**

Opened by: Finn "Draft report", user `Cmd+E`, or clicking a finding's write-up. Types: markdown report, code (Monaco), diff, mermaid. Saved into the engagement folder. This replaces the giant unused `ChatPanel` artifact cards *and* gives Monaco a real job.

### 4.5 Inspector — right sidebar

One surface, four tabs, not three stacked truncated lists.

| Tab | Role |
|---|---|
| Findings | Folk list, severity-sorted. Click → finding card in center or peek in inspector. |
| Evidence | Loot, screenshots, block bookmarks, Burp imports. |
| Timeline | Real events (not a raw markdown `<pre>`). Filter by tool / Finn / user. |
| Notes | Running notes + scope editor. `Cmd+S` saves. |

`Cmd+Shift+B` toggles. Default open on ≥1440px, closed on smaller.

**Finding card (Perplexity pattern)**

```
CRITICAL  9.8  CVE-2024-…                    10.0.1.5:443
Unauthenticated RCE in vendor panel
────────────────────────────────────
Why it matters     (prose, Inter)
Evidence           (links to blocks, loot hashes, request/response)
Remediation        (prose)
────────────────────────────────────
[Explain] [Draft report section] [Copy] [Export]
Sources    nmap#12   nuclei#3   note:auth-bypass
```

Explain / Draft summon the AI strip with the finding as context. They do not navigate to Chat.

### 4.6 AI strip — four states (keep, make real)

v2 specified this. Implement it without bubbles.

| State | Height | When |
|---|---|---|
| Hidden | 0 | Default. No recent Finn activity, not pinned. |
| Thin | 26px | Finn working, or last line after collapse. Status text + phosphor dot. |
| Expanded | 280px (drag 200–50vh) | `Cmd+J`, high-signal event, Explain/Draft. |
| Pinned | Expanded persists | Pin control / `Cmd+Shift+J`. localStorage per Space. |

**Content model (not chat):**

- Operator turns: right-aligned plain text, no pill.
- Finn turns: **structured blocks** — paragraph, command proposal, finding draft, table, artifact offer.
- Command proposal block = the same component as a pending terminal block (Approve / Edit / Reject).
- No avatars. No follow-up chip rows. A single composer: placeholder "Ask Finn about this Space" — never "Message Finn…" / "Ask anything."

Streaming: thinking orbs (8px, green) + status live region. Reduced motion: static dot.

### 4.7 Command palette — Raycast-level

`Cmd+K` global. Glass-3, 580px, 10vh from top, spring-snappy.

Must-haves vs today:

| Today | v3 |
|---|---|
| `label.includes(q)` | Fuzzy (weighted: name > host > body), match highlighting |
| Flat list | Sections: Recents, Spaces, Targets, Findings, Tools, Commands |
| Enter only | Enter primary, `⌘↵` secondary, `⌘K` or `→` Action Panel |
| No recents | Empty query = recents + pinned |
| `goto('/app/findings')` | Select object in current window (no route bounce) |
| Static 11 commands | Generated from plugins, pending runs, findings, YOLO, modes |

Footer: `↑↓` `↵ run` `⌘↵ alt` `esc`.

### 4.8 Settings — one Cursor-style sheet

Kill `/app/settings` as a page. `Cmd+,` opens the existing sheet idea, rebuilt:

Categories: Appearance, Terminal, Palette & shortcuts, Models & providers, Accessibility, Advanced (API base).

Live preview on appearance. Providers stay here (the only reason the settings *page* existed).

### 4.9 First-run / empty Space

Not a chatbot empty state.

Wegonorth-quiet: engagement name field, scope textarea, four templates as **rows** (not a marketing grid), recent Spaces below. After create → terminal with a first block: `scope loaded · 3 hosts · press ⌘K to scan`.

### 4.10 Kill the route-as-app model

Keep URLs for deep links (`/app/s/acme-corp`, `/app/s/acme-corp/finding/…`) but **do not unmount the terminal** to show findings/tools/notes. Those are inspector tabs or center views.

| Current route | Fate |
|---|---|
| `/app` | Space workspace (terminal default) |
| `/app/findings` | Redirect → inspector Findings + optional center card |
| `/app/notes` | Inspector Notes |
| `/app/tools` | Palette + sidebar Plugins popover |
| `/app/creds` | Sidebar section + inspector peek |
| `/app/reports` | Artifact view (report) |
| `/app/loot` | Inspector Evidence |
| `/app/settings` | Sheet only |

Dock component: delete from the workstation (keep out of `/app`). Do not remount it.

### 4.11 Keyboard map (canonical)

| Shortcut | Action |
|---|---|
| `Cmd+K` | Palette |
| `Cmd+P` | Go to target/host |
| `Cmd+J` | Toggle AI strip |
| `Cmd+Shift+J` | Pin AI |
| `Cmd+,` | Settings sheet |
| `Cmd+B` | Left sidebar |
| `Cmd+Shift+B` | Inspector |
| `Cmd+Y` | YOLO |
| `Cmd+N` | New Space sheet |
| `Cmd+T` | Focus terminal / new block |
| `Cmd+E` | Artifact view |
| `Cmd+\` | Split |
| `Cmd+1/2/3` | Focus left / center / inspector |
| `Cmd+Enter` | Approve top pending command |
| `Cmd+Shift+Enter` | Reject top pending |
| `Ctrl+1..9` | Switch Space |
| `j` / `k` | Move in focused list |
| `Esc` | Peel one layer |
| `Cmd+S` | Save notes / artifact |

Print these in the palette footer, settings Keyboard tab, and as `kbd` on hover for icon buttons. Fix the current `Cmd+Shift+B` handler.

---

## 5. Visual system

Keep the identity. Stop spraying it.

### 5.1 Tokens (lock, one namespace)

```css
:root {
  --abyss: #050507;
  --abyss-2: #0a0a0e;
  --abyss-3: #101016;
  --abyss-4: #16161d;

  --green: #00d992;
  --green-dim: #00b377;
  --green-glow: rgba(0, 217, 146, 0.35);
  --green-soft: rgba(0, 217, 146, 0.12);

  --text: #e8e8e6;
  --text-dim: #9a9a94;
  --text-faint: #55554f;

  --danger: #ff5c5c;
  --warning: #ffb454;
  --info: #5cb8ff;
  --critical: #ff2d55;

  --glass-1: rgba(10, 10, 14, 0.45);
  --glass-2: rgba(12, 12, 18, 0.55);
  --glass-3: rgba(16, 16, 24, 0.65);
  --glass-border: rgba(255, 255, 255, 0.08);
  --glass-border-strong: rgba(255, 255, 255, 0.14);

  --font-sans: "Inter", -apple-system, "SF Pro Text", sans-serif;
  --font-mono: "JetBrains Mono", "SF Mono", ui-monospace, monospace;

  --titlebar-h: 40px;
  --statusbar-h: 26px;
  --sidebar-w: 260px;
  --inspector-w: 300px;
  --row-h: 28px;
}
```

**Ban:** `--accent`, `--text-primary`, `--navy`, leftover ChatPanel tokens. One grep-clean pass in Phase 0.

**Focus:** 2px `--green` ring, 2px offset. Never browser blue.

**Selection:** `rgba(0, 217, 146, 0.30)`.

**Buttons in the workstation:** default `min-height` unset; toolbar 28px; destructive/primary in dialogs 32px. 44px only in marketing and mobile.

### 5.2 Materials

| Material | Where | Not where |
|---|---|---|
| Liquid metal | Overlay titlebar only (25–30% intensity, green-tinted when Space active, red-tinted when YOLO) | Dock, cards, buttons, sidebars |
| Liquid glass | Palette, settings sheet, AI strip over terminal, popovers | Sidebars sitting on solid abyss (use `--abyss-2` + 1px border) |
| Vibrancy | Tauri macOS titlebar + optionally sidebar via native effect | Windows/Linux: CSS glass fallback |
| Grain | Static SVG 3–4% overlay, optional in settings, off by default | Animated canvas dither |
| Scanlines | Terminal-only, user opt-in, 3–6% | Full viewport default |
| Border beam | **Only** the pending-approval block | Idle cards, inputs, YOLO (YOLO uses color, not a second beam) |

Glass without overlapping content is forbidden. If the terminal does not show through, use opaque abyss.

### 5.3 Type

Unchanged jobs, stricter application:

- Inter: labels, prose, buttons, finding narrative
- Mono: hosts, IPs, ports, commands, timestamps, CVSS, hashes, status values, severity
- Micro labels: 10–11px, 0.08em, uppercase, `--text-faint` — never larger
- Finding titles: Inter 13/600; host in the same row: Mono 11

### 5.4 Window chrome (critical)

Tauri macOS:

```json
{
  "titleBarStyle": "overlay",
  "hiddenTitle": true,
  "transparent": false,
  "trafficLightPosition": { "x": 16, "y": 14 }
}
```

Web: no fake lights. Left inset 16px. Engagement name left-weighted after the inset (Mac) or centered (web, acceptable).

Titlebar content, left → right:

1. Space name (13/600)
2. Active host (11 mono, dim)
3. Mode pill
4. YOLO/Safe pill (right cluster)
5. Connection dot

Double-click metal to zoom. Drag region everywhere except controls.

### 5.5 Status bar

Keep the v2 three-cluster layout. Height 26px. No dock hovering above it.

Left: api · mode · target  
Center: last block (command truncated, exit, duration) · sandbox  
Right: YOLO · version · settings gear  

YOLO click is the only loud control. Confirm YOLO-on with a tiny HUD, not a `confirm()`.

---

## 6. Motion

Port Linear/Framer springs. CSS beziers are fallbacks only.

```js
export const springs = {
  palette:  { stiffness: 520, damping: 36, mass: 0.55 }, // snappy drawer
  space:    { stiffness: 280, damping: 30, mass: 1.0 },  // Space switch
  sidebar:  { stiffness: 300, damping: 32, mass: 0.9 },
  strip:    { stiffness: 380, damping: 28, mass: 0.7 },  // AI expand, slight overshoot
  row:      { stiffness: 480, damping: 32, mass: 0.6 },  // list insert
  control:  { stiffness: 500, damping: 28, mass: 0.45 },
};
```

Rules:

- Animate only `transform` and `opacity` (sidebar width via spring on a dummy + grid, or `flex-basis`).
- Overshoot cap 8%.
- Palette: 0ms to focus the input; visual 180ms.
- Reduced motion: 120–150ms opacity. No metal flow, no beam, no dock-style scale.
- Origin-aware: Action Panel grows from the row; sheets from the gear; Space switch is horizontal.

Library: keep `svelte-motion` if it stays interruptible, or a 50-line spring integrator. Do not mix CSS transition and JS spring on the same property.

---

## 7. Surface-by-surface notes

### 7.1 Marketing (`/`, `/docs`, `/download`)

Wegonorth + Framer, not three equal cards.

- Hero: one line ("The pentest workstation with an operator in the chair.") + the real app frame (titlebar + block terminal + inspector ghost). Liquid metal only in that frame's titlebar.
- CTA row: Open Workstation · Download · Docs. One primary.
- Below: two editorial sections max (Approval gate / Your disk). Kill "Three interfaces" icon soup or make it a single comparison line.
- Docs: the current page is a stub. Match product type (Inter, abyss, mono snippets). Fix `--navy`.
- Download: keep the existing polish; sync version with status bar (today titlebar says 0.3.0, Tauri 0.2.1).

### 7.2 Lists (Folk)

Shared `DataList` primitive:

- 28px rows, leading status, primary + meta, trailing mono
- Hover actions in a 28px slot that does not shift layout
- Roving tabindex, `j`/`k`, typeahead
- Multi-select for "send hosts to nmap"
- Empty: one sentence + one button, no emoji

Used by: targets, findings, creds, evidence, plugins, palette results.

### 7.3 Approval

The most important interaction in the product. It must feel like Burp + Warp, not a chat tool card.

- Pending block sticks to the top of the terminal or a 36px dedicated rail
- Edit is an inline command editor (mono)
- `Cmd+Enter` / `Cmd+Shift+Enter`
- Dangerous plugins: extra hold-to-confirm (Kinetics 800ms ring) only here — not on YOLO itself
- Result streams into the same block

### 7.4 Sound (optional, off by default)

Historical research wanted Cuelume. Ship a 4-sound Web Audio pack (click, toggle, pending, finding) behind Settings → Appearance → UI sounds. Default off. Never on marketing pages.

### 7.5 TUI parity

Rebuild Textual layout to match: targets | block log + composer | findings. Placeholder "Message the copilot…" becomes a command prompt with `:` for palette. Same colors. This can trail desktop by one phase but cannot stay chat-home after Phase 1.

---

## 8. Implementation plan

Do not start with shaders. v2 already made that mistake.

### Phase 0 — Foundation (unblocks everything)

- Token unification; delete `--accent` / `--text-primary` usage or alias once
- `button` density: workstation vs marketing scopes
- Fix `Cmd+Shift+B`; centralize keymap module (`web/src/lib/keymap.ts`)
- Remove dock padding; unmount/delete Dock from `/app`
- Stop labelling `/app` as Chat
- Shared list + `kbd` + HUD toast primitives
- Tauri overlay titlebar + `trafficLightPosition` (macOS); document Windows/Linux fallback
- Feature flag `finn.ui.v3` if needed; default on for `/app`

**Success:** the current v2 layout looks denser and more native with zero new features.

### Phase 1 — Shell & Spaces (biggest "not an AI app" win)

- Space model in `appState` (engagement + restored UI state)
- New Space sheet; kill `prompt()`
- Left sidebar = tree only (targets/services/creds/plugins). Wire `selectTarget`
- Inspector tabs; findings leave the left sidebar
- Titlebar hierarchy per §5.4
- Status bar 26px, last-block aware
- Routes become Space-deep-links; tools/notes/findings don't replace the terminal
- First-run empty Space

**Success:** opening the app feels like opening Cursor on a repo, not Claude on a blank chat.

### Phase 2 — Block terminal + approval

- Terminal blocks component wrapping xterm output per run
- Pending rail + `Cmd+Enter`
- Prompt composer under blocks
- Split (`Cmd+\`) stub (terminal | finding)
- Monaco artifact view for report/code (`Cmd+E`)
- Delete or quarantine `ChatPanel.svelte` (logic for approve/markdown moves into strip + artifacts)

**Success:** a hunt looks like Warp with a Burp approval gate.

### Phase 3 — Palette, AI strip, findings cards

- Fuzzy palette + sections + action panel + recents
- AI strip 4 states without bubbles; structured Finn blocks; pin persistence
- Finding answer cards with sources pointing at blocks
- Settings sheet absorbs providers; delete settings page
- High-signal Finn events bump thin strip (never steal focus if operator is in the prompt)

**Success:** `Cmd+K` and `Cmd+J` are how people work; the mouse is optional.

### Phase 4 — Materials, motion, marketing, a11y

- Shared WebGL metal on titlebar only; freeze on reduced motion
- Real springs on palette, Space switch, strip
- Pointer sheen only on palette/sheet
- Grain/scanlines opt-in
- Landing hero = product frame + bold type
- Axe + VoiceOver pass; forced-colors; contrast audit
- TUI layout parity

**Success:** 5-second awe is chrome + terminal + one spring. 60fps on MBA 2020.

### Explicitly later (do not block v3)

- Map view
- Plugin marketplace UI
- Team presence
- Sound pack polish
- Per-Space tint beyond titlebar metal

---

## 9. Component map (what to keep / rewrite / delete)

| File | v3 fate |
|---|---|
| `+layout.svelte` (app) | Rewrite: overlay chrome, no dock pad, Space shell |
| `WindowChrome.svelte` | Rewrite: overlay, no Chat label, Space name |
| `Sidebar.svelte` | Rewrite: tree + Space switcher, no findings list |
| `RightSidebar.svelte` | Rewrite as `Inspector.svelte` with tabs |
| `StatusBar.svelte` | Tighten to 26px; bind last block |
| `AiStrip.svelte` | Rewrite content model; keep state machine |
| `CommandPalette.svelte` | Rewrite search + actions; keep glass shell |
| `SettingsPanel.svelte` | Keep direction; add providers; become only settings |
| `TerminalPane.svelte` | Become block host; keep xterm theme |
| `EmptyState.svelte` | Rewrite as New Space sheet body |
| `LiquidMetal.svelte` | Keep; one instance; shared context; titlebar only |
| `DitherOverlay.svelte` | Replace with static SVG grain; canvas path settings-only |
| `PageHeader.svelte` | Remove with pages, or keep for artifact titles |
| `ChatPanel.svelte` | **Delete** after harvesting approve/markdown helpers |
| `Dock.svelte` | **Delete** from workstation (do not remount) |
| `ToolPanel.svelte` | Fold into plugin popover |
| `/app/settings/+page.svelte` | **Delete** |
| `/app/{findings,notes,tools,creds,reports,loot}` | Convert to inspector/center views; keep redirects |
| Landing `+page.svelte` | Hero rewrite |
| `tauri.conf.json` | Overlay titlebar |
| `tui/app.py` | Terminal-first compose; copy IA |

---

## 10. Anti-patterns (kill list)

Ship blockers if any of these reappear:

- [ ] Permanent large chat as the default view
- [ ] "Message Finn…" / "Ask anything about your scope" as hero copy
- [ ] Rounded chat bubbles for tool output or Finn answers
- [ ] In-app macOS Dock
- [ ] CSS traffic lights
- [ ] `window.prompt` / `window.confirm` for product flows
- [ ] Emoji empty states
- [ ] Glass on every surface
- [ ] Second WebGL metal instance
- [ ] Animated full-viewport dither
- [ ] Two settings UIs
- [ ] Blue focus rings
- [ ] Linear easing on chrome
- [ ] 44px buttons in the workstation
- [ ] Findings duplicated in two sidebars
- [ ] Navigating to a new page to run nmap
- [ ] Treating Finn as the product instead of the Space

---

## 11. Success criteria

A reviewer who lives in iTerm, Cursor, and Burp should, in the first session:

1. Know they are in an engagement, not a chatbot (Space name + terminal blocks)
2. Run, approve, and inspect a command without leaving the keyboard
3. Open a finding that cites the block it came from
4. Ask Finn to draft a report section and see an artifact, not a bubble
5. Switch Spaces and feel the window *go somewhere*
6. Never hunt for YOLO, API status, or the active host
7. Not notice scanlines, dither, or metal unless they look for identity in the titlebar

Measurable:

- Palette to first result < 16ms keystroke (client-side index)
- Space switch spring rest < 350ms
- 60fps while metal titlebar is visible (DPR cap 1.5, one context)
- Keyboard-only path for: new Space, add target, run plugin, approve, save finding, export report
- Axe: zero critical on `/app`
- Contrast: body text ≥ 4.5:1 on abyss and on glass-2

---

## 12. Suggested first implementation PR (after this plan)

Do not "redesign everything" in one PR. First code PR = **Phase 0 + Phase 1 shell only**:

1. Keymap module + shortcut fixes
2. Overlay titlebar / WindowChrome rewrite
3. Space-aware `appState` + New Space sheet
4. Sidebar tree + Inspector tabs
5. Route redirects so the terminal stays mounted
6. Delete Dock from the app shell; quarantine ChatPanel

No new shaders. No landing rewrite yet. That PR should already kill the AI-app feeling.

---

*Compiled against `DESIGN.md` v2, `docs/history/design-v1.md`, `SPEC.md`, historical UI research (commits `067b461`, `47c3452`), and the `web/` + Tauri tree on `master`.*
*References: Apple HIG / WWDC25–26 Liquid Glass, Linear design notes, Raycast manual (Root Search + Action Panel), Arc Spaces, Warp blocks, Claude artifacts/composer, Perplexity answer+sources, Folk lists, Framer motion craft, Wegonorth hero type.*
