# CURSOR-P1-BUILD-PROMPT — NIL Agent Loop Backend

## Goal
Build the NIL agent loop backend — a FastAPI service that runs AI agents with tool execution, approval gates, streaming, and YOLO mode. This is the "brain" that the frontend IA Shell talks to.

## Context
- Project: `/home/das/projects/finn-pentest-harness/`
- Existing backend: `backend/godmode/` — contains the godmod3.ai multi-model router (Ollama Cloud, OpenRouter, etc.)
- Frontend: `frontend/` — SvelteKit 5 + Tauri 2, already has IA Shell with AI Strip
- Design tokens: color-means-risk (severity ramp only in chrome; `--brand-ember-*` reserved for Zone A identity moments) — see `.cursor/rules/00-nil-design-language.mdc`, not the retired violet/cream/coral palette

## Architecture

### Core Components

1. **Agent Loop** (`backend/agent/loop.py`)
   - Event-driven agent loop: receive message → plan → propose tools → wait for approval → execute → stream results
   - State machine: `idle` → `planning` → `awaiting_approval` → `executing` → `streaming` → `done`
   - Support 4 modes: `hunt` (pentest), `chat` (security Q&A), `code` (generate/review code), `report` (generate findings report)

2. **Tool Executor** (`backend/agent/tools/`)
   - Sandboxed execution via `subprocess` with timeout, cwd isolation
   - Tools: `run_command`, `read_file`, `write_file`, `edit_file`, `search_web`, `port_scan`, `dns_lookup`, `whois`
   - Each tool has schema (name, args, description, dangerous flag)
   - Dangerous tools (port_scan, run_command with rm/sudo/etc) require approval even in non-YOLO mode

3. **Approval Gate** (`backend/agent/approval.py`)
   - Per-engagement YOLO toggle (not global)
   - When YOLO is OFF: all tool proposals → WebSocket → frontend → user approves/rejects/edits
   - When YOLO is ON: dangerous tools still warn but auto-approve after 5s delay; non-dangerous tools execute immediately
   - All approvals logged to `backend/data/approvals/{engagement_id}.jsonl`

4. **Streaming API** (`backend/agent/stream.py`)
   - Server-Sent Events (SSE) endpoint: `/v1/agent/stream/{run_id}`
   - Events: `plan`, `tool_proposed`, `tool_running`, `tool_done`, `tool_failed`, `finding`, `message`, `done`, `error`
   - Each event has `timestamp`, `run_id`, `event_type`, `payload`

5. **Memory / Context** (`backend/agent/memory.py`)
   - In-memory conversation history per engagement (limit 50 turns, summarize older)
   - RAG over past findings and reports (simple BM25 or cosine similarity on embeddings)
   - System prompt templates per mode (hunt/chat/code/report)

6. **API Routes** (`backend/api/routes.py`)
   - `POST /v1/agent/send` — start a new agent run
   - `GET /v1/agent/stream/{run_id}` — SSE stream of events
   - `POST /v1/agent/approve/{run_id}` — approve a pending tool
   - `POST /v1/agent/reject/{run_id}` — reject a pending tool
   - `POST /v1/agent/cancel/{run_id}` — cancel running agent
   - `GET /v1/agent/status/{run_id}` — current state
   - `POST /v1/agent/yolo/{engagement_id}` — toggle YOLO mode
   - `GET /v1/engagements` — list engagements
   - `POST /v1/engagements` — create new engagement
   - `GET /v1/engagements/{id}/timeline` — get timeline markdown

### Data Models (Pydantic)

