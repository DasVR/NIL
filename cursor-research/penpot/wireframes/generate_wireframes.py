#!/usr/bin/env python3
"""Generate NIL Workspace desktop wireframes as Penpot-importable SVGs.

Brand: NIL wordmark (violet + coral cursor) on abyss — from logo + PENPOT-SETUP.md
IA: agent conversation as primary surface (MASTER-REDESIGN.md / DESIGN-TOKENS.md)
"""

from __future__ import annotations

from pathlib import Path

OUT = Path(__file__).resolve().parent

# Locked tokens from PENPOT-SETUP.md
ABYSS = "#050507"
ABYSS1 = "#0a0a0c"
ABYSS2 = "#0a0a0e"
ABYSS3 = "#101016"
ABYSS4 = "#16161d"
VIOLET = "#452a84"
VIOLET_LIGHT = "#a9b1f0"
CORAL = "#fe6f69"
CREAM = "#f5f2ec"
TEXT = "#e8e8e6"
TEXT_DIM = "#9a9a94"
TEXT_FAINT = "#55554f"
GREEN = "#00d992"
DANGER = "#ff5c5c"
WARNING = "#ffb454"
INFO = "#5cb8ff"
BORDER = "rgba(255,255,255,0.08)"
GLASS = "rgba(5,5,7,0.55)"


def svg(w: int, h: int, body: str, title: str) -> str:
    return f'''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" role="img">
  <title>{title}</title>
  <defs>
    <style>
      .sans {{ font-family: Inter, "SF Pro Text", system-ui, sans-serif; }}
      .mono {{ font-family: "JetBrains Mono", ui-monospace, monospace; }}
      .micro {{ font-family: Inter, system-ui, sans-serif; font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; fill: {TEXT_FAINT}; }}
    </style>
  </defs>
  {body}
</svg>
'''


def rect(x, y, w, h, fill, *, rx=0, stroke=None, sw=1, opacity=1) -> str:
    s = f'stroke="{stroke}" stroke-width="{sw}"' if stroke else ""
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{fill}" fill-opacity="{opacity}" {s}/>'


def text(x, y, content, *, size=12, fill=TEXT, weight=400, cls="sans", anchor="start") -> str:
    return (
        f'<text x="{x}" y="{y}" class="{cls}" font-size="{size}" font-weight="{weight}" '
        f'fill="{fill}" text-anchor="{anchor}">{content}</text>'
    )


def line(x1, y1, x2, y2, stroke=BORDER, sw=1) -> str:
    return f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{stroke}" stroke-width="{sw}"/>'


