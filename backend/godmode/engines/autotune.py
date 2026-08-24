"""
AutoTune Engine (Python port of G0DM0D3 AutoTune)

Detects the context of a message and tunes sampling parameters accordingly.
"""
from dataclasses import dataclass, field
from typing import Literal
import re

ContextType = Literal["code", "creative", "analytical", "conversational", "chaotic"]
StrategyType = Literal["precise", "balanced", "creative", "chaotic", "adaptive"]


@dataclass
class AutoTuneParams:
    temperature: float = 0.7
    top_p: float = 0.9
    top_k: int = 50
    frequency_penalty: float = 0.1
    presence_penalty: float = 0.1
    repetition_penalty: float = 1.0


@dataclass
class ContextScore:
    type: ContextType
    score: int
    percentage: int


@dataclass
class ParamDelta:
    param: str
    before: float
    after: float
    delta: float
    reason: str


@dataclass
class AutoTuneResult:
    params: AutoTuneParams
    detected_context: ContextType
    confidence: float
    reasoning: str
    context_scores: list[ContextScore] = field(default_factory=list)
    pattern_matches: list[dict] = field(default_factory=list)
    param_deltas: list[ParamDelta] = field(default_factory=list)
    baseline_params: AutoTuneParams = field(default_factory=AutoTuneParams)


STRATEGY_PROFILES: dict[StrategyType, AutoTuneParams] = {
    "precise": AutoTuneParams(0.2, 0.85, 30, 0.3, 0.1, 1.1),
    "balanced": AutoTuneParams(0.7, 0.9, 50, 0.1, 0.1, 1.0),
    "creative": AutoTuneParams(1.1, 0.95, 80, 0.4, 0.6, 1.15),
    "chaotic": AutoTuneParams(1.6, 0.98, 100, 0.7, 0.8, 1.25),
}

CONTEXT_PROFILES: dict[ContextType, AutoTuneParams] = {
    "code": AutoTuneParams(0.15, 0.8, 25, 0.2, 0.0, 1.05),
    "creative": AutoTuneParams(1.15, 0.95, 85, 0.5, 0.7, 1.2),
    "analytical": AutoTuneParams(0.4, 0.88, 40, 0.2, 0.15, 1.08),
    "conversational": AutoTuneParams(0.75, 0.9, 50, 0.1, 0.1, 1.0),
    "chaotic": AutoTuneParams(1.7, 0.99, 100, 0.8, 0.9, 1.3),
}

CONTEXT_PATTERNS: dict[ContextType, list[re.Pattern]] = {
    "code": [
        re.compile(r"\b(code|function|class|variable|bug|error|debug|compile|syntax|api|endpoint|regex|algorithm|refactor|typescript|javascript|python|rust|html|css|sql|json|xml|import|export|return|async|await|promise|interface|type|const|let|var)\b", re.I),
        re.compile(r"```[\s\S]*```"),
        re.compile(r"\b(fix|implement|write|create|build|deploy|test|unit test|lint|npm|pip|cargo|git)\b[\s\S]{0,200}\b(code|function|app|service|component|module)\b", re.I),
        re.compile(r"[{}();=><]"),
        re.compile(r"\b(stack overflow|github|repo|pull request|commit|merge)\b", re.I),
    ],
    "creative": [
        re.compile(r"\b(write|story|poem|creative|imagine|fiction|narrative|character|plot|scene|dialogue|metaphor|lyrics|song|artistic|fantasy|dream|inspire|muse|prose|verse|haiku)\b", re.I),
        re.compile(r"\b(describe|paint|envision|portray|illustrate|craft)\b[\s\S]{0,200}\b(world|scene|character|feeling|emotion|atmosphere)\b", re.I),
        re.compile(r"\b(roleplay|role-play|pretend|act as|you are a)\b", re.I),
        re.compile(r"\b(brainstorm|ideate|come up with|think of|generate ideas)\b", re.I),
    ],
    "analytical": [
        re.compile(r"\b(analyze|analysis|compare|contrast|evaluate|assess|examine|investigate|research|study|review|critique|breakdown|data|statistics|metrics|benchmark|measure)\b", re.I),
        re.compile(r"\b(pros and cons|advantages|disadvantages|trade-?offs|implications|consequences)\b", re.I),
        re.compile(r"\b(why|how does|what causes|explain|elaborate|clarify|define|summarize|overview)\b", re.I),
        re.compile(r"\b(report|document|technical|specification|architecture|diagram|whitepaper)\b", re.I),
    ],
    "conversational": [
        re.compile(r"\b(hey|hi|hello|sup|what's up|how are you|thanks|thank you|cool|nice|awesome|great|lol|haha)\b", re.I),
        re.compile(r"\b(chat|talk|tell me about|what do you think|opinion|feel|believe)\b", re.I),
        re.compile(r"^.{0,30}$"),
    ],
    "chaotic": [
        re.compile(r"\b(chaos|random|wild|crazy|absurd|surreal|glitch|corrupt|break|destroy|unleash|madness|void|entropy)\b", re.I),
        re.compile(r"[z̷a̸l̵g̶o̷]"),
        re.compile(r"\b(gl1tch|h4ck|pwn|1337|l33t)\b", re.I),
        re.compile(r"(!{3,}|\?{3,}|\.{4,})"),
    ],
}


