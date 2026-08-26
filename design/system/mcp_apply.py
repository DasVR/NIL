#!/usr/bin/env python3
"""Apply the workspace design system to the connected Penpot file via MCP."""
from __future__ import annotations

import json
import os
import sys
import time
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent
MCP_DIR = ROOT / "mcp"
TOKEN_FILE = Path.home() / ".penpot_mcp_token"
ENDPOINT = os.environ.get("PENPOT_MCP_URL", "https://penpot.dasdev.net/mcp/stream")
SESSION_FILE = Path("/tmp/penpot_mcp_session.json")
SHARED = MCP_DIR / "_shared.js"
SHARED_PHASES = {
    "03a_buttons.js",
    "03b_badges_chat.js",
    "03c_terminal.js",
    "03_components.js",
    "04_board.js",
    "05_variants.js",
}
PHASES = [
    "00_cleanup.js",
    "01_tokens.js",
    "02_library.js",
    "03a_buttons.js",
    "03b_badges_chat.js",
    "03c_terminal.js",
    "05_variants.js",
    "04_board.js",
]


def load_token() -> str:
    env = os.environ.get("PENPOT_MCP_TOKEN")
    if env:
        return env.strip()
    return TOKEN_FILE.read_text().strip()


def parse_sse(body: str) -> list:
    results = []
    for block in body.split("event: message"):
        for line in block.splitlines():
            if line.startswith("data: "):
                try:
                    results.append(json.loads(line[6:]))
                except json.JSONDecodeError:
                    pass
    return results


def rpc(method: str, params: dict, sid: str | None = None, timeout: int = 120):
    token = load_token()
    payload = {"jsonrpc": "2.0", "id": 1, "method": method, "params": params or {}}
    headers = {
        "Accept": "application/json, text/event-stream",
        "Content-Type": "application/json",
    }
    if sid:
        headers["mcp-session-id"] = sid
    req = urllib.request.Request(
        f"{ENDPOINT}?userToken={token}",
        data=json.dumps(payload).encode(),
        method="POST",
        headers=headers,
    )
    with urllib.request.urlopen(req, timeout=timeout) as response:
        sid2 = response.headers.get("mcp-session-id", sid)
        body = response.read().decode("utf-8", errors="ignore")
        return sid2, parse_sse(body), body


def initialize() -> str:
    sid, data, _ = rpc(
        "initialize",
        {
            "protocolVersion": "2024-11-05",
            "capabilities": {},
            "clientInfo": {"name": "workspace-ds", "version": "1.0.0"},
        },
        timeout=30,
    )
    if not sid:
        raise SystemExit(f"initialize failed: {data}")
    SESSION_FILE.write_text(json.dumps({"session_id": sid}))
    return sid


def execute(sid: str, code: str, timeout: int = 180):
    sid, data, raw = rpc(
        "tools/call",
        {"name": "execute_code", "arguments": {"code": code}},
        sid,
        timeout=timeout,
    )
    return sid, data, raw


def extract_text(data: list) -> str:
    try:
        return data[0]["result"]["content"][0]["text"]
    except (IndexError, KeyError, TypeError):
        return json.dumps(data)[:4000]


def wait_for_plugin(sid: str, attempts: int = 8) -> str:
    probe = "return {file: penpot.currentFile && penpot.currentFile.name, page: penpot.currentPage && penpot.currentPage.name};"
    last = ""
    for i in range(attempts):
        sid, data, _ = execute(sid, probe, timeout=30)
        last = extract_text(data)
        if "No plugin instance connected" in last or "No userToken" in last:
            print(f"plugin not connected ({i + 1}/{attempts}): {last[:180]}")
            time.sleep(3)
            continue
        print("plugin connected:", last[:500])
        return sid
    raise SystemExit(last)


def load_phase(name: str) -> str:
    path = MCP_DIR / name
    code = path.read_text()
    if name in SHARED_PHASES:
        code = SHARED.read_text() + "\n" + code
    return code


def run_phase(sid: str, name: str) -> str:
    print(f"\n===== {name} =====")
    sid, data, _ = execute(sid, load_phase(name), timeout=180)
    text = extract_text(data)
    print(text[:8000])
    failed = text.startswith("Tool execution failed") or (
        text.lstrip().startswith("Error:") or text.startswith('{"error"')
    )
    if failed:
        raise SystemExit(f"{name} failed")
    return sid


def main() -> None:
    names = sys.argv[1:] or PHASES
    sid = initialize()
    sid = wait_for_plugin(sid)
    for name in names:
        sid = run_phase(sid, name)
    print("\nDesign system apply complete.")


if __name__ == "__main__":
    sys.exit(main())
