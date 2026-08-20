# CURSOR UI REDESIGN PROMPT — FINN WORKSTATION (v5)

> **Drop this whole file into Cursor** (Cmd+Shift+P → open agent/composer, or `cursor` CLI).
> **Direction (Arriq): "like Claude, with the UI design of cursor AGENTS."**
> Read `MASTER-REDESIGN.md` in the same folder for the full IA + rationale.

---

## YOUR TASK

Redesign the SvelteKit frontend at `/home/das/projects/finn-pentest-harness/web` so the **AI agent (Finn) IS the interface** — the clean quiet dark UI of **Claude**, with the **agent interaction model of Cursor's AGENTS window** (plan → tool blocks → approvals → diffs/findings).

**NOT a generic chatbot. NOT a terminal-first tool where AI is hidden.** Finn is the workspace.

Read FIRST:
1. `/home/das/projects/finn-pentest-harness/cursor-research/redesign/MASTER-REDESIGN.md` — full spec
2. `/home/das/projects/finn-pentest-harness/web/src/app.css` — keep tokens
3. `/home/das/projects/finn-pentest-harness/web/src/routes/app/+layout.svelte` — current shell

## THE FUSION (ONE PARAGRAPH)

**Claude's look:** quiet, almost no decoration, deep dark abyss, high-signal typography, calm. Composer with auto-grow + mode chips. Artifacts render beside the conversation. Streaming replaces thinking state.

**Cursor's AGENTS interaction:** every Finn turn shows the plan → act → verify → summarize arc as **typed blocks**. Tool runs are inline structured cards with status + output. Approvals (Approve/Edit/Reject) sit right in the conversation. YOLO = auto-approve, still logged.

**The window is Cursor-style chrome:** overlay titlebar, `Cmd+K` palette, settings sheet, dense sidebar. The feel is Claude-quiet.

## ANTI-SLOP (MANDATORY)
```
0 box-shadows · no generic gradients · no fake metrics · locked tokens (abyss/green, Inter/JetBrains Mono)
keyboard-first · density with calm (28px rows, 26px status bar) · verify mobile 320/375/414/768
WCAG AA · prefers-reduced-motion honored · no emoji empty states · no "as an AI"
```

## THE INTERACTION MODEL — TYPED BLOCKS

Finn's output is NOT markdown dumps. It's typed blocks (Cursor-agent style):
- **plan** — numbered steps
- **tool** — command run + status + output
- **diff** — proposed change (patch view)
- **finding** — discovered issue + severity
- **artifact** — draft report / PoC
- **ask** — clarifying question
- **approval** — pending gate (Approve/Edit/Reject)

Each block is a clean structured card with a subtle meta header (Finn + model tag + tool). Rounded corners. NO fake `$` terminal decorations, NO user/assistant bubble pills.

## CONCRETE CODE CHANGES

| File | Fix |
|------|-----|
| `web/src/lib/components/AiStrip.svelte` | **Promote to the PRIMARY surface.** Convert user/assistant pills → typed block renderer. This becomes the main conversation view (like Cursor Agents). |
| `web/src/lib/components/ChatPanel.svelte` | Rebuild as the Cursor-agent conversation: plan/tool/diff/finding blocks + inline approvals. Remove consumer-chatbot avatar columns and rounded user pills. |
| `web/src/lib/components/Dock.svelte` | Remove. Not mounted. Strip `padding-bottom: 72px` from layout. |
| `web/src/lib/components/Sidebar.svelte` | Cursor-style: workspaces, targets, plugins. Wire empty `selectTarget()`. 28px rows. |
| `web/src/lib/components/EmptyState.svelte` | "What should we work on?" — Claude composer + mode chips (hunt/chat/code/report), ready to act. |
| `web/src/routes/app/+layout.svelte` | Conversation is the main surface. Label /app "Finn" or the space name, not "Chat". |
| Global button 44px target | 28px inside conversation chrome. |
| `window.prompt()` new engagement | Sheet with name + scope paste + template chips. |
| Terminal costume | xterm embedded as a deployable artifact (real), not fake `$` blocks. |

## KEYBOARD MAP (print in the UI)
```
⌘K        palette          ⌘T        focus conversation
⌘,        settings sheet   ⌘E        deploy artifact
⌘B        toggle sidebar   ⌘⇧B       toggle inspector
⌘J        show/hide Finn   Enter     send
↵         approve          esc       reject / peel
⌘1..9     switch Space
```

## LIQUID METAL + DITHER
- **Liquid metal:** ONE shared WebGL context in the 40px titlebar ONLY. Simplex noise FBM, metallic pools, dynamic lighting, subtle mouse sheen. Frozen on reduced-motion. NOT wallpaper.
- **Grain/dither:** static SVG grain at 2-3%, 0ms after paint, never per-pixel canvas.
- **Glass:** only where layers overlap.

## EXTRAS (if time)
- `npm i cuelume` (v0.2.2 verified) — `data-cuelume="click"` buttons, `="success"` approve, `="error"` reject
- `liquid-glass-svelte` (v1.2.0 verified) — Svelte liquid glass element
- morphicons for view-switch icons
- Thinking Orbs on Finn busy state

## VERIFY
```
cd /home/das/projects/finn-pentest-harness/web
npm run build && npm run check
```
Both must pass, 0 errors, before you stop.

---
*Grounded in Arriq's Twitter bookmarks: Claude app (composer/artifacts/clean dark), Cursor Agents window, Jakub Antalik (beam/orbs/liquid metal), anti-slop + chiefkeef 0-box-shadow, swiftuijs macOS feel, cuelume sounds, Liquid glass-svelte.*