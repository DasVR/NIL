// Combined component pass. Prefer 03a/03b/03c — the plugin aborts after 30s.
storage._created = [];
storage._errors = [];
for (const variant of ["Primary", "Secondary", "Danger", "Icon"]) {
  for (const state of ["Default", "Hover", "Active", "Disabled"]) {
    runCreate(state, "Button / " + variant, () => makeButton(variant, state));
  }
}
for (const state of ["Idle", "Running", "Passed", "Error"]) {
  runCreate(state, "Badge / Status", () => makeBadge(state));
}
runCreate("UserBubble", "Chat", makeUserBubble);
runCreate("AgentCard", "Chat", makeAgentCard);
runCreate("CodeBlock", "Chat", makeCodeBlock);
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
