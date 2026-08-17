# Finn Pentest Harness — UI/UX Design Specification

## 1. Design Philosophy

### macOS Native Feel
The app should feel like it belongs on macOS — not a generic web app. Every interaction, animation, and visual treatment should reference Apple's design language while maintaining a dark terminal/hacker aesthetic.

**Core principles:**
- **Depth over flatness:** Layered glass, shadows, depth cues
- **Motion with purpose:** Every animation communicates state or guides attention
- **Spring physics:** No linear easing — everything bounces, settles, springs
- **Dither everything:** Noise overlays, Bayer dithering, grain textures for analog warmth
- **Liquid metal as hero:** The liquid metal shader is not decoration — it's the app's identity

### Color System

```css
:root {
  /* Abyss background */
  --abyss: #050507;
  --abyss-light: #0a0a0c;
  --abyss-lighter: #121216;
  
  /* Accent */
  --green: #00d992;
  --green-dim: #00b87a;
  --green-glow: rgba(0, 217, 146, 0.3);
  
  /* Text */
  --text-primary: rgba(255, 255, 255, 0.9);
  --text-secondary: rgba(255, 255, 255, 0.6);
  --text-tertiary: rgba(255, 255, 255, 0.35);
  --text-disabled: rgba(255, 255, 255, 0.2);
  
  /* Surface */
  --surface: rgba(255, 255, 255, 0.05);
  --surface-hover: rgba(255, 255, 255, 0.08);
  --surface-active: rgba(255, 255, 255, 0.12);
  --surface-elevated: rgba(20, 20, 25, 0.85);
  
  /* Border */
  --border-subtle: rgba(255, 255, 255, 0.06);
  --border-default: rgba(255, 255, 255, 0.1);
  --border-focus: rgba(0, 217, 146, 0.5);
  
  /* Danger */
  --danger: #ff453a;
  --danger-glow: rgba(255, 69, 58, 0.3);
  
  /* Warning */
  --warning: #ff9f0a;
  
  /* Info */
  --info: #0a84ff;
}
```

### Typography

```css
:root {
  /* Primary: JetBrains Mono for everything monospace */
  --font-mono: 'JetBrains Mono', 'SF Mono', 'Fira Code', monospace;
  
  /* Secondary: Inter for UI labels, buttons, navigation */
  --font-ui: 'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
  
  /* System: SF Pro for native feel */
  --font-system: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
  
  /* Sizes */
  --text-xs: 11px;
  --text-sm: 13px;
  --text-base: 14px;
  --text-lg: 16px;
  --text-xl: 20px;
  --text-2xl: 24px;
  --text-3xl: 32px;
  
  /* Line heights */
  --leading-tight: 1.2;
  --leading-normal: 1.5;
  --leading-relaxed: 1.75;
}
```

---

## 2. Visual Effects

### 2.1 Liquid Metal Shader (WebGL)
**Already built in `LiquidMetal.svelte`.**

**Enhancements needed:**
- Add dithering to the shader output (Bayer matrix post-processing)
- Make it respond to audio levels (VU meter input)
- Add "molten" trails when mouse moves fast
- Safari optimization: reduce noise iterations on WebGL 1.0

**Parameters:**
| Param | Default | Range | Description |
|-------|---------|-------|-------------|
| intensity | 0.3 | 0.0-1.0 | Overall distortion amount |
| speed | 1.0 | 0.0-3.0 | Animation speed |
| color1 | #00d992 | hex | Primary liquid color |
| color2 | #050507 | hex | Secondary/base color |
| interactive | true | bool | Mouse reaction |
| audioReactive | false | bool | React to mic audio |

### 2.2 Liquid Glass (CSS + SVG)
**Multi-layer glass effect for panels and windows.**

```css
.liquid-glass {
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.1) 0%,
    rgba(255, 255, 255, 0.02) 50%,
    rgba(0, 0, 0, 0.1) 100%
  );
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.05),
    0 8px 32px rgba(0, 0, 0, 0.3);
  border-radius: 12px;
}
```

**Liquid Glass variant (dynamic highlight):**
The highlight should follow the cursor position within the element.

```css
.liquid-glass-dynamic {
  position: relative;
  overflow: hidden;
}

.liquid-glass-dynamic::before {
  content: '';
  position: absolute;
  top: var(--mouse-y, 50%);
  left: var(--mouse-x, 50%);
  width: 200px;
  height: 200px;
  background: radial-gradient(
    circle,
    rgba(255, 255, 255, 0.1) 0%,
    transparent 70%
  );
  transform: translate(-50%, -50%);
  pointer-events: none;
  transition: top 0.3s ease, left 0.3s ease;
}
```

