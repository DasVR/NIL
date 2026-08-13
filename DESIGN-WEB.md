# Pentesting / Lead-Gen Harness — Design System

> **Project**: Unified web dashboard for automated reconnaissance, lead generation, and penetration testing
> **Design Language**: Dark terminal / cyberpunk with deftones grunge influence
> **Motion DNA**: macOS/SwiftUI spring physics via Kinetics library patterns

---

## 1. Design Philosophy

### Core Principles
| Principle | Application |
|-----------|-------------|
| **Purposeful motion** | Every animation conveys state, feedback, or instruction |
| **Performance first** | 60fps GPU-composited only; no layout thrash |
| **Accessibility is design** | `prefers-reduced-motion`, keyboard nav, screen reader labels |
| **Terminal aesthetic** | Monospace, scanlines, noise, dithering — but usable |
| **Liquid Glass feel** | Blur, transparency, depth, spring physics — macOS 26 style |

### Personality Layers
- **Late-night energy** — Subtle glow pulses, not aggressive
- **Music references** — Deftones grunge, dithered textures
- **Hacker honesty** — No marketing fluff, raw data, raw tools
- **Age as asset** — Experienced, not trendy

---

## 2. Color System

### Primary Palette
```css
:root {
  /* Abyss system */
  --abyss: #050507;           /* Pure dark background */
  --surface: #0a0a0c;         /* Cards, panels */
  --elevated: #111113;        /* Modals, dropdowns */
  --border: #1a1a1e;          /* Dividers, borders */
  
  /* Text hierarchy */
  --text-primary: #e8e8e8;    /* Headlines, primary content */
  --text-secondary: #8a8a8e;  /* Secondary text, descriptions */
  --text-tertiary: #5a5a5e;   /* Muted, placeholders, disabled */
  
  /* Accent system */
  --accent: #00d992;          /* Primary actions, focus, success */
  --accent-dim: rgba(0, 217, 146, 0.4);  /* Glows, subtle backgrounds */
  --accent-glow: rgba(0, 217, 146, 0.13); /* Box shadows */
  
  /* Semantic */
  --danger: #ff4d4d;          /* Destructive, critical findings */
  --warning: #ffaa33;         /* Caution, medium findings */
  --success: #33ff88;         /* Success, low findings */
  --info: #4da6ff;            /* Info, links */
}
```

### Priority Tier Colors
```css
--tier-critical: #ff4d4d;    /* Red */
--tier-high: #ff8844;        /* Orange */
--tier-medium: #ffaa33;      /* Yellow */
--tier-low: #33ff88;         /* Green */
--tier-creative: #00d9ff;    /* Cyan */
```

---

## 3. Typography

### Font Stack
```css
/* Display / Code / Terminal */
--font-mono: 'JetBrains Mono', 'SF Mono', 'Fira Code', monospace;

/* UI Text / Body */
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
```

### Scale
| Token | Size | Weight | Use Case |
|-------|------|--------|----------|
| `--text-xs` | 11px | 400 | Labels, timestamps, badges |
| `--text-sm` | 13px | 400 | Body, descriptions |
| `--text-base` | 15px | 400 | Primary body |
| `--text-lg` | 17px | 500 | Emphasized body |
| `--text-xl` | 20px | 600 | Section headers |
| `--text-2xl` | 24px | 700 | Page titles |
| `--text-3xl` | 32px | 800 | Hero, giant type |
| `--text-4xl` | 48px | 800 | Massive hero (Monolog style) |

### Terminal Mode
```css
.terminal-font {
  font-family: var(--font-mono);
  font-size: 13px;
  line-height: 1.6;
  letter-spacing: 0.02em;
}
```

---

## 4. Motion System (Spring Physics)

