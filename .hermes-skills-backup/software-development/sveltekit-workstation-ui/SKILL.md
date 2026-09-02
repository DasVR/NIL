---
name: sveltekit-workstation-ui
description: Build terminal-first macOS-native workstation UIs in SvelteKit.
version: 1.0.0
author: Arriq Aalraee (DasVR), Hermes Agent
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [svelte, sveltekit, ui, workstation, terminal, macos, design, density]
    related_skills: [impeccable, hallmark, dark-native-web-ui, design-taste-frontend, web-design-guidelines, micro-motion, web-typography, frontend-verification-guru, pentest-workstation-dev]
---

# SvelteKit Workstation UI

Build terminal-first, macOS-native workstation interfaces in SvelteKit. This skill captures every UI lesson from NIL and the pentest harness so I don't repeat AI-slop mistakes.

## When to Use

- Building or redesigning NIL, the pentest harness, a smart display dashboard, or any desktop-feeling web app.
- User says "make it feel native," "macOS app vibes," "terminal-first," "not a web app in a trench coat."
- Designing sidebars, terminals, AI strips, status bars, command palettes, or window chrome.

## When NOT to Use

- Generic marketing landing pages (use `design-taste-frontend` instead).
- Mobile-first apps (use `responsive-layout` + `ui-ux-pro-max`).
- Portfolio sites (use `impeccable` + user's portfolio-v2 patterns).

## Core Principles

1. **Terminal is the soul.** The center of the app is a terminal or command surface, not a chat input.
2. **Density over whitespace.** Workstation UIs show more data per pixel.
3. **Spring physics, not linear easing.** Native feel comes from cubic-bezier curves and reduced-motion respect.
4. **No fake terminal chrome.** Structured cards are clean and modern, not literal `$` prompts.
5. **Traffic lights do NOT belong on web apps.** Only true native macOS apps with `titleBarStyle: overlay` get them.

## Layout Architecture

### Terminal-First Workstation Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│ Titlebar (clean, no traffic lights)                                  │
├──────────┬──────────────────────────────┬──────────────┬─────────────┤
│          │                              │              │             │
│ Targets  │        Terminal / Work         │  Findings    │   AI Strip  │
│  Tree    │        Surface (hero)         │  / Timeline  │  (collapsed │
│ (left)   │                              │  (right)     │   default)  │
│          │                              │              │             │
├──────────┴──────────────────────────────┴──────────────┴─────────────┤
│ Status / Safety Bar                                                  │
└─────────────────────────────────────────────────────────────────────┘
```

Rules:
- Left sidebar: targets tree, 6–8px padding, 1.3 line-height, 26px rows.
- Center: terminal or work surface is the hero.
- Right sidebar: findings/timeline/context.
- Bottom: AI strip collapsed by default, expand with `Cmd+J`.
- Bottom bar: status/safety bar with engagement state, YOLO indicator, sandbox status.

### Titlebar Hierarchy

1. App-level titlebar (window chrome, drag region).
2. View-level header (PageHeader with title + actions).
3. Section headers inside panes.
4. NEVER add traffic-light buttons unless building a true native macOS app.

## Density Rules

| Element | Spec |
|---|---|
| Sidebar padding | 6–8px |
| Sidebar row height | 26px |
| Status bar height | 26–28px |
| Pane gap | 1px border + 4–8px gap |
| Line height (data) | 1.3 |
| Font for data | JetBrains Mono |
| Font for UI chrome | Inter or system sans |
| Target touch | 36px minimum (not 44px) |

## AI Strip: Exact Four States

The collapsed AI assistant strip has exactly four states:

| State | Visual | Behavior |
|---|---|---|
| **Idle** | Static violet N monogram, subtle glow. | Nothing happening. |
| **Thinking** | Notches breathe; ThinkingOrbs orbit coral+lavender. | Model is reasoning, no tokens streaming yet. |
| **Streaming** | Orbs converge into N; border beam glow; active pulse. | Tokens or tool outputs flowing. |
| **Done** | Solid cream N with soft pulse; returns to idle after delay. | Task complete, ready for next. |

Rules:
- Trigger state changes from backend SSE/WebSocket events, not guesswork.
- Keep the strip clean and modern — no `$` prompts, no bordered code panes, no literal terminal chrome.
- Use spring physics for every transition.
- Honor `prefers-reduced-motion`: freeze orbs, disable pulse, keep static colors.

## Status / Safety Bar

Always visible at the bottom. Contents:

- Left: engagement name, current target, mode (hunt/chat/code/report).
- Center: sandbox status (online/offline), last action.
- Right: YOLO indicator (red `[YOLO]` when enabled), provider/model tag.

## Spring Physics Tokens

Use these cubic-bezier curves for native feel:

```css
:root {
  --spring-bouncy: cubic-bezier(0.34, 1.56, 0.64, 1);
  --spring-smooth: cubic-bezier(0.22, 1, 0.36, 1);
  --spring-window: cubic-bezier(0.32, 0.72, 0, 1);
}
```

Usage:
- Open/close panels: `--spring-window`.
- Hover/press feedback: `--spring-smooth`.
- Overshoot animations (toasts, tabs): `--spring-bouncy`.

Always wrap in `@media (prefers-reduced-motion: reduce)` to disable motion.

## Glass / Liquid Material Tiers

Use CSS only, tiered blur + opacity:

```css
.glass-1 { --blur: 36px; --opacity: 0.45; }
.glass-2 { --blur: 26px; --opacity: 0.55; }
.glass-3 { --blur: 18px; --opacity: 0.65; }
.glass-4 { --blur: 12px; --opacity: 0.72; }
```

Add edge refraction highlight via `::before` gradient + `mask-composite`.
Do not apply glass to every surface — use it on 1–2 key moments.

## Empty States

Match Cursor/Linear: show engagement templates, recent engagements, and a clear "New Engagement" flow. Never use "Ask Finn anything" or emoji-heavy empty states.

## Typography Rule

- **Sans (Inter)** = human-facing labels, buttons, navigation.
- **Mono (JetBrains Mono)** = machine data, terminal output, file paths, timestamps.

Never use mono for body prose. Never use sans for raw tool output.

## Build Verification

After any UI code change:

1. Run `npm run build` and `npm run check`.
2. Check Safari and mobile widths.
3. Verify `prefers-reduced-motion` behavior.
4. Check console for errors.

See `frontend-verification-guru` skill for full verification procedure.

## Anti-Patterns

- Chat input as the hero of the app.
- "Message Finn…" placeholder as primary CTA.
- Rounded chat bubbles for tool output.
- Glass on every surface.
- Traffic lights on cross-platform Tauri apps.
- 44px touch targets on dense workstation UI.
- Literal terminal blocks (`$`, bordered code panes) inside the AI strip.

## Pitfalls

- **Forgetting reduced-motion support.** Always test with `prefers-reduced-motion: reduce`.
- **Hardcoding pane sizes.** Use CSS custom properties for layout so users can resize.
- **Mixing portfolio and workstation design tokens.** NIL uses deep violet `#452a84`, not the portfolio's abyss green `#00d992`.
- **Loading all tool definitions into context.** Lazy-load schemas; the terminal-first UI should not pre-render every possible command.

## Verification Checklist

- [ ] Layout matches terminal-first diagram.
- [ ] Density rules applied (6–8px sidebar, 26px rows).
- [ ] AI strip implements exactly four states with spring transitions.
- [ ] Status/safety bar visible with engagement + YOLO + model info.
- [ ] No traffic lights unless true native macOS app.
- [ ] Spring physics tokens used; reduced-motion supported.
- [ ] Glass applied to ≤2 surfaces.
- [ ] Empty state feels like Cursor/Linear, not chat-first.
- [ ] `npm run build` and `npm run check` pass.
- [ ] Browser runtime verified.
