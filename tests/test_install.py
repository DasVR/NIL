"""Finn Setup engine."""

from __future__ import annotations

import os
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
INSTALL = ROOT / "install"


def test_cli_wrapper_syntax():
    subprocess.check_call(["bash", "-n", str(INSTALL / "finn-install.sh")])
    subprocess.check_call(["bash", "-n", str(INSTALL / "macos" / "make-setup-app.sh")])


def test_find_wheel_in_dist(tmp_path):
    sys.path.insert(0, str(INSTALL))
    import engine

    artifact = tmp_path / "finn-python"
    dist = artifact / "dist"
    inst = artifact / "install"
    dist.mkdir(parents=True)
    inst.mkdir()
    wheel = dist / "finn_pentest-0.1.0-py3-none-any.whl"
    wheel.write_bytes(b"PK\x03\x04")
    found = engine.find_wheel(inst)
    assert found == wheel.resolve()


def test_ignores_unrelated_apps(tmp_path):
    sys.path.insert(0, str(INSTALL))
    import engine

    downloads = tmp_path / "Downloads"
    artifact = downloads / "finn-python" / "install"
    artifact.mkdir(parents=True)
    talkify = downloads / "Talkify.app"
    (talkify / "Contents").mkdir(parents=True)
    (talkify / "Contents" / "Info.plist").write_text(
        "<plist><dict><key>CFBundleIdentifier</key><string>com.talkify.app</string></dict></plist>\n"
    )
    finn = artifact.parent / "Finn Pentest Harness.app"
    (finn / "Contents").mkdir(parents=True)
    (finn / "Contents" / "Info.plist").write_text(
        "<plist><dict><key>CFBundleIdentifier</key><string>ai.finn.pentest</string></dict></plist>\n"
    )
    setup = artifact.parent / "Finn Setup.app"
    (setup / "Contents").mkdir(parents=True)
    (setup / "Contents" / "Info.plist").write_text(
        "<plist><dict><key>CFBundleIdentifier</key><string>ai.finn.pentest.setup</string></dict></plist>\n"
    )
    assert engine.is_finn_workstation(finn)
    assert not engine.is_finn_workstation(talkify)
    assert not engine.is_finn_workstation(setup)


def test_find_api_from_install_dir():
    sys.path.insert(0, str(INSTALL))
    import engine

    found = engine.find_api_src(INSTALL)
    assert found is not None
    assert (found / "finn_pentest").is_dir()


def test_cli_offline_install(tmp_path, monkeypatch):
    prefix = tmp_path / "prefix"
    monkeypatch.setenv("FINN_PREFIX", str(prefix))
    monkeypatch.setenv("FINN_VENV", str(tmp_path / "venv"))
    monkeypatch.setenv("FINN_PENTEST_DIR", str(tmp_path / "data"))
    env = os.environ.copy()
    env["FINN_PREFIX"] = str(prefix)
    env["FINN_VENV"] = str(tmp_path / "venv")
    env["FINN_PENTEST_DIR"] = str(tmp_path / "data")
    env["PYTHONPATH"] = str(ROOT) + os.pathsep + env.get("PYTHONPATH", "")
    subprocess.check_call(
        [sys.executable, str(INSTALL / "finn-setup.py"), "--cli", "--user", "--offline", "--host"],
        env=env,
        cwd=str(ROOT),
    )
    assert (prefix / "finn_pentest").is_dir()
    assert (prefix / "run-api.py").is_file()
    assert (tmp_path / "data" / "runtime.json").is_file()