### Easing Tokens (from Kinetics + Apple HIG)
```css
:root {
  /* Apple HIG: response/dampingRatio mapped to cubic-bezier */
  --ease-spring-snappy: cubic-bezier(0.16, 1, 0.3, 1);      /* response:0.3, damping:0.6 */
  --ease-spring-bouncy: cubic-bezier(0.34, 1.56, 0.64, 1);  /* response:0.15, damping:0.4 */
  --ease-spring-smooth: cubic-bezier(0.25, 0.1, 0.25, 1);   /* response:0.5, damping:0.8 */
  --ease-spring-heavy: cubic-bezier(0.22, 0.61, 0.36, 1);   /* response:0.8, damping:0.9 */
  
  /* Kinetics presets */
  --spring-card: spring(320, 24);      /* Card resize */
  --spring-button: spring(260, 28);    /* Button press */
  --spring-magnetic: magnet(0.35);     /* Magnetic pull */
  --spring-toast: overshoot(1.08);     /* Toast slide */
  --spring-accordion: spring(260, 28); /* Accordion */
  --spring-pin: spring(360, 22);       /* PIN input pop */
  
  /* Durations */
  --duration-instant: 0ms;
  --duration-fast: 150ms;
  --duration-normal: 250ms;
  --duration-emphasis: 400ms;
  --duration-hero: 800ms;
}
```

### Component Spring Assignments
| Component | Spring | Duration |
|-----------|--------|----------|
| Dock magnification | `--ease-spring-snappy` | 200ms |
| Window open/close | `--ease-spring-smooth` | 300ms |
| Button press | `--ease-spring-snappy` | 150ms |
| Card hover lift | `--ease-spring-snappy` | 200ms |
| Modal/Sheet | `--ease-spring-smooth` | 300ms |
| Toast/Notification | `--spring-toast` | 300ms |
| Page transition | `--ease-spring-smooth` | 400ms |
| Kanban drag | `--ease-spring-heavy` | 200ms |
| Accordion | `--spring-accordion` | 250ms |
| PIN/Input pop | `--spring-pin` | 150ms |
| Magnetic pull | `--spring-magnetic` | Continuous |

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  html { scroll-behavior: auto; }
}
```

---

## 5. Effects & Shaders (from Bookmarks)

### 5.1 Liquid Metal (`metal-fx`)
**Source**: `github.com/Jakubantalik/metal-fx`
**Package**: `npm i metal-fx`
**Usage**: Primary CTAs — "Start Scan", "Call Next", "Execute", "Generate Report"

```tsx
import { MetalFx } from 'metal-fx';

<MetalFx 
  preset="button" 
  reflectionTargets={[scanButtonRef, callButtonRef]}
  paused={false}
>
  <button className="scan-button">Start Scan</button>
