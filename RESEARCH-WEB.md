# Pentesting / Lead-Gen Harness — Research Compilation

> **Compiled**: August 13, 2026
> **Sources**: Twitter bookmarks, LeadVine PLAN.md, Finn Pentest Harness DESIGN.md, reference sites

---

## 1. Twitter Bookmark Audit (UI/UX/Animation Components)

### 1.1 Jakub Antalik Components (Core Visual Effects)

| Component | Source | Package | Key Features |
|-----------|--------|---------|--------------|
| **Liquid Metal** | `metal-fx` / `metal.jakubantalik.com` | `npm i metal-fx` | WebGL liquid-metal shader for buttons/chips/icons; real-time animation; proximity reflection; single shared canvas; dark-mode only reflections; `paused` prop for off-screen |
| **Border Beam** | `beam.jakubantalik.com` | CSS-only (conic-gradient) | Animated light traveling along container borders; auto-detects border-radius; 6s linear loop; no JS required |
| **Thinking Orbs** | `orbs.jakubantalik.com` | `npm i thinking-orbs` | 9 hand-tuned states (working, searching, solving, listening, composing, shaping, idle, error, success); 2 sizes (avatar 64px, inline 20px); auto dark/light; SSR-safe; zero deps; speed/paused controls |

### 1.2 UI Sound Effects
| Library | Source | Size | Usage |
|---------|--------|------|-------|
| **Cuelume** | RoundtableSpace tweet | 2KB | `data-sound="click|hover|toggle|success|error|notification|navigation|close|open|complete"` — one attribute per element, Web Audio API, no config |

### 1.3 Other Bookmarked Tools
| Tool | Purpose | Relevance |
|------|---------|-----------|
| **Graft** | Stops AI agents relearning codebase | Context caching for pentest AI |
| **Agent-Reach** | AI reads X/Reddit/YouTube/GitHub | Research automation for recon |
| **Code Review Graph** | Maps codebase for Claude | 49% fewer tool calls, 89% fewer file reads |
| **Chatpack** | Open-source chat infrastructure | Reference for AI chat UI |
| **OpenWorker** | Andrew Ng's AI coworker desktop app | Desktop app architecture reference |
| **OpenNews MCP** | 85+ real-time news sources | Threat intel / CVE monitoring |
| **404 Animations** | Pure CSS 404 page animations | Error page inspiration |
| **Originkit** | 250+ free animated components | Component library reference |

---

## 2. Reference Site Analysis (Gold Standard Portfolios)

### 2.1 Sites Analyzed
1. **rauno.me** — Minimal top bar, smooth scroll, custom cursor
2. **bymonolog.com** — Giant typography, modal navigation, client ticker
3. **joshwcomeau.com** — Blog-first, personality, motion
4. **brittanychiang.com** — Clean, performant, accessible
5. **mainframe.com** — Terminal aesthetic, scanlines, CRT
6. **furo.io** — Dark mode, glass morphism, spring physics
7. **playfight.io** — WebGL shaders, liquid effects

### 2.2 Motion Patterns Extracted
| Pattern | Implementation |
|---------|----------------|
| Text scramble | Framer Motion `animate` with custom chars |
| Magnetic buttons | Cursor position → spring pull toward center |
| SVG draw | `stroke-dashoffset` animation |
| Scroll reveals | IntersectionObserver + spring |
| Page transitions | View Transitions API + spring |
| Parallax | Transform on scroll |
| Dot matrix | 5×7 bitmap glyphs |
| Noise overlay | SVG feTurbulence |
| Custom cursor | Canvas + requestAnimationFrame |
| Scroll progress | Fixed indicator + spring |

---

## 3. LeadVine Feature Research (from PLAN.md)

### 3.1 Discovery Engine
- **Sources**: Google Maps, Yelp, Yellow Pages, Chamber of Commerce, Facebook, Instagram, Nextdoor, BBB, Angi, Custom URLs
- **Config**: Category (typeahead), Location (zip/city + radius), Max results, Deduplication
- **Extraction**: Name, category, address, phone, email, website, socials, rating, reviews, hours, photos, claimed status, competitors

### 3.2 Deep Enrichment
- **Website**: HTTP status, SSL, mobile responsive, load speed (Lighthouse), tech stack (Wappalyzer), CMS detection, subdomain check, last updated, blog/contact/booking/ecommerce, SEO, accessibility, screenshots
- **Business**: GBP completeness, review sentiment, competitor analysis, domain age, social activity, employee indicators, BBB, licenses

### 3.3 Scoring Rubric
- **Website Score** (8 factors, 100 pts): Has site (30), Custom domain (15), SSL (10), Mobile (15), Modern design (10), Speed (10), SEO (5), Contact form (5)
- **Lead Score** (5 factors): Website (40%), Online presence (20%), Review sentiment (15%), Business age (10%), Competition gap (15%)
- **Tiers**: Critical (80-100), High (60-79), Medium (40-59), Low (0-39), Creative Upsell

### 3.4 Pipeline (Kanban)
- **Columns**: Discovered → Researching → Contacted → Replied → Meeting → Proposal → Client → Dead
- **Actions**: Detail, notes, contact log, drag-drop, priority, reminders, tags, export PDF

### 3.5 Call Center (Killer Feature)
- **Click-to-call**: Twilio (your number) or WebRTC
- **Recording**: Auto, compliance notice, MP3 attached
- **Transcription**: Whisper (local/API)
- **Post-call analysis**: What went well/wrong, action items, sentiment timeline, next steps
- **Pre-call prep**: Talking points, website issues, competitor comparison