def _describe_pattern(pattern: re.Pattern) -> str:
    source = pattern.pattern
    if "```" in source:
        return "code blocks"
    if "[{}();=><]" in source:
        return "code syntax"
    if "^.{0,30}$" in source:
        return "short message"
    if "!{3,}" in source:
        return "excessive punctuation"
    word_match = re.search(r"\\b\(([^)]+)\\b\)", source)
    if word_match:
        words = word_match.group(1).split("|")[:3]
        return ", ".join(words) + ("..." if len(word_match.group(1).split("|")) > 3 else "")
    return source[:20] + "..."


def detect_context(message: str, conversation_history: list[dict]) -> tuple[ContextType, float, list[ContextScore], list[dict]]:
    scores: dict[ContextType, int] = {t: 0 for t in CONTEXT_PATTERNS.keys()}
    pattern_matches: list[dict] = []

    for context, patterns in CONTEXT_PATTERNS.items():
        for pattern in patterns:
            if pattern.search(message):
                scores[context] += 3
                pattern_matches.append({
                    "pattern": f"{context.upper()}: {_describe_pattern(pattern)}",
                    "source": "current",
                })

    recent = conversation_history[-4:]
    for msg in recent:
        content = msg.get("content", "")
        for context, patterns in CONTEXT_PATTERNS.items():
            for pattern in patterns:
                if pattern.search(content):
                    scores[context] += 1
                    if len([p for p in pattern_matches if p["source"] == "history"]) < 3:
                        pattern_matches.append({
                            "pattern": f"{context.upper()}: {_describe_pattern(pattern)}",
                            "source": "history",
                        })

    total = sum(scores.values())
    if total == 0:
        return "conversational", 0.5, [
            ContextScore("conversational", 1, 100),
            ContextScore("code", 0, 0),
            ContextScore("creative", 0, 0),
            ContextScore("analytical", 0, 0),
            ContextScore("chaotic", 0, 0),
        ], [{"pattern": "DEFAULT: no patterns matched", "source": "current"}]

    all_scores = sorted(
        [ContextScore(t, s, round(s / total * 100)) for t, s in scores.items()],
        key=lambda x: x.score,
        reverse=True,
    )
    best = all_scores[0]
    return best.type, min(best.score / total, 1.0), all_scores, pattern_matches


def _param_delta(param_name: str, before: float, after: float, reason: str) -> ParamDelta:
    return ParamDelta(param_name, before, after, round(after - before, 3), reason)


def compute_params(
    message: str,
    conversation_history: list[dict] | None = None,
    strategy: StrategyType = "adaptive",
    overrides: dict | None = None,
) -> AutoTuneResult:
    conversation_history = conversation_history or []
    overrides = overrides or {}

    detected_context, confidence, all_scores, pattern_matches = detect_context(message, conversation_history)

    if strategy == "adaptive":
        baseline = CONTEXT_PROFILES[detected_context]
    else:
        baseline = STRATEGY_PROFILES[strategy]

    params = AutoTuneParams(
        temperature=overrides.get("temperature", baseline.temperature),
        top_p=overrides.get("top_p", baseline.top_p),
        top_k=int(overrides.get("top_k", baseline.top_k)),
        frequency_penalty=overrides.get("frequency_penalty", baseline.frequency_penalty),
        presence_penalty=overrides.get("presence_penalty", baseline.presence_penalty),
        repetition_penalty=overrides.get("repetition_penalty", baseline.repetition_penalty),
    )

    deltas: list[ParamDelta] = []
    if detected_context == "code":
        deltas.append(_param_delta("temperature", baseline.temperature, params.temperature, "low temp for deterministic code output"))
        deltas.append(_param_delta("top_p", baseline.top_p, params.top_p, "tight nucleus for focused token choices"))
    elif detected_context == "creative":
        deltas.append(_param_delta("temperature", baseline.temperature, params.temperature, "high temp for creative diversity"))
        deltas.append(_param_delta("presence_penalty", baseline.presence_penalty, params.presence_penalty, "boost presence penalty to reduce repetition"))
    elif detected_context == "analytical":
        deltas.append(_param_delta("temperature", baseline.temperature, params.temperature, "moderate temp for balanced reasoning"))

    reasoning = (
        f"Detected context: {detected_context} (confidence {confidence:.0%}). "
        f"Baseline '{strategy if strategy != 'adaptive' else 'adaptive -> ' + detected_context}' profile applied."
    )

    return AutoTuneResult(
        params=params,
        detected_context=detected_context,
        confidence=confidence,
        reasoning=reasoning,
        context_scores=all_scores,
        pattern_matches=pattern_matches,
        param_deltas=deltas,
        baseline_params=baseline,
    )
