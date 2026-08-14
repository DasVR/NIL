from finn_pentest.core.bootstrap import bootstrap
from finn_pentest.core.db import session
from finn_pentest.core.engagements import create_engagement, list_engagements


def test_create_and_list_engagements(finn_home):
    bootstrap()
    created = create_engagement("acme", scope="10.0.1.0/24")
    assert created["name"] == "acme"
    assert "10.0.1.0/24" in created["scope"]
    names = [item["name"] for item in list_engagements()]
    assert "acme" in names
    assert (finn_home / "engagements" / "acme" / "notes.md").exists()


def test_sqlite_init(finn_home):
    bootstrap()
    with session() as conn:
        tables = {
            row[0]
            for row in conn.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()
        }
    assert "tool_runs" in tables
    assert "yolo" in tables
