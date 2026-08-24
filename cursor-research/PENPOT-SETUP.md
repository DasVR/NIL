# Penpot Design Setup — NIL Coding Agent Workspace

**Penpot URL:** http://localhost:9001
**Project:** NIL Workspace Design System

---

## 1. CREATE THE FILE

1. Open http://localhost:9001
2. Click **New File** → name it: `NIL Workspace Design System`
3. Create these **Pages** (tabs at top):

---

## 2. PAGE STRUCTURE

### Page 0: `00 Tokens` — Design Tokens (single source of truth)

**Color Tokens** (create as Penpot Color Styles):
| Name | Value | Usage |
|------|-------|-------|
| `abyss` | `#050507` | Work surface, main bg |
| `abyss-1` | `#0a0a0c` | Raised surface 1 |
| `abyss-2` | `#0a0a0e` | Raised surface 2 |
| `abyss-3` | `#101016` | Control surface |
| `abyss-4` | `#16161d` | Hover surface |
| `violet` | `#452a84` | Primary accent (deep) |
| `violet-light` | `#a9b1f0` | Lavender accent |
| `coral` | `#fe6f69` | Warm accent |
| `cream` | `#f5f2ec` | Light surface (wordmark bg) |
| `text` | `#e8e8e6` | Human text (Inter) |
| `text-dim` | `#9a9a94` | Dim text |
| `text-faint` | `#55554f` | Mono metadata |
| `green` | `#00d992` | Legacy phosphor (if needed) |
| `danger` | `#ff5c5c` | Error/critical |
| `warning` | `#ffb454` | Warning |
| `info` | `#5cb8ff` | Info |

**Glass Tokens** (create as Color Styles with opacity):
| Name | Fill | Blur | Usage |
|------|------|------|-------|
| `glass-1` | `rgba(5,5,7,0.45)` | 32px | Sidebar surface |
| `glass-2` | `rgba(5,5,7,0.55)` | 36px | Inspector surface |
| `glass-3` | `rgba(5,5,7,0.65)` | 40px | Modal/sheet |
| `glass-4` | `rgba(5,5,7,0.72)` | 40px | Floating chrome |

**Typography Styles** (Text Styles):
| Name | Font | Size | Weight | Letter-spacing |
|------|------|------|--------|----------------|
| `title/space` | Inter | 13 | 600 | 0 |
| `nav/row` | Inter | 12 | 400 | 0 |
| `micro/label` | Inter | 11 | 500 | 0.08em (uppercase) |
| `mono/data` | JetBrains Mono | 12 | 400 | 0 |
| `mono/meta` | JetBrains Mono | 10 | 400 | 0 |
| `mono/severity` | JetBrains Mono | 11 | 600 | 0 |

**Spacing Tokens** (create as components or document):
- `sidebar-row`: 28px (6px v-pad, 8px h-pad)
- `inspector-row`: 28px
- `status-bar`: 26px
- `toolbar`: 28px
- `gap-sm`: 4px
- `gap-md`: 8px
- `gap-lg`: 16px
- `border`: 1px at 8% white (`rgba(255,255,255,0.08)`)

**Spring Curves** (document as text):
- `spring-bouncy`: `cubic-bezier(0.34, 1.56, 0.64, 1)` — controls, dock
- `spring-smooth`: `cubic-bezier(0.22, 1, 0.36, 1)` — panels, cards
- `spring-window`: `cubic-bezier(0.32, 0.72, 0, 1)` — Space switch, overlays
- `spring-snappy`: `cubic-bezier(0.25, 0.9, 0.25, 1)` — list rows

**Reduced Motion:** All become `ease` / instant. Disable pointer sheen, freeze flowing metal, static glass.

---

### Page 1: `01 Components` — Component Library

Build these as **Main Components** (so instances update everywhere):

#### 1.1 Buttons
- `btn/primary` — violet fill, cream text, coral hover glow
- `btn/secondary` — glass-2, violet border, cream text
- `btn/ghost` — transparent, violet text, glass-1 hover
- `btn/danger` — danger fill, cream text
- `btn/icon` — 28×28, icon only, glass-2 hover
- **States:** default, hover, active, disabled, loading
- **Sizes:** sm (28px), md (36px), lg (44px)
- **Sounds:** cuelume click on hover/press (note in spec)

