from fastapi.testclient import TestClient

from finn_pentest.api.app import create_app
from finn_pentest.core.bootstrap import bootstrap
from finn_pentest.core.runtime import apply_setup


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


def test_sandbox_switch_and_start_docker(finn_home, monkeypatch):
    monkeypatch.delenv("FINN_SANDBOX", raising=False)
    bootstrap()
    apply_setup(variant="bundled", sandbox="docker", accept_docker_tos=True, privilege="admin")
    client = TestClient(create_app())
    switched = client.post("/v1/runtime/sandbox", json={"sandbox": "host"})
    assert switched.status_code == 200
    body = switched.json()
    assert body["sandbox"] == "host"
    assert body["features"]["docker"] is False
    assert body["sandbox_effective"] == "host"

    from finn_pentest.sandbox.docker_launch import DockerLaunch, NOT_INSTALLED

    monkeypatch.setattr(
        "finn_pentest.sandbox.docker_launch.ensure_docker_running",
        lambda: DockerLaunch(False, False, False, NOT_INSTALLED, "Docker is not installed."),
    )
    docker = client.post("/v1/sandbox/start-docker")
    assert docker.status_code == 503
    assert docker.json()["code"] == NOT_INSTALLED
    assert "not installed" in docker.json()["message"].lower()
