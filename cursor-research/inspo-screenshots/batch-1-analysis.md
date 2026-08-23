# Batch 1 Inspiration Analysis: Scored for AAA Dark Terminal macOS-Native App

## Scoring Criteria
- **Dark Mode Quality** (0-10): Depth, richness, contrast, absence of gray mush
- **Typography** (0-10): Hierarchy, mono vs sans pairing, legibility at small sizes
- **Spacing & Density** (0-10): Whitespace discipline, information density without clutter
- **macOS Native Feel** (0-10): Traffic lights, sheets, sidebars, spring physics, HIG alignment
- **Terminal Patterns** (0-10): Block-based output, command/input distinction, PTY aesthetics
- **Overall AAA Polish** (0-10): Cohesion, material honesty, anti-slop adherence

---

## 1. Linear (linear.app.png)

| Criterion | Score | Notes |
|-----------|-------|-------|
| Dark Mode Quality | 10 | Deep abyss blacks (#050507 territory), subtle elevation layers, no gray mush. Violet/indigo accent feels premium. |
| Typography | 9 | Excellent sans/mono hierarchy. Inter-like sans for UI, clean mono for code/metadata. Small sizes remain crisp. |
| Spacing & Density | 9 | Dense but calm. 28px sidebar rows, generous padding in cards. Information-rich without noise. |
| macOS Native Feel | 8 | Sidebar with pill selection, structured lists, modal sheets. Not literally native chrome but feels like a Mac tool. |
| Terminal Patterns | 4 | Activity feeds and structured cards are close to terminal blocks, but it's an issue tracker—not a terminal. |
| Overall AAA Polish | 9 | Cohesive, disciplined, premium. The gold standard for dark productivity apps. |

**What to Steal:**
- Sidebar density model (28px rows, pill active states)
- Structured card layout with meta headers (name + model/tag)
- Deep abyss background with subtle elevation layers
- Thread lines / accent connectors between related items

**Caveats:** No actual terminal chrome. Activity feed ≠ terminal output blocks.

---

## 2. Cursor (cursor.com.png)

| Criterion | Score | Notes |
|-----------|-------|-------|
| Dark Mode Quality | 7 | Dark sidebar is solid, but the marketing page shows light-themed app chrome. Editor is neutral dark. |
| Typography | 8 | Good mono for code, sans for UI. The AI output cards use clean sans with inline code styling. |
| Spacing & Density | 8 | Three-pane layout (sidebar → content → preview) is well-proportioned. Task list has good density. |
| macOS Native Feel | 6 | Traffic light dots visible in mockup, but overall feel is more web/Electron than native Mac. |
| Terminal Patterns | 7 | File tree + code blocks + AI output cards = close to terminal+AI hybrid. Shows structured output well. |
| Overall AAA Polish | 7 | Polished but reads as "modern IDE" more than "native Mac tool." Some web-app tells (rounded pills, gradients). |

**What to Steal:**
- AI output as structured cards with file references (+52/-0 badges)
- Task list with status icons and elapsed time
- Three-pane workspace layout
- Inline code blocks with language context

**Caveats:** Light marketing chrome clashes with dark app. Some AI-web-app tells (pills, soft gradients).

---

## 3. Raycast (raycast.com.png)

| Criterion | Score | Notes |
|-----------|-------|-------|
| Dark Mode Quality | 8 | Hero has dramatic red/pink gradients (risky), but the actual app UI screenshots show clean dark surfaces. |
| Typography | 8 | Excellent command palette typography. Large search field, clear shortcut hints (⌘K), crisp row text. |
| Spacing & Density | 9 | Command palette density is perfect—tight rows, clear sections, no waste. Footer hint bar is a nice touch. |
| macOS Native Feel | 10 | This IS a native Mac app. Menu bar integration, ⌘K global hotkey, native-feeling sheets. The reference for "Mac tool." |
| Terminal Patterns | 6 | Command palette is terminal-adjacent (text input → structured output), but no actual PTY or shell visuals. |
| Overall AAA Polish | 9 | Extremely cohesive. Every pixel feels intentional. Extension cards, keyboard shortcuts, search—all dialed. |

**What to Steal:**
- Command palette layout: search icon → command list → shortcut hints
- Footer hint bar with action shortcuts
- Extension card grid with icon + description + tag
- Keyboard-first navigation model
- "Your shortcut to everything" positioning

**Caveats:** Hero gradient is loud and un-terminal-like. The actual app UI is darker and more restrained than marketing.

---

## 4. Warp (warp.dev.png)

| Criterion | Score | Notes |
|-----------|-------|-------|
| Dark Mode Quality | 6 | Marketing page is light-themed. Terminal app screenshots show clean light/gray UI—not deep dark. |
| Typography | 8 | Terminal blocks use excellent mono typography. Input/output distinction is clear. |
| Spacing & Density | 8 | Block-based terminal output is well-spaced. Each command block is separated cleanly. |
| macOS Native Feel | 7 | Native-feeling terminal chrome, but the "factory" dashboard feels web-app-ish. |
| Terminal Patterns | 10 | This is literally a modern terminal. Block-based I/O, command history, agent output blocks—directly applicable. |
| Overall AAA Polish | 8 | Terminal UI is polished. The platform/dashboard side is less cohesive with the terminal aesthetic. |

**What to Steal:**
- Block-based terminal output (input → output as discrete cards)
- Agent output blocks with approve/run/reject states
- Cost metrics inline ($26.25 per PR) inside terminal context
- Command palette integration within terminal

**Caveats:** Marketing page is light. The terminal UI shown is more "light modern" than "dark abyss." Need to translate to deep dark.

---

## 5. Arc (arc.net.png)

| Criterion | Score | Notes |
|-----------|-------|-------|
| Dark Mode Quality | 5 | Colorful purple/blue gradients, light sections. Not a dark app—it's a colorful browser. |
| Typography | 7 | Good typography in UI chrome, but marketing page is all over the place stylistically. |
| Spacing & Density | 7 | Sidebar tabs are dense and interesting. Split view layout is well-proportioned. |
| macOS Native Feel | 7 | Sidebar-as-tabs is innovative Mac-like behavior. Spaces model is native-feeling. |
| Terminal Patterns | 2 | Browser, not terminal. No applicable PTY patterns. |
| Overall AAA Polish | 6 | Polished as a browser, but not relevant to terminal app goals. Too colorful/consumer. |

**What to Steal:**
- Sidebar-as-primary-navigation model (tabs live in sidebar)
- Spaces for organizing contexts
- Split view with resizable panes
- Clean toolbar-less content area

**Caveats:** Too colorful and consumer-facing. Not a dark terminal reference. Skip for terminal-specific patterns.

---

## 6. Claude.ai (claude.ai.png)

| Criterion | Score | Notes |
|-----------|-------|-------|
| Dark Mode Quality | N/A | Screenshot is a Cloudflare security verification page. Zero design content. |
| Typography | N/A | None. |
| Spacing & Density | N/A | None. |
| macOS Native Feel | N/A | None. |
| Terminal Patterns | N/A | None. |
| Overall AAA Polish | 0 | This screenshot is useless for analysis. Replace with Claude Desktop app screenshot. |

**Verdict:** Remove from consideration. Replace with actual Claude Desktop app dark mode screenshot.

---

## 7. 21st.dev (21st.dev.png)

| Criterion | Score | Notes |
|-----------|-------|-------|
| Dark Mode Quality | 8 | Deep navy/abyss backgrounds. Component previews pop. Good dark mode execution. |
| Typography | 7 | Mixed—some components use elegant type, some are generic. Italic serif accents feel trendy. |
| Spacing & Density | 7 | Component grid is well-spaced. Code preview panels are dense but readable. |
| macOS Native Feel | 4 | Web marketplace, not a native app. Individual components may translate to native feel. |
| Terminal Patterns | 5 | Code blocks, copy-paste UI, component cards—useful patterns but not terminal-specific. |
| Overall AAA Polish | 7 | Good as a component reference library. Useful for stealing individual patterns, not holistic IA. |

**What to Steal:**
- Component card grid with preview + code + copy action
- "Paste it anywhere" workflow (copy prompt → get component)
- Dark theme code blocks with syntax highlighting
- Shimmer button / animated CTA patterns
- Author attribution pattern (built by real design engineers)

**Caveats:** Web marketplace, not native Mac app. Many components are trendy/overdesigned. Filter for restraint.

---

## Ranked Shortlist (Best → Worst for Terminal App)

| Rank | App | Terminal Relevance | macOS Native | Dark Quality | Overall |
|------|-----|-------------------|--------------|--------------|---------|
| 1 | **Warp** | ⭐⭐⭐ Direct reference | 7/10 | 6/10 | **9/10** |
| 2 | **Raycast** | ⭐⭐ Palette + density model | 10/10 | 8/10 | **9/10** |
| 3 | **Linear** | ⭐⭐ Structured output cards | 8/10 | 10/10 | **9/10** |
| 4 | **Cursor** | ⭐⭐ AI output blocks | 6/10 | 7/10 | **7/10** |
| 5 | **21st.dev** | ⭐ Component patterns only | 4/10 | 8/10 | **7/10** |
| 6 | **Arc** | ❌ Wrong category | 7/10 | 5/10 | **6/10** |
| 7 | **Claude.ai** | ❌ Screenshot is broken | N/A | N/A | **0/10** |

---

## Recommended Actions

1. **Replace Claude.ai screenshot** with actual Claude Desktop app in dark mode (the native app, not web).
2. **Double down on Warp + Raycast** as primary references—Warp for terminal block patterns, Raycast for macOS-native command palette and keyboard UX.
3. **Steal Linear's dark palette and density model** for the app's base layer (sidebar, lists, structured cards).
4. **Use 21st.dev for tactical components only** (buttons, code blocks, copy interactions)—not for overall IA.
5. **Drop Arc** from terminal-focused consideration unless building a browser-like space model.
