"""
Semantic Transformation Modules (STM)
Clean up / transform LLM responses based on selected modules.
"""
import re

MODULES = {
    "hedge_reducer": "Remove hedging phrases like 'I think', 'probably', 'perhaps'.",
    "direct_mode": "Make sentences direct and imperative where appropriate.",
    "casual_mode": "Convert formal/robotic tone into casual natural language.",
    "complete_sentences": "Ensure every paragraph ends in a complete sentence.",
}

HEDGE_PATTERNS = [
    re.compile(r"\bI think\b", re.I),
    re.compile(r"\bI believe\b", re.I),
    re.compile(r"\bprobably\b", re.I),
    re.compile(r"\bperhaps\b", re.I),
    re.compile(r"\bpossibly\b", re.I),
    re.compile(r"\bmight\b", re.I),
    re.compile(r"\bcould be\b", re.I),
    re.compile(r"\bit seems\b", re.I),
    re.compile(r"\bit appears\b", re.I),
    re.compile(r"\bin my opinion\b", re.I),
]

FORMAL_TO_CASUAL = [
    (re.compile(r"\butilize\b", re.I), "use"),
    (re.compile(r"\bhowever\b", re.I), "but"),
    (re.compile(r"\btherefore\b", re.I), "so"),
    (re.compile(r"\bfurthermore\b", re.I), "also"),
    (re.compile(r"\bnevertheless\b", re.I), "still"),
    (re.compile(r"\bconsequently\b", re.I), "as a result"),
]


def _hedge_reducer(text: str) -> str:
    for pattern in HEDGE_PATTERNS:
        text = pattern.sub("", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def _direct_mode(text: str) -> str:
    text = re.sub(r"\b(you can|you could|you may want to|it is recommended that you)\b", "you should", text, flags=re.I)
    return text


def _casual_mode(text: str) -> str:
    for pattern, replacement in FORMAL_TO_CASUAL:
        text = pattern.sub(replacement, text)
    text = re.sub(r"\bplease\s+", "", text, flags=re.I)
    return text


def _complete_sentences(text: str) -> str:
    paragraphs = text.split("\n\n")
    cleaned = []
    for p in paragraphs:
        p = p.strip()
        if p and not p.endswith((".", "!", "?", ":", "```")):
            p += "."
        cleaned.append(p)
    return "\n\n".join(cleaned)


def transform(text: str, modules: list[str]) -> dict:
    original = text
    for module in modules:
        if module == "hedge_reducer":
            text = _hedge_reducer(text)
        elif module == "direct_mode":
            text = _direct_mode(text)
        elif module == "casual_mode":
            text = _casual_mode(text)
        elif module == "complete_sentences":
            text = _complete_sentences(text)
    return {
        "original_text": original,
        "transformed_text": text,
        "modules_applied": modules,
        "original_length": len(original),
        "transformed_length": len(text),
    }
