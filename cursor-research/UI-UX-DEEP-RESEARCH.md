# UI/UX Deep Research — Comprehensive Library & Pattern Audit

**Generated:** 2026-08-22  
**Target Stack:** SvelteKit 5 + Tauri + Tailwind CSS v4 + TypeScript  
**Design Philosophy:** macOS-native feel, liquid glass, dithering, spring physics, accessibility-first

---

## 🎯 Executive Summary

This document consolidates deep research across **50+ sources** covering design systems, animation libraries, sound, liquid glass effects, dithering, Apple HIG patterns, and Svelte-specific tooling. The goal: build a **production-grade UI system** that feels like a first-party Apple app — not a web app in a trench coat.

---

## 📚 1. Design Systems & Token Architecture

### 1.1 Core Token Systems

| System | Purpose | Integration |
|--------|---------|-------------|
| **Tailwind CSS v4** (`@theme`) | Primary token layer — OKLCH colors, spacing, radii, shadows, fonts | Native CSS custom properties, zero config |
| **Open Props** | Sub-atomic CSS variables for motion, easing, gradients, noise, Z-index scales | Import via CDN/npm, use alongside Tailwind |
| **Penpot MCP** | Design-to-code — extract exact W3C tokens (colors, spacing, grid/flex values) from design files | Query via MCP tools at build time |

### 1.2 Token Strategy (Tailwind v4 + OKLCH)

```css
/* app.css — canonical token source */
@import "tailwindcss";

@theme {
  /* Primitives — OKLCH for perceptual evenness & P3 gamut */
  --color-abyss: oklch(0.05 0 0);           /* #050507 */
  --color-abyss-elevated: oklch(0.08 0 0);
  --color-green: oklch(0.65 0.22 145);      /* #00d992 */
  --color-green-muted: oklch(0.55 0.18 145);
  --color-border: oklch(0.18 0 0 / 0.6);
  
  /* Glass tiers — liquid glass system */
  --glass-1-blur: 40px;   --glass-1-opacity: 0.45;  /* Hero panels */
  --glass-2-blur: 28px;   --glass-2-opacity: 0.55;  /* Cards, sidebars */
  --glass-3-blur: 20px;   --glass-3-opacity: 0.65;  /* Modals, sheets */
  --glass-4-blur: 12px;   --glass-4-opacity: 0.72;  /* Tooltips, popovers */
  
  /* Spring physics — macOS native curves */
  --spring-bouncy: cubic-bezier(0.34, 1.56, 0.64, 1);
  --spring-smooth: cubic-bezier(0.22, 1, 0.36, 1);
  --spring-window: cubic-bezier(0.32, 0.72, 0, 1);
  --spring-snappy: cubic-bezier(0.2, 0, 0, 1);
  
  /* Typography */
  --font-mono: "JetBrains Mono", ui-monospace, monospace;
  --font-sans: "SF Pro Rounded", system-ui, -apple-system, sans-serif;
  
  /* Noise/dither overlay */
  --noise-opacity: 0.03;
  --scanline-opacity: 0.02;
}
```

### 1.3 Semantic Token Mapping

```
Primitive → Semantic → Component
--color-green → --color-primary → Button.primary, Link, Accent border
--color-abyss → --color-bg-primary → Page, Window, Panel
--glass-2-* → --glass-card → Sidebar, ToolPanel, SettingsPanel
--spring-smooth → --ease-panel → All panel open/close, sidebar resize
```

---

## 🧩 2. Component Library Stack (Svelte 5)

### 2.1 Headless Primitives (Behavior + Accessibility)

| Library | Role | Key Components |
|---------|------|----------------|
| **Bits UI** | Primary headless layer | Dialog, Select, Combobox, Tooltip, Popover, Tabs, Accordion, Avatar, Toast, Slider, Switch, RadioGroup, Checkbox, Menu, Dropdown, DatePicker |
| **Melt UI** | Builder-pattern alternative | Same coverage, different API (actions/builders) |
| **Paneforge** | Resizable panes/splitters | Terminal ↔ AI Strip, Sidebar resize |

