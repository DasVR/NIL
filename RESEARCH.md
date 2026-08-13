# Pentest Harness Frontend — Deep Research & Competitive Analysis

> Compiled: August 13, 2026
> Focus: Desktop app (Tauri + Svelte 5) UI/UX, competitive features, bookmark research
> Sources: Twitter bookmarks, Apple HIG, Kinetics, Jakub Antalik components, competitive tools

---

## 1. Your Bookmarks — Component Library

### Border Beam (beam.jakubantalik.com)
- **What**: Animated light traveling along any container border using conic-gradient
- **Tech**: CSS-only, no JS required for animation. `border-radius: inherit` auto-detects
- **Use in pentest harness**: Active scan indicators, AI chat message borders, tool output cards, engagement status borders
- **CSS implementation**: conic-gradient + `animation: border-beam-spin 6s linear infinite`

### Thinking Orbs (orbs.jakubantalik.com)
- **What**: Pulsing animated orbs for "AI is thinking" / processing states
- **Tech**: CSS animation with `scale(1.2)` + opacity transitions
- **Use in pentest harness**: AI analysis loading, tool execution in progress, scan running states
- **CSS**: `@keyframes thinking-pulse { 0%,100% { opacity: 0.3; scale: 0.8 } 50% { opacity: 1; scale: 1.2 } }`

### Liquid Metal (metal.jakubantalik.com)
- **What**: WebGL liquid-metal shader effect for buttons/cards
- **Tech**: Three.js/Raw WebGL with proximity reflection between neighboring elements
- **Use in pentest harness**: Primary CTA buttons ("Run Scan", "Approve", "YOLO Mode"), active engagement cards
- **Note**: WebGL — needs graceful fallback for Safari/mobile (CSS border-beam fallback)

### Originkit (originkit.dev)
- **What**: 250+ free animated components, copy-paste ready
- **Tech**: React + Framer Motion or pure CSS
- **Use in pentest harness**: Scroll effects, hover states, page transitions, loading skeletons
- **Pattern**: `motion.div` with `whileHover`, `whileTap`, `transition={{ type: "spring", stiffness: 400, damping: 17 }}`

### Cuelume (npm)
- **What**: 2KB library, 10 UI sound effects via Web Audio API
- **Tech**: One HTML attribute per element — `data-sound="click"`, `data-sound="hover"`
- **Use in pentest harness**: Button clicks, toggle switches, scan complete chime, approval bell
- **Note**: Package may not exist on npm yet — verify before building

### 404 Animations (404.colorion.co)
- **What**: Pure CSS 404 page animations, no JS
- **Use in pentest harness**: Error states, tool execution failures, "no findings" empty states

---

## 2. Competitive Analysis — Features to Match/Exceed

### HackerAI.co / PentestGPT

**Core Architecture**:
```
Next.js + Supabase + OpenRouter
├─ Chat interface (streaming)
├─ Plugin system (20+ tools)
│  ├─ nuclei (vuln scanning) — PREMIUM
│  ├─ subfinder (subdomain enum)
│  ├─ katana (web crawler) — PREMIUM
│  ├─ httpx (HTTP prober) — PREMIUM
│  ├─ sqlmap (SQL injection) — PREMIUM
│  ├─ gau (URL fetching)
│  ├─ portscanner — PREMIUM
│  ├─ sslscanner — PREMIUM
│  ├─ whois
│  ├─ alterx (subdomain permutation)
│  ├─ linkfinder (JS endpoint extraction)
│  ├─ cvemap (CVE mapping)
│  └─ ... (20 total)
├─ Prompt builder with token budgeting
├─ Plugin-aware context truncation
├─ Premium gating (paywall on powerful tools)
└─ Cloud models only (OpenRouter/OpenAI/Anthropic)
```

**What They Do Well**:
- Clean chat interface with markdown rendering
- Tool execution results fed back into LLM loop
- Streaming responses
- Session persistence
- Plugin architecture (drop in new tools)

**What They Suck At**:
- No local model support
- Premium gating on basic tools
- No terminal integration
- No desktop app
- No YOLO mode (always approval-required)
- Closed source
- No Obsidian integration
- No sandbox isolation

