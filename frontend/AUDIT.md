# NIL UI/UX Audit — v0.1.0 Skeleton (Cross-Skilled)

**Audited by:** Finn with `hallmark`, `design-taste-frontend`, `impeccable`, `tastecheck-*`, `design-system`, `ui-ux-pro-max`, `open-design-web-guidelines` loaded.  
**Date:** 2026-08-28  
**Scope:** `/home/das/projects/finn-pentest-harness/frontend/`  
**Current state:** SvelteKit 5 skeleton. Six components, zero routes.

---

## Pre-emit self-critique (Hallmark)

| Axis | Score | Why |
|---|---|---|
| Philosophy | 3/5 | Terminal-first intent is present, but execution defaults to generic dark-app patterns. |
| Hierarchy | 2/5 | No IA exists yet; only isolated decorative components. |
| Execution | 1/5 | Project does not install or build. |
| Specificity | 3/5 | NIL tokens are declared but not enforced in components. |
| Restraint | 2/5 | Glass attempted everywhere without edge refraction; glow on orbs. |
| Variety | 1/5 | One window, one dock, one loader — no page layout families. |

**Average: 2.0/5 — fails Hallmark pre-emit threshold (< 3 requires revision).**

---

## Design Read (design-taste-frontend)

> *Reading this as: a dark, high-density developer workstation (terminal-first coding agent) for technical users, with a native-macOS / Linear-style minimalist language, leaning toward native CSS + Svelte 5 + spring physics + restrained glass accents.*

That read should force the following dials:
- `DESIGN_VARIANCE: 6` — structured but not sterile
- `MOTION_INTENSITY: 5` — purposeful micro-interactions, no cinematic loops
- `VISUAL_DENSITY: 8` — cockpit density for the workspace

Current code does not reflect those dials.

---

## 1. Build & Tooling Failures

### 1.1 `npm install` fails (Blocker)

| Package | Declared | Real latest | Problem |
|---|---|---|---|
| `svelte-motion` | `^0.4.0` | `0.12.2` | `0.4.x` peer-depends on Svelte 3 only |
| `@dnd-kit/svelte` | `^0.1.0` | `0.2.3+` | `0.1.0` does not exist |
| `@sveltejs/vite-plugin-svelte` | `^4.0.0` | `7.3.0` | Conflicts with `@sveltejs/kit@2.70.x` peer |
| `@monaco-editor/svelte` | `^1.1.0` | — | **Package does not exist on npm** |

**ui-ux-pro-max stack rule:** never assume a stack/package exists; verify before importing. Violated here.

**Fix:** bump versions and replace Monaco wrapper with `monaco-editor` + `@codingame/monaco-vscode-api` or `svelte-monaco`.

### 1.2 No SvelteKit routes

No `src/routes/`, no `+layout.svelte`, no `+page.svelte`. Per SvelteKit rules, the app cannot render.

### 1.3 `package.json` has no `engines` field

No Node version lock. The rest of the repo uses Python tooling; the frontend needs the same discipline.

---

## 2. Token Architecture (design-system)

### 2.1 Token layering is incomplete

Current tokens are a flat single layer (primitive-ish only). Missing:
- Semantic aliases: `--surface-base`, `--surface-elevated`, `--border-subtle`
- Component tokens: `--window-bg`, `--window-border`, `--dock-bg`
- No `--radius-*` scale
- No `--space-*` scale
- No `--duration-*` / `--ease-*` motion tokens

**design-system rule:** use three-layer tokens (primitive → semantic → component). Current file mixes all three informally.

### 2.2 Hardcoded values in components

31 raw hex values and 9 raw `rgb/rgba` calls exist across the skeleton. Every color should reference a token.

Examples:
- `Window.svelte:27` `background: var(--abyss-1, #0a0a0c)` — inline fallback hex
- `Window.svelte:32` `border-color: var(--violet, #452a84)` — inline fallback hex
- `Dock.svelte:99-101` raw `rgba(69, 42, 132, 0.15)` and `rgba(169, 177, 240, 0.25)`

---

## 3. Color & Material

### 3.1 Glass tokens fail the "luminous" test

```css
--glass-1: rgba(5, 5, 7, 0.45);
--glass-2: rgba(5, 5, 7, 0.55);
--glass-3: rgba(5, 5, 7, 0.65);
--glass-4: rgba(5, 5, 7, 0.72);
```

**impeccable + taste-skill:** glass must refract light, not darken it. The background is already `--abyss #050507`; a black tint can only make things darker and flatter.

