# CURSOR UI REDESIGN PROMPT — FINN WORKSTATION

> **Drop this whole file into Cursor** (Cmd+Shift+P → open agent/composer, or `cursor` CLI with this file).
> This is a complete, self-contained redesign brief. It references `MASTER-REDESIGN.md` for the full IA.

---

## YOUR TASK

Redesign the SvelteKit frontend at `/home/das/projects/finn-pentest-harness/web` to feel like a **first-party macOS pentest workstation** (Cursor IDE / Linear / Raycast quality). **NOT a web app in a trench coat. NOT a dark-themed chatbot.**

Read these FIRST:
1. `/home/das/projects/finn-pentest-harness/cursor-research/redesign/MASTER-REDESIGN.md` — the full IA + design language
2. `/home/das/projects/finn-pentest-harness/web/src/app.css` — existing tokens (KEEP these)
3. `/home/das/projects/finn-pentest-harness/web/src/routes/app/+layout.svelte` — current shell

## THE ONE-SENTENCE DIRECTION
**Terminal is the soul.** The engagement (Space) is the product. Finn is a senior sitting beside the terminal — never the homepage. Every surface is a lens onto hosts, commands, and evidence.

## ANTI-SLOP RULES (MANDATORY)
```
- 0 box-shadows. Use borders + glass, never drop-shadow.
- No generic gradients. Only the green→metal titlebar accent.
- No fake metrics. No stats that aren't real.
- Locked design tokens. Do NOT invent colors. Use --abyss/#050507, --green/#00d992, JetBrains Mono + Inter.
- Keyboard-first. Every primary task has a shortcut printed in the UI.
- Density with calm. 6-8px sidebar rows. 11px micro labels. 1px separators at 8% white.
- Verify mobile 320/375/414/768. Breakpoint 1024px.
- WCAG AA contrast. prefers-reduced-motion honored everywhere.
```

## THE 4 PILLARS OF THIS REDESIGN

### 1. KILL CHAT-AS-HOME
- `/app` is a **workspace**, never labelled "Chat"
- `ChatPanel.svelte` (if mounted) → neutralize. It's a full Claude-style transcript; the workstation is terminal-first.
- `Dock.svelte` is NOT mounted. Remove all `padding-bottom: 72px` reserved for it.
- `AiStrip.svelte` currently uses user/assistant pills + cards. Convert to **structured cards** with a subtle meta header (Finn + model tag), rounded corners, NO terminal-block costume, NO fake `$` prompts.
- EmptyState → "Add first target", NOT "Ask Finn anything"

### 2. BLOCK TERMINAL (Warp model)
- Each command/tool run = a **block**: prompt, command, status chip (exit/duration/tool), collapsible output, copy/send-to-Finn/save-as-evidence actions.
- The composer is at the bottom of the terminal (cwd, shell, multiline, history), NOT the AI strip.
- Approval-gated runs are warning-state blocks with Approve/Edit/Reject in the header — the ONE pulsing attention object. YOLO auto-runs and still creates the block.
- `xterm.js` remains the output renderer inside the block body.

### 3. COMMAND PALETTE (Raycast-level)
- `Cmd+K` opens the OS of the app. Fuzzy search, recents on empty query.
- Every result has a primary action (Enter) + Action Panel (`⌘K` inside palette).
- Drill-in with Enter, back with Esc/Backspace. Esc peels: clear query → close.
- Footer hint row with shortcuts.
- Mapping: "acme"→space, "10.0."→targets, "sqli"→findings, "nmap"→plugin, "> hunt"→mode, "? how do I"→AI ask.

### 4. DENSITY + SPRINGS + ONE SHARED GL CONTEXT
- Sidebar rows 28px, inspector rows 28px, status bar 26px. No 44px iPhone targets inside the workstation.
- Springs only: `--spring-bouncy(0.34,1.56,0.64,1)`, `--spring-smooth(0.22,1,0.36,1)`, `--spring-window(0.32,0.72,0,1)`.
- Liquid metal is ONE shared WebGL context in the 40px titlebar ONLY. Not wallpaper.
- Static SVG grain + dither (NOT per-pixel canvas each frame).
- Glass (blur) ONLY where two layers actually overlap — not painted on solid abyss.

## CONCRETE FIXES (current code gaps — fix these exactly)
| File | Fix |
|------|-----|
| `web/src/routes/app/+layout.svelte` | Remove dock padding-bottom:72px. Remove Dock import if unmounted. Label /app "Workspace". |
| `web/src/lib/components/Sidebar.svelte` | `selectTarget()` is empty — wire target selection + active leading-edge chrome. Rows 28px. |
| `web/src/lib/components/AiStrip.svelte` | Structured cards not pills. 4 states: hidden/thin/expanded/pinned. |
| `web/src/lib/components/EmptyState.svelte` | Action-oriented ("Add first target") not "Ask Finn". |
| `web/src/lib/components/CommandPalette.svelte` | substring→fuzzy. Add recents + Action Panel + drill-in. |
| Global button min-height:44px | 28-32px rows inside workstation. |
| New engagement `window.prompt()` | Modal sheet (name, scope paste, template chips). |
| ChatPanel.svelte `--accent` | Migrate to `--green` / `--text`. |

## VERIFY
```
cd /home/das/projects/finn-pentest-harness/web
npm run build
npm run check
```
Both must pass with 0 errors before you stop. Fix all errors.

## EXTRAS (only if time)
- cuelume UI sounds (`data-cuelume="click"` on buttons, `="success"` on approve, `="error"` on reject)
- morphicons for view-switch icons (terminal↔artifact↔split)
- Border Beam on the active engagement card, Thinking Orbs on AI busy state

---
*Grounded in: Arriq's Twitter bookmarks (Jakub Antalik liquid metal/border beam/orbs, anti-slop, chiefkeef 0-box-shadow, swiftuijs macOS feel, Warp blocks, Raycast palette, Linear density, cuelume sounds).*