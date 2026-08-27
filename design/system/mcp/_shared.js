const C = storage.C || {
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
storage.C = C;

// Penpot lineHeight is a multiplier, not px. 24×32 → 768px-tall glyphs.
const LINE = {
  32: "1.333",
  24: "1.333",
  20: "1.429",
  18: "1.385",
  16: "1.333",
};

function lineHeight(px) {
  if (LINE[px]) return LINE[px];
  const n = Number(px);
  if (n > 4) return (n / 14).toFixed(3);
  return String(px || "1.429");
}

function fill(hex, opacity) {
  return [{ fillColor: hex, fillOpacity: opacity == null ? 1 : opacity }];
}

function stroke(hex, width, opacity) {
  return [
    {
      strokeColor: hex,
      strokeWidth: width == null ? 1 : width,
      strokeOpacity: opacity == null ? 1 : opacity,
      strokeAlignment: "inner",
      strokeStyle: "solid",
    },
  ];
}

function tokenByName(name) {
  for (const set of penpot.library.local.tokens.sets || []) {
    const found = (set.tokens || []).find((t) => t.name === name);
    if (found) return found;
  }
  return null;
}

function applyFill(shape, tokenName) {
  const token = tokenByName(tokenName);
  if (token) {
    try {
      shape.applyToken(token, ["fill"]);
    } catch (e) {}
  }
}

function applyStroke(shape, tokenName) {
  const token = tokenByName(tokenName);
  if (token) {
    try {
      shape.applyToken(token, ["strokeColor"]);
    } catch (e) {}
  }
}

function applyType(shape, tokenName) {
  const token = tokenByName(tokenName);
  if (token) {
    try {
      shape.applyToken(token, ["typography"]);
    } catch (e) {}
  }
}

function applyRadius(shape, tokenName) {
  const token = tokenByName(tokenName);
  if (token) {
    try {
      shape.applyToken(token, [
        "borderRadiusTopLeft",
        "borderRadiusTopRight",
        "borderRadiusBottomRight",
        "borderRadiusBottomLeft",
      ]);
    } catch (e) {}
  }
}

function txt(content, opts) {
  opts = opts || {};
  const node = penpot.createText(content);
  node.growType = opts.grow || "auto-width";
  const fontName = opts.mono ? "JetBrains Mono" : "Inter";
  const font = (penpot.fonts.all || []).find((f) => f.name === fontName);
  const weight = String(opts.weight || "400");
  const variant =
    font &&
    ((font.variants || []).find((v) => String(v.fontWeight) === weight && (v.fontStyle === "normal" || !v.fontStyle)) ||
      (font.variants || []).find((v) => String(v.fontWeight) === weight));
  if (font) {
    node.fontId = font.fontId;
    node.fontFamily = font.fontFamily || font.name;
    if (variant) {
      node.fontVariantId = variant.fontVariantId || variant.id;
      if (variant.fontStyle) node.fontStyle = variant.fontStyle;
      node.fontWeight = variant.fontWeight;
    }
  }
  node.fontSize = String(opts.size || 14);
  node.lineHeight = lineHeight(opts.line || 20);
  node.fills = fill(opts.color || C.textPrimary, opts.opacity);
  if (opts.typeToken) applyType(node, opts.typeToken);
  return node;
}

function flexBoard(name, dir, parent) {
  const board = penpot.createBoard();
  board.name = name;
  (parent || penpot.root).appendChild(board);
  const flex = board.addFlexLayout();
  flex.dir = dir || "row";
  flex.alignItems = "center";
  flex.verticalSizing = "auto";
  flex.horizontalSizing = "auto";
  flex.wrap = "nowrap";
  return board;
}

function findComponent(name, pathNeedle) {
  const comps = penpot.library.local.components || [];
  const needle = pathNeedle || "";
  const exact = comps.find((c) => c.name === name && String(c.path || "") === needle);
  if (exact) return exact;
  const includes = comps.find((c) => c.name === name && String(c.path || "").includes(needle));
  if (includes) return includes;
  const joined = [needle, name].filter(Boolean).join(" / ");
  return comps.find((c) => {
    const full = [c.path, c.name].filter(Boolean).join(" / ");
    return full === joined || full.endsWith(" / " + name) && full.includes(needle);
  });
}

function instanceNamed(name, pathNeedle) {
  const component = findComponent(name, pathNeedle);
  return component ? component.instance() : null;
}

function asComponent(board, name, path) {
  const component = penpot.library.local.createComponent([board]);
  component.name = name;
  if (path) component.path = path;
  const main = component.mainInstance && component.mainInstance();
  if (main) {
    main.x = 2400;
    main.y = 80;
    main.hidden = true;
  }
  return component;
}

function runCreate(name, path, fn) {
  storage._created = storage._created || [];
  storage._errors = storage._errors || [];
  const existing = findComponent(name, path);
  if (existing) {
    storage._created.push({ name, path, action: "exists" });
    return existing;
  }
  try {
    const result = fn();
    storage._created.push({ name, path, action: "created", id: result && result.id });
    return result;
  } catch (e) {
    storage._errors.push({ name, path, error: String((e && e.message) || e) });
    return null;
  }
}

function iconMark(color, parent) {
  const mark = penpot.createRectangle();
  mark.name = "icon";
  mark.resize(14, 14);
  mark.borderRadius = 2;
  mark.fills = fill(color);
  if (parent) parent.appendChild(mark);
  return mark;
}

function styleButton(board, variant, state) {
  const disabled = state === "Disabled";
  const hover = state === "Hover";
  const active = state === "Active";
  board.opacity = disabled ? 0.4 : 1;
  board.borderRadius = 6;
  applyRadius(board, "radius.md");

  if (variant === "Primary") {
    board.fills = fill(C.accentPrimary, hover ? 0.85 : 1);
    applyFill(board, "color.accent.primary");
    board.strokes = active ? stroke(C.borderActive, 1) : [];
  } else if (variant === "Danger") {
    board.fills = fill(C.accentDanger, hover ? 0.85 : 1);
    applyFill(board, "color.accent.danger");
    board.strokes = active ? stroke(C.accentDanger, 1) : [];
  } else if (variant === "Secondary") {
    board.fills = fill(hover || active ? C.surface2 : C.surface1, hover || active ? 1 : 0);
    board.strokes = stroke(active ? C.borderActive : C.borderSubtle, 1);
    applyStroke(board, active ? "color.border.active" : "color.border.subtle");
  } else {
    board.fills = fill(hover || active ? C.surface2 : C.surface1, hover || active ? 1 : 0);
    board.strokes = active ? stroke(C.borderActive, 1) : [];
  }

  const flex = board.flex;
  flex.alignItems = "center";
  flex.justifyContent = "center";
  flex.columnGap = 8;
  if (variant === "Icon") {
    flex.topPadding = 9;
    flex.rightPadding = 9;
    flex.bottomPadding = 9;
    flex.leftPadding = 9;
    board.resize(32, 32);
    flex.horizontalSizing = "fix";
    flex.verticalSizing = "fix";
  } else {
    flex.topPadding = 6;
    flex.rightPadding = 12;
    flex.bottomPadding = 6;
    flex.leftPadding = 12;
    flex.horizontalSizing = "auto";
    flex.verticalSizing = "auto";
  }
}

function makeButton(variant, state) {
  const path = "Button / " + variant;
  const board = flexBoard(state, "row");
  styleButton(board, variant, state);
  const onAccent = variant === "Primary" || variant === "Danger";
  const color = onAccent ? C.surface0 : C.textPrimary;
  if (variant === "Icon") {
    iconMark(onAccent ? C.surface0 : C.textPrimary, board);
  } else {
    const label = txt(variant === "Danger" ? "Delete run" : variant === "Secondary" ? "Cancel" : "Approve", {
      size: 14,
      weight: "600",
      line: 20,
      color,
      typeToken: "type.body-regular",
    });
    label.name = "label";
    board.appendChild(label);
  }
  return asComponent(board, state, path);
}

function makeBadge(state) {
  const map = {
    Idle: { bg: C.surface3, fg: C.textSecondary, label: "Idle" },
    Running: { bg: "#132F4C", fg: C.accentPrimary, label: "Running" },
    Passed: { bg: "#12261E", fg: C.accentSuccess, label: "Passed" },
    Error: { bg: "#3D1618", fg: C.accentDanger, label: "Error" },
  };
  const spec = map[state];
  const board = flexBoard(state, "row");
  board.borderRadius = 9999;
  applyRadius(board, "radius.full");
  board.fills = fill(spec.bg);
  board.flex.topPadding = 2;
  board.flex.bottomPadding = 2;
  board.flex.leftPadding = 8;
  board.flex.rightPadding = 8;
  board.flex.columnGap = 6;
  board.flex.alignItems = "center";
  const dot = penpot.createEllipse();
  dot.name = "dot";
  dot.resize(6, 6);
  dot.fills = fill(spec.fg);
  board.appendChild(dot);
  const label = txt(spec.label, {
    size: 12,
    weight: "400",
    line: 16,
    color: spec.fg,
    mono: true,
    typeToken: "type.body-small",
  });
  label.name = "label";
  board.appendChild(label);
  if (state === "Running") board.strokes = stroke(C.accentPrimary, 1, 0.55);
  return asComponent(board, state, "Badge / Status");
}

function makeUserBubble() {
  const board = flexBoard("UserBubble", "column");
  board.fills = fill(C.surface2);
  applyFill(board, "color.surface.2");
  board.borderRadius = 8;
  applyRadius(board, "radius.lg");
  board.flex.topPadding = 8;
  board.flex.rightPadding = 12;
  board.flex.bottomPadding = 8;
  board.flex.leftPadding = 12;
  board.flex.rowGap = 4;
  board.flex.alignItems = "end";
  board.flex.horizontalSizing = "auto";
  const meta = txt("You · 14:32", {
    size: 12,
    line: 16,
    color: C.textMuted,
    typeToken: "type.body-small",
  });
  meta.name = "meta";
  const body = txt("Scan 10.0.1.0/24 and stream the live nmap output here.", {
    size: 14,
    line: 20,
    color: C.textPrimary,
    typeToken: "type.body-regular",
    grow: "auto-height",
  });
  body.name = "body";
  body.resize(280, 40);
  body.growType = "auto-height";
  board.appendChild(meta);
  board.appendChild(body);
  return asComponent(board, "UserBubble", "Chat");
}

function makeAgentCard() {
  const card = flexBoard("AgentCard", "row");
  card.fills = fill(C.surface1);
  applyFill(card, "color.surface.1");
  card.borderRadius = 8;
  applyRadius(card, "radius.lg");
  card.strokes = stroke(C.borderMuted, 1);
  applyStroke(card, "color.border.muted");
  card.flex.topPadding = 12;
  card.flex.rightPadding = 12;
  card.flex.bottomPadding = 12;
  card.flex.leftPadding = 12;
  card.flex.columnGap = 12;
  card.flex.alignItems = "start";

  const avatar = penpot.createEllipse();
  avatar.name = "avatar";
  avatar.resize(28, 28);
  avatar.fills = fill(C.accentSecondary);
  applyFill(avatar, "color.accent.secondary");
  card.appendChild(avatar);

  const col = flexBoard("content", "column", card);
  col.fills = [];
  col.flex.rowGap = 8;
  col.flex.alignItems = "start";
  col.flex.horizontalSizing = "auto";

  const header = flexBoard("header", "row", col);
  header.fills = [];
  header.flex.columnGap = 8;
  header.flex.alignItems = "center";
  const name = txt("Agent", {
    size: 12,
    weight: "600",
    line: 16,
    color: C.textPrimary,
    typeToken: "type.body-small",
  });
  name.name = "name";
  header.appendChild(name);
  const running = instanceNamed("Running", "Badge / Status");
  if (running) {
    running.name = "status";
    header.appendChild(running);
  }

  const body = txt("Planning the scan, then I’ll stream nmap and parse open ports into the tree.", {
    size: 14,
    line: 20,
    color: C.textPrimary,
    typeToken: "type.body-regular",
    grow: "auto-height",
  });
  body.name = "body";
  body.resize(360, 40);
  body.growType = "auto-height";
  col.appendChild(body);
  return asComponent(card, "AgentCard", "Chat");
}

function makeCodeBlock() {
  const board = flexBoard("CodeBlock", "column");
  board.fills = fill(C.surface0);
  applyFill(board, "color.surface.0");
  board.borderRadius = 8;
  applyRadius(board, "radius.lg");
  board.strokes = stroke(C.borderSubtle, 1);
  applyStroke(board, "color.border.subtle");
  board.flex.alignItems = "stretch";
  board.flex.rowGap = 0;
  board.flex.horizontalSizing = "fix";
  board.resize(420, 80);

  const header = flexBoard("header", "row", board);
  header.fills = fill(C.surface1);
  header.flex.justifyContent = "space-between";
  header.flex.alignItems = "center";
  header.flex.leftPadding = 12;
  header.flex.rightPadding = 8;
  header.flex.topPadding = 6;
  header.flex.bottomPadding = 6;
  header.flex.horizontalSizing = "fill";
  const lang = txt("bash", { size: 12, line: 16, color: C.textMuted, mono: true, typeToken: "type.body-small" });
  lang.name = "lang";
  header.appendChild(lang);
  const copy = flexBoard("copy", "row", header);
  copy.fills = [];
  copy.flex.leftPadding = 8;
  copy.flex.rightPadding = 8;
  copy.flex.topPadding = 4;
  copy.flex.bottomPadding = 4;
  copy.borderRadius = 4;
  applyRadius(copy, "radius.sm");
  copy.strokes = stroke(C.borderSubtle, 1);
  copy.appendChild(txt("Copy", { size: 12, line: 16, color: C.textSecondary, typeToken: "type.body-small" }));

  const body = flexBoard("body", "column", board);
  body.fills = [];
  body.flex.leftPadding = 12;
  body.flex.rightPadding = 12;
  body.flex.topPadding = 8;
  body.flex.bottomPadding = 10;
  body.flex.horizontalSizing = "fill";
  const code = txt("nmap -sV -T4 10.0.1.0/24 -oX /tmp/scan.xml", {
    size: 13,
    line: 18,
    color: C.textCode,
    mono: true,
    typeToken: "type.code-block",
    grow: "auto-height",
  });
  code.name = "code";
  body.appendChild(code);
  board.flex.verticalSizing = "auto";
  return asComponent(board, "CodeBlock", "Chat");
}

function makeStreamLog() {
  const board = flexBoard("StreamLog", "column");
  board.fills = fill(C.surface1);
  applyFill(board, "color.surface.1");
  board.borderRadius = 8;
  applyRadius(board, "radius.lg");
  board.strokes = stroke(C.borderSubtle, 1);
  applyStroke(board, "color.border.subtle");
  board.flex.alignItems = "stretch";
  board.flex.horizontalSizing = "fix";
  board.resize(480, 80);
  board.flex.verticalSizing = "auto";

  const header = flexBoard("header", "row", board);
  header.fills = [];
  header.flex.justifyContent = "space-between";
  header.flex.alignItems = "center";
  header.flex.leftPadding = 12;
  header.flex.rightPadding = 12;
  header.flex.topPadding = 8;
  header.flex.bottomPadding = 8;
  header.flex.horizontalSizing = "fill";
  const left = flexBoard("left", "row", header);
  left.fills = [];
  left.flex.columnGap = 8;
  left.flex.alignItems = "center";
  const chevron = txt("▾", { size: 12, line: 16, color: C.textMuted });
  chevron.name = "chevron";
  left.appendChild(chevron);
  const title = txt("stream.log", { size: 12, weight: "600", line: 16, color: C.textPrimary, mono: true });
  title.name = "title";
  left.appendChild(title);
  const ts = txt("14:32:08", { size: 12, line: 16, color: C.textMuted, mono: true, typeToken: "type.body-small" });
  ts.name = "timestamp";
  header.appendChild(ts);

  const row = flexBoard("line", "row", board);
  row.fills = fill(C.surface0);
  row.flex.columnGap = 8;
  row.flex.alignItems = "center";
  row.flex.leftPadding = 12;
  row.flex.rightPadding = 12;
  row.flex.topPadding = 6;
  row.flex.bottomPadding = 6;
  row.flex.horizontalSizing = "fill";
  const sev = txt("INFO", { size: 12, line: 16, color: C.accentPrimary, mono: true, weight: "600" });
  sev.name = "severity";
  const line = txt("Discovered 4 hosts · streaming stdout", {
    size: 13,
    line: 18,
    color: C.textCode,
    mono: true,
    typeToken: "type.code-block",
  });
  line.name = "code";
  row.appendChild(sev);
  row.appendChild(line);
  return asComponent(board, "StreamLog", "Terminal");
}

function makeFileTreeItem(kind, state) {
  const path = "Terminal / FileTreeItem / " + kind;
  const board = flexBoard(state, "row");
  const active = state === "Active";
  const hover = state === "Hover";
  board.fills = fill(active ? C.surface2 : C.surface1, active || hover ? 1 : 0);
  if (active) applyFill(board, "color.surface.2");
  board.borderRadius = 6;
  applyRadius(board, "radius.md");
  board.flex.alignItems = "center";
  board.flex.columnGap = 8;
  board.flex.leftPadding = 8;
  board.flex.rightPadding = 8;
  board.flex.topPadding = 4;
  board.flex.bottomPadding = 4;
  board.flex.horizontalSizing = "auto";
  board.flex.verticalSizing = "auto";
  if (active) {
    board.strokes = stroke(C.accentPrimary, 1);
    applyStroke(board, "color.border.active");
  }
  const chevron = txt(kind === "Folder" ? "▾" : " ", { size: 12, line: 16, color: C.textMuted });
  chevron.name = "chevron";
  board.appendChild(chevron);
  const icon = penpot.createRectangle();
  icon.name = "icon";
  icon.resize(12, 12);
  icon.borderRadius = 2;
  icon.fills = fill(kind === "Folder" ? C.accentWarning : C.textCode);
  board.appendChild(icon);
  const name = txt(kind === "Folder" ? "src" : "nmap.py", {
    size: 12,
    line: 16,
    color: active ? C.textPrimary : C.textSecondary,
    mono: true,
    typeToken: "type.body-small",
  });
  name.name = "name";
  board.appendChild(name);
  return asComponent(board, state, path);
}
