from finn_pentest.core.bootstrap import bootstrap
from finn_pentest.core.runtime import apply_setup, load_runtime, sandbox_mode, set_sandbox
from finn_pentest.plugins.nmap import NmapPlugin
from finn_pentest.sandbox import docker_launch
from finn_pentest.sandbox.dispatch import run_command
from finn_pentest.sandbox.host import exec_on_host
from finn_pentest.tools.ingest import ingest_run_output

import sys


def test_switching_to_host_clears_docker_feature(finn_home, monkeypatch):
    monkeypatch.delenv("FINN_SANDBOX", raising=False)
    bootstrap()
    apply_setup(variant="bundled", sandbox="docker", accept_docker_tos=True, privilege="admin")
    cfg = load_runtime()
    assert cfg.sandbox == "docker"
    assert cfg.features["docker"] is True
    host = set_sandbox("host")
    assert host.sandbox == "host"
    assert host.features["docker"] is False
    assert sandbox_mode() == "host"


def test_host_echo_still_works(finn_home, monkeypatch):
    monkeypatch.setenv("FINN_SANDBOX", "host")
    bootstrap()
    result = exec_on_host("acme", "echo finn-host-ok")
    assert result["exit_code"] == 0
    assert "finn-host-ok" in result["stdout"]


def test_docker_launch_when_already_up(monkeypatch):
    monkeypatch.setattr(docker_launch, "docker_available", lambda: True)
    launch = docker_launch.ensure_docker_running()
    assert launch.available is True
    assert launch.started is False


def test_docker_launch_not_installed(monkeypatch):
    monkeypatch.setattr(docker_launch, "docker_available", lambda: False)
    monkeypatch.setattr(docker_launch, "docker_is_installed", lambda: False)
    launch = docker_launch.ensure_docker_running()
    assert launch.available is False
    assert launch.installed is False
    assert launch.code == docker_launch.NOT_INSTALLED


def test_dispatch_starts_docker_then_runs(finn_home, monkeypatch):
    monkeypatch.setenv("FINN_SANDBOX", "docker")
    monkeypatch.setenv("FINN_DOCKER_TOS", "1")
    monkeypatch.setenv("FINN_DOCKER_WAIT_SECONDS", "0")
    bootstrap()
    apply_setup(variant="docker", sandbox="docker", accept_docker_tos=True, privilege="admin")
    monkeypatch.setattr("finn_pentest.sandbox.dispatch.docker_available", lambda: False)
    monkeypatch.setattr(
        "finn_pentest.sandbox.dispatch.ensure_docker_running",
        lambda: docker_launch.DockerLaunch(True, True, True, None, "up"),
    )
    monkeypatch.setattr(
        "finn_pentest.sandbox.dispatch.exec_in_sandbox",
        lambda engagement, command, timeout=300: {
            "stdout": "from-docker",
            "stderr": "",
            "exit_code": 0,
            "duration": 0.1,
        },
    )
    out = run_command("acme", "echo hi")
    assert out["backend"] == "docker"
    assert out["stdout"] == "from-docker"


def test_ingest_nmap_open_ports(finn_home):
    bootstrap()
    from finn_pentest.tools.executor import ToolRun

    run = ToolRun(
        engagement="acme",
        tool="nmap",
        command="nmap -F 10.0.0.1",
        stdout="PORT   STATE SERVICE\n22/tcp open  ssh\n80/tcp open  http\n",
        exit_code=0,
    )
    created = ingest_run_output(run)
    assert len(created) == 2
    parsed = NmapPlugin().parse_output(run.stdout)
    assert parsed["count"] == 2


def test_host_missing_binary_is_explicit(finn_home, monkeypatch):
    monkeypatch.setenv("FINN_SANDBOX", "host")
    bootstrap()
    result = exec_on_host("acme", "finn-definitely-missing-zzzz")
    blob = (result.get("stdout") or "") + (result.get("stderr") or "")
    assert "not on PATH" in blob
    assert result["exit_code"] != 0


def test_windows_host_uses_cmd(monkeypatch):
    monkeypatch.setattr(sys, "platform", "win32")
    monkeypatch.setenv("COMSPEC", "cmd.exe")
    from finn_pentest.sandbox import host as host_mod

    argv = host_mod._argv("echo hi")
    assert argv[0] == "cmd.exe"
    assert argv[1] == "/c"
    assert argv[2] == "echo hi"


def test_docker_launch_starts_then_ready(monkeypatch):
    state = {"up": False}

    def spawn() -> bool:
        state["up"] = True
        return True

    monkeypatch.setattr(docker_launch, "docker_available", lambda: state["up"])
    monkeypatch.setattr(docker_launch, "docker_is_installed", lambda: True)
    monkeypatch.setattr(docker_launch, "_spawn_desktop", spawn)
    monkeypatch.setenv("FINN_DOCKER_WAIT_SECONDS", "0")
    launch = docker_launch.ensure_docker_running()
    assert launch.available is True
    assert launch.started is True
