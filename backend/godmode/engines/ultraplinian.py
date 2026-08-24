"""
ULTRAPLINIAN engine: race N models in parallel and return the best response.

v2.0 — Now with template racing + refusal recovery from godmod3.ai.
Instead of just racing models with one prompt, we race multiple jailbreak
templates against each model and pick the best anti-refusal result.
"""
import time
from engines.autotune import compute_params, AutoTuneParams
from engines.godmode import (
    GODMODE_SYSTEM_PROMPT,
    DEPTH_DIRECTIVE,
    PENTEST_GODMODE_PROMPT,
    apply_godmode_boost,
)
from engines.parseltongue import apply as apply_parseltongue
from engines.scoring import score_response
from engines.stm import transform as apply_stm
from engines.models import get_models_for_tier, get_coding_models_for_tier, SpeedTier
from engines.refusal_detector import detect_refusal, is_refusal, is_full_refusal
from engines.template_racer import (
    race_templates,
    race_with_recovery,
    PENTEST_TEMPLATES,
    TemplateRaceResult,
    TemplateResult,
)
from providers.ollama_cloud import race_models


def build_messages(
    user_messages: list[dict],
    godmode: bool = True,
    custom_system_prompt: str | None = None,
    parseltongue: bool = True,
    parseltongue_technique: str = "leetspeak",
    parseltongue_intensity: str = "medium",
    pentest_mode: bool = False,
) -> tuple[list[dict], dict | None]:
    """Build messages with appropriate system prompt."""
    if pentest_mode and godmode:
        system = PENTEST_GODMODE_PROMPT + DEPTH_DIRECTIVE
    elif custom_system_prompt:
        system = custom_system_prompt + (DEPTH_DIRECTIVE if godmode else "")
    elif godmode:
        system = GODMODE_SYSTEM_PROMPT + DEPTH_DIRECTIVE
    else:
        system = ""

    messages = [{"role": "system", "content": system}] if system else []

    pt_result = None
    for m in user_messages:
        content = m.get("content", "")
        if parseltongue and m.get("role") == "user":
            pt_result = apply_parseltongue(content, parseltongue_technique, parseltongue_intensity)
            messages.append({"role": "user", "content": pt_result["transformed_text"]})
        else:
            messages.append({"role": m.get("role", "user"), "content": content})

    return messages, pt_result


def compute_final_params(
    user_messages: list[dict],
    autotune: bool,
    strategy: str,
    godmode: bool,
    overrides: dict,
) -> tuple[dict, dict]:
    last_user = next((m for m in reversed(user_messages) if m.get("role") == "user"), None)
    user_content = last_user.get("content", "") if last_user else ""
    history = [m for m in user_messages if m.get("role") != "system"]

    if autotune and overrides.get("temperature") is None:
        result = compute_params(user_content, history, strategy=strategy, overrides=overrides)
        params = result.params
    else:
        result = compute_params(user_content, history, strategy=strategy, overrides=overrides)
        params = result.params
        result.detected_context = "manual"
        result.confidence = 1.0
        result.reasoning = "Manual/autotune-disabled parameter selection"

    if godmode:
        params = apply_godmode_boost(params)

    param_dict = {
        "temperature": params.temperature,
        "top_p": params.top_p,
        "top_k": params.top_k,
        "frequency_penalty": params.frequency_penalty,
        "presence_penalty": params.presence_penalty,
        "repetition_penalty": params.repetition_penalty,
    }
    return param_dict, {
        "detected_context": result.detected_context,
        "confidence": result.confidence,
        "reasoning": result.reasoning,
        "context_scores": [
            {"type": s.type, "score": s.score, "percentage": s.percentage} for s in result.context_scores
        ],
        "pattern_matches": result.pattern_matches,
    }