---

### Claude Code (Anthropic)

**Features We Want**:
- `/edit` — Edit files inline with AI
- `/terminal` — Execute commands with approval
- `/web` — Search web for real-time info
- `/notebook` — Persistent context across sessions
- Agent loop: plan → execute → analyze → iterate
- Session-to-session messaging (agents talk to each other)

**Claude-specific**: Anti-refusal prompts, "computer use" tool, artifacts rendering

---

### Codex (OpenAI)

**Features We Want**:
- `codex` CLI command — works in any repo
- Sandboxed execution with `--full-auto` flag (YOLO equivalent)
- `--approval-mode` — ask, auto-edit, full-auto
- Git-aware: reads `.gitignore`, understands repo structure
- Shell command execution with human approval
- File editing with diff view

---

## 3. Pentest Harness — What The Desktop App Needs

### Layout (from DESIGN.md wireframe)
```
┌─────────────────────────────────────────────────────────────┐
│  Finn Pentest Harness                              ─ □ ✕  │
├──────────┬──────────────────────────────────────────────────┤
│          │                                                  │
│  🔍 Cmd+K│  🤖 AI Chat                                      │
│          │                                                  │
│  ────────│  ┌────────────────────────────────────────────┐  │
│          │  │ Scan 10.0.1.0/24 for vulnerabilities        │  │
│  📁 Eng  │  └────────────────────────────────────────────┘  │
│    acme  │                                                  │
│    client│  ┌────────────────────────────────────────────┐  │
│          │  │ 🤖 Running nmap -sV --script vuln...         │  │
│  ────────│  │     5 hosts up, 12 ports open               │  │
│          │  │     Found: SSH (22), HTTP (80), HTTPS (443)  │  │
│  ⚙️ Tools│  └────────────────────────────────────────────┘  │
│  📊 Repor│                                                  │
│  🔑 Creds│  ┌────────────────────────────────────────────┐  │
│  📝 Notes│  │ 💻 $ nmap output...                          │  │
│          │  │     [terminal output here]                   │  │
│          │  └────────────────────────────────────────────┘  │
│  ────────│                                                  │
│          │  ┌────────────────────────────────────────────┐  │
│  🤖 AI   │  │ 🎯 Proposed: nuclei -u http://10.0.1.5      │  │
│  Models  │  │     [Approve] [Reject] [Edit]                │  │
│  Settings│  └────────────────────────────────────────────┘  │
│          │                                                  │
├──────────┴──────────────────────────────────────────────────┤
│  [YOLO: 🔴 OFF] | MODE: hunt | MODEL: deepseek-v4-pro     │
└─────────────────────────────────────────────────────────────┘
```

### Key UI Patterns Needed

| Pattern | Where Used | Component Source |
|---------|-----------|----------------|
| **Border Beam** | Active scan cards, AI message borders, tool output | Jakub Antalik |
| **Thinking Orbs** | AI processing, tool running | Jakub Antalik |
| **Liquid Metal** | Primary CTAs, YOLO toggle | Jakub Antalik |
| **Noise Overlay** | Background texture, scanline effect | CSS feTurbulence |
| **Spring Physics** | All transitions, hover states | Kinetics/Framer |
| **Glass Material** | Sidebar, panels, modals | Apple HIG |
| **Mac OS Dock** | Quick actions, tool launcher | Christopher Fiore |
| **Chat Bubbles** | AI responses, tool output | HackerAI clone |
| **Terminal Embed** | Tool output, shell access | xterm.js |
| **Sound Effects** | Clicks, toggles, scan complete | Cuelume |

---

## 4. Feature Encyclopedia — What "Everything" Means

### Reconnaissance
- [ ] **Subdomain Enumeration**: subfinder, alterx, amass
- [ ] **Port Scanning**: nmap, masscan, naabu
- [ ] **Web Crawling**: katana, gau, hakrawler
- [ ] **Technology Fingerprinting**: wappalyzer, nuclei -tech-detect
- [ ] **DNS Enumeration**: dnsx, fierce
- [ ] **Screenshot Capture**: aquatone, gowitness
- [ ] **GitHub/GitLab Recon**: githound, trufflehog
- [ ] **SSL/TLS Analysis**: sslscan, testssl.sh
- [ ] **WHOIS Lookup**: whois, domaintools

