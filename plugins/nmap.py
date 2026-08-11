"""
Example plugin: Nmap network scanner.
Drop this in ~/.finn-pentest/plugins/ to auto-discover.
"""
from plugins.loader import BasePlugin, PluginInfo


class NmapPlugin(BasePlugin):
    info = PluginInfo(
        name="nmap",
        description="Network discovery and port scanning with Nmap",
        tools=["nmap", "ncat"],
        install_commands=["apt-get install -y nmap"],
        safety_level="safe",
        category="recon",
        version="1.0.0",
    )
    
    def get_commands(self, target: str, args: dict) -> list[str]:
        """Generate nmap commands based on args."""
        scan_type = args.get("scan_type", "quick")
        ports = args.get("ports", "")
        extra_flags = args.get("extra_flags", "")
        
        commands = []
        
        if scan_type == "quick":
            commands.append(f"nmap -T4 -F {target}")
        elif scan_type == "full":
            port_flag = f"-p {ports}" if ports else "-p-"
            commands.append(f"nmap -T4 -sV -sC {port_flag} {target} {extra_flags}")
        elif scan_type == "stealth":
            commands.append(f"nmap -sS -T2 -f {target}")
        elif scan_type == "udp":
            port_flag = f"-p {ports}" if ports else "-p 53,67,68,69,123,161,162,500,514,520,1900,5353"
            commands.append(f"nmap -sU {port_flag} {target}")
        elif scan_type == "vuln":
            commands.append(f"nmap -sV --script vuln {target}")
        elif scan_type == "all":
            commands.append(f"nmap -T4 -sV -sC -p- {target} {extra_flags}")
            commands.append(f"nmap -sU -p 53,67,68,69,123,161,162,500 {target}")
        
        return commands
    
    def parse_output(self, stdout: str) -> dict:
        """Parse nmap output for open ports."""
        ports = []
        for line in stdout.split("\n"):
            if "/tcp" in line or "/udp" in line:
                parts = line.split()
                if len(parts) >= 3:
                    ports.append({
                        "port": parts[0],
                        "state": parts[1],
                        "service": parts[2],
                    })
        return {"open_ports": ports, "count": len(ports)}
    
    def validate_target(self, target: str) -> bool:
        """Basic target validation."""
        import re
        # IP address or hostname
        ip_pattern = r"^(\d{1,3}\.){3}\d{1,3}(/\d{1,2})?$"
        hostname_pattern = r"^[a-zA-Z0-9]([a-zA-Z0-9\-\.]*[a-zA-Z0-9])?$"
        return bool(re.match(ip_pattern, target) or re.match(hostname_pattern, target))
