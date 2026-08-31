---
name: nil-agent-patterns
description: Agent loop UI patterns from Cursor 3, Claude Code, Warp, Codex. Structured cards, approval blocks, cost metrics, task lists.
---

# NIL Agent Patterns — 2026 Agent-First UI

## The Shift

**Cursor 3 (Apr 2026)** demoted the IDE to a fallback pane. **Agent-first** is the default.

| Old Pattern | NIL Pattern |
|-------------|-------------|
| Chat sidebar as default | Terminal/editor as default, AI summoned |
| Chat bubbles | Structured cards with meta headers |
| Inline approvals | Approval block = THE one attention object |
| Hidden costs | Token/cost metrics inline per run |
| File refs as text | Clickable file badges (+52/-0) |
| Single agent | Multi-agent tournament, adversarial verify |

## Agent Conversation Surface

The main workspace is **not a chat**. It's a structured log of agent activity:

```
┌─ Agent Conversation ─────────────────────────────────────┐
│  Plan Block          │  Agent's step-by-step plan        │
│  ├─ Step 1: Analyze  │  ✅ Done                          │
│  ├─ Step 2: Edit     │  🔄 Running (spinner)             │
│  └─ Step 3: Test     │  ⏳ Pending                       │
├──────────────────────────────────────────────────────────┤
│  Tool Block          │  Single tool invocation           │
│  Tool: edit_file     │  Status: pending approval         │
│  File: src/app.ts    │  [Approve] [Edit] [Reject]        │
│  Diff: +12/-3 lines  │  BorderBeam on this block ONLY   │
├──────────────────────────────────────────────────────────┤
│  Diff Block          │  Side-by-side or unified diff     │
│  File: src/app.ts    │  Syntax highlighted, mono font    │
│  + import { foo }    │  Accept/Reject inline             │
│  - import { bar }    │                                   │
├──────────────────────────────────────────────────────────┤
│  Finding Block       │  Security/bug finding card        │
│  Title: SQLi in API  │  Severity: Critical (red border)  │
│  CVSS: 9.1           │  Evidence: request/response       │
│  [Explain] [Draft]   │  Summons AI strip, no nav         │
├──────────────────────────────────────────────────────────┤
│  Artifact Block      │  Generated file output            │
│  report.md           │  Preview + download               │
└──────────────────────────────────────────────────────────┘
```

## Block Types (exact spec)

### Plan Block
```svelte
<PlanBlock {steps} {currentIndex}>
  <!-- Each step: {label, status: 'done'|'running'|'pending', detail?} -->
  <!-- Status icons: ✅ 🔄 ⏳ -->
  <!-- Click step → scroll to that tool/diff block -->
</PlanBlock>
```

### Tool Block (THE approval surface)
```svelte
<ToolBlock {tool} {args} {status} {cost}>
  <!-- tool: string (edit_file, run_command, grep, etc.) -->
  <!-- args: object (file, command, pattern, etc.) -->
  <!-- status: 'proposed' | 'running' | 'done' | 'failed' -->
  <!-- cost: {inputTokens, outputTokens, estCostUSD} -->
  <!-- 
    proposed → BorderBeam animation, Approve/Edit/Reject buttons
    running → spinner, cancel button
    done → green check, cost inline, collapse button
    failed → red, error output, retry
  -->
</ToolBlock>
```

### Diff Block
```svelte
<DiffBlock {file} {oldContent} {newContent} {onAccept} {onReject}>
  <!-- Unified diff by default, side-by-side on wide screens -->
  <!-- Syntax highlighting via shiki/monaco -->
  <!-- Line numbers, fold unchanged regions -->
  <!-- Inline accept/reject per hunk -->
</DiffBlock>
```

### Finding Block
```svelte
<FindingBlock {finding} {onExplain} {onDraft}>
  <!-- finding: {title, severity, cvss, date, description, evidence, remediation} -->
  <!-- Severity drives left border color + sort order -->
  <!-- Critical gets glow animation (BorderBeam) -->
  <!-- Explain/Draft → summons AI strip with finding as context -->
</FindingBlock>
```