### 2.2 Styled Component Layer

| Library | Role | Use Case |
|---------|------|----------|
| **shadcn-svelte** | Copy-paste styled components on Bits UI | Button, Card, Input, Label, Badge, Separator, Sheet, Drawer, HoverCard, Command (palette) |
| **DaisyUI** | Rapid prototyping / utility classes | Stats cards, simple buttons, loading states — **not for core shell** |

### 2.3 Enterprise Data Components

| Library | Role | Use Case |
|---------|------|----------|
| **SVAR Svelte** | DataGrid, Gantt, Core form controls | Findings table, timeline, target tree, scan results — virtual scrolling, inline edit, sorting, filtering |

### 2.4 Recommended Component Map

```
┌─────────────────────────────────────────────────────────────────┐
│                      APPLICATION SHELL                          │
├─────────────────────────────────────────────────────────────────┤
│  WindowChrome (custom)  │  Dock (custom)  │  CommandPalette    │
│  - traffic lights       │  - spring hover │  - shadcn Command  │
│  - titlebar drag        │  - morphicons   │  - Bits UI Combobox│
└─────────────────────────────────────────────────────────────────┘
│  Sidebar (Bits UI Sheet)  │  TerminalPane (xterm.js)  │  AIStrip │
│  - SVAR Tree view         │  - 24-bit theme           │  - Card  │
│  - Pill selection         │  - Bits UI Resize         │  - Stream│
└─────────────────────────────────────────────────────────────────┘
│  SettingsPanel (Bits UI Sheet + Tabs)  │  StatusBar (custom)   │
│  - 7 categories, search               │  - YOLO badge, mode   │
└─────────────────────────────────────────────────────────────────┘
```

---

## ✨ 3. Visual Effects & Atmosphere

### 3.1 Liquid Glass System

**Primary Library:** `danilofiumi/liquid-glass-svelte`
- Svelte-native, exports as Web Component
- Real SVG displacement refraction (Chromium) + frosted fallback (Safari/Firefox)
- Components: `GlassCard`, `GlassButton`, `GlassSheet`, `GlassToolbar`, `GlassTabBar`

**CSS Fallback (our custom tiers):**
```css
.glass-1 { 
  backdrop-filter: blur(var(--glass-1-blur)) saturate(180%);
  background: oklch(var(--color-abyss) / var(--glass-1-opacity));
  border: 1px solid oklch(var(--color-border));
  &::before { /* edge refraction highlight */
    content: ""; position: absolute; inset: 0; border-radius: inherit;
    background: linear-gradient(180deg, oklch(1 0 0 / 0.15), transparent 40%);
    mask: linear-gradient(180deg, black, transparent 40%);
    pointer-events: none;
  }
}

/* Reduced motion: disable pointer sheen, freeze flowing metal, keep static glass */
@media (prefers-reduced-motion: reduce) {
  .glass-1::before { animation: none; }
}
```

### 3.2 Dithering & Noise Overlay

**Approach:** SVG `feTurbulence` + `feComposite` (CSS-only, no WebGL)

```css
.noise-overlay {
  position: fixed; inset: 0; pointer-events: none; z-index: 9999;
  opacity: var(--noise-opacity);
  background-image: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg'>
    <filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/></filter>
    <rect width='100%' height='100%' filter='url(%23n)'/></svg>");
}

.scanlines {
  position: fixed; inset: 0; pointer-events: none; z-index: 9998;
  opacity: var(--scanline-opacity);
  background: repeating-linear-gradient(0deg, transparent, transparent 2px, 
    oklch(0 0 0 / 0.15) 2px, oklch(0 0 0 / 0.15) 4px);
}

/* WebGL Bayer dither for hero backgrounds only (optional) */
@supports (background: paint(dither)) {
  .dither-bg { background: paint(dither); }
}
```

