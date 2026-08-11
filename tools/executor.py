"""
Finn Pentest Harness — Tool Executor
Runs tools in sandbox with approval gate, logging, and output capture.
"""
import time
import uuid
from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
from typing import Optional

from sandbox.manager import exec_in_sandbox, get_sandbox, create_sandbox
from plugins.loader import get_plugin, list_plugins


# ──────────────────────────────────────────────────────────────
# TYPES
# ──────────────────────────────────────────────────────────────
class ApprovalStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    EDITED = "edited"


class ExecutionStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    TIMEOUT = "timeout"
    CANCELLED = "cancelled"


@dataclass
class ToolRun:
    id: str = field(default_factory=lambda: uuid.uuid4().hex[:12])
    engagement: str = ""
    tool: str = ""
    command: str = ""
    proposed_by: str = "ai"  # ai | user
    approval: ApprovalStatus = ApprovalStatus.PENDING
    status: ExecutionStatus = ExecutionStatus.PENDING
    stdout: str = ""
    stderr: str = ""
    exit_code: Optional[int] = None
    duration: float = 0.0
    started_at: Optional[str] = None
    completed_at: Optional[str] = None
    error: Optional[str] = None
    finding_ids: list[str] = field(default_factory=list)


# ──────────────────────────────────────────────────────────────
# APPROVAL GATE
# ──────────────────────────────────────────────────────────────
_pending_runs: dict[str, ToolRun] = {}


def propose_command(
    engagement: str,
    tool: str,
    command: str,
    proposed_by: str = "ai",
) -> ToolRun:
    """
    Propose a command for approval.
    Returns a ToolRun with status PENDING.
    The TUI/API must call approve() or reject() before execution.
    """
    run = ToolRun(
        engagement=engagement,
        tool=tool,
        command=command,
        proposed_by=proposed_by,
        approval=ApprovalStatus.PENDING,
    )
    _pending_runs[run.id] = run
    return run


def approve_command(run_id: str, edited_command: Optional[str] = None) -> ToolRun:
    """Approve a pending command. Optionally edit it first."""
    run = _pending_runs.get(run_id)
    if not run:
        raise ValueError(f"No pending run with id {run_id}")
    
    if edited_command:
        run.command = edited_command
        run.approval = ApprovalStatus.EDITED
    else:
        run.approval = ApprovalStatus.APPROVED
    
    return run


def reject_command(run_id: str, reason: str = "") -> ToolRun:
    """Reject a pending command."""
    run = _pending_runs.get(run_id)
    if not run:
        raise ValueError(f"No pending run with id {run_id}")
    
    run.approval = ApprovalStatus.REJECTED
    run.error = reason
    return run


def get_pending_runs(engagement: Optional[str] = None) -> list[ToolRun]:
    """Get all pending runs, optionally filtered by engagement."""
    runs = [r for r in _pending_runs.values() if r.approval == ApprovalStatus.PENDING]
    if engagement:
        runs = [r for r in runs if r.engagement == engagement]
    return runs


# ──────────────────────────────────────────────────────────────
# EXECUTION
# ──────────────────────────────────────────────────────────────
def execute_command(run_id: str, timeout: int = 300) -> ToolRun:
    """
    Execute an approved command in the sandbox.
    Blocks until completion or timeout.
    """
    run = _pending_runs.get(run_id)
    if not run:
        raise ValueError(f"No run with id {run_id}")
    
    if run.approval not in (ApprovalStatus.APPROVED, ApprovalStatus.EDITED):
        raise ValueError(f"Run {run_id} not approved (status: {run.approval})")
    
    # Ensure sandbox exists
    sandbox = get_sandbox(run.engagement)
    if not sandbox:
        create_sandbox(run.engagement)
    
    run.status = ExecutionStatus.RUNNING
    run.started_at = datetime.now(timezone.utc).isoformat()
    
    try:
        result = exec_in_sandbox(run.engagement, run.command, timeout=timeout)
        run.stdout = result["stdout"]
        run.stderr = result["stderr"]
        run.exit_code = result["exit_code"]
        run.duration = result["duration"]
        
        if result["exit_code"] == 0:
            run.status = ExecutionStatus.COMPLETED
        else:
            run.status = ExecutionStatus.FAILED
            
    except TimeoutError:
        run.status = ExecutionStatus.TIMEOUT
        run.error = f"Command timed out after {timeout}s"
    except Exception as e:
        run.status = ExecutionStatus.FAILED
        run.error = str(e)
    
    run.completed_at = datetime.now(timezone.utc).isoformat()
    return run


def execute_approved(engagement: str, command: str, tool: str = "manual", timeout: int = 300) -> ToolRun:
    """
    Shortcut: create, approve, and execute a command in one call.
    For user-initiated commands that don't need approval.
    """
    run = propose_command(engagement, tool, command, proposed_by="user")
    approve_command(run.id)
    return execute_command(run.id, timeout=timeout)


# ──────────────────────────────────────────────────────────────
# PLUGIN-BASED EXECUTION
# ──────────────────────────────────────────────────────────────
def propose_plugin_commands(
    engagement: str,
    plugin_name: str,
    target: str,
    args: Optional[dict] = None,
) -> list[ToolRun]:
    """
    Use a plugin to generate commands for a target.
    Returns a list of proposed ToolRuns (all PENDING).
    """
    plugin_cls = get_plugin(plugin_name)
    if not plugin_cls:
        raise ValueError(f"Plugin '{plugin_name}' not found")
    
    plugin = plugin_cls()
    commands = plugin.get_commands(target, args or {})
    
    runs = []
    for cmd in commands:
        run = propose_command(engagement, plugin_name, cmd, proposed_by="ai")
        runs.append(run)
    
    return runs


# ──────────────────────────────────────────────────────────────
# HISTORY
# ──────────────────────────────────────────────────────────────
_run_history: list[ToolRun] = []


def get_run_history(engagement: Optional[str] = None, limit: int = 50) -> list[ToolRun]:
    """Get execution history, optionally filtered by engagement."""
    runs = _run_history + list(_pending_runs.values())
    if engagement:
        runs = [r for r in runs if r.engagement == engagement]
    return sorted(
        runs,
        key=lambda r: r.started_at or "",
        reverse=True,
    )[:limit]


def get_run(run_id: str) -> Optional[ToolRun]:
    """Get a specific run by ID."""
    return _pending_runs.get(run_id) or next(
        (r for r in _run_history if r.id == run_id), None
    )
