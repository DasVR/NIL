# UI/UX Inspiration Review — Scored & Curated for AAA Dark Terminal macOS-Native App

**Generated:** 2026-08-23  
**Project:** Finn Pentest Harness / God Mode AI App  
**Stack:** SvelteKit 5 + Tauri + Tailwind CSS v4  
**Vibe Target:** macOS-native, dark terminal, liquid glass, dithering, spring physics, buttery 60fps

---

## 🎯 How to Use This Doc

This is a **curated inspo scoreboard**. Each site was captured as a screenshot, analyzed, and scored against our design goals. Use it to:
- **Approve/reject directions** — tell me which sites to study deeper
- **Steal specific patterns** — each entry lists "Steal This" and "Avoid This"
- **Set quality bar** — scores show what AAA looks like vs generic AI slop

**Your review workflow:** look at the ranked shortlist, tell me "steal from X, Y, Z" or "show me more like ___".

Screenshots live at: `cursor-research/inspo-screenshots/<site>.png`

---

## 🏆 Top 10 Shortlist (Best → Good)

| Rank | Site | Why It Ranks | Overall | Screenshot |
|------|------|--------------|---------|------------|
| 1 | **Raycast** | Native Mac command palette king — keyboard-first, density, ⌘K | 9/10 | `raycast.com.png` |
| 2 | **Linear** | Dark abyss palette, structured cards, sidebar density, spring feel | 9/10 | `linear.app.png` |
| 3 | **Warp** | Terminal-as-product with block-based I/O + agent blocks | 9/10 | `warp.dev.png` |
| 4 | **Brittany Chiang** | Dark navy, sticky sidebar, timeline logs, green tags | 8.5/10 | `brittanychiang.com.png` |
| 5 | **21st.dev** | Component goldmine — shaders, backgrounds, chat UI, glass cards | 7/10 | `21st.dev.png` |
| 6 | **Cursor** | AI output cards, file refs, task lists, 3-pane workspace | 7/10 | `cursor.com.png` |
| 7 | **Pryzm** | Pure black + glassmorphism, bold type, dramatic dark | 7/10 | `pryzm.design.png` |
| 8 | **Unicorn Studio** | Dark SaaS with glow effects, code blocks, feature grids | 6/10 | `unicorn.studio.png` |
| 9 | **HackerAI.sh** | Green-on-black install block with tabbed package managers | 4/10 | `hackerai.sh.png` |
| 10 | **Bolt.new** | Bold composer shape + template chips (ditch the blue gradient) | 5/10 | `bolt.new.png` |

---

## 📊 Detailed Reviews

### Batch 1 — Dev Tools & Native Mac Apps

