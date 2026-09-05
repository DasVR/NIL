from finn_pentest.core.bootstrap import bootstrap
from finn_pentest.core.engagements import create_engagement, engagement_path
from finn_pentest.providers.openai_compat import log_usage, usage_summary


def test_log_usage_totals_and_jsonl(finn_home):
    bootstrap()
    create_engagement("acme")
    first = log_usage("acme", "openrouter", "m1", 1000, 500, 0.002)
    assert first["prompt_tokens"] == 1000
    assert first["completion_tokens"] == 500
    assert first["total_tokens"] == 1500
    assert abs(first["cost_usd"] - 0.003) < 1e-9

    log_usage("acme", "openrouter", "m1", 500, 0, 0.002)
    summary = usage_summary("acme")
    assert summary["prompt_tokens"] == 1500
    assert summary["completion_tokens"] == 500
    assert summary["total_tokens"] == 2000
    assert abs(summary["cost_usd"] - 0.004) < 1e-9
    assert summary["by_provider"]
    assert summary["recent"]
    assert summary["recent"][0]["model"] == "m1"

    ledger = engagement_path("acme") / "run" / "usage.jsonl"
    assert ledger.exists()
    lines = [line for line in ledger.read_text(encoding="utf-8").splitlines() if line.strip()]
    assert len(lines) == 2


def test_usage_summary_empty(finn_home):
    bootstrap()
    summary = usage_summary("missing")
    assert summary["prompt_tokens"] == 0
    assert summary["completion_tokens"] == 0
    assert summary["cost_usd"] == 0
    assert summary["by_provider"] == []
    assert summary["recent"] == []
