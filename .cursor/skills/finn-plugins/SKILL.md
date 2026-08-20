---
name: finn-plugins
description: How to add or change a Finn tool plugin (nmap, nuclei, ffuf, gobuster, httpx, whatweb, nikto, sslscan, subfinder). Use when adding a scanner, changing generated commands, parsing tool output, or touching finn_pentest/plugins.
---

# Finn tool plugins

A plugin turns a target plus arguments into shell commands that run inside the engagement
sandbox, and turns raw stdout into structured data.

## Contract

Subclass `BasePlugin` from `finn_pentest/plugins/loader.py`:

```python
class HttpxPlugin(BasePlugin):
    info = PluginInfo(
        name="httpx",
        description="HTTP probing and tech fingerprinting with httpx",
        tools=["httpx"],
        install_commands=["apt-get install -y httpx"],
        safety_level="safe",
        category="recon",
        version="1.0.0",
        capabilities=["http_probing", "tech_detection"],
    )

    def get_commands(self, target: str, args: dict) -> list[str]: ...
    def parse_output(self, stdout: str) -> dict: ...
    def validate_target(self, target: str) -> bool: ...
```

- `get_commands` returns the exact commands. Branch on `args`, always provide a default
  branch so an unknown mode still returns something runnable.
- `parse_output` returns a dict. Include a `count` so the UI can show a badge, and cap
  unbounded lists (existing plugins slice to the last 50) so a huge scan cannot flood the
  block.
- `validate_target` guards against a hostname being handed to a URL tool and vice versa.

## Safety levels

`safety_level` drives the approval UI, so it is a product decision, not a label.

| Level | Meaning | Examples |
|---|---|---|
| `safe` | Read-only or low-noise probing | `nmap`, `nuclei`, `ffuf`, `httpx`, `whatweb`, `nikto`, `sslscan`, `subfinder` |
| `caution` | Noisy, high request volume, or easy to misaim | `gobuster` |
| `dangerous` | Can change target state — extra confirmation | none shipped |

Recon and assessment only. Do not add exploit kits, C2, or credential-stuffing tooling.
Everything here assumes authorized testing.

## Discovery

`discover_plugins()` scans two directories: `finn_pentest/plugins/` (built-in) and
`plugins_dir()` = `~/.finn-pentest/plugins/` (user drop-in). Any `BasePlugin` subclass in a
`.py` file that does not start with `_` is registered under `info.name`.

The result is cached in a module global. Call `reload_plugins()` in tests, and after
dropping a new file at runtime.

Built-ins need no registration beyond existing in the directory — do not edit
`__init__.py` to add a scanner.

## Surfacing in the UI

`GET /v1/plugins` feeds `appState.plugins`. Both consumers are automatic once the plugin
discovers:

- `web/src/lib/components/Sidebar.svelte` — Plugins section, "Propose run" against the
  selected target.
- `web/src/lib/components/CommandPalette.svelte` — a palette entry per plugin.

A new plugin must not need a new route or a new page.

## Tests

Extend `tests/test_plugins.py`. Call `reload_plugins()` first, then assert the plugin is
discoverable, that `get_commands` starts with the binary, that `validate_target` accepts
and rejects the right shapes, and that `parse_output` returns the expected keys.

```bash
python3 -m pytest tests/test_plugins.py -q
```