---

## 4. Finn Pentest Harness Research (from DESIGN.md)

### 4.1 Dual Interface
1. **Terminal TUI** (Textual) — Three-pane tmux-style: Targets | Chat+Terminal | Notes+Findings
2. **Desktop App** (Tauri + Svelte 5) — Sidebar + main: Chat, Tool output, Approval gate

### 4.2 AI Chat Modes
| Mode | Model | Behavior |
|------|-------|----------|
| Hunt | DeepSeek V4 Pro | Autonomous: plan → execute → analyze → repeat |
| Chat | Grok 4.5 | Q&A, methodology, explain findings |
| Code | Kimi K3 | PoC generation, exploit dev, scripts |
| Report | Command-R | Structured findings, CVSS, remediation |

### 4.3 YOLO Mode
- Per-engagement toggle, bypasses approval gate
- Still sandboxed, still logged, dangerous tools warn
- User can pause/stop anytime
- Red flashing badge, auto-disable conditions

### 4.4 Approval Gate
- Risk levels: 🟢 Safe (read-only), 🟡 Caution (modifies state), 🔴 Dangerous (destructive)
- Batch approval for safe tools

### 4.5 Multi-Provider Auto-Rotation
- Priority order with cost tracking
- Silent failover on 429/timeout
- Per-engagement pinning

### 4.6 Plugin System
- Drop Python scripts in `~/.finn-pentest/plugins/`
- Auto-discovered, manifest.json, requirements.txt

---

## 5. Design System Decisions (Consolidated)

### 5.1 Color Palette (Finn + LeadVine Unified)
```css
--abyss: #050507;
--surface: #0a0a0c;
--elevated: #111113;
--border: #1a1a1e;
--text-primary: #e8e8e8;
--text-secondary: #8a8a8e;
--text-tertiary: #5a5a5e;
--accent: #00d992;        /* Neon green */
--accent-dim: rgba(0, 217, 146, 0.4);
--accent-glow: rgba(0, 217, 146, 0.13);
```

### 5.2 Spring Physics (Kinetics + Apple HIG)
```css
--ease-spring-snappy: cubic-bezier(0.16, 1, 0.3, 1);      /* 250ms */
--ease-spring-bouncy: cubic-bezier(0.34, 1.56, 0.64, 1);  /* 400ms */
--ease-spring-smooth: cubic-bezier(0.25, 0.1, 0.25, 1);   /* 300ms */
--ease-spring-heavy: cubic-bezier(0.22, 0.61, 0.36, 1);   /* 500ms */
```

### 5.3 Effects Stack (from Bookmarks)
1. **Liquid Metal** (metal-fx) — Primary CTAs only
2. **Border Beam** (CSS conic-gradient) — Windows, cards, modals
3. **Thinking Orbs** (thinking-orbs) — AI states
4. **Cuelume** — All interactive elements
5. **Noise Overlay** (SVG feTurbulence) — 0.03 opacity, full-screen
6. **Dithering** (Bayer/Atkinson) — Hero images, optional
7. **Scanlines** (CSS repeating-linear-gradient) — Toggleable

---

## 6. Technical Architecture (Unified)

### 5.1 Frontend: Next.js 15 App Router
```
/src/app/(dashboard)/
├── page.tsx           # Dashboard
├── scan/page.tsx      # Discovery
├── pipeline/page.tsx  # Kanban
├── leads/[id]/page.tsx # Lead detail
├── call/page.tsx      # Call center
├── targets/page.tsx   # Pentest targets
├── hunt/page.tsx      # AI hunt
├── findings/page.tsx  # Findings
├── reports/page.tsx   # Reports
└── settings/page.tsx  # Settings
```

### 5.2 Backend: FastAPI
```
/backend/app/api/v1/
├── scan.py      # Scrapers
├── enrich.py    # Website audit
├── score.py     # Rubric
├── pipeline.py  # Kanban
├── call.py      # Twilio/Whisper
├── ai.py        # AI router
├── tools.py     # Tool execution
└── targets.py   # Pentest targets
```

### 5.3 Background Workers
- **Celery + Redis** for scan, enrich, score, call, AI tasks
- **Playwright** for scraping (headless Chrome)
- **Docker sandboxes** per engagement for tool execution

---

## 6. Clarifications for Implementation

| Decision | Status | Options |
|----------|--------|---------|
| Calling | ⏳ Need decision | Twilio (prod-ready) vs WebRTC (free, complex) |
| Transcription | ⏳ Need decision | Local Whisper (privacy) vs OpenAI API (fast) |
| Auth | ⏳ Need decision | Session cookie (MVP) vs OAuth (Google/GitHub) |
| Pentest tools MVP | ⏳ Need decision | nmap, nuclei, ffuf, gobuster minimum |
| Real-time | ⏳ Need decision | SSE (simpler) vs WebSockets |
| Multi-user | ⏳ Need decision | Single-user (you) first |
| Database | ✅ Decided | SQLite → PostgreSQL |

---

## 7. Next Steps

1. **Confirm clarifications** (6 decisions above)
2. **Write final SPEC.md** (already done)
3. **Write final DESIGN.md** (already done)
4. **Push to GitHub** (done — `DasVR/pentest-harness-web`)
5. **Delegate scaffold to Cursor** with both docs as context
6. **Phase 1 build**: Scaffold + Scan page + Pipeline + Lead detail

---

**Repo**: https://github.com/DasVR/pentest-harness-web
**Commits**: 
- `89f5f83` — SPEC.md
- `58b89aa` — DESIGN.md