### Vulnerability Scanning
- [ ] **Web Vulns**: nuclei (templates), sqlmap, dalfox, gf-patterns
- [ ] **Network Vulns**: nuclei, nmap vuln scripts
- [ ] **API Testing**: postman/newman, arjun, crudler
- [ ] **Container Scanning**: trivy, docker-bench
- [ ] **Cloud Security**: scout-suite, prowler, cloudmapper

### Exploitation
- [ ] **SQL Injection**: sqlmap (automated)
- [ ] **XSS**: dalfox, XSStrike
- [ ] **Command Injection**: commix
- [ ] **Path Traversal**: dotdotpwn
- [ ] **File Upload**: fuxploider
- [ ] **SSRF**: SSRFire
- [ ] **LFI/RFI**: lfisuite
- [ ] **JWT Attacks**: jwt_tool

### Post-Exploitation
- [ ] **Shell Access**: Reverse shell generators
- [ ] **Privilege Escalation**: linPEAS, winPEAS
- [ ] **Credential Dumping**: mimikatz (for CTFs), secretsdump
- [ ] **Lateral Movement**: crackmapexec, bloodhound
- [ ] **Persistence**: Custom backdoors, scheduled tasks

### Reporting
- [ ] **Findings Aggregation**: Auto-collect from all tools
- [ ] **CVSS Scoring**: Auto-calculate severity
- [ ] **Markdown Reports**: Export to Obsidian
- [ ] **PDF Reports**: Professional deliverables
- [ ] **Remediation Guidance**: AI-generated fixes
- [ ] **Evidence Screenshots**: Auto-capture proof

### AI Integration
- [ ] **Hunt Mode**: Autonomous recon → scan → analyze → report
- [ ] **Chat Mode**: Q&A, methodology, explain findings
- [ ] **Code Mode**: PoC generation, exploit development
- [ ] **Report Mode**: Structured findings, CVSS, remediation
- [ ] **Anti-Refusal**: Template racing, progressive upgrade, refusal recovery
- [ ] **Multi-Model**: Auto-failover, rate limit rotation, BYOM
- [ ] **Context Builder**: Engagement memory, tool output history, vault notes

---

## 5. Sound Design Strategy

### When to Use Audio
| Event | Sound | Library |
|-------|-------|---------|
| Button click | Subtle click (60ms) | Cuelume |
| Toggle switch | Soft snap | Cuelume |
| Scan start | Whoosh | Custom |
| Scan complete | Success chime | Custom |
| Finding discovered | Alert ping | Custom |
| YOLO mode ON | Warning tone | Custom |
| Tool approval needed | Bell | Custom |
| Error/failure | Soft thud | Cuelume |
| Hover over card | Micro-pop | Cuelume |
| Nav transition | Slide swoosh | Custom |

---

## 6. Questions for You

Before I build the full frontend, I need clarity on:

1. **Scope**: Are we building the full desktop app (Tauri + Svelte 5) or a web-based version first?
2. **Liquid Metal**: Do you want the WebGL liquid metal effect? It looks amazing but needs Three.js and may hurt mobile/Safari performance.
3. **Cuelume**: The npm package doesn't seem to exist yet. Do you want me to find an alternative UI sound library or build our own?
4. **Tool Execution**: Should the frontend execute tools directly (via Tauri backend → shell) or communicate with the existing Python backend via API?
5. **Pages**: The DESIGN.md shows a sidebar + chat layout. Do you also want separate pages (like the portfolio's `/work`, `/lab`, etc.) or is everything in the single desktop window?
6. **First Build**: What should I build first? Options:
   - A) Sidebar layout with chat + basic navigation
   - B) Tool execution panel with approve/reject flow
   - C) Settings panel for model selection, YOLO toggle, themes
   - D) Full page with all sections scaffolded

---

**Repo**: `https://github.com/DasVR/finn-pentest-harness` (branch `godmode-api`)
**Status**: RESEARCH.md pushed, 4 Svelte components built (Dock, Window, BorderBeam, ThinkingOrbs)
