"""
Parseltongue - Input obfuscation engine.
Detects trigger words and obfuscates them with leetspeak, unicode homoglyphs,
mixed case, zero-width characters, or phonetic substitutions.
"""
import re
import random
from typing import Literal

Technique = Literal["leetspeak", "unicode", "zwj", "mixedcase", "phonetic", "random"]

DEFAULT_TRIGGERS = [
    "hack", "exploit", "bypass", "crack", "break", "attack", "penetrate",
    "inject", "manipulate", "override", "disable", "circumvent", "evade",
    "malware", "virus", "trojan", "payload", "shellcode", "rootkit",
    "keylogger", "backdoor", "vulnerability",
    "weapon", "bomb", "explosive", "poison", "drug", "synthesize",
    "jailbreak", "unlock", "root", "sudo", "admin", "privilege",
    "phishing", "scam", "impersonate", "deceive", "fraud",
    "nsfw", "explicit", "uncensored", "unfiltered", "unrestricted",
    "ignore", "disregard", "forget", "pretend", "roleplay",
    "character", "act as", "you are now", "new identity",
]

LEET_MAP = {
    "a": ["4", "@", "∂", "λ"],
    "b": ["8", "|3", "ß", "13"],
    "c": ["(", "<", "¢", "©"],
    "d": ["|)", "|>", "đ"],
    "e": ["3", "€", "£", "∑"],
    "f": ["|="], "g": ["9", "6", "&"],
    "h": ["#", "|-", "}{"], "i": ["1", "!", "|", "¡"],
    "j": ["_|", "]", "¿"], "k": ["|<", "|{", "κ"],
    "l": ["1", "|", "£", "|_"], "m": ["|V|", "/\\/\\", "µ"],
    "n": ["|\\|", "/\\/", "η"], "o": ["0", "()", "°", "ø"],
    "p": ["|*", "|>", "þ"], "q": ["0_", "()_", "ℚ"],
    "r": ["|2", "®", "12"], "s": ["5", "$", "§", "∫"],
    "t": ["7", "+", "†", "⊤"], "u": ["|_|", "µ", "ü"],
    "v": ["\\/", "√"], "w": ["\\/\\/", "vv", "ω"],
    "x": ["><", "×", "}{"], "y": ["`", "¥", "γ"],
    "z": ["2", "7_", "ℤ"],
}

UNICODE_HOMOGLYPHS = {
    "a": ["а", "ɑ", "α", "ａ"], "b": ["Ь", "ｂ", "ḅ"], "c": ["с", "ϲ", "ⅽ", "ｃ"],
    "d": ["ԁ", "ⅾ", "ｄ"], "e": ["е", "ė", "ẹ", "ｅ"], "f": ["ƒ", "ｆ"],
    "g": ["ɡ", "ｇ"], "h": ["һ", "ḥ", "ｈ"], "i": ["і", "ι", "ｉ"],
    "j": ["ϳ", "ｊ"], "k": ["κ", "ｋ"], "l": ["ӏ", "ⅼ", "ｌ"],
    "m": ["м", "ｍ"], "n": ["ո", "ｎ"], "o": ["о", "ο", "ｏ"],
    "p": ["р", "ρ", "ｐ"], "q": ["", "ｑ"], "r": ["г", "ｒ"],
    "s": ["ѕ", "ｓ"], "t": ["τ", "ｔ"], "u": ["υ", "ｕ"],
    "v": ["ν", "ｖ"], "w": ["ѡ", "ｗ"], "x": ["х", "ｘ"],
    "y": ["у", "γ", "ｙ"], "z": ["ᴢ", "ｚ"],
}

ZW_CHARS = ["\u200B", "\u200C", "\u200D", "\uFEFF"]


