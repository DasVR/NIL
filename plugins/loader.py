"""
Finn Pentest Harness — Plugin System
Drop Python classes in ~/.finn-pentest/plugins/ and they auto-discover.
"""
import importlib
import inspect
import os
import sys
from dataclasses import dataclass, field
from pathlib import Path
from typing import Optional

# ──────────────────────────────────────────────────────────────
# PLUGIN BASE
# ──────────────────────────────────────────────────────────────
@dataclass
class PluginInfo:
    name: str
    description: str = ""
    tools: list[str] = field(default_factory=list)
    install_commands: list[str] = field(default_factory=list)
    safety_level: str = "safe"  # safe | caution | dangerous
    category: str = "general"   # recon | exploit | post | utility
    author: str = ""
    version: str = "1.0.0"


class BasePlugin:
    """Base class for all pentest plugins."""
    
    info: PluginInfo
    
    def get_commands(self, target: str, args: dict) -> list[str]:
        """Return list of shell commands to run against the target."""
        raise NotImplementedError
    
    def parse_output(self, stdout: str) -> dict:
        """Parse tool output into structured findings."""
        return {"raw": stdout}
    
    def validate_target(self, target: str) -> bool:
        """Validate that the target is appropriate for this plugin."""
        return True


# ──────────────────────────────────────────────────────────────
# PLUGIN LOADER
# ──────────────────────────────────────────────────────────────
PLUGIN_DIRS = [
    Path.home() / ".finn-pentest" / "plugins",
    Path(__file__).parent.parent / "plugins",  # built-in plugins
]

_loaded_plugins: dict[str, type[BasePlugin]] = {}


def discover_plugins() -> dict[str, type[BasePlugin]]:
    """Discover all plugins from plugin directories."""
    global _loaded_plugins
    
    if _loaded_plugins:
        return _loaded_plugins
    
    for plugin_dir in PLUGIN_DIRS:
        if not plugin_dir.exists():
            continue
        
        sys.path.insert(0, str(plugin_dir.parent))
        
        for py_file in plugin_dir.glob("*.py"):
            if py_file.name.startswith("_"):
                continue
            
            module_name = py_file.stem
            try:
                module = importlib.import_module(module_name)
                
                for name, obj in inspect.getmembers(module, inspect.isclass):
                    if issubclass(obj, BasePlugin) and obj is not BasePlugin:
                        instance = obj()
                        _loaded_plugins[instance.info.name] = obj
                        
            except Exception as e:
                print(f"[plugin] Failed to load {module_name}: {e}")
    
    return _loaded_plugins


def get_plugin(name: str) -> Optional[type[BasePlugin]]:
    """Get a specific plugin by name."""
    plugins = discover_plugins()
    return plugins.get(name)


def list_plugins() -> list[PluginInfo]:
    """List all available plugins with their info."""
    plugins = discover_plugins()
    result = []
    for name, cls in plugins.items():
        try:
            instance = cls()
            result.append(instance.info)
        except Exception:
            pass
    return result


def get_plugins_by_category(category: str) -> list[PluginInfo]:
    """Get plugins filtered by category."""
    return [p for p in list_plugins() if p.category == category]


def reload_plugins() -> dict[str, type[BasePlugin]]:
    """Force reload all plugins."""
    global _loaded_plugins
    _loaded_plugins = {}
    return discover_plugins()
