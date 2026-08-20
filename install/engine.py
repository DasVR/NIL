"""Shared Finn install engine. No network via Python urllib — curl only."""

from __future__ import annotations

import json
import os
import shutil
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Callable

REPO = os.environ.get("FINN_REPO", "DasVR/finn-pentest-harness")
SETUP_VERSION = "1.1.1"
Progress = Callable[[int, str], None]

DOCKER_TOS = """Docker sandbox terms

Finn can run approved commands inside a Docker container on this computer. That uses your machine as the sandbox host.

• Docker Desktop / Engine typically requires administrator rights to install and to speak to the Docker daemon.
• Isolation is engagement separation, not a hypervisor jail.
• You are responsible for authorized testing only and for resource use.

I understand and accept these terms."""


def home() -> Path:
    return Path.home()


def data_dir() -> Path:
    raw = os.environ.get("FINN_PENTEST_DIR", str(home() / ".finn-pentest"))
    return Path(raw).expanduser().resolve()


def paths_for(privilege: str) -> dict[str, Path]:
    override = os.environ.get("FINN_PREFIX")
    if override:
        prefix = Path(override).expanduser().resolve()
        bindir = prefix / "bin"
        appdir = prefix / "Applications"
        venv = Path(os.environ.get("FINN_VENV", str(prefix / "venv")))
        return {"prefix": prefix, "bindir": bindir, "appdir": appdir, "venv": venv}
    if privilege == "admin":
        if sys.platform == "win32":
            prefix = Path(os.environ.get("ProgramFiles", r"C:\Program Files")) / "Finn"
        else:
            prefix = Path("/usr/local/finn")
        bindir = Path("/usr/local/bin") if sys.platform != "win32" else prefix
        appdir = Path("/Applications") if sys.platform == "darwin" else prefix
        venv = prefix / "venv"
    else:
        if sys.platform == "win32":
            prefix = Path(os.environ.get("LOCALAPPDATA", str(home() / "AppData/Local"))) / "Finn"
        else:
            prefix = home() / ".local" / "finn"
        bindir = Path(os.environ.get("XDG_BIN_HOME", str(home() / ".local/bin")))
        if sys.platform == "win32":
            bindir = prefix
        appdir = home() / "Applications" if sys.platform == "darwin" else prefix
        venv = data_dir() / "venv"
    return {"prefix": prefix, "bindir": bindir, "appdir": appdir, "venv": venv}


def is_applications_dir(path: Path) -> bool:
    """~/Applications and /Applications are DESTINATIONS, never search sources."""
    try:
        path = path.resolve()
    except OSError:
        return False
    return path.name == "Applications"


def walk_roots(start: Path | None = None) -> list[Path]:
    here = Path(start or __file__).resolve().parent
    env = os.environ.get("FINN_SETUP_PAYLOAD")
    roots: list[Path] = []
    if env:
        roots.append(Path(env).expanduser().resolve())
    for candidate in (
        here,
        here / "payload",
        here / "dist",
        here.parent,
        here.parent / "api",
        here.parent / "dist",
        here.parent.parent,
        here.parent.parent / "api",
        here.parent.parent / "dist",
        Path.cwd(),
        Path.cwd() / "api",
        Path.cwd() / "dist",
    ):
        try:
            resolved = candidate.resolve()
        except OSError:
            continue
        if resolved == home() or resolved == Path("/") or is_applications_dir(resolved):
            continue
        if resolved not in roots:
            roots.append(resolved)
    return roots


def find_api_src(start: Path | None = None) -> Path | None:
    for root in walk_roots(start):
        if (root / "finn_pentest").is_dir():
            return root
        if (root / "api" / "finn_pentest").is_dir():
            return root / "api"
    return None


def find_run_api(start: Path | None = None) -> Path | None:
    for root in walk_roots(start):
        for path in (root / "run-api.py", root / "install" / "run-api.py"):
            if path.is_file():
                return path
    bundled = Path(__file__).resolve().parent / "run-api.py"
    return bundled if bundled.is_file() else None


def is_finn_workstation(app: Path) -> bool:
    """True only for a Finn workstation bundle that is not already in Applications."""
    try:
        app = app.resolve()
    except OSError:
        return False
    if not app.is_dir() or app.suffix != ".app":
        return False
    if is_applications_dir(app.parent):
        return False
    name = app.name.lower()
    if "setup" in name:
        return False
    plist = app / "Contents" / "Info.plist"
    if plist.is_file():
        try:
            text = plist.read_text(encoding="utf-8", errors="ignore")
        except OSError:
            text = ""
        if "ai.finn.pentest.setup" in text:
            return False
        if "ai.finn.pentest" in text:
            return True
    return "finn" in name and "pentest" in name


