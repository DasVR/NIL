/**
 * NIL desktop wireframe — generates NIL-Desktop-App.penpot
 *
 * Brand from the gemini mark: violet N, coral dash, cream tile.
 * Research: agent conversation as the work surface, Linear density,
 * Raycast palette, Warp/Cursor typed blocks, approval as the one
 * attention object. Phosphor green is live machine data only.
 */

import * as penpot from "@penpot/library";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(fileURLToPath(import.meta.url));
const LOGO = join(ROOT, "../../cursor-research/logo");
const OUT = join(ROOT, "NIL-Desktop-App.penpot");

const C = {
  abyss: "#050507",
  abyss: "#050507",
  abyss1: "#0a0a0c",
  abyss2: "#0c0c10",
  abyss3: "#101016",
  abyss4: "#16161d",
  line: "#1c1c24",
  violet: "#452a84",
  lavender: "#a9b1f0",
  coral: "#fe6f69",
  cream: "#f5f2ec",
  cream: "#f5f2ec",
  text: "#e8e8e6",
  dim: "#9a9a94",
  faint: "#55554f",
  green: "#00d992",
  warn: "#ffb454",
  info: "#5cb8ff",
  tlR: "#ff5f57",
  tlY: "#febc2e",
  tlG: "#28c840",
};

const WIN_W = 1440;
const WIN_H = 900;
const TITLE_H = 40;
const STATUS_H = 26;
const SIDE_W = 240;
const INSP_W = 300;

const fill = (color, opacity = 1) => [{ fillColor: color, fillOpacity: opacity }];
const stroke = (color, width = 1, opacity = 1) => [
  {
    strokeColor: color,
    strokeWidth: width,
    strokeOpacity: opacity,
    strokeAlignment: "inner",
    strokeStyle: "solid",
  },
];
const rad = (n) => ({ r1: n, r2: n, r3: n, r4: n });

function text(
  ctx,
  name,
  x,
  y,
  width,
  height,
  value,
  { size = "12", weight = "400", color = C.text, family = "Inter", align = "left" } = {},
) {
  const fontId = family === "JetBrains Mono" ? "gfont-jetbrains-mono" : "gfont-inter";
  ctx.addText({
    name,
    x,
    y,
    width,
    height,
    fontId,
    fontFamily: family,
    fontSize: String(size),
    fontWeight: String(weight),
    growType: "fixed",
    content: {
      type: "root",
      verticalAlign: "center",
      children: [
        {
          type: "paragraph-set",
          children: [
            {
              type: "paragraph",
              textAlign: align,
              children: [
                {
                  type: "text",
                  text: value,
                  fontId,
                  fontFamily: family,
                  fontSize: String(size),
                  fontWeight: String(weight),
                  fills: fill(color),
                },
              ],
            },
          ],
        },
      ],
    },
  });
}

function rect(ctx, name, x, y, width, height, extra = {}) {
  ctx.addRect({ name, x, y, width, height, ...extra });
}

function circle(ctx, name, x, y, size, color) {
  ctx.addCircle({ name, x, y, width: size, height: size, fills: fill(color) });
}

function chip(ctx, name, x, y, w, h, label, bg, fg, border) {
  rect(ctx, `${name}/bg`, x, y, w, h, {
    fills: fill(bg),
    ...(border ? { strokes: stroke(border) } : {}),
    ...rad(4),
  });
  text(ctx, `${name}/t`, x, y, w, h, label, {
    size: "10",
    weight: "600",
    color: fg,
    family: "JetBrains Mono",
    align: "center",
  });
}

