# Finn Pentest Harness — Design System

> **A macOS-native, dark-terminal pentest workstation.**
> Liquid metal. Liquid glass. Dither. Noise. Spring physics everywhere.
> Built for the terminal warrior who wants their GUI to feel like butter.

**Design tokens:** `--abyss #050507` · `--green #00d992` · JetBrains Mono + Inter
**Targets:** 60fps · Safari-compatible · mobile-responsive · prefers-reduced-motion honored
**Status:** This document is the single source of truth for all UI work. If a component isn't specced here, it doesn't ship.

---

## Table of Contents

1. [Design Philosophy](#1-design-philosophy)
2. [Visual Effects Deep Dive](#2-visual-effects-deep-dive)
3. [Component Specifications](#3-component-specifications)
4. [Animation Specs](#4-animation-specs)
5. [Accessibility](#5-accessibility)

---

## 1. Design Philosophy

### 1.1 The North Star: macOS Native Feel

The harness must feel like a **first-party macOS application**, not a web page pretending to be one. Every interaction — opening a window, switching chat modes, expanding the sidebar, clicking a traffic light — must carry the weight, momentum, and material honesty of native SwiftUI.

This means:

| Web-app instinct | What we do instead |
|------------------|-------------------|
| Linear easing on everything | Spring physics on everything |
| Instant state changes | Momentum, overshoot, settle |
| Flat opaque panels | Layered glass with depth |
| System default scrollbars | Styled, thin, glass scrollbars |
| Cursor: pointer everywhere | Cursor: default; pointer only on actionable items |
| Text selection default blue | `::selection` tinted `#00d992` at 30% alpha |
| Focus ring default | Custom 2px `#00d992` ring with 4px offset glow |

The reference points are **macOS Sonoma/Sequoia window chrome**, **Linear's command palette**, **Raycast's speed**, and **the terminal's honesty**. If a user who lives in iTerm2 and VS Code opens this app and doesn't flinch, we've won.

### 1.2 Dark Terminal Aesthetic

The app is a terminal that grew a GUI. The background is not "dark gray" — it is **abyss**: `#050507`, near-black with a whisper of blue. Text is not pure white — it is `#e8e8e6`, warm enough to read for hours. The accent is not "green" — it is `#00d992`, terminal phosphor green, the color of a successful nmap scan.

**Color system:**

| Token | Value | Usage |
|-------|-------|-------|
| `--abyss` | `#050507` | App background, deepest layer |
| `--abyss-2` | `#0a0a0e` | Raised surfaces, cards |
| `--abyss-3` | `#101016` | Hover states, active panels |
| `--green` | `#00d992` | Primary accent, focus, success |
| `--green-dim` | `#00b377` | Hover/pressed accent |
| `--green-glow` | `rgba(0, 217, 146, 0.35)` | Glows, shadows, beams |
| `--text` | `#e8e8e6` | Primary text |
| `--text-dim` | `#9a9a94` | Secondary text, labels |
| `--text-faint` | `#55554f` | Disabled, placeholders |
| `--danger` | `#ff5c5c` | Errors, destructive actions, YOLO mode |
| `--warning` | `#ffb454` | Warnings, unapproved tools |
| `--info` | `#5cb8ff` | Info, links, tool output |

**Layering rule:** every surface sits on a defined z-layer. Glass panels float above abyss. Modals float above glass. The terminal sits at the bottom, always visible through the glass — the app is a window into a machine, not a stack of opaque cards.

### 1.3 Typography: JetBrains Mono + Inter

Two fonts, two jobs, never mixed:

- **JetBrains Mono** — everything a machine says: terminal output, code blocks, tool results, timestamps, file paths, IP addresses, port numbers. Ligatures on. Tabular figures for aligned columns.
- **Inter** — everything a human says: chat messages, UI labels, settings, buttons, headings. Tight tracking on headings (`-0.02em`), normal tracking on body.

**Type scale:**

| Role | Font | Size | Weight | Line-height |
|------|------|------|--------|-------------|
| Display (window titles) | Inter | 20px | 600 | 1.2 |
| Heading | Inter | 16px | 600 | 1.3 |
| Body | Inter | 14px | 400 | 1.5 |
| Small / labels | Inter | 12px | 500 | 1.4 |
| Caption / meta | JetBrains Mono | 11px | 400 | 1.4 |
| Terminal | JetBrains Mono | 13px | 400 | 1.45 |
| Code block | JetBrains Mono | 13px | 400 | 1.5 |

**Rules:**
- Numbers in prose (IPs, ports, counts) render in JetBrains Mono inline, even inside Inter text.
- Never italicize code. Never bold terminal output.
- Uppercase labels get `letter-spacing: 0.08em` and 11px size — never larger.

### 1.4 Design Principles

1. **Butter.** Every animation is a spring. Nothing snaps. Nothing eases linearly. The app should feel like it's machined from a single block of aluminum with liquid inside.
2. **Awe.** The user said it: "I want to be in awe." Liquid metal shaders, glass refraction, dither grain — the details must be visible within 5 seconds of opening the app, and they must never cost a frame.
3. **Performance is a feature.** 60fps is not a goal, it's a floor. Every effect has a GPU budget and a CPU fallback. If an effect can't hold 60fps on a 2020 MacBook Air, it gets simplified until it can.
4. **The terminal is the soul.** No matter how much glass and metal we add, the terminal remains the center of gravity. Tool output is first-class. Monospace is sacred.
5. **Accessibility is not optional.** Reduced motion, high contrast, keyboard-only, screen reader — all first-class modes, not afterthoughts. Section 5 is law.
6. **Consistency over cleverness.** One way to do glass. One way to do springs. One way to do focus rings. Components compose; they don't improvise.

### 1.5 Design Tokens (CSS Custom Properties)

```css
:root {
  /* Color */
  --abyss: #050507;
  --abyss-2: #0a0a0e;
  --abyss-3: #101016;
  --green: #00d992;
  --green-dim: #00b377;
  --green-glow: rgba(0, 217, 146, 0.35);
  --text: #e8e8e6;
  --text-dim: #9a9a94;
  --text-faint: #55554f;
  --danger: #ff5c5c;
  --warning: #ffb454;
  --info: #5cb8ff;

  /* Typography */
  --font-mono: 'JetBrains Mono', ui-monospace, 'SF Mono', monospace;
  --font-sans: 'Inter', -apple-system, 'SF Pro Text', sans-serif;

  /* Motion — spring presets (see §2.6) */
  --spring-snappy: cubic-bezier(0.2, 0.8, 0.2, 1);
  --spring-bouncy: cubic-bezier(0.34, 1.56, 0.64, 1);
  --spring-smooth: cubic-bezier(0.4, 0, 0.2, 1);
  --spring-heavy: cubic-bezier(0.7, 0, 0.84, 0);
  --spring-window: var(--spring-window);

  /* Glass */
  --glass-bg: rgba(10, 10, 14, 0.55);
  --glass-border: rgba(255, 255, 255, 0.08);
  --glass-blur: 24px;
  --glass-saturate: 1.4;

  /* Depth */
  --shadow-panel: 0 8px 32px rgba(0, 0, 0, 0.5);
  --shadow-modal: 0 24px 80px rgba(0, 0, 0, 0.7);
  --shadow-glow: 0 0 24px var(--green-glow);

  /* Radii */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --radius-xl: 20px;

  /* Layout */
  --titlebar-h: 40px;
  --dock-h: 72px;
  --sidebar-w: 260px;
  --sidebar-w-collapsed: 0px;
}
```

### 1.6 What This Is NOT

- **Not a SaaS dashboard.** No cards-in-a-grid energy. No "insights" widgets. This is a workstation.
- **Not a generic dark theme.** Abyss + phosphor green is the identity. Purple gradients and blue glows are banned.
- **Not a mobile-first app.** Desktop is the primary surface. Mobile is a fully functional companion, not a scaled-down afterthought — but the desktop experience leads.
- **Not a demo.** Every effect ships in production. No "coming soon" placeholders in the UI.

---

## 2. Visual Effects Deep Dive

Every effect in this section is a **production component**, not a demo. Each has: a spec, a GPU budget, a fallback path, and a reduced-motion behavior. Effects compose — glass over metal over dither over noise — and the composition order is fixed:

```
Layer 0: abyss background (solid #050507)
Layer 1: scanlines (repeating-linear-gradient, 3% opacity)
Layer 2: noise overlay (SVG feTurbulence, 4% opacity)
Layer 3: liquid metal surfaces (WebGL canvas, where used)
Layer 4: glass panels (backdrop-filter blur + refraction)
Layer 5: border beams (conic-gradient, animated)
Layer 6: content (text, terminal, chat)
Layer 7: thinking orbs (pulse, above content, below modals)
Layer 8: modals / popovers (highest glass tier)
```

### 2.1 Liquid Metal

**What it is:** a WebGL fragment shader that renders a flowing, molten-metal surface — used for the window title bar background, the dock, and the settings panel header. It reads like brushed aluminum that's slowly breathing.

**Where it's used:**
- Window title bar (subtle, 20% intensity)
- Dock background (medium, 40% intensity)
- Settings panel header (full, 60% intensity)
- YOLO mode toggle (danger variant — red-tinted metal)

**Implementation — WebGL2 fragment shader:**

```glsl
// liquid-metal.frag
precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_intensity;   // 0.0 - 1.0, per-surface
uniform vec3 u_tint;         // accent color, default #00d992

// Simplex noise (Ashima Arts / Stefan Gustavson, MIT)
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
            i.z + vec4(0.0, i1.z, i2.z, 1.0))
          + i.y + vec4(0.0, i1.y, i2.y, 1.0))
          + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

// FBM — 4 octaves of domain-warped noise
float fbm(vec3 p) {
  float f = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    f += a * snoise(p);
    p = p * 2.02 + vec3(1.3, 9.2, 4.1);
    a *= 0.5;
  }
  return f;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 p = uv * 3.0;

  // Domain warp: the metal "flows"
  float t = u_time * 0.12;
  vec2 q = vec2(fbm(vec3(p, t)), fbm(vec3(p + vec2(5.2, 1.3), t)));
  vec2 r = vec2(fbm(vec3(p + 3.0 * q + vec2(1.7, 9.2), t + 0.6)),
                fbm(vec3(p + 3.0 * q + vec2(8.3, 2.8), t + 0.4)));

  float n = fbm(vec3(p + 2.5 * r, t));

  // Brushed-metal anisotropy: stretch noise along one axis
  float grain = snoise(vec3(uv * vec2(1.0, 240.0), t * 0.5)) * 0.5 + 0.5;

  // Base metal gradient (dark abyss → slightly lighter)
  vec3 base = mix(vec3(0.02, 0.02, 0.03), vec3(0.10, 0.10, 0.13), uv.y);

  // Specular sheen that follows the warp
  float sheen = pow(max(0.0, 1.0 - length(r - 0.5) * 1.6), 3.0);

  // Compose
  vec3 color = base;
  color += n * 0.06 * u_tint;                    // molten tint
  color += grain * 0.03;                          // brushed grain
  color += sheen * 0.12 * u_tint * u_intensity;   // moving sheen

  // Vignette to keep edges dark
  float vig = smoothstep(1.4, 0.3, length(uv - 0.5));
  color *= mix(0.75, 1.0, vig);

  gl_FragColor = vec4(color, 1.0);
}
```

**Host component (Svelte):**

```svelte
<!-- LiquidMetal.svelte -->
<script>
  import { onMount } from 'svelte';

  export let intensity = 0.4;   // 0-1
  export let tint = '#00d992';
  export let fps = 60;

  let canvas;
  let raf;
  let gl;
  let startTime;

  const VERT = `...`; // fullscreen triangle
  const FRAG = `...`; // shader above

  onMount(() => {
    gl = canvas.getContext('webgl2', { alpha: false, antialias: false, powerPreference: 'high-performance' });
    if (!gl) return; // fallback: static gradient (see below)

    // compile, link, get uniforms
    // ...

    const render = (now) => {
      const t = (now - startTime) / 1000;
      gl.uniform1f(u_time, t);
      gl.uniform2f(u_resolution, canvas.width, canvas.height);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      raf = requestAnimationFrame(render);
    };
    startTime = performance.now();
    raf = requestAnimationFrame(render);

    return () => cancelAnimationFrame(raf);
  });
</script>

<canvas bind:this={canvas} class="liquid-metal" aria-hidden="true" />
```

**Performance budget:**
- One shared WebGL context for the whole app (never one context per surface).
- All metal surfaces render into a single offscreen canvas, then get composited via CSS `background` — surfaces are just windows into one shader.
- Shader runs at device pixel ratio capped at 1.5x. On 4K displays, cap at 1x.
- `u_time` advances only while the surface is visible (IntersectionObserver).
- Frame budget: < 1.5ms per frame on integrated GPUs.

**Fallback (no WebGL2, or reduced-motion):** static CSS gradient approximating brushed metal:

```css
.liquid-metal-fallback {
  background:
    repeating-linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.015) 0px,
      rgba(255, 255, 255, 0.015) 1px,
      transparent 1px,
      transparent 3px
    ),
    linear-gradient(180deg, #0a0a0e 0%, #050507 100%);
}
```

**Reduced motion:** shader freezes at `u_time = 0` (static metal, still textured, no flow).

### 2.2 Liquid Glass

**What it is:** multi-pass backdrop blur with saturation boost and a refraction edge — the material for every floating panel. It's "liquid" because panels carry a subtle inner highlight that shifts with pointer position (the glass catches light).

**The three passes:**

1. **Blur pass** — `backdrop-filter: blur(24px) saturate(1.4)`
2. **Refraction edge** — 1px inner border, top edge brighter than bottom (light from above)
3. **Pointer sheen** — a radial highlight that follows the cursor across the panel (CSS custom properties updated via rAF, GPU-composited)

```css
.glass {
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturate));
  -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturate));
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-panel);

  /* Refraction edge: light from above */
  border-top-color: rgba(255, 255, 255, 0.14);
  border-bottom-color: rgba(0, 0, 0, 0.4);

  /* Pointer sheen — driven by JS */
  background-image: radial-gradient(
    600px circle at var(--sheen-x, 50%) var(--sheen-y, 0%),
    rgba(255, 255, 255, 0.06),
    transparent 40%
  );
}
```

**Pointer sheen driver:**

```js
// glass-sheen.js — one listener per glass panel, rAF-throttled
export function glassSheen(node) {
  let raf = 0;
  const onMove = (e) => {
    const rect = node.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      node.style.setProperty('--sheen-x', x + '%');
      node.style.setProperty('--sheen-y', y + '%');
    });
  };
  node.addEventListener('pointermove', onMove);
  return { destroy: () => { node.removeEventListener('pointermove', onMove); cancelAnimationFrame(raf); } };
}
```

**Glass tiers:**

| Tier | Blur | Opacity | Border | Use |
|------|------|---------|--------|-----|
| `glass-1` (window) | 32px | 0.45 | 1px, top-lit | Main window chrome |
| `glass-2` (panel) | 24px | 0.55 | 1px, top-lit | Sidebar, settings |
| `glass-3` (card) | 16px | 0.65 | 1px | Chat bubbles, tool cards |
| `glass-4` (popover) | 12px | 0.75 | 1px | Menus, tooltips |

**Safari notes:** Safari requires `-webkit-backdrop-filter` (always ship both). Safari < 18 has a bug where `backdrop-filter` + `border-radius` clips incorrectly — workaround: wrap the glass in a parent with `overflow: hidden` and matching radius, apply blur to the child.

**Fallback (no backdrop-filter support):** solid `--abyss-2` at 0.92 opacity. The app must remain fully usable — glass is enhancement, not function.

**Reduced motion:** pointer sheen disabled (static highlight at top-center). Blur stays — it's not motion.

### 2.3 Dithering

**What it is:** ordered Bayer dithering applied to gradients and images to kill banding and give the app its gritty, terminal-adjacent texture. Two forms: **static dither** (baked into gradients) and **animated dither** (2-frame flicker on hover states, like old CRT dithering).

**Bayer 4x4 matrix (the canonical ordered dither):**

```
 0  8  2 10
12  4 14  6
 3 11  1  9
15  7 13  5
```

**Implementation — dither as a CSS mask (GPU-cheap, no canvas):**

```css
/* 4x4 Bayer pattern as a data-URI PNG, tiled */
.dither {
  background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAIklEQVQYV2NkYGD4z8DAwMDAwMDwHw8YGRgYGBgYGBgYGBgAABQBAgGJQ0MAAAAASUVORK5CYII=");
  background-repeat: repeat;
  background-size: 4px 4px;
  mix-blend-mode: overlay;
  opacity: 0.35;
  pointer-events: none;
}
```

**Where dithering applies:**
- All large gradients (window background, settings header, modal backdrops)
- Image thumbnails in tool output (screenshot cards)
- The dock's hover magnification (dither flickers as it scales)
- YOLO mode: dither opacity doubles and switches to `mix-blend-mode: difference` — the whole UI gets visibly grittier as a mode indicator

**Animated dither (2-frame):**

```css
@keyframes dither-flicker {
  0%   { background-position: 0 0; }
  50%  { background-position: 0 0; }
  50.1%{ background-position: 2px 2px; }
  100% { background-position: 2px 2px; }
}
.dither-animated {
  animation: dither-flicker 0.12s steps(1) infinite;
}
```

**Rules:**
- Dither opacity never exceeds 0.4 — it's texture, not fog.
- Dither is always `pointer-events: none` and `aria-hidden`.
- In high-contrast mode (§5.3), dither is removed entirely.

**Reduced motion:** animated dither becomes static.

### 2.4 Border Beam

**What it is:** a conic-gradient beam that orbits the border of a focused element — the "this is active" signal for the chat input, running tool cards, and the YOLO toggle. Borrowed from the Jakub Antalik component, tuned for abyss + phosphor.

**Implementation:**

```css
.border-beam {
  position: relative;
  border-radius: var(--radius-md);
  overflow: hidden;
}
.border-beam::before {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: inherit;
  background: conic-gradient(
    from var(--beam-angle, 0deg),
    transparent 0%,
    transparent 70%,
    var(--green) 85%,
    var(--green-glow) 92%,
    transparent 100%
  );
  animation: beam-spin 3s linear infinite;
  z-index: -1;
}
@keyframes beam-spin {
  to { --beam-angle: 360deg; }
}
```

**The `@property` requirement** (animating the angle needs a registered custom property):

```css
@property --beam-angle {
  syntax: '<angle>';
  initial-value: 0deg;
  inherits: false;
}
```

**Safari note:** `@property` is supported in Safari 16.4+. For older Safari, fall back to rotating a pseudo-element with `transform: rotate()` on a square that's 2x the element size — same visual, slightly more layout cost.

**Variants:**

| Variant | Beam color | Speed | Use |
|---------|-----------|-------|-----|
| `beam-focus` | `--green` | 3s | Chat input focused, active tool |
| `beam-danger` | `--danger` | 1.5s | YOLO mode armed |
| `beam-warning` | `--warning` | 2s | Tool awaiting approval |
| `beam-idle` | `--text-faint` | 6s | Hover on cards |

**Rules:**
- Only ONE beam visible at a time per viewport region. Beams are attention; two beams is noise.
- Beam is 2px thick, never thicker.
- Beam pauses (not stops) when the tab is hidden — `animation-play-state: paused` on `visibilitychange`.

**Reduced motion:** beam becomes a static 1px `--green` border at 40% opacity.

### 2.5 Thinking Orbs

**What it is:** the AI's "I'm working" indicator — three orbs that pulse in sequence with a breathing rhythm. Replaces any spinner. Used in the chat header while the model streams, and on tool cards while a tool executes.

**Implementation:**

```css
.thinking-orbs {
  display: inline-flex;
  gap: 6px;
  align-items: center;
}
.thinking-orbs .orb {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--green);
  box-shadow: 0 0 8px var(--green-glow);
  animation: orb-breathe 1.4s ease-in-out infinite;
}
.thinking-orbs .orb:nth-child(2) { animation-delay: 0.18s; }
.thinking-orbs .orb:nth-child(3) { animation-delay: 0.36s; }

@keyframes orb-breathe {
  0%, 100% { transform: scale(0.6); opacity: 0.35; }
  50%      { transform: scale(1.15); opacity: 1; }
}
```

**States:**

| State | Behavior |
|-------|----------|
| Thinking (model streaming) | Orbs pulse, `--green` |
| Tool executing | Orbs pulse, `--info` |
| Awaiting approval | Orbs freeze at 50% scale, `--warning`, slow blink 2s |
| Error | Orbs collapse to one, `--danger`, static |
| YOLO mode | Orbs pulse at 2x speed, `--danger` |

**Rules:**
- Orbs are `aria-hidden` — the real status goes to `aria-live` text ("Finn is thinking…", "Running nmap…").
- Orbs never exceed 8px. They're a heartbeat, not a billboard.

**Reduced motion:** orbs become a single static dot at 60% opacity with the state color.

### 2.6 Spring Physics

**What it is:** the motion system. Every transition in the app is a spring. CSS-only springs use hand-tuned cubic-bezier curves; JS-driven springs (drag, dock magnification, window open/close) use Framer Motion's spring solver.

**CSS spring presets (the four curves):**

| Name | cubic-bezier | Feel | Use |
|------|-------------|------|-----|
| `--spring-snappy` | `cubic-bezier(0.2, 0.8, 0.2, 1)` | Fast, slight overshoot | Hover states, focus rings, toggles |
| `--spring-bouncy` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Visible overshoot | Dock magnification, popovers, chat bubble entrance |
| `--spring-smooth` | `cubic-bezier(0.4, 0, 0.2, 1)` | No overshoot, gentle | Panel open/close, mode switches |
| `--spring-heavy` | `cubic-bezier(0.7, 0, 0.84, 0)` | Slow start, heavy settle | Window open, modal entrance |

**Framer Motion spring configs (JS-driven):**

```js
// motion.config.js
export const springs = {
  dock:      { type: 'spring', stiffness: 400, damping: 28, mass: 0.8 },  // snappy magnification
  window:    { type: 'spring', stiffness: 260, damping: 30, mass: 1.0 },  // window open/close
  sidebar:   { type: 'spring', stiffness: 300, damping: 32, mass: 0.9 },  // collapse/expand
  bubble:    { type: 'spring', stiffness: 500, damping: 34, mass: 0.6 },  // chat bubble entrance
  drag:      { type: 'spring', stiffness: 700, damping: 40, mass: 0.5 },  // drag release snap
  modal:     { type: 'spring', stiffness: 350, damping: 30, mass: 1.1 },  // modal scale+fade
  traffic:   { type: 'spring', stiffness: 600, damping: 25, mass: 0.4 },  // traffic light hover
};
```

**Rules:**
- **Never** `ease-in-out`, `ease`, or `linear` for UI transitions. The only `linear` allowed is the border beam's rotation and the scanline drift — continuous ambient motion, not state transitions.
- Durations are never specified for JS springs — the spring decides. For CSS curves, durations are fixed per component (see §4).
- Springs compose: a window opening runs `window` spring on scale + `smooth` on opacity simultaneously.
- Overshoot is capped visually at 8% — if a spring overshoots more, retune damping.

**Reduced motion:** all springs collapse to a single 150ms opacity crossfade. No transform, no scale, no overshoot.

### 2.7 Noise Overlay

**What it is:** a full-viewport SVG `feTurbulence` grain that sits above everything at 4% opacity — the film grain that makes flat abyss feel physical. Static (not animated) by default; a 3-frame flicker variant exists for the YOLO mode.

**Implementation:**

```html
<!-- App.svelte, last element in DOM -->
<svg class="noise-overlay" aria-hidden="true">
  <filter id="noise">
    <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" stitchTiles="stitch" />
    <feColorMatrix type="saturate" values="0" />
  </filter>
  <rect width="100%" height="100%" filter="url(#noise)" />
</svg>
```

```css
.noise-overlay {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  opacity: 0.04;
  z-index: 9999;
  mix-blend-mode: overlay;
}
```

**Performance notes:**
- The SVG rect is rendered once and composited — it does not repaint on scroll or animation. Cost: ~0ms after first paint.
- `baseFrequency="0.8"` is the sweet spot: visible grain without moiré on 1x displays. On 2x+ displays, drop to `0.6`.
- Never animate `feTurbulence` per-frame (it re-renders the filter). The YOLO flicker variant swaps between 3 pre-rendered data-URI PNGs instead.

**YOLO variant (3-frame flicker):**

```css
@keyframes noise-flicker {
  0%   { background-image: url("noise-1.png"); }
  33%  { background-image: url("noise-2.png"); }
  66%  { background-image: url("noise-3.png"); }
  100% { background-image: url("noise-1.png"); }
}
.noise-overlay--yolo {
  opacity: 0.08;
  animation: noise-flicker 0.3s steps(1) infinite;
}
```

**Reduced motion:** static noise only, opacity 0.03. **High contrast:** removed.

### 2.8 Scanlines

**What it is:** horizontal CRT scanlines via `repeating-linear-gradient` — the terminal's DNA. Subtle at rest (3% opacity), slightly stronger inside the terminal embed (6%).

**Implementation:**

```css
.scanlines {
  background-image: repeating-linear-gradient(
    0deg,
    transparent 0px,
    transparent 2px,
    rgba(0, 0, 0, 0.5) 2px,
    rgba(0, 0, 0, 0.5) 3px
  );
  opacity: 0.03;
  pointer-events: none;
}
```

**Terminal variant** (stronger, with a slow vertical drift — the only ambient motion allowed besides the beam):

```css
.scanlines--terminal {
  opacity: 0.06;
  background-image: repeating-linear-gradient(
    0deg,
    transparent 0px,
    transparent 3px,
    rgba(0, 0, 0, 0.6) 3px,
    rgba(0, 0, 0, 0.6) 4px
  );
  animation: scan-drift 8s linear infinite;
}
@keyframes scan-drift {
  from { background-position: 0 0; }
  to   { background-position: 0 4px; }
}
```

**Rules:**
- Scanlines sit at Layer 1 — above abyss, below everything else. They never cover text.
- Scanline opacity is a user setting (0–10%, default 3%) in the Settings panel (§3.6).
- On mobile, scanlines are disabled by default (they fight with OLED subpixel rendering at small sizes).

**Reduced motion:** drift disabled; static scanlines remain (they're not motion).

---

## 3. Component Specifications

All components inherit global design tokens. Every surface uses the dark terminal aesthetic: `--abyss` base, liquid glass overlays, optional noise/scanline layers, and spring-driven motion. Components render at 60fps in Safari and remain usable on viewports ≥320px width.

### 3.1 Global Token Reference

| Token | Value | Usage |
|-------|-------|-------|
| `--abyss` | `#050507` | Page/app background |
| `--green` | `#00d992` | Accent, focus rings, active indicators |
| `--glass-bg` | `rgba(10, 10, 14, 0.55)` | Panel fill |
| `--glass-border` | `rgba(255, 255, 255, 0.08)` | Panel borders, dividers |
| `--text` | `#e8e8e6` | Primary copy |
| `--text-dim` | `#9a9a94` | Secondary copy, placeholders |
| `--danger` | `#ff5c5c` | Destructive actions, errors |
| `--warning` | `#ffb454` | Warnings, pending states |
| `--radius-lg` | `14px` | Windows, panels, modals |
| `--radius-md` | `10px` | Buttons, inputs, selects |
| `--radius-sm` | `6px` | Tags, badges, pills |
| `--radius-xl` | `20px` | Dock item containers |
| `--shadow-panel` | `0 8px 32px rgba(0, 0, 0, 0.5)` | Floating panels |
| `--font-mono` | `'JetBrains Mono', 'SF Mono', monospace` | Code, terminal, numeric UI |
| `--font-sans` | `'Inter', -apple-system, BlinkMacSystemFont, sans-serif` | General UI text |

Shared glass mixin (applied to window chrome, sidebar, dock, settings):

```css
.glass-surface {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturate));
  -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturate));
  box-shadow: var(--shadow-panel);
  border-radius: var(--radius-lg);
  transform: translateZ(0);
  will-change: transform, opacity;
}
```

Optional atmospheric overlays (disabled in `forced-colors: active` and when user disables effects in settings):

```css
.noise-overlay {
  pointer-events: none;
  opacity: 0.04;
  mix-blend-mode: overlay;
  background-image: url('/assets/noise-256.png');
  background-repeat: repeat;
}
.scanlines-overlay {
  pointer-events: none;
  opacity: 0.03;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0, 0, 0, 0.15) 2px,
    rgba(0, 0, 0, 0.15) 4px
  );
}
```

---

### 3.2 Window Chrome

**Purpose:** Primary application frame mimicking macOS window behavior with liquid glass title bar and traffic-light controls.

**DOM structure:**

```
[role="dialog" aria-label="Application window"]
  ├── .window-chrome (draggable)
  │     ├── .traffic-lights [role="group" aria-label="Window controls"]
  │     │     ├── button.close    aria-label="Close window"
  │     │     ├── button.minimize aria-label="Minimize window"
  │     │     └── button.zoom     aria-label="Zoom window"
  │     └── .title-bar-drag-region (data-draggable="true")
  └── .window-content [role="main"]
```

**CSS — title bar and chrome:**

```css
.window-chrome {
  height: 40px;
  display: flex;
  align-items: center;
  padding: 0 12px 0 80px; /* space for traffic lights */
  background: var(--glass-bg);
  border-bottom: 1px solid var(--glass-border);
  backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturate));
  -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturate));
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  user-select: none;
  -webkit-user-select: none;
  cursor: default;
  position: relative;
  z-index: 10;
}
.title-bar-drag-region {
  flex: 1;
  height: 100%;
  -webkit-app-region: drag; /* Electron/Tauri when available */
  cursor: grab;
}
.title-bar-drag-region:active {
  cursor: grabbing;
}
.window-frame {
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-panel);
  border: 1px solid var(--glass-border);
  background: var(--abyss);
}
.window-content {
  height: calc(100% - 40px);
  overflow: hidden;
}
```

**CSS — traffic lights:**

```css
.traffic-lights {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  gap: 8px;
  -webkit-app-region: no-drag;
}
.traffic-lights button {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: none;
  padding: 0;
  cursor: pointer;
  transition: transform 180ms cubic-bezier(0.34, 1.56, 0.64, 1),
              filter 120ms cubic-bezier(0.34, 1.56, 0.64, 1);
}
.traffic-lights button:focus-visible {
  outline: 2px solid var(--green);
  outline-offset: 2px;
}
.traffic-lights .close    { background: #ff5f57; }
.traffic-lights .minimize { background: #febc2e; }
.traffic-lights .zoom     { background: #28c840; }
.traffic-lights:hover button { filter: brightness(1.08); }
.traffic-lights:hover button:hover { transform: scale(1.12); }
```

**Behavior requirements:**

| Action | Trigger | Result |
|--------|---------|--------|
| Close | Click `.close` or `Cmd/Ctrl+W` | Emit `window:close`; hide or exit per host |
| Minimize | Click `.minimize` or `Cmd/Ctrl+M` | Emit `window:minimize`; collapse to dock/taskbar |
| Zoom / restore | Click `.zoom` or double-click drag region | Toggle maximized state |
| Maximize | Double-click `.title-bar-drag-region` | Set `data-window-state="maximized"`; animate scale via transform |
| Drag | Pointer down on drag region | Move window (native or simulated offset) |
| Keyboard | `Escape` when window is modal | Close topmost modal window only |

**Maximize animation:** Use transform-only scale from center-top:

```css
.window-frame[data-window-state="maximized"] {
  position: fixed;
  inset: 8px;
  width: auto !important;
  height: auto !important;
  transition: transform 320ms var(--spring-window),
              opacity 200ms var(--spring-window);
}
```

Spring JS override for maximize (see §4): stiffness `300`, damping `30`, mass `1`.

---

### 3.3 Dock Navigation

**Purpose:** macOS-style bottom dock for primary module navigation with spring-open sub-menus, badges, and tooltips.

**DOM structure:**

```
nav.dock [role="navigation" aria-label="Main dock"]
  └── ul.dock-list
        └── li.dock-item [aria-current="page" when active]
              ├── button.dock-button [aria-label, aria-expanded, aria-haspopup]
              ├── span.dock-badge [aria-label="3 notifications"] (optional)
              ├── div.dock-tooltip (hover/focus)
              └── ul.dock-submenu [role="menu"] (optional)
```

**CSS — dock container:**

```css
.dock {
  position: fixed;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%) translateZ(0);
  z-index: 100;
  padding: 8px 12px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturate));
  -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturate));
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-panel);
  touch-action: manipulation;
}
.dock-list {
  display: flex;
  align-items: flex-end;
  gap: 4px;
  list-style: none;
  margin: 0;
  padding: 0;
}
.dock-item {
  position: relative;
}
.dock-button {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-xl);
  border: none;
  background: transparent;
  color: var(--text-dim);
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1),
              color 150ms cubic-bezier(0.34, 1.56, 0.64, 1);
  transform-origin: bottom center;
}
.dock-item[data-active="true"] .dock-button {
  color: var(--text);
}
.dock-item[data-active="true"]::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 1px;
  background: var(--green);
  border-radius: 1px;
}
.dock-button:hover,
.dock-button:focus-visible {
  transform: scale(1.18) translateY(-6px);
  color: var(--text);
}
.dock-button:focus-visible {
  outline: 2px solid var(--green);
  outline-offset: 2px;
}
```

**Badge:**

```css
.dock-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: var(--radius-sm);
  background: var(--danger);
  color: #fff;
  font-family: var(--font-mono);
  font-size: 10px;
  line-height: 16px;
  text-align: center;
  pointer-events: none;
}
```

**Tooltip:**

```css
.dock-tooltip {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%) translateY(4px);
  opacity: 0;
  pointer-events: none;
  padding: 4px 8px;
  background: rgba(20, 20, 22, 0.92);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-sm);
  font-family: var(--font-sans);
  font-size: 11px;
  color: var(--text);
  white-space: nowrap;
  transition: opacity 150ms cubic-bezier(0.34, 1.56, 0.64, 1),
              transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1);
}
.dock-button:hover + .dock-tooltip,
.dock-button:focus-visible + .dock-tooltip {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}
```

**Sub-menu spring-open (JS):**

Sub-menus open upward with spring physics. Initial state: `opacity: 0; transform: translateY(8px) scale(0.92)`. Target: `opacity: 1; transform: translateY(0) scale(1)`.

| Property | Value |
|----------|-------|
| Library | `@react-spring/web` or equivalent spring integrator |
| Stiffness | `500` |
| Damping | `25` |
| Mass | `1` |
| Duration cap | `400ms` (snap to rest if exceeded) |

```css
.dock-submenu {
  position: absolute;
  bottom: calc(100% + 12px);
  left: 50%;
  transform: translateX(-50%);
  min-width: 160px;
  padding: 6px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-panel);
  list-style: none;
  margin: 0;
}
.dock-submenu[hidden] {
  display: none;
}
```

**Interaction:** Click or `Enter`/`Space` on dock button toggles submenu. `Escape` closes open submenu. Only one submenu open at a time. `aria-expanded="true|false"` reflects state. Active route sets `aria-current="page"` on `li.dock-item`.

**Mobile (≤768px):** Dock remains fixed; icon size reduces to `40px`; magnification on hover disabled; tap opens submenu without hover magnification.

---

### 3.4 Sidebar

**Purpose:** Collapsible left navigation and context panel with draggable width and icon-only collapsed mode.

**DOM structure:**

```
aside.sidebar [role="complementary" aria-label="Sidebar"]
  ├── .sidebar-resize-handle [role="separator" aria-orientation="vertical" aria-valuenow]
  ├── .sidebar-header
  │     └── button.sidebar-collapse [aria-label="Toggle sidebar" aria-expanded]
  └── nav.sidebar-sections
        └── section.sidebar-section
              ├── h2.sidebar-section-header
              └── ul.sidebar-items
```

**CSS — expanded (default 280px):**

```css
.sidebar {
  width: var(--sidebar-width, 280px);
  min-width: 200px;
  max-width: 400px;
  height: 100%;
  background: var(--glass-bg);
  border-right: 1px solid var(--glass-border);
  backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturate));
  -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturate));
  display: flex;
  flex-direction: column;
  transition: width 380ms var(--spring-window),
              transform 380ms var(--spring-window);
  transform: translateZ(0);
  flex-shrink: 0;
  touch-action: manipulation;
}
.sidebar[data-collapsed="true"] {
  width: 72px;
  min-width: 72px;
}
.sidebar-section-header {
  font-family: var(--font-sans);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-dim);
  padding: 16px 16px 8px;
  margin: 0;
}
.sidebar[data-collapsed="true"] .sidebar-section-header {
  opacity: 0;
  height: 0;
  padding: 0;
  overflow: hidden;
}
.sidebar-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  margin: 2px 8px;
  border-radius: var(--radius-md);
  color: var(--text-dim);
  font-family: var(--font-sans);
  font-size: 13px;
  cursor: pointer;
  transition: background 180ms cubic-bezier(0.34, 1.56, 0.64, 1),
              color 150ms cubic-bezier(0.34, 1.56, 0.64, 1);
}
.sidebar-item:hover,
.sidebar-item[aria-current="page"] {
  background: rgba(255, 255, 255, 0.06);
  color: var(--text);
}
.sidebar-item[aria-current="page"] {
  box-shadow: inset 2px 0 0 var(--green);
}
```

**Resize handle:**

```css
.sidebar-resize-handle {
  position: absolute;
  top: 0;
  right: -3px;
  width: 6px;
  height: 100%;
  cursor: col-resize;
  touch-action: none;
  z-index: 5;
}
.sidebar-resize-handle:hover,
.sidebar-resize-handle:focus-visible {
  background: rgba(0, 217, 146, 0.25);
  outline: none;
}
.sidebar-resize-handle:focus-visible {
  box-shadow: inset 0 0 0 2px var(--green);
}
```

**Behavior:**

| Control | Action |
|---------|--------|
| `Cmd+B` / `Ctrl+B` | Toggle collapsed state; persist in `localStorage` key `finn.sidebar.collapsed` |
| Drag resize handle | Update `--sidebar-width` clamped to `200px–400px`; persist as `finn.sidebar.width` |
| Collapse button | Same as keyboard toggle |
| Swipe right from left edge (mobile) | Open sidebar if closed |
| Swipe left on sidebar (mobile) | Close sidebar overlay |

Collapsed mode shows icons only (24×24px), centered in 72px width; labels move to `aria-label` on each item. Tooltips appear on focus/hover matching dock tooltip styling.

Layout shift spring: stiffness `200`, damping `20`, mass `1`.

---

### 3.5 Chat Bubbles

**Purpose:** Conversation UI with markdown pipeline, syntax-highlighted code, role styling, and accessible live updates.

**DOM structure:**

```
section.chat [role="log" aria-label="Conversation" aria-live="polite" aria-relevant="additions"]
  └── article.chat-bubble [data-role="user|assistant|tool"]
        ├── header.chat-bubble-meta
        └── div.chat-bubble-body (rendered markdown)
              └── pre.chat-code-block
                    ├── code (highlighted)
                    └── button.copy-code [aria-label="Copy code"]
```

**CSS — bubble layout:**

```css
.chat {
  overflow-y: auto;
  overscroll-behavior: contain;
  scroll-behavior: smooth;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.chat-bubble {
  max-width: 85%;
  padding: 12px 16px;
  border-radius: var(--radius-lg);
  font-family: var(--font-sans);
  font-size: 14px;
  line-height: 1.55;
  word-break: break-word;
}
.chat-bubble[data-role="user"] {
  align-self: flex-end;
  background: rgba(0, 217, 146, 0.12);
  border: 1px solid rgba(0, 217, 146, 0.25);
  color: var(--text);
  border-bottom-right-radius: 4px;
}
.chat-bubble[data-role="assistant"] {
  align-self: flex-start;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  color: var(--text);
  border-bottom-left-radius: 4px;
}
.chat-bubble[data-role="tool"] {
  align-self: flex-start;
  background: rgba(255, 159, 10, 0.08);
  border: 1px solid rgba(255, 159, 10, 0.2);
  color: var(--text-dim);
  font-family: var(--font-mono);
  font-size: 13px;
  border-left: 3px solid var(--warning);
}
.chat-bubble-meta {
  font-size: 11px;
  color: var(--text-dim);
  margin-bottom: 6px;
  font-family: var(--font-mono);
}
```

**Markdown rendering pipeline:**

1. Parse input with a CommonMark-compliant parser (e.g., `marked`, `micromark`).
2. Sanitize HTML output with an allowlist (`p`, `a`, `ul`, `ol`, `li`, `strong`, `em`, `code`, `pre`, `blockquote`, `h1–h4`, `table`, `thead`, `tbody`, `tr`, `th`, `td`).
3. External links receive `rel="noopener noreferrer"` and `target="_blank"`.
4. Inline code: `font-family: var(--font-mono); background: rgba(255,255,255,0.06); padding: 2px 6px; border-radius: 4px;`.
5. Fenced code blocks route through syntax highlighter (e.g., `shiki` or `highlight.js`) with theme aligned to tokens:

| Highlight role | Color |
|----------------|-------|
| Background | `#0a0a0c` |
| Default text | `var(--text)` |
| Keywords | `var(--green)` |
| Strings | `#ffb454` |
| Comments | `rgba(255,255,255,0.35)` |
| Functions | `#64d2ff` |

**Code block chrome:**

```css
.chat-code-block {
  position: relative;
  margin: 8px 0 0;
  padding: 12px 16px 12px 12px;
  background: #0a0a0c;
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  overflow-x: auto;
  font-family: var(--font-mono);
  font-size: 13px;
  line-height: 1.5;
}
.copy-code {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 4px 8px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--glass-border);
  background: rgba(255, 255, 255, 0.06);
  color: var(--text-dim);
  font-size: 11px;
  font-family: var(--font-sans);
  cursor: pointer;
  opacity: 0;
  transition: opacity 150ms cubic-bezier(0.34, 1.56, 0.64, 1);
}
.chat-code-block:hover .copy-code,
.chat-code-block:focus-within .copy-code {
  opacity: 1;
}
.copy-code:focus-visible {
  outline: 2px solid var(--green);
  outline-offset: 2px;
}
```

**Copy behavior:** Click copies raw code string to clipboard; button label changes to "Copied" for `2000ms`; announce via `[role="status"]` live region.

**Scroll behavior:** New messages append without forced scroll unless user is within `80px` of bottom (`data-stick-to-bottom="true"`). User scroll-up disables auto-scroll until re-enabled by scrolling to bottom or clicking "Jump to latest" affordance.

**Streaming:** Partial assistant messages update in place; `aria-busy="true"` during stream, removed on completion.

---

### 3.6 Terminal Embed

**Purpose:** Embedded xterm.js terminal with design-token color mapping, fit addon, and consistent chrome.

**DOM structure:**

```
section.terminal-panel [role="region" aria-label="Terminal"]
  ├── .terminal-chrome
  │     ├── span.terminal-title
  │     └── div.terminal-actions
  └── div.terminal-host (#xterm-container)
```

**xterm.js configuration:**

```javascript
{
  fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
  fontSize: 13,
  lineHeight: 1.4,
  cursorBlink: true,
  cursorStyle: 'block',
  scrollback: 5000,
  theme: { /* see mapping table */ },
  allowTransparency: true,
  convertEol: true
}
```

**Color mapping (xterm theme → design tokens):**

| xterm key | Value |
|-----------|-------|
| `background` | `#050507` (`--abyss`) |
| `foreground` | `#e8e8e6` |
| `cursor` | `#00d992` |
| `cursorAccent` | `#050507` |
| `selectionBackground` | `rgba(0, 217, 146, 0.25)` |
| `black` / bright variants | Standard ANSI tuned to dark UI |
| `green` | `#00d992` |
| `red` | `#ff5c5c` |
| `yellow` | `#ffb454` |
| `blue` | `#64d2ff` |

**CSS — host and chrome:**

```css
.terminal-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid var(--glass-border);
  background: var(--abyss);
}
.terminal-chrome {
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  background: var(--glass-bg);
  border-bottom: 1px solid var(--glass-border);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(var(--glass-blur));
  font-family: var(--font-sans);
  font-size: 12px;
  color: var(--text-dim);
}
.terminal-host {
  flex: 1;
  padding: 8px 12px;
  overflow: hidden;
}
.terminal-host .xterm {
  height: 100%;
}
.terminal-host .xterm-viewport {
  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,0.15) transparent;
}
```

**Fit addon behavior:**

- Instantiate `@xterm/addon-fit` FitAddon on mount.
- Call `fitAddon.fit()` on: initial render, sidebar toggle, window resize, terminal panel resize (ResizeObserver).
- Debounce resize handler at `16ms` (one frame).
- Minimum terminal columns: `40`; minimum rows: `8`. Below threshold, horizontal scroll enabled rather than unreadable font scaling below `11px`.

**Font sizing:** Default `13px`; user-adjustable in settings ±4px in `1px` steps; persist as `finn.terminal.fontSize`.

**Cursor:** Block cursor, blinking at `530ms` on / `530ms` off; blink disabled when `prefers-reduced-motion: reduce` or animations disabled in settings (solid cursor).

---

### 3.7 Settings Panel

**Purpose:** Full-feature customization UI with categorized controls, search, live preview, and reset.

**DOM structure:**

```
dialog.settings-panel [role="dialog" aria-labelledby="settings-title" aria-modal="true"]
  ├── header.settings-header
  │     ├── h1#settings-title
  │     ├── input.settings-search [type="search" aria-label="Filter settings"]
  │     └── button.settings-close [aria-label="Close settings"]
  ├── div.settings-body
  │     ├── nav.settings-nav [role="tablist"]
  │     └── div.settings-content [role="tabpanel"]
  │           └── section.settings-category (per category)
  │                 ├── h2 [aria-expanded for collapsible groups]
  │                 └── div.settings-controls
  └── footer.settings-footer
        └── button.reset-defaults [aria-label="Reset all settings to defaults"]
```

**Categories (tab order in nav):**

| Tab ID | Label | Controls |
|--------|-------|----------|
| `appearance` | Appearance | Theme intensity, glass blur (max 40px), noise/scanlines toggles, accent color read-only display |
| `typography` | Typography | UI font size (12–16px), mono font size (11–15px), line height |
| `layout` | Layout | Sidebar default width, dock visibility, panel density |
| `motion` | Motion | Master animation toggle, spring intensity slider (0–100%) |
| `terminal` | Terminal | Font size, cursor blink, scrollback limit |
| `chat` | Chat | Code theme, copy button default visibility, stick-to-bottom default |
| `accessibility` | Accessibility | High contrast override, reduce motion override, focus ring width |
| `keyboard` | Keyboard | Shortcut reference (read-only table) |

**CSS:**

```css
.settings-panel {
  width: min(720px, 92vw);
  max-height: min(80vh, 640px);
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(var(--glass-blur)) saturate(1.2);
  -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(1.2);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-panel);
  display: flex;
  flex-direction: column;
  padding: 0;
  color: var(--text);
  font-family: var(--font-sans);
}
.settings-body {
  display: grid;
  grid-template-columns: 180px 1fr;
  flex: 1;
  overflow: hidden;
}
.settings-nav [role="tab"] {
  padding: 10px 16px;
  text-align: left;
  border: none;
  background: transparent;
  color: var(--text-dim);
  font-size: 13px;
  cursor: pointer;
  border-radius: var(--radius-md);
  margin: 2px 8px;
  transition: background 180ms cubic-bezier(0.34, 1.56, 0.64, 1),
              color 150ms cubic-bezier(0.34, 1.56, 0.64, 1);
}
.settings-nav [role="tab"][aria-selected="true"] {
  background: rgba(0, 217, 146, 0.12);
  color: var(--text);
  box-shadow: inset 2px 0 0 var(--green);
}
.settings-control-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid var(--glass-border);
  gap: 16px;
}
.settings-control-row label {
  font-size: 13px;
  color: var(--text);
}
.settings-control-row .hint {
  font-size: 11px;
  color: var(--text-dim);
}
```

**Control types:**

- **Toggle:** 44×24px switch; on state fill `var(--green)`; spring thumb animation (stiffness `500`, damping `25`).
- **Slider:** Track height `4px`, thumb `16px` circle, accent `var(--green)`; `aria-valuemin`, `aria-valuemax`, `aria-valuenow`.
- **Select:** Native or custom listbox with `role="listbox"` / `role="option"`.

**Search/filter:** Filters visible control rows by label and hint text; non-matching rows receive `hidden` attribute; empty state displays "No matching settings."

**Live preview:** Changes to appearance, typography, motion, and terminal categories apply immediately to the app shell behind the dialog (non-destructive). Revert on cancel; commit on explicit "Save" or auto-save per toggle based on `finn.settings.autoSave` (default `true`).

**Reset to defaults:** Footer button opens confirmation sub-dialog; on confirm, all keys under `finn.settings.*` reset to documented defaults and UI re-renders.

**Open/close:** `Cmd/Ctrl+,` opens; `Escape` or close button dismisses; focus trap active while open; focus returns to previously focused element on close.

---

## 4. Animation & Motion System

All UI motion uses spring physics or spring-equivalent cubic-bezier curves. Linear `transition-timing-function: linear` is prohibited for user-visible transitions.

### 4.1 Spring Configuration Matrix

| Context | Stiffness | Damping | Mass | CSS fallback cubic-bezier |
|---------|-----------|---------|------|---------------------------|
| Panels, windows, sidebar width, settings dialog | 300 | 30 | 1 | `var(--spring-window)` |
| Buttons, toggles, dock magnification, tooltips | 500 | 25 | 1 | `cubic-bezier(0.34, 1.56, 0.64, 1)` |
| Layout shifts (content reflow adjacent to sidebar) | 200 | 20 | 1 | `cubic-bezier(0.25, 0.8, 0.25, 1.0)` |

**JS spring invocation (react-spring example):**

```javascript
import { useSpring } from '@react-spring/web';

const panelSpring = {
  stiffness: 300,
  damping: 30,
  mass: 1,
};

const buttonSpring = {
  stiffness: 500,
  damping: 25,
  mass: 1,
};

const layoutSpring = {
  stiffness: 200,
  damping: 20,
  mass: 1,
};
```

When JS springs run, CSS transitions on the same properties are disabled (`transition: none`) to prevent conflict.

### 4.2 Allowed Animated Properties

Only `transform` and `opacity` are animated for continuous motion. Width changes on sidebar use CSS transition with spring cubic-bezier fallback; JS width animation uses spring when available.

**Prohibited animated properties:** `top`, `left`, `width` (except sidebar spring controller), `height`, `margin`, `padding`, `box-shadow` (static only), `backdrop-filter`.

**GPU layer promotion:**

```css
.gpu-layer {
  transform: translateZ(0);
  will-change: transform, opacity;
}
```

Remove `will-change` after animation completes (`animationend` / spring rest callback).

### 4.3 Standard Keyframes

**Fade in (modals, tooltips):**

```css
@keyframes finn-fade-in {
  from { opacity: 0; transform: translateY(6px) scale(0.98); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
.finn-animate-in {
  animation: finn-fade-in 280ms var(--spring-window) both;
}
```

**Pulse (badge attention, single cycle):**

```css
@keyframes finn-pulse-once {
  0%   { transform: scale(1); }
  50%  { transform: scale(1.08); }
  100% { transform: scale(1); }
}
.finn-pulse-once {
  animation: finn-pulse-once 400ms cubic-bezier(0.34, 1.56, 0.64, 1) 1;
}
```

**Reduced substitute (opacity only):**

```css
@keyframes finn-fade-in-reduced {
  from { opacity: 0; }
  to   { opacity: 1; }
}
```

### 4.4 prefers-reduced-motion

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  .dock-button:hover {
    transform: none;
  }
  .finn-animate-in {
    animation: finn-fade-in-reduced 150ms ease both;
  }
}
```

When reduced motion is active or user setting `finn.settings.animationsEnabled === false`:

- Disable dock magnification, parallax, and spring JS integrators (instant state set).
- Terminal cursor becomes solid (no blink).
- Sidebar/dock use opacity cross-fade only (max `150ms`).
- No auto-scroll animation in chat; instant scroll jump only on user action.

### 4.5 Safari & Performance Constraints

- Every `backdrop-filter` declaration includes `-webkit-backdrop-filter` duplicate.
- Blur values do not exceed `40px` anywhere in the app.
- Maximum simultaneous animated layers: `12`; queue or skip non-critical animations when exceeded.
- Target frame budget: `16.67ms` per frame; spring calculations run in `requestAnimationFrame` loop.
- Use `contain: layout style paint` on chat and terminal panels.

### 4.6 Mobile Gesture Specifications

| Gesture | Target | Behavior |
|---------|--------|----------|
| Swipe right from x < 24px | Sidebar (closed) | Open sidebar overlay; spring slide-in from `translateX(-100%)` to `0` |
| Swipe left on sidebar | Sidebar (open, mobile) | Close to off-canvas; spring slide-out |
| Pinch zoom | Document | Disabled via `<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">` and `touch-action: manipulation` on interactive roots |
| Long press | Dock icons | No context menu; tooltip appears after `500ms` |

Mobile sidebar overlay uses full-height glass panel at `min(320px, 85vw)` with backdrop dim `rgba(0,0,0,0.5)` fading via opacity spring (stiffness `300`, damping `30`).

---

## 5. Accessibility

Accessibility is a hard requirement across all components. Every interactive surface is operable by keyboard, perceivable by screen readers, and usable in high-contrast and reduced-motion modes.

### 5.1 Keyboard Navigation

**Global focus ring:**

```css
:focus-visible {
  outline: 2px solid var(--green);
  outline-offset: 2px;
}
:focus:not(:focus-visible) {
  outline: none;
}
```

**Tab order:** Follow visual reading order: window controls (optional skip) → sidebar → main content → dock → footer actions. Modals trap focus; `Tab` cycles within, `Shift+Tab` reverses.

**Global shortcut table:**

| Shortcut | Action |
|----------|--------|
| `Tab` / `Shift+Tab` | Move focus forward/back |
| `Enter` / `Space` | Activate focused button, toggle, list item |
| `Escape` | Close topmost modal, drawer, dock submenu, or settings |
| `Cmd/Ctrl+B` | Toggle sidebar collapse |
| `Cmd/Ctrl+,` | Open settings |
| `Cmd/Ctrl+W` | Close window (host permitting) |
| `Cmd/Ctrl+M` | Minimize window |
| `ArrowUp/Down` | Navigate lists (sidebar, settings nav, dock submenu) |
| `ArrowLeft/Right` | Switch settings tabs |
| `Home` / `End` | First/last item in list contexts |

**Roving tabindex:** Sidebar items, dock items, and settings tabs use roving `tabindex="0"` on active element, `-1` on siblings.

### 5.2 ARIA Role Assignments

| Region | Role | Key attributes |
|--------|------|----------------|
| App shell content | `main` | `aria-label="Finn Pentest Harness"` |
| Dock | `navigation` | `aria-label="Main dock"` |
| Sidebar | `complementary` | `aria-label="Sidebar"` |
| Chat thread | `log` | `aria-live="polite"`, `aria-relevant="additions"` |
| Chat message | `article` | `aria-label="{role} message at {time}"` |
| Terminal | `region` | `aria-label="Terminal output"` |
| Settings | `dialog` | `aria-modal="true"`, `aria-labelledby` |
| Settings categories | `tablist` / `tabpanel` | `aria-selected`, `aria-controls` |
| Dock submenu | `menu` | `menuitem` children |
| Copy confirmation | `status` | `aria-live="polite"`, `aria-atomic="true"` |
| Streaming response | `status` | `aria-busy="true"` during stream |
| Badge count | text in `aria-label` | e.g., `aria-label="Scan results, 3 items"` |

Icon-only buttons include descriptive `aria-label` (never rely on icon shape alone). Collapsible settings groups use `aria-expanded="true|false"` on `h2` trigger buttons. Active navigation items set `aria-current="page"`.

### 5.3 Screen Reader Announcements

- New chat messages: appended to `role="log"` container; live region announces without reading entire history (polite, additions only).
- Tool execution (`data-role="tool"`): prefix meta label "Tool output" in accessible name.
- Terminal output: xterm exposes buffer to assistive tech; terminal chrome includes visually hidden instructions: "Terminal input field. Use keyboard to interact."
- Settings changes: on toggle/slider commit, `role="status"` announces "{Setting name} changed to {value}."
- Errors: `role="alert"` for critical failures (connection lost, command error); `aria-live="assertive"`.

### 5.4 High Contrast Mode

```css
@media (forced-colors: active) {
  .glass-surface,
  .sidebar,
  .dock,
  .window-chrome,
  .settings-panel {
    background: Canvas;
    border: 1px solid CanvasText;
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    box-shadow: none;
  }
  .noise-overlay,
  .scanlines-overlay {
    display: none;
  }
  :focus-visible {
    outline: 2px solid Highlight;
    outline-offset: 2px;
  }
  .dock-item[data-active="true"]::after,
  .sidebar-item[aria-current="page"] {
    background: Highlight;
    box-shadow: none;
  }
  .chat-bubble {
    border: 1px solid CanvasText;
  }
}
```

In forced-colors mode, all text meets **4.5:1** contrast against `Canvas` using system `CanvasText`. Semantic colors (`--green`, `--danger`, `--warning`) map to `Highlight`, `LinkText`, or `GrayText` as appropriate; no information is conveyed by color alone (icons or text labels accompany status).

User-facing high-contrast toggle in settings (`finn.settings.highContrast`) applies a persistent class `.high-contrast` mirroring forced-colors rules even when OS mode is off.

### 5.5 Motion Sensitivity

- Honor `prefers-reduced-motion: reduce` at OS level (see §4.4).
- Settings → Motion → "Enable animations" toggle persists to `finn.settings.animationsEnabled` (default `true`). When `false`, all animation paths in §4 are bypassed.
- No parallax backgrounds or scroll-linked transforms.
- Chat auto-scroll occurs only when user is already at bottom or explicitly clicks "Jump to latest"; no unsolicited scroll on unrelated UI changes.

### 5.6 Touch & Mobile Accessibility

- Minimum touch target: **44×44px** for all buttons, dock items, sidebar collapse, and resize handle hit area (visual may be smaller; padding extends hit region).
- `touch-action: manipulation` on all interactive elements prevents double-tap zoom delay.
- Sidebar swipe gestures have keyboard-equivalent (toggle button always visible on mobile header).
- Orientation changes reflow without loss of focus; focused element remains focused after rotation.

### 5.7 Accessibility Verification Checklist

Every release candidate passes:

1. Full keyboard traversal of all modules without pointer.
2. VoiceOver (Safari/macOS) and NVDA (Firefox/Windows) smoke test on chat, terminal, settings, and dock.
3. Axe-core scan: zero critical violations on main views.
4. Contrast audit: all primary text ≥ 4.5:1; large text ≥ 3:1 against adjacent backgrounds.
5. Forced-colors simulation: glass removed, focus visible, navigation state perceivable.
6. Reduced-motion simulation: no spring motion, no cursor blink, no parallax.
