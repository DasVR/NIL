const FAMILIES = ["Button", "Badge", "Chat", "Terminal"];
const removed = { components: [], roots: [], board: false };

const comps = [...(penpot.library.local.components || [])];
for (const component of comps) {
  const full = [component.path, component.name].filter(Boolean).join(" / ");
  if (!FAMILIES.some((family) => full.includes(family))) continue;
  try {
    const main = component.mainInstance && component.mainInstance();
    if (main) main.remove();
    else if (typeof component.remove === "function") component.remove();
    removed.components.push(full);
  } catch (e) {
    removed.components.push(full + ":" + String((e && e.message) || e));
  }
}

const board = (penpot.root.children || []).find((s) => s.name === "Design System / Tokens");
if (board) {
  board.remove();
  removed.board = true;
}

for (const shape of [...(penpot.root.children || [])]) {
  const name = shape.name || "";
  const hit =
    shape.x >= 2300 ||
    FAMILIES.some((family) => name.includes(family)) ||
    name === "Text";
  if (!hit) continue;
  try {
    shape.remove();
    removed.roots.push(name);
  } catch (e) {}
}

return {
  file: penpot.currentFile && penpot.currentFile.name,
  page: penpot.currentPage && penpot.currentPage.name,
  removed,
  remainingComponents: (penpot.library.local.components || []).map((c) => c.name + " | " + c.path),
  remainingRoots: (penpot.root.children || []).map((s) => s.name),
};