</MetalFx>
```

**Presets**: `button`, `chip`, `icon`, `card`
**Reflection**: Scans only in dark mode, only for passed refs

### 5.2 Border Beam
**Source**: `beam.jakubantalik.com`
**Implementation**: CSS conic-gradient animation (no JS)

```css
.border-beam {
  position: absolute;
  inset: -2px;
  border-radius: inherit;
  background: conic-gradient(
    from 0deg,
    transparent 0deg,
    var(--accent) 60deg,
    transparent 120deg,
    transparent 180deg,
    var(--accent) 240deg,
    transparent 300deg
  );
  animation: border-beam-spin 6s linear infinite;
  mask: 
    linear-gradient(#fff 0 0) content-box, 
    linear-gradient(#fff 0 0);
  mask-composite: exclude;
  -webkit-mask-composite: xor;
}
```

**Usage**: Window chrome, feature cards, scan progress, call interface

### 5.3 Thinking Orbs
**Source**: `orbs.jakubantalik.com` / `npm i thinking-orbs`
**Package**: Zero deps, SSR-safe, auto dark/light
**Types**: `working`, `searching`, `solving`, `listening`, `composing`, `shaping`, `idle`, `error`, `success`

```tsx
import { ThinkingOrbs } from 'thinking-orbs';

<ThinkingOrbs 
  type="working"        // or "searching", "solving", etc.
  size="inline"         // "avatar" (64px) or "inline" (20px)
  speed={1}
  paused={false}
/>
```

**Usage**: 
- AI chat avatar (size="avatar", type="working")
- Inline thinking indicator (size="inline", type="composing")
- Tool execution (type="searching" → "solving")
- Scan progress (type="working")

### 5.4 Cuelume UI Sounds
**Source**: `npm i cuelume` (2KB, Web Audio API)
**Usage**: One attribute per element

```tsx
<button data-sound="click">Click me</button>
<input data-sound="toggle" type="checkbox" />
<div data-sound="hover">Hover me</div>
<button data-sound="success">Success</button>
<button data-sound="error">Error</button>
```

**Sounds**: `click`, `hover`, `toggle`, `success`, `error`, `notification`, `navigation`, `close`, `open`, `complete`

### 5.5 Noise Overlay
**Implementation**: SVG `feTurbulence` filter

```css
.noise-overlay::before {
  content: '';
  position: fixed;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  opacity: 0.03;
  mix-blend-mode: overlay;
  pointer-events: none;
  z-index: 9999;
}
```

### 5.6 Dithering Shaders
**Algorithms**: Bayer (ordered), Atkinson (Mac classic), Floyd-Steinberg
**Implementation**: Canvas/WebGL for images, CSS for backgrounds

```tsx
// Bayer dithering fragment shader
const bayerShader = `
  uniform sampler2D u_image;
  uniform float u_threshold;
  const mat4 bayer4 = mat4(
    0.0, 8.0, 2.0, 10.0,
    12.0, 4.0, 14.0, 6.0,
    3.0, 11.0, 1.0, 9.0,
    15.0, 7.0, 13.0, 5.0
  ) / 16.0;
  
  void main() {
    vec2 uv = gl_FragCoord.xy / 4.0;
    float threshold = bayer4[int(mod(uv.y, 4.0))][int(mod(uv.x, 4.0))];
    vec4 color = texture2D(u_image, vUv);
    float lum = dot(color.rgb, vec3(0.299, 0.587, 0.114));
    gl_FragColor = vec4(step(threshold, lum)) * color;
  }
`;
```

**Usage**: Hero images, lead screenshots, report covers (optional toggle in settings)

### 5.7 Scanlines (CRT Effect)
```css
.scanlines::after {
  content: '';
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0, 0, 0, 0.03) 2px,
    rgba(0, 0, 0, 0.03) 4px
  );
  pointer-events: none;
  opacity: 0.5;
}
```

---

## 6. Component Library

### 6.1 OS Shell Components

#### Dock
```tsx
// Floating macOS-style dock
// Spring magnification on hover (1.25x)
// Labels appear on hover
// Active indicator dot
// Keyboard navigable (Tab, Arrow keys, Enter)
```

#### Window
```tsx
// macOS chrome: traffic lights (close/min/max)
// Title bar with centered title
// Glass material background
// Border Beam on active
// Resizable, draggable (desktop)
```

#### CLI Terminal
```tsx
// Slide-up from bottom-right
// Commands: help, goto, scan, hunt, call, clear
// History with timestamps
// Spring entrance/exit
```

#### Menu Bar (Optional)
```tsx
// Top bar: App menu + Window + Help
// Keyboard shortcuts visible
// Search (Cmd+K) opens command palette
```

### 6.2 UI Primitives

#### Button
```tsx
<Button 
  variant="primary" | "secondary" | "ghost" | "danger" | "metal"
  size="sm" | "md" | "lg" | "xl"
  loading={boolean}
  sound="click" | "success" | "error"
>
```

**Variants**:
- `primary`: Neon green bg, abyss text, Liquid Metal on primary
- `secondary`: Elevated bg, border, text-primary
- `ghost`: Transparent, text-primary, hover → elevated
- `danger`: Red bg, abyss text
- `metal`: Liquid Metal wrapper (primary CTAs only)

#### Card
```tsx
<Card 
  variant="default" | "window" | "lead" | "finding"
  hover="lift" | "beam" | "none"
  borderBeam={boolean}
>
```

#### Input
```tsx
<Input
  type="text" | "search" | "email" | "tel"
  placeholder="..."
  icon={LucideIcon}
  sound="click"
/>
```

#### Select / MultiSelect
```tsx
<Select 
  options={[{ value, label, icon }]}
  multiple={boolean}
  searchable={boolean}
  sound="toggle"
/>
```

#### Badge
```tsx
<Badge 
  variant="critical" | "high" | "medium" | "low" | "creative" | "info"
  size="sm" | "md"
  dot={boolean}
