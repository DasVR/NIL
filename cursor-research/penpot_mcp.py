#!/usr/bin/env python3
"""Penpot MCP client helper — maintains a session across RPC calls.

Usage:
  penpot.py initialize          -> start a session, print session id
  penpot.py tools               -> list available MCP tools
  penpot.py call <method> <json-args>   -> call a tool/method
  penpot.py call tools/list '{}'
  penpot.py call high_level_overview '{}'
  penpot.py call penpot.files.list '{}'
"""
import json, sys, urllib.request, urllib.error, os

TOKEN_FILE = "/home/das/.penpot_mcp_token"
BASE = "https://penpot.dasdev.net"
ENDPOINT = f"{BASE}/mcp/stream"
SESSION_FILE = "/home/das/.penpot_mcp_session"

def load_token():
    with open(TOKEN_FILE) as f:
        return f.read().strip()

def load_session():
    if os.path.exists(SESSION_FILE):
        with open(SESSION_FILE) as f:
            return json.load(f).get("session_id")
    return None

def save_session(sid):
    with open(SESSION_FILE, "w") as f:
        json.dump({"session_id": sid}, f)

def rpc(method, params, sid=None):
    token = load_token()
    payload = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": method,
        "params": params or {}
    }
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
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            sid2 = r.headers.get("mcp-session-id", sid)
            body = r.read().decode('utf-8', errors='ignore')
            return sid2, body
    except urllib.error.HTTPError as e:
        return None, f"HTTP {e.code}: {e.read(500).decode('utf-8', errors='ignore')}"
    except Exception as e:
        return None, f"ERR {type(e).__name__}: {e}"

def parse_event_stream(body):
    """Parse SSE 'event: message\\ndata: {...}' blocks."""
    results = []
    for block in body.split("event: message"):
        for line in block.splitlines():
            if line.startswith("data: "):
                try:
                    results.append(json.loads(line[6:]))
                except Exception:
                    pass
    return results

if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else "initialize"
    if cmd == "initialize":
        sid, body = rpc("initialize", {
            "protocolVersion": "2024-11-05",
            "capabilities": {},
            "clientInfo": {"name": "finn-nil", "version": "0.1.0"}
        })
        print("SESSION:", sid)
        print(body)
        if sid:
            save_session(sid)
    elif cmd == "notifications/initialized":
        sid = load_session()
        sid2, body = rpc("notifications/initialized", {}, sid)
        print("SESSION:", sid2)
        print(body)
    elif cmd == "tools":
        sid = load_session()
        sid2, body = rpc("tools/list", {}, sid)
        print(body)
    elif cmd == "call":
        # tools are invoked via tools/call
        tool_name = sys.argv[2]
        args = json.loads(sys.argv[3]) if len(sys.argv) > 3 else {}
        sid = load_session()
        sid2, body = rpc("tools/call", {"name": tool_name, "arguments": args}, sid)
        print("SESSION:", sid2)
        print(body)
    else:
        print("unknown command")