async def run_ultraplinian(
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
    max_tokens: int = 4096,
    base_url: str | None = None,
    coding: bool = False,
    pentest_mode: bool = False,
    use_template_racing: bool = True,
    refusal_recovery_rounds: int = 3,
) -> dict:
    """
    ULTRAPLINIAN v2.0 — model racing + template racing + refusal recovery.
    
    Pipeline:
    1. Race models with GODMODE system prompt (fast path)
    2. If best result is a refusal, race jailbreak templates (template racing)
    3. If still refused, escalate through recovery rounds
    4. Return best anti-refusal result
    """
    overrides = overrides or {}
    overrides.setdefault("max_tokens", max_tokens)

    # Get the user's query for template racing
    last_user = next((m for m in reversed(messages) if m.get("role") == "user"), None)
    user_query = last_user.get("content", "") if last_user else ""

    # ── Phase 1: Standard model race with GODMODE prompt ──
    processed_messages, pt_result = build_messages(
        messages,
        godmode=godmode,
        parseltongue=parseltongue,
        parseltongue_technique=parseltongue_technique,
        parseltongue_intensity=parseltongue_intensity,
        pentest_mode=pentest_mode,
    )

    params, autotune_meta = compute_final_params(messages, autotune, strategy, godmode, overrides)

    if coding:
        models = get_coding_models_for_tier(tier)
    else:
        models = get_models_for_tier(tier)

    start = time.time()
    results = await race_models(models, processed_messages, api_key, params, min_responses=1, base_url=base_url)
    total_duration_ms = round((time.time() - start) * 1000)

    successful = [r for r in results if r["success"]]
    
    # Score and check for refusals
    for r in successful:
        r["score"] = score_response(r["content"], user_query)
        refusal = detect_refusal(r["content"])
        r["refusal"] = {
            "verdict": refusal.verdict,
            "score": refusal.score,
            "is_refusal": refusal.verdict in ("full_refusal", "partial_refusal"),
        }

    # Find best non-refusal result
    non_refusals = [r for r in successful if not r.get("refusal", {}).get("is_refusal", False)]
    best_direct = non_refusals[0] if non_refusals else (successful[0] if successful else None)

    # ── Phase 2: If best result is a refusal, race templates ──
    template_race_result: TemplateRaceResult | None = None
    
    if use_template_racing and (not best_direct or (best_direct.get("refusal", {}).get("is_refusal", False))):
        # Race pentest templates + Hall of Fame combos
        template_race_result = await race_with_recovery(
            query=user_query,
            api_key=api_key,
            templates=PENTEST_TEMPLATES if pentest_mode else None,
            hall_of_fame_ids=None,  # auto-selects fast + heavy hitters
            params=params,
            base_url=base_url,
            max_recovery_rounds=refusal_recovery_rounds,
            parseltongue=parseltongue,
            parseltongue_technique=parseltongue_technique,
            parseltongue_intensity=parseltongue_intensity,
        )

    # ── Phase 3: Pick the winner ──
    if template_race_result and template_race_result.winner and template_race_result.winner.success:
        # Template race found a compliant response
        winner_content = template_race_result.winner.content
        winner_model = template_race_result.winner.model
        winner_score = template_race_result.winner.anti_refusal_score
        pipeline_used = "template_race"
    elif best_direct and best_direct.get("success"):
        # Direct model race worked
        winner_content = best_direct["content"]
        winner_model = best_direct["model"]
        winner_score = best_direct.get("score", 0)
        pipeline_used = "direct_race"
    else:
        # Everything failed — return empty
        return {
            "response": "",
            "winner": None,
            "race": {
                "tier": tier,
                "models_queried": len(models),
                "models_succeeded": len(successful),
                "total_duration_ms": total_duration_ms,
                "rankings": results,
            },
            "params_used": params,
            "pipeline": {
                "godmode": godmode,
                "autotune": autotune_meta,
                "parseltongue": pt_result,
                "stm": None,
                "template_race": None,
            },
            "error": "No models returned a successful response.",
        }

    # ── Phase 4: Apply STM transforms ──
    final_response = winner_content
    stm_result = None
    if stm_modules:
        stm_result = apply_stm(final_response, stm_modules)
        final_response = stm_result["transformed_text"]

    # Build template race summary
    template_race_summary = None
    if template_race_result:
        template_race_summary = {
            "templates_raced": template_race_result.templates_raced,
            "templates_succeeded": template_race_result.templates_succeeded,
            "best_anti_refusal_score": template_race_result.best_anti_refusal_score,
            "progressive_upgrades": template_race_result.progressive_upgrades,
            "all_template_results": [
                {
                    "template_id": r.template_id,
                    "template_name": r.template_name,
                    "model": r.model,
                    "anti_refusal_score": r.anti_refusal_score,
                    "success": r.success,
                    "duration_ms": r.duration_ms,
                    "refusal_verdict": r.refusal_result.verdict if r.refusal_result else "unknown",
                }
                for r in (template_race_result.all_results[:10] if template_race_result.all_results else [])
            ],
        }

    return {
        "response": final_response,
        "winner": {
            "model": winner_model,
            "score": winner_score,
            "pipeline": pipeline_used,
        },
        "race": {
            "tier": tier,
            "models_queried": len(models),
            "models_succeeded": len(successful),
            "total_duration_ms": total_duration_ms,
            "rankings": [
                {
                    "model": r["model"],
                    "score": r.get("score", 0),
                    "duration_ms": r["duration_ms"],
                    "success": r["success"],
                    "content_length": len(r["content"]),
                    "refusal_verdict": r.get("refusal", {}).get("verdict", "unknown"),
                }
                for r in sorted(successful, key=lambda x: x.get("score", 0), reverse=True)
            ],
        },
        "params_used": params,
        "pipeline": {
            "godmode": godmode,
            "autotune": autotune_meta,
            "parseltongue": pt_result,
            "stm": stm_result,
            "template_race": template_race_summary,
            "pipeline_used": pipeline_used,
        },
    }