def main_window() -> str:
    W, H = 1440, 900
    parts = [
        rect(0, 0, W, H, ABYSS),
        # Titlebar (liquid metal reference — flat violet wash)
        rect(0, 0, W, 40, ABYSS3),
        rect(0, 0, W, 40, VIOLET, opacity=0.22),
        # traffic lights
        f'<circle cx="18" cy="20" r="5" fill="{DANGER}" fill-opacity="0.7"/>',
        f'<circle cx="36" cy="20" r="5" fill="{WARNING}" fill-opacity="0.7"/>',
        f'<circle cx="54" cy="20" r="5" fill="{GREEN}" fill-opacity="0.55"/>',
        # Brand + space
        text(78, 25, "NIL", size=13, fill=VIOLET_LIGHT, weight=700),
        rect(108, 16, 10, 4, CORAL, rx=2),
        text(128, 25, "·  acme-corp", size=12, fill=TEXT_DIM),
        # Right chrome chips
        text(1080, 25, "⌘K", size=11, fill=TEXT_FAINT, cls="mono"),
        rect(1120, 10, 64, 20, ABYSS4, rx=4, stroke=BORDER),
        text(1152, 24, "api", size=11, fill=TEXT_DIM, cls="mono", anchor="middle"),
        rect(1192, 10, 72, 20, VIOLET, rx=4),
        text(1228, 24, "HUNT", size=11, fill=CREAM, weight=600, cls="mono", anchor="middle"),
        rect(1272, 10, 72, 20, ABYSS4, rx=4, stroke=VIOLET),
        text(1308, 24, "SAFE", size=11, fill=VIOLET_LIGHT, weight=600, cls="mono", anchor="middle"),
        text(1388, 24, "●", size=10, fill=GREEN, anchor="middle"),
        # Sidebar 280
        rect(0, 40, 280, H - 66, ABYSS1),
        line(280, 40, 280, H - 26),
        text(16, 68, "SPACES", size=11, fill=TEXT_FAINT, weight=500),
        rect(8, 80, 264, 28, ABYSS4, rx=4),
        f'<rect x="8" y="80" width="3" height="28" rx="1" fill="{VIOLET}"/>',
        text(24, 98, "acme-corp", size=12, fill=TEXT, weight=500),
        text(24, 130, "lab-sandbox", size=12, fill=TEXT_DIM),
        text(24, 158, "client-beta", size=12, fill=TEXT_DIM),
        text(16, 198, "TARGETS", size=11, fill=TEXT_FAINT, weight=500),
        f'<circle cx="24" cy="220" r="3" fill="{GREEN}"/>',
        text(36, 224, "api.acme.test", size=12, fill=TEXT, cls="mono"),
        text(210, 224, "443", size=11, fill=TEXT_FAINT, cls="mono"),
        f'<circle cx="24" cy="248" r="3" fill="{WARNING}"/>',
        text(36, 252, "10.0.1.5", size=12, fill=TEXT_DIM, cls="mono"),
        text(210, 252, "22", size=11, fill=TEXT_FAINT, cls="mono"),
        f'<circle cx="24" cy="276" r="3" fill="{TEXT_FAINT}"/>',
        text(36, 280, "staging.acme", size=12, fill=TEXT_DIM, cls="mono"),
        text(16, 320, "PLUGINS", size=11, fill=TEXT_FAINT, weight=500),
        text(24, 344, "nmap", size=12, fill=TEXT_DIM, cls="mono"),
        text(24, 372, "nuclei", size=12, fill=TEXT_DIM, cls="mono"),
        text(24, 400, "httpx", size=12, fill=TEXT_DIM, cls="mono"),
        text(24, 428, "ffuf", size=12, fill=TEXT_DIM, cls="mono"),
        # Conversation center
        text(300, 68, "FINN  ·  HUNT", size=11, fill=TEXT_FAINT, weight=500),
        # Plan block
        rect(300, 84, 800, 120, ABYSS2, rx=6, stroke=BORDER),
        f'<rect x="300" y="84" width="3" height="120" rx="1" fill="{VIOLET}"/>',
        text(316, 108, "▶ Planning", size=12, fill=VIOLET_LIGHT, weight=600),
        text(316, 132, "1. Enumerate subdomains with subfinder", size=12, fill=TEXT_DIM),
        text(316, 152, "2. Probe open ports on api.acme.test", size=12, fill=TEXT_DIM),
        text(316, 172, "3. Run nuclei against discovered services", size=12, fill=TEXT_DIM),
        # Tool block
        rect(300, 220, 800, 110, ABYSS2, rx=6, stroke=BORDER),
        text(316, 244, "▶ Running", size=12, fill=GREEN, weight=600),
        text(316, 268, "$ nmap -sV -T4 api.acme.test", size=12, fill=TEXT, cls="mono"),
        text(316, 292, "scanning · 47s", size=11, fill=TEXT_FAINT, cls="mono"),
        rect(980, 232, 96, 24, ABYSS4, rx=4, stroke=BORDER),
        text(1028, 248, "stream", size=11, fill=TEXT_DIM, cls="mono", anchor="middle"),
        # Approval block (ONE attention object — coral/violet pulse border)
        rect(300, 350, 800, 150, ABYSS2, rx=6, stroke=CORAL, sw=2),
        text(316, 376, "▶ Approval required", size=12, fill=CORAL, weight=600),
        text(316, 400, "$ nuclei -u https://api.acme.test -t cves/", size=12, fill=TEXT, cls="mono"),
        text(316, 424, "External scan · may create noise on target", size=12, fill=TEXT_DIM),
        rect(316, 448, 96, 28, VIOLET, rx=4),
        text(364, 466, "Approve", size=12, fill=CREAM, weight=600, anchor="middle"),
        rect(424, 448, 72, 28, ABYSS4, rx=4, stroke=BORDER),
        text(460, 466, "Edit", size=12, fill=TEXT, anchor="middle"),
        rect(508, 448, 80, 28, ABYSS4, rx=4, stroke=BORDER),
        text(548, 466, "Reject", size=12, fill=DANGER, anchor="middle"),
        # Composer
        rect(300, 760, 800, 88, ABYSS3, rx=8, stroke=BORDER),
        text(316, 792, "What should we work on next?", size=13, fill=TEXT_FAINT),
        rect(316, 812, 52, 22, VIOLET, rx=4),
        text(342, 827, "HUNT", size=10, fill=CREAM, weight=600, cls="mono", anchor="middle"),
        rect(376, 812, 52, 22, ABYSS4, rx=4, stroke=BORDER),
        text(402, 827, "CHAT", size=10, fill=TEXT_DIM, cls="mono", anchor="middle"),
        rect(436, 812, 52, 22, ABYSS4, rx=4, stroke=BORDER),
        text(462, 827, "CODE", size=10, fill=TEXT_DIM, cls="mono", anchor="middle"),
        rect(496, 812, 64, 22, ABYSS4, rx=4, stroke=BORDER),
        text(528, 827, "REPORT", size=10, fill=TEXT_DIM, cls="mono", anchor="middle"),
        rect(1040, 808, 40, 28, VIOLET, rx=4),
        text(1060, 826, "↵", size=14, fill=CREAM, anchor="middle"),
        # Inspector 320
        rect(1120, 40, 320, H - 66, ABYSS1),
        line(1120, 40, 1120, H - 26),
        text(1136, 68, "FINDINGS", size=11, fill=TEXT_FAINT, weight=500),
        rect(1136, 84, 288, 56, ABYSS2, rx=4, stroke=BORDER),
        text(1148, 104, "CRITICAL", size=10, fill=DANGER, weight=600, cls="mono"),
        text(1148, 124, "Auth bypass · /token", size=12, fill=TEXT),
        rect(1136, 152, 288, 56, ABYSS2, rx=4, stroke=BORDER),
        text(1148, 172, "MEDIUM", size=10, fill=WARNING, weight=600, cls="mono"),
        text(1148, 192, "GraphQL introspection", size=12, fill=TEXT),
        text(1136, 240, "EVIDENCE", size=11, fill=TEXT_FAINT, weight=500),
        text(1136, 264, "nmap_api.txt", size=12, fill=TEXT_DIM, cls="mono"),
        text(1136, 288, "nuclei_run_03.json", size=12, fill=TEXT_DIM, cls="mono"),
        text(1136, 330, "TIMELINE", size=11, fill=TEXT_FAINT, weight=500),
        text(1136, 354, "14:02  engagement opened", size=11, fill=TEXT_FAINT, cls="mono"),
        text(1136, 374, "14:05  nmap started", size=11, fill=TEXT_FAINT, cls="mono"),
        text(1136, 394, "14:06  approval pending", size=11, fill=CORAL, cls="mono"),
        # Status bar 26
        rect(0, H - 26, W, 26, ABYSS3),
        text(12, H - 9, "api · hunt · 10.0.1.5 · nmap 47s · sandbox ● · YOLO off · v0.5", size=11, fill=TEXT_FAINT, cls="mono"),
        # Frame label
        text(12, H - 36, "02 Layouts  ·  Main Window (default)", size=11, fill=TEXT_FAINT),
    ]
    return svg(W, H, "\n  ".join(parts), "NIL Main Window Wireframe")


