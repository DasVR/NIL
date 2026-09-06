---
name: nil-reference-workflow
description: Pengsonal reference-first methodology — give agents good references, let them build like Lego. Curated galleries, MCP servers, workflow.
---

# NIL Reference-First Workflow (Pengsonal Method)

> "I'm not a designer, so instead of asking AI to invent the whole UI, I give it good references and let it build with them like Lego."

---

## The Workflow

```
1. DEFINE the component/feature needed
2. GATHER references from curated sources (below)
3. GIVE references to agent with clear constraints
4. AGENT inspects, picks, adapts
5. VERIFY against tokens + anti-slop rules
6. ITERATE with specific feedback
```

**Never:** "Design a settings page"
**Always:** "Build a settings sheet using Linear's sidebar density, Raycast's category layout, and our `--nil-*` surface tokens. Reference: linear.app/settings, raycast.com/settings"

---

## Reference Resources (give these to agents)

### Design Galleries (browse → screenshot → give to agent)

| Site | Best For | How to Use |
|------|----------|------------|
| `beautifului.dev` | Overall beautiful UI | Browse, screenshot components |
| `beui.dev` | Component patterns | Search specific component types |
| `rareui.com` | Unique/rare patterns | Find novel interactions |
| `transitions.dev` | Motion references | Copy spring curves, timing |
| `ui.shadcn.com` | shadcn/ui official | Component API + styling |
| `ui-skills.com` | Skill-based components | See how skills structure UI |
| `coss.com/ui` | Component gallery | Filter by framework |
| `designsystemchecklist.com` | Design system audit | Check completeness |
| `reui.io/components` | React components | Translate to Svelte |
| `emilkowal.ski/ui/you-dont-need-javascript` | CSS-only patterns | Reduce JS, use CSS |

### MCP-Enabled Reference Servers (agents query directly)

| Server | Purpose | Query Example |
|--------|---------|---------------|
| `mobbin.com/mcp` | Mobile patterns | "Show me iOS settings sheet patterns" |
| `canvasui.dev` | Design canvas | "Generate component variations" |
| `60fps.design/mcp` | Motion patterns | "Show spring physics for panel expand" |
| `recent.design` | Latest designs | "Dark terminal UI 2026" |
| `collectui.com` | Curated UI | "Command palette designs" |

### Direct Inspo Sites (Tier 1 — steal heavily)

| Site | Score | Steal |
|------|-------|-------|
| `raycast.com` | 9/10 | Command palette, footer hints, keyboard-first, extension cards |
| `linear.app` | 9/10 | 28px rows, structured cards, abyss palette, spring feel |
| `warp.dev` | 9/10 | Block terminal output, agent blocks, cost metrics |
| `brittanychiang.com` | 8.5/10 | Sticky sidebar, timeline, two-column layout |
| `ghostty.org` | 8/10 | Clean terminal design, theme system |
| `21st.dev` | 7/10 | 12k+ components: shaders, glass, chat UI (React → Svelte) |
| `jakubantalik.com` | 7/10 | Border Beam, Thinking Orbs, Liquid Metal |
| `pryzm.design` | 7/10 | Pure black + glass, bold type |

---

## How to Prompt Agents (Template)

```markdown
## Task
Build [component/feature] for NIL workspace.

## References (inspect these)
- [URL 1] — [what to steal]
- [URL 2] — [what to steal]
- MCP: `mobbin.com/mcp` — query "[specific pattern]"

## Constraints (NON-NEGOTIABLE)
- Tokens: ONLY from `frontend/src/app.css` (see nil-design-system skill)
- Density: 28px rows, 6px v / 8px h padding
- Glass: Max 2 visible, edge refraction via ::before
- Motion: Spring curves only, reduced-motion mandatory
- Fonts: Inter (human), JetBrains Mono (machine)
- No box shadows, no fake terminal chrome, no chat bubbles
- Build on bits-ui primitives

## Anti-Slop Check
Run hallmark audit before finishing:
- No inline hex
- No box-shadow
- No linear easing
- No emoji
- Focus visible always
- WCAG AA contrast

## Verification
- npm run check && npm run build
- Test at 320px, 375px, 414px, 768px
- Enable Reduce Motion in OS, verify
```

---

## Agent Instructions (paste into Cursor prompt)

```
You are building for NIL, an open-source AI coding agent workspace.
Design DNA: macOS-native, terminal-first, dark abyss (--nil-void), color means risk
(severity is the only saturated color in the workstation; --brand-ember-* is reserved
for Zone A identity moments only — cold open, lock screen, session handoff, report
cover), JetBrains Mono + Inter, the ten motion primitives in motion.css, zero AI slop.

ALWAYS:
1. Reference the nil-design-system skill for tokens
2. Reference the nil-anti-slop skill for guardrails
3. Reference the nil-components skill for component specs
4. Use bits-ui primitives, NOT custom HTML
5. Write CSS with custom properties ONLY
6. Test reduced-motion on every animation

NEVER:
- Invent UI from scratch without references
- Use inline colors, spacing, or easing
- Add decorative shadows or gradients
- Create chat bubbles or fake terminal chrome
- Use 44px touch targets
- Skip reduced-motion fallbacks
```

---

## Verification Commands

```bash
# Token audit
grep -r "#[0-9a-fA-F]\{3,8\}" frontend/src --include="*.svelte" --include="*.css" | grep -v "app.css"

# Shadow audit
grep -r "box-shadow" frontend/src --include="*.svelte" --include="*.css" | grep -v "app.css"

# Easing audit
grep -r "ease\|linear\|cubic-bezier" frontend/src --include="*.svelte" --include="*.css" | grep -v "spring\|app.css"

# Emoji audit
grep -rP "[\x{1F300}-\x{1FAFF}]" frontend/src --include="*.svelte" --include="*.ts"

# Build verification
cd frontend && npm run check && npm run build
```