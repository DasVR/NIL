# Pentesting / Lead-Gen Harness — Web App Specification

> **Project**: Unified web dashboard for automated reconnaissance, lead generation, and penetration testing
> **Stack**: Next.js 15 + React 19 + TypeScript + Tailwind CSS + FastAPI backend
> **Design**: Dark terminal aesthetic (#050507 abyss, #00d992 neon green) with macOS/SwiftUI motion DNA
> **UI Components**: Liquid Metal (WebGL), Border Beam, Thinking Orbs, Cuelume sounds, Noise dithering

---

## 1. Vision & Scope

### What This Is
A **single web application** that combines:
- **LeadVine**: Local business discovery → deep enrichment → scoring → pipeline → calling
- **Finn Pentest**: Target management → AI-driven recon → tool execution → findings → reports
- **Unified CLI/Terminal**: Command palette, keyboard shortcuts, terminal-style interaction

### Core Loop
```
Configure Sources/Targets → One-Click Scan → Deep Enrichment → Score & Rank → 
Pipeline/Kanban → Call/Email/Exploit → Track → Close/Report
```

---

## 2. Architecture

### Frontend (Next.js 15 App Router)
```
/src
├── app/
│   ├── (dashboard)/
│   │   ├── layout.tsx           # Global shell: Dock, CLI, NoiseOverlay
│   │   ├── page.tsx             # Dashboard home
│   │   ├── scan/page.tsx        # Discovery engine
│   │   ├── pipeline/page.tsx    # Kanban board
│   │   ├── leads/[id]/page.tsx  # Lead detail
│   │   ├── call/page.tsx        # Call center
│   │   ├── targets/page.tsx     # Pentest target management
│   │   ├── hunt/page.tsx        # AI hunt mode
│   │   ├── findings/page.tsx    # Findings management
│   │   ├── reports/page.tsx     # Report builder
│   │   └── settings/page.tsx    # Settings
│   ├── api/
│   │   ├── scan/route.ts        # Trigger scans
│   │   ├── enrich/route.ts      # Enrichment jobs
│   │   ├── score/route.ts       # Scoring
│   │   ├── call/route.ts        # Twilio/WebRTC
│   │   ├── ai/route.ts          # AI chat (proxied to FastAPI)
│   │   └── tools/route.ts       # Tool execution
├── components/
│   ├── os/                      # Dock, Window, CLI, MenuBar
│   ├── effects/                 # BorderBeam, LiquidMetal, ThinkingOrbs, NoiseOverlay
│   ├── ui/                      # Button, Card, Input, Table, Badge, Kanban
│   ├── scan/                    # SourceSelector, ScanConfig, ScanProgress
│   ├── pipeline/                # KanbanBoard, LeadCard, StageColumn
│   ├── leads/                   # LeadDetail, WebsiteAudit, ContactLog
│   ├── call/                    # CallInterface, Transcript, Analysis
│   ├── hunt/                    # ChatInterface, ToolOutput, ApprovalGate
│   └── reports/                 # ReportBuilder, FindingCard, ExportModal
├── hooks/                       # useScan, usePipeline, useCall, useAI
├── lib/                         # api, utils, constants, validators
├── types/                       # TypeScript interfaces
└── shaders/                     # LiquidMetal, Dithering shaders
```

### Backend (FastAPI)
```
/backend
├── app/
│   ├── api/
│   │   ├── v1/
│   │   │   ├── scan.py          # Google Maps, Yelp, YP, FB scrapers
│   │   │   ├── enrich.py        # Website audit, tech stack, SSL, speed
│   │   │   ├── score.py         # Rubric engine
│   │   │   ├── pipeline.py      # Kanban CRUD
│   │   │   ├── call.py          # Twilio, recording, Whisper
│   │   │   ├── ai.py            # AI router (multi-provider)
│   │   │   ├── tools.py         # Tool execution (nmap, nuclei, etc.)
│   │   │   └── targets.py       # Pentest target management
│   ├── core/
│   │   ├── config.py            # Settings
│   │   ├── security.py          # Auth, encryption
│   │   └── database.py          # SQLAlchemy + PostgreSQL
│   ├── models/
│   │   ├── lead.py              # Lead, WebsiteAudit, LeadScore
│   │   ├── pipeline.py          # PipelineStage, LeadNote, LeadTag
│   │   ├── call.py              # ContactLog, CallRecord
│   │   ├── target.py            # Target, Scope, Finding
│   │   └── scan.py              # ScanJob
│   ├── services/
│   │   ├── scraper.py           # Playwright-based scrapers
│   │   ├── enricher.py          # Website deep dive
│   │   ├── scorer.py            # Rubric calculation
│   │   ├── ai_router.py         # Multi-provider with failover
│   │   ├── tool_runner.py       # Docker sandbox execution
│   │   └── transcriber.py       # Whisper integration
│   └── workers/
│       ├── celery_app.py        # Background jobs
│       └── tasks.py             # Scan, enrich, score, transcribe
├── docker/
│   ├── Dockerfile.backend
│   ├── Dockerfile.scraper
│   └── docker-compose.yml
└── requirements.txt
```

---

## 3. Design System (from Finn + Bookmarks)

### Color Palette
```css
:root {
  --abyss: #050507;
  --surface: #0a0a0c;
  --elevated: #111113;
  --border: #1a1a1e;
  --text-primary: #e8e8e8;
  --text-secondary: #8a8a8e;
  --text-tertiary: #5a5a5e;
  --accent: #00d992;
  --accent-dim: rgba(0, 217, 146, 0.4);
  --accent-glow: rgba(0, 217, 146, 0.13);
  --danger: #ff4d4d;
  --warning: #ffaa33;
  --success: #33ff88;
}
```

### Spring Physics (Kinetics + Apple HIG)
```css
--ease-spring-snappy: cubic-bezier(0.16, 1, 0.3, 1);      /* 250ms */
--ease-spring-bouncy: cubic-bezier(0.34, 1.56, 0.64, 1);  /* 400ms */
--ease-spring-smooth: cubic-bezier(0.25, 0.1, 0.25, 1);   /* 300ms */
--ease-spring-heavy: cubic-bezier(0.22, 0.61, 0.36, 1);   /* 500ms */
--duration-fast: 150ms;
--duration-normal: 250ms;
--duration-emphasis: 400ms;
```

### Components from Bookmarks
| Component | Source | Implementation |
|-----------|--------|----------------|
| **Liquid Metal** | `metal-fx` (Jakubantalik) | WebGL shader for primary CTAs, scan buttons |
| **Border Beam** | `beam.jakubantalik.com` | Animated border on cards, windows, modals |
| **Thinking Orbs** | `orbs.jakubantalik.com` | AI thinking states (9 types: working, searching, solving, listening, composing, shaping) |
| **Cuelume Sounds** | `npm i cuelume` | `data-sound="click|hover|toggle|success|error"` on interactive elements |
| **Noise Overlay** | Custom | SVG `feTurbulence` at 0.03 opacity, full-screen |
| **Dithering** | Custom | Bayer/Atkinson on hero images, optional on all images |

---

## 4. Feature Specifications

### 4.1 Discovery Engine (LeadVine + Finn Targets)
**Sources** (toggleable checkboxes):
- Google Maps (Playwright)
- Yelp (Playwright + API)
- Yellow Pages (Playwright)
- Chamber of Commerce (API/scrape)
- Facebook Business (Playwright)
- Instagram (Playwright)
- Nextdoor (Playwright)
- BBB.org (scrape)
- Angi/HomeAdvisor (Playwright)
- Custom URL list (CSV upload)

**Scan Config**:
- Category (typeahead: plumbers, landscapers, dentists, etc.)
- Location (city/state/zip + radius slider 5-100mi)
- Max results (50/100/500/all)
- Deduplication across sources

**Extraction per Business**:
- Name, category, subcategory
- Address (validated), phone, email
- Website, social links
- Rating, review count, hours
- Photos, claimed status
- Competitors ("people also search for")

### 4.2 Deep Enrichment
**Website Audit** (async, background):
- HTTP status, redirects, final URL
- SSL validity, issuer, expiry
- Mobile responsive (viewport, media queries, flex/grid)
- Load speed (TTFB, FCP, LCP, total size via Lighthouse)
- Tech stack (Wappalyzer-style: WP, Wix, Squarespace, React, etc.)
- CMS + version + plugins/themes
- Subdomain detection
- Last updated (headers, sitemap, blog dates)
- Blog, contact form, booking, ecommerce
- SEO basics (title, meta, H1, alt, schema)
- Accessibility score (basic a11y)
- Screenshots (desktop + mobile)

**Business Deep Dive**:
- GBP completeness (photos, posts, Q&A, services)
- Review sentiment analysis
- Competitor analysis (nearby same-category)
- Domain age (WHOIS)
- Social activity (last post, frequency, engagement)
- Employee count indicators
- BBB rating + complaints
- License detection

### 4.3 Scoring Rubric
**Website Score (0-100)**:
| Factor | Weight | Criteria |
|--------|--------|----------|
| Has website | 30 | 0 if none, 30 if exists |
| Custom domain | 15 | 0 if subdomain, 15 if custom |
| SSL valid | 10 | 0 if none/expired, 10 if valid |
| Mobile responsive | 15 | 0 if broken, 15 if responsive |
| Modern design | 10 | 0 if pre-2018, 10 if modern |
| Load speed | 10 | 0 if >5s LCP, 10 if <2s |
| SEO basics | 5 | title, meta, headings |
| Contact form | 5 | 0 if no contact method |

**Lead Score (0-100)**:
| Factor | Weight |
|--------|--------|
| Website score | 40% |
| Online presence | 20% |
| Review sentiment | 15% |
| Business age/size | 10% |
| Competition gap | 15% |

**Priority Tiers**:
- 🔴 Critical (80-100) — No/trash website → Call today
- 🟠 High (60-79) — Bad site → Call this week
- 🟡 Medium (40-59) — Dated site → Pitch redesign
- 🟢 Low (0-39) — Good site → Nurture
- ⚪ Creative Upsell — "Okay but boring" → Stunning redesign pitch

### 4.4 Pipeline (Kanban)
**Columns**: Discovered → Researching → Contacted → Replied → Meeting Booked → Proposal Sent → Client → Dead

**Lead Card**: Name, category, score badge (color), priority stars, last contact date

**Actions**: View detail, add notes, log contact, drag-drop move, set priority, set reminder, tag, export PDF

### 4.5 Call Center (Built-in)
**Click-to-Call**: Twilio (forwards your number) OR WebRTC softphone
**Recording**: Auto-record (compliance notice) → MP3 attached to lead
**Transcription**: Whisper (local or API) → full transcript attached
**Post-Call Analysis**:
- What went well (tone, objections handled, rapport)
- What went wrong (missed opportunities, awkward pauses)
- Action items extracted
- Sentiment timeline
- Next steps auto-generated
**Pre-Call**: One-click prep card with talking points, website issues, competitor comparison

### 4.6 Pentest Hunt Mode (Finn)
**Targets Management**:
- Create engagement (name, scope CIDR/ranges, notes)
- Target tree (hierarchical: engagement → targets → sub-targets)
- Tool library per engagement (nmap, nuclei, ffuf, sqlmap, etc.)
- YOLO mode toggle (per-engagement)

**AI Chat Modes**:
| Mode | Model | Behavior |
|------|-------|----------|
| Hunt | DeepSeek V4 Pro | Autonomous: plan → execute → analyze → repeat |
| Chat | Grok 4.5 | Q&A, methodology, explain findings |
| Code | Kimi K3 | PoC generation, exploit dev, scripts |
| Report | Command-R | Structured findings, CVSS, remediation |

**Approval Gate** (Normal Mode):
- Shows command, risk level (🟢 safe / 🟡 caution / 🔴 dangerous), estimated time
- [Approve] [Reject] [Edit...]
- Batch: "Approve all safe for this engagement"

**YOLO Mode**:
- Auto-executes (still sandboxed, still logged, dangerous tools warn)
- User can pause/stop anytime
- Red "YOLO: ON" flashing badge

**Tool Execution**:
- Per-engagement Docker sandbox
- Output captured → parsed → shown in terminal + chat
- Timeline logger records everything
- Supported: nmap, nuclei, ffuf, gobuster, sqlmap, hydra, metasploit, burp, custom scripts

### 4.7 Findings & Reports
**Finding Structure**:
- Title, severity (Critical/High/Medium/Low/Info), CVSS
- Status (Confirmed/Potential/False Positive)
- Description, PoC, Impact, Remediation
- References (CWE, OWASP)

**Export**: Markdown, PDF (styled), JSON, DOCX

---

## 5. Pages & User Flows

### 5.1 Dashboard (Home)
- Stats cards: Total Leads, High Priority, Contacted This Week, Meetings, Deals Closed
- Recent activity feed
- Upcoming follow-ups (ntfy)
- Quick actions: "New Scan", "Call Next Lead", "Check Follow-ups", "New Hunt"
- Mini pipeline (counts per stage)

### 5.2 Scan / Discover
- Source checkboxes (visual cards with icons)
- Category input (typeahead)
- Location input (zip/city + radius slider)
- Big "SCAN" button with Border Beam + Liquid Metal
- Real-time results streaming in
- Select/deselect → "Import Selected" or "Import All"

### 5.3 Pipeline (Kanban)
- Full drag-drop (SortableJS)
- Columns as specified
- Lead cards with score badge, priority stars
- Click → slide-out detail panel
- Filter: score tier, category, source, priority, tag
- Sort: newest, priority, last contacted, score
- Search across all leads

### 5.4 Lead Detail (Slide-out)
**Tabs**: Overview | Website Audit | Contact Log | Call | Notes
**Actions Bar**: Call, Email, Move Stage, Priority, Tag, Export PDF, Delete

### 5.5 Call Center
- Queue sorted by priority
- "Call Next" button (auto-dials)
- During call: timer, mute, hold, notes, talking points sidebar
- After call: transcription starts, analysis card appears
- Call history with filters

### 5.6 Targets (Pentest)
- Engagement list (create new, switch)
- Target tree (add scope, notes per target)
- Tool library per engagement
- YOLO toggle
- Quick actions: "Scan All", "Run Nuclei", "Run Nmap"

### 5.7 Hunt Mode
- Chat interface (Claude/ChatGPT style)
- Tool output panels (collapsible)
- Approval gate inline
- Model selector (DeepSeek/Grok/Kimi/Ollama)
- Context indicator (tokens used)

### 5.8 Reports
- Finding list with filters
- Report builder (select findings, template, branding)
- Export modal (format, include/exclude sections)

### 5.9 Settings
- Sources (enable/disable, API keys)
- Scoring (adjust rubric weights)
- Pipeline (customize columns)
- Email (SMTP, templates, signatures)
- Calling (Twilio/WebRTC, recording)
- Notifications (ntfy, events)
- AI (providers, priority, fallback, cost tracking)
- Theme (dithering, scanlines, noise, reduced motion)

---

## 6. API Contracts

### Scan
```
POST /api/v1/scan
{ sources: string[], category: string, location: string, radius: number, max_results: number }
→ { job_id: string, status: "running" }

GET /api/v1/scan/{job_id}/stream
→ SSE: { type: "result" | "progress" | "complete", data: ... }
```

### Enrich
```
POST /api/v1/enrich
{ lead_ids: string[] }
→ { job_id: string }

GET /api/v1/enrich/{job_id}/status
→ { status, completed, total, current_lead }
```

### Score
```
POST /api/v1/score
{ lead_ids: string[] }
→ { scored: number }
```

### Pipeline
```
GET /api/v1/pipeline
→ { stages: { id, name, leads: Lead[] }[] }

PATCH /api/v1/pipeline/leads/{id}
{ stage_id: string, priority: number, tags: string[] }
→ { lead }
```

### Call
```
POST /api/v1/call/initiate
{ lead_id: string, method: "twilio" | "webrtc" }
→ { call_sid, recording_url, stream_url }

GET /api/v1/call/{call_sid}/transcript
→ { transcript, analysis, action_items }
```

### AI
```
POST /api/v1/ai/chat
{ mode: "hunt" | "chat" | "code" | "report", message: string, context: {...} }
→ { response, proposed_tool?, risk_level?, model_used }

POST /api/v1/ai/approve
{ tool_call_id: string, approved: boolean, edited_command?: string }
→ { execution_started: boolean }
```

### Tools
```
POST /api/v1/tools/execute
{ engagement_id: string, tool: string, args: string[], yolo: boolean }
→ { execution_id, status: "running" }

GET /api/v1/tools/executions/{id}/stream
→ SSE: { type: "stdout" | "stderr" | "exit", data: ... }
```

---

## 7. Data Models

### Lead
```typescript
interface Lead {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  description?: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  lat: number;
  lng: number;
  phone: string;
  phone_formatted: string;
  email?: string;
  website_url?: string;
  socials: { facebook?: string; instagram?: string; twitter?: string; linkedin?: string; yelp?: string };
  google_place_id?: string;
  yelp_business_id?: string;
  rating?: number;
  review_count?: number;
  hours_json?: string;
  photos_json?: string;
  source: string;
  source_url: string;
  claimed_status?: boolean;
  created_at: Date;
  updated_at: Date;
}
```

### WebsiteAudit
```typescript
interface WebsiteAudit {
  id: string;
  lead_id: string;
  has_website: boolean;
  url?: string;
  final_url?: string;
  ssl_valid?: boolean;
  ssl_issuer?: string;
  ssl_expires?: Date;
  is_mobile_responsive?: boolean;
  viewport_meta?: boolean;
  media_queries_detected?: boolean;
  tech_stack?: TechStack;
  is_subdomain?: boolean;
  subdomain_of?: string;
  load_time_ms?: number;
  ttfb_ms?: number;
  fcp_ms?: number;
  lcp_ms?: number;
  total_size_kb?: number;
  has_blog?: boolean;
  has_contact_form?: boolean;
  has_booking?: boolean;
  has_ecommerce?: boolean;
  seo_title?: string;
  seo_description?: string;
  has_h1?: boolean;
  has_alt_tags?: boolean;
  has_schema?: boolean;
  accessibility_score?: number;
  screenshot_desktop_path?: string;
  screenshot_mobile_path?: string;
  score_breakdown: ScoreBreakdown;
  overall_score: number;
  audited_at: Date;
}
```

### LeadScore
```typescript
interface LeadScore {
  id: string;
  lead_id: string;
  website_score: number;
  online_presence_score: number;
  review_sentiment_score: number;
  business_age_score: number;
  competition_gap_score: number;
  overall_score: number;
  priority_tier: 'critical' | 'high' | 'medium' | 'low' | 'creative_upsell';
  creative_upsell_flag: boolean;
  scored_at: Date;
}
```

### PipelineStage
```typescript
interface PipelineStage {
  id: string;
  lead_id: string;
  stage: 'discovered' | 'researching' | 'contacted' | 'replied' | 'meeting_booked' | 'proposal_sent' | 'client' | 'dead';
  moved_at: Date;
  moved_by: string;
}
```

### CallRecord
```typescript
interface CallRecord {
  id: string;
  contact_log_id: string;
  duration_seconds: number;
  recording_path?: string;
  transcript_path?: string;
  sentiment?: SentimentData;
  analysis?: CallAnalysis;
  action_items?: string[];
  talk_to_listen_ratio?: number;
  objection_count?: number;
}
```

### Target (Pentest)
```typescript
interface Target {
  id: string;
  engagement_id: string;
  parent_id?: string;
  name: string;
  type: 'network' | 'web' | 'host' | 'service';
  scope: string; // CIDR, URL, IP, etc.
  status: 'pending' | 'scanning' | 'enumerated' | 'exploited' | 'completed';
  notes?: string;
  tools_configured: string[];
  created_at: Date;
}
```

### Finding
```typescript
interface Finding {
  id: string;
  engagement_id: string;
  target_id?: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  cvss_score: number;
  status: 'confirmed' | 'potential' | 'false_positive';
  description: string;
  poc: string;
  impact: string;
  remediation: string;
  references: string[];
  evidence: string[];
  created_at: Date;
}
```

---

## 8. Performance & Accessibility Targets

### Performance
- **60fps** all animations (GPU-composited transforms only)
- **First Load JS** < 150 kB shared
- **LCP** < 2.5s on 3G
- **TTI** < 3.5s
- **Bundle** code-split by page (scan, pipeline, call, hunt, reports)

### Accessibility
- **WCAG 2.1 AA** minimum
- **prefers-reduced-motion** fully supported (all animations disabled)
- **Keyboard navigation** everywhere (Tab, Enter, Escape, Arrow keys)
- **Screen reader** labels on all interactive elements
- **Focus indicators** visible (Border Beam + accent glow)
- **Color contrast** ≥ 4.5:1 (abyss + neon green passes)

### Browser Support
- Chrome 120+, Firefox 120+, Safari 17+, Edge 120+
- Mobile Safari (iOS 17+), Chrome Android
- **No WebGL required** for core functionality (Liquid Metal is progressive enhancement)

---

## 9. Deployment

### Docker Compose Services
```yaml
services:
  postgres:
    image: pgvector/pgvector:pg16
  redis:
    image: redis:7-alpine
  backend:
    build: ./backend
    depends_on: [postgres, redis]
  scraper:
    build: ./backend -f Dockerfile.scraper
    deploy:
      resources:
        limits:
          memory: 2G
  celery:
    build: ./backend
    command: celery -A app.workers.celery_app worker -Q scan,enrich,score,call,ai
  celery-beat:
    build: ./backend
    command: celery -A app.workers.celery_app beat
  frontend:
    build: ./frontend
  caddy:
    image: caddy:2
    ports: ["80:80", "443:443"]
```

### Domains
- `harness.dasdev.net` — Main dashboard
- `api.harness.dasdev.net` — FastAPI backend
- `ws.harness.dasdev.net` — WebSocket for real-time updates

---

## 10. Implementation Priority

### Phase 1 (Week 1) — Skeleton + Core Scan
1. Next.js + FastAPI scaffold + Docker Compose
2. Database models + migrations
3. Dark terminal UI shell (Dock, CLI, NoiseOverlay, globals.css)
4. Google Maps scraper (Playwright)
5. Basic website checker (exists, SSL, mobile, subdomain)
5. Scan page with source checkboxes + real-time results
6. Import to pipeline

### Phase 2 (Week 2) — Pipeline + Enrichment
1. Kanban board (SortableJS) with drag-drop
2. Lead detail slide-out (Overview, Website Audit, Notes)
3. Deep website audit (screenshots, tech stack, SEO, speed)
4. Full scoring rubric
5. Dashboard stats

### Phase 3 (Week 3) — Calling + AI
1. Twilio click-to-call + recording
2. Whisper transcription (local)
3. Call analysis (sentiment, action items)
4. AI router (multi-provider, hunt/chat/code/report modes)
5. Approval gate + YOLO mode

### Phase 4 (Week 4) — Pentest Features
1. Target management (engagements, scope, tools)
2. Tool execution in Docker sandboxes
3. Timeline logger
4. Findings management
5. Report builder + export

### Phase 5 (Week 5) — Polish + Advanced
1. Liquid Metal + Border Beam on all CTAs
2. Thinking Orbs for AI states
3. Cuelume sounds
4. Dithering shaders
5. Settings panel (full customization)
6. Mobile responsive
7. Deploy + load test

---

## 11. Clarifications Needed

Before scaffolding, I need your call on:

1. **Frontend framework**: Next.js 15 (App Router) + React 19 ✓ or prefer something else?
2. **Real-time**: Server-Sent Events (SSE) for scan/enrich progress, or WebSockets for everything?
3. **Calling**: Twilio (production-ready, costs) or WebRTC (free, more complex)?
4. **Transcription**: Local Whisper (CPU, slower) or OpenAI Whisper API (fast, costs)?
5. **Auth**: Simple session cookie (MVP) or full OAuth (Google/GitHub)?
6. **Database**: SQLite (dev) → PostgreSQL (prod) ✓
7. **Pentest tools**: Which tools in MVP? (nmap, nuclei, ffuf minimum — add sqlmap, hydra?)
8. **YOLO default**: Off by default ✓, or per-engagement config?
9. **Multi-user**: Single-user (you) or multi-tenant from start?
10. **Deploy target**: `harness.dasdev.net` on your VPS via Caddy + Cloudflare Tunnel ✓?

---

Once you confirm these, I'll write the complete SPEC.md, push to GitHub, and delegate the full scaffold to Cursor. 🚀