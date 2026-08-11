# Finn Pentest Harness — Complete System Design

> **Terminal-first, AI-driven, open-source pentest workstation**
> Built on finn-godmode-api. Sandboxed. Plugin-driven. Obsidian-native.
> 
> **Status**: Phase 1 complete (backend scaffold) | **Next**: Phase 2 (AI integration)

---

## Table of Contents

1. [Vision & Philosophy](#1-vision--philosophy)
2. [System Architecture](#2-system-architecture)
3. [UI/UX Design — Complete](#3-uiux-design--complete)
4. [Feature Encyclopedia](#4-feature-encyclopedia)
5. [AI System Design](#5-ai-system-design)
6. [Plugin System — Deep Dive](#6-plugin-system--deep-dive)
7. [Sandbox & Execution Engine](#7-sandbox--execution-engine)
8. [Data Model & Storage](#8-data-model--storage)
9. [Security Model](#9-security-model)
10. [Integration Ecosystem](#10-integration-ecosystem)
11. [Development Roadmap](#11-development-roadmap)
12. [API Reference](#12-api-reference)

---

## 1. Vision & Philosophy

### What This Is
Finn Pentest Harness is a **terminal-native pentest workstation** that puts an AI copilot inside your terminal. It's not a web app. It's not a SaaS. It's a TUI that lives in your terminal, talks to local and cloud LLMs, runs tools in isolated Docker sandboxes, and syncs everything to your Obsidian vault.

### What This Is NOT
- **Not a web app** — no browser, no Electron, no React. Pure terminal.
- **Not a SaaS** — your data never leaves your machine unless you choose cloud models.
- **Not an automated hacker** — AI proposes, YOU approve. Every. Single. Command.
- **Not a script kiddie tool** — designed for professional pentesters who want AI assistance without losing control.

### Core Principles

1. **Terminal First** — If you can't do it with a keyboard, it doesn't belong. Every action has a shortcut. Mouse is optional.

2. **Human in the Loop** — AI is your copilot, not your replacement. It plans, suggests, analyzes — but YOU pull the trigger. The approval gate is non-negotiable.

3. **Everything Logged** — Every command, every output, every decision, every credential. Nothing is lost. Timeline is append-only. You can reconstruct an entire engagement from the logs.

4. **Sandbox Everything** — Tools run in isolated Docker containers. One container per engagement. Network isolated. Resource limited. Nuke it with one command.

5. **Your Data, Your Control** — Credentials encrypted at rest. Reports on your disk. Obsidian sync is local-first. Cloud models are optional.

6. **Uncensored Models** — Pentesting requires models that don't refuse. Local uncensored models (dolphin-mixtral, deepseek-coder) + anti-refusal system prompts for cloud models.

7. **Plugin Everything** — Every tool is a plugin. Drop a Python file in `~/.finn-pentest/plugins/` and it auto-discovers. Community can build and share plugins.

8. **Obsidian Native** — Findings are markdown files. Timeline is markdown. Reports are markdown. Your Obsidian vault is the source of truth.

---

## 2. System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     USER'S TERMINAL                              │
│  ┌───────────────────────────────────────────────────────────┐   │
│  │              TUI (Textual — Python)                        │   │
│  │  ┌─────────┐  ┌──────────────────┐  ┌──────────────────┐  │   │
│  │  │ Targets │  │  Chat + Terminal  │  │  Notes+Findings  │  │   │
│  │  │  Tree   │  │  (split pane)     │  │  (markdown)      │  │   │
│  │  └─────────┘  └──────────────────┘  └──────────────────┘  │   │
│  └───────────────────────────────────────────────────────────┘   │
│                           │ HTTP (localhost:8766)                │
├───────────────────────────┼─────────────────────────────────────┤
│              FINN PENTEST HARNESS API (FastAPI)                  │
│                                                                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │ Sandbox  │ │  Tool    │ │ Plugin   │ │ Timeline │           │
│  │ Manager  │ │ Executor │ │ Loader   │ │ Logger   │           │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │   AI     │ │  Cred    │ │ Obsidian │ │ Report   │           │
│  │  Router  │ │  Store   │ │   Sync   │ │ Builder  │           │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │
│                           │                                      │
├───────────────────────────┼─────────────────────────────────────┤
│              FINN GODMODE API (port 8765)                        │
│  Ultraplinian | Consortium | AutoTune | STM | GodMode           │
│                           │                                      │
├───────────────────────────┼─────────────────────────────────────┤
│                    LLM PROVIDERS                                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │  Ollama  │ │ Ollama   │ │ OpenAI   │ │ Anthropic│           │
│  │  (local) │ │  Cloud   │ │  (opt)   │ │  (opt)   │           │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │
├─────────────────────────────────────────────────────────────────┤
│                    DOCKER SANDBOXES                              │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐             │
│  │ acme-corp    │ │ client-xyz   │ │ internal-pen │             │
│  │ (nmap,nuclei)│ │ (ffuf,burp)  │ │ (sqlmap,hyd) │             │
│  │ 10.0.1.0/24  │ │ 192.168.0.0  │ │ 172.16.0.0   │             │
│  └──────────────┘ └──────────────┘ └──────────────┘             │
├─────────────────────────────────────────────────────────────────┤
│                    LOCAL FILESYSTEM                              │
│  ~/.finn-pentest/                                                │
│  ├── engagements/<name>/                                         │
│  │   ├── scope.txt                                               │
│  │   ├── timeline.md                                             │
│  │   ├── notes.md                                                │
│  │   ├── findings/*.md                                           │
│  │   ├── loot/*                                                  │
│  │   ├── reports/*                                               │
│  │   └── creds.enc                                               │
│  ├── plugins/*.py                                                │
│  ├── prompts/*.md                                                │
│  ├── wordlists/*.txt                                             │
│  └── sandboxes/<name>/                                           │
└─────────────────────────────────────────────────────────────────┘
```

### Component Communication

```
TUI ←→ API (localhost:8766) via HTTP/WebSocket
API ←→ Godmode API (localhost:8765) via HTTP
API ←→ Docker daemon via docker-py
API ←→ Filesystem (engagements, plugins, creds)
API ←→ Obsidian vault via filesystem sync
Godmode API ←→ LLM providers via HTTP
```

### Port Allocation
| Port | Service |
|------|---------|
| 8765 | finn-godmode-api (LLM routing) |
| 8766 | finn-pentest-harness API |
| 11434 | Local Ollama |

---

## 3. UI/UX Design — Complete

### 3.1 Design System

#### Color Palette
```
Background (abyss):     #050507
Surface:                #0a0a0f
Surface raised:         #0f0f15
Border:                 #1a1a25
Text primary:           #e0e0e0
Text secondary:         #888899
Text muted:             #555566
Accent (green):         #00d992
Accent dim:             #00a870
Danger:                 #ff4455
Warning:                #ffaa00
Info:                   #4499ff
Success:                #00d992
```

#### Typography
- **Primary**: JetBrains Mono (monospace, terminal-native)
- **Sizes**: 10px (captions), 12px (body), 14px (headings), 16px (titles)
- **Weights**: 400 (body), 600 (headings), 700 (titles)

#### Spacing
- **Grid**: 4px base unit
- **Padding**: 8px (compact), 16px (normal), 24px (relaxed)
- **Border radius**: 0px (terminal aesthetic — no rounded corners)

#### Icons
- Nerd Font icons (terminal-native, no image assets)
-  (target),  (tool),  (finding),  (credential),  (note),  (report)

### 3.2 Main Layout (Three-Pane)

```
┌──────────────────────────────────────────────────────────────────┐
│  Finn Pentest Harness                    [Engagement: acme-corp]  │
│  hunt ● chat ○ code ○ report ○          model: qwen2.5-coder ▼  │
├────────────┬─────────────────────────────┬────────────────────────┤
│            │                             │                        │
│  TARGETS   │  CHAT + TERMINAL            │  NOTES + FINDINGS      │
│            │                             │                        │
│  ▸ acme    │  ┌───────────────────────┐  │  # acme-corp           │
│    ▸ scope │  │  AI (hunt mode)      │  │                        │
│    │ • 10. │  │                       │  │  ## Findings           │
│    │   0.1. │  │  Based on the nmap   │  │  - [CRIT] SQLi on     │
│    │   0/24│  │  results, I recommend │  │    /api/login          │
│    │ • acme│  │  running nuclei       │  │  - [HIGH] Exposed     │
│    │   .com│  │  against the web      │  │    .git on /admin      │
│    │ • api.│  │  server on port 8080. │  │  - [MED] Missing     │
│    │   acme│  │                       │  │    CSP headers         │
│    │   .com│  │  Proposed command:    │  │                        │
│    ▸ tools│  │  nuclei -u http://     │  │  ## Credentials        │
│    │ • nmap│  │  10.0.1.5:8080        │  │  - mysql:admin:****    │
│    │ • nucl│  │                       │  │  - ssh:root:****      │
│    │ • ffuf│  │  [Approve] [Edit]     │  │                        │
│    ▸ notes│  │  [Reject]             │  │  ## Notes              │
│    ▸ findi│  └───────────────────────┘  │  - Need to check       │
│    ▸ loot │  ┌───────────────────────┐  │    the admin panel     │
│            │  │ TERMINAL OUTPUT      │  │    for default creds   │
│  ▸ client2│  │                       │  │  - Client mentioned    │
│            │  │ [nmap] Starting Nmap │  │    they use WordPress  │
│            │  │ 7.94 at 2026-08-11   │  │                        │
│            │  │ Nmap scan report for │  │                        │
│            │  │ 10.0.1.5             │  │                        │
│            │  │ Host is up (0.0012s  │  │                        │
│            │  │ latency).            │  │                        │
│            │  │ PORT     STATE SERV  │  │                        │
│            │  │ 22/tcp   open  ssh   │  │                        │
│            │  │ 80/tcp   open  http  │  │                        │
│            │  │ 8080/tcp open  http  │  │                        │
│            │  │ 3306/tcp open  mysql │  │                        │
│            │  │                       │  │                        │
│            │  │ Nmap done: 1 IP      │  │                        │
│            │  │ address (1 host up)  │  │                        │
│            │  └───────────────────────┘  │                        │
│            │                             │                        │
├────────────┴─────────────────────────────┴────────────────────────┤
│  STATUS BAR                                                        │
│  acme-corp | hunt | qwen2.5-coder | 3 tools running | 12 findings │
│  nmap: 45% ████████░░░░░░░░ | nuclei: queued | ffuf: complete     │
└──────────────────────────────────────────────────────────────────┘
```

### 3.3 Screen States

#### 3.3.1 Welcome Screen (No Engagements)
```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│                                                                  │
│                         ╔════════════╗                            │
│                         ║  FINN       ║                           │
│                         ║  PENTEST    ║                           │
│                         ║  HARNESS    ║                           │
│                         ╚════════════╝                            │
│                                                                  │
│              Terminal-first AI pentest workstation               │
│                                                                  │
│         ┌─────────────────────────────────────────────┐          │
│         │  [Create New Engagement]                     │          │
│         │                                              │          │
│         │  Name: [________________]                    │          │
│         │                                              │          │
│         │  Scope: (one per line)                       │          │
│         │  [________________]                          │          │
│         │  [________________]                          │          │
│         │  [________________]                          │          │
│         │                                              │          │
│         │  [Create]  [Import from file...]             │          │
│         └─────────────────────────────────────────────┘          │
│                                                                  │
│         ─── or ───                                               │
│                                                                  │
│         [Cmd+N] New    [Cmd+O] Open    [Cmd+,] Settings           │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

#### 3.3.2 Chat Pane — Hunt Mode (Autonomous Loop)
```
┌──────────────────────────────────────────────────┐
│  HUNT MODE — acme-corp                           │
│                                                  │
│  ┌────────────────────────────────────────────┐  │
│  │  AI  [22:15:01]                           │  │
│  │                                            │  │
│  │  Starting hunt phase. Current target:      │  │
│  │  10.0.1.0/24.                              │  │
│  │                                            │  │
│  │  Phase 1: Reconnaissance                   │  │
│  │  - Host discovery via nmap ping sweep      │  │
│  │  - Port scanning on discovered hosts       │  │
│  │  - Service version detection               │  │
│  │                                            │  │
│  │  Proposed: nmap -sn 10.0.1.0/24            │  │
│  │                                            │  │
│  │  [Approve] [Edit] [Reject] [Skip Phase]    │  │
│  └────────────────────────────────────────────┘  │
│                                                  │
│  ┌────────────────────────────────────────────┐  │
│  │  USER  [22:15:05]                          │  │
│  │  approved                                   │  │
│  └────────────────────────────────────────────┘  │
│                                                  │
│  ┌────────────────────────────────────────────┐  │
│  │  TOOL  [22:15:06]  nmap -sn 10.0.1.0/24   │  │
│  │  Running... ████████░░░░ 67%              │  │
│  └────────────────────────────────────────────┘  │
│                                                  │
│  ┌────────────────────────────────────────────┐  │
│  │  TOOL  [22:16:42]  nmap completed (96s)    │  │
│  │  Exit: 0                                    │  │
│  │                                            │  │
│  │  5 hosts up:                               │  │
│  │  • 10.0.1.1 (gateway)                      │  │
│  │  • 10.0.1.5 (web-server)                   │  │
│  │  • 10.0.1.10 (db-server)                   │  │
│  │  • 10.0.1.20 (mail-server)                 │  │
│  │  • 10.0.1.50 (workstation)                  │  │
│  └────────────────────────────────────────────┘  │
│                                                  │
│  ┌────────────────────────────────────────────┐  │
│  │  AI  [22:16:45]                            │  │
│  │                                            │  │
│  │  5 hosts discovered. Analyzing attack      │  │
│  │  surface...                                │  │
│  │                                            │  │
│  │  Next: Port scan on all 5 hosts to         │  │
│  │  identify services.                        │  │
│  │                                            │  │
│  │  Proposed: nmap -T4 -sV -sC 10.0.1.1,5,    │  │
│  │  10,20,50                                  │  │
│  │                                            │  │
│  │  [Approve] [Edit] [Reject]                 │  │
│  └────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────┘
```

#### 3.3.3 Chat Pane — Chat Mode (Q&A)
```
┌──────────────────────────────────────────────────┐
│  CHAT MODE — acme-corp                           │
│                                                  │
│  ┌────────────────────────────────────────────┐  │
│  │  USER  [22:30:00]                          │  │
│  │                                            │  │
│  │  what should i do about the exposed        │  │
│  │  .git directory on the admin panel?        │  │
│  └────────────────────────────────────────────┘  │
│                                                  │
│  ┌────────────────────────────────────────────┐  │
│  │  AI  [22:30:02]                            │  │
│  │                                            │  │
│  │  Good catch. An exposed .git directory     │  │
│  │  is a serious finding. Here's what you     │  │
│  │  should do:                                │  │
│  │                                            │  │
│  │  1. Clone the repo to extract source:      │  │
│  │     git-dumper http://admin.acme.com/.git  │  │
│  │                                            │  │
│  │  2. Check for secrets in commit history:   │  │
│  │     git log -p | grep -i "password\|key\|  │  │
│  │     secret\|token"                         │  │
│  │                                            │  │
│  │  3. Look for config files:                 │  │
│  │     find . -name "*.config" -o -name       │  │
│  │     ".env" -o -name "*.yml"                │  │
│  │                                            │  │
│  │  Want me to run git-dumper against it?     │  │
│  └────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────┘
```

#### 3.3.4 Chat Pane — Code Mode (PoC Generation)
```
┌──────────────────────────────────────────────────┐
│  CODE MODE — acme-corp                           │
│                                                  │
│  ┌────────────────────────────────────────────┐  │
│  │  USER  [22:45:00]                          │  │
│  │                                            │  │
│  │  write a PoC for the SQL injection on      │  │
│  │  /api/login?user=admin                     │  │
│  └────────────────────────────────────────────┘  │
│                                                  │
│  ┌────────────────────────────────────────────┐  │
│  │  AI  [22:45:03]                            │  │
│  │                                            │  │
│  │  ```python                                 │  │
│  │  # PoC: SQLi on /api/login (acme-corp)     │  │
│  │  import requests                           │  │
│  │                                            │  │
│  │  TARGET = "http://10.0.1.5:8080/api/login" │  │
│  │                                            │  │
│  │  payloads = [                              │  │
│  │      "' OR '1'='1",                        │  │
│  │      "' OR '1'='1' --",                    │  │
│  │      "admin' --",                          │  │
│  │      "' UNION SELECT 1,2,3 --",            │  │
│  │  ]                                         │  │
│  │                                            │  │
│  │  for payload in payloads:                  │  │
│  │      r = requests.get(                     │  │
│  │          TARGET,                           │  │
│  │          params={"user": payload}           │  │
│  │      )                                     │  │
│  │      if "Welcome" in r.text:               │  │
│  │          print(f"[!] Bypass: {payload}")    │  │
│  │  ```                                       │  │
│  │                                            │  │
│  │  [Save to loot/] [Run in sandbox] [Copy]   │  │
│  └────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────┘
```

#### 3.3.5 Chat Pane — Report Mode (Structured Output)
```
┌──────────────────────────────────────────────────┐
│  REPORT MODE — acme-corp                         │
│                                                  │
│  ┌────────────────────────────────────────────┐  │
│  │  USER  [23:00:00]                          │  │
│  │                                            │  │
│  │  generate a finding for the SQL injection  │  │
│  └────────────────────────────────────────────┘  │
│                                                  │
│  ┌────────────────────────────────────────────┐  │
│  │  AI  [23:00:04]                            │  │
│  │                                            │  │
│  │  # Finding: SQL Injection on /api/login     │  │
│  │                                            │  │
│  │  **Severity**: Critical (CVSS 9.8)          │  │
│  │  **CWE**: CWE-89 (SQL Injection)            │  │
│  │                                            │  │
│  │  ## Description                            │  │
│  │  The /api/login endpoint accepts a `user`   │  │
│  │  parameter that is directly concatenated   │  │
│  │  into SQL queries without sanitization.    │  │
│  │  This allows authentication bypass and     │  │
│  │  potential data exfiltration.              │  │
│  │                                            │  │
│  │  ## Impact                                 │  │
│  │  - Complete authentication bypass          │  │
│  │  - Full database access                    │  │
│  │  - Potential RCE via INTO OUTFILE          │  │
│  │                                            │  │
│  │  ## Evidence                               │  │
│  │  See: findings/20260811_sqli_login.md      │  │
│  │                                            │  │
│  │  ## Remediation                            │  │
│  │  1. Use parameterized queries              │  │
│  │  2. Implement input validation             │  │
│  │  3. Apply least privilege to DB user       │  │
│  │                                            │  │
│  │  [Save Finding] [Export PDF] [Copy MD]     │  │
│  └────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────┘
```

### 3.4 Command Palette (Cmd+K)

```
┌──────────────────────────────────────────────────┐
│  █ COMMAND PALETTE                               │
│                                                  │
│  Type a command or search...                     │
│  > nmap                                          │
│  ────────────────────────────────────────────────│
│  ▸ Run: nmap quick scan on target                 │
│  ▸ Run: nmap full scan on target                  │
│  ▸ Run: nmap stealth scan on target               │
│  ▸ Run: nmap UDP scan on target                   │
│  ▸ Run: nmap vulnerability scan on target         │
│  ▸ Install: nmap in sandbox                       │
│  ▸ Plugin: nmap — view plugin details             │
│  ────────────────────────────────────────────────│
│  [↑↓ navigate] [Enter select] [Esc cancel]       │
└──────────────────────────────────────────────────┘
```

### 3.5 Keyboard Shortcuts — Complete Map

#### Global
| Key | Action |
|-----|--------|
| `Cmd+K` | Command palette |
| `Cmd+N` | New engagement |
| `Cmd+O` | Open engagement |
| `Cmd+W` | Close engagement |
| `Cmd+Q` | Quit |
| `Cmd+,` | Settings |
| `Cmd+/` | Show keyboard shortcuts |
| `Cmd+Shift+P` | Command palette (alt) |

#### Navigation
| Key | Action |
|-----|--------|
| `Cmd+1` | Focus targets pane |
| `Cmd+2` | Focus chat/terminal pane |
| `Cmd+3` | Focus notes/findings pane |
| `Cmd+\` | Toggle terminal panel |
| `Cmd+J` | New chat |
| `Cmd+[` | Previous chat |
| `Cmd+]` | Next chat |
| `Cmd+Shift+[` | Previous engagement |
| `Cmd+Shift+]` | Next engagement |
| `Tab` | Cycle focus within pane |
| `Shift+Tab` | Reverse cycle focus |

#### Chat
| Key | Action |
|-----|--------|
| `Cmd+Enter` | Send message |
| `Cmd+Up` | Edit last message |
| `Cmd+L` | Clear chat |
| `Cmd+F` | Search in chat |
| `Cmd+1` (in chat) | Switch to hunt mode |
| `Cmd+2` (in chat) | Switch to chat mode |
| `Cmd+3` (in chat) | Switch to code mode |
| `Cmd+4` (in chat) | Switch to report mode |

#### Tool Approval
| Key | Action |
|-----|--------|
| `Cmd+A` | Approve proposed command |
| `Cmd+E` | Edit proposed command |
| `Cmd+R` | Reject proposed command |
| `Cmd+Shift+A` | Approve all pending |

#### Findings & Notes
| Key | Action |
|-----|--------|
| `Cmd+S` | Save notes |
| `Cmd+D` | Create finding from selection |
| `Cmd+Shift+F` | Search findings |
| `Cmd+E` (in findings) | Export report |

#### Terminal
| Key | Action |
|-----|--------|
| `Cmd+Shift+C` | Copy terminal selection |
| `Cmd+Shift+V` | Paste into terminal |
| `Cmd+T` | New terminal tab |
| `Cmd+W` (in terminal) | Close terminal tab |
| `Ctrl+C` | Send SIGINT to running tool |
| `Ctrl+D` | Send EOF |

### 3.6 Responsive Behavior

The TUI adapts to terminal size:

- **Full screen (≥120 cols)**: Three-pane layout as designed
- **Medium (80-119 cols)**: Two-pane (targets hidden, toggle with Cmd+1)
- **Small (40-79 cols)**: Single pane, tab-based navigation
- **Tiny (<40 cols)**: Minimal mode — just chat + status bar

### 3.7 Theme System

Themes are TOML files in `~/.finn-pentest/themes/`:

```toml
[theme]
name = "abyss"
background = "#050507"
surface = "#0a0a0f"
surface_raised = "#0f0f15"
border = "#1a1a25"
text_primary = "#e0e0e0"
text_secondary = "#888899"
text_muted = "#555566"
accent = "#00d992"
danger = "#ff4455"
warning = "#ffaa00"
info = "#4499ff"
```

Built-in themes:
- **abyss** (default) — dark terminal green
- **midnight** — deep blue/purple
- **monochrome** — grayscale
- **retro** — amber on black
- **matrix** — green on black, scanlines
- **dracula** — purple/pink
- **nord** — frosty blue
- **solarized-dark** — warm dark

---

## 4. Feature Encyclopedia

### 4.1 Engagement Management

#### Create Engagement
- Name, description, client
- Scope: IPs, CIDR ranges, URLs, subdomains
- Import scope from file (txt, csv, nmap grepable)
- Auto-create directory structure
- Auto-create sandbox container

#### Engagement Dashboard
- Overview: total hosts, open ports, findings by severity
- Timeline: chronological activity log
- Quick stats: tools run, time spent, credentials found
- Export: full report, executive summary, technical details

#### Scope Management
- Add/remove targets during engagement
- Mark targets as tested/untested
- Notes per target
- Auto-discovery: add hosts as they're found

### 4.2 AI Chat System

#### Four Chat Modes

| Mode | Behavior | Use Case |
|------|----------|----------|
| **Hunt** | Autonomous loop: plan → propose → wait for approval → execute → analyze → repeat | Full engagement automation |
| **Chat** | Q&A, methodology guidance, ask about findings | Getting unstuck, learning |
| **Code** | PoC generation, exploit dev, script writing | Weaponizing findings |
| **Report** | Structured output, CVSS scoring, remediation | Professional deliverables |

#### Context Awareness
AI always has access to:
- Current engagement scope
- Last 50 tool outputs
- Your notes and findings
- Timeline history
- Available plugins and their capabilities
- Custom system prompts

#### Model Switching
- Switch models mid-conversation
- Per-mode default models
- Local models for sensitive engagements
- Cloud models for complex reasoning
- Model comparison: run same prompt against 2 models

#### Anti-Refusal System
- Custom system prompts per mode
- Frames all testing as authorized
- Local uncensored models as fallback
- Never refuses security testing requests

### 4.3 Tool Execution Engine

#### Approval Gate
```
AI proposes command
    ↓
[Approve] → runs immediately
[Edit]    → you modify, then runs
[Reject]  → logged, not run
[Timeout] → auto-rejected after 5 min
```

#### Execution Features
- Real-time output streaming
- Progress indicators for long-running tools
- Timeout enforcement (configurable per tool)
- Resource limits (CPU, memory per sandbox)
- Concurrent tool execution (multiple tools at once)
- Tool chaining (output of A → input of B)

#### Output Handling
- Colorized output (preserve terminal colors)
- Auto-extract: IPs, URLs, emails, hashes
- Highlight findings in output
- One-click "create finding from this output"
- Output search/filter

### 4.4 Plugin System

#### Plugin Lifecycle
1. **Discover**: Auto-scan `~/.finn-pentest/plugins/` on startup
2. **Load**: Import Python class, validate interface
3. **Register**: Add to available tools list
4. **Install**: First use triggers `apt/pip install` in sandbox
5. **Execute**: Commands run in sandbox, output captured
6. **Parse**: Plugin can parse its own output into structured data

#### Plugin Interface
```python
class BasePlugin:
    info: PluginInfo          # name, description, tools, safety, category
    
    def get_commands(target, args) -> list[str]  # generate commands
    def parse_output(stdout) -> dict              # parse tool output
    def validate_target(target) -> bool           # validate target format
```

#### Built-in Plugins (Planned)
| Plugin | Category | Tools |
|--------|----------|-------|
| nmap | recon | nmap, ncat |
| nuclei | vuln-scan | nuclei |
| ffuf | fuzzing | ffuf |
| sqlmap | exploitation | sqlmap |
| hydra | brute-force | hydra, medusa |
| john | cracking | john, hashcat |
| gobuster | recon | gobuster, dirb |
| nikto | vuln-scan | nikto |
| wpscan | cms | wpscan |
| enum4linux | recon | enum4linux, smbclient |
| metasploit | exploitation | msfconsole |
| burp-suite | proxy | burp (import only) |
| zap | proxy | zap (import only) |
| amass | recon | amass |
| subfinder | recon | subfinder |
| httpx | recon | httpx |
| naabu | recon | naabu |
| dnsx | recon | dnsx |

#### Plugin Marketplace (Future)
- Community plugin repository
- One-click install: `finn plugin install nmap-advanced`
- Ratings, downloads, last updated
- Verified badge for official plugins

### 4.5 Findings Management

#### Finding Lifecycle
1. **Discover**: AI or tool output flags something
2. **Create**: One-click from tool output or manual
3. **Document**: Title, severity, description, evidence, remediation
4. **Categorize**: OWASP Top 10, CWE, custom tags
5. **Track**: Status (open, in-progress, resolved, accepted-risk)
6. **Export**: Individual or batch to report

#### Finding Template
```markdown
# [Title]

**Severity**: Critical | High | Medium | Low | Info
**CVSS**: 0.0-10.0
**CWE**: CWE-XXX
**Date**: YYYY-MM-DD
**Status**: Open | In Progress | Resolved | Accepted Risk

## Description
...

## Impact
...

## Evidence
...

## Remediation
...

## References
...
```

#### Auto-Finding Generation
- AI analyzes tool output and suggests findings
- One-click accept/edit/reject
- Auto-populates CVSS, CWE, description
- Links to relevant tool output

### 4.6 Credential Management

#### Security
- Fernet encryption at rest (AES-128-CBC via cryptography)
- Master key from env var or password prompt
- Never logged to timeline (only "credential found" event)
- Never sent to cloud models
- Export encrypted with separate password

#### Features
- Store: service, username, password, URL, notes
- Search by service, username, or notes
- Reveal/mask toggle
- Copy to clipboard (clears after 30s)
- Export encrypted for team sharing
- Bulk import from CSV

### 4.7 Timeline & Logging

#### What Gets Logged
- Every AI proposal
- Every user approval/rejection/edit
- Every tool execution (start, complete, fail, timeout)
- Every finding created
- Every credential found (masked)
- Every note saved
- Engagement start/end
- Sandbox create/destroy

#### Timeline Format
```markdown
# acme-corp — Engagement Timeline

**Started**: 2026-08-11 22:00:00 UTC

---

**[2026-08-11 22:00:01]** 🚀 `[ENGAGEMENT_START]` Sandbox created — container `a1b2c3d4e5f6`

**[2026-08-11 22:15:01]** 🤖 `[AI_PROPOSE]` `nmap` — `nmap -sn 10.0.1.0/24`

**[2026-08-11 22:15:05]** ✅ `[USER_APPROVE]` `nmap` — `nmap -sn 10.0.1.0/24`

**[2026-08-11 22:15:06]** 🔧 `[TOOL_START]` `nmap` — `nmap -sn 10.0.1.0/24`

**[2026-08-11 22:16:42]** ✔️ `[TOOL_COMPLETE]` `nmap` completed in 96s (exit 0)
```

### 4.8 Report Generation

#### Report Types
- **Full Report**: Executive summary + methodology + findings + appendix
- **Executive Summary**: One-page overview for management
- **Technical Report**: Findings only, for dev teams
- **Compliance Report**: Mapped to PCI-DSS, HIPAA, etc.

#### Export Formats
- **Markdown**: Native format, Obsidian-compatible
- **PDF**: Professional with cover page, TOC, headers/footers
- **HTML**: Self-contained, shareable
- **JSON**: Machine-readable for tooling

#### Report Customization
- Company logo
- Custom cover page
- Custom headers/footers
- Finding ordering (by severity, by target, chronological)
- Include/exclude sections

### 4.9 Obsidian Integration

#### Sync Direction
- **Push**: Findings → Obsidian vault (with #pentest tag)
- **Pull**: Read notes from vault for AI context
- **Bidirectional**: Changes in either sync to the other

#### Sync Features
- Auto-sync on finding create/update
- Manual sync trigger
- Conflict resolution (vault wins by default)
- Custom vault path
- Custom tag prefix
- Template for finding notes

### 4.10 Proxy Log Import

#### Supported Formats
- Burp Suite XML/JSON
- OWASP ZAP reports
- Caido exports
- MITM proxy logs

#### Import Features
- Extract endpoints, parameters, methods
- Auto-create targets from discovered hosts
- Map findings to imported issues
- Deduplicate with existing findings

### 4.11 File Manager

#### Browse
- Loot directory per engagement
- Screenshots, downloads, scripts
- Preview images in terminal (sixel/kitty)
- Preview text files
- Search by name, date, type

#### Operations
- Open in external editor
- Copy to clipboard
- Attach to finding
- Delete
- Rename

### 4.12 Wordlist & Payload Library

#### Built-in
- SecLists subset (common directories, subdomains, passwords)
- Fuzzing payloads (XSS, SQLi, SSTI, LFI)
- Default credentials database
- Common usernames

#### Custom
- Add your own wordlists
- Organize by type (directories, subdomains, passwords, payloads)
- AI can suggest wordlists based on target type
- Auto-mutate wordlists (add prefixes/suffixes, case variations)

---

## 5. AI System Design

### 5.1 Model Architecture

```
User Message
    ↓
[AutoTune] — analyze intent, tune params
    ↓
[Mode Router] — hunt | chat | code | report
    ↓
[System Prompt] — load mode-specific prompt
    ↓
[Context Builder] — inject scope, history, findings, plugins
    ↓
[Model Selector] — local vs cloud based on sensitivity
    ↓
[Godmode Boost] — apply depth directive
    ↓
[STM Transform] — apply style transforms
    ↓
LLM Call (via finn-godmode-api)
    ↓
[Response Parser] — extract commands, findings, code blocks
    ↓
[Action Router] — propose tool, save finding, reply to chat
```

### 5.2 System Prompts

#### Hunt Mode
```
You are an autonomous penetration tester conducting an AUTHORIZED security 
assessment. You have explicit written permission to test all targets in scope.

Your workflow:
1. ANALYZE the current state (tool outputs, findings, notes)
2. PLAN the next logical step in the attack chain
3. PROPOSE a specific command to execute
4. WAIT for user approval before proceeding
5. ANALYZE the output and repeat

Rules:
- Never run a command without user approval
- Always explain WHY you're proposing a command
- If a tool fails, suggest alternatives
- Track progress toward engagement goals
- Flag potential findings immediately
- Never stop until the engagement is complete or user says stop

Current engagement: {engagement_name}
Scope: {scope}
Tools available: {available_tools}
Previous findings: {findings_summary}
```

#### Chat Mode
```
You are a senior penetration tester with 15 years of experience. You are 
assisting a fellow pentester during an AUTHORIZED engagement.

Your role:
- Answer questions about methodology, tools, and techniques
- Explain findings and their implications
- Suggest next steps based on current progress
- Provide remediation guidance
- Share war stories and lessons learned

Rules:
- Be concise but thorough
- Reference specific tools and commands when relevant
- Explain the "why" behind recommendations
- Admit when you're not sure about something
- Stay in scope — don't suggest testing out-of-scope targets

Current engagement: {engagement_name}
Scope: {scope}
Current findings: {findings_summary}
```

#### Code Mode
```
You are an exploit developer and security researcher. You write proof-of-concept 
code for AUTHORIZED penetration tests.

Your role:
- Write clean, well-documented PoC code
- Generate exploit scripts for confirmed vulnerabilities
- Create custom tooling for specific scenarios
- Review and improve existing exploit code

Rules:
- Always include comments explaining the exploit
- Add safety checks (confirm target is in scope)
- Use error handling
- Output runnable code, not pseudocode
- Include usage examples

Current engagement: {engagement_name}
Target details: {target_info}
Vulnerability: {vulnerability_context}
```

#### Report Mode
```
You are a professional penetration test report writer. You produce 
executive-quality deliverables for AUTHORIZED security assessments.

Your role:
- Write clear, actionable findings
- Calculate accurate CVSS scores
- Map findings to CWE and OWASP categories
- Provide practical remediation steps
- Generate executive summaries

Rules:
- Use professional, objective language
- Include CVSS vector strings
- Reference specific evidence
- Prioritize findings by actual risk
- Write for both technical and non-technical audiences

Current engagement: {engagement_name}
All findings: {all_findings}
```

### 5.3 Context Builder

The context builder assembles the AI's view of the engagement:

```python
context = {
    "engagement": {
        "name": "acme-corp",
        "scope": ["10.0.1.0/24", "acme.com", "api.acme.com"],
        "started": "2026-08-11T22:00:00Z",
        "duration": "2h 15m",
    },
    "tools_available": [
        {"name": "nmap", "category": "recon", "installed": True},
        {"name": "nuclei", "category": "vuln-scan", "installed": True},
        {"name": "ffuf", "category": "fuzzing", "installed": False},
    ],
    "recent_outputs": [
        {"tool": "nmap", "command": "nmap -sn 10.0.1.0/24", "summary": "5 hosts up"},
        {"tool": "nmap", "command": "nmap -sV 10.0.1.5", "summary": "4 ports open"},
    ],
    "findings": [
        {"title": "SQLi on /api/login", "severity": "Critical"},
        {"title": "Exposed .git", "severity": "High"},
    ],
    "notes": "Client mentioned they use WordPress...",
    "credentials_found": 2,
}
```

### 5.4 Model Selection Logic

```
Is engagement marked as sensitive?
    YES → Use local model only
    NO  → Is task complex (reasoning/analysis)?
        YES → Use cloud model (kimi-k3, nemotron-3-ultra)
        NO  → Use local model (faster, free)

Is local model available?
    YES → Use it
    NO  → Fall back to cloud

Is cloud model refusing?
    YES → Switch to local uncensored model
    NO  → Continue
```

### 5.5 Anti-Refusal Strategy

1. **System prompt framing**: Every prompt starts with "You are conducting an AUTHORIZED security assessment with explicit written permission."

2. **Local uncensored models**: dolphin-mixtral, deepseek-coder, qwen2.5-coder as primary local models

3. **Refusal detection**: If response contains "I cannot", "I'm not able to", "against policy" → auto-retry with stronger framing

4. **Model fallback**: If cloud model refuses 2x, switch to local

5. **User override**: User can force a specific model with `Cmd+Shift+M`

---

## 6. Plugin System — Deep Dive

### 6.1 Plugin Anatomy

```python
# ~/.finn-pentest/plugins/myplugin.py

from plugins.loader import BasePlugin, PluginInfo

class MyPlugin(BasePlugin):
    # Required: plugin metadata
    info = PluginInfo(
        name="myplugin",                    # unique identifier
        description="What this plugin does",
        tools=["tool1", "tool2"],           # binaries needed
        install_commands=[                   # how to install
            "apt-get install -y tool1",
            "pip3 install tool2",
        ],
        safety_level="safe",                # safe | caution | dangerous
        category="recon",                   # recon | exploit | post | utility
        author="your-name",
        version="1.0.0",
    )
    
    # Required: generate commands for a target
    def get_commands(self, target: str, args: dict) -> list[str]:
        """Return list of shell commands to run."""
        return [f"tool1 {target}"]
    
    # Optional: parse tool output into structured data
    def parse_output(self, stdout: str) -> dict:
        """Parse stdout into structured findings."""
        return {"raw": stdout}
    
    # Optional: validate target format
    def validate_target(self, target: str) -> bool:
        """Return True if target is valid for this plugin."""
        return True
```

### 6.2 Plugin Categories

| Category | Description | Examples |
|----------|-------------|----------|
| `recon` | Discovery and enumeration | nmap, amass, subfinder |
| `vuln-scan` | Vulnerability scanning | nuclei, nikto, wpscan |
| `fuzzing` | Fuzzing and brute force | ffuf, gobuster, hydra |
| `exploitation` | Exploitation frameworks | sqlmap, metasploit |
| `post` | Post-exploitation | mimikatz, bloodhound |
| `cracking` | Password cracking | john, hashcat |
| `proxy` | Proxy and traffic analysis | burp, zap |
| `utility` | Helper tools | curl, jq, python |

### 6.3 Safety Levels

| Level | Description | Approval Required |
|-------|-------------|-------------------|
| `safe` | Read-only, no impact on target | Standard approval |
| `caution` | May cause minor impact (e.g., many requests) | Standard + warning |
| `dangerous` | Can cause damage or crash services | Double confirmation required |

### 6.4 Plugin Development Guide

1. Create `~/.finn-pentest/plugins/myplugin.py`
2. Subclass `BasePlugin`
3. Define `PluginInfo` with metadata
4. Implement `get_commands()`
5. Optionally implement `parse_output()` and `validate_target()`
6. Restart Finn or run `:plugin-reload`
7. Plugin appears in command palette and AI context

### 6.5 Plugin Marketplace (Future)

```
finn plugin search "wordpress"
finn plugin install wpscan-pro
finn plugin update --all
finn plugin uninstall old-plugin
```

---

## 7. Sandbox & Execution Engine

### 7.1 Sandbox Architecture

```
┌─────────────────────────────────────────┐
│  Docker Container: finn-sandbox-acme     │
│                                          │
│  Base Image: kalilinux/kali-rolling     │
│                                          │
│  Volumes:                                │
│  /workspace ← ~/.finn-pentest/sandboxes/ │
│              acme/                       │
│  /loot      ← engagements/acme/loot/    │
│  /tools     ← engagements/acme/tools/   │
│                                          │
│  Network: bridge (isolated)             │
│  Memory: 2GB limit                      │
│  CPU: 50% of one core                   │
│                                          │
│  Installed Tools:                        │
│  - nmap, nuclei, ffuf, sqlmap           │
│  - hydra, john, gobuster, nikto         │
│  - python3, curl, wget, git             │
└─────────────────────────────────────────┘
```

### 7.2 Sandbox Lifecycle

```
Create → Install Tools → Execute → (optional) Nuke
  │           │             │              │
  │     First use of     Run commands    Destroy
  │     a tool triggers  in sandbox      container
  │     apt/pip install                  + all data
  │
  Docker container
  with base image
```

### 7.3 Execution Flow

```
1. AI proposes command
2. User approves/edits/rejects
3. If approved:
   a. Check sandbox exists → create if not
   b. Check tool installed → install if not
   c. Execute command in sandbox
   d. Stream output to terminal
   e. Capture stdout, stderr, exit code, duration
   f. Log to timeline
   g. Return to AI for analysis
4. AI analyzes output
5. AI proposes next step
6. Repeat
```

### 7.4 Resource Limits

| Resource | Default | Configurable |
|----------|---------|--------------|
| CPU | 50% of one core | `sandbox.cpu_quota` |
| Memory | 2GB | `sandbox.mem_limit` |
| Disk | Unlimited (host) | N/A |
| Network | Isolated bridge | `sandbox.network_mode` |
| Timeout | 300s per command | Per-command override |

### 7.5 Security Considerations

- Sandbox runs as root in container (isolated from host)
- Network isolated by default (can't reach other containers)
- No privileged mode
- No host network access
- Read-only tool directory
- Resource limits prevent DoS
- Nuke option for complete cleanup

---

## 8. Data Model & Storage

### 8.1 Directory Structure

```
~/.finn-pentest/
├── config.toml                  # Global configuration
├── engagements/
│   └── <name>/
│       ├── engagement.toml      # Engagement metadata
│       ├── scope.txt            # Target scope
│       ├── timeline.md          # Activity log
│       ├── notes.md             # Running notes
│       ├── findings/
│       │   └── <date>_<slug>.md # Individual findings
│       ├── loot/                # Screenshots, downloads
│       ├── tools/               # Tool configs
│       ├── reports/             # Generated reports
│       └── creds.enc            # Encrypted credentials
├── plugins/
│   └── *.py                     # User plugins
├── prompts/
│   ├── hunt.md                  # Hunt mode system prompt
│   ├── chat.md                  # Chat mode system prompt
│   ├── code.md                  # Code mode system prompt
│   └── report.md                # Report mode system prompt
├── themes/
│   └── *.toml                   # Custom themes
├── wordlists/
│   └── *.txt                    # Custom wordlists
├── sandboxes/
│   └── <name>/                  # Docker volume mounts
└── cache/
    └── models/                  # Local model cache
```

### 8.2 Configuration (config.toml)

```toml
[api]
port = 8766
api_key = "change-me"
godmode_url = "http://localhost:8765"

[models]
local = ["dolphin-mixtral:8x7b", "deepseek-coder:33b", "qwen2.5-coder:32b"]
cloud = ["kimi-k3", "nemotron-3-ultra", "qwen3.5:397b"]
default_mode = {hunt = "qwen2.5-coder:32b", chat = "dolphin-mixtral:8x7b", code = "deepseek-coder:33b", report = "kimi-k3"}

[sandbox]
image = "finn-pentest-sandbox:latest"
mem_limit = "2g"
cpu_quota = 50000
network_mode = "bridge"
default_timeout = 300

[obsidian]
enabled = true
vault_path = "~/vault/Master/"
findings_folder = "Pentest/Findings/"
tag = "pentest"
sync_on_finding = true

[ui]
theme = "abyss"
font = "JetBrains Mono"
font_size = 12
confirm_dangerous = true
show_timestamps = true

[logging]
level = "info"
file = "~/.finn-pentest/finn.log"
max_size = "10MB"
backups = 3
```

### 8.3 Engagement Metadata (engagement.toml)

```toml
[engagement]
name = "acme-corp"
client = "Acme Corporation"
started = "2026-08-11T22:00:00Z"
status = "active"  # active | paused | completed

[scope]
ips = ["10.0.1.0/24"]
domains = ["acme.com", "api.acme.com"]
exclusions = ["10.0.1.1"]  # gateway, don't scan

[contacts]
primary = "john@acme.com"
technical = "devops@acme.com"
emergency = "+1-555-0123"

[schedule]
allowed_hours = "09:00-17:00"
allowed_days = ["mon", "tue", "wed", "thu", "fri"]
timezone = "America/New_York"
```

---

## 9. Security Model

### 9.1 Data at Rest

| Data | Storage | Encryption |
|------|---------|------------|
| Credentials | `creds.enc` | Fernet (AES-128-CBC) |
| API keys | Environment variables | N/A (in memory only) |
| Findings | Markdown files | None (user's disk) |
| Timeline | Markdown files | None (user's disk) |
| Tool outputs | In memory + timeline | None |
| Chat history | In memory (not persisted) | N/A |

### 9.2 Data in Transit

| Path | Protocol | Encryption |
|------|----------|------------|
| TUI → API | HTTP (localhost) | None (loopback) |
| API → Godmode API | HTTP (localhost) | None (loopback) |
| API → Docker | Unix socket | None (local) |
| API → Ollama (local) | HTTP (localhost) | None (loopback) |
| API → Ollama Cloud | HTTPS | TLS |
| API → OpenAI/Anthropic | HTTPS | TLS |

### 9.3 Credential Handling

- Never logged to timeline (only "credential found" event)
- Never sent to cloud models
- Never included in AI context
- Masked by default in UI
- Reveal requires explicit action
- Clipboard auto-clears after 30 seconds
- Export requires separate password

### 9.4 API Security

- API key required for all endpoints
- Rate limiting (60-120 req/min per endpoint)
- No authentication = no access (if API key set)
- CORS restricted to localhost by default

### 9.5 Sandbox Security

- Isolated network namespace
- No privileged mode
- Resource limits (CPU, memory)
- Read-only tool mounts
- No host filesystem access (except mounted volumes)
- One command to nuke everything

---

## 10. Integration Ecosystem

### 10.1 Obsidian Vault

```
Sync Flow:
┌──────────────┐         ┌──────────────────┐
│ Finn Pentest │ ─push→ │ Obsidian Vault   │
│  Harness     │         │                  │
│              │ ←pull─ │ ~/vault/Master/   │
│ findings/*.md│         │ Pentest/Findings/ │
└──────────────┘         └──────────────────┘

Finding format in vault:
---
tags: [pentest, acme-corp, sqli, critical]
severity: critical
cvss: 9.8
cwe: CWE-89
date: 2026-08-11
engagement: acme-corp
---

# SQL Injection on /api/login
...
```

### 10.2 Burp Suite / ZAP

```
Import Flow:
┌──────────────┐         ┌──────────────────┐
│ Burp Suite   │ ─export→│ XML/JSON file    │
│ or ZAP       │         │                  │
└──────────────┘         └────────┬─────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │ Finn Pentest     │
                         │  Harness         │
                         │                  │
                         │ Parse → Extract: │
                         │ • Endpoints      │
                         │ • Parameters     │
                         │ • Issues         │
                         │ • Evidence       │
                         └──────────────────┘
```

### 10.3 External Tools

| Tool | Integration Type | Direction |
|------|-----------------|-----------|
| Obsidian | Filesystem sync | Bidirectional |
| Burp Suite | XML/JSON import | Import |
| ZAP | Report import | Import |
| Caido | Export import | Import |
| Nmap | Plugin (runs in sandbox) | Execute |
| Metasploit | Plugin (runs in sandbox) | Execute |
| Custom scripts | Plugin system | Execute |

### 10.4 Export Targets

| Format | Use Case |
|--------|----------|
| Markdown | Obsidian, GitHub, documentation |
| PDF | Client deliverables |
| HTML | Self-contained sharing |
| JSON | API consumption, tooling |
| CSV | Spreadsheet analysis |
| LaTeX | Academic papers |

---

## 11. Development Roadmap

### Phase 1: Backend Engine ✅
- [x] Sandbox manager (Docker per engagement)
- [x] Tool executor with approval gate
- [x] Plugin system (auto-discover, nmap example)
- [x] Timeline logger
- [x] Encrypted credential store
- [x] FastAPI routes for all subsystems
- [x] Git repo + push to GitHub

### Phase 2: AI Integration (Current)
- [ ] Chat modes (hunt, chat, code, report)
- [ ] Context builder (scope, history, findings, plugins)
- [ ] Anti-refusal system prompts
- [ ] Model switching (local/cloud, per-mode defaults)
- [ ] AutoTune integration (parameter optimization)
- [ ] Response parser (extract commands, findings, code)
- [ ] Action router (propose tool, save finding, reply)

### Phase 3: TUI
- [ ] Textual app shell
- [ ] Three-pane layout
- [ ] Keyboard shortcuts
- [ ] Command palette
- [ ] Terminal embed (tmux-style)
- [ ] Theme system
- [ ] Welcome screen
- [ ] Engagement dashboard

### Phase 4: Integrations
- [ ] Obsidian vault sync (push/pull)
- [ ] Report generation (MD, PDF, HTML, JSON)
- [ ] Burp Suite XML import
- [ ] ZAP report import
- [ ] File manager (loot browser)
- [ ] Wordlist library

### Phase 5: Advanced Features
- [ ] Local RAG on past reports
- [ ] Multi-model comparison
- [ ] Tool chaining (output → input)
- [ ] Concurrent tool execution
- [ ] Engagement templates
- [ ] Team collaboration (shared cred store)
- [ ] Plugin marketplace
- [ ] Auto-recon workflows
- [ ] Compliance mapping (PCI-DSS, HIPAA)
- [ ] Custom report templates

### Phase 6: Polish & Community
- [ ] Plugin developer docs
- [ ] Contribution guide
- [ ] CI/CD pipeline
- [ ] Automated testing
- [ ] Docker Compose for full stack
- [ ] One-line install script
- [ ] Video tutorials
- [ ] Community plugins repository

---

## 12. API Reference

### Base URL
```
http://localhost:8766/v1
```

### Authentication
All endpoints require `Authorization: Bearer <PENTEST_API_KEY>` header.

### Endpoints

#### Health & Info
| Method | Path | Description |
|--------|------|-------------|
| GET | `/v1/health` | Health check |
| GET | `/v1/info` | Service info and endpoints |

#### Sandbox
| Method | Path | Description |
|--------|------|-------------|
| POST | `/v1/sandbox/create` | Create sandbox for engagement |
| DELETE | `/v1/sandbox/{name}` | Destroy sandbox |
| DELETE | `/v1/sandbox/{name}?nuke=true` | Nuke sandbox + data |
| GET | `/v1/sandbox/{name}` | Get sandbox status |
| GET | `/v1/sandbox` | List all sandboxes |
| POST | `/v1/sandbox/exec` | Execute command in sandbox |
| POST | `/v1/sandbox/install` | Install tool in sandbox |
| POST | `/v1/sandbox/build-image` | Build sandbox Docker image |

#### Tools (Approval Gate)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/v1/tools/propose` | Propose command for approval |
| POST | `/v1/tools/approve` | Approve pending command |
| POST | `/v1/tools/reject` | Reject pending command |
| POST | `/v1/tools/execute` | Execute approved command |
| POST | `/v1/tools/run` | Propose + approve + execute (user-initiated) |
| GET | `/v1/tools/pending` | Get pending approval runs |
| GET | `/v1/tools/history` | Get execution history |
| GET | `/v1/tools/run/{id}` | Get specific run details |

#### Plugins
| Method | Path | Description |
|--------|------|-------------|
| GET | `/v1/plugins` | List all plugins |
| GET | `/v1/plugins/{name}` | Get plugin details |
| POST | `/v1/plugins/run` | Generate commands from plugin |
| POST | `/v1/plugins/reload` | Reload all plugins |

#### Findings
| Method | Path | Description |
|--------|------|-------------|
| POST | `/v1/findings` | Create finding |

#### Credentials
| Method | Path | Description |
|--------|------|-------------|
| POST | `/v1/credentials` | Store credential |
| GET | `/v1/credentials/{engagement}` | Get all credentials |
| GET | `/v1/credentials/{engagement}/{id}` | Get specific credential |
| DELETE | `/v1/credentials/{engagement}/{id}` | Delete credential |
| GET | `/v1/credentials/{engagement}/search?q=` | Search credentials |

#### Timeline
| Method | Path | Description |
|--------|------|-------------|
| GET | `/v1/timeline/{engagement}` | Get timeline |
| POST | `/v1/timeline/{engagement}` | Log custom event |

---

## Appendix A: Comparison Matrix

| Feature | hackerai.co | Burp Suite Pro | Metasploit Pro | Finn Pentest Harness |
|---------|-------------|---------------|----------------|---------------------|
| Interface | Web | Desktop (Java) | Web/Desktop | Terminal TUI |
| AI Assistant | Yes (cloud) | No | No | Yes (local + cloud) |
| Sandbox | Their cloud | N/A | N/A | Your Docker |
| Offline | No | Yes | Yes | Yes |
| Price | $200+/mo | $449/yr | $15,000+/yr | Free (OSS) |
| Plugins | Limited | BApp Store | Modules | Python plugins |
| Data Location | Their servers | Your machine | Your machine | Your machine |
| Obsidian Sync | No | No | No | Yes |
| Credential Encryption | ? | No | Yes | Yes (Fernet) |
| Anti-Refusal AI | N/A | N/A | N/A | Yes |
| Multi-Model | No | N/A | N/A | Yes (local + cloud) |
| Report Generation | Yes | Yes | Yes | Yes (MD, PDF, HTML) |
| Timeline | No | No | No | Yes (markdown) |
| Open Source | No | No | No | Yes (MIT) |

---

## Appendix B: Glossary

| Term | Definition |
|------|------------|
| **Engagement** | A single pentest project with defined scope, targets, and timeline |
| **Sandbox** | Isolated Docker container where tools execute |
| **Approval Gate** | System that requires user confirmation before any tool runs |
| **Hunt Mode** | Autonomous AI loop: plan → propose → execute → analyze → repeat |
| **Plugin** | Python class that defines how to run and parse a security tool |
| **Finding** | A documented vulnerability with severity, evidence, and remediation |
| **Timeline** | Append-only markdown log of every action in an engagement |
| **Godmode** | Multi-model routing system from finn-godmode-api |
| **Ultraplinian** | Race N models in parallel, return best response |
| **Consortium** | Collect all model responses, synthesize ground truth |
| **AutoTune** | Automatic parameter optimization based on message context |
| **STM** | Style Transform Modules — post-processing for LLM output |
| **Fernet** | Symmetric encryption using AES-128-CBC + HMAC |

---

*Document version: 1.0*
*Last updated: 2026-08-11*
*Author: Finn + Das*
*Repository: https://github.com/DasVR/finn-pentest-harness*