```python
class Engagement(BaseModel):
    id: str
    name: str
    target: str
    mode: Literal['hunt', 'chat', 'code', 'report']
    yolo: bool = False
    created_at: datetime
    updated_at: datetime

class AgentRun(BaseModel):
    id: str
    engagement_id: str
    status: Literal['idle', 'planning', 'awaiting_approval', 'executing', 'streaming', 'done', 'error']
    messages: list[dict]
    pending_tool: ToolCall | None
    plan: list[PlanStep]
    findings: list[Finding]
    created_at: datetime
    updated_at: datetime

class ToolCall(BaseModel):
    id: str
    tool: str
    args: dict
    dangerous: bool
    cost: CostEstimate | None

class PlanStep(BaseModel):
    id: str
    label: str
    status: Literal['pending', 'running', 'done', 'failed']
    detail: str | None

class Finding(BaseModel):
    id: str
    title: str
    severity: Literal['critical', 'high', 'medium', 'low', 'info']
    cvss: str
    description: str
    evidence: str
    remediation: str
    tool_call_id: str | None
```

### File Structure

```
backend/
├── api/
│   ├── __init__.py
│   ├── routes.py          # FastAPI routes
│   ├── middleware.py      # auth, rate limit, CORS
│   └── dependencies.py    # shared deps (db, config)
├── agent/
│   ├── __init__.py
│   ├── loop.py            # core agent loop
│   ├── approval.py        # approval gate + YOLO
│   ├── stream.py          # SSE streaming
│   ├── memory.py          # context + RAG
│   └── tools/
│       ├── __init__.py
│       ├── registry.py    # tool registry
│       ├── sandbox.py     # sandboxed execution
│       ├── run_command.py
│       ├── read_file.py
│       ├── write_file.py
│       ├── edit_file.py
│       ├── search_web.py
│       ├── port_scan.py
│       ├── dns_lookup.py
│       └── whois.py
├── core/
│   ├── __init__.py
│   ├── config.py          # settings (pydantic-settings)
│   ├── models.py          # shared pydantic models
│   └── events.py          # event bus (asyncio Queue)
├── data/
│   └── .gitkeep
├── tests/
│   └── test_agent_loop.py
├── main.py                # FastAPI app entry
├── requirements.txt
└── Dockerfile
```

## Integration Points

1. **Reuse godmode router**: Import `backend/godmode/engines/models.py` and `backend/godmode/providers/` for model resolution and chat completion. The agent loop should call the godmode pipeline for AI responses.
2. **WebSocket bridge**: Frontend connects to `/v1/agent/stream/{run_id}` via SSE. The frontend AI Strip composer sends to `POST /v1/agent/send`.
3. **Frontend stores**: The `agentStore` in frontend polls `/v1/agent/status/{run_id}` and listens to SSE for real-time updates.

## Key Behaviors

- **Anti-refusal**: When in `hunt` mode, prepend the godmode anti-refusal prompt (see `backend/godmode/engines/refusal_detector.py`)
- **Cost tracking**: Every tool call estimates tokens/cost. Show in frontend approval block.
- **Sandbox**: All commands run in `/tmp/nil-sandbox/{run_id}/` with timeout 60s, max output 100KB
- **Self-destruct**: `run_command` tool accepts `cleanup: true` flag — removes sandbox dir + clears shell history on completion
- **Findings extraction**: After tool execution, LLM extracts findings from output and adds to `AgentRun.findings`

## Tech Stack
- FastAPI + uvicorn
- Pydantic v2
- SSE via `fastapi.responses.StreamingResponse`
- Asyncio for concurrency
- godmode router for LLM calls (reuse existing code)
- No database — flat JSON files in `backend/data/` (simple, portable)

## Deliverables
1. All Python files scaffolded and wired
2. `py_compile` check on all `.py` files
3. `requirements.txt` updated
4. `curl` test commands for each endpoint
5. Git commit with message: "P1: Agent Loop Backend — tool executor, approval gate, SSE streaming, YOLO mode"

## Important
- Do NOT break the existing godmode backend
- Keep the godmode code in `backend/godmode/` untouched
- The new agent loop lives in `backend/agent/` and `backend/api/`
- Import godmode modules via relative imports (e.g., `from ..godmode.engines.models import all_models`)
- Test the API with `python -m pytest backend/tests/test_agent_loop.py -v` before finishing

## Cursor Model Preference
Use `composer-2.5` first. If it fails, try `claude-sonnet-4` or `gpt-5.2`.
