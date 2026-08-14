from finn_pentest.plugins.loader import get_plugin, list_plugins, reload_plugins


def test_builtin_plugins_discoverable(finn_home):
    reload_plugins()
    names = {p.name for p in list_plugins()}
    assert {"nmap", "nuclei", "ffuf", "gobuster"} <= names
    nmap = get_plugin("nmap")
    assert nmap is not None
    plugin = nmap()
    cmds = plugin.get_commands("10.0.0.1", {"scan_type": "quick"})
    assert cmds[0].startswith("nmap")
    assert plugin.validate_target("10.0.0.1")
    assert plugin.info.safety_level == "safe"
