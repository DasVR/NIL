from finn_pentest.plugins.loader import get_plugin, list_plugins, reload_plugins


def test_builtin_plugins_discoverable(finn_home):
    reload_plugins()
    names = {p.name for p in list_plugins()}
    assert {"nmap", "nuclei", "ffuf", "gobuster", "httpx", "whatweb"} <= names
    nmap = get_plugin("nmap")
    assert nmap is not None
    plugin = nmap()
    cmds = plugin.get_commands("10.0.0.1", {"scan_type": "quick"})
    assert cmds[0].startswith("nmap")
    assert plugin.validate_target("10.0.0.1")
    assert plugin.info.safety_level == "safe"


def test_httpx_plugin(finn_home):
    reload_plugins()
    cls = get_plugin("httpx")
    assert cls is not None
    plugin = cls()
    cmds = plugin.get_commands("example.com", {})
    assert cmds[0].startswith("httpx")
    assert plugin.validate_target("example.com")
    assert plugin.validate_target("https://example.com/app")
    assert plugin.info.category == "recon"
    parsed = plugin.parse_output("https://example.com [200] [Example]\nnoise line")
    assert parsed["count"] == 1


def test_whatweb_plugin(finn_home):
    reload_plugins()
    cls = get_plugin("whatweb")
    assert cls is not None
    plugin = cls()
    cmds = plugin.get_commands("example.com", {})
    assert cmds[0].startswith("whatweb")
    assert "http://example.com" in cmds[0]
    assert plugin.validate_target("example.com")
    assert plugin.info.safety_level == "safe"