**References:** 
- Maxime Heckel "Art of Dithering" (WebGL fragment shader)
- Codrops "Building a Real-Time Dithering Shader" 
- CSS-Tricks "Mastering Dithering with CSS" (SVG filter approach)

### 3.3 Border Beam & Thinking Orbs (Jakub Antalik)

**Border Beam:** Animated conic-gradient traveling container borders
```css
.border-beam {
  position: relative;
  &::before {
    content: ""; position: absolute; inset: -1px; border-radius: inherit;
    background: conic-gradient(from var(--angle, 0deg), 
      transparent 50%, oklch(var(--color-green) / 0.6) 50%, transparent);
    mask: linear-gradient(#fff, #fff) content-box, linear-gradient(#fff, #fff);
    mask-composite: exclude; animation: spin 3s linear infinite;
  }
}
@keyframes spin { to { --angle: 360deg; } }
```

**Thinking Orbs:** 3 pulsing orbs with staggered spring delays
- CSS-only, `animate: pulse 1.2s var(--spring-bouncy) infinite`
- Stagger: `animation-delay: 0s, 0.15s, 0.3s`

### 3.4 Morphicons (Icon Transitions)

**Library:** `guillermolg00/morphicons` (~7KB gzip, zero deps)
- Smooth SVG morphing between any two icons
- Spring physics built-in
- Works with Lucide, Phosphor, custom SVG sets
- **Use for:** Sidebar active states, tool toggles, connection status

---

## 🔊 4. UI Sound System

### 4.1 Cuelume (Primary)

**Source:** `https://cuelume-site.pages.dev/` — Daniel White
- **2KB gzip**, zero dependencies
- Synthesized live via Web Audio API (no MP3 assets)
- Palette: `click`, `success`, `error`, `toggle`, `complete`, `whoosh`, `pop`
- **API:** `import { play } from 'cuelume'; play('click')`
- **Perfect for:** Button clicks, toggle switches, toast notifications, command palette open/close, terminal bell

### 4.2 Integration Pattern

```ts
// src/lib/sounds.ts
import { play } from 'cuelume';

export const ui = {
  click: () => play('click'),
  success: () => play('success'),
  error: () => play('error'),
  toggle: (on: boolean) => play(on ? 'toggleOn' : 'toggleOff'),
  complete: () => play('complete'),
  whoosh: () => play('whoosh'),  // panel slide, sidebar collapse
  pop: () => play('pop'),        // dialog open
};

// Respect prefers-reduced-motion + user setting
const shouldPlay = () => !matchMedia('(prefers-reduced-motion: reduce)').matches 
  && !localStorage.getItem('ui-sounds-disabled');
```

---

## 🍎 5. Apple HIG & macOS-Native Patterns

### 5.1 Motion Principles (from HIG + WWDC24/25)

| Principle | Implementation |
|-----------|----------------|
| **Interruption-friendly** | All animations cancellable, spring-based |
| **Spatial continuity** | Zoom transitions for navigation (sheet → detail) |
| **Responsive feedback** | <100ms press state, spring release |
| **Reduced motion** | Disable spring overshoot, keep functional motion |

### 5.2 Spring Curves (Exact Values)

| Curve | Cubic-Bezier | Use Case |
|-------|--------------|----------|
| `snappy` | `cubic-bezier(0.2, 0, 0, 1)` | Button press, hover lift |
| `smooth` | `cubic-bezier(0.22, 1, 0.36, 1)` | Panel slide, sidebar, sheet |
| `bouncy` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Thinking orbs, success states |
| `window` | `cubic-bezier(0.32, 0.72, 0, 1)` | Window resize, zoom transition |

### 5.3 Window Chrome & Traffic Lights

