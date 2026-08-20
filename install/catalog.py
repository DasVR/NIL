"""OS install catalog — one source of truth for Setup, docs, and tests."""

from __future__ import annotations

import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
CATALOG_PATH = HERE / "catalog.json"


def load_catalog() -> dict:
    return json.loads(CATALOG_PATH.read_text(encoding="utf-8"))


def host_system_id(platform: str | None = None) -> str:
    plat = platform or sys.platform
    if plat == "darwin":
        return "macos"
    if plat == "win32":
        return "windows"
    if plat.startswith("linux"):
        return "linux"
    return "linux"


def system_entry(platform: str | None = None, catalog: dict | None = None) -> dict:
    data = catalog or load_catalog()
    return data["systems"][host_system_id(platform)]


def welcome_line(platform: str | None = None) -> str:
    spec = system_entry(platform)
    return f"Welcome. Finn is on {spec['here']}."


def launch_lines(platform: str | None = None) -> list[str]:
    spec = system_entry(platform)
    return list(spec.get("first_launch") or [])
