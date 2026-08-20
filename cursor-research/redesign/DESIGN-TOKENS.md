# FINN WORKSTATION — DESIGN SPEC v5 (Bookmark-Grounded)

> **Direction locked:** "like Claude, with the UI design of cursor AGENTS."
> **Purpose:** Single reference for Cursor/opencode containing the design language. The AI agent (Finn) is the interface; Chrome is Cursor-style; feel is Claude-quiet. Use alongside `MASTER-REDESIGN.md` (IA) + `CURSOR-REDESIGN-PROMPT.md` (drop-in brief).

---

## 1. COLOR TOKENS (LOCKED — do not invent)

```css
--abyss:        #050507;   /* work surface */
--abyss-1:      #0a0a0c;   /* raised surface */
--abyss-2:      #0a0a0e;   /* raised surface 2 */
--abyss-3:      #101016;   /* control surface */
--abyss-4:      #16161d;   /* hover surface */

--green:        #00d992;   /* accent — phosphor */
--green-dim:    #00b377;
--green-glow:   rgba(0, 217, 146, 0.35);
--green-soft:   rgba(0, 217, 146, 0.12);

--text:         #e8e8e6;   /* human (Inter) */
--text-dim:     #9a9a94;
--text-faint:   #55554f;   /* mono metadata */

--danger:       #ff5c5c;   --warning: #ffb454;
--info:         #5cb8ff;   --critical: #ff2d55;
```

**Semantic rule:** `--green` = phosphor/machine/data. Inter = human prose. JetBrains Mono = machine (hosts, ports, commands, timestamps, numbers).

## 2. GLASS TIERS (Apple Liquid Glass, dark-first)

| Tier | Opacity | Use |
|------|---------|-----|
| `--glass-1` | 0.45 | sidebar surface |
| `--glass-2` | 0.55 | inspector surface |
| `--glass-3` | 0.65 | modal / sheet |
| `--glass-4` | 0.72 | floating chrome |

Glass ONLY where two layers overlap. Edge refraction highlight via `::before` gradient + `mask-composite`. Blur 32-40px, saturate 1.7. On solid `--abyss`, use solid fills, not mud.

## 3. SPRING CURVES (from Framer Motion bookmarks)

| Token | cubic-bezier | Use |
|-------|--------------|-----|
| `--spring-bouncy` | (0.34, 1.56, 0.64, 1) | controls, dock |
| `--spring-smooth` | (0.22, 1, 0.36, 1) | panels, cards |
| `--spring-window` | (0.32, 0.72, 0, 1) | Space switch, overlays |
| `--spring-snappy` | (0.25, 0.9, 0.25, 1) | list rows |

**Reduced motion:** ALL become `ease`. Disable pointer sheen, freeze flowing metal, static glass.

## 4. THE LAYER STACK

```
L0  Abyss        (work surface — solid #050507)
L1  Sidebars     (glass-1, dimmer than canvas)
L2  Inspector    (glass-2)
L3  Overlay      (titlebar metal, palette, sheets)
L4  HUD/status   (26px bar, toasts)
```

## 5. TYPE HIERARCHY

| Element | Font | Size | Weight |
|---------|------|------|--------|
| App title / Space name | Inter | 13 | 600 |
| Nav / list rows | Inter | 12 | 400 |
| Micro labels | Inter | 11 | 500 | uppercase, 0.08em |
| Hosts / ports / cmds | JetBrains Mono | 12 | 400 |
| Status / meta | JetBrains Mono | 10 | 400 |
| Finding severity | JetBrains Mono | 11 | 600 |

## 6. DENSITY RULES (Linear)

```
sidebar rows:  28px (6px v-pad, 8px h-pad)
inspector rows: 28px
status bar:     26px
toolbar controls: 28px
1px separators at 8% white
Gap over margin, 4-8px
```

## 7. THE KEYBOARD MAP (printed in the UI)

```
⌘K        palette            ⌘T        focus conversation
⌘,        settings sheet      ⌘E        deploy artifact
⌘B        toggle sidebar      ⌘\        split view
⌘⇧B       toggle inspector    ⌘J        show/hide Finn
⌘⇧J       pin Finn panel      ⌘1..9     switch Space
↵         approve             esc       reject / peel one layer
```

## 8. ONE ATTENTION OBJECT

Pending approval, live scan, OR critical finding — pick ONE to pulse. Two pulsing greens is noise. The pending approval block in the terminal is the primary pulse. YOLO is a static status chip, never animated cute.

## 9. MATERIALS ARE HONEST

- **Metal** = the 40px titlebar ONLY (one shared WebGL context)
- **Glass** = only at real overlaps
- **Abyss** = the work surface
- **Phosphor green** = data / machine / live status
- **Static grain/dither** = 2-3% SVG noise, 0ms after paint (never per-pixel canvas)

---

*Compiled from Arriq's bookmarks: Jakub Antalik (beam/orbs/liquid metal), anti-slop + chiefkeef.md, liquid-glass-svelte, swiftuijs, Amicro, morphicons, cuelume, interfaces.dev cheat-sheet, Warp/Raycast/Linear/Cursor/Arc/Claude.*