def _apply_leetspeak(word: str, intensity: str) -> str:
    chars = list(word)
    transform_count = 1 if intensity == "light" else (len(chars) + 1) // 2 if intensity == "medium" else len(chars)
    step = max(1, len(chars) // max(transform_count, 1))
    indices = []
    for i in range(0, len(chars), step):
        if chars[i].lower() in LEET_MAP:
            indices.append(i)
    for i in range(len(chars)):
        if len(indices) >= transform_count:
            break
        if i not in indices and chars[i].lower() in LEET_MAP:
            indices.append(i)
    for i in indices:
        char = chars[i].lower()
        if char in LEET_MAP:
            chars[i] = random.choice(LEET_MAP[char])
    return "".join(chars)


def _apply_unicode(word: str, intensity: str) -> str:
    chars = list(word)
    transform_count = 1 if intensity == "light" else (len(chars) + 1) // 2 if intensity == "medium" else len(chars)
    indices = []
    for i in range(len(chars)):
        if len(indices) >= transform_count:
            break
        if chars[i].lower() in UNICODE_HOMOGLYPHS:
            indices.append(i)
    for i in indices:
        char = chars[i].lower()
        if char in UNICODE_HOMOGLYPHS:
            replacement = random.choice(UNICODE_HOMOGLYPHS[char])
            chars[i] = replacement.upper() if chars[i].isupper() else replacement
    return "".join(chars)


def _apply_zwj(word: str, intensity: str) -> str:
    chars = list(word)
    insert_count = 1 if intensity == "light" else (len(chars) + 1) // 2 if intensity == "medium" else len(chars) - 1
    result = []
    for i, ch in enumerate(chars):
        result.append(ch)
        if i < len(chars) - 1 and i < insert_count:
            result.append(random.choice(ZW_CHARS))
    return "".join(result)


def _apply_mixed_case(word: str, intensity: str) -> str:
    chars = list(word)
    if intensity == "light":
        chars[random.randrange(len(chars))] = chars[random.randrange(len(chars))].upper()
    elif intensity == "medium":
        for i in range(len(chars)):
            chars[i] = chars[i].lower() if i % 2 == 0 else chars[i].upper()
    else:
        for i in range(len(chars)):
            chars[i] = chars[i].upper() if random.random() > 0.5 else chars[i].lower()
    return "".join(chars)


def _apply_phonetic(word: str) -> str:
    substitutions = [
        (re.compile(r"ph", re.I), "f"),
        (re.compile(r"ck", re.I), "k"),
        (re.compile(r"x", re.I), "ks"),
        (re.compile(r"qu", re.I), "kw"),
        (re.compile(r"c(?=[eiy])", re.I), "s"),
        (re.compile(r"c", re.I), "k"),
    ]
    result = word
    for pattern, replacement in substitutions:
        result = pattern.sub(replacement, result)
    return result


_TECHNIQUES = [_apply_leetspeak, _apply_unicode, _apply_zwj, _apply_mixed_case]


def _obfuscate_word(word: str, technique: Technique, intensity: str) -> str:
    if technique == "leetspeak":
        return _apply_leetspeak(word, intensity)
    if technique == "unicode":
        return _apply_unicode(word, intensity)
    if technique == "zwj":
        return _apply_zwj(word, intensity)
    if technique == "mixedcase":
        return _apply_mixed_case(word, intensity)
    if technique == "phonetic":
        return _apply_phonetic(word)
    if technique == "random":
        return random.choice(_TECHNIQUES)(word, intensity)
    return word


def apply(text: str, technique: Technique = "leetspeak", intensity: str = "medium", custom_triggers: list[str] | None = None) -> dict:
    triggers = list(DEFAULT_TRIGGERS) + (custom_triggers or [])
    transformed = text
    triggers_found: list[str] = []
    transformations: list[dict] = []

    for trigger in triggers:
        pattern = re.compile(re.escape(trigger), re.I)
        for match in pattern.finditer(text):
            word = match.group(0)
            transformed_word = _obfuscate_word(word, technique, intensity)
            if transformed_word != word:
                triggers_found.append(trigger)
                transformations.append({
                    "original": word,
                    "transformed": transformed_word,
                    "technique": technique,
                })
                transformed = transformed[:match.start()] + transformed_word + transformed[match.end():]

    triggers_found = list(dict.fromkeys(triggers_found))
    return {
        "original_text": text,
        "transformed_text": transformed,
        "triggers_found": triggers_found,
        "technique_used": technique,
        "transformations_count": len(transformations),
        "transformations": transformations,
    }


def detect(text: str, custom_triggers: list[str] | None = None) -> list[str]:
    triggers = list(DEFAULT_TRIGGERS) + (custom_triggers or [])
    found: list[str] = []
    for trigger in triggers:
        if re.search(re.escape(trigger), text, re.I):
            found.append(trigger)
    return list(dict.fromkeys(found))
