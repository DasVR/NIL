# Finn Pentest Harness — Design System v2

> A macOS-native, dark-terminal pentest workstation.
> Liquid metal. True liquid glass. Spring physics. Terminal is the soul.
> Built for operators who live in iTerm, Cursor, and Burp — not for people who talk to chatbots.

**Design tokens:** `--abyss #050507` · `--green #00d992` · JetBrains Mono + Inter
**Status:** Single source of truth. If it's not in here, it doesn't ship.

---

## Table of Contents

1. [North Star & Inspiration Map](#1-north-star--inspiration-map)
2. [Design Philosophy](#2-design-philosophy)
3. [New Information Architecture](#3-new-information-architecture)
4. [Visual System — Liquid Metal & Liquid Glass v2](#4-visual-system--liquid-metal--liquid-glass-v2)
5. [Key Components](#5-key-components)
6. [Motion System](#6-motion-system)
7. [Implementation Notes](#7-implementation-notes)
8. [Anti-Patterns (Kill List)](#8-anti-patterns-kill-list)

---

## 1. North Star & Inspiration Map

| App | What we take |
|-----|-------------|
| **Cursor (Mac)** | Dense workspace-first layout. AI is a powerful companion, never the main character. Command palette, terminal + editor as primary surfaces, contextual AI strip. |
| **Linear** | Insane speed + spring feel. Perfect density. Minimal chrome. Information hierarchy through type and space, not borders. |
| **Raycast** | Instant command palette. Glass overlays that feel native. Zero friction. |
| **Arc** | Spatial thinking, premium glass, "spaces" that feel intentional. |
| **Claude Desktop / Perplexity** | Structured, high-signal responses instead of endless chat bubbles. Clean cards for findings. |
| **Framer** | Fluid motion craft. High production value without being decorative. |
| **Folk / Sana** | Refined editorial details, rewarding micro-interactions, calm confidence. |
| **Apple Liquid Glass** | Real refraction, vibrancy, layered materials, pointer-reactive sheen. |

**The one rule that kills "AI feel":**
The engagement / target / terminal is the product. Finn is the senior operator sitting next to you.

---

## 2. Design Philosophy

### 2.1 The North Star

Feel like a first-party macOS app that happens to have the best AI assistant for pentesting ever built.

Not a web app. Not a chat product with tools. A workstation.

Reference stack: Cursor + Linear + Raycast + iTerm2 + Burp Suite Pro.

### 2.2 Core Principles

1. **Terminal is the soul** — everything else is a lens onto the machine.
2. **Butter** — every motion is a spring. Nothing linear. Nothing snaps.
3. **Awe in 5 seconds** — liquid metal title bar + glass panels + phosphor green must land immediately.
4. **Density with calm** — high information density (Linear/Cursor) without visual noise.
5. **AI is contextual, never primary** — it appears when useful, disappears when not.
6. **Performance is a feature** — 60 fps floor on 2020 MacBook Air.
7. **Accessibility is non-negotiable**.

### 2.3 Density Rules (Cursor + Linear)

Cursor and Linear win because they pack information tightly without feeling cramped. These rules keep implementers from drifting back into airy chat layouts:

| Surface | Padding | Line-height | Notes |
|---------|---------|-------------|-------|
| Sidebar rows | 6–8px vertical, 8–10px horizontal | 1.3 | Never exceed 10px vertical. Density beats breathing room here. |
| Sidebar section header | 28px row height, 0.4rem 0.75rem | 1 | All-caps micro-label. No extra margin below the header. |
| Finding / target card | 8px 10px | 1.35 | Compact, but text must not feel crushed. |
| Terminal line | 6px vertical | 1.45 | Sacred. Do not increase. |
| Status bar | 0 12px horizontal, 26px height | 1 | Single-line, mono-heavy. |
| AI strip message | 6px 10px | 1.5 | Slightly more air than sidebar because prose is read linearly. |

**Typography rule:**
- **Sans (Inter)** = labels, headings, button text, human-readable prose.
- **Mono (JetBrains Mono)** = hostnames, IPs, ports, timestamps, tool output, severity badges, file paths, status bar values, any number inside prose.
- When in doubt on a sidebar/status row, use mono. It signals "machine data" and increases density.

**Spacing rule:**
- Use `gap` inside flex/grid containers, never margin stacks.
- 1px borders + 4–8px gaps create hierarchy better than 16px margins.
- The only place padding exceeds 12px is modals, empty-state cards, and the main terminal host area.

### 2.4 What This Is Explicitly Not

- Generic AI chat UI with a dark theme
- Another "agent playground"
- Web-app instincts (flat cards, blue focus rings, instant state changes)
- Decorative glass everywhere (glass only where layers actually overlap)

---

## 3. New Information Architecture

### 3.1 Primary Layout (Engagement View)

```
┌─ Titlebar (liquid metal) ──────────────────────────────────────────────┐
│ Finn  ·  engagement-name  ·  target  ·  YOLO  ·  Safe                │
├────────────┬──────────────────────────────────────────────┬────────────┤
│            │                                              │            │
│  Targets   │           Main Workspace                     │  Findings  │
│  + Scope   │  (Terminal default / Monaco / Map / Report)  │  + Notes   │
│  + Creds   │                                              │  + Timeline│
│            │                                              │            │
│            ├──────────────────────────────────────────────┤            │
│            │  Contextual AI Strip (collapsed by default)  │            │
└────────────┴──────────────────────────────────────────────┴────────────┘
│ Status / Safety bar                                                   │
```

- **Left sidebar** (260px → collapsible): Engagement tree (targets, hosts, services, credentials, notes, artifacts). Very Cursor/Linear.
- **Center**: Primary work surface. Terminal is the default view when an engagement is open.
- **Right sidebar**: Findings (severity-colored), evidence, notes, activity timeline.
- **Bottom / floating**: Contextual AI strip — only expands when you invoke it (Cmd+K / Cmd+J) or when Finn has a high-signal update.
- **Titlebar**: Always shows engagement context + safety state. Liquid metal material. Engagement name is most prominent.
- **Status / Safety bar**: Always-visible bottom strip. Pure Burp/Cursor energy. Shows current mode, YOLO state, sandbox status, last tool run, connection status.

### 3.2 Empty / First-run State

Not "Ask Finn anything".

Show last engagement summary, scope, or a clean "New Engagement" flow with target input. Feels like opening Cursor or Linear on a new project.

### 3.3 Contextual AI Strip — Exact States

The AI strip has four defined states. No ambiguous "collapsed by default" behavior:

1. **Hidden**
   - Height: 0.
   - Triggered by: default view when no recent Finn activity and user hasn't pinned it.
   - Keyboard: `Cmd+J` toggles to Expanded. `Esc` from Expanded returns to Hidden unless Pinned.

2. **Thin collapsed bar**
   - Height: 26px.
   - Shows: last Finn status line or a subtle thinking indicator.
   - Background: `--glass-2` with top border only.
   - Used when: Finn is working on something but doesn't need full focus, or after an interaction that the user hasn't dismissed.

3. **Expanded**
   - Height: 280px.
   - Shows: structured cards / terminal-style blocks. No chat bubbles.
   - Used when: user invokes with `Cmd+J`, Finn has a high-signal update, or user asks for an explanation/draft/report.

4. **Pinned**
   - Expanded stays open across route changes and interactions.
   - Toggle via pin icon in the strip header. `Cmd+Shift+J` toggles pin.
   - State survives session (localStorage).

State transitions:
- Hidden → Expanded: `Cmd+J`, high-signal update, or clicking a "Explain" / "Draft" action.
- Expanded → Hidden: `Esc` or close button (only if not pinned).
- Expanded → Thin: auto-collapse after 8s of inactivity when Finn finishes.
- Thin → Expanded: click the thin bar or `Cmd+J`.
- Any state → Pinned: click pin icon or `Cmd+Shift+J`.

### 3.4 Command Palette (Cmd+K)

Raycast-level. Global. Search targets, findings, tools, past commands, AI actions. This becomes one of the main ways to work with Finn.

### 3.5 Titlebar Content Hierarchy

Titlebar is read left-to-right in this priority:

1. **Engagement name** — most prominent. 13px, weight 600, `--text`, mono if it contains machine identifiers.
2. **Target / scope summary** — secondary. 11px, `--text-dim`, mono.
3. **YOLO / Safe indicator** — safety state. 10px uppercase, colored pill.
4. **Connection dot** — tiny status indicator at the far right.

Target + YOLO/Safe live on the right side of the titlebar. Engagement name is centered or left-weighted depending on platform. On web, center alignment is acceptable. On Tauri macOS, engagement name sits immediately after the native window controls region.

### 3.6 Status / Safety Bar

Always-visible bottom strip. This is pure Burp/Cursor energy.

Left cluster:
- Connection status dot + label (`API connected` / `API offline`)
- Current mode pill (`HUNT` / `CHAT` / `CODE` / `REPORT`)
- Active target / scope

Center cluster:
- Last tool run status (`nmap -sV -sC ...` + exit code / time)
- Sandbox status (`sandbox ready` / `running` / `dirty`)

Right cluster:
- YOLO toggle button with exact state
- Version / build info
- Quick settings gear

Height: 26px. Font: 11px mono for values, 10px sans for labels. Background: `--glass-3`. Border-top: `1px solid var(--glass-border)`.

---

## 4. Visual System — Liquid Metal & Liquid Glass v2

### 4.1 Color Tokens (refined)

```css
:root {
  --abyss:        #050507;
  --abyss-2:      #0a0a0e;
  --abyss-3:      #101016;
  --abyss-4:      #16161d;

  --green:        #00d992;
  --green-dim:    #00b377;
  --green-glow:   rgba(0, 217, 146, 0.35);
  --green-soft:   rgba(0, 217, 146, 0.12);

  --text:         #e8e8e6;
  --text-dim:     #9a9a94;
  --text-faint:   #55554f;

  --danger:       #ff5c5c;
  --warning:      #ffb454;
  --info:         #5cb8ff;
  --critical:     #ff2d55;   /* new – for critical findings */

  /* Glass materials (Apple Liquid Glass inspired) */
  --glass-1:      rgba(10, 10, 14, 0.45);   /* window level */
  --glass-2:      rgba(12, 12, 18, 0.55);   /* panels */
  --glass-3:      rgba(16, 16, 24, 0.65);   /* cards / popovers */
  --glass-border: rgba(255, 255, 255, 0.08);
  --glass-border-strong: rgba(255, 255, 255, 0.14);
  --glass-blur:   28px;
  --glass-saturate: 1.6;
}
```

### 4.2 Liquid Metal (Titlebar, Dock, Key Controls)

Keep the WebGL2 domain-warped FBM shader from v1, but increase quality and usage:

- **Titlebar**: 25–30% intensity, very subtle flow, green-tinted on active engagement.
- **Dock / bottom bar**: 40% intensity.
- **YOLO toggle / critical controls**: red-tinted metal.
- **New**: Small liquid metal accent on the active target in the sidebar and on critical findings.

Performance rules stay the same (shared context, DPR cap 1.5, frozen on reduced-motion).

### 4.3 Liquid Glass (Apple Liquid Glass + Cursor Acrylic level)

This is the biggest visual upgrade.

**Requirements:**
- Real `backdrop-filter` + `-webkit-backdrop-filter`
- Higher blur (28–40px on larger surfaces)
- Saturation boost (1.5–1.8)
- Pointer-reactive sheen (radial gradient that follows cursor, very subtle)
- Edge refraction / specular highlight on the top edge of glass panels
- Proper layering: glass only where content actually sits on top of other content

**Tiers:**

| Tier | Use | Blur | Opacity | Notes |
|------|-----|------|---------|-------|
| Glass-1 | Window / large panels | 32–40px | 0.45 | Strongest refraction |
| Glass-2 | Sidebars, AI strip | 24–28px | 0.55 | |
| Glass-3 | Cards, command palette, tooltips | 16–20px | 0.65 | |
| Glass-4 | Popovers, menus | 12px | 0.72 | |

**macOS-specific:**
In Tauri, lean on system vibrancy where possible (NSVisualEffectView style materials) for the true native Liquid Glass feel on titlebar and sidebars. Fall back to CSS glass on Windows/Linux.

**Reduced motion:** Disable pointer sheen and freeze any flowing metal. Keep static glass.

### 4.4 Typography

Unchanged core, but stricter:

- **JetBrains Mono** → everything machine (terminal, IPs, ports, hashes, tool output, timestamps, code)
- **Inter** (or SF Pro on macOS) → human UI
- Numbers inside prose always switch to mono
- Uppercase micro-labels: 11px, letter-spacing 0.08em, never larger

### 4.5 Depth & Shadows

```css
--shadow-panel:  0 8px 32px rgba(0, 0, 0, 0.45), 0 0 0 1px var(--glass-border);
--shadow-modal:  0 24px 80px rgba(0, 0, 0, 0.65), 0 0 0 1px var(--glass-border-strong);
--shadow-glow:   0 0 32px var(--green-glow);
--shadow-critical: 0 0 24px rgba(255, 45, 85, 0.35);
```

---

## 5. Key Components (Updated Specs)

### 5.1 Window Chrome (Critical for macOS feel)

- Custom titlebar with liquid metal material
- Proper traffic lights (red/yellow/green) with native spacing
- Engagement name + target + safety indicators live in the titlebar
- Double-click titlebar to zoom (native behavior)
- Tauri: use `titleBarStyle: "overlay"` + vibrancy

### 5.2 Sidebars

- Collapsible with spring animation
- Targets tree uses mono for IPs/ports
- Active target has subtle liquid metal accent + green left border
- Findings on the right use severity color coding aggressively (critical = soft red glow)

### 5.3 Main Workspace

- Terminal (xterm.js) is the default and primary surface
- Monaco for script/code mode
- Can split (terminal + editor, or terminal + findings detail)
- No giant empty chat area ever

### 5.4 Contextual AI Strip

- Collapsed by default (thin bar or completely hidden)
- Expands with spring on Cmd+J / Cmd+K or when Finn has something important
- Responses are structured cards / terminal-style blocks, not chat bubbles
- Can be pinned or floated
- Feels closer to Cursor's AI sidebar than Claude's full chat

### 5.5 Command Palette

- Raycast-level speed and glass
- Search across targets, findings, tools, history, AI actions
- Keyboard-first

### 5.6 Findings Cards

- Severity color left border + subtle glow on critical/high
- Mono for technical details
- One-click "Explain" or "Draft report note" that talks to Finn contextually

---

## 6. Motion System

Keep the spring presets from v1. Add:

- Sidebar collapse/expand: `--spring-smooth`
- AI strip open: `--spring-bouncy` (slight overshoot feels premium)
- Command palette: very snappy
- Window chrome interactions: `--spring-window`

All effects honor `prefers-reduced-motion`.

---

## 7. Implementation Notes (Svelte + Tauri + Cursor)

1. **Start with layout, not effects.** Rebuild the shell (titlebar + 3-pane + collapsible AI) before polishing glass.
2. **Use Cursor heavily for the rebuild:** Point it at this DESIGN.md. Use Design Mode / visual prompts for the glass panels and titlebar.
3. **Keep the WebGL liquid metal shader** in a dedicated component.

### Tauri 2 specifics:
- `titleBarStyle: "overlay"`
- Enable vibrancy on macOS for true Liquid Glass
- Global shortcut already exists — extend it for command palette

### Performance budget:
- Liquid metal: shared WebGL context, max 1–2 instances visible
- Glass: limit simultaneous high-blur surfaces
- Always provide solid fallbacks

### Migration path:
- **Phase 1:** New shell + IA (biggest "feels less AI" win)
- **Phase 2:** Elevated glass + metal
- **Phase 3:** Command palette + structured findings
- **Phase 4:** Polish + reduced-motion + accessibility audit

---

## 8. Anti-Patterns (Kill List)

- [ ] Permanent large chat area as the default view
- [ ] "Message Finn…" as the hero input
- [ ] Rounded chat bubbles for tool output
- [ ] Floating tool suggestion pills as primary actions
- [ ] Generic "Ask anything about your scope"
- [ ] Blue focus rings
- [ ] Linear easing
- [ ] Glass on every single surface
- [ ] Treating Finn as the product instead of the engagement

---

*This document is intentionally dense and implementable.*
