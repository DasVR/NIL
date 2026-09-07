from finn_pentest.ai import doom_loop
from finn_pentest.ai.hunt import run_turn
from finn_pentest.ai.chat_store import create_session
from finn_pentest.core.bootstrap import bootstrap
from finn_pentest.core.engagements import create_engagement
from finn_pentest.providers.router import ChatResult

import asyncio


def test_fingerprint_uses_tool_and_operand():
    assert doom_loop.fingerprint("nmap -T4 -F 10.0.0.1") == "nmap 10.0.0.1"
    assert doom_loop.fingerprint("  nmap   -sV 10.0.0.1 ") == "nmap 10.0.0.1"


def test_warn_at_three_halt_at_five():
    doom_loop.reset_all()
    cmd = "nmap -T4 -F 10.0.0.1"
    actions = [doom_loop.record("acme", cmd).action for _ in range(5)]
    assert actions == ["ok", "ok", "warn", "warn", "halt"]
    assert doom_loop.consume_warning("acme") == doom_loop.WARN_TEXT


def test_different_command_resets_streak():
    doom_loop.reset_all()
    assert doom_loop.record("acme", "nmap -F 10.0.0.1").action == "ok"
    assert doom_loop.record("acme", "nmap -F 10.0.0.1").action == "ok"
    assert doom_loop.record("acme", "httpx -u http://10.0.0.1").action == "ok"
    assert doom_loop.record("acme", "nmap -F 10.0.0.1").action == "ok"


def test_run_turn_halts_fifth_repeat(finn_home):
    bootstrap()
    create_engagement("acme")
    sess = create_session("acme", mode="hunt")

    class FakeRouter:
        async def send(self, messages, engagement=None, **kwargs):
            return ChatResult(
                text="```bash\nnmap -T4 -F 10.0.0.1\n```",
                provider="fake",
                model="fake",
                prompt_tokens=4,
                completion_tokens=2,
                cost_usd=0.0,
            )

    router = FakeRouter()
    results = [
        asyncio.run(run_turn("acme", "scan", "hunt", sess["id"], router=router))
        for _ in range(5)
    ]
    assert results[2]["doom_warn"] is True
    assert results[4]["halted"] is True
    assert results[4]["runs"] == []
    assert "Stopped: the same command was proposed 5 times." in results[4]["text"]
