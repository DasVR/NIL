"""
Finn Pentest Harness — Sandbox Manager
Creates and manages isolated Docker containers per engagement.
"""
import os
import subprocess
import tempfile
from pathlib import Path
from typing import Optional

import docker
from docker.errors import DockerException, ImageNotFound

# ──────────────────────────────────────────────────────────────
# CONFIG
# ──────────────────────────────────────────────────────────────
BASE_DIR = Path(os.environ.get("FINN_PENTEST_DIR", Path.home() / ".finn-pentest"))
SANDBOX_DIR = BASE_DIR / "sandboxes"
ENGAGEMENT_DIR = BASE_DIR / "engagements"
DOCKER_IMAGE = "finn-pentest-sandbox:latest"
DOCKERFILE_PATH = Path(__file__).parent / "Dockerfile.sandbox"

# ──────────────────────────────────────────────────────────────
# DOCKER CLIENT
# ──────────────────────────────────────────────────────────────
_client: Optional[docker.DockerClient] = None


def get_client() -> docker.DockerClient:
    global _client
    if _client is None:
        try:
            _client = docker.from_env()
        except DockerException:
            raise RuntimeError("Docker is not running or not accessible. Install Docker and try again.")
    return _client


# ──────────────────────────────────────────────────────────────
# IMAGE BUILD
# ──────────────────────────────────────────────────────────────
def build_sandbox_image() -> str:
    """Build the finn-pentest-sandbox Docker image with common pentest tools."""
    client = get_client()
    
    dockerfile = DOCKERFILE_PATH
    if not dockerfile.exists():
        # Write default Dockerfile
        dockerfile.write_text("""FROM kalilinux/kali-rolling:latest

# Non-interactive installs
ENV DEBIAN_FRONTEND=noninteractive

# Base pentest tools
RUN apt-get update && apt-get install -y --no-install-recommends \\
    nmap \\
    nuclei \\
    ffuf \\
    sqlmap \\
    hydra \\
    john \\
    hashcat \\
    gobuster \\
    dirb \\
    nikto \\
    wpscan \\
    enum4linux \\
    smbclient \\
    netcat-openbsd \\
    curl \\
    wget \\
    git \\
    python3 \\
    python3-pip \\
    jq \\
    tmux \\
    vim \\
    && rm -rf /var/lib/apt/lists/*

# Working directory
WORKDIR /workspace

# Default shell
CMD ["/bin/bash"]
""")
    
    try:
        image, logs = client.images.build(
            path=str(dockerfile.parent),
            dockerfile=dockerfile.name,
            tag="finn-pentest-sandbox:latest",
            rm=True,
        )
        return image.id
    except Exception as e:
        raise RuntimeError(f"Failed to build sandbox image: {e}")


def ensure_image() -> None:
    """Ensure the sandbox image exists, build if needed."""
    client = get_client()
    try:
        client.images.get(DOCKER_IMAGE)
    except ImageNotFound:
        build_sandbox_image()


# ──────────────────────────────────────────────────────────────
# CONTAINER MANAGEMENT
# ──────────────────────────────────────────────────────────────
def create_sandbox(engagement_name: str) -> str:
    """
    Create a new sandbox container for an engagement.
    Returns the container ID.
    """
    ensure_image()
    client = get_client()
    
    # Create engagement directories
    eng_dir = ENGAGEMENT_DIR / engagement_name
    eng_dir.mkdir(parents=True, exist_ok=True)
    (eng_dir / "findings").mkdir(exist_ok=True)
    (eng_dir / "loot").mkdir(exist_ok=True)
    (eng_dir / "tools").mkdir(exist_ok=True)
    (eng_dir / "reports").mkdir(exist_ok=True)
    
    # Create sandbox workspace
    sandbox_workspace = SANDBOX_DIR / engagement_name
    sandbox_workspace.mkdir(parents=True, exist_ok=True)
    
    container = client.containers.run(
        DOCKER_IMAGE,
        detach=True,
        tty=True,
        stdin_open=True,
        name=f"finn-sandbox-{engagement_name}",
        hostname=f"sandbox-{engagement_name}",
        volumes={
            str(sandbox_workspace): {"bind": "/workspace", "mode": "rw"},
            str(eng_dir / "loot"): {"bind": "/loot", "mode": "rw"},
            str(eng_dir / "tools"): {"bind": "/tools", "mode": "ro"},
        },
        network_mode="bridge",  # isolated by default
        mem_limit="2g",
        cpu_quota=50000,  # 50% of one CPU
        remove=False,
    )
    
    return container.id


def get_sandbox(engagement_name: str) -> Optional[docker.models.containers.Container]:
    """Get an existing sandbox container by engagement name."""
    client = get_client()
    try:
        return client.containers.get(f"finn-sandbox-{engagement_name}")
    except docker.errors.NotFound:
        return None


def destroy_sandbox(engagement_name: str) -> bool:
    """Destroy a sandbox container. Data in volumes persists."""
    container = get_sandbox(engagement_name)
    if container:
        container.stop(timeout=10)
        container.remove(force=True)
        return True
    return False


def nuke_sandbox(engagement_name: str) -> bool:
    """Destroy sandbox AND all its data."""
    destroy_sandbox(engagement_name)
    sandbox_workspace = SANDBOX_DIR / engagement_name
    if sandbox_workspace.exists():
        import shutil
        shutil.rmtree(sandbox_workspace)
        return True
    return False


def exec_in_sandbox(engagement_name: str, command: str, timeout: int = 300) -> dict:
    """
    Execute a command inside the sandbox container.
    Returns {stdout, stderr, exit_code, duration}.
    """
    import time
    
    container = get_sandbox(engagement_name)
    if not container:
        raise RuntimeError(f"No sandbox found for engagement '{engagement_name}'. Create one first.")
    
    # Ensure container is running
    if container.status != "running":
        container.start()
    
    start = time.time()
    result = container.exec_run(
        f"/bin/bash -c {command!r}",
        stdout=True,
        stderr=True,
        tty=False,
    )
    duration = time.time() - start
    
    return {
        "stdout": result.output.decode("utf-8", errors="replace") if result.output else "",
        "stderr": "",  # exec_run combines stdout/stderr
        "exit_code": result.exit_code,
        "duration": round(duration, 2),
    }


def install_tool(engagement_name: str, tool_name: str) -> dict:
    """Install a tool in the sandbox."""
    return exec_in_sandbox(
        engagement_name,
        f"apt-get update && apt-get install -y {tool_name} || pip3 install {tool_name}",
        timeout=600,
    )


def list_sandboxes() -> list[dict]:
    """List all running sandbox containers."""
    client = get_client()
    containers = client.containers.list(
        filters={"name": "finn-sandbox-"},
        all=True,
    )
    return [
        {
            "id": c.id[:12],
            "name": c.name.replace("finn-sandbox-", ""),
            "status": c.status,
            "created": c.attrs.get("Created", ""),
        }
        for c in containers
    ]
