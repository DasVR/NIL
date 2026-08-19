from finn_pentest.ai.parser import parse_response
from finn_pentest.ai.prompts import VALID_MODES, build_system_prompt
from finn_pentest.ai.rag import index_engagement, search
from finn_pentest.core.bootstrap import bootstrap
from finn_pentest.core.engagements import create_engagement, write_notes
from finn_pentest.tools.logger import log_finding


def test_prompt_layers(finn_home):
    bootstrap()
    base = build_system_prompt("chat", yolo=False)
    assert "authorized penetration tester" in base.lower()
    assert "MODE: CHAT" in base
    hunt = build_system_prompt("hunt", yolo=True)
    assert "MODE: HUNT" in hunt
    assert "YOLO MODE ACTIVE" in hunt
    assert "flag encyclopedias" in hunt.lower()
    for mode in VALID_MODES:
        text = build_system_prompt(mode)
        assert text


def test_parse_commands(finn_home):
    parsed = parse_response("Try this:\n```bash\nnmap -F 10.0.0.1\n```\n", yolo=False)
    assert parsed.commands == ["nmap -F 10.0.0.1"]
    assert parsed.needs_approval is True
    parsed_yolo = parse_response("```bash\nnmap -F 10.0.0.1\n```", yolo=True)
    assert parsed_yolo.needs_approval is False


def test_fts5_rag(finn_home):
    bootstrap()
    create_engagement("acme")
    write_notes("acme", "Jenkins on the internal box had an exposed console last month.")
    log_finding("acme", "Jenkins console", "High", "Unauthenticated Jenkins console on 10.0.1.8")
    index_engagement("acme")
    hits = search("Jenkins", engagement="acme")
    assert hits
    assert any("Jenkins" in (hit["title"] + hit["snippet"]) for hit in hits)