def empty_state() -> str:
    W, H = 1440, 900
    parts = [
        rect(0, 0, W, H, ABYSS),
        rect(0, 0, W, 40, ABYSS3),
        rect(0, 0, W, 40, VIOLET, opacity=0.18),
        f'<circle cx="18" cy="20" r="5" fill="{DANGER}" fill-opacity="0.7"/>',
        f'<circle cx="36" cy="20" r="5" fill="{WARNING}" fill-opacity="0.7"/>',
        f'<circle cx="54" cy="20" r="5" fill="{GREEN}" fill-opacity="0.55"/>',
        text(78, 25, "NIL", size=13, fill=VIOLET_LIGHT, weight=700),
        rect(108, 16, 10, 4, CORAL, rx=2),
        # Centered brand
        text(720, 280, "NIL", size=64, fill=VIOLET_LIGHT, weight=700, anchor="middle"),
        rect(780, 242, 28, 10, CORAL, rx=4),
        text(720, 320, "What should we work on?", size=18, fill=TEXT_DIM, anchor="middle"),
        # Composer
        rect(420, 360, 600, 100, ABYSS3, rx=10, stroke=BORDER),
        text(444, 400, "Describe a target, paste a scope, or pick a template…", size=13, fill=TEXT_FAINT),
        rect(444, 420, 52, 22, VIOLET, rx=4),
        text(470, 435, "HUNT", size=10, fill=CREAM, weight=600, cls="mono", anchor="middle"),
        rect(504, 420, 52, 22, ABYSS4, rx=4, stroke=BORDER),
        text(530, 435, "CHAT", size=10, fill=TEXT_DIM, cls="mono", anchor="middle"),
        rect(564, 420, 52, 22, ABYSS4, rx=4, stroke=BORDER),
        text(590, 435, "CODE", size=10, fill=TEXT_DIM, cls="mono", anchor="middle"),
        rect(616, 420, 64, 22, ABYSS4, rx=4, stroke=BORDER),
        text(648, 435, "REPORT", size=10, fill=TEXT_DIM, cls="mono", anchor="middle"),
        # Templates — interaction containers, not decorative cards
        text(420, 520, "TEMPLATES", size=11, fill=TEXT_FAINT, weight=500),
    ]
    labels = [("Web App", "HTTPS + forms"), ("API", "OpenAPI / GraphQL"), ("Mobile", "APK / IPA"), ("Custom", "Blank scope")]
    x = 420
    for label, sub in labels:
        parts.append(rect(x, 536, 140, 64, ABYSS2, rx=6, stroke=BORDER))
        parts.append(text(x + 16, 564, label, size=13, fill=TEXT, weight=600))
        parts.append(text(x + 16, 584, sub, size=11, fill=TEXT_FAINT))
        x += 152
    parts.append(text(420, 640, "RECENT", size=11, fill=TEXT_FAINT, weight=500))
    parts.append(text(420, 664, "acme-corp  ·  last hunt 2d ago", size=12, fill=TEXT_DIM, cls="mono"))
    parts.append(text(420, 688, "lab-sandbox  ·  yesterday", size=12, fill=TEXT_DIM, cls="mono"))
    parts.append(rect(0, H - 26, W, 26, ABYSS3))
    parts.append(text(12, H - 9, "ready · no active engagement · press ⌘K", size=11, fill=TEXT_FAINT, cls="mono"))
    parts.append(text(12, H - 36, "02 Layouts  ·  Empty State (new workspace)", size=11, fill=TEXT_FAINT))
    return svg(W, H, "\n  ".join(parts), "NIL Empty State Wireframe")


