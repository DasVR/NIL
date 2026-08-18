"""Installer scripts and bundled API launcher."""

from __future__ import annotations

import os
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def test_posix_installer_syntax():
    script = ROOT / "install" / "finn-install.sh"
    subprocess.check_call(["bash", "-n", str(script)])


def test_run_api_check():
    launcher = ROOT / "install" / "run-api.py"
    env = os.environ.copy()
    env["FINN_API_ROOT"] = str(ROOT)
    env["PYTHONPATH"] = str(ROOT) + os.pathsep + env.get("PYTHONPATH", "")
    out = subprocess.check_output([sys.executable, str(launcher), "--check"], env=env, text=True)
    assert "ok api_root=" in out


def test_stage_api_script_exists():
    assert (ROOT / "desktop" / "scripts" / "stage-api.mjs").is_file()
    assert (ROOT / "install" / "finn-install.ps1").is_file()