**Fix (liquid-glass v2):**
```css
--glass-1: rgba(69, 42, 132, 0.18);    /* 32-40px blur, violet veil */
--glass-2: rgba(169, 177, 240, 0.12); /* 24-28px blur, lavender veil */
--glass-3: rgba(254, 111, 105, 0.08); /* 16-20px blur, coral hint */
--glass-4: rgba(245, 242, 236, 0.06); /* 12px blur, cream hint */
```

Always pair with `backdrop-filter: blur(Npx) saturate(1.4) contrast(1.05)` and a `::before` edge highlight using `mask-composite`.

### 3.2 No edge refraction on any component

`Window`, `Dock`, and (implicitly) future panels hand-roll glass but omit the layered inner/outer border + highlight gradient that sells the material. **taste-skill soft-skill rule:** glass is an accent with physical edge detail.

### 3.3 No brand atmosphere layers

Missing:
- Fixed `GrainOverlay` (`feTurbulence`, `pointer-events-none`)
- Noise/dither panels
- Liquid-metal sheen on the NIL N monogram
- Scanlines (only inside terminal surfaces, not global)

**hallmark R-10:** glass is an ACCENT only, not the character of the entire UI. Current code puts glass on the Dock, Window, and titlebar without a grounded utility layer.

---

## 4. Typography (tastecheck-web-typography)

### 4.1 Body locked to 14px

```css
body { font-size: 14px; line-height: 1.5; }
```

**web-typography rule:** use user-relative units (`rem`) and a role-based type scale. 14px equals ~0.875rem. A user who bumps base font size will get inconsistent scaling.

**Fix:**
```css
html { font-size: 100%; }
body { font-size: var(--step-0); line-height: 1.3; }
```

### 4.2 No type scale

Need a locked scale using `rem`:
- `--step--2`: 11px fine print
- `--step--1`: 12px labels
- `--step-0`: 14px / 0.875rem body
- `--step-1`: 16px emphasized
- `--step-2`: 20px section
- `--step-3`: 24px title

### 4.3 Line-height too loose for workstation density

`1.5` is fine for reading prose. For a cockpit UI with 28px rows, use `1.3`. Prose areas can override to `1.55`.

### 4.4 Measure not constrained

No `max-width` on text containers. Terminal output can be full-width, but prose/inspector notes need `max-width: 66ch`.

---

## 5. Spacing & Density (tastecheck-spacing-system)

### 5.1 No spacing ladder

Current code uses arbitrary values: `0.25rem`, `0.5rem`, `0.75rem`, `1rem`, `1.5rem`, `2.25rem`. There is no `--space-*` system.

**spacing-system rule:** publish one 4px ladder and map attachment/control/task/group/region/chapter relationships to it.

**Fix:**
```css
--space-1: 0.25rem;  /*  4px attachment */
--space-2: 0.5rem;   /*  8px control */
--space-3: 0.75rem;  /* 12px tight pairs */
--space-4: 1rem;     /* 16px task */
--space-5: 1.5rem;   /* 24px group */
--space-6: 2rem;     /* 32px region */
--space-section: clamp(3rem, 2rem + 4vw, 6rem);
```

### 5.2 Window padding too generous

```css
.content { padding: 1.5rem; }
```

For a 28px-row workstation, content padding should be `--space-3` (12px) or `--space-4` (16px) max.

### 5.3 Titlebar height hardcoded in rem

```css
height: 2.5rem;
```

Should be `--titlebar-h: 40px` token, or better `--space-10` mapped to 40px.

---

## 6. Motion (tastecheck-micro-motion + Hallmark)

### 6.1 `BorderBeam` uses `linear` infinite

```css
animation: border-beam-spin var(--beam-duration) linear infinite;
```

**hallmark R-19:** animations must have a clear UX purpose. An infinite decorative border beam is a generic AI tell.  
**micro-motion rule:** linear is for purposeful continuous loops only; ease by direction otherwise.  
**NIL rule:** spring physics only.

**Fix:** tie BorderBeam to the 4-state thinking logo system (idle → thinking → streaming → done), use `--spring-smooth`, and do not loop infinitely in the idle state.

### 6.2 `transition: all` in CSS

`app.css:77` and `:95` use `transition: all` for focus/selection. **Vercel Web Interface Guidelines:** never `transition: all` — list properties explicitly.

### 6.3 Reduced-motion global kill is too blunt

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

