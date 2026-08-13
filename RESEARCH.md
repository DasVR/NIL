# Finn Pentest Harness — UI/UX Research

> Compiled: August 13, 2026
> Sources: Apple HIG, Kinetics, Jakub Antalik components, Twitter bookmarks, reference sites, Cursor MCP ecosystem

---

## 1. Reference Sites & Design Patterns

### PRYZM.DESIGN
- "Backgrounds nobody else has" — hero-first, tool-as-product positioning
- Minimal top nav: logo + 3 links + CTA
- Gradient/glass/grain backgrounds, restrained
- Card-based presets with hover lift + subtle scale
- **Takeaway**: Tool/studio framing for pentest features

### BEUI PRO (pro.beui.dev)
- 144 spring-physics micro-interactions, every component animated live
- Stiffness/damping readouts as design tokens
- Copy-paste CSS/React + AI prompts
- **Takeaway**: Spring tokens as CSS vars. Every button, card, input gets a spring.

### UNICORN.STUDIO
- WebGL/no-code shader motion — 75+ effects, 49kb SDK
- Strong value prop hierarchy
- **Takeaway**: Optional WebGL/dithered noise canvas for hero

### MONOLOG (bymonolog.com)
- Full-bleed typography, modal-based navigation
- Awwwards-winning motion, giant type
- **Takeaway**: Giant-type + modal-overlay for about/settings sections

### CHRISTOPHER FIORE
- Ultra-minimal OS interface: 4 buttons, no scroll
- Each button opens a modal/section
- **Takeaway**: OS app-feel — dock/launcher + section modals

---

## 2. Jakub Antalik Components (from your bookmarks)

| Component | URL | What It Is | Use In Pentest Harness |
|-----------|-----|-----------|----------------------|
| **Border Beam** | beam.jakubantalik.com | Animated light traveling along container borders | AI chat boxes, tool output cards, active scan indicators |
| **Thinking Orbs** | orbs.jakubantalik.com | Pulsing animated orbs for "AI thinking" | Loading states, scan-in-progress indicators |
| **Liquid Metal** | github.com/Jakubantalik/metal-fx | WebGL liquid-metal shader for buttons/cards | Primary CTAs, YOLO mode toggle, execute buttons |

---

## 3. Apple HIG Motion Principles

| SwiftUI Concept | Web/Svelte Translation |
|-----------------|----------------------|
| `spring(response, dampingRatio)` | CSS `cubic-bezier` or `linear()` easing tokens |
| `matchedGeometryEffect` | View Transitions API + `view-transition-name` |
| `NavigationSplitView` | Sidebar + main content layout |
| `Material.ultraThin` | `backdrop-filter: blur()` + noise overlay |
| `SF Symbols` | Lucide icons with 2px stroke |

**Spring presets**:
- Snappy: `response:0.3, dampingRatio:0.6` → `cubic-bezier(0.16, 1, 0.3, 1)`
- Bouncy: `response:0.15, dampingRatio:0.4` → `cubic-bezier(0.34, 1.56, 0.64, 1)`
- Smooth: `response:0.5, dampingRatio:0.8` → `cubic-bezier(0.25, 0.1, 0.25, 1)`

---

## 4. Dithering Strategy

**Layered approach**:
1. Base: dark abyss `#050507`
2. Noise overlay: SVG filter `feTurbulence` at 0.04 opacity
3. Dither mask: WebGL/canvas bayer dither on hero/scan output
4. Text/elements: subtle dithered shadows/borders using CSS masks
5. Reduced motion: static noise, no animated dither

**Algorithms**:
- **Ordered (Bayer)**: Clean grid pattern, predictable — terminal grid feel
- **Atkinson**: Apple Lisa/Mac classic, less artifacts — Mac classic nod
- **Floyd-Steinberg**: Organic error diffusion — photo dithering

---

## 5. Kinetics Spring Physics (144 presets)

