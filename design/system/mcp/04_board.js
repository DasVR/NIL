function makeSection(parent, name) {
  const section = penpot.createBoard();
  section.name = name;
  parent.appendChild(section);
  const flex = section.addFlexLayout();
  flex.dir = "column";
  flex.alignItems = "start";
  flex.rowGap = 12;
  flex.verticalSizing = "auto";
  flex.horizontalSizing = "fill";
  section.fills = [];
  return section;
}

function makeRow(parent, name, gap) {
  const row = penpot.createBoard();
  row.name = name;
  parent.appendChild(row);
  const flex = row.addFlexLayout();
  flex.dir = "row";
  flex.alignItems = "center";
  flex.columnGap = gap == null ? 16 : gap;
  flex.wrap = "wrap";
  flex.verticalSizing = "auto";
  flex.horizontalSizing = "fill";
  row.fills = [];
  return row;
}

const existing = (penpot.root.children || []).find((s) => s.name === "Design System / Tokens");
if (existing) existing.remove();

const board = penpot.createBoard();
board.name = "Design System / Tokens";
penpot.root.insertChild(0, board);
board.x = 0;
board.y = 0;
board.resize(1280, 800);
const flex = board.addFlexLayout();
flex.dir = "column";
flex.alignItems = "stretch";
flex.rowGap = 32;
flex.topPadding = 32;
flex.rightPadding = 32;
flex.bottomPadding = 40;
flex.leftPadding = 32;
flex.verticalSizing = "auto";
flex.horizontalSizing = "fix";
board.fills = fill(C.surface0);
applyFill(board, "color.surface.0");

const header = makeSection(board, "Header");
header.appendChild(txt("Design System / Tokens", { size: 24, weight: "700", line: 32, typeToken: "type.display" }));
header.appendChild(
  txt("Autonomous AI developer workspace · dark theme foundation", {
    size: 14,
    line: 20,
    color: C.textSecondary,
    typeToken: "type.body-regular",
  }),
);
header.appendChild(
  txt("Sets  Foundation/Color  ·  Foundation/Typography  ·  Foundation/Spacing  ·  Foundation/Radius   Theme  Dark", {
    size: 12,
    line: 16,
    color: C.textMuted,
    mono: true,
    typeToken: "type.body-small",
  }),
);

function swatch(parent, name, hex, tokenName) {
  const cell = penpot.createBoard();
  cell.name = name;
  parent.appendChild(cell);
  const f = cell.addFlexLayout();
  f.dir = "column";
  f.rowGap = 8;
  f.alignItems = "start";
  f.verticalSizing = "auto";
  f.horizontalSizing = "auto";
  cell.fills = [];
  const chip = penpot.createRectangle();
  chip.name = "chip";
  chip.resize(72, 48);
  chip.borderRadius = 6;
  chip.fills = fill(hex);
  applyFill(chip, tokenName);
  cell.appendChild(chip);
  const label = txt(name, { size: 12, line: 16, color: C.textPrimary, typeToken: "type.body-small" });
  label.name = "name";
  cell.appendChild(label);
  const meta = txt(hex, { size: 12, line: 16, color: C.textMuted, mono: true, typeToken: "type.body-small" });
  meta.name = "hex";
  cell.appendChild(meta);
}

const colors = makeSection(board, "01 Color");
colors.appendChild(txt("01  Color palette", { size: 18, weight: "600", line: 24, typeToken: "type.heading" }));
const colorRow = makeRow(colors, "swatches", 16);
const colorTokens = [
  ["Surface-0", "#0D1117", "color.surface.0"],
  ["Surface-1", "#161B22", "color.surface.1"],
  ["Surface-2", "#21262D", "color.surface.2"],
  ["Surface-3", "#30363D", "color.surface.3"],
  ["Border-subtle", "#30363D", "color.border.subtle"],
  ["Border-active", "#58A6FF", "color.border.active"],
  ["Border-muted", "#21262D", "color.border.muted"],
  ["Accent-primary", "#58A6FF", "color.accent.primary"],
  ["Accent-secondary", "#BC8CFF", "color.accent.secondary"],
  ["Accent-success", "#3FB950", "color.accent.success"],
  ["Accent-warning", "#D29922", "color.accent.warning"],
  ["Accent-danger", "#F85149", "color.accent.danger"],
  ["Text-primary", "#F0F6FC", "color.text.primary"],
  ["Text-secondary", "#8B949E", "color.text.secondary"],
  ["Text-muted", "#6E7681", "color.text.muted"],
  ["Text-code", "#79C0FF", "color.text.code"],
];
for (const [name, hex, token] of colorTokens) swatch(colorRow, name, hex, token);

