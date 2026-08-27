function getCatalog() {
  return penpot.library.local.tokens;
}

function getOrCreateSet(name) {
  const catalog = getCatalog();
  const existing = (catalog.sets || []).find((s) => s.name === name);
  if (existing) return existing;
  // Do not set set.active = true: that disables themes. Membership in Theme / Dark is enough.
  return catalog.addSet({ name });
}

function upsertToken(set, type, name, value) {
  const existing = (set.tokens || []).find((t) => t.name === name);
  if (existing) {
    try {
      existing.value = value;
      return { name, type, action: "updated" };
    } catch (e) {
      return { name, type, action: "kept" };
    }
  }
  try {
    set.addToken({ type, name, value });
    return { name, type, action: "created" };
  } catch (e) {
    return { name, type, action: "failed", error: String(e && e.message || e) };
  }
}

const colorSet = getOrCreateSet("Foundation/Color");
const typeSet = getOrCreateSet("Foundation/Typography");
const spaceSet = getOrCreateSet("Foundation/Spacing");
const radiusSet = getOrCreateSet("Foundation/Radius");

const colorTokens = [
  ["color.surface.0", "#0D1117"],
  ["color.surface.1", "#161B22"],
  ["color.surface.2", "#21262D"],
  ["color.surface.3", "#30363D"],
  ["color.border.subtle", "#30363D"],
  ["color.border.active", "#58A6FF"],
  ["color.border.muted", "#21262D"],
  ["color.accent.primary", "#58A6FF"],
  ["color.accent.secondary", "#BC8CFF"],
  ["color.accent.success", "#3FB950"],
  ["color.accent.warning", "#D29922"],
  ["color.accent.danger", "#F85149"],
  ["color.text.primary", "#F0F6FC"],
  ["color.text.secondary", "#8B949E"],
  ["color.text.muted", "#6E7681"],
  ["color.text.code", "#79C0FF"],
  ["color.text.on-accent", "#0D1117"],
];

const results = [];
for (const [name, value] of colorTokens) {
  results.push(upsertToken(colorSet, "color", name, value));
}

results.push(upsertToken(typeSet, "fontFamilies", "font.sans", "Inter"));
results.push(upsertToken(typeSet, "fontFamilies", "font.mono", "JetBrains Mono"));
results.push(upsertToken(typeSet, "fontWeights", "font.weight.regular", "Regular"));
results.push(upsertToken(typeSet, "fontWeights", "font.weight.semibold", "SemiBold"));
results.push(upsertToken(typeSet, "fontWeights", "font.weight.bold", "Bold"));
results.push(upsertToken(typeSet, "fontSizes", "font.size.display", "24"));
results.push(upsertToken(typeSet, "fontSizes", "font.size.heading", "18"));
results.push(upsertToken(typeSet, "fontSizes", "font.size.body", "14"));
results.push(upsertToken(typeSet, "fontSizes", "font.size.code", "13"));
results.push(upsertToken(typeSet, "fontSizes", "font.size.small", "12"));
results.push(upsertToken(typeSet, "number", "font.line.display", "32"));
results.push(upsertToken(typeSet, "number", "font.line.heading", "24"));
results.push(upsertToken(typeSet, "number", "font.line.body", "20"));
results.push(upsertToken(typeSet, "number", "font.line.code", "18"));
results.push(upsertToken(typeSet, "number", "font.line.small", "16"));

const typeSpecs = [
  ["type.display", "Inter", "Bold", "24", "1.333"],
  ["type.heading", "Inter", "SemiBold", "18", "1.333"],
  ["type.body-regular", "Inter", "Regular", "14", "1.429"],
  ["type.body-small", "Inter", "Regular", "12", "1.333"],
  ["type.code-block", "JetBrains Mono", "Regular", "13", "1.385"],
];
for (const [name, family, weight, size, line] of typeSpecs) {
  results.push(
    upsertToken(typeSet, "typography", name, {
      fontFamilies: family,
      fontWeight: weight,
      fontSizes: size,
      lineHeight: line,
      letterSpacing: "0",
      textCase: "none",
      textDecoration: "none",
    }),
  );
}

for (const [name, value] of [
  ["space.4", "4"],
  ["space.8", "8"],
  ["space.12", "12"],
  ["space.16", "16"],
  ["space.24", "24"],
  ["space.32", "32"],
]) {
  results.push(upsertToken(spaceSet, "spacing", name, value));
}

for (const [name, value] of [
  ["radius.sm", "4"],
  ["radius.md", "6"],
  ["radius.lg", "8"],
  ["radius.full", "9999"],
]) {
  results.push(upsertToken(radiusSet, "borderRadius", name, value));
}

const catalog = getCatalog();
let theme = (catalog.themes || []).find((t) => t.name === "Dark" && t.group === "Theme");
if (!theme) {
  theme = catalog.addTheme({ group: "Theme", name: "Dark" });
}
for (const set of [colorSet, typeSet, spaceSet, radiusSet]) {
  try {
    theme.addSet(set);
  } catch (e) {
    /* already present */
  }
}
if (!theme.active) theme.toggleActive();

storage.tokenIndex = {};
for (const set of catalog.sets || []) {
  for (const token of set.tokens || []) {
    storage.tokenIndex[token.name] = token.id;
  }
}

return {
  file: penpot.currentFile && penpot.currentFile.name,
  page: penpot.currentPage && penpot.currentPage.name,
  created: results.filter((r) => r.action === "created").length,
  updated: results.filter((r) => r.action === "updated").length,
  total: results.length,
  sets: (catalog.sets || []).map((s) => ({ name: s.name, active: s.active, count: (s.tokens || []).length })),
  themes: (catalog.themes || []).map((t) => ({ name: t.name, group: t.group, active: t.active })),
};