/>
```

#### Table
```tsx
<Table 
  columns={[{ key, header, render }]}
  data={Lead[]}
  sortable={boolean}
  selectable={boolean}
  rowAction={onRowClick}
/>
```

#### Kanban Board
```tsx
<KanbanBoard
  columns={Stage[]}
  cards={LeadCard[]}
  onDragEnd={moveLead}
  onCardClick={openDetail}
  filterable={boolean}
  searchable={boolean}
/>
```

### 6.3 Domain Components

#### Scan Source Selector
```tsx
<SourceSelector
  sources={[
    { id: 'google-maps', label: 'Google Maps', icon: MapPin, enabled: true },
    { id: 'yelp', label: 'Yelp', icon: Star, enabled: true },
    { id: 'yellow-pages', label: 'Yellow Pages', icon: BookOpen, enabled: false },
    // ...
  ]}
  onChange={setSources}
/>
```

#### Scan Progress
```tsx
<ScanProgress
  jobId={string}
  realtime={true}
  showResults={boolean}
  onResult={handleResult}
/>
```

#### Lead Card (Pipeline)
```tsx
<LeadCard
  lead={Lead}
  score={LeadScore}
  onClick={openDetail}
  onDrag={handleDrag}
  compact={boolean}
/>
```

#### Lead Detail Slide-out
```tsx
<LeadDetail
  lead={Lead}
  audit={WebsiteAudit}
  score={LeadScore}
  contacts={ContactLog[]}
  calls={CallRecord[]}
  notes={LeadNote[]}
  tabs={['overview', 'audit', 'contact', 'call', 'notes']}
  onAction={handleAction}
/>
```

#### Call Interface
```tsx
<CallInterface
  lead={Lead}
  onInitiate={startCall}
  onEnd={endCall}
  recording={boolean}
  transcript={Transcript}
  analysis={CallAnalysis}
  talkingPoints={string[]}
/>
```

#### Hunt Chat
```tsx
<HuntChat
  mode="hunt" | "chat" | "code" | "report"
  messages={Message[]}
  onSend={sendMessage}
  onApprove={approveTool}
  onReject={rejectTool}
  proposedTool={ToolCall}
  yolo={boolean}
  model={string}
/>
```

#### Tool Output Panel
```tsx
<ToolOutput
  executionId={string}
  streaming={boolean}
  command={string}
  output={string}
  status="running" | "complete" | "error"
  collapsible={boolean}
/>
```

#### Approval Gate
```tsx
<ApprovalGate
  toolCall={ToolCall}
  riskLevel="safe" | "caution" | "dangerous"
  estimatedTime={number}
  onApprove={approve}
  onReject={reject}
  onEdit={edit}
/>
```

#### Report Builder
```tsx
<ReportBuilder
  findings={Finding[]}
  template="executive" | "technical" | "compliance"
  branding={Branding}
  onExport={exportReport}
/>
```

---

## 7. Page Layouts

### 7.1 Dashboard (Home)
```
┌─────────────────────────────────────────────────────────────────┐
│  Dock (floating)                                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌────────┐ │
│  │ Total Leads  │ │ High Priority│ │ Contacted    │ │ Deals  │ │
│  │    1,247     │ │     89       │ │  This Week   │ │ Closed │ │
│  │   +12%       │ │   🔴 Critical│ │     34       │ │   $47k │ │
│  └──────────────┘ └──────────────┘ └──────────────┘ └────────┘ │
│                                                                 │
│  ┌─────────────────────────────┐ ┌───────────────────────────┐ │
│  │ Recent Activity             │ │ Quick Actions             │ │
│  │ • Lead imported (2m ago)    │ │ [Start Scan 🔍] [Call ☎]  │ │
│  │ • Call completed (15m ago)  │ │ [New Hunt 🎯] [Report 📄] │ │
│  │ • Score updated (1h ago)    │ │ [Check Follow-ups ⏰]     │ │
│  └─────────────────────────────┘ └───────────────────────────┘ │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Pipeline Snapshot                                           ││
│  │ Discovered: 234 │ Researching: 45 │ Contacted: 67 │ ...   ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
  NoiseOverlay (fixed, 0.03 opacity)
