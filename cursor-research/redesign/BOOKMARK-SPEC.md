# FINN WORKSTATION — BOOKMARK-SOURCED DESIGN SPEC

> **Why this file exists:** Every design decision in the redesign traces back to a specific Twitter bookmark. This is the sourcing ledger — when Cursor asks "why this?", point here. This keeps the design grounded in Arriq's taste, not AI defaults.

---

## 1. THE CORE AESTHETIC — JAKUB ANTALIK

These are the backbone. They appear across your bookmarks repeatedly.

| Effect | Source | Applied where |
|--------|--------|--------------|
| **Border Beam** | `beam.jakubantalik.com` | Animated boundary on the ACTIVE engagement/space card (hover + focus) |
| **Thinking Orbs** | `orbs.jakubantalik.com` | AI strip busy state — replaces the plain pulsing dot |
| **Liquid Metal 1.0** | Liquid metal UI interaction | The 40px titlebar — ONE shared WebGL context, titlebar only |
| **Dynamic Boundary Beam / Orbs** | Chinese dev variant of same | Same usage as above |

**Rule (non-negotiable):** Liquid metal is identity, not wallpaper. ONE metal surface. A second WebGL plane is a demo.

## 2. ANTI-SLOP / QUALITY CONTROLS

Sourced from bookmarks that explicitly target "kill AI slop."

| Skill/Repo | Install | What it enforces |
|-----------|---------|------------------|
| **anti-slop** | `npx skills add dmmulroy/anti-slop --skill install-anti-slop` | Kill AI-slop patterns |
| **chiefkeef.md** | 724K char doc | **0 box shadows**, kills generic AI-slop design language |
| **Google Stitch** | `github.com/google-labs-code/stitch-skills` | Design skills for agents |
| **spec-kit** | `github.com/github/spec-kit` | Define reqs/arch/tasks BEFORE coding |
| **interfaces.dev/cheat-sheet** | interfaces.dev | Small things that make interfaces better |
| **checklist.design** | checklist.design | Step-by-step UI component checklist |

**The non-negotiable prompt rule:**
```
Apply anti-slop rules: 0 box shadows, no generic gradients, no fake metrics,
locked design tokens, verify mobile 320/375/414/768, WCAG AA contrast, keyboard-first.
```

## 3. GLASSMORPHISM — LIQUID GLASS

| Lib | Notes |
|-----|-------|
| **GlassKit** | 24 components, iOS 26 Liquid Glass inspired, no deps |
| **liquid-glass-svelte** | **Svelte-native**, liquid distortion + dynamic lighting — THE one to use |
| **@mawtech/glass-ui** | Apple macOS/visionOS dark-first glass |

Tokens: `--glass-1`→`--glass-4`, 32-40px blur, 0.45→0.72 opacity, edge refraction via `::before` gradient + mask-composite. Glass only at real overlaps.

## 4. MOTION & SPRINGS

| Lib | Use |
|-----|-----|
| **morphicons** | `github.com/guillermolg00/morphicons` — icon→icon morphing, no deps |
| **Framer/svelte-motion** | spring curves (the three below) |
| **Amicro** | `amicro.vercel.app` — premium micro-interactions + transitions |
| **Shaders v3** | WebGPU shader effects |

Springs: `bouncy (0.34,1.56,0.64,1)`, `smooth (0.22,1,0.36,1)`, `window (0.32,0.72,0,1)`.

**Reduced motion:** all honor `prefers-reduced-motion: reduce`.

## 5. SOUND (your "Cuelume UI sounds" bookmark)

| Lib | Notes |
|-----|-------|
| **cuelume** | 2KB, 10 UI sounds, ONE attribute per element, no config |
| **uisfx.com** | 900+ open-source sound effects |

Integration: `data-cuelume="click"` on buttons, `data-cuelume="success"` on approve, `data-cuelume="error"` on reject.

## 6. MACOS APP REFS (the "feel")

| App | What to steal |
|-----|---------------|
| **Cursor IDE** | Settings sheet, command palette, overlay window chrome |
| **Linear** | Sidebar density, spring physics, keyboard-first |
| **Raycast** | Command palette as a product, HUD toasts, sub-50ms |
| **Warp** | Blocks, AI in the stream, command model |
| **Arc** | Sidebar + Spaces + spatial memory |
| **Claude (app)** | Composer, artifacts, clean dark UI |
| **swiftuijs/ui** | SwiftUI-style components for web — mirror for macOS feel |

## 7. TYPOGRAPHY

| Font | Source | Use |
|------|--------|-----|
| **JetBrains Mono** | in project | Code, terminal, numeric, mono = machine data |
| **Inter** | in project | General UI, sans = human |
| **SF Pro Rounded** | `gY46MQnCuB` bookmark | consider for mobile breakpoints |

---

## VERIFY EXISTENCE OF THESE BEFORE BUILDING
- ✅ `npm install cuelume` (v0.2.2) — VERIFIED real, MIT, 0 runtime deps, synthesized live
- ✅ `liquid-glass-svelte` (v1.2.0) — VERIFIED real, MIT, Svelte component
- Keep JetBrains Mono + Inter as the only two fonts

## WHY THIS REDESIGN WILL FEEL DIFFERENT
v3 applied effects ON TOP of an unresolved IA → "AI web app." 
v4 locks IA first (Spaces, block terminal, palette), THEN spends the metal/dither/glass budget on exactly three moments: **titlebar metal, one spring, one attention object.**

That's the difference between a Mac tool and a themed web app.