### 2.3 Dithering (Canvas)
**Already built in `DitherOverlay.svelte`.**

**Usage:**
- Global overlay at 3-5% intensity for film grain
- Bayer dither on images and thumbnails
- Scanlines on terminal/code panels
- Grain animation on idle screens

### 2.4 Noise Overlay (SVG Filter)
```html
<svg style="position: absolute; width: 0; height: 0;">
  <filter id="noise">
    <feTurbulence
      type="fractalNoise"
      baseFrequency="0.8"
      numOctaves="4"
      stitchTiles="stitch"
    />
    <feColorMatrix
      type="saturate"
      values="0"
    />
  </filter>
</svg>
```

### 2.5 Spring Physics Tokens

```css
:root {
  /* Spring physics — NEVER use linear easing */
  --spring-snappy: cubic-bezier(0.34, 1.56, 0.64, 1);
  --spring-bouncy: cubic-bezier(0.68, -0.55, 0.265, 1.55);
  --spring-smooth: cubic-bezier(0.4, 0, 0.2, 1);
  --spring-heavy: cubic-bezier(0.22, 1, 0.36, 1);
  
  /* Durations */
  --duration-instant: 80ms;
  --duration-fast: 150ms;
  --duration-normal: 250ms;
  --duration-slow: 400ms;
  --duration-slower: 600ms;
}
```

---

## 3. Component Specifications

### 3.1 Window Chrome
**Already built in `WindowChrome.svelte`.**

**Traffic lights behavior:**
- **Close (red):** Fade window out with spring animation, remove from DOM after 300ms
- **Minimize (yellow):** Scale to dock, spring animation to dock position
- **Maximize (green):** Full screen with spring, restore remembers position

**States:**
| State | Visual |
|-------|--------|
| Default | Glass background, subtle border |
| Active | Brighter border, stronger shadow, title text brighter |
| Dragging | Slightly transparent (opacity 0.9), no shadow |
| Hover (title bar) | Cursor changes to grab |

### 3.2 Dock Navigation
**Already built in `Dock.svelte`.**

**Dock items (default):**
| Icon | Label | Action |
|------|-------|--------|
| 🔒 | Finn | Open main chat window |
| 🎯 | Targets | Open targets/workspace panel |
| 🛠️ | Tools | Open tool execution panel |
| 📊 | Reports | Open report generator |
| ⚙️ | Settings | Open settings window |
| 🗑️ | Trash | Clear inactive engagements |

**Behavior:**
- Items can be rearranged via drag-and-drop
- Right-click shows context menu (hide, keep in dock, options)
- Separator before Trash (always last)
- Active indicator: green dot below icon
- Badge: red circle with count (pulses on update)

### 3.3 Sidebar (Left Panel)

**Structure:**
```
┌────────────────────────┐
│ 🔍 Search               │
├────────────────────────┤
│ 📁 Engagements         │
│   ▸ Acme Corp          │
│   ▸ TestLab            │
│   ▸ BugBounty-2026     │
├────────────────────────┤
│ 🎯 Scope               │
│   ▸ domains.txt        │
│   ▸ ips.txt            │
├────────────────────────┤
│ 🛠️ Tools               │
│   ▸ nmap               │
│   ▸ nuclei             │
│   ▸ sqlmap             │
├────────────────────────┤
│ 📊 Findings            │
│   ▸ Critical (2)       │
│   ▸ High (5)           │
│   ▸ Medium (12)        │
├────────────────────────┤
│ 📝 Notes               │
│   ▸ README.md          │
│   ▸ timeline.md        │
└────────────────────────┘
```

**Design:**
- Collapsible sections (accordion with spring animation)
- Tree view with indentation guides
- Selected item: green left border + slight background highlight
- Hover: surface-hover background
- Context menus on right-click

### 3.4 Chat Panel (Main Area)

**Structure:**
```
┌────────────────────────────────────────────┐
│ Model: o3 | Mode: HUNT | YOLO: OFF      [⚙️]│
├────────────────────────────────────────────┤
│                                            │
│ 🤖 Finn: Found 3 open ports on target...  │
│                                            │
│ ────────────────────────────────────────── │
│                                            │
│ 👤 You: Run nmap service scan             │
│                                            │
│ ────────────────────────────────────────── │
│                                            │
│ 🤖 Finn: ```bash                          │
│ nmap -sV -p 22,80,443 target.com          │
│ ```                                       │
│ [Run] [Copy] [Explain]                    │
│                                            │
├────────────────────────────────────────────┤
│ [💬] Type message...              [📎] [🎤]│
└────────────────────────────────────────────┘
```

