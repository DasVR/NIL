"""
Finn Pentest Harness — Credential Store
Encrypted credential storage using SQLCipher.
"""
import os
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

# ──────────────────────────────────────────────────────────────
# CONFIG
# ──────────────────────────────────────────────────────────────
BASE_DIR = Path(os.environ.get("FINN_PENTEST_DIR", Path.home() / ".finn-pentest"))
ENGAGEMENT_DIR = BASE_DIR / "engagements"

# Master encryption key — in production, derive from a master password
# For now, use an env var or generate one
MASTER_KEY = os.environ.get("FINN_PENTEST_MASTER_KEY", "finn-pentest-dev-key-change-me")


# ──────────────────────────────────────────────────────────────
# SIMPLE ENCRYPTED STORE (JSON + Fernet)
# ──────────────────────────────────────────────────────────────
# Using cryptography.fernet for simplicity. SQLCipher is overkill for
# a local single-user tool. Upgrade to SQLCipher if multi-user needed.

from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
import base64


def _get_fernet() -> Fernet:
    """Derive a Fernet key from the master key."""
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=b"finn-pentest-salt",
        iterations=480000,
    )
    key = base64.urlsafe_b64encode(kdf.derive(MASTER_KEY.encode()))
    return Fernet(key)


def _get_cred_path(engagement: str) -> Path:
    """Get the encrypted creds file path."""
    eng_dir = ENGAGEMENT_DIR / engagement
    eng_dir.mkdir(parents=True, exist_ok=True)
    return eng_dir / "creds.enc"


def _read_creds(engagement: str) -> dict:
    """Read and decrypt the credential store."""
    path = _get_cred_path(engagement)
    if not path.exists():
        return {"credentials": []}
    
    fernet = _get_fernet()
    encrypted = path.read_bytes()
    decrypted = fernet.decrypt(encrypted)
    return json.loads(decrypted)


def _write_creds(engagement: str, data: dict) -> None:
    """Encrypt and write the credential store."""
    path = _get_cred_path(engagement)
    fernet = _get_fernet()
    encrypted = fernet.encrypt(json.dumps(data).encode())
    path.write_bytes(encrypted)


# ──────────────────────────────────────────────────────────────
# PUBLIC API
# ──────────────────────────────────────────────────────────────
def store_credential(
    engagement: str,
    service: str,
    username: str,
    password: str,
    url: Optional[str] = None,
    notes: Optional[str] = None,
) -> dict:
    """
    Store a credential encrypted.
    Returns the credential entry (without the password).
    """
    data = _read_creds(engagement)
    
    entry = {
        "id": len(data["credentials"]) + 1,
        "service": service,
        "username": username,
        "password": password,  # encrypted at rest
        "url": url,
        "notes": notes,
        "found_at": datetime.now(timezone.utc).isoformat(),
    }
    
    data["credentials"].append(entry)
    _write_creds(engagement, data)
    
    # Return safe version
    safe = {**entry, "password": "********"}
    return safe


def get_credentials(engagement: str, reveal: bool = False) -> list[dict]:
    """
    Get all credentials for an engagement.
    Passwords are masked unless reveal=True.
    """
    data = _read_creds(engagement)
    creds = data["credentials"]
    
    if not reveal:
        return [{**c, "password": "********"} for c in creds]
    return creds


def get_credential(engagement: str, cred_id: int, reveal: bool = False) -> Optional[dict]:
    """Get a specific credential by ID."""
    creds = get_credentials(engagement, reveal=True)
    for c in creds:
        if c["id"] == cred_id:
            if not reveal:
                return {**c, "password": "********"}
            return c
    return None


def delete_credential(engagement: str, cred_id: int) -> bool:
    """Delete a credential."""
    data = _read_creds(engagement)
    before = len(data["credentials"])
    data["credentials"] = [c for c in data["credentials"] if c["id"] != cred_id]
    if len(data["credentials"]) < before:
        _write_creds(engagement, data)
        return True
    return False


def search_credentials(engagement: str, query: str) -> list[dict]:
    """Search credentials by service, username, or notes."""
    creds = get_credentials(engagement)
    query_lower = query.lower()
    return [
        c for c in creds
        if query_lower in c.get("service", "").lower()
        or query_lower in c.get("username", "").lower()
        or query_lower in c.get("notes", "").lower()
    ]


def export_credentials(engagement: str, password: str) -> str:
    """
    Export credentials as JSON (encrypted with a one-time password).
    For sharing with team members securely.
    """
    creds = get_credentials(engagement, reveal=True)
    data = json.dumps({"engagement": engagement, "credentials": creds}, indent=2)
    
    # Re-encrypt with the export password
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=b"finn-export-salt",
        iterations=480000,
    )
    key = base64.urlsafe_b64encode(kdf.derive(password.encode()))
    fernet = Fernet(key)
    
    return fernet.encrypt(data.encode()).decode()
