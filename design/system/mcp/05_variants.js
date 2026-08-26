function combineGroup(pathNeedle, leaves, prop) {
  const mains = [];
  for (const leaf of leaves) {
    const component = findComponent(leaf, pathNeedle);
    if (component) {
      try {
        mains.push(component.mainInstance());
      } catch (e) {}
    }
  }
  if (mains.length < 2) return { path: pathNeedle, error: "not enough mains", n: mains.length };
  try {
    const container = penpot.createVariantFromComponents(mains);
    if (container && container.variants) {
      try {
        container.variants.renameProperty(0, prop);
      } catch (e) {}
    }
    return {
      path: pathNeedle,
      id: container && container.id,
      name: container && container.name,
      n: mains.length,
    };
  } catch (e) {
    return { path: pathNeedle, error: String((e && e.message) || e), n: mains.length };
  }
}

const states = ["Default", "Hover", "Active", "Disabled"];
return {
  primary: combineGroup("Button / Primary", states, "State"),
  secondary: combineGroup("Button / Secondary", states, "State"),
  danger: combineGroup("Button / Danger", states, "State"),
  icon: combineGroup("Button / Icon", states, "State"),
  badges: combineGroup("Badge / Status", ["Idle", "Running", "Passed", "Error"], "Status"),
  files: combineGroup("Terminal / FileTreeItem / File", ["Default", "Hover", "Active"], "State"),
  folders: combineGroup("Terminal / FileTreeItem / Folder", ["Default", "Hover", "Active"], "State"),
  components: (penpot.library.local.components || []).map((c) => ({
    name: c.name,
    path: c.path,
    variant: c.variantProps,
  })),
};