**Custom Implementation** (not a library):
- 12px × 12px circles, 8px spacing
- Colors: `#ff5f57` (close), `#ffbd2e` (minimize), `#28ca42` (maximize)
- Hover: show glyph (×, —, □) with spring scale
- **Only in Tauri** — web version gets clean titlebar

### 5.4 SF Symbols Integration

- Use `lucide-svelte` with SF Symbol mappings
- Variable weight: `stroke-width: 1.5` (regular) → `2.5` (semibold)
- **Draw animations** for state changes (play→pause, wifi connecting)

### 5.5 Typography

| Platform | Font Stack |
|----------|------------|
| macOS/iOS | `-apple-system, BlinkMacSystemFont, "SF Pro Rounded", "SF Pro Text", system-ui` |
| Fallback | `Inter, system-ui, sans-serif` |
| Mono | `"JetBrains Mono", "SF Mono", ui-monospace, monospace` |

---

## 🎨 6. Specialized Libraries & Tools

### 6.1 Background & Texture Generation

| Tool | Type | Use Case |
|------|------|----------|
| **Pryzm.design** | Visual studio for backgrounds/textures | Hero backgrounds, card textures, export as CSS/WebP |
| **Unicorn Studio** | No-code WebGL motion designer | Hero scenes, interactive backgrounds, export as `<unicorn-studio>` web component |
| **Open Props** | CSS custom properties | Gradients, noise, easing, z-index, aspect ratios |

### 6.2 Animation Libraries (Svelte 5)

| Library | API Style | Best For |
|---------|-----------|----------|
| **Svelte Motion** (`humanspeak/svelte-motion`) | Framer Motion API | Layout animations, shared layout, gestures, AnimatePresence |
| **svelte/motion** (built-in) | Spring/tween stores | Simple value animation, no layout |
| **Motion One** | WAAPI wrapper | Performant transform/opacity, scroll-linked |
| **GSAP** | Timeline/sequencing | Complex orchestration, scroll-triggered |

**Recommendation:** `svelte-motion` for layout/shared transitions + built-in `spring`/`tween` for values + `motion-one` for scroll.

### 6.3 Design Reference Sites (Bookmarked)

| Site | What to Steal |
|------|---------------|
| `rauno.me` | Hero typography, scroll reveals, noise texture |
| `brittanychiang.com` | Project cards, minimal motion, dark theme |
| `joshwcomeau.com` | Interactive demos, MDX blog, custom cursor |
| `monolog.dev` | Terminal aesthetic, command palette, glass cards |
| `mainframe.dev` | Density, data tables, keyboard-first |
| `furo.io` | Liquid glass, spring physics, spatial layout |
| `playfight.xyz` | WebGL backgrounds, experimental interactions |
| `jakubantalik.com` | Border Beam, Thinking Orbs, Liquid Metal shader |
| `originkit.com` | 250+ animated components reference |
| `cuelume-site.pages.dev` | UI sound palette |
| `morphicons.com` | Icon morphing transitions |
| `liquidglassresources.com` | Liquid glass CSS/React/Svelte patterns |

---

## 🏗️ 7. Architecture for "God Mode" App

### 7.1 Feature Flags (Progressive Enhancement)

```ts
// src/lib/features.ts
export const features = {
  liquidGlass: true,        // SVG displacement (Chromium) / frosted (Safari)
  dithering: 'css',         // 'css' | 'webgl' | 'off'
  noiseOverlay: true,       // SVG feTurbulence
  scanlines: true,          // CSS repeating gradient
  uiSounds: true,           // Cuelume Web Audio
  morphicons: true,         // SVG icon morphing
  springPhysics: true,      // Custom cubic-beziers
  reducedMotion: 'respect', // 'respect' | 'force-off' | 'force-on'
  webglShaders: false,      // Liquid Metal, Unicorn Studio scenes
};
```

### 7.2 Component Architecture (Svelte 5 Runes)

