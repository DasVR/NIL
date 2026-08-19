#!/usr/bin/env python3
"""Launch the Finn API on every OS. Used by the desktop app and installers.

Resolves the bundled package (next to this file, FINN_API_ROOT, or a venv),
installs missing deps into ~/.finn-pentest/venv when possible, then runs uvicorn.
"""

from __future__ import annotations

import os
import site
import subprocess
import sys
from pathlib import Path

HOST = os.environ.get("FINN_API_HOST", "127.0.0.1")
PORT = os.environ.get("FINN_API_PORT", "8766")


def api_root() -> Path:
    env = os.environ.get("FINN_API_ROOT")
    if env:
        return Path(env).expanduser().resolve()
    here = Path(__file__).resolve().parent
    for candidate in (here, here.parent, here / "api"):
        if (candidate / "finn_pentest").is_dir() or (candidate / "pyproject.toml").is_file():
            return candidate
    return here


def venv_dir() -> Path:
    override = os.environ.get("FINN_VENV")
    if override:
        return Path(override).expanduser().resolve()
    return Path.home() / ".finn-pentest" / "venv"


def venv_python(venv: Path) -> Path:
    if os.name == "nt":
        return venv / "Scripts" / "python.exe"
    return venv / "bin" / "python"


def ensure_venv(root: Path) -> Path:
    venv = venv_dir()
    py = venv_python(venv)
    wheel = next(root.glob("*.whl"), None)
    if py.is_file() and _venv_has_pkg(py):
        return py
    venv.parent.mkdir(parents=True, exist_ok=True)
    if not py.is_file():
        subprocess.check_call([sys.executable, "-m", "venv", str(venv)])
        py = venv_python(venv)
    subprocess.check_call([str(py), "-m", "pip", "install", "--upgrade", "pip"])
    if wheel:
        subprocess.check_call([str(py), "-m", "pip", "install", str(wheel)])
    elif (root / "pyproject.toml").is_file():
        subprocess.check_call([str(py), "-m", "pip", "install", str(root)])
    else:
        subprocess.check_call(
            [str(py), "-m", "pip", "install", "fastapi", "uvicorn[standard]", "httpx", "pydantic", "python-dotenv"]
        )
    return py


def _venv_has_pkg(py: Path) -> bool:
    probe = subprocess.run(
        [str(py), "-c", "import finn_pentest"],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    return probe.returncode == 0


def prepare_sys_path(root: Path) -> None:
    site.addsitedir(str(root))
    if str(root) not in sys.path:
        sys.path.insert(0, str(root))


def check(root: Path) -> int:
    prepare_sys_path(root)
    try:
        import finn_pentest  # noqa: F401
    except ImportError:
        py = ensure_venv(root)
        if os.environ.get("FINN_API_BOOTSTRAPPED") == "1":
            raise
        os.environ["FINN_API_BOOTSTRAPPED"] = "1"
        os.execv(str(py), [str(py), str(Path(__file__).resolve()), "--check"])
    import finn_pentest

    print(f"ok api_root={root} version={getattr(finn_pentest, '__version__', 'unknown')}")
    return 0


def main(argv: list[str]) -> int:
    root = api_root()
    os.environ.setdefault("FINN_API_ROOT", str(root))
    if "--check" in argv:
        return check(root)

    prepare_sys_path(root)
    try:
        import finn_pentest  # noqa: F401
        import uvicorn  # noqa: F401
    except ImportError:
        try:
            py = str(ensure_venv(root))
        except Exception as exc:
            print(f"Finn API: could not prepare a venv ({exc}).", file=sys.stderr)
            return 1
        if os.name == "nt":
            return subprocess.call([py, str(Path(__file__).resolve()), *argv])
        os.execv(py, [py, str(Path(__file__).resolve()), *argv])

    from finn_pentest.core.bootstrap import bootstrap

    bootstrap()
    import uvicorn

    uvicorn.run("finn_pentest.api.app:app", host=HOST, port=int(PORT), reload=False)
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