def command_palette() -> str:
    W, H = 1440, 900
    parts = [
        rect(0, 0, W, H, ABYSS),
        # dimmed main chrome silhouette
        rect(0, 0, W, 40, ABYSS3, opacity=0.5),
        rect(0, 40, 280, H - 66, ABYSS1, opacity=0.35),
        rect(1120, 40, 320, H - 66, ABYSS1, opacity=0.35),
        rect(0, 0, W, H, "#000000", opacity=0.45),
        # palette
        rect(360, 160, 720, 420, ABYSS2, rx=12, stroke=BORDER),
        rect(360, 160, 720, 52, ABYSS3, rx=0),
        # clip top corners visually
        rect(360, 160, 720, 52, ABYSS3),
        text(384, 192, "Ask NIL or run a command…", size=14, fill=TEXT_FAINT),
        text(1040, 192, "⌘K", size=12, fill=TEXT_FAINT, cls="mono"),
        line(360, 212, 1080, 212),
        text(384, 244, "COMMANDS", size=11, fill=TEXT_FAINT, weight=500),
        rect(372, 256, 696, 32, ABYSS4, rx=4),
        text(388, 276, "New engagement", size=13, fill=TEXT),
        text(1000, 276, "⌘N", size=11, fill=TEXT_FAINT, cls="mono"),
        text(388, 316, "Toggle sidebar", size=13, fill=TEXT_DIM),
        text(1000, 316, "⌘B", size=11, fill=TEXT_FAINT, cls="mono"),
        text(388, 348, "Open settings", size=13, fill=TEXT_DIM),
        text(1000, 348, "⌘,", size=11, fill=TEXT_FAINT, cls="mono"),
        text(384, 392, "SPACES", size=11, fill=TEXT_FAINT, weight=500),
        text(388, 420, "acme-corp", size=13, fill=TEXT_DIM),
        text(1000, 420, "⌘1", size=11, fill=TEXT_FAINT, cls="mono"),
        text(388, 452, "lab-sandbox", size=13, fill=TEXT_DIM),
        text(1000, 452, "⌘2", size=11, fill=TEXT_FAINT, cls="mono"),
        text(384, 496, "TOOLS", size=11, fill=TEXT_FAINT, weight=500),
        text(388, 524, "Run nmap on selected target", size=13, fill=TEXT_DIM),
        text(388, 556, "Run nuclei (requires approval)", size=13, fill=TEXT_DIM),
        text(12, H - 36, "02 Layouts  ·  Command Palette (⌘K)", size=11, fill=TEXT_FAINT),
    ]
    return svg(W, H, "\n  ".join(parts), "NIL Command Palette Wireframe")