#### 1.2 Inputs
- `input/text` — glass-2 bg, violet border focus, cream text, mono placeholder
- `input/search` — with leading search icon, Cmd+K hint
- `input/command` — full-width composer, auto-grow, mode chips

#### 1.3 Cards / Blocks (Agent Conversation)
- `block/plan` — numbered steps, violet accent left bar
- `block/tool` — command + status + collapsible output
- `block/diff` — side-by-side or unified diff, monaco styling
- `block/finding` — severity badge, evidence, timeline link
- `block/artifact` — rendered markdown/PoC/report
- `block/approval` — **pulsing** violet border, Approve/Edit/Reject buttons inline
- `block/ask` — clarifying question, input inline

#### 1.4 Sidebar Items
- `sidebar/space` — Space name, target count, active indicator
- `sidebar/target` — host, ports, status dot (phosphor green)
- `sidebar/plugin` — plugin name, tool count, enable toggle
- `sidebar/cred` — masked, copy action

#### 1.5 Inspector Panels
- `inspector/findings` — list, filter, severity sort
- `inspector/evidence` — file preview, metadata
- `inspector/timeline` — chronological log, searchable
- `inspector/notes` — markdown editor, auto-save

#### 1.6 Overlays / Sheets
- `sheet/command-palette` — full-width, fuzzy search, keyboard hints
- `sheet/settings` — left categories, right content, glass-3
- `sheet/new-engagement` — target input, template picker, scope
- `sheet/approval-detail` — expanded approval context

#### 1.7 Status / Chrome
- `status-bar` — 26px, left: mode/model, center: target, right: sandbox/YOLO
- `titlebar` — 40px, liquid metal (reference only), traffic lights
- `toast` — glass-4, spring-smooth, cuelume sound

#### 1.8 Empty States
- `empty/engagement` — "What should we work on?", templates, recent
- `empty/targets` — "Add your first target", scan button
- `empty/findings` — "No findings yet", run a scan hint

---

### Page 2: `02 Layouts` — Key Screens

#### 2.1 Main Window (Default)
```
┌─ Titlebar (40px, liquid metal) ────────────────────────────────────┐
│ [•••]  NIL · acme-corp                    ⌘K  ● api · HUNT · SAFE  │
├──────────────┬──────────────────────────────────────┬───────────────┤
│              │                                      │               │
│  SIDEBAR     │       AGENT CONVERSATION             │  INSPECTOR    │
│  (280px)     │       (flex, min 600px)              │  (320px)      │
│              │                                      │               │
│  Spaces      │  ┌ FINN · HUNT ──────────────────┐  │  Findings     │
│  Targets     │  │ ▶ Planning                    │  │  Evidence     │
│  Services    │  │ ▶ Running: nmap ...           │  │  Timeline     │
│  Creds       │  │ ▶ Verified: 2 findings        │  │  Notes        │
│  Plugins     │  │ [Approve] [Edit] [Reject]     │  │               │
│              │  └────────────────────────────────┘  │               │
│              │                                      │               │
├──────────────┴──────────────────────────────────────┴───────────────┤
│ STATUS BAR (26px)  api · hunt · 10.0.1.5 · nmap 97s · sandbox ● YOLO │
└──────────────────────────────────────────────────────────────────────┘
```

#### 2.2 Composer Focus (Cmd+T or click)
- Composer expands, auto-grows
- Mode chips visible: `HUNT` `CHAT` `CODE` `REPORT`
- Drag-drop zone for files
- Esc to collapse

#### 2.3 Command Palette (Cmd+K)
- Full overlay, centered
- Sections: Commands, Spaces, Targets, Tools, Settings, Help
- Fuzzy search, arrow nav, Enter to run

#### 2.4 Settings Sheet (Cmd+,)
- Left: categories (General, Appearance, Models, Providers, Tools, Engagements, Advanced)
- Right: form fields, glass-3 panels
- Live preview of theme changes

#### 2.5 Empty State (New Workspace)
- Centered on abyss
- Large "NIL" wordmark (cream + coral cursor)
- "What should we work on?" composer
- Template cards: `Web App`, `API`, `Mobile`, `Custom`
- Recent engagements list

---

