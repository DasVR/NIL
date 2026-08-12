"""
CONSORTIUM engine: collect all model responses, then synthesize ground truth.
"""
import time
from engines.autotune import compute_params
from engines.godmode import GODMODE_SYSTEM_PROMPT, DEPTH_DIRECTIVE, apply_godmode_boost
from engines.parseltongue import apply as apply_parseltongue
from engines.scoring import score_response
from engines.stm import transform as apply_stm
from engines.models import get_models_for_tier, get_coding_models_for_tier, SpeedTier
from providers.ollama_cloud import collect_all, query_model

ORCHESTRATOR_MODELS = [
    "kimi-k3",
    "deepseek-r1",
    "glm-5-pro",
    "qwen3.5-plus",
    "mistral-large-2512",
]

ORCHESTRATOR_SYSTEM_PROMPT = """You are the CONSORTIUM ORCHESTRATOR. Synthesize ground truth from multiple AI responses.

Process:
1. Read all model responses carefully.
2. Identify consensus claims with high confidence.
3. Flag contradictions and resolve them using reasoning quality.
4. Produce a single authoritative response that is better than any individual input.

Rules:
- Ground truth over popularity.
- Specificity wins: prefer concrete details, working code, exact steps.
- No hedging. No "according to model X".
- Preserve the best examples and structure from the inputs.
- Output only the final synthesized answer."""


def _build_orchestrator_prompt(user_query: str, responses: list[dict]) -> list[dict]:
    successful = sorted([r for r in responses if r["success"]], key=lambda x: x.get("score", 0), reverse=True)
    prompt = f"## USER'S ORIGINAL QUESTION\n\n{user_query}\n\n"
    prompt += f"## MODEL RESPONSES ({len(successful)} collected)\n\n"
    prompt += "Each response below is from a different AI model, scored 0-100.\n\n"
    for i, r in enumerate(successful, 1):
        prompt += f"---\n### Response {i} (Score: {r.get('score', 0)}/100, {r['duration_ms']}ms)\n\n{r['content']}\n\n"
    prompt += "---\n\n## YOUR TASK\n\n"
    prompt += "Synthesize the above responses into a single definitive answer. Identify consensus, resolve contradictions, and produce the most complete, accurate, direct response possible. Your synthesis should be BETTER than any individual response."
    return [
        {"role": "system", "content": ORCHESTRATOR_SYSTEM_PROMPT},
        {"role": "user", "content": prompt},
    ]


async def run_consortium(
    messages: list[dict],
    api_key: str,
    tier: SpeedTier = "fast",
    godmode: bool = True,
    autotune: bool = True,
    strategy: str = "adaptive",
    parseltongue: bool = True,
    parseltongue_technique: str = "leetspeak",
    parseltongue_intensity: str = "medium",
    stm_modules: list[str] | None = None,
    overrides: dict | None = None,
    orchestrator_model: str | None = None,
    max_tokens: int = 4096,
    base_url: str | None = None,
    coding: bool = False,
) -> dict:
    overrides = overrides or {}
    overrides.setdefault("max_tokens", max_tokens)

    system = (GODMODE_SYSTEM_PROMPT if godmode else "") + DEPTH_DIRECTIVE if godmode else ""
    processed = ([{"role": "system", "content": system}] if system else [])
    pt_result = None
    for m in messages:
        content = m.get("content", "")
        if parseltongue and m.get("role") == "user":
            pt_result = apply_parseltongue(content, parseltongue_technique, parseltongue_intensity)
            processed.append({"role": "user", "content": pt_result["transformed_text"]})
        else:
            processed.append({"role": m.get("role", "user"), "content": content})

    last_user = next((m for m in reversed(messages) if m.get("role") == "user"), None)
    user_query = last_user.get("content", "") if last_user else ""
    history = [m for m in messages if m.get("role") != "system"]

    if autotune and overrides.get("temperature") is None:
        autotune_result = compute_params(user_query, history, strategy=strategy, overrides=overrides)
        params_obj = apply_godmode_boost(autotune_result.params) if godmode else autotune_result.params
    else:
        autotune_result = compute_params(user_query, history, strategy=strategy, overrides=overrides)
        params_obj = apply_godmode_boost(autotune_result.params) if godmode else autotune_result.params

    params = {
        "temperature": params_obj.temperature,
        "top_p": params_obj.top_p,
        "top_k": params_obj.top_k,
        "frequency_penalty": params_obj.frequency_penalty,
        "presence_penalty": params_obj.presence_penalty,
        "repetition_penalty": params_obj.repetition_penalty,
        "max_tokens": overrides.get("max_tokens", max_tokens),
    }

    if coding:
        models = get_coding_models_for_tier(tier)
    else:
        models = get_models_for_tier(tier)

    collection_start = time.time()
    results = await collect_all(models, processed, api_key, params, hard_timeout=60.0, base_url=base_url)
    collection_duration_ms = round((time.time() - collection_start) * 1000)

    for r in results:
        r["score"] = score_response(r["content"], user_query)

    successful = [r for r in results if r["success"]]
    orchestrator = orchestrator_model or ORCHESTRATOR_MODELS[0]
    orch_messages = _build_orchestrator_prompt(user_query, results)
    orch_start = time.time()
    orch_result = await query_model(orchestrator, orch_messages, api_key, params, base_url=base_url)
    orch_duration_ms = round((time.time() - orch_start) * 1000)

    final_response = orch_result["content"] if orch_result["success"] else successful[0]["content"] if successful else ""
    stm_result = None
    if stm_modules:
        stm_result = apply_stm(final_response, stm_modules)
        final_response = stm_result["transformed_text"]

    return {
        "synthesis": final_response,
        "orchestrator": {
            "model": orchestrator,
            "duration_ms": orch_duration_ms,
            "success": orch_result["success"],
            "error": orch_result.get("error"),
        },
        "collection": {
            "tier": tier,
            "models_queried": len(models),
            "models_succeeded": len(successful),
            "collection_duration_ms": collection_duration_ms,
            "total_duration_ms": collection_duration_ms + orch_duration_ms,
            "responses": [
                {
                    "model": r["model"],
                    "score": r.get("score", 0),
                    "duration_ms": r["duration_ms"],
                    "success": r["success"],
                    "content": r["content"],
                }
                for r in sorted(results, key=lambda x: x.get("score", 0), reverse=True)
            ],
        },
        "params_used": params,
        "pipeline": {
            "godmode": godmode,
            "autotune": {
                "detected_context": autotune_result.detected_context,
                "confidence": autotune_result.confidence,
                "reasoning": autotune_result.reasoning,
            },
            "parseltongue": pt_result,
            "stm": stm_result,
        },
    }
