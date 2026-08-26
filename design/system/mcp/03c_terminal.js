storage._created = [];
storage._errors = [];
runCreate("StreamLog", "Terminal", makeStreamLog);
for (const kind of ["File", "Folder"]) {
  for (const state of ["Default", "Hover", "Active"]) {
    runCreate(state, "Terminal / FileTreeItem / " + kind, () => makeFileTreeItem(kind, state));
  }
}
return {
  created: storage._created,
  errors: storage._errors,
  libraryCount: (penpot.library.local.components || []).length,
};
