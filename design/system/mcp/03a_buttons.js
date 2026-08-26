storage._created = [];
storage._errors = [];
for (const variant of ["Primary", "Secondary", "Danger", "Icon"]) {
  for (const state of ["Default", "Hover", "Active", "Disabled"]) {
    runCreate(state, "Button / " + variant, () => makeButton(variant, state));
  }
}
return {
  created: storage._created,
  errors: storage._errors,
  libraryCount: (penpot.library.local.components || []).length,
};
