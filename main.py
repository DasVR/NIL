"""
Finn Pentest Harness — Main API
Terminal-first, AI-driven pentest workstation.
Extends finn-godmode-api with pentest-specific routes.
"""
import os
import time
import secrets
from typing import Optional

from dotenv import load_dotenv
from fastapi import FastAPI, Request, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from slowapi import Limiter
from slowapi.util import get_remote_address

from sandbox.manager import (
    create_sandbox, destroy_sandbox, nuke_sandbox,
    get_sandbox, list_sandboxes, install_tool, exec_in_sandbox,
    build_sandbox_image, ensure_image,
)
from tools.executor import (
    propose_command, approve_command, reject_command,
    execute_command, execute_approved,
    get_pending_runs, get_run_history, get_run,
    propose_plugin_commands,
)
from tools.logger import (
    log_event, log_tool_run, log_finding, log_credential, get_timeline,
)
from tools.cred_store import (
    store_credential, get_credentials, get_credential,
    delete_credential, search_credentials, export_credentials,
)
from plugins.loader import list_plugins, get_plugin, reload_plugins

load_dotenv()

PENTEST_API_KEY = os.environ.get("PENTEST_API_KEY") or os.environ.get("GODMODE_API_KEY")
CORS_ORIGIN = os.environ.get("CORS_ORIGIN", "*")

limiter = Limiter(key_func=get_remote_address)
app = FastAPI(title="Finn Pentest Harness", version="0.1.0")
app.state.limiter = limiter

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if CORS_ORIGIN == "*" else CORS_ORIGIN.split(","),
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ──────────────────────────────────────────────────────────────
# MODELS
# ──────────────────────────────────────────────────────────────
class EngagementCreate(BaseModel):
    name: str


class ToolPropose(BaseModel):
    engagement: str
    tool: str
    command: str


class ToolApprove(BaseModel):
    run_id: str
    edited_command: Optional[str] = None


class ToolReject(BaseModel):
    run_id: str
    reason: str = ""


class ToolExecute(BaseModel):
    run_id: str
    timeout: int = 300


class PluginRun(BaseModel):
    engagement: str
    plugin_name: str
    target: str
    args: Optional[dict] = None


class CredentialStore(BaseModel):
    engagement: str
    service: str
    username: str
    password: str
    url: Optional[str] = None
    notes: Optional[str] = None


class FindingCreate(BaseModel):
    engagement: str
    title: str
    severity: str
    description: str
    evidence: Optional[str] = None


class SandboxExec(BaseModel):
    engagement: str
    command: str
    timeout: int = 300


# ──────────────────────────────────────────────────────────────
# AUTH
# ──────────────────────────────────────────────────────────────
def require_auth(request: Request):
    if not PENTEST_API_KEY:
        return
    auth = request.headers.get("authorization", "")
    if not auth.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing Authorization: Bearer ***")
    if auth.split(" ", 1)[1] != PENTEST_API_KEY:
        raise HTTPException(status_code=403, detail="Invalid API key")


# ──────────────────────────────────────────────────────────────
# HEALTH
# ──────────────────────────────────────────────────────────────
@app.get("/v1/health")
async def health():
    return {
        "status": "ok",
        "service": "finn-pentest-harness",
        "version": "0.1.0",
        "timestamp": int(time.time() * 1000),
    }


@app.get("/v1/info")
async def info():
    return {
        "name": "Finn Pentest Harness",
        "version": "0.1.0",
        "description": "Terminal-first, AI-driven pentest workstation",
        "endpoints": {
            "sandbox": "/v1/sandbox/*",
            "tools": "/v1/tools/*",
            "plugins": "/v1/plugins/*",
            "findings": "/v1/findings/*",
            "credentials": "/v1/credentials/*",
            "timeline": "/v1/timeline/*",
        },
    }


