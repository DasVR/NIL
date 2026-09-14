"""The /v1/workspace/* bridge — the production port of vite-plugin-nil-workspace."""

from __future__ import annotations

import json
import os
import subprocess
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from finn_pentest.api.app import create_app
from finn_pentest.api.workspace_routes import (
    parse_ci,
    parse_github_repo,
    parse_porcelain,
    safe_path,
    servers_from_mcp_json,
)


@pytest.fixture()
def root(tmp_path: Path, monkeypatch: pytest.MonkeyPatch, finn_home) -> Path:
    ws = tmp_path / "ws"
    (ws / "src" / "lib").mkdir(parents=True)
    (ws / "src" / "lib" / "api.ts").write_text("export const x = 1;\n", encoding="utf-8")
    (ws / "README.md").write_text("# hi\n", encoding="utf-8")
    (ws / ".env").write_text("SECRET=1\n", encoding="utf-8")
    (ws / "server.key").write_text("---\n", encoding="utf-8")
    (ws / "logo.png").write_bytes(b"\x89PNG")
    (ws / "node_modules").mkdir()
    (ws / "node_modules" / "dep.js").write_text("x", encoding="utf-8")
    (ws / ".hidden").mkdir()
    (ws / ".hidden" / "f.txt").write_text("x", encoding="utf-8")
    monkeypatch.setenv("NIL_WORKSPACE_ROOT", str(ws))
    return ws


@pytest.fixture()
def client(root: Path) -> TestClient:
    return TestClient(create_app())


# --- safe_path: the guard --------------------------------------------------------


def test_safe_path_accepts_ordinary_relative_paths(root: Path):
    assert safe_path(root, "src/lib/api.ts") == root / "src" / "lib" / "api.ts"
    assert safe_path(root, ".") == root


@pytest.mark.parametrize(
    "rel",
    [
        "",
        "..",
        "../etc/passwd",
        "src/../../etc/passwd",
        "src/../ok.txt",
        "a/b/c/../../../../x",
        "..\\..\\windows\\win.ini",
        "src\\..\\..\\secret",
        "src/ok.ts\0.png",
        "\0",
    ],
)
def test_safe_path_rejects_traversal_and_nul(root: Path, rel: str):
    assert safe_path(root, rel) is None


def test_safe_path_normalises_backslashes(root: Path):
    assert safe_path(root, "src\\lib\\api.ts") == root / "src" / "lib" / "api.ts"


def test_safe_path_treats_leading_slash_as_relative(root: Path):
    assert safe_path(root, "/etc/passwd") == root / "etc" / "passwd"
    assert safe_path(root, "///src/x.ts") == root / "src" / "x.ts"


def test_safe_path_keeps_dots_inside_segment_names(root: Path):
    assert safe_path(root, "notes..md") == root / "notes..md"
    assert safe_path(root, ".env.example") == root / ".env.example"
    assert safe_path(root, "a/.../b") == root / "a" / "..." / "b"


def test_safe_path_rejects_sibling_sharing_root_prefix(root: Path):
    sibling = Path(str(root) + "-evil")
    assert safe_path(root, os.path.relpath(sibling, root)) is None


def test_safe_path_blocks_symlink_escape(root: Path, tmp_path: Path):
    outside = tmp_path / "outside"
    outside.mkdir()
    (outside / "secret.txt").write_text("nope", encoding="utf-8")
    (root / "escape").symlink_to(outside, target_is_directory=True)
    # Lexically inside the root; physically outside it. The Vite plugin would
    # have allowed this — the port is stronger here.
    assert safe_path(root, "escape/secret.txt") is None
    assert safe_path(root, "escape") is None


def test_safe_path_allows_symlink_that_stays_inside(root: Path):
    (root / "alias").symlink_to(root / "src", target_is_directory=True)
    assert safe_path(root, "alias/lib/api.ts") == root / "alias" / "lib" / "api.ts"


# --- routes ------------------------------------------------------------------


def test_files_lists_tree_and_skips_secrets_binaries_hidden(client: TestClient, root: Path):
    res = client.get("/v1/workspace/files")
    assert res.status_code == 200
    body = res.json()
    assert body["ok"] is True
    assert body["root"] == root.name
    assert body["files"] == ["README.md", "src/lib/api.ts"]


