"""
Finn Pentest Harness — Timeline Logger
Logs every action, command, finding, and decision to a markdown timeline.
"""
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

from tools.executor import ToolRun, ExecutionStatus

# ──────────────────────────────────────────────────────────────
# CONFIG
# ──────────────────────────────────────────────────────────────
BASE_DIR = Path(os.environ.get("FINN_PENTEST_DIR", Path.home() / ".finn-pentest"))
ENGAGEMENT_DIR = BASE_DIR / "engagements"


# ──────────────────────────────────────────────────────────────
# TIMELINE LOGGING
# ──────────────────────────────────────────────────────────────
def _get_timeline_path(engagement: str) -> Path:
    """Get the timeline.md path for an engagement."""
    eng_dir = ENGAGEMENT_DIR / engagement
    eng_dir.mkdir(parents=True, exist_ok=True)
    return eng_dir / "timeline.md"


def _ensure_timeline(engagement: str) -> Path:
    """Ensure timeline.md exists, create with header if not."""
    path = _get_timeline_path(engagement)
    if not path.exists():
        path.write_text(
            f"# {engagement} — Engagement Timeline\n\n"
            f"**Started**: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC')}\n\n"
            "---\n\n"
        )
    return path


def log_event(
    engagement: str,
    event_type: str,
    description: str,
    details: Optional[str] = None,
) -> str:
    """
    Log an event to the engagement timeline.
    
    event_type: AI_PROPOSE | USER_APPROVE | USER_REJECT | TOOL_START | 
                TOOL_COMPLETE | TOOL_FAIL | FINDING | NOTE | CRED_FOUND
    """
    path = _ensure_timeline(engagement)
    timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")
    
    emoji_map = {
        "AI_PROPOSE": "🤖",
        "USER_APPROVE": "✅",
        "USER_REJECT": "❌",
        "TOOL_START": "🔧",
        "TOOL_COMPLETE": "✔️",
        "TOOL_FAIL": "💥",
        "FINDING": "🔍",
        "NOTE": "📝",
        "CRED_FOUND": "🔑",
        "AI_ANALYSIS": "🧠",
        "ENGAGEMENT_START": "🚀",
        "ENGAGEMENT_END": "🏁",
    }
    
    emoji = emoji_map.get(event_type, "•")
    
    entry = f"**[{timestamp}]** {emoji} `[{event_type}]` {description}\n"
    if details:
        entry += f"\n```\n{details}\n```\n"
    entry += "\n"
    
    with open(path, "a") as f:
        f.write(entry)
    
    return entry


def log_tool_run(run: ToolRun) -> None:
    """Log a complete tool run to the timeline."""
    log_event(
        run.engagement,
        "TOOL_START",
        f"`{run.tool}` — `{run.command[:100]}`",
    )
    
    if run.status == ExecutionStatus.COMPLETED:
        log_event(
            run.engagement,
            "TOOL_COMPLETE",
            f"`{run.tool}` completed in {run.duration}s (exit {run.exit_code})",
            details=run.stdout[:2000] if run.stdout else "(no output)",
        )
    elif run.status == ExecutionStatus.FAILED:
        log_event(
            run.engagement,
            "TOOL_FAIL",
            f"`{run.tool}` failed (exit {run.exit_code}, {run.duration}s)",
            details=run.error or run.stderr[:2000],
        )
    elif run.status == ExecutionStatus.TIMEOUT:
        log_event(
            run.engagement,
            "TOOL_FAIL",
            f"`{run.tool}` timed out after {run.duration}s",
        )


def log_finding(
    engagement: str,
    title: str,
    severity: str,
    description: str,
    evidence: Optional[str] = None,
) -> Path:
    """Log a finding and create a finding markdown file."""
    eng_dir = ENGAGEMENT_DIR / engagement
    findings_dir = eng_dir / "findings"
    findings_dir.mkdir(parents=True, exist_ok=True)
    
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    slug = title.lower().replace(" ", "_").replace("/", "-")[:50]
    filename = f"{timestamp}_{slug}.md"
    filepath = findings_dir / filename
    
    content = f"""# {title}

**Severity**: {severity}
**Date**: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC')}
**Engagement**: {engagement}

## Description
{description}

## Evidence
{evidence or '(no evidence attached)'}

## Remediation
*(to be filled)*
"""
    filepath.write_text(content)
    
    log_event(
        engagement,
        "FINDING",
        f"[{severity}] {title} → `{filename}`",
        details=description[:500],
    )
    
    return filepath


def log_credential(
    engagement: str,
    service: str,
    username: str,
    password_hint: str,
) -> None:
    """
    Log that a credential was found (NOT the actual password).
    The actual credential goes to the encrypted store.
    """
    log_event(
        engagement,
        "CRED_FOUND",
        f"{service} — `{username}` (stored encrypted)",
        details=f"Service: {service}\nUsername: {username}\nPassword: [ENCRYPTED — use `finn creds get {engagement}`]",
    )


def get_timeline(engagement: str, tail: int = 100) -> str:
    """Read the timeline for an engagement."""
    path = _get_timeline_path(engagement)
    if not path.exists():
        return f"No timeline found for '{engagement}'"
    
    lines = path.read_text().splitlines()
    if len(lines) > tail:
        return "\n".join(lines[-tail:])
    return "\n".join(lines)