def find_macos_app(start: Path | None = None) -> Path | None:
    if sys.platform != "darwin":
        return None
    here = Path(start or __file__).resolve().parent
    env = os.environ.get("FINN_SETUP_PAYLOAD")
    roots: list[Path] = []
    if env:
        roots.append(Path(env).expanduser().resolve())
    # Kit folder and payload only — do not scan ~/Downloads for the first .app.
    for candidate in (here, here / "payload", here.parent, here.parent / "payload"):
        try:
            resolved = candidate.resolve()
        except OSError:
            continue
        if is_applications_dir(resolved) or resolved == home() or resolved == Path("/"):
            continue
        if resolved not in roots:
            roots.append(resolved)
    hits: list[Path] = []
    for root in roots:
        if is_finn_workstation(root):
            hits.append(root)
            continue
        if not root.is_dir():
            continue
        try:
            children = list(root.iterdir())
        except OSError:
            continue
        for item in children:
            if is_finn_workstation(item):
                hits.append(item)
        for item in root.glob("*/*.app"):
            if is_finn_workstation(item):
                hits.append(item)
    seen: set[Path] = set()
    unique: list[Path] = []
    for path in hits:
        if path not in seen:
            seen.add(path)
            unique.append(path)
    return unique[0] if unique else None


def find_wheel(start: Path | None = None) -> Path | None:
    skip = {"site-packages", ".venv", "venv", "node_modules"}
    found: list[Path] = []
    for root in walk_roots(start):
        if not root.is_dir():
            continue
        for pattern in ("*.whl", "dist/*.whl", "api/*.whl", "install/*.whl"):
            found.extend(root.glob(pattern))
        try:
            for path in root.rglob("*.whl"):
                if skip.intersection(path.parts):
                    continue
                try:
                    if len(path.relative_to(root).parts) > 4:
                        continue
                except ValueError:
                    continue
                found.append(path)
        except OSError:
            continue
    files = []
    seen: set[Path] = set()
    for path in found:
        try:
            resolved = path.resolve()
        except OSError:
            continue
        if resolved.is_file() and resolved not in seen:
            seen.add(resolved)
            files.append(resolved)
    return files[0] if files else None


def python_bin() -> str:
    return sys.executable


def run(cmd: list[str], **kwargs) -> subprocess.CompletedProcess[str]:
    return subprocess.run(cmd, check=True, text=True, capture_output=True, **kwargs)


def curl_bytes(url: str, dest: Path | None = None) -> bytes:
    cmd = ["curl", "-fsSL", "-A", "Finn-Setup", "--retry", "3", url]
    if dest:
        dest.parent.mkdir(parents=True, exist_ok=True)
        subprocess.check_call(["curl", "-fsSL", "-A", "Finn-Setup", "--retry", "3", "-o", str(dest), url])
        return dest.read_bytes()
    return subprocess.check_output(cmd)


def github_asset_url(needle: str, tag: str = "latest", *, suffix: str | None = None) -> str | None:
    if tag == "latest":
        api = f"https://api.github.com/repos/{REPO}/releases/latest"
    else:
        api = f"https://api.github.com/repos/{REPO}/releases/tags/{tag}"
    try:
        raw = curl_bytes(api)
    except (subprocess.CalledProcessError, FileNotFoundError):
        return None
    data = json.loads(raw.decode())
    needle_l = needle.lower()
    suffix_l = suffix.lower() if suffix else None
    for asset in data.get("assets") or []:
        name = str(asset.get("name", "")).lower()
        if needle_l not in name:
            continue
        if suffix_l and not name.endswith(suffix_l):
            continue
        return asset.get("browser_download_url")
    return None


def is_zip_file(path: Path) -> bool:
    try:
        with path.open("rb") as handle:
            magic = handle.read(4)
    except OSError:
        return False
    return magic[:2] == b"PK"