# ──────────────────────────────────────────────────────────────
# SANDBOX ROUTES
# ──────────────────────────────────────────────────────────────
@app.post("/v1/sandbox/create", dependencies=[Depends(require_auth)])
async def api_create_sandbox(body: EngagementCreate):
    """Create a new sandbox for an engagement."""
    try:
        container_id = create_sandbox(body.name)
        log_event(body.name, "ENGAGEMENT_START", f"Sandbox created — container `{container_id[:12]}`")
        return {"status": "created", "engagement": body.name, "container_id": container_id[:12]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/v1/sandbox/{engagement}", dependencies=[Depends(require_auth)])
async def api_destroy_sandbox(engagement: str, nuke: bool = False):
    """Destroy (or nuke) a sandbox."""
    if nuke:
        result = nuke_sandbox(engagement)
    else:
        result = destroy_sandbox(engagement)
    
    if result:
        log_event(engagement, "ENGAGEMENT_END", "Sandbox destroyed" + (" (nuked)" if nuke else ""))
        return {"status": "destroyed", "engagement": engagement, "nuked": nuke}
    raise HTTPException(status_code=404, detail=f"No sandbox found for '{engagement}'")


@app.get("/v1/sandbox/{engagement}", dependencies=[Depends(require_auth)])
async def api_get_sandbox(engagement: str):
    """Get sandbox status."""
    container = get_sandbox(engagement)
    if not container:
        raise HTTPException(status_code=404, detail=f"No sandbox found for '{engagement}'")
    return {
        "engagement": engagement,
        "id": container.id[:12],
        "status": container.status,
        "created": container.attrs.get("Created", ""),
    }


@app.get("/v1/sandbox", dependencies=[Depends(require_auth)])
async def api_list_sandboxes():
    """List all sandboxes."""
    return {"sandboxes": list_sandboxes()}


@app.post("/v1/sandbox/exec", dependencies=[Depends(require_auth)])
async def api_exec_sandbox(body: SandboxExec):
    """Execute a command directly in a sandbox (no approval gate)."""
    try:
        result = exec_in_sandbox(body.engagement, body.command, timeout=body.timeout)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/v1/sandbox/install", dependencies=[Depends(require_auth)])
async def api_install_tool(engagement: str, tool: str):
    """Install a tool in the sandbox."""
    try:
        result = install_tool(engagement, tool)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/v1/sandbox/build-image", dependencies=[Depends(require_auth)])
async def api_build_image():
    """Build the sandbox Docker image."""
    try:
        image_id = build_sandbox_image()
        return {"status": "built", "image_id": image_id[:12]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ──────────────────────────────────────────────────────────────
# TOOL ROUTES (APPROVAL GATE)
# ──────────────────────────────────────────────────────────────
@app.post("/v1/tools/propose", dependencies=[Depends(require_auth)])
async def api_propose(body: ToolPropose):
    """Propose a command for approval."""
    run = propose_command(body.engagement, body.tool, body.command)
    log_event(body.engagement, "AI_PROPOSE", f"`{body.tool}` — `{body.command[:100]}`")
    return {
        "run_id": run.id,
        "status": run.approval,
        "command": run.command,
    }


@app.post("/v1/tools/approve", dependencies=[Depends(require_auth)])
async def api_approve(body: ToolApprove):
    """Approve a pending command."""
    try:
        run = approve_command(body.run_id, body.edited_command)
        log_event(run.engagement, "USER_APPROVE", f"`{run.tool}` — `{run.command[:100]}`")
        return {"run_id": run.id, "status": run.approval, "command": run.command}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.post("/v1/tools/reject", dependencies=[Depends(require_auth)])
async def api_reject(body: ToolReject):
    """Reject a pending command."""
    try:
        run = reject_command(body.run_id, body.reason)
        log_event(run.engagement, "USER_REJECT", f"`{run.tool}` — {body.reason or 'no reason given'}")
        return {"run_id": run.id, "status": run.approval}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.post("/v1/tools/execute", dependencies=[Depends(require_auth)])
async def api_execute(body: ToolExecute):
    """Execute an approved command."""
    try:
        run = execute_command(body.run_id, timeout=body.timeout)
        log_tool_run(run)
        return {
            "run_id": run.id,
            "status": run.status,
            "exit_code": run.exit_code,
            "duration": run.duration,
            "stdout": run.stdout[:5000],
            "stderr": run.stderr[:2000],
            "error": run.error,
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/v1/tools/run", dependencies=[Depends(require_auth)])
async def api_run_direct(body: ToolPropose):
    """Propose, approve, and execute in one call (user-initiated)."""
    try:
        run = execute_approved(body.engagement, body.command, body.tool)
        log_tool_run(run)
        return {
            "run_id": run.id,
            "status": run.status,
            "exit_code": run.exit_code,
            "duration": run.duration,
            "stdout": run.stdout[:5000],
            "error": run.error,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/v1/tools/pending", dependencies=[Depends(require_auth)])
async def api_pending_runs(engagement: Optional[str] = None):
    """Get pending approval runs."""
    runs = get_pending_runs(engagement)
    return {
        "pending": [
            {
                "run_id": r.id,
                "engagement": r.engagement,
                "tool": r.tool,
                "command": r.command,
                "proposed_by": r.proposed_by,
            }
            for r in runs
        ]
    }


@app.get("/v1/tools/history", dependencies=[Depends(require_auth)])
async def api_run_history(engagement: Optional[str] = None, limit: int = 50):
    """Get tool execution history."""
    runs = get_run_history(engagement, limit)
    return {
        "history": [
            {
                "run_id": r.id,
                "engagement": r.engagement,
                "tool": r.tool,
                "command": r.command[:200],
                "status": r.status,
                "exit_code": r.exit_code,
                "duration": r.duration,
                "started_at": r.started_at,
            }
            for r in runs
        ]
    }


@app.get("/v1/tools/run/{run_id}", dependencies=[Depends(require_auth)])
async def api_get_run(run_id: str):
    """Get a specific run by ID."""
    run = get_run(run_id)
    if not run:
        raise HTTPException(status_code=404, detail=f"Run '{run_id}' not found")
    return {
        "run_id": run.id,
        "engagement": run.engagement,
        "tool": run.tool,
        "command": run.command,
        "status": run.status,
        "approval": run.approval,
        "exit_code": run.exit_code,
        "duration": run.duration,
        "stdout": run.stdout[:5000],
        "stderr": run.stderr[:2000],
        "error": run.error,
        "started_at": run.started_at,
        "completed_at": run.completed_at,
    }


# ──────────────────────────────────────────────────────────────
# PLUGIN ROUTES
# ──────────────────────────────────────────────────────────────
@app.get("/v1/plugins", dependencies=[Depends(require_auth)])
async def api_list_plugins():
    """List all available plugins."""
    plugins = list_plugins()
    return {
        "plugins": [
            {
                "name": p.name,
                "description": p.description,
                "tools": p.tools,
                "safety_level": p.safety_level,
                "category": p.category,
                "version": p.version,
            }
            for p in plugins
        ]
    }


@app.get("/v1/plugins/{name}", dependencies=[Depends(require_auth)])
async def api_get_plugin(name: str):
    """Get plugin details."""
    plugin_cls = get_plugin(name)
    if not plugin_cls:
        raise HTTPException(status_code=404, detail=f"Plugin '{name}' not found")
    p = plugin_cls().info
    return {
        "name": p.name,
        "description": p.description,
        "tools": p.tools,
        "install_commands": p.install_commands,
        "safety_level": p.safety_level,
        "category": p.category,
        "version": p.version,
    }


@app.post("/v1/plugins/run", dependencies=[Depends(require_auth)])
async def api_run_plugin(body: PluginRun):
    """Generate and propose commands from a plugin."""
    try:
        runs = propose_plugin_commands(
            body.engagement, body.plugin_name, body.target, body.args
        )
        return {
            "plugin": body.plugin_name,
            "target": body.target,
            "proposed_runs": [
                {"run_id": r.id, "command": r.command, "status": r.approval}
                for r in runs
            ],
        }
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.post("/v1/plugins/reload", dependencies=[Depends(require_auth)])
async def api_reload_plugins():
    """Force reload all plugins."""
    plugins = reload_plugins()
    return {"plugins": list(plugins.keys()), "count": len(plugins)}


# ──────────────────────────────────────────────────────────────
# FINDINGS ROUTES
# ──────────────────────────────────────────────────────────────
@app.post("/v1/findings", dependencies=[Depends(require_auth)])
async def api_create_finding(body: FindingCreate):
    """Log a finding."""
    try:
        filepath = log_finding(
            body.engagement,
            body.title,
            body.severity,
            body.description,
            body.evidence,
        )
        return {
            "status": "created",
            "engagement": body.engagement,
            "title": body.title,
            "severity": body.severity,
            "file": str(filepath),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ──────────────────────────────────────────────────────────────
# CREDENTIAL ROUTES
# ──────────────────────────────────────────────────────────────
@app.post("/v1/credentials", dependencies=[Depends(require_auth)])
async def api_store_credential(body: CredentialStore):
    """Store a credential (encrypted)."""
    try:
        entry = store_credential(
            body.engagement,
            body.service,
            body.username,
            body.password,
            body.url,
            body.notes,
        )
        log_credential(body.engagement, body.service, body.username)
        return entry
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/v1/credentials/{engagement}", dependencies=[Depends(require_auth)])
async def api_get_credentials(engagement: str, reveal: bool = False):
    """Get credentials for an engagement."""
    return {"credentials": get_credentials(engagement, reveal=reveal)}


@app.get("/v1/credentials/{engagement}/{cred_id}", dependencies=[Depends(require_auth)])
async def api_get_credential(engagement: str, cred_id: int, reveal: bool = False):
    """Get a specific credential."""
    cred = get_credential(engagement, cred_id, reveal=reveal)
    if not cred:
        raise HTTPException(status_code=404, detail=f"Credential {cred_id} not found")
    return cred


@app.delete("/v1/credentials/{engagement}/{cred_id}", dependencies=[Depends(require_auth)])
async def api_delete_credential(engagement: str, cred_id: int):
    """Delete a credential."""
    if delete_credential(engagement, cred_id):
        return {"status": "deleted"}
    raise HTTPException(status_code=404, detail=f"Credential {cred_id} not found")


@app.get("/v1/credentials/{engagement}/search", dependencies=[Depends(require_auth)])
async def api_search_credentials(engagement: str, q: str):
    """Search credentials."""
    return {"results": search_credentials(engagement, q)}


# ──────────────────────────────────────────────────────────────
# TIMELINE ROUTES
# ──────────────────────────────────────────────────────────────
@app.get("/v1/timeline/{engagement}", dependencies=[Depends(require_auth)])
async def api_get_timeline(engagement: str, tail: int = 100):
    """Get the engagement timeline."""
    return {"engagement": engagement, "timeline": get_timeline(engagement, tail)}


@app.post("/v1/timeline/{engagement}", dependencies=[Depends(require_auth)])
async def api_log_event(engagement: str, event_type: str, description: str, details: Optional[str] = None):
    """Log a custom event to the timeline."""
    entry = log_event(engagement, event_type, description, details)
    return {"status": "logged", "entry": entry}


# ──────────────────────────────────────────────────────────────
# MAIN
# ──────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8766)