**Message bubbles:**
- User: right-aligned, dark background, rounded-2xl top-right
- AI: left-aligned, glass surface, rounded-2xl top-left
- Code blocks: dark terminal background with language label
- Inline code: subtle background, monospace
- Links: green underline on hover

**Action buttons on AI messages:**
- **Run:** Execute proposed command (opens approval dialog unless YOLO)
- **Copy:** Copy code block to clipboard
- **Explain:** Ask AI to explain the technique
- **Retry:** Resend with different template

**Input bar:**
- Multiline textarea (auto-expands)
- Attach button (file upload)
- Mic button (voice input)
- Send button (green, spring animation on press)
- Placeholder: "Ask Finn anything..." with typing indicator

### 3.5 Terminal Embed

**Features:**
- xterm.js with custom theme matching the app
- Shell prompt: `finn@target:~$` in green
- Command output in white
- Error output in red (#ff453a)
- Success output in green (#00d992)
- ANSI color support
- Scrollback buffer (10,000 lines)
- Copy/paste support

**Theme:**
```javascript
{
  foreground: '#e0e0e0',
  background: '#050507',
  cursor: '#00d992',
  cursorAccent: '#00d992',
  selectionBackground: 'rgba(0, 217, 146, 0.3)',
  black: '#050507',
  red: '#ff453a',
  green: '#00d992',
  yellow: '#ff9f0a',
  blue: '#0a84ff',
  magenta: '#bf5af2',
  cyan: '#5ac8fa',
  white: '#e0e0e0',
  brightBlack: '#2c2c2e',
  brightRed: '#ff6961',
  brightGreen: '#30d158',
  brightYellow: '#ffd60a',
  brightBlue: '#409cff',
  brightMagenta: '#da8fff',
  brightCyan: '#7de0ff',
  brightWhite: '#ffffff'
}
```

### 3.6 Settings Panel

**Categories (left sidebar):**
| Icon | Category |
|------|----------|
| 🧠 | AI Models |
| 🔐 | Security |
| 🎨 | Appearance |
| ⌨️ | Keyboard |
| 🔊 | Sound |
| 🌐 | Network |
| 📁 | Storage |
| 🧪 | Advanced |

**AI Models settings:**
- Provider list (OpenAI, Anthropic, DeepSeek, xAI, Ollama, etc.)
- Per-provider API key input (masked)
- Model selection dropdown
- Temperature slider (0.0-2.0)
- Max tokens slider (256-8192)
- Anti-refusal strength (1-5)
- Template racing toggle
- Response cleanup toggle
- YOLO mode default (per engagement)

**Appearance settings:**
- Theme: Dark / Light / Auto
- Accent color picker
- Dither intensity slider (0-10%)
- Noise intensity slider
- Scanlines toggle
- Liquid metal background toggle
- Animation speed: Slow / Normal / Fast / None
- Font size: Small / Normal / Large / Huge
- Reduced motion toggle

**Keyboard shortcuts:**
| Shortcut | Action |
|----------|--------|
| Cmd+K | Command palette |
| Cmd+Shift+N | New engagement |
| Cmd+Enter | Send message |
| Cmd+R | Run selected command |
| Cmd+Y | Toggle YOLO mode |
| Cmd+Shift+T | New terminal |
| Cmd+1-9 | Switch engagement |
| Cmd+W | Close window |
| Cmd+, | Open settings |
| Cmd+/ | Show shortcuts |

---

## 4. Animation Specifications

### 4.1 Window Lifecycle

**Open:**
1. Scale from 0.8 to 1.0 (spring-snappy, 300ms)
2. Opacity from 0 to 1 (ease-out, 200ms)
3. Shadow grows from 0 to full (spring-smooth, 400ms)

**Close:**
1. Scale from 1.0 to 0.9 (spring-smooth, 150ms)
2. Opacity from 1 to 0 (ease-in, 200ms)
3. Remove from DOM after animation completes

**Minimize to Dock:**
1. Scale to 0.2 while translating to dock position
2. Spring physics with high damping
3. Duration: 400ms

**Maximize:**
1. Expand to fill screen with spring-heavy
2. Corner radius animates to 0
3. Duration: 500ms

### 4.2 Content Transitions

**Message appear:**
- Slide up 20px + fade in (spring-snappy, 250ms)
- Stagger: 50ms between consecutive messages

**Code block expand:**
- Height animates from 0 to auto (spring-smooth, 300ms)
- Fade in content (ease-out, 200ms, delayed 100ms)

**Loading states:**
- Thinking dots: 3 dots with staggered pulse (1.5s cycle)
- Spinner: Rotating gradient ring (not generic spinner)
- Skeleton: Shimmer effect moving across placeholder bars

### 4.3 Micro-interactions

**Button hover:**
- Scale: 1.0 → 1.02 (spring-snappy, 150ms)
- Background: surface → surface-hover (ease, 100ms)
- Icon color: text-secondary → text-primary (ease, 100ms)

**Button press:**
- Scale: 1.02 → 0.98 (spring-snappy, 80ms)
- Background: surface-active (instant)
- Release: Spring back to 1.0 (spring-snappy, 200ms)

**Input focus:**
- Border: border-default → border-focus (ease, 150ms)
- Shadow: Add green glow (ease, 150ms)
- Label: Float up and shrink (spring-smooth, 200ms)

**Toggle switch:**
- Knob slides with spring physics
- Background color crossfades
- Duration: 250ms

---

## 5. Accessibility

### 5.1 Keyboard Navigation
- Full tab order through all interactive elements
- Arrow keys for tree navigation
- Enter/Space to activate
- Escape to close modals/panels
- Focus visible ring: 2px solid var(--green) with 2px offset

### 5.2 Screen Reader
- All icons have aria-label
- Live regions for chat messages
- Role attributes for all components
- Status announcements for loading, errors, completions

### 5.3 Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  
  .liquid-metal-canvas,
  .dither-overlay {
    display: none;
  }
}
```

### 5.4 High Contrast
```css
@media (prefers-contrast: high) {
  :root {
    --text-primary: #ffffff;
    --text-secondary: #cccccc;
    --border-default: rgba(255, 255, 255, 0.3);
    --surface: rgba(255, 255, 255, 0.1);
  }
}
```

---

## 6. Responsive Design

### Desktop (1024px+)
- Full layout: sidebar + chat + right panel
- Dock at bottom
- Multiple windows can be open

### Tablet (768px-1023px)
- Collapse sidebar to icons-only
- Single panel view (chat or tools)
- Dock at bottom, smaller icons

### Mobile (< 768px)
- Bottom tab bar instead of dock
- Single column layout
- Slide-out sidebar
- Touch-optimized buttons (min 44px)
- Swipe gestures for navigation

---

## 7. Performance Targets

| Metric | Target | Notes |
|--------|--------|-------|
| First Contentful Paint | < 1.5s | Initial paint of shell |
| Time to Interactive | < 3s | All interactive elements ready |
| Animation frame rate | 60fps | No dropped frames |
| Input latency | < 16ms | Response to user input |
| Memory usage | < 200MB | For typical usage |
| WebGL fallback | Canvas 2D | If WebGL unavailable |
| Safari compatibility | Full | Test on Safari 17+ |
| Mobile battery | Low impact | Disable effects on battery saver |

---

## 8. Component Inventory

### Built ✅
| Component | File | Status |
|-----------|------|--------|
| Liquid Metal | `LiquidMetal.svelte` | ✅ WebGL shader |
| Dither Overlay | `DitherOverlay.svelte` | ✅ Canvas-based |
| Window Chrome | `WindowChrome.svelte` | ✅ macOS-style |
| Dock | `Dock.svelte` | ✅ Spring physics |

### To Build 🔨
| Component | Priority | Description |
|-----------|----------|-------------|
| Sidebar | High | Collapsible tree navigation |
| Chat Panel | High | Message bubbles, markdown, actions |
| Terminal Embed | High | xterm.js with custom theme |
| Command Palette | High | Cmd+K fuzzy finder |
| Settings Panel | Medium | Extensive customization |
| Tool Execution | Medium | Approve/reject/YOLO flow |
| Report Viewer | Medium | Markdown/PDF rendering |
| Notification Toast | Medium | Status messages |
| Context Menu | Medium | Right-click menus |
| Drag Layer | Low | Window drag preview |
| Resize Handles | Low | Window resizing |

---

*Design specification for Finn Pentest Harness v1.0*
*Last updated: 2026-08-17*
