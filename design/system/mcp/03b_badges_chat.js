storage._created = [];
storage._errors = [];
for (const state of ["Idle", "Running", "Passed", "Error"]) {
  runCreate(state, "Badge / Status", () => makeBadge(state));
}
runCreate("UserBubble", "Chat", makeUserBubble);
runCreate("AgentCard", "Chat", makeAgentCard);
runCreate("CodeBlock", "Chat", makeCodeBlock);
return {
  created: storage._created,
  errors: storage._errors,
  libraryCount: (penpot.library.local.components || []).length,
};