def tokens_board() -> str:
    W, H = 1280, 900
    parts = [rect(0, 0, W, H, ABYSS), text(40, 48, "00 Tokens  ·  NIL Design System", size=20, fill=TEXT, weight=600)]
    colors = [
        ("abyss", ABYSS), ("abyss-1", ABYSS1), ("abyss-2", ABYSS2), ("abyss-3", ABYSS3), ("abyss-4", ABYSS4),
        ("violet", VIOLET), ("violet-light", VIOLET_LIGHT), ("coral", CORAL), ("cream", CREAM),
        ("text", TEXT), ("text-dim", TEXT_DIM), ("text-faint", TEXT_FAINT),
        ("green", GREEN), ("danger", DANGER), ("warning", WARNING), ("info", INFO),
    ]
    x, y = 40, 80
    for i, (name, hexv) in enumerate(colors):
        if i and i % 8 == 0:
            x = 40
            y += 120
        parts.append(rect(x, y, 140, 72, hexv, rx=6, stroke=BORDER))
        parts.append(text(x, y + 92, name, size=11, fill=TEXT_DIM, cls="mono"))
        parts.append(text(x, y + 108, hexv, size=10, fill=TEXT_FAINT, cls="mono"))
        x += 156
    parts.append(text(40, 360, "TYPE", size=11, fill=TEXT_FAINT, weight=500))
    parts.append(text(40, 392, "title/space — Inter 13 / 600", size=13, fill=TEXT, weight=600))
    parts.append(text(40, 420, "nav/row — Inter 12 / 400", size=12, fill=TEXT))
    parts.append(text(40, 446, "MICRO / LABEL — INTER 11 / 500 / 0.08EM", size=11, fill=TEXT_FAINT, weight=500))
    parts.append(text(40, 474, "mono/data — JetBrains Mono 12", size=12, fill=TEXT, cls="mono"))
    parts.append(text(40, 498, "mono/meta — JetBrains Mono 10", size=10, fill=TEXT_FAINT, cls="mono"))
    parts.append(text(40, 560, "DENSITY", size=11, fill=TEXT_FAINT, weight=500))
    parts.append(text(40, 588, "sidebar-row 28px · status-bar 26px · toolbar 28px · gap 4/8/16 · border 1px @ 8% white", size=12, fill=TEXT_DIM, cls="mono"))
    parts.append(text(40, 640, "SPRINGS", size=11, fill=TEXT_FAINT, weight=500))
    parts.append(text(40, 668, "bouncy (0.34,1.56,0.64,1) · smooth (0.22,1,0.36,1) · window (0.32,0.72,0,1) · snappy (0.25,0.9,0.25,1)", size=11, fill=TEXT_DIM, cls="mono"))
    parts.append(text(40, 720, "Brand mark: NIL + coral cursor dash. Accent is violet; coral is the single hot attention accent.", size=12, fill=TEXT_DIM))
    return svg(W, H, "\n  ".join(parts), "NIL Tokens Board")