def test_file_read_ok(client: TestClient):
    res = client.get("/v1/workspace/file", params={"path": "src/lib/api.ts"})
    assert res.status_code == 200
    assert res.json() == {
        "ok": True,
        "path": "src/lib/api.ts",
        "content": "export const x = 1;\n",
        "truncated": False,
    }


def test_file_read_traversal_is_400(client: TestClient):
    res = client.get("/v1/workspace/file", params={"path": "../etc/passwd"})
    assert res.status_code == 400
    assert res.json() == {"ok": False, "error": "Path is outside the workspace."}


def test_file_read_missing_is_404(client: TestClient):
    res = client.get("/v1/workspace/file", params={"path": "nope.txt"})
    assert res.status_code == 404
    assert res.json()["error"] == "File not found."


def test_file_read_secret_is_403(client: TestClient):
    res = client.get("/v1/workspace/file", params={"path": ".env"})
    assert res.status_code == 403
    assert res.json()["error"] == "That file is not readable here."
    res = client.get("/v1/workspace/file", params={"path": "server.key"})
    assert res.status_code == 403


def test_file_write_roundtrip(client: TestClient, root: Path):
    res = client.put("/v1/workspace/file", json={"path": "src/new.ts", "content": "hello\n"})
    assert res.status_code == 200
    assert res.json() == {"ok": True, "path": "src/new.ts"}
    assert (root / "src" / "new.ts").read_text(encoding="utf-8") == "hello\n"
    # POST is an alias for PUT, as in the Vite plugin.
    res = client.post("/v1/workspace/file", json={"path": "src/new.ts", "content": "again\n"})
    assert res.status_code == 200
    assert (root / "src" / "new.ts").read_text(encoding="utf-8") == "again\n"


def test_file_write_refuses_traversal_secret_binary_missing_parent(client: TestClient, root: Path):
    res = client.put("/v1/workspace/file", json={"path": "../x.txt", "content": "x"})
    assert res.status_code == 400
    res = client.put("/v1/workspace/file", json={"path": ".env", "content": "x"})
    assert res.status_code == 403
    assert res.json()["error"] == "That file is not writable here."
    res = client.put("/v1/workspace/file", json={"path": "img.png", "content": "x"})
    assert res.status_code == 403
    res = client.put("/v1/workspace/file", json={"path": "no/such/dir/f.txt", "content": "x"})
    assert res.status_code == 404
    assert res.json()["error"] == "Parent folder is not in the workspace."
    res = client.put("/v1/workspace/file", json={"path": "src/x.txt"})
    assert res.status_code == 400
    assert res.json()["error"] == "Missing content."
    res = client.put("/v1/workspace/file", json={"path": "src/x.txt", "content": "x" * 400_001})
    assert res.status_code == 413
    assert not (root / "x.txt").exists()


def test_file_write_refuses_symlinked_parent_outside_root(client: TestClient, root: Path, tmp_path: Path):
    outside = tmp_path / "elsewhere"
    outside.mkdir()
    (root / "src" / "out").symlink_to(outside, target_is_directory=True)
    res = client.put("/v1/workspace/file", json={"path": "src/out/pwned.txt", "content": "x"})
    assert res.status_code == 400
    assert not (outside / "pwned.txt").exists()


def test_git_route_outside_a_repo(client: TestClient):
    res = client.get("/v1/workspace/git")
    assert res.status_code == 200
    assert res.json() == {"ok": True, "git": False}


def _git(root: Path, *args: str) -> None:
    subprocess.run(
        ["git", *args],
        cwd=root,
        check=True,
        capture_output=True,
        env={**os.environ, "GIT_AUTHOR_NAME": "t", "GIT_AUTHOR_EMAIL": "t@x", "GIT_COMMITTER_NAME": "t", "GIT_COMMITTER_EMAIL": "t@x"},
    )


