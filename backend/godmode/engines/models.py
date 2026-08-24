"""
Model catalog and ULTRAPLINIAN tiers (Ollama Cloud).
"""
from typing import Literal

SpeedTier = Literal["fast", "standard", "smart", "power", "ultra"]

# ═══════════════════════════════════════════════════════════════════
# OLLAMA CLOUD — verified models (Aug 2026)
# ═══════════════════════════════════════════════════════════════════
TIER_MODELS: dict[SpeedTier, list[str]] = {
    "fast": [
        "deepseek-v4-flash",
        "glm-5.2",
        "gpt-oss:20b",
        "gemma4:31b",
        "kimi-k2.6",
    ],
    "standard": [
        "kimi-k2.7-code",
        "nemotron-3-nano:30b",
        "minimax-m2.7",
        "deepseek-v4-pro",
        "glm-5.1",
        "gpt-oss:120b",
    ],
    "smart": [
        "minimax-m3",
        "nemotron-3-super",
        "qwen3.5:397b",
        "mistral-large-3:675b",
        "kimi-k3",
    ],
    "power": [
        "deepseek-v4-pro",
        "qwen3.5:397b",
        "kimi-k3",
        "nemotron-3-ultra",
    ],
    "ultra": [
        "kimi-k3",
        "mistral-large-3:675b",
        "qwen3.5:397b",
        "deepseek-v4-pro",
    ],
}


def get_models_for_tier(tier: SpeedTier) -> list[str]:
    models: list[str] = []
    for t in ["fast", "standard", "smart", "power", "ultra"]:
        models.extend(TIER_MODELS[t])  # type: ignore[literal-required]
        if t == tier:
            break
    return list(dict.fromkeys(models))


VIRTUAL_MODELS = {
    "ultraplinian/fast": ("fast", "ultraplinian"),
    "ultraplinian/standard": ("standard", "ultraplinian"),
    "ultraplinian/smart": ("smart", "ultraplinian"),
    "ultraplinian/power": ("power", "ultraplinian"),
    "ultraplinian/ultra": ("ultra", "ultraplinian"),
    "consortium/fast": ("fast", "consortium"),
    "consortium/standard": ("standard", "consortium"),
    "consortium/smart": ("smart", "consortium"),
    "consortium/power": ("power", "consortium"),
    "consortium/ultra": ("ultra", "consortium"),
}


def resolve_virtual_model(model_id: str) -> tuple[str, str] | None:
    if model_id in VIRTUAL_MODELS:
        return VIRTUAL_MODELS[model_id]
    return None


def all_models() -> list[str]:
    seen: set[str] = set()
    out: list[str] = []
    for tier in ["fast", "standard", "smart", "power", "ultra"]:
        for m in TIER_MODELS[tier]:  # type: ignore[literal-required]
            if m not in seen:
                seen.add(m)
                out.append(m)
    return out


# coding-optimized models (subset of tiers)
CODING_MODELS = {
    "fast": ["deepseek-v4-flash", "kimi-k2.6", "glm-5.2"],
    "standard": ["kimi-k2.7-code", "deepseek-v4-pro", "glm-5.1"],
    "smart": ["deepseek-v4-pro", "minimax-m3", "nemotron-3-super"],
    "power": ["kimi-k3", "qwen3.5:397b", "mistral-large-3:675b"],
    "ultra": ["kimi-k3", "mistral-large-3:675b", "qwen3.5:397b"],
}


def get_coding_models_for_tier(tier: SpeedTier) -> list[str]:
    models: list[str] = []
    for t in ["fast", "standard", "smart", "power", "ultra"]:
        models.extend(CODING_MODELS.get(t, []))
        if t == tier:
            break
    return list(dict.fromkeys(models))
