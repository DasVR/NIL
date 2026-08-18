from finn_pentest.core.bootstrap import bootstrap
from finn_pentest.core.runtime import apply_setup, load_runtime, sandbox_mode
from finn_pentest.tools.executor import (
    ApprovalStatus,
    ExecutionStatus,
    approve_command,
    execute_command,
    propose_command,
)


def test_host_execute_without_docker(finn_home, monkeypatch):
    monkeypatch.setenv("FINN_SANDBOX", "host")
    bootstrap()
    apply_setup(variant="bundled", sandbox="host")
    run = propose_command("acme", "echo", "echo finn-host-ok")
    approve_command(run.id)
    done = execute_command(run.id)
    assert done.status == ExecutionStatus.COMPLETED
    assert "finn-host-ok" in done.stdout
    assert done.exit_code == 0


def test_docker_requires_tos(finn_home, monkeypatch):
    monkeypatch.delenv("FINN_SANDBOX", raising=False)
    bootstrap()
    cfg = load_runtime()
    assert cfg.docker_tos_accepted is False
    try:
        apply_setup(variant="docker", sandbox="docker", accept_docker_tos=False)
        raised = False
    except ValueError:
        raised = True
    assert raised
    assert sandbox_mode() == "host"


def test_privilege_and_channel(finn_home, monkeypatch):
    monkeypatch.delenv("FINN_SANDBOX", raising=False)
    bootstrap()
    cfg = apply_setup(variant="bundled", privilege="admin", channel="offline", sandbox="host")
    assert cfg.privilege == "admin"
    assert cfg.channel == "offline"
    assert cfg.features["bundled_api"] is True
    again = load_runtime()
    assert again.privilege == "admin"
    assert again.channel == "offline"