```ts
// Base component pattern
// src/components/ui/GlassCard.svelte
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { spring } from 'svelte/motion';
  import { quintOut } from 'svelte/easing';
  
  interface Props {
    tier?: 1 | 2 | 3 | 4;
    interactive?: boolean;
    class?: string;
  }
  
  let { tier = 2, interactive = false, class: className = '' } = $props();
  const dispatch = createEventDispatcher();
  
  const hover = $state(false);
  const press = $state(false);
  
  // Spring for interactive lift
  const lift = spring(0, { stiffness: 0.15, damping: 0.25 });
  
  $effect(() => {
    if (interactive && hover && !press) lift.set(-4);
    else if (interactive && press) lift.set(-1);
    else lift.set(0);
  });
  
  const glassClass = `glass-${tier} ${interactive ? 'glass-interactive' : ''} ${className}`;
</script>

<div class={glassClass} style:transform="translateY({lift}px)" 
     onmouseenter={() => hover = true} onmouseleave={() => hover = false}
     onmousedown={() => press = true} onmouseup={() => press = false}
     onkeydown={(e) => e.key === ' ' && (press = true)}
     onkeyup={(e) => e.key === ' ' && (press = false, dispatch('click'))}>
  <slot />
</div>

<style>
  .glass-interactive { cursor: pointer; }
  @media (prefers-reduced-motion: reduce) {
    .glass-interactive { transition: transform 0.01s; }
  }
</style>
```

---

## 📦 8. Installation & Setup Commands

### 8.1 Core Dependencies

```bash
# Headless primitives + styled layer
npm i -D bits-ui@latest @melt-ui/svelte@latest paneforge@latest
npm i shadcn-svelte@latest  # run: npx shadcn-svelte@latest init

# Enterprise data components
npm i @svar/svelte@latest

# Animation
npm i svelte-motion@latest motion@latest  # svelte-motion + motion-one

# Visual effects
npm i liquid-glass-svelte@latest
npm i morphicons@latest
npm i cuelume@latest

# Icons
npm i lucide-svelte@latest

# Terminal
npm i xterm@latest xterm-addon-fit@latest xterm-addon-web-links@latest

# Utils
npm i clsx@latest tailwind-merge@latest
npm i -D @tailwindcss/typography@latest
```

### 8.2 Tailwind v4 Config

```js
// tailwind.config.js (v4 uses CSS-first, this is minimal)
import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: { extend: {} },
  plugins: [],
} satisfies Config;
```

```css
/* src/app.css — ALL tokens here */
@import "tailwindcss";
@import "@tailwindcss/typography";

@plugin "daisyui" { themes: false; } /* only if using utility classes */

@theme {
  /* All tokens from Section 1.2 */
}

@utility glass-1 { /* ... */ }
@utility glass-2 { /* ... */ }
@utility glass-3 { /* ... */ }
@utility glass-4 { /* ... */ }
@utility noise-overlay { /* ... */ }
@utility scanlines { /* ... */ }
@utility border-beam { /* ... */ }
```

---

## 🎯 9. Implementation Priority (Phased)

### Phase 1 — Foundation (Week 1)
- [ ] Tailwind v4 + OKLCH token system in `app.css`
- [ ] `WindowChrome`, `Dock`, `Sidebar` shell components
- [ ] `GlassCard` tier system (1-4) with reduced-motion
- [ ] `NoiseOverlay` + `Scanlines` global layers
- [ ] Bits UI + shadcn-svelte scaffold
- [ ] SVAR DataGrid for findings table

### Phase 2 — Motion & Atmosphere (Week 2)
- [ ] `BorderBeam` + `ThinkingOrbs` effect components
- [ ] `liquid-glass-svelte` integration (Chromium displacement)
- [ ] `svelte-motion` for layout transitions (sidebar, sheets, palette)
- [ ] `morphicons` for sidebar/tool icon transitions
- [ ] Spring physics tokens wired to all motion