**micro-motion rule:** design reduced motion as an *equivalent state*, not just zero-duration everything. This approach removes useful transitions entirely. Prefer component-level reduced variants.

---

## 7. Components

### 7.1 Dock (design-taste-frontend + Hallmark)

Problems:
- **Icon family:** uses `lucide-svelte` — taste-skill explicitly discourages Lucide as default; prefer Phosphor, HugeIcons, or Tabler.
- **Hover architecture:** `hoveredIndex = i` triggers Svelte re-render for every item on every mousemove crossing. **ui-ux-pro-max rule:** avoid layout thrashing and unnecessary effects. Use CSS `:hover` + sibling transforms, or `svelte-motion` values outside the render cycle.
- **Magnification curve:** single-item `scale(1.25)` is not macOS Dock behavior. Real Dock scales neighbors via a continuous curve.
- **Glass surface:** no edge refraction.
- **Positioning:** fixed bottom-center with `translateX(-50%)` — acceptable on desktop but needs safe-area handling on mobile.

**hallmark anti-patterns hit:** generic AI icons (Lucide is the LLM default), no real purpose for the active dot animation.

### 7.2 Window

Problems:
- Hardcoded `border-radius: 0.75rem` — should use `--radius-window`.
- Titlebar `backdrop-filter` with no inner border highlight.
- No window variant system (panel / dialog / inspector).
- No close/minimize actions (acceptable since no traffic lights, but action slots should exist).
- Content padding 1.5rem violates 28px-row density.

### 7.3 ThinkingOrbs

Problems:
- Generic three-dot pulse — the classic Slack/ChatGPT loader. **hallmark R-22:** forbidden generic AI icons/animations.
- `box-shadow: 0 0 8px ...` is a neon glow default.
- No connection to the NIL N monogram or the 4-state thinking logo system.

**Fix:** create `ThinkingLogo.svelte` with states: idle (static violet N), thinking (N notches breathe + orbits), streaming (orbs converge + border beam), done (cream N soft pulse).

---

## 8. Accessibility (Vercel Web Interface Guidelines + Hallmark R-25)

| Check | Status | Evidence |
|---|---|---|
| Focus visible | Partial | `:focus-visible` exists but `outline: 2px solid` only; add 1px offset for high contrast. |
| `prefers-reduced-motion` | Yes | global kill present (too blunt). |
| `prefers-reduced-transparency` | No | glass has no solid fallback. |
| Color contrast | Unknown | no computed contrast checks provided. Need to verify `--text-dim #9a9a94` on `--abyss-1 #0a0a0c` passes 4.5:1. |
| Semantic HTML | Unknown | no routes exist to inspect. |
| Keyboard nav | Unknown | no interactive routes exist. |
| `aria-label` | Unknown | icon-only Dock items are likely missing labels. |

### 8.1 Dock items are icon-only without `aria-label`

```svelte
<span class="icon"><item.icon /></span>
```

**Vercel guideline:** icon-only buttons need `aria-label`. Current code has no accessible label on the link.

### 8.2 `html class="dark"` is hardcoded

No theme toggle, no `prefers-color-scheme` fallback, no `color-scheme: dark` on `<html>` (which fixes native inputs/scrollbars).

---

## 9. IA / Workstation Layout (impeccable + user memory)

Current state: **no layout exists.**

Required shell from memory + DESIGN.md:
- Left sidebar: targets/engagements tree
- Center: terminal hero (Claude-style agent conversation as workspace, NOT chat-first)
- Right sidebar: inspector / findings / timeline
- Bottom: AI strip, **collapsed by default**, `Cmd+J`
- Bottom status bar: 26px, safety/approval + model status
- Command palette: `Cmd+K`

Missing components:
- `Sidebar.svelte`
- `RightSidebar.svelte`
- `Terminal.svelte`
- `AiStrip.svelte` (4 states)
- `StatusBar.svelte`
- `CommandPalette.svelte`
- `EmptyState.svelte`
- `ThinkingLogo.svelte`

**impeccable command:** this needs `structure` first, then `polish`.

---

## 10. Responsive Layout (tastecheck-responsive-layout)

No responsive strategy exists because there are no routes. But early decisions are already wrong:
- `Dock` is fixed bottom-center — will conflict with mobile safe areas.
- `Window` uses fixed `0.75rem` radius and `2.5rem` titlebar — may not survive narrow containers.
- No container queries for reusable panels.
- No `min-width: 0` on flex children.

