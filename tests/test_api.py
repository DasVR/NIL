from fastapi.testclient import TestClient

from finn_pentest.api.app import create_app
from finn_pentest.core.bootstrap import bootstrap
from finn_pentest.providers.openai_compat import log_usage


def test_health_and_engagement_routes(finn_home):
    bootstrap()
    client = TestClient(create_app())
    health = client.get("/v1/health")
    assert health.status_code == 200
    assert health.json()["status"] == "ok"
    created = client.post("/v1/engagements", json={"name": "acme", "scope": "10.0.0.0/24"})
    assert created.status_code == 200
    listed = client.get("/v1/engagements")
    names = [e["name"] for e in listed.json()["engagements"]]
    assert "acme" in names
    plugins = client.get("/v1/plugins")
    assert plugins.status_code == 200
    assert any(p["name"] == "nmap" for p in plugins.json()["plugins"])


def test_usage_endpoint_totals(finn_home):
    bootstrap()
    log_usage("acme", "local", "llama", 200, 50, 0.0)
    client = TestClient(create_app())
    body = client.get("/v1/usage", params={"engagement": "acme"}).json()
    assert body["prompt_tokens"] == 200
    assert body["completion_tokens"] == 50
    assert body["total_tokens"] == 250
    assert body["cost_usd"] == 0
    assert body["by_provider"][0]["model"] == "llama"
