---
name: nil-terminal-ui
description: Terminal-first IA — terminal and agent stream are the product. Composer via Cmd+J. Real PTY, block output, no fake chrome.
---

# NIL Terminal UI — Terminal is the Product

## Core Principle

The terminal is NOT a component. It's the **primary surface**. Everything else serves it.

```
┌─────────────────────────────────────────────────────────────┐
│  TITLEBAR (liquid metal, 40px)                              │
├─────────────────────────────────────────────────────────────┤
│  MAIN WORKSPACE                                             │
│  ┌─────────┬───────────────────────┬─────────────────────┐  │
│  │Sidebar  │   TERMINAL / EDITOR   │  Inspector          │  │
│  │(targets)│   (real PTY, xterm)   │  (findings/timeline)│  │
│  │ 280px   │   full height         │  320px              │  │
│  └─────────┴───────────────────────┴─────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│  AI STRIP (collapsed, Cmd+J)  |  STATUS BAR (26px)         │
└─────────────────────────────────────────────────────────────┘
```

## Terminal Spec (xterm.js + WebGL)

| Property | Value |
|----------|-------|
| Renderer | `@xterm/addon-webgl` (60fps, GPU) |
| Fit | `@xterm/addon-fit` (responsive) |
| Font | JetBrains Mono, 13px, 1.45 line-height |
| Cursor | Block, blinking, `--accent-primary` |
| Scrollback | 10,000 lines |
| Bell | Visual flash + cuelume sound |
| Selection | Copy on select, right-click paste |
| Links | Ctrl+click to open (file paths, URLs) |

## PTY Integration (Tauri sidecar)

```rust
// Tauri sidecar (Rust) spawns real shell
use std::process::Command;
use tokio::io::{AsyncBufReadExt, AsyncWriteExt};

let mut child = Command::new(shell)
    .arg("-i")  // interactive
    .stdin(Stdio::piped())
    .stdout(Stdio::piped())
    .stderr(Stdio::piped())
    .spawn()?;

// Bidirectional WebSocket bridge to frontend
```

Frontend receives raw PTY bytes → xterm.js renders → user input → WebSocket → PTY stdin.

## Block-Based Output (Warp-style)

Each command execution = a **block**, not a stream:

```
┌─ Block ───────────────────────────────────────────────────┐
│  $ npm run build                                          │
│  ───────────────────────────────────────────────────────  │
│  > frontend@1.0.0 build                                   │
│  > vite build                                             │
│  ───────────────────────────────────────────────────────  │
│  ✓ built in 2.34s                                         │
│  [Copy] [Re-run] [Explain]                                │
└───────────────────────────────────────────────────────────┘
```

**Block metadata:**
- Command + timestamp + exit code
- Duration
- Working directory
- Git branch (if in repo)
- Actions: Copy, Re-run, Explain (summons AI strip)

**NO fake terminal chrome:**
- No `$` prompts as decoration
- No green-tinted code blocks pretending to be terminal
- No "Message Finn..." hero input
- Real PTY only

## AI Strip (4 States)

```
Cmd+J toggles through 4 explicit states:
```

| State | Height | Content |
|-------|--------|---------|
| **Collapsed** | 0px (hidden) | Nothing — terminal full height |
| **Composer** | 120px | Auto-grow input, mode chips (hunt/chat/code/report), drag-drop files |
| **Running** | 200px | Live tool blocks streaming, cost metrics, cancel button |
| **Review** | 300px | Diff blocks, approval buttons, finding cards |

**Transition:** `spring-smooth` (200ms), respects `prefers-reduced-motion`.

## Sidebar — Targets Tree (28px rows)

```
┌─ Targets ─────────────────────────────────────────────────┐
│  📁 acme-corp (engagement)                                │
│  ├─ 🌐 api.acme.com     [80, 443, 8080]                   │
│  │  ├─ 📄 findings (3)                                    │
│  │  └─ 📋 timeline                                        │
│  ├─ 🖥️  db.acme.com       [3306, 5432]                   │
│  │  └─ 📄 findings (1)                                    │
│  └─ 📦 internal-net      10.0.0.0/8                       │
│     └─ 📄 findings (0)                                    │
│                                                           │
│  [+ New Target]  [Import Scope]  [Templates]             │
└───────────────────────────────────────────────────────────┘
```

- 28px row height (`--row-h`)
- 6px vertical, 8px horizontal padding
- Spring expand/collapse (`spring-snappy`)
- Right-click → context menu (run plugin, add finding, etc.)

## Right Sidebar — Inspector

Tabs: **Findings** | **Timeline** | **Evidence** | **Context**

Findings list: severity-sorted, color-coded left border, click → detail panel.

## Status Bar (26px, mono data)

```
main  ●  2.34s  │  1.2k/800 tok  │  $0.003  │  🟢 Connected  │  14:32:15
```

- Git branch, last command duration, token cost, connection status, clock
- All mono font, `--text-secondary`

## Keyboard

| Key | Action |
|-----|--------|
| `Cmd+J` | Focus composer |
| `Cmd+K` | Command palette |
| `Cmd+Shift+P` | Command palette (alt) |
| `Cmd+T` | New terminal tab |
| `Cmd+W` | Close tab |
| `Cmd+1/2/3` | Switch tabs |
| `Cmd+.` | Cancel running command |
| `Esc` | Peel layer / close popover |
| `Ctrl+L` | Clear terminal |