```

### 7.2 Scan / Discover
```
┌─────────────────────────────────────────────────────────────────┐
│  Dock                                                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Sources                                    [SCAN ▼]  🔍     ││
│  │ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐   ││
│  │ │☑ GMaps│ │☑Yelp│ │☐ YP │ │☐Cham│ │☐ FB │ │☐ IG │ │☐Next│   ││
│  │ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘   ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│  ┌──────────────────────┐ ┌──────────────────────┐             │
│  │ Category             │ │ Location             │             │
│  │ [Plumbers ▼]         │ │ [Tampa, FL ▼] [25mi] │             │
│  └──────────────────────┘ └──────────────────────┘             │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Results (streaming in...)              [Import Selected]    ││
│  │ ┌─────────────────────────────────────────────────────────┐ ││
│  │ │ ☐ Acme Plumbing        📍 Tampa, FL  ⭐4.8  🌐 Website   │ ││
│  │ │    (813) 555-0123  •  127 reviews  •  Claimed ✓        │ ││
│  │ └─────────────────────────────────────────────────────────┘ ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 7.3 Pipeline (Kanban)
```
┌─────────────────────────────────────────────────────────────────┐
│  Dock                    [Filter ▼] [Sort ▼] [Search...]        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐  │
│  │ Discovered │ │Researching │ │ Contacted  │ │   Replied  │  │
│  │    (234)   │ │    (45)    │ │   (67)     │ │   (23)     │  │
│  ├────────────┤ ├────────────┤ ├────────────┤ ├────────────┤  │
│  │ ┌────────┐ │ │ ┌────────┐ │ │ ┌────────┐ │ │ ┌────────┐ │  │
│  │ │Acme🔴  │ │ │ │Bob's🟠 │ │ │ │Joe's🟡 │ │ │ │Mike🟢  │ │  │
│  │ │Plumb.. │ │ │ │Plumb.. │ │ │ │Plumb.. │ │ │ │Plumb.. │ │  │
│  │ │🌐87%  │ │ │ │🌐45%  │ │ │ │🌐62%  │ │ │ │🌐91%  │ │  │
│  │ └────────┘ │ │ └────────┘ │ │ └────────┘ │ │ └────────┘ │  │
│  │ ┌────────┐ │ │ ┌────────┐ │ │ ┌────────┐ │ │ ┌────────┐ │  │
│  │ │...     │ │ │ │...     │ │ │ │...     │ │ │ │...     │ │  │
│  │ └────────┘ │ │ └────────┘ │ │ └────────┘ │ │ └────────┘ │  │
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘  │
│                                                                 │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐  │
│  │  Meeting   │ │ Proposal   │ │  Client    │ │   Dead     │  │
│  │  Booked(12)│ │  Sent (8)  │ │   (34)     │ │   (56)     │  │
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 7.4 Lead Detail (Slide-out)
```
┌─────────────────────────────────────────────────────────────────┐
│  Dock                                                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────┐ ┌──────────────┐ │
│  │ Overview        Website Audit  Contact   │ │ Acme Plumb.. │ │
│  │   Call          Notes                      │ │ 🔴 Critical  │ │
│  ├──────────────────────────────────────────┤ │ 87 / 100     │ │
│  │                                            │ │ 🌐 Custom    │ │
│  │  📍 123 Main St, Tampa, FL 33602          │ │ ☎ (813)555.. │ │
│  │  🌐 acmeplumbing.com  •  ⭐ 4.8 (127)     │ │ 📧 owner@... │ │
│  │  ☑ Claimed  •  🕐 Mon-Fri 8-6             │ │              │ │
│  │                                            │ │ [Call Now]   │ │
│  │  Website Score: 87/100                    │ │ [Email]      │ │
│  │  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐     │ │ [Move Stage] │ │
│  │  │☑SSL │ │☑Dom │ │☑Mob │ │☑Spd │ │☑SEO │     │ [Priority]   │ │
│  │  └────┘ └────┘ └────┘ └────┘ └────┘     │ │ [Tag]        │ │
│  │                                            │ │ [Export PDF] │ │
│  │  Issues: None critical                    │ │ [Delete]     │ │
│  │  Screenshot: [Desktop] [Mobile]           │ └──────────────┘ │
│  └──────────────────────────────────────────┘                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 7.5 Call Center
```
┌─────────────────────────────────────────────────────────────────┐
│  Dock                        [Queue: 12 leads] [Call Next ▶]    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Active Call: Acme Plumbing                    02:34 ⏱       ││
│  │ [Mute] [Hold] [Keypad] [End Call 📞]                        ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ Talking Points                              Notes           ││
│  │ • Website: 87/100 - "Modern but generic"     [_______]     ││
│  │ • No booking system - upsell opportunity     [_______]     ││
│  │ • Competitor has 4.9 stars - mention gap     [_______]     ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Post-Call Analysis (auto-generated)                         ││
│  │ ✅ What went well: Built rapport, handled price objection   ││
│  │ ❌ What went wrong: Didn't ask about timeline               ││
│  │ 📋 Action Items: Send proposal by Fri, Follow up on booking ││
│  │ 📊 Sentiment: ▁▂▃▅▆▇█▇▆▅▃▂▁ (peaked at demo)               ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Call History                                                ││
│  │ Acme Plumbing    2:34  ✅  Proposal sent  [▶ Play] [📝]    ││
│  │ Bob's Plumbing   5:12  ❌  Not interested  [▶ Play] [📝]   ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 7.6 Hunt Mode (Pentest)
```
┌─────────────────────────────────────────────────────────────────┐
│  Dock              [YOLO: 🔴 OFF] MODE: hunt | MODEL: deepseek  │
├─────────────────────────────────────────────────────────────────┤
│  ┌────────────┐ ┌──────────────────────────────────────────────┐│
│  │ TARGETS    │ │ 🤖 Hunt Mode                                 ││
│  │            │ │                                              ││
│  │ ├ acme-corp│ │ You: Scan 10.0.1.0/24 for vulnerabilities    ││
│  │ │ ├ scope  │ │                                              ││
│  │ │ ├ tools  │ │ 🤖 I'll start with a comprehensive nmap scan ││
│  │ │ └ notes  │ │    to identify open ports and services.      ││
│  │ ├ client2  │ │                                              ││
│  │ └ client3  │ │ ┌──────────────────────────────────────────┐ ││
│  │            │ │ │ 🤖 Proposing: nmap -sV --script vuln     │ ││
│  │ 🔍 Cmd+K   │ │ │     10.0.1.0/24                            │ ││
│  │            │ │ │     Risk: 🟢 Safe  •  Est. time: 90s     │ ││
│  │ ⚙️ Tools   │ │ │     [Approve] [Reject] [Edit...]         │ ││
│  │ 📊 Reports │ │ └──────────────────────────────────────────┘ ││
│  │ 🔑 Creds   │ │                                              ││
│  │ 📝 Notes   │ │ ┌──────────────────────────────────────────┐ ││
│  │            │ │ │ $ nmap -sV --script vuln 10.0.1.0/24     │ ││
│  │ ────────── │ │ │ Starting Nmap 7.94...                    │ ││
│  │ 🤖 Models  │ │ │ 5 hosts up, 23 ports open                │ ││
│  │ Settings   │ │ │ PORT   STATE SERVICE  VERSION            │ ││
│  │            │ │ │ 22/tcp open  ssh     OpenSSH 8.9p1       │ ││
│  │ ────────── │ │ │ 80/tcp open  http    nginx 1.24.0        │ ││
│  │ YOLO: OFF  │ │ │ 443/tcp open https   nginx 1.24.0        │ ││
│  │            │ │ │ ...                                       │ ││
│  └────────────┘ └──────────────────────────────────────────────┘│
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 8. Responsive Breakpoints

