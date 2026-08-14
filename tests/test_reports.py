from pathlib import Path

from finn_pentest.core.bootstrap import bootstrap
from finn_pentest.core.engagements import create_engagement
from finn_pentest.integrations.burp import import_burp_xml
from finn_pentest.reports.builder import build_json, build_markdown, write_reports
from finn_pentest.tools.logger import log_finding


def test_markdown_and_json_report(finn_home):
    bootstrap()
    create_engagement("acme", scope="10.0.0.0/24")
    log_finding("acme", "Open Jenkins", "High", "Unauthenticated console")
    md = build_markdown("acme")
    assert "Open Jenkins" in md
    data = build_json("acme")
    assert data["engagement"] == "acme"
    paths = write_reports("acme")
    assert Path(paths["markdown"]).exists()
    assert Path(paths["json"]).exists()


def test_burp_import(finn_home, tmp_path):
    bootstrap()
    create_engagement("acme")
    xml = tmp_path / "burp.xml"
    xml.write_text(
        """<?xml version="1.0"?>
<issues>
  <issue>
    <name>SQL injection</name>
    <severity>High</severity>
    <host>http://app.example</host>
    <path>/search</path>
    <issueDetail>Imported sample</issueDetail>
  </issue>
</issues>
""",
        encoding="utf-8",
    )
    result = import_burp_xml("acme", xml)
    assert result["imported"] == 1
