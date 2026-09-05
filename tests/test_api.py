from fastapi.testclient import TestClient

from finn_pentest.api.app import create_app
from finn_pentest.core.bootstrap import bootstrap


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