| Breakpoint | Width | Layout Changes |
|------------|-------|----------------|
| Mobile | < 640px | Stacked cards, bottom sheet for detail, hamburger dock |
| Tablet | 640-1024px | 2-col grids, slide-over detail, compact dock |
| Desktop | 1024-1440px | Full layouts, slide-out detail, floating dock |
| Wide | > 1440px | 3-col grids, persistent sidebars, expanded dock |

### Mobile Dock
```tsx
// Bottom fixed bar with 5 icons
// No labels (tooltip on long press)
// Spring animation on tap
// Safe area inset for iPhone
```

---

## 9. Accessibility Checklist

### Motion
- [ ] `prefers-reduced-motion` disables ALL animations
- [ ] No auto-playing animations > 5s
- [ ] Pause/stop controls for any moving content

### Keyboard
- [ ] All interactive elements reachable via Tab
- [ ] Focus visible (Border Beam + accent ring)
- [ ] Logical tab order
- [ ] Escape closes modals, dropdowns, CLI
- [ ] Arrow keys navigate menus, kanban, tables

### Screen Readers
- [ ] Semantic HTML (button, nav, main, aside, section)
- [ ] ARIA labels on icon-only buttons
- [ ] Live regions for scan progress, call status
- [ ] Descriptive alt text for screenshots