function logoMark(ctx, ox, oy, size) {
  const u = size / 48;
  rect(ctx, "mark/tile", ox, oy, size, size, { fills: fill(C.cream), ...rad(Math.max(4, 8 * u)) });
  ctx.addPath({
    name: "mark/n",
    fills: fill(C.violet),
    content: [
      { command: "move-to", params: { x: ox + 8 * u, y: oy + 8 * u } },
      { command: "line-to", params: { x: ox + 16 * u, y: oy + 8 * u } },
      { command: "line-to", params: { x: ox + 16 * u, y: oy + 26 * u } },
      { command: "line-to", params: { x: ox + 32 * u, y: oy + 8 * u } },
      { command: "line-to", params: { x: ox + 40 * u, y: oy + 8 * u } },
      { command: "line-to", params: { x: ox + 40 * u, y: oy + 40 * u } },
      { command: "line-to", params: { x: ox + 32 * u, y: oy + 40 * u } },
      { command: "line-to", params: { x: ox + 32 * u, y: oy + 22 * u } },
      { command: "line-to", params: { x: ox + 16 * u, y: oy + 40 * u } },
      { command: "line-to", params: { x: ox + 8 * u, y: oy + 40 * u } },
      { command: "close-path", params: {} },
    ],
  });
  rect(ctx, "mark/w1", ox + 10 * u, oy + 11 * u, 5 * u, 5 * u, { fills: fill("#ffffff") });
  rect(ctx, "mark/w1p", ox + 12 * u, oy + 13 * u, 3 * u, 3 * u, { fills: fill(C.coral) });
  rect(ctx, "mark/w2", ox + 10 * u, oy + 22 * u, 5 * u, 5 * u, { fills: fill("#ffffff") });
  rect(ctx, "mark/w3", ox + 33 * u, oy + 32 * u, 5 * u, 5 * u, { fills: fill("#ffffff") });
  rect(ctx, "mark/w3p", ox + 33 * u, oy + 32 * u, 3 * u, 3 * u, { fills: fill(C.lavender) });
}

function wordmark(ctx, x, y, scale = 1) {
  text(ctx, "wm/nil", x, y, 54 * scale, 22 * scale, "NIL", {
    size: String(Math.round(16 * scale)),
    weight: "700",
    color: C.lavender,
  });
  rect(ctx, "wm/dash", x + 50 * scale, y + 8 * scale, 14 * scale, 5 * scale, {
    fills: fill(C.coral),
    ...rad(2.5 * scale),
  });
}

