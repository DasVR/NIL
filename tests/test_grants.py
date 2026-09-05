from finn_pentest.core.bootstrap import bootstrap
from finn_pentest.core.runtime import apply_setup
from finn_pentest.tools.executor import ApprovalStatus, ExecutionStatus, propose_command
from finn_pentest.tools.grants import command_prefix, grant_prefix, has_prefix_grant


def test_command_prefix_skips_wrappers():
    assert command_prefix("nmap -sV 10.0.0.1") == "nmap"
    assert command_prefix("sudo nmap -F 10.0.0.1") == "nmap"
    assert command_prefix("proxychains4 nmap -Pn 10.0.0.1") == "nmap"
    assert command_prefix("FOO=1 env nmap -F 10.0.0.1") == "nmap"


def test_prefix_grant_auto_executes(finn_home, monkeypatch):
    monkeypatch.setenv("FINN_SANDBOX", "host")
    bootstrap()
    apply_setup(variant="bundled", sandbox="host")
    grant_prefix("acme", "echo")
    assert has_prefix_grant("acme", "echo grant-ok")
    assert not has_prefix_grant("acme", "echo grant-ok", safety_level="dangerous")

    run = propose_command("acme", "echo", "echo grant-ok")
    assert run.approval == ApprovalStatus.APPROVED
    assert run.status == ExecutionStatus.COMPLETED
    assert "grant-ok" in run.stdout

    other = propose_command("acme", "nmap", "nmap -F 10.0.0.1")
    assert other.approval == ApprovalStatus.PENDING
    assert other.status == ExecutionStatus.PENDING
