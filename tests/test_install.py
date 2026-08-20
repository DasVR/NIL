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
    subprocess.check_call(["bash", "-n", str(INSTALL / "macos" / "make-pkg.sh")])
    subprocess.check_call(["bash", "-n", str(INSTALL / "macos" / "make-setup-dmg.sh")])
    subprocess.check_call(["bash", "-n", str(INSTALL / "macos" / "pkg-scripts" / "postinstall")])
    subprocess.check_call(["bash", "-n", str(INSTALL / "macos" / "strip-adhoc-signature.sh")])
    subprocess.check_call(["bash", "-n", str(INSTALL / "macos" / "Fix macOS Gatekeeper.command")])
    assert (INSTALL / "windows" / "Launch Finn.cmd").is_file()
    bat = (ROOT / "desktop" / "scripts" / "windows-install.bat").read_text(encoding="utf-8")
    assert "finn server" not in bat
    hooks = (ROOT / "desktop" / "src-tauri" / "windows" / "nsis-hooks.nsh").read_text(encoding="utf-8")
    assert "NSIS_HOOK_POSTINSTALL" in hooks
    assert "Finn.lnk" in hooks
    stager = (ROOT / "desktop" / "scripts" / "stage-windows-python.mjs").read_text(encoding="utf-8")
    assert "Expand-Archive" in stager
    assert "uvicorn[standard]" in stager
    assert "pip install" in stager and "apiDir" not in stager


def test_setup_gui_avoids_aqua_double_draw():
    src = (INSTALL / "finn-setup.py").read_text(encoding="utf-8")
    assert "tk.Radiobutton" not in src
    assert "tk.Checkbutton" not in src
    assert "scrolledtext" not in src
    assert "tkraise" in src
    assert "grid_remove" in src


def test_find_wheel_in_dist(tmp_path):
    sys.path.insert(0, str(INSTALL))
    import engine

    artifact = tmp_path / "finn-python"
    dist = artifact / "dist"
    inst = artifact / "install"
    dist.mkdir(parents=True)
    inst.mkdir()
    wheel = dist / "finn_pentest-1.0.0-py3-none-any.whl"
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
    cursor = tmp_path / "Applications" / "Cursor.app"
    (cursor / "Contents").mkdir(parents=True)
    (cursor / "Contents" / "Info.plist").write_text(
        "<plist><dict><key>CFBundleIdentifier</key><string>com.todesktop.230313mzl4w4u92</string></dict></plist>\n"
    )
    assert not engine.is_finn_workstation(cursor)
    assert engine.is_applications_dir(cursor.parent)


def test_clear_macos_quarantine_is_safe(tmp_path):
    sys.path.insert(0, str(INSTALL))
    import engine

    app = tmp_path / "Finn Pentest Harness.app"
    app.mkdir()
    engine.clear_macos_quarantine(app)


def test_is_zip_file(tmp_path):
    sys.path.insert(0, str(INSTALL))
    import engine

    zpath = tmp_path / "ok.zip"
    zpath.write_bytes(b"PK\x03\x04" + b"\x00" * 8)
    dmg = tmp_path / "disk.dmg"
    dmg.write_bytes(b"koly" + b"\x00" * 8)
    assert engine.is_zip_file(zpath)
    assert not engine.is_zip_file(dmg)


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


def test_windows_user_paths_use_localappdata(tmp_path, monkeypatch):
    sys.path.insert(0, str(INSTALL))
    import engine

    monkeypatch.setattr(engine.sys, "platform", "win32")
    monkeypatch.delenv("FINN_PREFIX", raising=False)
    monkeypatch.setenv("LOCALAPPDATA", str(tmp_path / "AppData" / "Local"))
    paths = engine.paths_for("user")
    assert paths["prefix"].name == "Finn"
    assert paths["bindir"] == paths["prefix"]
