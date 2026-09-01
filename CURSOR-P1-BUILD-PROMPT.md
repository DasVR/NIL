# NIL P1 Build Prompt — Agent Loop Backend (Cursor Agent)

## Context
**P1: Agent Loop Backend** — the core "Cursor agent" functionality. Edit files, run commands, loop on tools, approval gate, YOLO mode.

**Depends on:** P0 IA Shell (complete)
**Repo:** `/home/das/projects/finn-pentest-harness` (branch `master`)
**Backend:** `finn_pentest/` (FastAPI + godmode anti-refusal engine)

---

## Mandatory Pre-Build Reading

```
.cursor/skills/nil-agent-patterns/SKILL.md        → agent loop UI blocks, approval gate
.cursor/skills/nil-plugins/SKILL.md               → plugin system, sandbox execution
.cursor/skills/nil-tauri/SKILL.md                 → Tauri shell commands, sidecar
.cursor/rules/nil-workspace.mdc                   → build rules
finn_pentest/api/godmode_routes.py                → existing godmode API
finn_pentest/godmode/pipeline.py                  → anti-refusal pipeline
```

---

## P1 Scope — Agent Loop Backend

### 1. Tool Execution Engine (Tauri Sidecar)

```rust
// src-tauri/sidecar/nil-agent/src/main.rs
// Executes tools in sandbox, returns structured output

#[derive(Serialize, Deserialize)]
struct ToolRequest {
    tool: String,           // "edit_file", "run_command", "grep", "glob", "read_file", "write_file"
    args: serde_json::Value,
    engagement_id: String,
    approval_required: bool,
}

#[derive(Serialize, Deserialize)]
struct ToolResponse {
    success: bool,
    output: serde_json::Value,
    metadata: ToolMetadata,
    approval_token: Option<String>,  // if approval_required
}

struct ToolMetadata {
    duration_ms: u64,
    tokens_used: Option<TokenUsage>,
    cost_usd: Option<f64>,
    sandbox: String,
}
```

**Tools to implement:**
| Tool | Description | Sandbox |
|------|-------------|---------|
| `edit_file` | Surgical edit (old_string/new_string) | firejail |
| `run_command` | Shell command with timeout | firejail/docker |
| `read_file` | Read file with offset/limit | none |
| `write_file` | Write file (create/overwrite) | firejail |
| `glob` | Find files by pattern | none |
| `grep` | Regex search in files | none |
| `list_dir` | Directory listing | none |
| `patch` | Apply unified diff | firejail |

### 2. Approval Gate Backend

```python
# finn_pentest/api/agent_routes.py

@router.post("/v1/agent/engagements/{id}/propose")
async def propose_tool(id: str, request: ToolProposal):
    """
    Agent proposes a tool execution.
    Returns approval_token for the frontend approval block.
    """
    # Validate tool, args, target
    # Check YOLO mode for engagement
    # If YOLO and not dangerous → auto-approve, execute
    # Else → store proposal, return approval_token
    pass

@router.post("/v1/agent/engagements/{id}/approve/{token}")
async def approve_tool(id: str, token: str, action: ApproveAction):
    """
    action: "approve" | "edit" | "reject"
    If edit → re-validate, re-propose
    If approve → execute, stream results
    """
    pass

@router.websocket("/v1/agent/engagements/{id}/stream")
async def agent_stream(ws: WebSocket, id: str):
    """
    Server-sent events for live tool blocks:
    - tool:proposed
    - tool:running (with progress)
    - tool:done (with output, cost)
    - tool:failed (with error)
    - plan:updated
    - finding:created
    """
    pass
```

### 3. Agent Loop Orchestrator

```python
# finn_pentest/agent/orchestrator.py

class AgentOrchestrator:
    def __init__(self, engagement_id: str, model: ModelProvider, tools: ToolRegistry):
        self.engagement_id = engagement_id
        self.model = model
        self.tools = tools
        self.plan: List[PlanStep] = []
        self.history: List[ToolExecution] = []
        self.yolo = False
    
    async def run(self, user_input: str) -> AsyncGenerator[AgentEvent, None]:
        """
        Main agent loop:
        1. Build context (engagement + history + plan)
        2. Call model with system prompt + tools schema
        3. Parse model response → tool calls or final answer
        4. For each tool call:
           a. Check approval (YOLO or pending)
           b. Execute in sandbox
           c. Stream result
           d. Update plan/history
        5. Repeat until model returns final answer
        """
        pass
    
    async def propose_tool(self, tool: str, args: dict) -> ToolProposal:
        """Create proposal, check YOLO, return for approval."""
        pass
    
    async def execute_tool(self, proposal: ToolProposal) -> ToolResult:
        """Execute approved tool, return structured result."""
        pass
```

### 4. Model Provider Integration

```python
# finn_pentest/agent/providers.py

class ModelProvider(ABC):
    @abstractmethod
    async def chat(self, messages: List[Message], tools: List[ToolSchema]) -> AsyncIterable[ModelResponse]:
        pass
    
    @abstractmethod
    def list_models(self) -> List[ModelInfo]:
        pass

# Providers to implement:
# - OpenAICompatibleProvider (OpenRouter, Ollama, LM Studio, custom)
# - AnthropicProvider (Claude)
# - GoogleProvider (Gemini)
```

