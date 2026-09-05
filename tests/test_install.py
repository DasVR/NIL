"""Finn Setup engine."""

from __future__ import annotations

import os
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
INSTALL = ROOT / "install"


def test_cli_wrapper_syntax():
    subprocess.check_call(["bash", "-n", str(INSTALL / "unix" / "install.sh")])
    subprocess.check_call(["bash", "-n", str(INSTALL / "macos" / "make-app.sh")])
    subprocess.check_call(["bash", "-n", str(INSTALL / "macos" / "setup-launcher.sh")])
    subprocess.check_call(["bash", "-n", str(INSTALL / "macos" / "make-pkg.sh")])
    subprocess.check_call(["bash", "-n", str(INSTALL / "macos" / "make-dmg.sh")])
    subprocess.check_call(["bash", "-n", str(INSTALL / "macos" / "pkg-scripts" / "postinstall")])
    subprocess.check_call(["bash", "-n", str(INSTALL / "macos" / "adhoc-sign.sh")])
    subprocess.check_call(["bash", "-n", str(INSTALL / "macos" / "strip-adhoc-signature.sh")])
    subprocess.check_call(["bash", "-n", str(INSTALL / "macos" / "fix-gatekeeper.command")])
    adhoc = (INSTALL / "macos" / "adhoc-sign.sh").read_text(encoding="utf-8")
    assert "--remove-signature" not in adhoc
    assert "codesign --force --deep --sign -" in adhoc
    strip = (INSTALL / "macos" / "strip-adhoc-signature.sh").read_text(encoding="utf-8")
    assert "adhoc-sign.sh" in strip
    assert "--remove-signature" not in strip
    gk = (INSTALL / "macos" / "fix-gatekeeper.command").read_text(encoding="utf-8")
    assert "codesign --force --deep --sign -" in gk
    post = (INSTALL / "macos" / "pkg-scripts" / "postinstall").read_text(encoding="utf-8")
    assert "codesign --force --deep --sign -" in post
    assert (INSTALL / "windows" / "launch.cmd").is_file()
    assert (INSTALL / "windows" / "setup.cmd").is_file()
    assert (INSTALL / "wizard.py").is_file()
    assert (INSTALL / "palette.py").is_file()
    assert (INSTALL / "catalog.py").is_file()
    assert (INSTALL / "catalog.json").is_file()
    desktop_bat = ROOT / "desktop" / "scripts" / "windows-install.bat"
    if desktop_bat.is_file():
        bat = desktop_bat.read_text(encoding="utf-8")
        assert "finn server" not in bat
        hooks = (ROOT / "desktop" / "src-tauri" / "windows" / "nsis-hooks.nsh").read_text(encoding="utf-8")
        assert "NSIS_HOOK_POSTINSTALL" in hooks
        assert "Finn.lnk" in hooks
        stager = (ROOT / "desktop" / "scripts" / "stage-windows-python.mjs").read_text(encoding="utf-8")
        assert "Expand-Archive" in stager
        assert "uvicorn[standard]" in stager
        assert "pip install" in stager and "apiDir" not in stager


def test_setup_gui_avoids_aqua_double_draw():
    src = (INSTALL / "wizard.py").read_text(encoding="utf-8")
    assert "tk.Radiobutton" not in src
    assert "tk.Checkbutton" not in src
    assert "scrolledtext" not in src
    assert "tkraise" in src
    assert "grid_remove" in src
    assert "create_text" in src
    assert "Who is installing?" in src
    assert "Where do the files come from?" in src
    assert "How should tools run?" in src
    assert "from catalog import" in src
    assert "Welcome era" in src
    assert '"Welcome"' in src
    assert "from palette import COLOR" in src
    assert "#07090d" not in src
    assert "#3dff8a" not in src


def test_macos_setup_app_bundles_launcher(tmp_path):
    out = tmp_path / "Finn Setup.app"
    subprocess.check_call(["bash", str(INSTALL / "macos" / "make-app.sh"), str(out)])
    exe = out / "Contents" / "MacOS" / "Finn Setup"
    assert exe.is_file()
    text = exe.read_text(encoding="utf-8")
    assert "pick_tk_python" in text
    assert "choose from list" in text
    assert (out / "Contents" / "Resources" / "wizard.py").is_file()
    assert (out / "Contents" / "Resources" / "engine.py").is_file()
    assert (out / "Contents" / "Resources" / "palette.py").is_file()
    assert (out / "Contents" / "Resources" / "catalog.py").is_file()
    assert (out / "Contents" / "Resources" / "catalog.json").is_file()
    assert "Who is installing?" in (out / "Contents" / "Resources" / "wizard.py").read_text(encoding="utf-8")
    subprocess.check_call(["bash", "-n", str(INSTALL / "macos" / "setup-launcher.sh")])
    launcher = (INSTALL / "macos" / "setup-launcher.sh").read_text(encoding="utf-8")
    assert "pick_tk_python" in launcher
    assert "choose from list" in launcher
    assert "tkinter" in launcher
    assert "--cli --user --offline --host" not in launcher
    make_app = (INSTALL / "macos" / "make-app.sh").read_text(encoding="utf-8")
    assert "setup-launcher.sh" in make_app
    assert "catalog.json" in make_app
    assert "--cli --user --offline --host" not in make_app