def test_git_route_reports_branch_status_and_diff(client: TestClient, root: Path):
    _git(root, "init", "-q", "-b", "main")
    _git(root, "add", "README.md")
    _git(root, "commit", "-q", "-m", "init")
    (root / "README.md").write_text("# hi\nchanged\n", encoding="utf-8")
    (root / "src" / "lib" / "api.ts").write_text("export const x = 2;\n", encoding="utf-8")
    _git(root, "add", "src/lib/api.ts")
    res = client.get("/v1/workspace/git")
    assert res.status_code == 200
    body = res.json()
    assert body["ok"] and body["git"] is True
    assert body["branch"] == "main"
    assert {"path": "src/lib/api.ts", "status": "A"} in body["staged"]
    assert {"path": "README.md", "status": "M"} in body["unstaged"]
    assert "+changed" in body["diff"]
    assert body["truncated"] is False
    assert body["ahead"] is None and body["behind"] is None  # no upstream
    assert isinstance(body["ghAvailable"], bool)
    assert "ci" in body and "ciLoaded" in body


def test_github_route_without_github_remote(client: TestClient, root: Path):
    _git(root, "init", "-q", "-b", "main")
    res = client.get("/v1/workspace/github")
    assert res.json() == {"ok": True, "github": False}


def test_mcp_route_discovers_servers_and_dedupes(client: TestClient, root: Path):
    (root / ".cursor").mkdir()
    (root / ".cursor" / "mcp.json").write_text(
        json.dumps({"mcpServers": {"figma": {"url": "https://mcp.figma.com"}, "fs": {"command": "npx", "args": ["fs-mcp", "."]}}}),
        encoding="utf-8",
    )
    (root / ".mcp.json").write_text(
        json.dumps({"servers": {"figma": {"url": "dup"}, "git": {}}}), encoding="utf-8"
    )
    res = client.get("/v1/workspace/mcp")
    assert res.status_code == 200
    body = res.json()
    assert body["ok"] and body["mcp"] is True
    assert body["servers"] == [
        {"id": "figma", "name": "figma", "description": "https://mcp.figma.com", "source": ".cursor/mcp.json"},
        {"id": "fs", "name": "fs", "description": "npx fs-mcp .", "source": ".cursor/mcp.json"},
        {"id": "git", "name": "git", "description": ".mcp.json", "source": ".mcp.json"},
    ]


def test_workspace_routes_respect_api_key(root: Path, monkeypatch: pytest.MonkeyPatch):
    monkeypatch.setenv("PENTEST_API_KEY", "s3cret")
    import finn_pentest.api.auth as auth
    import finn_pentest.core.config as config

    monkeypatch.setattr(config, "PENTEST_API_KEY", "s3cret")
    monkeypatch.setattr(auth, "PENTEST_API_KEY", "s3cret")
    client = TestClient(create_app())
    assert client.get("/v1/workspace/files").status_code == 401
    assert client.get("/v1/workspace/files", headers={"Authorization": "Bearer s3cret"}).status_code == 200


# --- pure parsers ------------------------------------------------------------


def test_parse_porcelain():
    staged, unstaged = parse_porcelain("M  a.txt\n M b.txt\n?? c.txt\nMM d.txt\n")
    assert staged == [{"path": "a.txt", "status": "M"}, {"path": "d.txt", "status": "M"}]
    assert unstaged == [
        {"path": "b.txt", "status": "M"},
        {"path": "c.txt", "status": "?"},
        {"path": "d.txt", "status": "M"},
    ]


def test_parse_ci_prefers_current_branch_and_strips_workflow_suffix():
    raw = json.dumps(
        [
            {"name": ".github/workflows/ci.yml", "status": "completed", "conclusion": "success", "headBranch": "other", "url": "u1"},
            {"name": "Deploy.yaml", "status": "in_progress", "conclusion": None, "headBranch": "main", "url": "u2"},
        ]
    )
    ci, loaded = parse_ci(raw, "main")
    assert loaded is True
    assert ci == {"name": "Deploy", "status": "in_progress", "conclusion": None, "url": "u2", "branch": "main"}
    assert parse_ci(None, "main") == (None, False)
    assert parse_ci("[]", "main") == (None, True)
    assert parse_ci("not json", "main") == (None, False)


def test_parse_github_repo():
    assert parse_github_repo("git@github.com:DasVR/NIL.git") == "DasVR/NIL"
    assert parse_github_repo("https://github.com/DasVR/NIL") == "DasVR/NIL"
    assert parse_github_repo("https://gitlab.com/x/y.git") is None


def test_servers_from_mcp_json_tolerates_garbage():
    assert servers_from_mcp_json("{", "s") == []
    assert servers_from_mcp_json("[]", "s") == []
    assert servers_from_mcp_json(json.dumps({"mcpServers": []}), "s") == []