| Effect | Spring Params | Use Case |
|--------|---------------|----------|
| Card Resize | `spring(320, 24)` | Critically damped height |
| Magnetic Button | `magnet(0.35)` | Cursor pull toward target |
| Number Counter | `spring(280, 18)` | Digit bump/overshoot |
| Toast Overshoot | `overshoot(1.08)` | Slides past rest |
| Tab Pill Glide | `glide(0.4s, custom)` | Indicator measures width |
| Accordion | `spring(260, 28)` | Max-height + chevron |
| Drag to Dismiss | `friction(0.92)` | Pointer-tracked, threshold |
| Hold to Confirm | `hold(800ms)` | Ring fills, early cancel — YOLO mode activation |
| Push Button | `press(60ms)` | Tactile depress, pure CSS |

---

## 6. UI Sound Effects

| Tool | What It Is | Use For |
|------|-----------|---------|
| **Cuelume** (npm) | 2KB library, 14 interaction sounds, Web Audio API | Button clicks, toggles, hovers, nav, scan complete alerts |

---

## 7. Cursor MCP Tools for Development

| Plugin/MCP | What It Does |
|-----------|-------------|
| **Shadcn MCP Server** | AI installs components first-shot |
| **Figma MCP** | Design-to-code pipeline |
| **GitHub MCP** | PRs, issues, repos from Cursor |
| **Browser MCP** | Puppeteer/Playwright visual testing |
| **Sequential Thinking MCP** | Multi-step reasoning for complex tasks |
| **Context7 MCP** | Up-to-date library docs injected into Cursor |

---

## 8. AI Agent Tools (for pentest harness features)

| Tool | What It Is | Use For |
|------|-----------|---------|
| **Graft** | Context engine — agents stop relearning codebase | Pentest harness caching layer |
| **Agent-Reach** | AI reads X/Reddit/YouTube/GitHub — zero API keys | Research automation, CVE monitoring |
| **Code Review Graph** | Maps codebase so AI only reads what changed | 49% fewer tool calls |
| **OpenWorker** | Andrew Ng's open-source AI coworker desktop app | Desktop app architecture reference |
| **OpenNews MCP** | 85+ real-time news sources, AI impact scores | Live CVE/news feeds |

---

## 9. Design Tokens for Pentest Harness

```css
:root {
  /* Abyss palette */
  --abyss: #050507;
  --surface: #0a0a0c;
  --elevated: #111113;
  --border: #1a1a1e;
  --text-primary: #e0e0e0;
  --text-secondary: #8a8a8e;
  --text-tertiary: #5a5a5e;
  --accent: #00d992;
  --accent-dim: rgba(0, 217, 146, 0.4);
  --accent-glow: rgba(0, 217, 146, 0.13);
  --danger: #ff4d4d;
  --warning: #ffaa33;
  --success: #33ff88;

  /* Spring easing */
  --ease-spring-bouncy: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-spring-snappy: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-spring-smooth: cubic-bezier(0.25, 0.1, 0.25, 1);
  --ease-spring-heavy: cubic-bezier(0.22, 0.61, 0.36, 1);

  /* Duration */
  --duration-fast: 150ms;
  --duration-normal: 250ms;
  --duration-emphasis: 400ms;
  --duration-hero: 800ms;
}
```

---

## 10. Competitive Analysis — Features to Match/Exceed

| Feature | Claude | HackerAI | Codex | Our Target |
|---------|--------|----------|-------|------------|
| AI Chat | ✅ | ✅ | ✅ | ✅ Multi-mode (hunt/chat/code/report) |
| Terminal Integration | ❌ | ✅ | ✅ | ✅ Full TUI + embedded xterm.js |
| YOLO/Auto-Execute | ❌ | ❌ | ❌ | ✅ Per-engagement toggle |
| Plugin System | ❌ | Limited | ❌ | ✅ Drop Python scripts, auto-discover |
| Local Models | ❌ | ❌ | ❌ | ✅ Any OpenAI-compatible endpoint |
| Anti-Refusal | Partial | ❌ | ❌ | ✅ Template racing + progressive upgrade |
| Desktop App | ❌ | ❌ | ❌ | ✅ Tauri native |
| TUI | ❌ | ✅ | ❌ | ✅ Textual-based |
| Obsidian Integration | ❌ | ❌ | ❌ | ✅ Native vault sync |
| Sandbox Execution | ❌ | ❌ | ❌ | ✅ Per-engagement isolation |
| Multi-Model Router | ❌ | ❌ | ❌ | ✅ Auto-failover, rate limit rotation |
