from finn_pentest.core.bootstrap import bootstrap
from finn_pentest.tools.executor import (
    ApprovalStatus,
    approve_command,
    execute_command,
    is_yolo_enabled,
    propose_command,
    reject_command,
    toggle_yolo,
)
import pytest


def test_approval_gate_requires_approve(finn_home):
    bootstrap()
    run = propose_command("acme", "nmap", "nmap -F 10.0.0.1")
    assert run.approval == ApprovalStatus.PENDING
    with pytest.raises(ValueError):
        execute_command(run.id)
    approved = approve_command(run.id)
    assert approved.approval == ApprovalStatus.APPROVED


def test_reject_command(finn_home):
    bootstrap()
    run = propose_command("acme", "nmap", "nmap -F 10.0.0.1")
    rejected = reject_command(run.id, "out of scope")
    assert rejected.approval == ApprovalStatus.REJECTED


def test_yolo_persists(finn_home):
    bootstrap()
    assert is_yolo_enabled("acme") is False
    assert toggle_yolo("acme") is True
    assert is_yolo_enabled("acme") is True
    assert toggle_yolo("acme") is False
    assert is_yolo_enabled("acme") is False