### Color
- [ ] 4.5:1 contrast minimum (abyss + neon green = 8.2:1 ✓)
- [ ] Not color-only for status (icons + text + color)
- [ ] High contrast mode compatible

---

## 10. Settings Panel (Extensive Customization)

### Tabs
1. **General** — Theme, language, timezone, date format
2. **Appearance** — Dithering, scanlines, noise, reduced motion, font size
3. **Sources** — Enable/disable scrapers, API keys
4. **Scoring** — Rubric weights per factor, priority thresholds
5. **Pipeline** — Column names, colors, order
6. **Email** — SMTP, templates, signatures, tracking
7. **Calling** — Twilio/WebRTC, recording, transcription
8. **Notifications** — ntfy topic, events, push
9. **AI** — Providers, priority, models, cost limits, fallback
10. **Pentest** — Default tools, YOLO default, sandbox resources
11. **Advanced** — Debug mode, telemetry, backup/restore

---

## 11. Implementation Notes

### CSS Architecture
```
/src/app/globals.css          # Design tokens, base styles
/src/styles/
  ├── components.css          # Component-specific
  ├── effects.css             # BorderBeam, NoiseOverlay, scanlines
  ├── shaders.css             # Liquid Metal, dithering
  └── motion.css              # Spring keyframes, transitions
```

### Component Structure
```
/src/components/
  ├── os/                     # Dock, Window, CLI, MenuBar
  ├── effects/                # BorderBeam, LiquidMetal, ThinkingOrbs, NoiseOverlay
  ├── ui/                     # Primitives (Button, Card, Input, etc.)
  ├── scan/                   # SourceSelector, ScanProgress, ScanResults
  ├── pipeline/               # KanbanBoard, LeadCard, StageColumn
  ├── leads/                  # LeadDetail, WebsiteAudit, ContactLog
  ├── call/                   # CallInterface, Transcript, Analysis
  ├── hunt/                   # HuntChat, ToolOutput, ApprovalGate
  ├── reports/                # ReportBuilder, FindingCard, ExportModal
  └── settings/               # SettingsPanel, SettingsTabs
```

### Hooks
```typescript
// /src/hooks/
useScan.ts          // Scan job management
usePipeline.ts      // Kanban state, drag-drop
useLead.ts          // Lead detail, actions
useCall.ts          // Call state, recording, transcript
useHunt.ts          // Chat, tool execution, approval
useAI.ts            // AI chat, model switching
useSettings.ts      // Settings persistence
useSound.ts         // Cuelume integration
useReducedMotion.ts // Media query listener
```

---

## 12. Clarifications Needed Before Scaffold

| Decision | Options | Recommendation |
|----------|---------|----------------|
| **Calling** | Twilio vs WebRTC | Twilio (production-ready, your number) |
| **Transcription** | Local Whisper vs API | Local (privacy, free) + API fallback |
| **Auth** | Session cookie vs OAuth | Session cookie (MVP), OAuth later |
| **Pentest tools MVP** | Which subset? | nmap, nuclei, ffuf, gobuster |
| **Real-time** | SSE vs WebSockets | SSE (simpler, works with Next.js) |
| **Multi-user** | Single vs multi-tenant | Single-user (you) first |
| **Deploy** | `harness.dasdev.net` | Caddy + Cloudflare Tunnel ✓ |

---

Once confirmed, I'll write the complete DESIGN.md, push to GitHub, and delegate the full Next.js + FastAPI scaffold to Cursor. 🚀