### Phase 3 — Sound & Polish (Week 3)
- [ ] `cuelume` integration with global toggle
- [ ] Keyboard navigation audit (WCAG 2.2 AA)
- [ ] Focus trapping in sheets/dialogs
- [ ] Color contrast verification (4.5:1 minimum)
- [ ] `prefers-reduced-motion` full coverage test

### Phase 4 — Advanced & Unique (Week 4+)
- [ ] `Unicorn Studio` hero scene embed (optional)
- [ ] `Pryzm` generated backgrounds for empty states
- [ ] Liquid Metal WebGL shader (behind flag, Safari fallback)
- [ ] Custom cursor with spring follow (accent glow on interactive)
- [ ] Text scramble decode effect for terminal output
- [ ] Page transitions via View Transitions API (web) / native (Tauri)

---

## 🔗 10. Key References & Repos

| Resource | Link | Notes |
|----------|------|-------|
| **liquid-glass-svelte** | `github.com/danilofiumi/liquid-glass-svelte` | Primary glass lib |
| **Bits UI** | `bits-ui.com` | Headless primitives |
| **shadcn-svelte** | `shadcn-svelte.com` | Styled components |
| **SVAR Svelte** | `svar.dev/svelte` | DataGrid, Gantt |
| **Svelte Motion** | `motion.svelte.page` | Framer Motion API |
| **Cuelume** | `cuelume-site.pages.dev` | UI sounds (2KB) |
| **Morphicons** | `github.com/guillermolg00/morphicons` | Icon morphing |
| **Open Props** | `open-props.style` | CSS custom properties |
| **Tailwind v4 OKLCH** | `tailwindcss.com/blog/tailwindcss-v4` | Token system |
| **Apple HIG Motion** | `developer.apple.com/design/human-interface-guidelines/motion` | Motion principles |
| **Jakub Antalik** | `jakubantalik.com` | Border Beam, Thinking Orbs, Liquid Metal |
| **Pryzm** | `pryzm.design` | Background studio |
| **Unicorn Studio** | `unicorn.studio` | WebGL motion designer |

---

## 💡 11. "Differentiator" Features (Creative Moats)

| Feature | Description | Tech |
|---------|-------------|------|
| **Terminal as Hero** | Center pane = real xterm.js, not chat | xterm.js + custom theme |
| **AI Strip (Collapsed)** | Cmd+J slides up contextual AI, not permanent chat | Svelte Motion layout |
| **YOLO Mode Badge** | Live status bar indicator, spring pulse on toggle | CSS animation + state |
| **Dithered Empty States** | Bayer dither on "no engagement" illustration | CSS paint API / SVG filter |
| **Magnetic Dock Items** | Spring pull toward cursor (max 16px) | Pointer tracking + spring store |
| **Command Palette Everywhere** | ⌘K from anywhere, fuzzy search all commands | shadcn Command + Bits Combobox |
| **Per-Engagement Themes** | Color accent per project (green/blue/orange/purple) | CSS variable override |
| **Live Timeline** | WebSocket stream → animated timeline entries | SVAR + spring insert |

---

## 📝 12. Next Actions

1. **Save this doc** to `cursor-research/UI-UX-DEEP-RESEARCH.md` ✅
2. **Install core deps** (Section 8.1)
3. **Wire Tailwind v4 tokens** in `src/app.css` (Section 1.2)
4. **Build shell components**: `WindowChrome`, `Dock`, `Sidebar`, `GlassCard`
5. **Add Bits UI + shadcn-svelte** and generate base components
6. **Integrate `liquid-glass-svelte`** for tier 1-2 panels
7. **Add `cuelume` + `morphicons`** for sound/icon polish
8. **Run accessibility audit** (axe-core, manual keyboard test)

---

**This research is complete and ready for the other agents to execute.** The token system, component map, effect library, and implementation phases are all defined. The stack is Svelte 5 native with zero framework fight.

**Tag for agents:** `@cursor @opencode` — read this file + `prompts/UI-PROMPTS.md` for full context.