### 5. Godmode Integration

The existing `finn_pentest/godmode/pipeline.py` is the **anti-refusal engine**. Wire it as the default model provider for coding tasks.

```python
# finn_pentest/agent/godmode_provider.py

class GodmodeProvider(ModelProvider):
    """
    Wraps the godmode pipeline as a model provider.
    Uses ultraplinian racing + consortium synthesis.
    """
    def __init__(self):
        self.pipeline = GodmodePipeline()
    
    async def chat(self, messages, tools):
        # Convert messages to godmode prompt
        # Run pipeline with tools as available functions
        # Return synthesized response
        pass
```

### 6. Cost Tracking

```python
# finn_pentest/agent/cost.py

@dataclass
class TokenUsage:
    input_tokens: int
    output_tokens: int
    cache_read_tokens: int = 0
    cache_write_tokens: int = 0

@dataclass
class CostBreakdown:
    model: str
    usage: TokenUsage
    input_cost: float
    output_cost: float
    total_usd: float

PRICING = {
    "gpt-4o": {"input": 2.50, "output": 10.00},      # per 1M tokens
    "gpt-4o-mini": {"input": 0.15, "output": 0.60},
    "claude-sonnet-4": {"input": 3.00, "output": 15.00},
    "gemini-3.1-pro": {"input": 1.25, "output": 5.00},
    "nemotron-3-nano:30b": {"input": 0.00, "output": 0.00},  # Ollama Cloud
    "godmode": {"input": 0.00, "output": 0.00},  # local/aggregated
}
```

---

## API Endpoints to Add

| Method | Path | Description |
|--------|------|-------------|
| POST | `/v1/agent/engagements` | Create engagement |
| GET | `/v1/agent/engagements/{id}` | Get engagement state |
| POST | `/v1/agent/engagements/{id}/propose` | Propose tool (returns approval_token) |
| POST | `/v1/agent/engagements/{id}/approve/{token}` | Approve/edit/reject |
| WS | `/v1/agent/engagements/{id}/stream` | Live event stream |
| POST | `/v1/agent/engagements/{id}/yolo` | Toggle YOLO mode |
| GET | `/v1/agent/models` | List available models |
| POST | `/v1/agent/models/{id}/select` | Select model for engagement |

---

## Frontend Integration (P0 already has UI)

The P0 shell includes:
- `AIStrip.svelte` with 4 states (composer/running/review)
- `ToolBlock.svelte` with approval buttons
- `PlanBlock.svelte` with task list
- `DiffBlock.svelte` with accept/reject
- `CostDisplay.svelte` inline

**Wire these to the backend via:**
- `lib/stores/agentStore.ts` — manages proposals, approvals, streaming
- `lib/agent-ws.ts` — WebSocket connection to `/v1/agent/engagements/{id}/stream`

---

## Verification Gates

```bash
# Backend
cd /home/das/projects/finn-pentest-harness && python3 -m pytest tests/ -q

# Frontend
cd frontend && npm run check && npm run build

# Integration test
# 1. Start backend: python -m finn_pentest.api.app
# 2. Start frontend: npm run tauri dev
# 3. Create engagement, send message, watch tool propose → approve → execute → result
```

---

## Cursor Agent Instructions

```
Build P1 Agent Loop Backend for NIL.

STRICT RULES:
1. Use existing godmode pipeline — don't rebuild anti-refusal
2. Tauri sidecar for tool execution (firejail/docker)
3. Approval gate is THE critical path — BorderBeam on pending
4. Cost tracking inline per tool block
5. WebSocket streaming for live updates
6. Model provider abstraction (OpenAI-compatible + Anthropic + Google + Godmode)

WORKFLOW:
1. Read finn_pentest/godmode/pipeline.py and godmode_routes.py
2. Build Tauri sidecar (Rust) for sandboxed tool execution
3. Build FastAPI routes for agent loop
4. Build orchestrator + model providers
5. Wire frontend stores to WebSocket
6. Run verification gates

MODEL: composer-2.5 or grok-4.5. THINKING: Ultra. Fast mode: OFF.
```

---

## Success Criteria

✅ Agent proposes tool → approval block appears with BorderBeam
✅ Cmd+Enter approves → tool executes in sandbox → result streams
✅ Cmd+Shift+Enter rejects → block removed, agent notified
✅ YOLO mode (Cmd+Y) → auto-approves safe tools, warns on dangerous
✅ Cost metrics show inline per tool block (~$0.003 format)
✅ Plan block updates in real-time (✅ 🔄 ⏳)
✅ Diff block shows unified diff with accept/reject per hunk
✅ Finding block renders with severity border + Explain/Draft
✅ WebSocket reconnects on disconnect
✅ Godmode provider works for coding tasks
✅ All tests pass, build passes

---

**When done:** Commit with message `feat(p1): agent loop backend — tool execution, approval gate, YOLO, godmode integration, cost tracking, WebSocket streaming`

**Push to origin/master.**