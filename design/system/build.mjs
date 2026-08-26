/**
 * Builds Workspace-Design-System.penpot — visual inventory of the token board.
 * Native tokens still come from tokens.json import (or mcp_apply.py).
 */
import * as penpot from "@penpot/library";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(fileURLToPath(import.meta.url));
const OUT = join(ROOT, "Workspace-Design-System.penpot");

const C = {
  surface0: "#0D1117",
  surface1: "#161B22",
  surface2: "#21262D",
  surface3: "#30363D",
  borderSubtle: "#30363D",
  borderActive: "#58A6FF",
  borderMuted: "#21262D",
  accentPrimary: "#58A6FF",
  accentSecondary: "#BC8CFF",
  accentSuccess: "#3FB950",
  accentWarning: "#D29922",
  accentDanger: "#F85149",
  textPrimary: "#F0F6FC",
  textSecondary: "#8B949E",
  textMuted: "#6E7681",
  textCode: "#79C0FF",
};

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

function text(ctx, name, x, y, width, height, value, opts = {}) {
  const family = opts.family || "Inter";
  const fontId = family === "JetBrains Mono" ? "gfont-jetbrains-mono" : "gfont-inter";
  ctx.addText({
    name,
    x,
    y,
    width,
    height,
    fontId,
    fontFamily: family,
    fontSize: String(opts.size || 14),
    fontWeight: String(opts.weight || "400"),
    growType: "fixed",
    content: {
      type: "root",
      verticalAlign: opts.vAlign || "center",
      children: [
        {
          type: "paragraph-set",
          children: [
            {
              type: "paragraph",
              textAlign: opts.align || "left",
              children: [
                {
                  type: "text",
                  text: value,
                  fontId,
                  fontFamily: family,
                  fontSize: String(opts.size || 14),
                  fontWeight: String(opts.weight || "400"),
                  fills: fill(opts.color || C.textPrimary),
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

function btn(ctx, prefix, x, y, label, bg, fg, border, w = 96) {
  rect(ctx, `${prefix}/bg`, x, y, w, 32, {
    fills: fill(bg, bg === "transparent" ? 0 : 1),
    ...(border ? { strokes: stroke(border) } : {}),
    ...rad(6),
  });
  text(ctx, `${prefix}/t`, x, y, w, 32, label, {
    size: "14",
    weight: "600",
    color: fg,
    align: "center",
  });
}

function badge(ctx, prefix, x, y, label, bg, fg, pulse) {
  rect(ctx, `${prefix}/bg`, x, y, 88, 20, {
    fills: fill(bg),
    ...(pulse ? { strokes: stroke(fg, 1, 0.55) } : {}),
    ...rad(999),
  });
  ctx.addCircle({ name: `${prefix}/dot`, x: x + 8, y: y + 7, width: 6, height: 6, fills: fill(fg) });
  text(ctx, `${prefix}/t`, x + 18, y, 64, 20, label, {
    size: "12",
    family: "JetBrains Mono",
    color: fg,
  });
}

async function main() {
  const ctx = penpot.createBuildContext();
  ctx.addFile({ name: "Workspace Design System" });
  ctx.addPage({ name: "Design System / Tokens" });

  const W = 1280;
  const H = 1980;
  ctx.addBoard({
    name: "Design System / Tokens",
    x: 0,
    y: 0,
    width: W,
    height: H,
    fills: fill(C.surface0),
  });

  text(ctx, "h1", 32, 32, 900, 32, "Design System / Tokens", { size: "24", weight: "700" });
  text(ctx, "h1s", 32, 68, 1000, 20, "Autonomous AI developer workspace · dark theme foundation", {
    size: "14",
    color: C.textSecondary,
  });
  text(
    ctx,
    "h1m",
    32,
    92,
    1100,
    16,
    "Sets  Foundation/Color  ·  Foundation/Typography  ·  Foundation/Spacing  ·  Foundation/Radius    Theme  Dark",
    { size: "12", color: C.textMuted, family: "JetBrains Mono" },
  );

  text(ctx, "c/h", 32, 140, 400, 24, "01  Color palette", { size: "18", weight: "600" });
  const swatches = [
    ["Surface-0", C.surface0],
    ["Surface-1", C.surface1],
    ["Surface-2", C.surface2],
    ["Surface-3", C.surface3],
    ["Border-subtle", C.borderSubtle],
    ["Border-active", C.borderActive],
    ["Accent-primary", C.accentPrimary],
    ["Accent-secondary", C.accentSecondary],
    ["Accent-success", C.accentSuccess],
    ["Accent-warning", C.accentWarning],
    ["Accent-danger", C.accentDanger],
    ["Text-primary", C.textPrimary],
    ["Text-secondary", C.textSecondary],
    ["Text-muted", C.textMuted],
    ["Text-code", C.textCode],
  ];
  swatches.forEach(([name, hex], i) => {
    const x = 32 + (i % 8) * 150;
    const y = 176 + Math.floor(i / 8) * 88;
    rect(ctx, `sw/${name}`, x, y, 72, 48, { fills: fill(hex), ...rad(6), strokes: stroke(C.borderMuted) });
    text(ctx, `sw/${name}/n`, x, y + 52, 140, 16, name, { size: "12" });
    text(ctx, `sw/${name}/h`, x, y + 68, 140, 16, hex, { size: "12", color: C.textMuted, family: "JetBrains Mono" });
  });

  text(ctx, "t/h", 32, 368, 400, 24, "02  Typography scale", { size: "18", weight: "600" });
  text(ctx, "t/d", 32, 404, 900, 32, "The agent is the interface.", { size: "24", weight: "700" });
  text(ctx, "t/hd", 32, 440, 900, 24, "Live terminal · file tree · chat", { size: "18", weight: "600" });
  text(ctx, "t/b", 32, 472, 900, 20, "Inter 14 / 20 — prose, buttons, chat copy.", { size: "14" });
  text(ctx, "t/s", 32, 496, 900, 16, "12 / 16 metadata · timestamps · badges", {
    size: "12",
    color: C.textMuted,
  });
  text(ctx, "t/c", 32, 516, 900, 18, "nmap -sV -T4 10.0.1.0/24", {
    size: "13",
    family: "JetBrains Mono",
    color: C.textCode,
  });

  text(ctx, "sp/h", 32, 560, 400, 24, "03  Spacing + radius", { size: "18", weight: "600" });
  [4, 8, 12, 16, 24, 32].forEach((n, i) => {
    const x = 32 + i * 88;
    rect(ctx, `sp/${n}`, x, 596, n, 16, { fills: fill(C.accentPrimary) });
    text(ctx, `sp/${n}/l`, x, 616, 80, 16, `space.${n}`, {
      size: "12",
      color: C.textMuted,
      family: "JetBrains Mono",
    });
  });
  [
    ["sm", 4],
    ["md", 6],
    ["lg", 8],
    ["full", 20],
  ].forEach(([name, r], i) => {
    const x = 32 + i * 72;
    rect(ctx, `rd/${name}`, x, 648, 40, 40, { fills: fill(C.surface2), ...rad(r) });
    text(ctx, `rd/${name}/l`, x, 692, 64, 16, `radius.${name}`, {
      size: "12",
      color: C.textMuted,
      family: "JetBrains Mono",
    });
  });

  text(ctx, "b/h", 32, 732, 400, 24, "04  Buttons", { size: "18", weight: "600" });
  btn(ctx, "bp/d", 32, 768, "Approve", C.accentPrimary, C.surface0);
  btn(ctx, "bp/h", 140, 768, "Approve", C.accentPrimary, C.surface0);
  btn(ctx, "bp/a", 248, 768, "Approve", C.accentPrimary, C.surface0, C.borderActive);
  btn(ctx, "bp/x", 356, 768, "Approve", C.accentPrimary, C.surface0);
  btn(ctx, "bs/d", 32, 816, "Cancel", C.surface1, C.textPrimary, C.borderSubtle);
  btn(ctx, "bd/d", 140, 816, "Delete run", C.accentDanger, C.surface0, null, 112);
  btn(ctx, "bi/d", 268, 816, "▣", C.surface1, C.textPrimary, C.borderSubtle, 32);

  text(ctx, "m/h", 32, 872, 500, 24, "05  Message bubbles", { size: "18", weight: "600" });
  rect(ctx, "agent", 32, 908, 420, 108, {
    fills: fill(C.surface1),
    strokes: stroke(C.borderMuted),
    ...rad(8),
  });
  ctx.addCircle({ name: "agent/av", x: 44, y: 920, width: 28, height: 28, fills: fill(C.accentSecondary) });
  text(ctx, "agent/n", 84, 920, 60, 16, "Agent", { size: "12", weight: "600" });
  badge(ctx, "agent/b", 140, 918, "Running", "#132F4C", C.accentPrimary, true);
  text(
    ctx,
    "agent/p",
    84,
    944,
    350,
    56,
    "Planning the scan, then I’ll stream nmap and parse open ports into the tree.",
    { size: "14", vAlign: "top" },
  );

  rect(ctx, "code", 468, 908, 380, 108, { fills: fill(C.surface0), strokes: stroke(C.borderSubtle), ...rad(8) });
  rect(ctx, "code/h", 468, 908, 380, 28, { fills: fill(C.surface1) });
  text(ctx, "code/lang", 480, 908, 80, 28, "bash", {
    size: "12",
    color: C.textMuted,
    family: "JetBrains Mono",
  });
  text(ctx, "code/copy", 780, 908, 56, 28, "Copy", { size: "12", color: C.textSecondary });
  text(ctx, "code/b", 480, 944, 350, 56, "nmap -sV -T4 10.0.1.0/24 -oX /tmp/scan.xml", {
    size: "13",
    family: "JetBrains Mono",
    color: C.textCode,
    vAlign: "top",
  });

  rect(ctx, "user", 868, 908, 380, 88, { fills: fill(C.surface2), ...rad(8) });
  text(ctx, "user/m", 880, 916, 200, 16, "You · 14:32", { size: "12", color: C.textMuted });
  text(ctx, "user/b", 880, 936, 350, 48, "Scan 10.0.1.0/24 and stream the live nmap output here.", {
    size: "14",
    vAlign: "top",
  });

  text(ctx, "st/h", 32, 1044, 500, 24, "06  Status & execution badges", { size: "18", weight: "600" });
  badge(ctx, "st/i", 32, 1080, "Idle", C.surface3, C.textSecondary);
  badge(ctx, "st/r", 132, 1080, "Running", "#132F4C", C.accentPrimary, true);
  badge(ctx, "st/p", 232, 1080, "Passed", "#12261E", C.accentSuccess);
  badge(ctx, "st/e", 332, 1080, "Error", "#3D1618", C.accentDanger);

  text(ctx, "tm/h", 32, 1132, 500, 24, "07  Terminal & file tree", { size: "18", weight: "600" });
  rect(ctx, "log", 32, 1168, 480, 88, { fills: fill(C.surface1), strokes: stroke(C.borderSubtle), ...rad(8) });
  text(ctx, "log/t", 44, 1176, 200, 16, "▾  stream.log", {
    size: "12",
    weight: "600",
    family: "JetBrains Mono",
  });
  text(ctx, "log/ts", 400, 1176, 100, 16, "14:32:08", {
    size: "12",
    color: C.textMuted,
    family: "JetBrains Mono",
    align: "right",
  });
  rect(ctx, "log/l", 32, 1200, 480, 56, { fills: fill(C.surface0) });
  text(ctx, "log/sev", 44, 1216, 48, 18, "INFO", {
    size: "12",
    weight: "600",
    family: "JetBrains Mono",
    color: C.accentPrimary,
  });
  text(ctx, "log/c", 96, 1216, 400, 18, "Discovered 4 hosts · streaming stdout", {
    size: "13",
    family: "JetBrains Mono",
    color: C.textCode,
  });

  const files = [
    ["Folder / Default", false],
    ["Folder / Hover", true],
    ["Folder / Active", "active"],
    ["File / Default", false],
    ["File / Hover", true],
    ["File / Active", "active"],
  ];
  files.forEach(([label, state], i) => {
    const y = 1272 + i * 32;
    rect(ctx, `ft/${i}`, 540, y, 280, 28, {
      fills: fill(state ? C.surface2 : C.surface1, state ? 1 : 0),
      ...(state === "active" ? { strokes: stroke(C.accentPrimary) } : {}),
      ...rad(6),
    });
    text(ctx, `ft/${i}/t`, 552, y, 250, 28, label, {
      size: "12",
      family: "JetBrains Mono",
      color: state === "active" ? C.textPrimary : C.textSecondary,
    });
  });

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
  process.exit(1);
});