### Artifact Block
```svelte
<ArtifactBlock {filename} {content} {language}>
  <!-- Preview with syntax highlighting -->
  <!-- Copy button, Download button, Open in editor -->
  <!-- Auto-detect language or pass explicitly -->
</ArtifactBlock>
```

## Approval Gate (critical)

```
┌─ Pending Approval ────────────────────────────────────────┐
│  🔶 Tool: edit_file                    Cost: ~$0.003     │
│  File: frontend/src/lib/stores.ts                       │
│  ─────────────────────────────────────────────────────  │
│  + const activeEngagement = $derived(...)               │
│  - let activeEngagement = null                          │
│  ─────────────────────────────────────────────────────  │
│  [Approve Cmd+Enter]  [Edit]  [Reject Cmd+Shift+Enter]  │
└─────────────────────────────────────────────────────────┘
```

**Rules:**
- Only ONE pending block visible at a time
- BorderBeam animation on pending block (the one attention object)
- Keyboard: `Cmd+Enter` = approve, `Cmd+Shift+Enter` = reject
- YOLO mode (`Cmd+Y`) = auto-approve, still logged, still sandboxed
- Dangerous tools still warn even in YOLO

## Cost Metrics (inline, per block)

```svelte
<CostDisplay {inputTokens} {outputTokens} {model}>
  <!-- Format: "~$0.003 (1.2k in / 800 out)" -->
  <!-- Color: dim for <$0.01, warning for >$0.10, danger for >$1.00 -->
  <!-- Hover → full breakdown -->
</CostDisplay>
```

## Task List (agent's plan)

```
┌─ Task List ───────────────────────────────────────────────┐
│  ☑  Analyze codebase structure                            │
│  ▸  Scaffold Tauri + SvelteKit shell                      │
│  ○  Implement liquid metal titlebar                       │
│  ○  Build terminal PTY integration                        │
│  ○  Wire agent loop backend                               │
│  ○  Settings sheet with search                            │
└───────────────────────────────────────────────────────────┘
```

- Checkbox = done, ▸ = current, ○ = pending
- Click task → scroll to that plan step
- Agent updates in real-time

## Multi-Agent Patterns

| Pattern | Use Case | UI |
|---------|----------|----|
| **Fan-out + Synthesize** | Multiple approaches → best | Tabs for each agent, synthesis at bottom |
| **Adversarial Verification** | Code + reviewer agent | Side-by-side diffs, "Verifier says..." block |
| **Tournament** | 3+ agents compete | Score cards, winner highlighted |
| **Generate + Filter** | Many candidates → filter | Grid of outputs, filter chips |
| **Classify + Act** | Route to specialist | Router badge on each block |

## File References in Output

```
Edited: frontend/src/lib/stores.ts (+52/-3)
Created: frontend/src/components/AgentConversation.svelte
```

- Clickable file paths → open in editor
- Line count badges
- Hover → mini diff preview

## Empty State

When no engagement:
```
┌─ New Engagement ──────────────────────────────────────────┐
│  Target: [________________________]  [New]                │
├──────────────────────────────────────────────────────────┤
│  Templates:                                                │
│  □ Web App Assessment    □ API Security Review           │
│  □ Infrastructure Audit  □ Mobile App Test               │
├──────────────────────────────────────────────────────────┤
│  Recent:                                                   │
│  acme-corp-api      2h ago    3 findings                 │
│  internal-dashboard  1d ago    1 finding                 │
└──────────────────────────────────────────────────────────┘
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd+J` | Toggle AI strip |
| `Cmd+K` | Command palette |
| `Cmd+Enter` | Approve pending |
| `Cmd+Shift+Enter` | Reject pending |
| `Cmd+Y` | Toggle YOLO |
| `Esc` | Peel one layer (close popover, collapse strip, cancel) |