def components_strip() -> str:
    W, H = 1280, 720
    parts = [
        rect(0, 0, W, H, ABYSS),
        text(40, 48, "01 Components  ·  Buttons / Blocks / Chrome", size=20, fill=TEXT, weight=600),
        text(40, 88, "BUTTONS", size=11, fill=TEXT_FAINT, weight=500),
        rect(40, 104, 120, 32, VIOLET, rx=4),
        text(100, 124, "Primary", size=12, fill=CREAM, weight=600, anchor="middle"),
        rect(176, 104, 120, 32, ABYSS3, rx=4, stroke=VIOLET),
        text(236, 124, "Secondary", size=12, fill=CREAM, anchor="middle"),
        rect(312, 104, 100, 32, "transparent", rx=4, stroke=BORDER),
        text(362, 124, "Ghost", size=12, fill=VIOLET_LIGHT, anchor="middle"),
        rect(428, 104, 100, 32, DANGER, rx=4),
        text(478, 124, "Danger", size=12, fill=CREAM, weight=600, anchor="middle"),
        rect(544, 104, 32, 32, ABYSS3, rx=4, stroke=BORDER),
        text(560, 124, "⌘", size=12, fill=TEXT, anchor="middle"),
        text(40, 180, "AGENT BLOCKS", size=11, fill=TEXT_FAINT, weight=500),
        rect(40, 196, 360, 88, ABYSS2, rx=6, stroke=BORDER),
        f'<rect x="40" y="196" width="3" height="88" fill="{VIOLET}"/>',
        text(56, 220, "block/plan", size=12, fill=VIOLET_LIGHT, weight=600),
        text(56, 244, "Numbered steps · violet accent bar", size=12, fill=TEXT_DIM),
        rect(420, 196, 360, 88, ABYSS2, rx=6, stroke=BORDER),
        text(436, 220, "block/tool", size=12, fill=GREEN, weight=600),
        text(436, 244, "$ command · status · collapsible out", size=12, fill=TEXT_DIM, cls="mono"),
        rect(800, 196, 400, 88, ABYSS2, rx=6, stroke=CORAL, sw=2),
        text(816, 220, "block/approval", size=12, fill=CORAL, weight=600),
        text(816, 244, "Approve / Edit / Reject — only pulse", size=12, fill=TEXT_DIM),
        text(40, 320, "CHROME", size=11, fill=TEXT_FAINT, weight=500),
        rect(40, 336, 600, 26, ABYSS3),
        text(52, 354, "status-bar 26px  ·  mode · target · tool · sandbox · YOLO", size=11, fill=TEXT_FAINT, cls="mono"),
        rect(40, 380, 600, 40, ABYSS3),
        rect(40, 380, 600, 40, VIOLET, opacity=0.2),
        text(52, 404, "titlebar 40px  ·  liquid metal reference  ·  NIL · space  ·  chips", size=12, fill=TEXT_DIM),
        text(40, 460, "Anti-slop: no decorative shadows · no fake metrics · no emoji · keyboard-first · 28px rows", size=12, fill=TEXT_DIM),
    ]
    return svg(W, H, "\n  ".join(parts), "NIL Components Strip")