**responsive-layout rule:** start mobile-first and use intrinsic sizing; add breakpoints only where content breaks.

---

## 11. Content / Copy (Hallmark)

- No fabricated metrics possible yet (good).
- No CTAs to evaluate.
- No testimonials/logos.
- Component labels are generic: "Untitled" window title.

---

## 12. Anti-pattern Inventory (Hallmark Slop Test)

| Anti-pattern | Found? | Where |
|---|---|---|
| Generic blue/purple gradients | No | — |
| Excessive glassmorphism | Yes | Dock, Window titlebar, no utility layer |
| Pill-everything | No | — |
| Glow everywhere | Yes | ThinkingOrbs box-shadow |
| Background grids | No | — |
| Template fade-up animations | No | — |
| "How It Works" 3 steps | N/A | — |
| "Trusted By" logo bar | N/A | — |
| 4-column footer | N/A | — |
| em dash (—) | No | — |
| Generic CTAs | N/A | — |
| AI buzzwords | N/A | — |
| Sparkle/star/magic icons | No | — |
| Generic 3-dot loader | Yes | ThinkingOrbs |
| Fake terminal chrome | Partial | Window titlebar is real, but no fake browser chrome |
| Re-drawn browser/phone frames | No | — |
| Poor contrast | Unknown | needs verification |

---

## 13. Recommended Fix Order

### Phase A — Make it build (highest priority)
1. Fix `package.json` versions.
2. Replace `@monaco-editor/svelte` with a real Monaco integration.
3. Add `src/routes/+layout.svelte` and `src/routes/+page.svelte`.
4. Verify `npm install`, `npm run check`, and `npm run build` all pass.

### Phase B — Lock design-system tokens
5. Add three-layer token architecture (primitive/semantic/component).
6. Add `--space-*`, `--radius-*`, `--duration-*`, `--ease-*` scales.
7. Rewrite glass tokens to use tinted translucent colors.
8. Add `.glass-1` … `.glass-4` utility classes with edge refraction.
9. Add `GrainOverlay`, global noise, and liquid-metal sheen utilities.
10. Replace global reduced-motion kill with component-level reduced variants.

### Phase C — Rebuild components
11. `Dock`: Phosphor icons, CSS-based neighbor magnification, edge refraction.
12. `Window`: variants, tokenized radii/padding, glass utility.
13. `ThinkingLogo`: 4-state machine tied to AI strip.
14. `BorderBeam`: state-driven, spring physics, not infinite.

### Phase D — Build workstation shell
15. `Sidebar`, `RightSidebar`, `Terminal`, `AiStrip`, `StatusBar`.
16. `CommandPalette` with keyboard shortcuts.
17. `EmptyState` / new-engagement flow.

### Phase E — Accessibility + responsive pass
18. Add `aria-label` to icon-only Dock items.
19. Add `color-scheme: dark`, theme toggle, `prefers-reduced-transparency`.
20. Verify contrast, keyboard nav, mobile 320/375/414/768.

---

## 14. Pre-flight Checklist for Next Emit

Before any NIL UI screen can be called "done":
- [ ] `npm run build` passes with zero warnings.
- [ ] `npm run check` passes (`svelte-check`).
- [ ] No `lucide-svelte` in new components (unless explicitly approved).
- [ ] No raw hex/rgba in components; all colors via tokens.
- [ ] No `transition: all`; properties listed explicitly.
- [ ] No `linear` easing; motion uses spring curves.
- [ ] Glass surfaces use `.glass-*` utilities with edge refraction.
- [ ] `prefers-reduced-motion` and `prefers-reduced-transparency` handled per component.
- [ ] Icon-only controls have `aria-label`.
- [ ] 44px tap targets on mobile.
- [ ] No horizontal overflow at 320/375/414/768px.
- [ ] Terminal-first layout: left tree, center terminal, right inspector, bottom AI strip collapsed by default.
- [ ] Thinking logo reflects the 4-state machine.
- [ ] No traffic lights, no fake browser chrome.
- [ ] 28px sidebar rows, 26px status bar.

---

## 15. One-line Direction

> NIL should feel like a native macOS coding workspace built from violet-tinted glass, liquid-metal accents, and spring physics — a terminal-first IDE for an AI agent, not a chat app in a dark theme.

Current skeleton does not yet deliver that. Phase A + B are required before any further visual polish.

---

**Next action:** fix `package.json`, install dependencies, create the route shell, and lock the token system.
