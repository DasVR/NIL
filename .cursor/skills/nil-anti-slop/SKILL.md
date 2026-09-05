---
name: nil-anti-slop
description: Anti-slop rules from hallmark + bookmarks research. Non-negotiable guardrails for every UI change.
---

# NIL Anti-Slop Rules — Non-Negotiable

> From `hallmark`, `impeccable`, `taste-skill`, and 2,363 Twitter bookmarks. These are the patterns that make AI designs look cheap, and the rules that prevent them.

---

## Visual Anti-Patterns (FORBIDDEN)

| ❌ FORBIDDEN | ✅ REQUIRED |
|-------------|-------------|
| Box shadows on idle cards/buttons | `--lift-*` (inset highlight + long soft shadow) + hairline `--nil-line` only |
| Generic gradients (blue-purple, cyan-magenta) | Greyscale chrome; `--sev-*` for risk |
| Decorative drop-shadows | `--lift-*` on floating panels, never per-card grey blobs |
| Brand accent / colored primary button in Zone B/C | Ink-derived chrome. Color means risk. `--brand-ember-*` is Zone A identity only (cold open, lock, handoff, report cover). |
| Fake terminal chrome ($ prompts, green-tinted blocks) | Real PTY only, structured cards |
| Chat bubbles for tool output | Structured blocks (plan/tool/diff/finding/artifact) |
| Rounded chat bubbles with avatars | Clean cards, subtle meta headers |
| Emoji in product UI | Text labels, lucide icons only |
| Generic "sparkle/magic/star/lightning/diamond/orb/robot" icons | Specific semantic icons |
| Linear easing (ease, ease-in-out) | Named durations in `motion.css` (`--ease-out`, `--ease-spring`) |
| 44px touch targets | 28px rows, Linear/Cursor density |
| "Message AI..." / "Ask anything..." hero copy | Stream-first: left=targets, center=stream, right=inspector |
| Permanent large chat area as default | Agent stream is the center; composer at the bottom |
| Glass on every surface | Max 2 glass elements visible at once (Zone C: backdrop-filter only on top-layer) |
| Second WebGL context | Zone A cold open (torn down) then one Zone B context |
| CSS traffic lights (red/yellow/green dots) | Native macOS only via `titleBarStyle: overlay` |
| Two settings surfaces | One settings sheet, left sidebar categories |
| Blue focus rings | 2px `--nil-halo` ring, 2px offset |
| Findings duplicated in two sidebars | Single source of truth |
| Navigating to new page to run plugin | Inline plugin run in sidebar/palette |
| Fake metrics, placeholder counts, lorem | Real data only. Never invent CVSS. |
| New hex values in components | Locked tokens from `tokens.css` only |
| Italic headings | Upright only |
| All-caps body text | Micro labels only (`--t-micro`, `--track-tick`) |
| Colored spinner | SCANLINE |

---

## Layout Anti-Patterns

| ❌ FORBIDDEN | ✅ REQUIRED |
|-------------|-------------|
| Margin stacks for hierarchy | `gap` in flex/grid, 1px borders + 4-8px gaps |
| Arbitrary spacing | Density system: 6/8/12/16/24/32px scale |
| Breakpoint-based responsive | Container queries + fluid clamp |
| Fixed widths | Flexible with min/max constraints |
| Overlapping z-index chaos | Z-scale: base/dropdown/sticky/modal/toast/tooltip/cursor |

---

## Component Anti-Patterns

| ❌ FORBIDDEN | ✅ REQUIRED |
|-------------|-------------|
| Cards inside cards inside cards | Flat hierarchy, one card level |
| Tiny compressed boards | Large, readable section-specific images |
| Lazy under-generation | Complete component specs |
| Hero clutter | Clean, spacious, readable on small laptop |
| Cards as layout wrapper | Semantic HTML + CSS Grid/Flex |
| Icon-only buttons without labels | Icon + label, or tooltip on hover |

---

## Motion Anti-Patterns

| ❌ FORBIDDEN | ✅ REQUIRED |
|-------------|-------------|
| Animation without reduced-motion fallback | Dual fallback: OS + in-app |
| Layout-triggering animations (width/height/margin) | Transform/opacity only |
| Infinite loops without purpose | Purposeful: feedback, state, attention |
| >400ms for micro-interactions | Snappy: 100-150ms |
| Animations that hide information | Reduced motion = instant, info preserved |

---

## Accessibility Anti-Patterns

| ❌ FORBIDDEN | ✅ REQUIRED |
|-------------|-------------|
| Focus visible only on tab | Focus visible always (BorderBeam) |
| Keyboard traps | `Esc` peels one layer, focus trapped in modals |
| Color-only state | Color + icon + text |
| <4.5:1 contrast | WCAG AA on all surfaces |
| No `prefers-reduced-motion` | Tested on every PR |
| Text in images | Real text always |

---

## The "One Attention Object" Rule

At any moment, the user should have **exactly one** thing demanding attention:

- Pending approval block (BorderBeam)
- OR live agent run (spinner + cancel)
- OR critical finding (glow)
- **Never two at once**

---

## Verification Checklist (run on every PR)

```bash
# 1. Token audit — no inline hex
grep -r "#[0-9a-fA-F]\{3,8\}" frontend/src --include="*.svelte" --include="*.css" | grep -v "app.css"

# 2. Shadow audit
grep -r "box-shadow" frontend/src --include="*.svelte" --include="*.css" | grep -v "app.css"

# 3. Easing audit
grep -r "ease\|linear\|cubic-bezier" frontend/src --include="*.svelte" --include="*.css" | grep -v "spring\|app.css"

# 4. Emoji audit
grep -r "[\u{1F300}-\u{1FAFF}]" frontend/src --include="*.svelte" --include="*.ts"

# 5. Chat bubble audit
grep -r "chat-bubble\|avatar\|message.*bubble" frontend/src --include="*.svelte"

# 6. Reduced motion test
# Open in browser, enable "Reduce Motion" in OS, verify all animations stop

# 7. Contrast audit
# Use Chrome DevTools → Elements → Accessibility → Contrast

# 8. Build + typecheck
cd frontend && npm run check && npm run build
```

---

## Hallmark Commands (for agents)

When an agent builds UI, it should self-audit:

```
polish      — refine visual quality, align to tokens
bolder      — increase contrast, weight, clarity
animate     — add purposeful spring motion
quieter     — remove decorative noise
critique    — self-review against anti-slop rules
audit       — full hallmark audit
verify      — run verification checklist
```