def copytree(src: Path, dest: Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    if dest.exists():
        if dest.is_dir() and not dest.is_symlink():
            shutil.rmtree(dest)
        else:
            dest.unlink()
    if src.is_dir():
        shutil.copytree(src, dest, dirs_exist_ok=True)
    else:
        shutil.copy2(src, dest)


def write_runtime(privilege: str, channel: str, sandbox: str, accept_tos: bool) -> Path:
    dest = data_dir()
    dest.mkdir(parents=True, exist_ok=True)
    now = datetime.now(timezone.utc).isoformat() if sandbox == "docker" and accept_tos else None
    payload = {
        "schema": 1,
        "setup_complete": True,
        "variant": "docker" if sandbox == "docker" else "bundled",
        "privilege": privilege,
        "channel": channel,
        "sandbox": sandbox,
        "features": {"ai": True, "tui": True, "bundled_api": True, "docker": sandbox == "docker"},
        "docker_tos_accepted": sandbox == "docker" and accept_tos,
        "docker_tos_accepted_at": now,
    }
    path = dest / "runtime.json"
    path.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    return path


def write_cli_wrapper(bindir: Path, prefix: Path, venv: Path) -> Path:
    bindir.mkdir(parents=True, exist_ok=True)
    if sys.platform == "win32":
        path = bindir / "finn-api.cmd"
        path.write_text(
            f"@echo off\nset FINN_API_ROOT={prefix}\nset FINN_VENV={venv}\n"
            f'"{python_bin()}" "{prefix / "run-api.py"}" %*\n',
            encoding="utf-8",
        )
        return path
    path = bindir / "finn-api"
    path.write_text(
        "#!/usr/bin/env bash\n"
        f'export FINN_API_ROOT="{prefix}"\n'
        f'export FINN_VENV="{venv}"\n'
        f'exec "{python_bin()}" "{prefix / "run-api.py"}" "$@"\n',
        encoding="utf-8",
    )
    path.chmod(path.stat().st_mode | 0o111)
    return path


def install_macos_app(app: Path, appdir: Path, progress: Progress) -> Path:
    if not is_finn_workstation(app):
        raise RuntimeError(f"Refusing to install {app.name} — it is not Finn Pentest Harness.")
    appdir.mkdir(parents=True, exist_ok=True)
    dest = appdir / app.name
    progress(78, f"Installing {app.name} → {dest}")
    if dest.exists():
        shutil.rmtree(dest)
    if shutil.which("ditto"):
        subprocess.check_call(["ditto", str(app), str(dest)])
    else:
        shutil.copytree(app, dest)
    clear_macos_quarantine(dest)
    adhoc_sign_macos_app(dest)
    return dest


def clear_macos_quarantine(path: Path) -> None:
    """Drop com.apple.quarantine so Gatekeeper does not block a GitHub download."""
    xattr = shutil.which("xattr")
    if not xattr or not path.exists():
        return
    subprocess.call([xattr, "-cr", str(path)], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


def adhoc_sign_macos_app(path: Path) -> None:
    """Ad-hoc-sign a .app so Apple Silicon will launch it. No-op off macOS."""
    if sys.platform != "darwin" or not path.exists():
        return
    clear_macos_quarantine(path)
    codesign = shutil.which("codesign")
    if not codesign or not path.is_dir() or path.suffix != ".app":
        return
    ent = path / "Contents" / "Resources" / "Entitlements.plist"
    cmd = [codesign, "--force", "--deep", "--sign", "-"]
    if ent.is_file():
        cmd.extend(["--entitlements", str(ent)])
    cmd.append(str(path))
    subprocess.call(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


def unpack_zip(archive: Path, dest: Path) -> None:
    dest.mkdir(parents=True, exist_ok=True)
    if not is_zip_file(archive):
        raise ValueError(
            f"{archive} is not a zip file (not PKZip). "
            "A .dmg cannot be unpacked with ditto -k. Use the macOS kit .zip, not the .dmg."
        )
    if shutil.which("ditto"):
        subprocess.check_call(["ditto", "-x", "-k", str(archive), str(dest)])
    else:
        shutil.unpack_archive(str(archive), str(dest))


def run_install(
    *,
    privilege: str = "user",
    channel: str = "online",
    sandbox: str = "host",
    accept_tos: bool = False,
    tag: str = "latest",
    from_source: bool = False,
    start: Path | None = None,
    progress: Progress | None = None,
) -> dict[str, str]:
    def note(pct: int, msg: str) -> None:
        if progress:
            progress(pct, msg)

    if sandbox == "docker" and not accept_tos:
        raise ValueError("Docker sandbox requires accepting the sandbox terms.")
    if sandbox == "docker" and privilege != "admin":
        raise ValueError("Docker sandbox is an admin install.")

    places = paths_for(privilege)
    prefix, bindir, appdir, venv = places["prefix"], places["bindir"], places["appdir"], places["venv"]
    note(4, "Looking for Finn payload…")
    api_src = find_api_src(start)
    launcher = find_run_api(start)
    app = find_macos_app(start)
    wheel = find_wheel(start)
    if wheel:
        note(8, f"Found wheel {wheel.name}")

    note(12, "Preparing folders")
    prefix.mkdir(parents=True, exist_ok=True)
    data_dir().mkdir(parents=True, exist_ok=True)

    if from_source:
        repo = Path(__file__).resolve().parent.parent
        if (repo / "pyproject.toml").is_file():
            note(20, "Installing from source (pip)…")
            subprocess.check_call([python_bin(), "-m", "pip", "install", str(repo)])
            api_src = api_src or repo

    if channel == "online":
        if not wheel:
            note(18, "Downloading Python wheel from GitHub (curl)…")
            url = github_asset_url(".whl", tag)
            if url:
                wheel = prefix / "finn-pentest.whl"
                curl_bytes(url, wheel)
        if sys.platform == "darwin" and app is None and not wheel:
            note(24, "Downloading macOS kit zip from GitHub (curl)…")
            url = github_asset_url("macos", tag, suffix=".zip")
            if url:
                archive = Path("/tmp/finn-macos.zip")
                curl_bytes(url, archive)
                if not is_zip_file(archive):
                    note(26, "Downloaded file is not a zip (often a .dmg). Skipping desktop; API will still install.")
                else:
                    unpack = Path("/tmp/finn-macos-unpack")
                    if unpack.exists():
                        shutil.rmtree(unpack)
                    try:
                        unpack_zip(archive, unpack)
                    except (subprocess.CalledProcessError, ValueError) as exc:
                        note(26, f"Could not unpack macOS kit ({exc}). Continuing with API only.")
                    else:
                        app = find_macos_app(unpack)
                        if api_src is None:
                            api_src = find_api_src(unpack)
                        if launcher is None:
                            launcher = find_run_api(unpack)
        elif sys.platform == "darwin" and app is None:
            note(24, "Wheel is present — not downloading a Mac app. Use the finn-macos kit for the workstation .app.")

    if api_src is None and wheel is None:
        searched = ", ".join(str(p) for p in walk_roots(start)[:8])
        raise FileNotFoundError(
            "No API package and no .whl found. Put the wheel in dist/ (GitHub python artifact) "
            f"or unzip the macOS kit. Searched: {searched}"
        )

    note(36, "Copying API")
    if api_src:
        copytree(api_src / "finn_pentest", prefix / "finn_pentest")
        if (api_src / "pyproject.toml").is_file():
            shutil.copy2(api_src / "pyproject.toml", prefix / "pyproject.toml")
        if (api_src / "prompts").is_dir():
            copytree(api_src / "prompts", prefix / "prompts")
    if wheel and wheel.resolve() != (prefix / wheel.name).resolve():
        shutil.copy2(wheel, prefix / wheel.name)
    if launcher:
        shutil.copy2(launcher, prefix / "run-api.py")
    elif not (prefix / "run-api.py").is_file():
        raise FileNotFoundError("run-api.py is missing from the installer payload.")

    note(55, "Checking Python package…")
    env = os.environ.copy()
    env["FINN_API_ROOT"] = str(prefix)
    env["FINN_VENV"] = str(venv)
    env["PYTHONPATH"] = str(prefix) + os.pathsep + env.get("PYTHONPATH", "")
    check = subprocess.run(
        [python_bin(), str(prefix / "run-api.py"), "--check"],
        env=env,
        text=True,
        capture_output=True,
    )
    if check.returncode != 0:
        raise RuntimeError(check.stderr.strip() or check.stdout.strip() or "API check failed")

    note(68, "Installing CLI wrapper")
    wrapper = write_cli_wrapper(bindir, prefix, venv)

    installed_app = ""
    if sys.platform == "darwin":
        if app is None:
            note(76, "No .app next to the installer — skip desktop copy (API is installed).")
        else:
            dest = install_macos_app(app, appdir, note)
            installed_app = str(dest)

    note(90, "Writing runtime.json")
    runtime = write_runtime(privilege, channel, sandbox, accept_tos)

    note(100, "Install complete")
    return {
        "prefix": str(prefix),
        "wrapper": str(wrapper),
        "app": installed_app,
        "runtime": str(runtime),
        "venv": str(venv),
    }


def launch_app(app_path: str) -> None:
    if not app_path:
        return
    if sys.platform == "darwin":
        subprocess.Popen(["open", app_path])
    elif sys.platform == "win32":
        os.startfile(app_path)  # type: ignore[attr-defined]
    else:
        subprocess.Popen([app_path])
