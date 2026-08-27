const lib = penpot.library.local;
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

const colorDefs = [
  ["Surface-0", "Surface", C.surface0],
  ["Surface-1", "Surface", C.surface1],
  ["Surface-2", "Surface", C.surface2],
  ["Surface-3", "Surface", C.surface3],
  ["Border-subtle", "Border", C.borderSubtle],
  ["Border-active", "Border", C.borderActive],
  ["Border-muted", "Border", C.borderMuted],
  ["Accent-primary", "Accent", C.accentPrimary],
  ["Accent-secondary", "Accent", C.accentSecondary],
  ["Accent-success", "Accent", C.accentSuccess],
  ["Accent-warning", "Accent", C.accentWarning],
  ["Accent-danger", "Accent", C.accentDanger],
  ["Text-primary", "Text", C.textPrimary],
  ["Text-secondary", "Text", C.textSecondary],
  ["Text-muted", "Text", C.textMuted],
  ["Text-code", "Text", C.textCode],
];

function upsertColor(name, path, hex) {
  let color = (lib.colors || []).find((c) => c.name === name && c.path === path);
  if (!color) {
    color = lib.createColor();
    color.name = name;
    color.path = path;
  }
  color.color = hex;
  color.opacity = 1;
  return { name: path + "/" + name, hex };
}

const colors = colorDefs.map(([name, path, hex]) => upsertColor(name, path, hex));

function fontNamed(name) {
  return (penpot.fonts.all || []).find((f) => f.name === name) || penpot.fonts.findByName(name);
}

const inter = fontNamed("Inter");
const mono = fontNamed("JetBrains Mono");

function variantFor(font, weight) {
  if (!font || !font.variants) return undefined;
  const w = String(weight);
  return (
    font.variants.find((v) => String(v.fontWeight) === w && (v.fontStyle === "normal" || !v.fontStyle)) ||
    font.variants.find((v) => String(v.fontWeight) === w)
  );
}

const typeDefs = [
  ["Display", "Type", inter, "700", "24", "1.333"],
  ["Heading", "Type", inter, "600", "18", "1.333"],
  ["Body-Regular", "Type", inter, "400", "14", "1.429"],
  ["Body-Small", "Type", inter, "400", "12", "1.333"],
  ["Code-Block", "Type", mono, "400", "13", "1.385"],
];

function upsertTypography(name, path, font, weight, size, lineHeight) {
  let typo = (lib.typographies || []).find((t) => t.name === name && t.path === path);
  if (!typo) typo = lib.createTypography();
  typo.name = name;
  typo.path = path;
  const variant = variantFor(font, weight);
  if (font && typeof typo.setFont === "function") {
    try {
      typo.setFont(font, variant);
    } catch (e) {
      typo.fontId = font.fontId;
      if (variant) typo.fontVariantId = variant.fontVariantId || variant.id;
    }
  } else if (font) {
    typo.fontId = font.fontId;
    if (variant) {
      typo.fontVariantId = variant.fontVariantId || variant.id;
      if (variant.fontStyle) typo.fontStyle = variant.fontStyle;
    }
  }
  typo.fontSize = String(size);
  typo.lineHeight = String(lineHeight);
  typo.letterSpacing = "0";
  return {
    name: path + "/" + name,
    size: typo.fontSize,
    weight: typo.fontWeight,
    lineHeight: typo.lineHeight,
    font: typo.fontId,
  };
}

const typographies = [];
for (const d of typeDefs) {
  try {
    typographies.push(upsertTypography(...d));
  } catch (e) {
    typographies.push({ name: d[0], error: String(e && e.message || e) });
  }
}

for (const typo of [...(lib.typographies || [])]) {
  if (typo.name === "Typography" && (!typo.path || typo.path === "")) {
    try { typo.remove(); } catch (e) {}
  }
}

storage.C = C;
storage.interName = inter && inter.name;
storage.monoName = mono && mono.name;
storage.interId = inter && inter.fontId;
storage.monoId = mono && mono.fontId;

return {
  colors,
  typographies,
  fonts: {
    inter: inter && { name: inter.name, variants: (inter.variants || []).map((v) => v.fontWeight) },
    mono: mono && { name: mono.name, variants: (mono.variants || []).map((v) => v.fontWeight) },
  },
};