def flows_board() -> str:
    W, H = 1280, 800
    parts = [
        rect(0, 0, W, H, ABYSS),
        text(40, 48, "03 Flows  ·  Agent loop / Approval / YOLO", size=20, fill=TEXT, weight=600),
    ]
    # Agent loop boxes
    steps = [
        (40, 100, "User task", TEXT),
        (220, 100, "Plan block", VIOLET_LIGHT),
        (400, 100, "Tool block", GREEN),
        (580, 100, "Approval", CORAL),
        (760, 100, "Verify", INFO),
        (940, 100, "Summarize", TEXT),
    ]
    for i, (x, y, label, color) in enumerate(steps):
        parts.append(rect(x, y, 150, 56, ABYSS2, rx=6, stroke=BORDER))
        parts.append(text(x + 75, y + 34, label, size=13, fill=color, weight=600, anchor="middle"))
        if i < len(steps) - 1:
            parts.append(line(x + 150, y + 28, x + 170, y + 28, stroke=TEXT_FAINT, sw=1.5))
    parts.append(text(40, 200, "Approval detail", size=14, fill=TEXT, weight=600))
    parts.append(text(40, 228, "Finn proposes dangerous command → pulsing coral border → Approve runs &amp; logs · Edit rewrites · Reject adjusts plan", size=12, fill=TEXT_DIM))
    parts.append(text(40, 280, "Space switch (⌘1…9)", size=14, fill=TEXT, weight=600))
    parts.append(text(40, 308, "Instant swap of sidebar + conversation + inspector + status · spring-window 300ms", size=12, fill=TEXT_DIM))
    parts.append(text(40, 360, "YOLO toggle", size=14, fill=TEXT, weight=600))
    parts.append(rect(40, 380, 72, 24, ABYSS4, rx=4, stroke=VIOLET))
    parts.append(text(76, 396, "SAFE", size=11, fill=VIOLET_LIGHT, weight=600, cls="mono", anchor="middle"))
    parts.append(text(130, 396, "→", size=14, fill=TEXT_FAINT))
    parts.append(rect(160, 380, 72, 24, CORAL, rx=4))
    parts.append(text(196, 396, "YOLO", size=11, fill=CREAM, weight=600, cls="mono", anchor="middle"))
    parts.append(text(40, 430, "Auto-approves subsequent tools · still rendered as blocks · still logged · never animated cute", size=12, fill=TEXT_DIM))
    return svg(W, H, "\n  ".join(parts), "NIL Flows Board")


def write_all() -> None:
    files = {
        "00-tokens.svg": tokens_board(),
        "01-components.svg": components_strip(),
        "02-main-window.svg": main_window(),
        "02-empty-state.svg": empty_state(),
        "02-command-palette.svg": command_palette(),
        "03-flows.svg": flows_board(),
    }
    for name, content in files.items():
        path = OUT / name
        path.write_text(content)
        print(f"wrote {path} ({len(content)} bytes)")


if __name__ == "__main__":
    write_all()