def test_palette_matches_web_tokens():
    css = (ROOT / "frontend" / "src" / "lib" / "styles" / "tokens.css").read_text(encoding="utf-8")
    assert "--nil-void:" in css
    assert "#08090a" in css
    assert "--brand-ember-500:" in css
    assert "#bd572d" in css
    assert "--sev-critical:" in css
    assert "--color-violet:" not in css


def test_find_wheel_in_dist(tmp_path):
    sys.path.insert(0, str(INSTALL))
    import engine

    artifact = tmp_path / "finn-python"
    dist = artifact / "dist"
    inst = artifact / "install"
    dist.mkdir(parents=True)
    inst.mkdir()
    wheel = dist / "finn_pentest-1.1.1-py3-none-any.whl"
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
    engine.adhoc_sign_macos_app(app)


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
        [sys.executable, str(INSTALL / "wizard.py"), "--cli", "--user", "--offline", "--host"],
        env=env,
        cwd=str(ROOT),
    )
    assert (prefix / "finn_pentest").is_dir()
    assert (prefix / "run-api.py").is_file()
    assert (tmp_path / "data" / "runtime.json").is_file()


def test_unix_cli_wrapper_offline_install(tmp_path, monkeypatch):
    prefix = tmp_path / "prefix"
    env = os.environ.copy()
    env["FINN_PREFIX"] = str(prefix)
    env["FINN_VENV"] = str(tmp_path / "venv")
    env["FINN_PENTEST_DIR"] = str(tmp_path / "data")
    env["PYTHONPATH"] = str(ROOT) + os.pathsep + env.get("PYTHONPATH", "")
    subprocess.check_call(
        ["bash", str(INSTALL / "unix" / "install.sh"), "--user", "--offline", "--host"],
        env=env,
        cwd=str(ROOT),
    )
    assert (prefix / "finn_pentest").is_dir()


def test_windows_user_paths_use_localappdata(tmp_path, monkeypatch):
    sys.path.insert(0, str(INSTALL))
    import engine

    monkeypatch.setattr(engine.sys, "platform", "win32")
    monkeypatch.delenv("FINN_PREFIX", raising=False)
    monkeypatch.setenv("LOCALAPPDATA", str(tmp_path / "AppData" / "Local"))
    paths = engine.paths_for("user")
    assert paths["prefix"].name == "Finn"
    assert paths["bindir"] == paths["prefix"]


def test_catalog_matches_web_copy():
    native = (INSTALL / "catalog.json").read_text(encoding="utf-8")
    web_copy = ROOT / "web" / "src" / "lib" / "install-catalog.json"
    if web_copy.is_file():
        assert native == web_copy.read_text(encoding="utf-8")
    sys.path.insert(0, str(INSTALL))
    import catalog

    data = catalog.load_catalog()
    assert [era["id"] for era in data["eras"]] == ["install", "welcome", "workstation"]
    for os_id, primary in (
        ("macos", "Finn-Setup.pkg"),
        ("windows", "Finn-Setup.exe"),
        ("linux", "Finn-Setup.deb"),
    ):
        spec = data["systems"][os_id]
        assert spec["primary"]["file"] == primary
        assert spec["first_launch"]
        assert spec["paths"]["user"]
        assert spec["headless"]
    assert catalog.welcome_line("darwin") == "Welcome. Finn is on this Mac."
    assert catalog.welcome_line("win32") == "Welcome. Finn is on this PC."
    assert catalog.welcome_line("linux") == "Welcome. Finn is on this computer."
    assert "Gatekeeper" in " ".join(catalog.launch_lines("darwin"))
    assert "SmartScreen" in " ".join(catalog.launch_lines("win32"))
    assert "AppImage" in " ".join(catalog.launch_lines("linux")) or "chmod" in data["systems"]["linux"]["also"][0]["action"]


def test_welcome_docs_exist():
    welcome = (ROOT / "docs" / "WELCOME.md").read_text(encoding="utf-8")
    assert "Install era" in welcome
    assert "Welcome era" in welcome
    assert "Workstation era" in welcome
    assert "catalog.json" in welcome
    ux = ROOT / "UX_REDESIGN.md"
    web_layout = ROOT / "web" / "src" / "routes" / "app" / "+layout.svelte"
    if not ux.is_file() or not web_layout.is_file():
        return
    assert "docs/WELCOME.md" in ux.read_text(encoding="utf-8")
    assert "SetupWizard" not in web_layout.read_text(encoding="utf-8")
    layout = (ROOT / "web" / "src" / "routes" / "app" / "+layout.svelte").read_text(encoding="utf-8")
    assert "WelcomeSheet" in layout
    empty = (ROOT / "web" / "src" / "lib" / "components" / "EmptyState.svelte").read_text(encoding="utf-8")
    assert "welcomeLine" in empty
    stores = (ROOT / "web" / "src" / "lib" / "stores.svelte.ts").read_text(encoding="utf-8")
    assert "seedWelcomeBlock" in stores
    assert "scope loaded" in stores