const type = makeSection(board, "02 Typography");
type.appendChild(txt("02  Typography scale", { size: 18, weight: "600", line: 24, typeToken: "type.heading" }));
const specimens = [
  ["Display", "The agent is the interface.", 24, "700", 32, "type.display", false],
  ["Heading", "Live terminal · file tree · chat", 18, "600", 24, "type.heading", false],
  ["Body-Regular", "Inter 14 / 20 — prose, buttons, chat copy.", 14, "400", 20, "type.body-regular", false],
  ["Body-Small", "12 / 16 metadata · timestamps · badges", 12, "400", 16, "type.body-small", false],
  ["Code-Block", "nmap -sV -T4 10.0.1.0/24", 13, "400", 18, "type.code-block", true],
];
for (const [name, sample, size, weight, line, token, mono] of specimens) {
  const row = makeRow(type, name, 16);
  const kicker = txt(name, { size: 12, line: 16, color: C.textMuted, mono: true, typeToken: "type.body-small" });
  kicker.resize(140, 16);
  kicker.growType = "fixed";
  row.appendChild(kicker);
  row.appendChild(txt(sample, { size, weight, line, typeToken: token, mono }));
}

const metrics = makeSection(board, "03 Space + Radius");
metrics.appendChild(txt("03  Spacing + radius", { size: 18, weight: "600", line: 24, typeToken: "type.heading" }));
const spaceRow = makeRow(metrics, "space", 12);
for (const n of [4, 8, 12, 16, 24, 32]) {
  const cell = penpot.createBoard();
  cell.name = "space." + n;
  spaceRow.appendChild(cell);
  const f = cell.addFlexLayout();
  f.dir = "column";
  f.rowGap = 6;
  f.verticalSizing = "auto";
  cell.fills = [];
  const bar = penpot.createRectangle();
  bar.resize(n, 16);
  bar.fills = fill("#58A6FF");
  cell.appendChild(bar);
  cell.appendChild(txt("space." + n, { size: 12, line: 16, color: C.textMuted, mono: true }));
}
const radiusRow = makeRow(metrics, "radius", 16);
for (const [name, r] of [
  ["radius.sm", 4],
  ["radius.md", 6],
  ["radius.lg", 8],
  ["radius.full", 9999],
]) {
  const cell = penpot.createBoard();
  cell.name = name;
  radiusRow.appendChild(cell);
  const f = cell.addFlexLayout();
  f.dir = "column";
  f.rowGap = 6;
  f.alignItems = "center";
  cell.fills = [];
  const tile = penpot.createRectangle();
  tile.resize(40, 40);
  tile.borderRadius = Math.min(r, 20);
  tile.fills = fill(C.surface2);
  cell.appendChild(tile);
  cell.appendChild(txt(name, { size: 12, line: 16, color: C.textMuted, mono: true }));
}

function place(row, name, path, label) {
  const inst = instanceNamed(name, path);
  if (!inst) return false;
  inst.name = label || name;
  row.appendChild(inst);
  return true;
}

const missing = [];
const buttons = makeSection(board, "04 Buttons");
buttons.appendChild(txt("04  Buttons", { size: 18, weight: "600", line: 24, typeToken: "type.heading" }));
buttons.appendChild(
  txt("Variant × State  ·  Primary / Secondary / Danger / Icon-only", {
    size: 12,
    line: 16,
    color: C.textMuted,
  }),
);
for (const variant of ["Primary", "Secondary", "Danger", "Icon"]) {
  const row = makeRow(buttons, variant, 12);
  const kicker = txt(variant, { size: 12, line: 16, color: C.textSecondary, mono: true });
  kicker.resize(88, 16);
  kicker.growType = "fixed";
  row.appendChild(kicker);
  for (const state of ["Default", "Hover", "Active", "Disabled"]) {
    if (!place(row, state, "Button / " + variant, state)) missing.push("Button / " + variant + " / " + state);
  }
}

const chat = makeSection(board, "05 Chat");
chat.appendChild(txt("05  Message bubbles", { size: 18, weight: "600", line: 24, typeToken: "type.heading" }));
const chatRow = makeRow(chat, "bubbles", 24);
for (const name of ["AgentCard", "CodeBlock", "UserBubble"]) {
  if (!place(chatRow, name, "Chat", name)) missing.push("Chat / " + name);
}

const badges = makeSection(board, "06 Status");
badges.appendChild(txt("06  Status & execution badges", { size: 18, weight: "600", line: 24, typeToken: "type.heading" }));
const badgeRow = makeRow(badges, "instances", 12);
for (const state of ["Idle", "Running", "Passed", "Error"]) {
  if (!place(badgeRow, state, "Badge / Status", state)) missing.push("Badge / Status / " + state);
}

const terminal = makeSection(board, "07 Terminal");
terminal.appendChild(txt("07  Terminal & file tree", { size: 18, weight: "600", line: 24, typeToken: "type.heading" }));
if (!place(terminal, "StreamLog", "Terminal", "StreamLog")) missing.push("Terminal / StreamLog");
const tree = makeRow(terminal, "tree", 8);
for (const [kind, state] of [
  ["Folder", "Default"],
  ["Folder", "Hover"],
  ["Folder", "Active"],
  ["File", "Default"],
  ["File", "Hover"],
  ["File", "Active"],
]) {
  const path = "Terminal / FileTreeItem / " + kind;
  if (!place(tree, state, path, kind + "/" + state)) missing.push(path + " / " + state);
}

storage.boardId = board.id;
return {
  board: { id: board.id, name: board.name, width: board.width, height: Math.round(board.height) },
  children: (board.children || []).map((c) => c.name),
  missing,
};
