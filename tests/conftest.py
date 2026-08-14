"""Shared pytest fixtures."""

from __future__ import annotations

import os
from pathlib import Path

import pytest


@pytest.fixture()
def finn_home(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> Path:
    home = tmp_path / "finn-home"
    home.mkdir()
    monkeypatch.setenv("FINN_PENTEST_DIR", str(home))
    monkeypatch.setenv("FINN_PENTEST_MASTER_KEY", "test-key")
    monkeypatch.delenv("PENTEST_API_KEY", raising=False)
    monkeypatch.delenv("GODMODE_API_KEY", raising=False)
    from finn_pentest.core import db
    from finn_pentest.plugins import loader

    loader._loaded_plugins = {}
    db.init_db()
    return home