### Page 3: `03 Flows` — Interaction Flows

#### 3.1 Agent Loop
```
User types task → Finn plans (block/plan)
                → Finn runs tool (block/tool, pending approval if not YOLO)
                → User: Approve / Edit / Reject
                → Tool runs (block/tool, streaming output)
                → Finn verifies (block/verified)
                → Finn summarizes / proposes next
                → Loop or complete
```

#### 3.2 Approval Flow
```
Finn proposes dangerous command
    ↓
Approval block appears (pulsing violet border)
    ↓
User clicks Approve → runs, logs, block updates to ✓
User clicks Edit → inline edit command → re-propose
User clicks Reject → block dismissed, Finn adjusts plan
```

#### 3.3 Space Switch (Cmd+1..9)
```
Cmd+1 → instant swap entire window state
    → Sidebar targets/services/creds update
    → Conversation history swaps
    → Inspector data swaps
    → Status bar updates
    → Spring-window transition (300ms)
```

#### 3.4 YOLO Toggle
```
Click YOLO chip in titlebar
    ↓
Chip changes: SAFE → YOLO (coral, not pulsing)
    ↓
All subsequent tool proposals auto-approve
    ↓
Still rendered as blocks, still logged
    ↓
Click again → SAFE (violet)
```

---

### Page 4: `04 States` — Component States

For every component, document:
- Default
- Hover
- Active / Pressed
- Focus (keyboard)
- Disabled
- Loading / Streaming
- Error
- Success
- **Reduced motion** variant

Special states:
- `block/approval` → pulsing (primary attention object)
- `ThinkingOrbs` → animating (AI streaming)
- `BorderBeam` → active on hover/focus
- `titlebar` → liquid metal flowing (frozen on reduced motion)

---

### Page 5: `05 Specs` — Dev Handoff

For each component, include:
- **Props table** (name, type, default, required)
- **CSS custom properties** used
- **Keyboard interactions**
- **Sounds** (cuelume event name)
- **Animation** (spring token, duration)
- **Accessibility** (ARIA roles, focus order)
- **Responsive behavior** (320, 375, 414, 768, 1024, 1440)
- **Penpot inspect link** (click component → Inspect panel)

---

## 3. PENPOT WORKFLOW TIPS

### Creating Components
1. Design the base variant
2. Select → Right-click → **Create Component** (or `Ctrl+Alt+K`)
3. Name with slash convention: `btn/primary/default`
4. Add variants via **Component Properties** panel:
   - `state`: default, hover, active, disabled, loading
   - `size`: sm, md, lg

### Using Color Styles
1. Select shape → Fill → **Color Styles** → **+** to create
2. Apply to other shapes via Color Styles panel
3. Update once → all instances update

### Text Styles
1. Format text → Text panel → **Text Styles** → **+**
2. Apply to other text layers

### Layout & Constraints
- Use **Flex Layout** (horizontal/vertical) for rows/columns
- Set constraints: `Left & Right` for full-width, `Center` for centered
- Gap = our spacing tokens

### Export for Dev
- Select component → **Inspect** panel (right sidebar)
- Shows: CSS, dimensions, colors, fonts, spacing
- Copy CSS custom properties directly

### Libraries (Team)
- File → **Libraries** → Publish this file as a library
- Other files can consume components via **Assets** panel

---

## 4. STARTING POINT IN PENPOT

**Do this first (5 min):**
1. Create file `NIL Workspace Design System`
2. Create 6 pages: `00 Tokens`, `01 Components`, `02 Layouts`, `03 Flows`, `04 States`, `05 Specs`
3. On `00 Tokens`: create all Color Styles + Text Styles from the tables above
4. On `01 Components`: build `btn/primary` with all 5 states as variants
5. On `02 Layouts`: build the **Main Window** layout using components from `01`

**Then we iterate:**
- You design in Penpot, I translate to Svelte components
- We keep Penpot as the source of truth
- Changes in Penpot → inspect → update code

---

## 5. PENPOT URLS FOR REFERENCE

- Main: http://localhost:9001
- This file: http://localhost:9001/#/file/[file-id]
- Inspect any component: click → right panel → **Inspect**

---

*Save this as `cursor-research/PENPOT-SETUP.md` in the repo.*