function pngSize(buf) {
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

async function loadLogos(ctx) {
  const spec = [
    ["nil-icon-gemini.png", "icon"],
    ["nil-wordmark-gemini.png", "wordmarkDark"],
    ["nil-wordmark-gemini-preview.png", "wordmarkLight"],
  ];
  const out = {};
  for (const [file, key] of spec) {
    const buf = await readFile(join(LOGO, file));
    const { width, height } = pngSize(buf);
    out[key] = {
      id: ctx.addFileMedia({ name: file, width, height }, new Blob([buf], { type: "image/png" })),
      width,
      height,
    };
  }
  return out;
}

function imageBox(ctx, name, x, y, w, h, media) {
  rect(ctx, name, x, y, w, h, {
    fills: [{ fillImage: { ...ctx.getMediaAsImage(media.id), keepAspectRatio: true } }],
    ...rad(8),
  });
}

function titlebar(ctx, ox, oy, spaceName) {
  rect(ctx, "tb", ox, oy, WIN_W, TITLE_H, { fills: fill(C.abyss3) });
  rect(ctx, "tb/line", ox, oy + TITLE_H - 1, WIN_W, 1, { fills: fill(C.line) });
  circle(ctx, "tb/r", ox + 14, oy + 15, 10, C.tlR);
  circle(ctx, "tb/y", ox + 30, oy + 15, 10, C.tlY);
  circle(ctx, "tb/g", ox + 46, oy + 15, 10, C.tlG);
  logoMark(ctx, ox + 72, oy + 8, 24);
  wordmark(ctx, ox + 102, oy + 9);
  text(ctx, "tb/space", ox + 186, oy + 10, 260, 20, spaceName, {
    size: "12",
    color: C.dim,
    family: "JetBrains Mono",
  });
  rect(ctx, "tb/search", ox + 980, oy + 8, 200, 24, {
    fills: fill(C.abyss1),
    strokes: stroke(C.line),
    ...rad(6),
  });
  text(ctx, "tb/search/ph", ox + 992, oy + 8, 120, 24, "Search", { size: "11", color: C.faint });
  text(ctx, "tb/search/k", ox + 1130, oy + 8, 44, 24, "⌘K", {
    size: "10",
    weight: "600",
    color: C.dim,
    family: "JetBrains Mono",
    align: "right",
  });
  chip(ctx, "tb/hunt", ox + 1196, oy + 8, 52, 24, "HUNT", C.violet, C.cream, C.violet);
  chip(ctx, "tb/safe", ox + 1256, oy + 8, 52, 24, "SAFE", C.abyss4, C.dim, C.line);
  text(ctx, "tb/win", ox + 1320, oy + 8, 104, 24, "—   □   ×", {
    size: "12",
    color: C.faint,
    align: "right",
  });
}

function statusbar(ctx, ox, oy, line) {
  rect(ctx, "st", ox, oy, WIN_W, STATUS_H, { fills: fill(C.abyss3) });
  rect(ctx, "st/line", ox, oy, WIN_W, 1, { fills: fill(C.line) });
  text(ctx, "st/l", ox + 12, oy, 900, STATUS_H, line, {
    size: "11",
    color: C.dim,
    family: "JetBrains Mono",
  });
  text(ctx, "st/r", ox + 1100, oy, 328, STATUS_H, "localhost:8766   v0.1", {
    size: "11",
    color: C.faint,
    family: "JetBrains Mono",
    align: "right",
  });
}

function navRow(ctx, x, y, w, label, meta, { active = false, live = false } = {}) {
  if (active) {
    rect(ctx, `nav/${label}/bg`, x, y, w, 28, { fills: fill(C.abyss4), ...rad(6) });
    rect(ctx, `nav/${label}/bar`, x, y + 6, 2, 16, { fills: fill(C.lavender) });
  }
  if (live) circle(ctx, `nav/${label}/live`, x + 10, y + 11, 6, C.green);
  text(ctx, `nav/${label}`, x + (live || active ? 22 : 12), y, w - 86, 28, label, {
    size: "12",
    weight: active ? "500" : "400",
    color: active ? C.text : C.dim,
  });
  if (meta) {
    text(ctx, `nav/${label}/m`, x + w - 78, y, 66, 28, meta, {
      size: "10",
      color: C.faint,
      family: "JetBrains Mono",
      align: "right",
    });
  }
}

function sidebar(ctx, ox, oy, empty) {
  const x = ox;
  const y = oy + TITLE_H;
  const h = WIN_H - TITLE_H - STATUS_H;
  rect(ctx, "sb", x, y, SIDE_W, h, { fills: fill(C.abyss1) });
  rect(ctx, "sb/rule", x + SIDE_W - 1, y, 1, h, { fills: fill(C.line) });

  text(ctx, "sb/s", x + 12, y + 12, 120, 16, "SPACES", { size: "10", weight: "600", color: C.faint });
  navRow(ctx, x + 8, y + 32, SIDE_W - 16, "acme-corp", "3 hosts", { active: true });
  navRow(ctx, x + 8, y + 60, SIDE_W - 16, "lab-net", "idle");
  navRow(ctx, x + 8, y + 88, SIDE_W - 16, "+ New space", "");

  text(ctx, "sb/t", x + 12, y + 132, 120, 16, "TARGETS", { size: "10", weight: "600", color: C.faint });
  if (empty) {
    text(ctx, "sb/te", x + 12, y + 154, SIDE_W - 24, 36, "Paste a scope to begin.", {
      size: "12",
      color: C.faint,
    });
  } else {
    navRow(ctx, x + 8, y + 152, SIDE_W - 16, "shop.acme.test", "443", { live: true, active: true });
    navRow(ctx, x + 8, y + 180, SIDE_W - 16, "api.acme.test", "443", { live: true });
    navRow(ctx, x + 8, y + 208, SIDE_W - 16, "10.0.1.0/24", "scan");
  }

  text(ctx, "sb/p", x + 12, y + 256, 120, 16, "PLUGINS", { size: "10", weight: "600", color: C.faint });
  [
    ["nmap", "ready"],
    ["httpx", "ready"],
    ["nuclei", "gated"],
    ["ffuf", "ready"],
  ].forEach(([name, st], i) => navRow(ctx, x + 8, y + 276 + i * 28, SIDE_W - 16, name, st));
}

function typedBlock(ctx, x, y, w, h, kind, title, body, extra) {
  const accent =
    kind === "approval" ? C.coral : kind === "finding" ? C.warn : kind === "tool" ? C.green : C.violet;
  rect(ctx, `${title}/bg`, x, y, w, h, {
    fills: fill(C.abyss2),
    strokes: stroke(kind === "approval" ? C.coral : C.line, kind === "approval" ? 1.5 : 1),
    ...rad(8),
  });
  rect(ctx, `${title}/acc`, x, y + 10, 2, h - 20, { fills: fill(accent) });
  chip(ctx, `${title}/k`, x + 14, y + 10, 78, 18, kind.toUpperCase(), C.abyss4, accent);
  text(ctx, `${title}/h`, x + 98, y + 8, w - 116, 22, title, {
    size: "12",
    weight: "500",
    color: C.text,
  });
  if (body) {
    text(ctx, `${title}/b`, x + 14, y + 34, w - 28, extra ? h - 76 : h - 48, body, {
      size: "12",
      color: C.dim,
      family: kind === "tool" ? "JetBrains Mono" : "Inter",
    });
  }
  extra?.(x, y, w, h);
}

function conversation(ctx, ox, oy) {
  const x = ox + SIDE_W;
  const y = oy + TITLE_H;
  const w = WIN_W - SIDE_W - INSP_W;
  const h = WIN_H - TITLE_H - STATUS_H;
  rect(ctx, "main", x, y, w, h, { fills: fill(C.abyss) });
  text(
    ctx,
    "user",
    x + 24,
    y + 16,
    w - 48,
    36,
    "Enumerate the public surface of shop.acme.test. Stay in recon.",
    { size: "13", color: C.text },
  );
  typedBlock(
    ctx,
    x + 24,
    y + 64,
    w - 48,
    118,
    "plan",
    "Recon pass",
    "1. Resolve hosts and certificates\n2. nmap top ports on confirmed hosts\n3. httpx on open HTTP\n4. nuclei on live URLs — gated",
  );
  typedBlock(
    ctx,
    x + 24,
    y + 194,
    w - 48,
    96,
    "tool",
    "nmap  ·  14s",
    "$ nmap -sV -T4 shop.acme.test\n443/tcp open  ssl/http  nginx 1.24",
  );
  typedBlock(
    ctx,
    x + 24,
    y + 302,
    w - 48,
    132,
    "approval",
    "nuclei — medium+ templates",
    "$ nuclei -u https://shop.acme.test -severity medium,high,critical\nRuns only after you approve. Still sandboxed. Logged.",
    (bx, by, bw) => {
      chip(ctx, "ap/ok", bx + 14, by + 96, 88, 26, "Approve", C.violet, C.cream);
      chip(ctx, "ap/ed", bx + 110, by + 96, 64, 26, "Edit", C.abyss4, C.text, C.line);
      chip(ctx, "ap/no", bx + 182, by + 96, 72, 26, "Reject", C.abyss4, C.coral, C.line);
      text(ctx, "ap/k", bx + bw - 210, by + 96, 196, 26, "⌘↵  ·  ⌘⇧↵", {
        size: "10",
        color: C.faint,
        family: "JetBrains Mono",
        align: "right",
      });
    },
  );
  typedBlock(
    ctx,
    x + 24,
    y + 448,
    w - 48,
    88,
    "finding",
    "TLS 1.0 still offered",
    "shop.acme.test:443 negotiates TLS 1.0. CVSS 5.3 · medium",
  );
  rect(ctx, "comp", x + 24, y + h - 88, w - 48, 72, {
    fills: fill(C.abyss2),
    strokes: stroke(C.line),
    ...rad(10),
  });
  text(ctx, "comp/ph", x + 40, y + h - 80, w - 200, 28, "What should we work on?", {
    size: "13",
    color: C.faint,
  });
  ["HUNT", "CHAT", "CODE", "REPORT"].forEach((m, i) => {
    const on = m === "HUNT";
    chip(
      ctx,
      `mode/${m}`,
      x + 40 + i * 64,
      y + h - 44,
      56,
      20,
      m,
      on ? C.violet : C.abyss4,
      on ? C.cream : C.dim,
    );
  });
}

function emptyMain(ctx, ox, oy) {
  const x = ox + SIDE_W;
  const y = oy + TITLE_H;
  const w = WIN_W - SIDE_W - INSP_W;
  const h = WIN_H - TITLE_H - STATUS_H;
  rect(ctx, "main", x, y, w, h, { fills: fill(C.abyss) });
  logoMark(ctx, x + (w - 64) / 2, y + 160, 64);
  wordmark(ctx, x + (w - 86) / 2, y + 236, 1.2);
  text(ctx, "empty/h", x + 80, y + 280, w - 160, 32, "What should we work on?", {
    size: "20",
    weight: "600",
    color: C.text,
    align: "center",
  });
  text(
    ctx,
    "empty/s",
    x + 80,
    y + 316,
    w - 160,
    24,
    "Name a Space, paste scope, pick a template. Terminal stays the log.",
    { size: "13", color: C.dim, align: "center" },
  );
  rect(ctx, "empty/in", x + 80, y + 360, w - 160, 48, {
    fills: fill(C.abyss2),
    strokes: stroke(C.violet),
    ...rad(10),
  });
  text(ctx, "empty/ph", x + 96, y + 360, w - 280, 48, "Paste IPs, CIDRs, or a hostname…", {
    size: "13",
    color: C.faint,
  });
  const templates = [
    ["Web app", "nmap → httpx → nuclei"],
    ["API", "httpx → whatweb → ffuf"],
    ["Network", "nmap → sslscan"],
    ["Custom", "empty scope"],
  ];
  templates.forEach(([name, desc], i) => {
    const tw = (w - 176) / 2;
    const tx = x + 80 + (i % 2) * (tw + 16);
    const ty = y + 428 + Math.floor(i / 2) * 72;
    rect(ctx, `tpl/${name}`, tx, ty, tw, 60, {
      fills: fill(C.abyss2),
      strokes: stroke(C.line),
      ...rad(8),
    });
    text(ctx, `tpl/${name}/h`, tx + 14, ty + 10, tw - 28, 20, name, {
      size: "13",
      weight: "500",
      color: C.text,
    });
    text(ctx, `tpl/${name}/d`, tx + 14, ty + 32, tw - 28, 18, desc, {
      size: "11",
      color: C.dim,
      family: "JetBrains Mono",
    });
  });
}

function inspector(ctx, ox, oy, empty) {
  const x = ox + WIN_W - INSP_W;
  const y = oy + TITLE_H;
  const h = WIN_H - TITLE_H - STATUS_H;
  rect(ctx, "insp", x, y, INSP_W, h, { fills: fill(C.abyss1) });
  rect(ctx, "insp/rule", x, y, 1, h, { fills: fill(C.line) });
  ["Findings", "Evidence", "Timeline"].forEach((tab, i) => {
    const on = i === 0;
    text(ctx, `insp/${tab}`, x + 16 + i * 88, y + 12, 80, 20, tab, {
      size: "12",
      weight: on ? "600" : "400",
      color: on ? C.text : C.faint,
    });
  });
  rect(ctx, "insp/u", x + 16, y + 34, 64, 2, { fills: fill(C.lavender) });
  rect(ctx, "insp/div", x, y + 40, INSP_W, 1, { fills: fill(C.line) });
  if (empty) {
    text(ctx, "insp/e", x + 16, y + 64, INSP_W - 32, 48, "No findings yet. Approve the first scan.", {
      size: "12",
      color: C.faint,
    });
    return;
  }
  const rows = [
    ["medium", C.warn, "TLS 1.0 offered", "shop:443"],
    ["info", C.info, "nginx 1.24", "shop:443"],
    ["info", C.info, "cert CN mismatch", "api:443"],
  ];
  rows.forEach(([sev, col, title, host], i) => {
    const ry = y + 56 + i * 72;
    rect(ctx, `f/${i}`, x + 12, ry, INSP_W - 24, 64, {
      fills: fill(C.abyss2),
      strokes: stroke(C.line),
      ...rad(8),
    });
    rect(ctx, `f/${i}/b`, x + 12, ry + 8, 3, 48, { fills: fill(col) });
    text(ctx, `f/${i}/s`, x + 24, ry + 8, 80, 16, sev.toUpperCase(), {
      size: "10",
      weight: "600",
      color: col,
      family: "JetBrains Mono",
    });
    text(ctx, `f/${i}/t`, x + 24, ry + 24, INSP_W - 48, 18, title, {
      size: "12",
      weight: "500",
      color: C.text,
    });
    text(ctx, `f/${i}/h`, x + 24, ry + 42, INSP_W - 48, 16, host, {
      size: "11",
      color: C.dim,
      family: "JetBrains Mono",
    });
  });
}

function drawWindow(ctx, ox, oy, variant) {
  rect(ctx, "win", ox, oy, WIN_W, WIN_H, {
    fills: fill(C.abyss),
    strokes: stroke(C.line),
    ...rad(12),
  });
  const empty = variant === "empty";
  titlebar(ctx, ox, oy, empty ? "untitled" : "acme-corp");
  sidebar(ctx, ox, oy, empty);
  if (empty) emptyMain(ctx, ox, oy);
  else conversation(ctx, ox, oy);
  inspector(ctx, ox, oy, empty);
  statusbar(
    ctx,
    ox,
    oy + WIN_H - STATUS_H,
    empty
      ? "nil  ·  host sandbox  ·  no space"
      : "acme-corp  ·  hunt  ·  shop.acme.test  ·  nmap 0 14s  ·  sandbox  ·  SAFE",
  );
}

function paletteOverlay(ctx, ox, oy) {
  rect(ctx, "scrim", ox, oy, WIN_W, WIN_H, { fills: fill("#000000", 0.45) });
  const px = ox + (WIN_W - 560) / 2;
  const py = oy + 140;
  rect(ctx, "pal", px, py, 560, 420, {
    fills: fill(C.abyss2),
    strokes: stroke(C.line),
    ...rad(12),
  });
  rect(ctx, "pal/in", px + 12, py + 12, 536, 36, {
    fills: fill(C.abyss1),
    strokes: stroke(C.violet),
    ...rad(8),
  });
  text(ctx, "pal/ph", px + 24, py + 12, 400, 36, "nmap shop", { size: "14", color: C.text });
  text(ctx, "pal/esc", px + 480, py + 12, 56, 36, "esc", {
    size: "11",
    color: C.faint,
    family: "JetBrains Mono",
    align: "right",
  });
  const items = [
    ["Run plugin", "nmap  ·  shop.acme.test", true],
    ["Switch space", "lab-net", false],
    ["Toggle YOLO", "currently SAFE", false],
    ["Open settings", "⌘,", false],
    ["Focus composer", "⌘T", false],
  ];
  items.forEach(([k, v, on], i) => {
    const iy = py + 60 + i * 40;
    if (on) rect(ctx, `pal/${i}/bg`, px + 12, iy, 536, 36, { fills: fill(C.abyss4), ...rad(6) });
    text(ctx, `pal/${i}/k`, px + 24, iy, 220, 36, k, { size: "13", color: on ? C.text : C.dim });
    text(ctx, `pal/${i}/v`, px + 240, iy, 292, 36, v, {
      size: "12",
      color: C.faint,
      family: "JetBrains Mono",
      align: "right",
    });
  });
  text(ctx, "pal/f", px + 16, py + 380, 528, 24, "↵ run   ⌘↵ approve   esc peel", {
    size: "11",
    color: C.faint,
    family: "JetBrains Mono",
  });
}

function caption(ctx, x, y, title, sub) {
  text(ctx, `cap/${title}`, x, y, 900, 28, title, { size: "18", weight: "600", color: C.cream });
  text(ctx, `cap/${title}/s`, x, y + 28, 980, 20, sub, { size: "12", color: C.dim });
}

function tokenSwatch(ctx, x, y, name, color, hex) {
  rect(ctx, `sw/${name}`, x, y, 72, 72, { fills: fill(color), ...rad(8) });
  text(ctx, `sw/${name}/n`, x, y + 78, 100, 16, name, { size: "11", weight: "500", color: C.text });
  text(ctx, `sw/${name}/h`, x, y + 94, 100, 14, hex, {
    size: "10",
    color: C.dim,
    family: "JetBrains Mono",
  });
}

async function main() {
  const ctx = penpot.createBuildContext({ referer: "nil-desktop-wireframe" });
  ctx.addFile({ name: "NIL Desktop App" });

  [
    ["Abyss", "Surface", C.abyss],
    ["Abyss 1", "Surface", C.abyss1],
    ["Abyss 3", "Surface", C.abyss3],
    ["Violet", "Brand", C.violet],
    ["Lavender", "Brand", C.lavender],
    ["Coral", "Brand", C.coral],
    ["Cream", "Brand", C.cream],
    ["Green", "Data", C.green],
    ["Text", "Type", C.text],
    ["Dim", "Type", C.dim],
  ].forEach(([name, path, color]) => ctx.addLibraryColor({ name, color, opacity: 1, path }));

  const media = await loadLogos(ctx);

  ctx.addPage({ name: "00 Tokens" });
  ctx.addBoard({
    name: "Tokens + lockups",
    x: 0,
    y: 0,
    width: 1440,
    height: 980,
    fills: fill(C.abyss),
  });
  text(ctx, "t/k", 48, 36, 400, 18, "NIL  ·  DESKTOP", {
    size: "11",
    weight: "600",
    color: C.coral,
    family: "JetBrains Mono",
  });
  text(ctx, "t/h", 48, 56, 900, 40, "Design tokens from the gemini mark", {
    size: "28",
    weight: "600",
    color: C.cream,
  });
  text(
    ctx,
    "t/p",
    48,
    100,
    760,
    40,
    "Violet is brand. Coral is the one attention color (approval). Cream is the mark tile. Phosphor green is live machine data only.",
    { size: "13", color: C.dim },
  );
  imageBox(ctx, "logo/icon", 48, 168, 160, 160, media.icon);
  imageBox(ctx, "logo/wm-d", 228, 168, 420, 160, media.wordmarkDark);
  imageBox(ctx, "logo/wm-l", 668, 168, 420, 160, media.wordmarkLight);
  logoMark(ctx, 1112, 200, 96);
  wordmark(ctx, 1220, 236, 1.4);
  [
    ["abyss", C.abyss, "#050507"],
    ["abyss-1", C.abyss1, "#0a0a0c"],
    ["violet", C.violet, "#452a84"],
    ["lavender", C.lavender, "#a9b1f0"],
    ["coral", C.coral, "#fe6f69"],
    ["cream", C.cream, "#f5f2ec"],
    ["green", C.green, "#00d992"],
    ["text", C.text, "#e8e8e6"],
    ["warn", C.warn, "#ffb454"],
    ["info", C.info, "#5cb8ff"],
  ].forEach(([n, c, hex], i) => tokenSwatch(ctx, 48 + i * 136, 360, n, c, hex));
  text(ctx, "t/ty", 48, 500, 400, 24, "Type", { size: "16", weight: "600", color: C.text });
  text(ctx, "t/sans", 48, 536, 500, 28, "Inter  —  chrome, prose, findings", {
    size: "16",
    color: C.text,
  });
  text(ctx, "t/mono", 48, 568, 700, 24, "JetBrains Mono  —  hosts, ports, commands, CVSS", {
    size: "14",
    color: C.dim,
    family: "JetBrains Mono",
  });
  text(
    ctx,
    "t/den",
    48,
    620,
    900,
    90,
    "Density: 28px rows  ·  40px titlebar  ·  26px status  ·  240 / flex / 300 columns\nKeyboard: ⌘K palette  ·  ⌘↵ approve  ·  ⌘⇧↵ reject  ·  esc peels one layer\nNo chat bubbles. No fake metrics. No second WebGL. Approval is the only pulse.",
    { size: "13", color: C.dim },
  );
  ctx.closeBoard();
  ctx.closePage();

  ctx.addPage({ name: "01 Desktop" });
  caption(ctx, 0, -64, "01  Hunt session", "Agent conversation is the work surface. Approval is the only pulse.");
  ctx.addBoard({
    name: "Main window — hunt",
    x: 0,
    y: 0,
    width: WIN_W,
    height: WIN_H,
    fills: fill(C.abyss),
  });
  drawWindow(ctx, 0, 0, "hunt");
  ctx.closeBoard();

  caption(ctx, WIN_W + 80, -64, "02  Empty space", "First run. Composer + templates. No chatbot greeting.");
  ctx.addBoard({
    name: "Main window — empty",
    x: WIN_W + 80,
    y: 0,
    width: WIN_W,
    height: WIN_H,
    fills: fill(C.abyss),
  });
  drawWindow(ctx, WIN_W + 80, 0, "empty");
  ctx.closeBoard();

  caption(ctx, (WIN_W + 80) * 2, -64, "03  Command palette", "Raycast density. Everything is a command.");
  ctx.addBoard({
    name: "Main window — palette",
    x: (WIN_W + 80) * 2,
    y: 0,
    width: WIN_W,
    height: WIN_H,
    fills: fill(C.abyss),
  });
  drawWindow(ctx, (WIN_W + 80) * 2, 0, "hunt");
  paletteOverlay(ctx, (WIN_W + 80) * 2, 0);
  ctx.closeBoard();
  ctx.closePage();

  ctx.addPage({ name: "02 Notes" });
  ctx.addBoard({
    name: "How to read this",
    x: 0,
    y: 0,
    width: 960,
    height: 640,
    fills: fill(C.abyss),
  });
  text(ctx, "n/h", 40, 36, 860, 36, "Simple wireframe — not a component library", {
    size: "22",
    weight: "600",
    color: C.cream,
  });
  text(
    ctx,
    "n/b",
    40,
    88,
    880,
    500,
    "Direction lock for the NIL desktop app (Tauri + SvelteKit), rebuilt after the UI strip.\n\nKeep\n• Abyss surfaces, Inter + JetBrains Mono, 28px rows\n• Spaces / targets / plugins in the left rail\n• Typed blocks: plan, tool, approval, finding — not chat bubbles\n• Coral only on the pending approval (and the wordmark dash)\n• Palette as the OS of the app\n\nKill\n• Chat-home / “Ask anything about your scope”\n• Permanent large chat as the default\n• CSS traffic lights as product UI (native chrome only)\n• Green used as brand (green = live data)\n• Fake dashboards, gradients, idle shadows\n\nNext in Penpot: promote blocks + chips to components, then states (hover, reduced motion).",
    { size: "14", color: C.dim },
  );
  ctx.closeBoard();
  ctx.closePage();

  ctx.closeFile();
  const bytes = await penpot.exportAsBytes(ctx);
  await mkdir(ROOT, { recursive: true });
  await writeFile(OUT, bytes);
  console.log(`wrote ${OUT} (${bytes.length} bytes)`);
}

main().catch((err) => {
  console.error(err);
  if (err.explain) console.error(JSON.stringify(err.explain, null, 2).slice(0, 6000));
  process.exit(1);
});