1|
2|
3|## Scoring Criteria
4|- **Dark Mode Quality** (0-10): Depth, richness, contrast, absence of gray mush
5|- **Typography** (0-10): Hierarchy, mono vs sans pairing, legibility at small sizes
6|- **Spacing & Density** (0-10): Whitespace discipline, information density without clutter
7|- **macOS Native Feel** (0-10): Traffic lights, sheets, sidebars, spring physics, HIG alignment
8|- **Terminal Patterns** (0-10): Block-based output, command/input distinction, PTY aesthetics
9|- **Overall AAA Polish** (0-10): Cohesion, material honesty, anti-slop adherence
10|
11|---
12|
13|## 1. Linear (linear.app.png)
14|
15|| Criterion | Score | Notes |
16||-----------|-------|-------|
17|| Dark Mode Quality | 10 | Deep abyss blacks (#050507 territory), subtle elevation layers, no gray mush. Violet/indigo accent feels premium. |
18|| Typography | 9 | Excellent sans/mono hierarchy. Inter-like sans for UI, clean mono for code/metadata. Small sizes remain crisp. |
19|| Spacing & Density | 9 | Dense but calm. 28px sidebar rows, generous padding in cards. Information-rich without noise. |
20|| macOS Native Feel | 8 | Sidebar with pill selection, structured lists, modal sheets. Not literally native chrome but feels like a Mac tool. |
21|| Terminal Patterns | 4 | Activity feeds and structured cards are close to terminal blocks, but it's an issue tracker—not a terminal. |
22|| Overall AAA Polish | 9 | Cohesive, disciplined, premium. The gold standard for dark productivity apps. |
23|
24|**What to Steal:**
25|- Sidebar density model (28px rows, pill active states)
26|- Structured card layout with meta headers (name + model/tag)
27|- Deep abyss background with subtle elevation layers
28|- Thread lines / accent connectors between related items
29|
30|**Caveats:** No actual terminal chrome. Activity feed ≠ terminal output blocks.
31|
32|---
33|
34|## 2. Cursor (cursor.com.png)
35|
36|| Criterion | Score | Notes |
37||-----------|-------|-------|
38|| Dark Mode Quality | 7 | Dark sidebar is solid, but the marketing page shows light-themed app chrome. Editor is neutral dark. |
39|| Typography | 8 | Good mono for code, sans for UI. The AI output cards use clean sans with inline code styling. |
40|| Spacing & Density | 8 | Three-pane layout (sidebar → content → preview) is well-proportioned. Task list has good density. |
41|| macOS Native Feel | 6 | Traffic light dots visible in mockup, but overall feel is more web/Electron than native Mac. |
42|| Terminal Patterns | 7 | File tree + code blocks + AI output cards = close to terminal+AI hybrid. Shows structured output well. |
43|| Overall AAA Polish | 7 | Polished but reads as "modern IDE" more than "native Mac tool." Some web-app tells (rounded pills, gradients). |
44|
45|**What to Steal:**
46|- AI output as structured cards with file references (+52/-0 badges)
47|- Task list with status icons and elapsed time
48|- Three-pane workspace layout
49|- Inline code blocks with language context
50|
51|**Caveats:** Light marketing chrome clashes with dark app. Some AI-web-app tells (pills, soft gradients).
52|
53|---
54|
55|## 3. Raycast (raycast.com.png)
56|
57|| Criterion | Score | Notes |
58||-----------|-------|-------|
59|| Dark Mode Quality | 8 | Hero has dramatic red/pink gradients (risky), but the actual app UI screenshots show clean dark surfaces. |
60|| Typography | 8 | Excellent command palette typography. Large search field, clear shortcut hints (⌘K), crisp row text. |
61|| Spacing & Density | 9 | Command palette density is perfect—tight rows, clear sections, no waste. Footer hint bar is a nice touch. |
62|| macOS Native Feel | 10 | This IS a native Mac app. Menu bar integration, ⌘K global hotkey, native-feeling sheets. The reference for "Mac tool." |
63|| Terminal Patterns | 6 | Command palette is terminal-adjacent (text input → structured output), but no actual PTY or shell visuals. |
64|| Overall AAA Polish | 9 | Extremely cohesive. Every pixel feels intentional. Extension cards, keyboard shortcuts, search—all dialed. |
65|
66|**What to Steal:**
67|- Command palette layout: search icon → command list → shortcut hints
68|- Footer hint bar with action shortcuts
69|- Extension card grid with icon + description + tag
70|- Keyboard-first navigation model
71|- "Your shortcut to everything" positioning
72|
73|**Caveats:** Hero gradient is loud and un-terminal-like. The actual app UI is darker and more restrained than marketing.
74|
75|---
76|
77|## 4. Warp (warp.dev.png)
78|
79|| Criterion | Score | Notes |
80||-----------|-------|-------|
81|| Dark Mode Quality | 6 | Marketing page is light-themed. Terminal app screenshots show clean light/gray UI—not deep dark. |
82|| Typography | 8 | Terminal blocks use excellent mono typography. Input/output distinction is clear. |
83|| Spacing & Density | 8 | Block-based terminal output is well-spaced. Each command block is separated cleanly. |
84|| macOS Native Feel | 7 | Native-feeling terminal chrome, but the "factory" dashboard feels web-app-ish. |
85|| Terminal Patterns | 10 | This is literally a modern terminal. Block-based I/O, command history, agent output blocks—directly applicable. |
86|| Overall AAA Polish | 8 | Terminal UI is polished. The platform/dashboard side is less cohesive with the terminal aesthetic. |
87|
88|**What to Steal:**
89|- Block-based terminal output (input → output as discrete cards)
90|- Agent output blocks with approve/run/reject states
91|- Cost metrics inline ($26.25 per PR) inside terminal context
92|- Command palette integration within terminal
93|
94|**Caveats:** Marketing page is light. The terminal UI shown is more "light modern" than "dark abyss." Need to translate to deep dark.
95|
96|---
97|
98|## 5. Arc (arc.net.png)
99|
100|| Criterion | Score | Notes |
101||-----------|-------|-------|
102|| Dark Mode Quality | 5 | Colorful purple/blue gradients, light sections. Not a dark app—it's a colorful browser. |
103|| Typography | 7 | Good typography in UI chrome, but marketing page is all over the place stylistically. |
104|| Spacing & Density | 7 | Sidebar tabs are dense and interesting. Split view layout is well-proportioned. |
105|| macOS Native Feel | 7 | Sidebar-as-tabs is innovative Mac-like behavior. Spaces model is native-feeling. |
106|| Terminal Patterns | 2 | Browser, not terminal. No applicable PTY patterns. |
107|| Overall AAA Polish | 6 | Polished as a browser, but not relevant to terminal app goals. Too colorful/consumer. |
108|
109|**What to Steal:**
110|- Sidebar-as-primary-navigation model (tabs live in sidebar)
111|- Spaces for organizing contexts
112|- Split view with resizable panes
113|- Clean toolbar-less content area
114|
115|**Caveats:** Too colorful and consumer-facing. Not a dark terminal reference. Skip for terminal-specific patterns.
116|
117|---
118|
119|## 6. Claude.ai (claude.ai.png)
120|
121|| Criterion | Score | Notes |
122||-----------|-------|-------|
123|| Dark Mode Quality | N/A | Screenshot is a Cloudflare security verification page. Zero design content. |
124|| Typography | N/A | None. |
125|| Spacing & Density | N/A | None. |
126|| macOS Native Feel | N/A | None. |
127|| Terminal Patterns | N/A | None. |
128|| Overall AAA Polish | 0 | This screenshot is useless for analysis. Replace with Claude Desktop app screenshot. |
129|
130|**Verdict:** Remove from consideration. Replace with actual Claude Desktop app dark mode screenshot.
131|
132|---
133|
134|## 7. 21st.dev (21st.dev.png)
135|
136|| Criterion | Score | Notes |
137||-----------|-------|-------|
138|| Dark Mode Quality | 8 | Deep navy/abyss backgrounds. Component previews pop. Good dark mode execution. |
139|| Typography | 7 | Mixed—some components use elegant type, some are generic. Italic serif accents feel trendy. |
140|| Spacing & Density | 7 | Component grid is well-spaced. Code preview panels are dense but readable. |
141|| macOS Native Feel | 4 | Web marketplace, not a native app. Individual components may translate to native feel. |
142|| Terminal Patterns | 5 | Code blocks, copy-paste UI, component cards—useful patterns but not terminal-specific. |
143|| Overall AAA Polish | 7 | Good as a component reference library. Useful for stealing individual patterns, not holistic IA. |
144|
145|**What to Steal:**
146|- Component card grid with preview + code + copy action
147|- "Paste it anywhere" workflow (copy prompt → get component)
148|- Dark theme code blocks with syntax highlighting
149|- Shimmer button / animated CTA patterns
150|- Author attribution pattern (built by real design engineers)
151|
152|**Caveats:** Web marketplace, not native Mac app. Many components are trendy/overdesigned. Filter for restraint.
153|
154|---
155|
156|## Ranked Shortlist (Best → Worst for Terminal App)
157|
158|| Rank | App | Terminal Relevance | macOS Native | Dark Quality | Overall |
159||------|-----|-------------------|--------------|--------------|---------|
160|| 1 | **Warp** | ⭐⭐⭐ Direct reference | 7/10 | 6/10 | **9/10** |
161|| 2 | **Raycast** | ⭐⭐ Palette + density model | 10/10 | 8/10 | **9/10** |
162|| 3 | **Linear** | ⭐⭐ Structured output cards | 8/10 | 10/10 | **9/10** |
163|| 4 | **Cursor** | ⭐⭐ AI output blocks | 6/10 | 7/10 | **7/10** |
164|| 5 | **21st.dev** | ⭐ Component patterns only | 4/10 | 8/10 | **7/10** |
165|| 6 | **Arc** | ❌ Wrong category | 7/10 | 5/10 | **6/10** |
166|| 7 | **Claude.ai** | ❌ Screenshot is broken | N/A | N/A | **0/10** |
167|
168|---
169|
170|

---

### Batch 2 — Visual/Shader/Portfolio Sites

1|
2|
3|## Scoring Key (1-10)
4|- **DTQ**: Dark Theme Quality — depth, contrast, absence of eye strain
5|- **TYR**: Typography/Readability — font choices, hierarchy, spacing
6|- **MNF**: macOS Native Feel — would this feel at home in a Mac app?
7|- **TAE**: Terminal Aesthetic — monospace vibes, command-line energy
8|- **UIP**: UI Polish/Refinement — micro-interactions, borders, shadows
9|- **CLP**: Color Palette — coherence, restraint, accent usage
10|- **LD**: Layout Density — information architecture, spacing, breathing room
11|- **TTL**: Total score (out of 70)
12|
13|---
14|
15|## 1. pryzm.design
16|
17|| DTQ | TYR | MNF | TAE | UIP | CLP | LD | TTL |
18||-----|-----|-----|-----|-----|-----|-----|-----|
19|| 10  | 8   | 5   | 4   | 9   | 8   | 6   | 50  |
20|
21|**Notes**: Almost pure black background (#000 or very close) with colorful glassmorphism cards floating on top. Very dramatic, theatrical dark mode. Typography is bold and confident. Not macOS-native feeling (more web/landing page), and not terminal-like at all — but the *darkness* and card blur effects are top-tier.
22|
23|**Borrow**:
24|1. Glassmorphism/blur card treatments on pure black
25|2. Bold, oversized typography with tight leading
26|3. Generous negative space around focal elements
27|
28|---
29|
30|## 2. unicorn.studio
31|
32|| DTQ | TYR | MNF | TAE | UIP | CLP | LD | TTL |
33||-----|-----|-----|-----|-----|-----|-----|-----|
34|| 8   | 7   | 4   | 3   | 8   | 7   | 5   | 42  |
35|
36|**Notes**: Rich dark UI with purple/violet gradient hero. Many content sections — feature grids, pricing, testimonials, code snippets. The dark theme is solid but slightly "web SaaS" rather than native app. Glowing "Sign up" text is a nice touch. Content-heavy density makes it feel busy. Not terminal-like.
37|
38|**Borrow**:
39|1. Subtle dark section dividers/borders (almost invisible but create structure)
40|2. Glowing text effects for key actions/highlights
41|3. Dark code snippet blocks with syntax highlighting
42|
43|---
44|
45|## 3. jakubantalik.com
46|
47|| DTQ | TYR | MNF | TAE | UIP | CLP | LD | TTL |
48||-----|-----|-----|-----|-----|-----|-----|-----|
49|| 2   | 7   | 6   | 3   | 7   | 5   | 7   | 37  |
50|
51|**Notes**: Light theme — gray background, white cards, minimal aesthetic. Strong typography (Inter font). Customization panel is interesting but this is a light portfolio site. The project card layout with thumbnails + descriptions is clean. Not applicable for dark terminal directly.
52|
53|**Borrow**:
54|1. Clean card component pattern with thumbnail + text + tags
55|2. Subtle corner radius slider (16px default feels good)
56|3. Minimalist sidebar customization panel pattern
57|
58|---
59|
60|## 4. rauno.me
61|
62|| DTQ | TYR | MNF | TAE | UIP | CLP | LD | TTL |
63||-----|-----|-----|-----|-----|-----|-----|-----|
64|| 2   | 9   | 5   | 2   | 6   | 6   | 5   | 35  |
65|
66|**Notes**: Very light, almost brutalist Swiss design. Massive bold typography. Yellow circle accent. Blue pixel cursor. Strong typographic hierarchy but completely wrong theme. Shows confidence in large type and minimal UI chrome. Not suitable for dark terminal inspo directly.
67|
68|**Borrow**:
69|1. Bold oversized typography confidence (scale up headers)
70|2. Minimal UI chrome — let content breathe
71|3. Playful accent elements (like the yellow circle) for personality
72|
73|---
74|
75|## 5. brittanychiang.com ⭐ TOP PICK
76|
77|| DTQ | TYR | MNF | TAE | UIP | CLP | LD | TTL |
78||-----|-----|-----|-----|-----|-----|-----|-----|
79|| 9   | 9   | 8   | 7   | 9   | 9   | 8   | 59  |
80|
81|**Notes**: Deep navy/dark blue theme — closest to a refined dark terminal vibe. Two-column layout with sticky sidebar navigation. Experience timeline reads like a terminal log. Green tech tags look like syntax highlighting. Thumbnails are restrained. Typography is excellent (Inter/system-like). Strong macOS feel with sidebar + main content split. Color palette is restrained: navy, white, gray, green accents. Very polished.
82|
83|**Borrow**:
84|1. Sticky sidebar navigation with section links (About / Experience / Projects)
85|2. Timeline/experience list format — perfect for terminal output log styling
86|3. Subtle colored tags for categorization (like syntax highlighting)
87|4. Two-column layout proportions (sidebar ~30%, content ~70%)
88|
89|---
90|
91|## 6. joshwcomeau.com
92|
93|| DTQ | TYR | MNF | TAE | UIP | CLP | LD | TTL |
94||-----|-----|-----|-----|-----|-----|-----|-----|
95|| 3   | 8   | 5   | 3   | 7   | 6   | 7   | 39  |
96|
97|**Notes**: Light theme with playful pink/magenta header. Excellent blog content density and readability. Article cards are well-structured with clear hierarchy. Right sidebar with category filters. Not dark, not terminal, not particularly macOS-native — but great content organization.
98|
99|**Borrow**:
100|1. Article/content card layout with title, excerpt, "Read more" link
101|2. Right sidebar category filter pattern with pill buttons
102|3. Playful but controlled use of color accents
103|
104|---
105|
106|## 7. v0.dev
107|
108|| DTQ | TYR | MNF | TAE | UIP | CLP | LD | TTL |
109||-----|-----|-----|-----|-----|-----|-----|-----|
110|| 3   | 7   | 5   | 4   | 7   | 5   | 6   | 37  |
111|
112|**Notes**: Light theme AI tool. Large central prompt input — very command-line inspired in layout (one big input, results below). Template cards with thumbnails. Clean but generic SaaS aesthetic. The "command input" pattern is relevant.
113|
114|**Borrow**:
115|1. Large central input area — command prompt styling potential
116|2. Template/example chips below input (like command suggestions)
117|3. Card grid with thumbnails and metadata
118|
119|---
120|
121|## 8. lovable.dev
122|
123|| DTQ | TYR | MNF | TAE | UIP | CLP | LD | TTL |
124||-----|-----|-----|-----|-----|-----|-----|-----|
125|| N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A |
126|
127|**Notes**: Cloudflare security verification page. No actual UI captured. Cannot score.
128|
129|---
130|
131|## Rankings
132|
133|| Rank | Site | TTL | Standout Trait |
134||------|------|-----|----------------|
135|| 1 | brittanychiang.com | 59 | Best overall fit — dark, structured, native-feeling |
136|| 2 | pryzm.design | 50 | Best pure dark aesthetic — glassmorphism on black |
137|| 3 | unicorn.studio | 42 | Feature-rich dark SaaS with glow effects |
138|| 4 | joshwcomeau.com | 39 | Best content organization (light theme) |
139|| 5 | jakubantalik.com | 37 | Clean minimal cards (light theme) |
140|| 6 | v0.dev | 37 | Command-input layout pattern |
141|| 7 | rauno.me | 35 | Bold typography confidence (light theme) |
142|| 8 | lovable.dev | — | No UI captured |
143|
144|---
145|
146|

---

### Batch 3 — Security/AI Tool Marketing Sites

1|
2|
3|## Scoring Criteria (from dark-native-web-ui skill)
4|- Terminal IS the product (not chat-first hero)
5|- Real PTY output, not fake terminal chrome
6|- 0 box shadows, no generic gradients
7|- Density with calm (28px rows, not 44px mobile targets)
8|- Spring physics, not linear easing
9|- Structured cards with meta headers, not chat bubbles
10|- ONE shared WebGL context / glass accent max
11|- No fabricated stats
12|- Honest materials: glass refracts, metal = titlebar, abyss = surface
13|- Dark mode native
14|
15|---
16|
17|## 1. hackerai.co.png — Score: 3/10
18|
19|**What it is:** Minimal dark landing page with centered chat composer as the hero.
20|
21|**What to steal:**
22|- Subtle rounded composer with clean border treatment
23|- Ultra-minimal nav (logo + 3 actions)
24|- Dark background depth (~#111 vs #0a0a0c)
25|
26|**Why it misses:**
27|- **Chat-first hero** — "What will you hack today?" = Claude/HackerAI default posture. Terminal should be the product, AI a pane you summon.
28|- Zero terminal presence — just a chat input.
29|- Generic AI-web-app tell. No density, no tool-like feel.
30|- Rounded everything (pill buttons) = iOS HIG leaking into desktop.
31|
32|**Effort to translate:** Low but not worth it. Wrong IA posture entirely.
33|
34|---
35|
36|## 2. hackerai.sh.png — Score: 4/10
37|
38|**What it is:** Landing page for CLI tool — green accent, install command block, tab switcher.
39|
40|**What to steal:**
41|- **Terminal install block** — real command with copy button, tabbed package manager switcher (curl/npm/pnpm/bun/brew)
42|- Green accent on black — on-brand for security tooling
43|- "Terminal-native" positioning in copy
44|- Clean sans-serif + mono pairing
45|
46|**Why it misses:**
47|- Still a **marketing landing page**, not an app interface.
48|- Hero is giant headline text, not a working terminal.
49|- "Get Started Free" = generic CTA (anti-slop rule: should be "Open Workstation" or "Install CLI").
50|- No window chrome, no sidebar density, no Spaces IA.
51|
52|**Effort to translate:** Medium. The install block pattern is reusable. The green accent color (#00d992-ish) maps well to our `--accent` token.
53|
54|---
55|
56|## 3. pentestgpt.ai.png — Score: 1/10
57|
58|**What it is:** Cloudflare verification challenge page. White background.
59|
60|**What to steal:** Nothing.
61|
62|**Why it misses:** No design. Blocked before rendering.
63|
64|---
65|
66|## 4. nuclei.projectdiscovery.io.png — Score: 2/10
67|
68|**What it is:** Light-mode documentation site with purple/pink gradient cards.
69|
70|**What to steal:**
71|- Card-based feature grid with dark thumbnails (the 3 cards have dark images inside)
72|- Search bar with ⌘K shortcut hint
73|
74|**Why it misses:**
75|- **Light mode** — disqualifying for dark terminal app.
76|- Generic SaaS docs layout (nav + hero + cards).
77|- Gradient background on hero = generic AI-slop.
78|- No terminal, no density, no native feel.
79|
80|---
81|
82|## 5. projectdiscovery.io.png — Score: 4/10
83|
84|**What it is:** Dark hero with code background image, serif headline, white CTAs, logo bar.
85|
86|**What to steal:**
87|- Dark hero with **actual code visible** in background (honest material — code is the wallpaper)
88|- Serif headline font (interesting tension against mono/code)
89|- Minimal top nav with dropdowns
90|- Dark-to-light gradient on code image feels cinematic
91|
92|**Why it misses:**
93|- Background code image is **costume**, not real PTY output.
94|- Still a marketing page ("Stay ahead of every exploit").
95|- Privacy banner + webinar banner = web clutter.
96|- CTAs are generic ("Get Started", "Talk to an expert").
97|- No window chrome, no sidebar, no terminal interface.
98|
99|**Effort to translate:** Medium. The dark cinematic code-bg concept could inspire a login/landing screen, but we need real terminal blocks, not images.
100|
101|---
102|
103|## 6. bolt.new.png — Score: 5/10
104|
105|**What it is:** Bold blue radial gradient background with dark composer, template icons, action buttons.
106|
107|**What to steal:**
108|- **Dark rounded composer** sitting on vibrant background — good contrast
109|- Template type icons (Website/Slides/App/Prototype) with labels
110|- "Build now" CTA with arrow — action-oriented
111|- Top-left logo placement with clean nav
112|
113|**Why it misses:**
114|- **Gradient-as-wallpaper** — violates anti-slop (effects-as-wallpaper tell). This is the Bolt signature look but it's overwhelming.
115|- Blue is off-brand for security terminal (should be abyss + green accent).
116|- Still chat-first posture ("What will you build today?").
117|- No terminal blocks, no structured cards, no native IA.
118|
119|**Effort to translate:** Medium. Composer component is solid. Discard the blue gradient, keep the composer shape and template chips.
120|
121|---
122|
123|## 7. replit.com.png — Score: 1/10
124|
125|**What it is:** Cloudflare blocked page. Light mode error screen.
126|
127|**What to steal:** Nothing.
128|
129|**Why it misses:** No design. Blocked before rendering.
130|
131|---
132|
133|## 8. aceternity.com.png — Score: 3/10
134|
135|**What it is:** Light-mode React component library marketing site.
136|
137|**What to steal:**
138|- **Traffic light dots** (red/yellow/green) in the browser chrome preview — direct macOS native cue
139|- Clean component category tabs in the preview window
140|- Minimal nav + search pattern
141|- Dark button variant ("Browse Components") on light bg — good contrast discipline
142|
143|**Why it misses:**
144|- **Light mode** — disqualifying.
145|- Marketing page for a component library, not an app.
146|- "Trusted by 120,000+" = fabricated social proof (anti-slop).
147|- No terminal, no dark surface, no native app chrome.
148|
149|**Effort to translate:** Low. The traffic light dots are a cute reference but trivial to implement. The component tabs pattern is standard.
150|
151|---
152|
153|## Batch Summary
154|
155|| Site | Score | Dark? | Terminal? | Native Feel? | Key Verdict |
156||------|-------|-------|-----------|--------------|-------------|
157|| hackerai.co | 3/10 | ✅ | ❌ | ❌ | Claude clone — chat-first, no terminal |
158|| hackerai.sh | 4/10 | ✅ | ⚠️ (install block only) | ❌ | Good install block + green accent, still marketing page |
159|| pentestgpt.ai | 1/10 | ❌ | ❌ | ❌ | Cloudflare block, no design |
160|| nuclei.projectdiscovery | 2/10 | ❌ | ❌ | ❌ | Light docs site, generic gradient |
161|| projectdiscovery.io | 4/10 | ✅ | ⚠️ (bg image) | ❌ | Cinematic code bg but costume, not real PTY |
162|| bolt.new | 5/10 | ⚠️ (blue, not abyss) | ❌ | ❌ | Bold composer, but gradient wallpaper + chat-first |
163|| replit.com | 1/10 | ❌ | ❌ | ❌ | Cloudflare block, no design |
164|| aceternity.com | 3/10 | ❌ | ❌ | ⚠️ (traffic light dots) | Light marketing page, macOS dots are nice but superficial |
165|
166|

---

## 🔥 Patterns to Steal (Confirmed)

### From **Raycast**
- Command palette layout: search icon → command list → shortcut hints
- Footer hint bar with action shortcuts
- Extension card grid with icon + description + tag
- Keyboard-first navigation model
- Global ⌘K activation

### From **Linear**
- 28px sidebar rows with pill active states
- Structured cards with meta headers (name + model/tag)
- Deep abyss background with subtle elevation layers
- Thread lines / accent connectors between related items
- Spring-feeling transitions (disciplined, not bouncy)

### From **Warp**
- Block-based terminal output (input → output as discrete cards)
- Agent output blocks with approve/run/reject states
- Inline metadata inside terminal context
- Command palette integration within terminal

### From **Brittany Chiang**
- Sticky sidebar navigation with section links
- Timeline/experience list format → perfect for terminal activity log
- Subtle colored tags for categorization (syntax-highlight palette)
- Two-column layout proportions (sidebar ~30%, content ~70%)
- Deep navy over pure black for reduced eye strain

### From **21st.dev**
- Component marketplace workflow: browse → copy prompt → adapt to our tokens
- Shader/background categories for hero/empty states
- AI chat component patterns (translate to Svelte 5)
- Glass card + animated CTA patterns

### From **HackerAI.sh**
- Tabbed install block: curl / npm / pnpm / bun / brew with copy button
- Green accent on black validates our `--accent: #00d992`
- Terminal-native positioning in copy

### From **Bolt.new**
- Dark rounded composer shape with + and send buttons
- Template/type chips below composer (icon + label)

---

## 🚫 Anti-Slop Rejections

| Pattern | Why Reject | Seen In |
|---------|-----------|---------|
| Chat-first hero | Terminal should be the product; AI is a summoned pane | hackerai.co, bolt.new, most AI sites |
| Gradient-as-wallpaper | Effects should be accent pieces, not the whole background | bolt.new, nuclei, unicorn hero |
| Light mode marketing page | Off-brand for dark terminal app | nuclei, aceternity, pentestgpt, replit |
| Background code image | Costume — use real PTY output blocks | projectdiscovery.io |
| Fabricated social proof | "120,000+ users" without source | aceternity |
| Generic CTAs | "Get Started Free" vs "Open Workstation" | hackerai.sh, projectdiscovery.io |
| Pill/rounded mobile tells | 44px rounded buttons on desktop | most AI SaaS landing pages |
| Chat bubbles for tool output | Structured cards with meta headers instead | claude-style chat UIs |

---

## 🎨 Recommended Direction

Based on this review, the **winning combination** is:

1. **Base layer = Linear** — dark abyss, structured cards, sidebar density
2. **Navigation/Command model = Raycast** — ⌘K command palette, keyboard-first, footer hints
3. **Terminal surface = Warp** — block-based I/O, agent blocks, inline approvals
4. **Visual accents = 21st.dev shaders** — pick 2-3 dark fluid/noise/dither shaders for hero/empty states
5. **Personality = Brittany Chiang** — sticky sidebar, timeline logs, green syntax-highlight tags
6. **Glass effects = Pryzm** — use glassmorphism sparingly on panels, not the whole page

---

## ✅ Next Decision Points

Tell me which direction to lock in:

1. **Primary reference combo** — Linear + Raycast + Warp? Or lean harder into one?
2. **Hero/empty state shader** — dark fluid, dithering, or liquid metal first?
3. **Layout model** — Terminal-as-hero center pane vs chat-first?
4. **Which sites deserve deeper teardown** — want me to extract exact CSS/colors/spacing from any?
5. **Start building** — should I scaffold the shell (sidebar + terminal + command palette) using these references?

---

## 📂 Screenshot Index

```
cursor-research/inspo-screenshots/
├── linear.app.png
├── cursor.com.png
├── raycast.com.png
├── warp.dev.png
├── arc.net.png
├── claude.ai.png            # NOTE: blocked/captcha, low value
├── 21st.dev.png
├── pryzm.design.png
├── unicorn.studio.png
├── jakubantalik.com.png
├── rauno.me.png
├── brittanychiang.com.png   # TOP PICK
├── joshwcomeau.com.png
├── v0.dev.png
├── lovable.dev.png          # NOTE: blocked/captcha, low value
├── hackerai.co.png
├── hackerai.sh.png
├── pentestgpt.ai.png        # NOTE: blocked/captcha, low value
├── nuclei.projectdiscovery.io.png
├── projectdiscovery.io.png
├── bolt.new.png
├── replit.com.png           # NOTE: blocked/captcha, low value
├── aceternity.com.png
├── magicui.design.png
├── reactbits.dev.png
├── shadcn-ui-blocks.com.png
├── framer.com.png
├── webflow.com.png
├── monogrid.com.png
├── mainframe.com.png
├── awwwards.png
├── gallereee.png
├── wallofportfolios.png     # parked domain
├── interfaces-dev.png
├── anti-slop.png
├── originkit.png
├── morphicons.png
├── liquidglassresources.png
├── cuelume-site.png         # SSL issue
├── godmod3.png
├── aicss.png
├── swiftui-js.png
├── swiftuijs-ui.png
├── bits-ui.png
├── shadcn-svelte.png
├── svelte-motion.png
├── apple-hig.png
├── apple-developer.png
├── furo.png
├── linear-style-guide.png
└── batch-1-analysis.md
    batch2-scoring.md
    batch-3-analysis.md
```

---

**This doc is ready for your review.** Approve the direction and i'll start Phase 1: scaffold the shell (WindowChrome + Sidebar + TerminalPane + CommandPalette) using these references.
