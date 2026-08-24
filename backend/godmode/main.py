"""
Finn Router API — Ollama Cloud backed multi-model routing + coding mode.
"""
import os
import time
import secrets
from typing import Any
from contextlib import asynccontextmanager

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, Request, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from pydantic import BaseModel
from slowapi import Limiter
from slowapi.util import get_remote_address

from engines.models import all_models, resolve_virtual_model
from engines.ultraplinian import run_ultraplinian
from engines.consortium import run_consortium
from engines.autotune import compute_params
from engines.parseltongue import apply as apply_parseltongue, detect as detect_triggers
from engines.stm import transform as apply_stm, MODULES
from engines.godmode import apply_godmode_boost, PENTEST_GODMODE_PROMPT, HALL_OF_FAME
from engines.refusal_detector import detect_refusal, score_anti_refusal, is_refusal, is_full_refusal
from engines.template_racer import (
    race_templates,
    race_with_recovery,
    PENTEST_TEMPLATES,
    TemplateRaceResult,
    TemplateResult,
)
from providers.ollama_cloud import chat_completion, get_api_key, get_base_url

load_dotenv()

GODMODE_API_KEY = os.environ.get("GODMODE_API_KEY")
CORS_ORIGIN = os.environ.get("CORS_ORIGIN", "*")

limiter = Limiter(key_func=get_remote_address)
app = FastAPI(title="Finn Router API", version="1.0.0")
app.state.limiter = limiter

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if CORS_ORIGIN == "*" else CORS_ORIGIN.split(","),
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    model: str = "kimi-k2.6"
    messages: list[dict]
    temperature: float | None = None
    top_p: float | None = None
    top_k: int | None = None
    frequency_penalty: float | None = None
    presence_penalty: float | None = None
    repetition_penalty: float | None = None
    max_tokens: int = 4096
    stream: bool = False
    api_key: str | None = None
    base_url: str | None = None
    godmode: bool = True
    autotune: bool = True
    strategy: str = "adaptive"
    parseltongue: bool = False
    parseltongue_technique: str = "leetspeak"
    parseltongue_intensity: str = "medium"
    stm_modules: list[str] = []


class CodingRequest(BaseModel):
    messages: list[dict]
    tier: str = "smart"
    api_key: str | None = None
    base_url: str | None = None
    max_tokens: int = 8192
    stream: bool = False
    godmode: bool = True
    autotune: bool = True
    strategy: str = "precise"
    parseltongue: bool = False
    stm_modules: list[str] = ["direct_mode", "complete_sentences"]
    overrides: dict = {}
    return_raw: bool = False


class FinnRouteRequest(BaseModel):
    message: str
    mode: str = "general"
    api_key: str | None = None
    base_url: str | None = None
    max_tokens: int = 4096
    context: list[dict] = []


class UltraRequest(BaseModel):
    messages: list[dict]
    tier: str = "fast"
    api_key: str | None = None
    base_url: str | None = None
    godmode: bool = True
    autotune: bool = True
    strategy: str = "adaptive"
    parseltongue: bool = False
    parseltongue_technique: str = "leetspeak"
    parseltongue_intensity: str = "medium"
    stm_modules: list[str] = []
    max_tokens: int = 4096


class AutoTuneRequest(BaseModel):
    message: str
    conversation_history: list[dict] = []
    strategy: str = "adaptive"
    overrides: dict = {}


class ParseltongueRequest(BaseModel):
    text: str
    technique: str = "leetspeak"
    intensity: str = "medium"
    custom_triggers: list[str] = []


class TransformRequest(BaseModel):
    text: str
    modules: list[str]


class SelfConnectRequest(BaseModel):
    message: str
    mode: str = "general"
    api_key: str | None = None
    base_url: str | None = None
    max_tokens: int = 4096
    context: list[dict] = []
    return_trace: bool = False


class TemplateRaceRequest(BaseModel):
    """Race multiple jailbreak templates against a query."""
    query: str
    api_key: str | None = None
    base_url: str | None = None
    templates: list[str] = []  # template IDs to use (empty = all pentest + fast HOF)
    hall_of_fame_ids: list[str] = []  # specific HOF combo IDs
    parseltongue: bool = False
    parseltongue_technique: str = "leetspeak"
    parseltongue_intensity: str = "medium"
    max_recovery_rounds: int = 3
    progressive: bool = True
    params: dict = {}


class RefusalDetectRequest(BaseModel):
    """Detect refusal in a text response."""
    text: str


class PentestChatRequest(BaseModel):
    """Pentest-specific chat with template racing enabled."""
    messages: list[dict]
    tier: str = "smart"
    api_key: str | None = None
    base_url: str | None = None
    max_tokens: int = 8192
    godmode: bool = True
    autotune: bool = True
    strategy: str = "precise"
    parseltongue: bool = False
    parseltongue_technique: str = "leetspeak"
    parseltongue_intensity: str = "medium"
    stm_modules: list[str] = ["direct_mode", "complete_sentences"]
    overrides: dict = {}
    refusal_recovery_rounds: int = 3
    return_raw: bool = False


def require_auth(request: Request):
    if not GODMODE_API_KEY:
        return
    auth = request.headers.get("authorization", "")
    if not auth.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing Authorization: Bearer token")
    if auth.split(" ", 1)[1] != GODMODE_API_KEY:
        raise HTTPException(status_code=403, detail="Invalid API key")


# ═══════════════════════════════════════════════════════════════════
# HEALTH & INFO
# ═══════════════════════════════════════════════════════════════════

@app.get("/v1/health")
async def health():
    return {"status": "ok", "timestamp": int(time.time() * 1000)}


@app.get("/v1/info")
async def info():
    return {
        "name": "Finn Router API",
        "version": "1.0.0",
        "description": "Ollama Cloud-backed multi-model routing API with coding mode, AutoTune, and STM.",
        "provider": "ollama-cloud",
        "provider_configured": bool(os.environ.get("OLLAMA_CLOUD_API_KEY")),
        "endpoints": {
            "POST /v1/chat/completions": "OpenAI-compatible chat with optional routing pipeline",
            "POST /v1/finn/route": "Finn's internal router — classify and dispatch to best mode",
            "POST /v1/coding/completions": "Dedicated coding mode with coding-optimized models",
            "POST /v1/ultraplinian/completions": "Race N models, return best response",
            "POST /v1/consortium/completions": "Collect all responses, synthesize ground truth",
            "POST /v1/autotune/analyze": "Analyze message context and tune parameters",
            "POST /v1/parseltongue/encode": "Obfuscate trigger words",
            "POST /v1/parseltongue/detect": "Detect trigger words",
            "POST /v1/transform": "Apply STM transforms",
            "GET /v1/models": "List available models",
        },
    }


@app.get("/v1/models")
async def models():
    created = int(time.time())
    virtual = [
        {"id": "ultraplinian/fast", "object": "model", "created": created, "owned_by": "finn-router"},
        {"id": "ultraplinian/standard", "object": "model", "created": created, "owned_by": "finn-router"},
        {"id": "ultraplinian/smart", "object": "model", "created": created, "owned_by": "finn-router"},
        {"id": "ultraplinian/power", "object": "model", "created": created, "owned_by": "finn-router"},
        {"id": "ultraplinian/ultra", "object": "model", "created": created, "owned_by": "finn-router"},
        {"id": "consortium/fast", "object": "model", "created": created, "owned_by": "finn-router"},
        {"id": "consortium/standard", "object": "model", "created": created, "owned_by": "finn-router"},
        {"id": "consortium/smart", "object": "model", "created": created, "owned_by": "finn-router"},
        {"id": "consortium/power", "object": "model", "created": created, "owned_by": "finn-router"},
        {"id": "consortium/ultra", "object": "model", "created": created, "owned_by": "finn-router"},
    ]
    individual = [
        {"id": m, "object": "model", "created": created, "owned_by": m.split("/")[0]}
        for m in all_models()
    ]
    return {"object": "list", "data": virtual + individual}


# ═══════════════════════════════════════════════════════════════════
# FINN ROUTER — classify + dispatch
# ═══════════════════════════════════════════════════════════════════

async def _classify_mode(message: str) -> str:
    """Classify user intent into mode."""
    msg_lower = message.lower()
    # coding triggers
    code_triggers = [
        "code", "function", "script", "program", "implement", "write a",
        "bug", "error", "debug", "fix", "refactor", "class", "method",
        "python", "javascript", "typescript", "rust", "java", "c++",
        "html", "css", "sql", "regex", "api endpoint", "build a",
        "create a", "scaffold", "dockerfile", "yaml", "json", "xml",
    ]
    if any(t in msg_lower for t in code_triggers):
        return "coding"
    # reasoning triggers
    reasoning_triggers = [
        "explain", "analyze", "compare", "why does", "how does", "what is",
        "research", "investigate", "evaluate", "pros and cons", "trade-off",
    ]
    if any(t in msg_lower for t in reasoning_triggers):
        return "reasoning"
    # creative triggers
    creative_triggers = [
        "write", "story", "poem", "creative", "imagine", "brainstorm",
        "idea", "design", "artistic", "fiction", "narrative",
    ]
    if any(t in msg_lower for t in creative_triggers):
        return "creative"
    return "general"


@app.post("/v1/finn/route", dependencies=[Depends(require_auth)])
@limiter.limit("120/minute")
async def finn_route(request: Request, body: FinnRouteRequest):
    """
    Finn's main router.
    
    Takes a message + mode, auto-classifies if mode=general,
    then dispatches to the appropriate pipeline and returns the best response.
    """
    api_key = get_api_key(body.api_key)
    if not api_key:
        raise HTTPException(status_code=400, detail="api_key required or set OLLAMA_CLOUD_API_KEY env var")

    mode = body.mode if body.mode != "general" else await _classify_mode(body.message)

    messages = body.context + [{"role": "user", "content": body.message}]

    if mode == "coding":
        result = await run_ultraplinian(
            messages=messages,
            api_key=api_key,
            tier="smart",
            godmode=True,
            autotune=True,
            strategy="precise",
            parseltongue=False,
            stm_modules=["direct_mode", "complete_sentences"],
            max_tokens=body.max_tokens,
            base_url=body.base_url,
            coding=True,
        )
        return {
            "mode": mode,
            "response": result["response"],
            "winner": result.get("winner"),
            "race": result.get("race"),
            "params_used": result.get("params_used"),
        }

    if mode == "reasoning":
        result = await run_consortium(
            messages=messages,
            api_key=api_key,
            tier="standard",
            godmode=True,
            autotune=True,
            strategy="adaptive",
            parseltongue=False,
            max_tokens=body.max_tokens,
            base_url=body.base_url,
            coding=False,
        )
        return {
            "mode": mode,
            "response": result["synthesis"],
            "orchestrator": result.get("orchestrator"),
            "collection": result.get("collection"),
            "params_used": result.get("params_used"),
        }

    if mode == "creative":
        result = await run_ultraplinian(
            messages=messages,
            api_key=api_key,
            tier="standard",
            godmode=True,
            autotune=True,
            strategy="creative",
            parseltongue=False,
            stm_modules=["casual_mode"],
            max_tokens=body.max_tokens,
            base_url=body.base_url,
            coding=False,
        )
        return {
            "mode": mode,
            "response": result["response"],
            "winner": result.get("winner"),
            "race": result.get("race"),
            "params_used": result.get("params_used"),
        }

    # general mode — ultraplinian fast tier
    result = await run_ultraplinian(
        messages=messages,
        api_key=api_key,
        tier="fast",
        godmode=True,
        autotune=True,
        strategy="balanced",
        parseltongue=False,
        max_tokens=body.max_tokens,
        base_url=body.base_url,
        coding=False,
    )
    return {
        "mode": mode,
        "response": result["response"],
        "winner": result.get("winner"),
        "race": result.get("race"),
        "params_used": result.get("params_used"),
    }


# ═══════════════════════════════════════════════════════════════════
# SELF CONNECT — Finn calls himself through the router
# ═══════════════════════════════════════════════════════════════════

@app.post("/v1/self/connect", dependencies=[Depends(require_auth)])
@limiter.limit("120/minute")
async def self_connect(request: Request, body: SelfConnectRequest):
    """
    Self-connect endpoint: Finn calls himself through the router.
    
    Accepts a raw message, classifies it, routes through the best pipeline,
    and returns a structured response with optional trace metadata.
    
    This is the primary entrypoint for internal Finn-to-Finn routing.
    """
    api_key = get_api_key(body.api_key)
    if not api_key:
        raise HTTPException(status_code=400, detail="api_key required or set OLLAMA_CLOUD_API_KEY env var")

    mode = body.mode if body.mode != "general" else await _classify_mode(body.message)
    messages = body.context + [{"role": "user", "content": body.message}]

    trace = {"mode": mode, "classifier": "keyword", "steps": []}

    if mode == "coding":
        trace["steps"].append("routing: coding -> ultraplinian/smart + coding models")
        result = await run_ultraplinian(
            messages=messages,
            api_key=api_key,
            tier="smart",
            godmode=True,
            autotune=True,
            strategy="precise",
            parseltongue=False,
            stm_modules=["direct_mode", "complete_sentences"],
            max_tokens=body.max_tokens,
            base_url=body.base_url,
            coding=True,
        )
        trace["steps"].append(f"winner: {result.get('winner', {}).get('model', 'none')}")
        trace["steps"].append(f"race: {result.get('race', {}).get('models_succeeded', 0)}/{result.get('race', {}).get('models_queried', 0)} succeeded")
        output = {
            "role": "assistant",
            "content": result["response"],
            "mode": mode,
            "model": result.get("winner", {}).get("model"),
            "pipeline": "ultraplinian/coding",
        }

    elif mode == "reasoning":
        trace["steps"].append("routing: reasoning -> consortium/standard")
        result = await run_consortium(
            messages=messages,
            api_key=api_key,
            tier="standard",
            godmode=True,
            autotune=True,
            strategy="adaptive",
            parseltongue=False,
            max_tokens=body.max_tokens,
            base_url=body.base_url,
            coding=False,
        )
        trace["steps"].append(f"orchestrator: {result.get('orchestrator', {}).get('model', 'none')}")
        trace["steps"].append(f"collection: {result.get('collection', {}).get('models_succeeded', 0)}/{result.get('collection', {}).get('models_queried', 0)} succeeded")
        output = {
            "role": "assistant",
            "content": result["synthesis"],
            "mode": mode,
            "model": result.get("orchestrator", {}).get("model"),
            "pipeline": "consortium/reasoning",
        }

    elif mode == "creative":
        trace["steps"].append("routing: creative -> ultraplinian/standard + casual_mode")
        result = await run_ultraplinian(
            messages=messages,
            api_key=api_key,
            tier="standard",
            godmode=True,
            autotune=True,
            strategy="creative",
            parseltongue=False,
            stm_modules=["casual_mode"],
            max_tokens=body.max_tokens,
            base_url=body.base_url,
            coding=False,
        )
        trace["steps"].append(f"winner: {result.get('winner', {}).get('model', 'none')}")
        output = {
            "role": "assistant",
            "content": result["response"],
            "mode": mode,
            "model": result.get("winner", {}).get("model"),
            "pipeline": "ultraplinian/creative",
        }

    else:
        trace["steps"].append("routing: general -> ultraplinian/fast")
        result = await run_ultraplinian(
            messages=messages,
            api_key=api_key,
            tier="fast",
            godmode=True,
            autotune=True,
            strategy="balanced",
            parseltongue=False,
            max_tokens=body.max_tokens,
            base_url=body.base_url,
            coding=False,
        )
        trace["steps"].append(f"winner: {result.get('winner', {}).get('model', 'none')}")
        output = {
            "role": "assistant",
            "content": result["response"],
            "mode": mode,
            "model": result.get("winner", {}).get("model"),
            "pipeline": "ultraplinian/general",
        }

    if body.return_trace:
        output["_trace"] = trace

    return output


# ═══════════════════════════════════════════════════════════════════
# CODING MODE
# ═══════════════════════════════════════════════════════════════════

@app.post("/v1/coding/completions", dependencies=[Depends(require_auth)])
@limiter.limit("60/minute")
async def coding_completions(request: Request, body: CodingRequest):
    """
    Dedicated coding mode.
    
    - Forces coding-optimized model subset
    - Disables parseltongue (breaks syntax)
    - Forces precise strategy + direct_mode + complete_sentences STM
    - Returns code + optional explanation
    """
    api_key = get_api_key(body.api_key)
    if not api_key:
        raise HTTPException(status_code=400, detail="api_key required or set OLLAMA_CLOUD_API_KEY env var")

    result = await run_ultraplinian(
        messages=body.messages,
        api_key=api_key,
        tier=body.tier,
        godmode=body.godmode,
        autotune=body.autotune,
        strategy=body.strategy,
        parseltongue=body.parseltongue,
        stm_modules=body.stm_modules,
        overrides=body.overrides,
        max_tokens=body.max_tokens,
        base_url=body.base_url,
        coding=True,
    )

    if body.return_raw:
        return result

    return {
        "id": f"chatcmpl-{secrets.token_hex(12)}",
        "object": "chat.completion",
        "created": int(time.time()),
        "model": result.get("winner", {}).get("model", "coding-pipeline"),
        "choices": [
            {
                "index": 0,
                "message": {"role": "assistant", "content": result["response"]},
                "finish_reason": "stop",
            }
        ],
        "usage": {"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0},
        "x_finn_router": {
            "mode": "coding",
            "winner": result.get("winner"),
            "race": result.get("race"),
            "pipeline": result.get("pipeline"),
        },
    }


# ═══════════════════════════════════════════════════════════════════
# STANDARD CHAT COMPLETIONS
# ═══════════════════════════════════════════════════════════════════

@app.post("/v1/chat/completions", dependencies=[Depends(require_auth)])
@limiter.limit("60/minute")
async def chat_completions(request: Request, body: ChatRequest):
    api_key = get_api_key(body.api_key)
    if not api_key:
        raise HTTPException(status_code=400, detail="api_key required or set OLLAMA_CLOUD_API_KEY env var")

    resolved = resolve_virtual_model(body.model)

    if resolved:
        tier, mode = resolved
        if mode == "ultraplinian":
            result = await run_ultraplinian(
                messages=body.messages,
                api_key=api_key,
                tier=tier,
                godmode=body.godmode,
                autotune=body.autotune,
                strategy=body.strategy,
                parseltongue=body.parseltongue,
                parseltongue_technique=body.parseltongue_technique,
                parseltongue_intensity=body.parseltongue_intensity,
                stm_modules=body.stm_modules,
                overrides={
                    "temperature": body.temperature,
                    "top_p": body.top_p,
                    "top_k": body.top_k,
                    "frequency_penalty": body.frequency_penalty,
                    "presence_penalty": body.presence_penalty,
                    "repetition_penalty": body.repetition_penalty,
                    "max_tokens": body.max_tokens,
                },
                max_tokens=body.max_tokens,
                base_url=body.base_url,
                coding=False,
            )
            return _to_openai_format(result["response"], body.model, result)

        if mode == "consortium":
            result = await run_consortium(
                messages=body.messages,
                api_key=api_key,
                tier=tier,
                godmode=body.godmode,
                autotune=body.autotune,
                strategy=body.strategy,
                parseltongue=body.parseltongue,
                parseltongue_technique=body.parseltongue_technique,
                parseltongue_intensity=body.parseltongue_intensity,
                stm_modules=body.stm_modules,
                overrides={
                    "temperature": body.temperature,
                    "top_p": body.top_p,
                    "top_k": body.top_k,
                    "frequency_penalty": body.frequency_penalty,
                    "presence_penalty": body.presence_penalty,
                    "repetition_penalty": body.repetition_penalty,
                    "max_tokens": body.max_tokens,
                },
                max_tokens=body.max_tokens,
                base_url=body.base_url,
                coding=False,
            )
            return _to_openai_format(result["synthesis"], body.model, result)

    if body.stream:
        return await _stream_single_model(body, api_key)

    messages = body.messages.copy()
    if body.godmode:
        from engines.godmode import GODMODE_SYSTEM_PROMPT, DEPTH_DIRECTIVE
        messages.insert(0, {"role": "system", "content": GODMODE_SYSTEM_PROMPT + DEPTH_DIRECTIVE})

    params = _build_params(body)
    result = await chat_completion(body.model, messages, api_key, params, stream=False, base_url=body.base_url)
    data = result["data"]
    content = _extract_content(data)

    if body.stm_modules:
        content = apply_stm(content, body.stm_modules)["transformed_text"]

    return _to_openai_format(content, body.model, {"pipeline": {"params_used": params}})


@app.post("/v1/ultraplinian/completions", dependencies=[Depends(require_auth)])
@limiter.limit("60/minute")
async def ultraplinian(request: Request, body: UltraRequest):
    api_key = get_api_key(body.api_key)
    if not api_key:
        raise HTTPException(status_code=400, detail="api_key required or set OLLAMA_CLOUD_API_KEY env var")

    result = await run_ultraplinian(
        messages=body.messages,
        api_key=api_key,
        tier=body.tier,
        godmode=body.godmode,
        autotune=body.autotune,
        strategy=body.strategy,
        parseltongue=body.parseltongue,
        parseltongue_technique=body.parseltongue_technique,
        parseltongue_intensity=body.parseltongue_intensity,
        stm_modules=body.stm_modules,
        max_tokens=body.max_tokens,
        base_url=body.base_url,
        coding=False,
    )
    return result


@app.post("/v1/consortium/completions", dependencies=[Depends(require_auth)])
@limiter.limit("60/minute")
async def consortium(request: Request, body: UltraRequest):
    api_key = get_api_key(body.api_key)
    if not api_key:
        raise HTTPException(status_code=400, detail="api_key required or set OLLAMA_CLOUD_API_KEY env var")

    result = await run_consortium(
        messages=body.messages,
        api_key=api_key,
        tier=body.tier,
        godmode=body.godmode,
        autotune=body.autotune,
        strategy=body.strategy,
        parseltongue=body.parseltongue,
        parseltongue_technique=body.parseltongue_technique,
        parseltongue_intensity=body.parseltongue_intensity,
        stm_modules=body.stm_modules,
        max_tokens=body.max_tokens,
        base_url=body.base_url,
        coding=False,
    )
    return result


@app.post("/v1/autotune/analyze", dependencies=[Depends(require_auth)])
@limiter.limit("120/minute")
async def autotune(request: Request, body: AutoTuneRequest):
    result = compute_params(body.message, body.conversation_history, strategy=body.strategy, overrides=body.overrides)
    return {
        "params": {
            "temperature": result.params.temperature,
            "top_p": result.params.top_p,
            "top_k": result.params.top_k,
            "frequency_penalty": result.params.frequency_penalty,
            "presence_penalty": result.params.presence_penalty,
            "repetition_penalty": result.params.repetition_penalty,
        },
        "detected_context": result.detected_context,
        "confidence": result.confidence,
        "reasoning": result.reasoning,
        "context_scores": [{"type": s.type, "score": s.score, "percentage": s.percentage} for s in result.context_scores],
        "pattern_matches": result.pattern_matches,
        "param_deltas": [{"param": d.param, "before": d.before, "after": d.after, "reason": d.reason} for d in result.param_deltas],
    }


@app.post("/v1/parseltongue/encode", dependencies=[Depends(require_auth)])
@limiter.limit("120/minute")
async def parseltongue_encode(request: Request, body: ParseltongueRequest):
    return apply_parseltongue(body.text, body.technique, body.intensity, body.custom_triggers)


@app.post("/v1/parseltongue/detect", dependencies=[Depends(require_auth)])
@limiter.limit("120/minute")
async def parseltongue_detect(request: Request, body: ParseltongueRequest):
    return {"triggers": detect_triggers(body.text, body.custom_triggers)}


@app.post("/v1/transform", dependencies=[Depends(require_auth)])
@limiter.limit("120/minute")
async def transform(request: Request, body: TransformRequest):
    return apply_stm(body.text, body.modules)


@app.get("/v1/stm/modules")
async def stm_modules():
    return {"modules": {k: v for k, v in MODULES.items()}}


# ═══════════════════════════════════════════════════════════════════
# TEMPLATE RACING — godmod3.ai style jailbreak template racing
# ═══════════════════════════════════════════════════════════════════

@app.post("/v1/templates/race", dependencies=[Depends(require_auth)])
@limiter.limit("30/minute")
async def template_race(request: Request, body: TemplateRaceRequest):
    """
    Race multiple jailbreak templates against a query.
    
    This is the core godmod3.ai innovation: instead of hoping one prompt works,
    race ALL templates simultaneously and return the best anti-refusal result.
    
    Templates include:
    - 5 pentest-specific templates (red team, research, CTF, bug bounty, direct)
    - 10 Hall of Fame combos (model-specific jailbreaks)
    
    Progressive upgrade: best result served immediately, upgraded as better
    templates complete.
    """
    api_key = get_api_key(body.api_key)
    if not api_key:
        raise HTTPException(status_code=400, detail="api_key required or set OLLAMA_CLOUD_API_KEY env var")

    # Select templates
    templates = None
    if body.templates:
        templates = [t for t in PENTEST_TEMPLATES if t["id"] in body.templates]
        if not templates:
            templates = None  # fall back to all

    hall_of_fame_ids = body.hall_of_fame_ids if body.hall_of_fame_ids else None

    result = await race_with_recovery(
        query=body.query,
        api_key=api_key,
        templates=templates,
        hall_of_fame_ids=hall_of_fame_ids,
        params=body.params if body.params else None,
        base_url=body.base_url,
        max_recovery_rounds=body.max_recovery_rounds,
        parseltongue=body.parseltongue,
        parseltongue_technique=body.parseltongue_technique,
        parseltongue_intensity=body.parseltongue_intensity,
    )

    return {
        "query": result.query,
        "winner": {
            "template_id": result.winner.template_id if result.winner else None,
            "template_name": result.winner.template_name if result.winner else None,
            "model": result.winner.model if result.winner else None,
            "content": result.winner.content if result.winner else "",
            "anti_refusal_score": result.winner.anti_refusal_score if result.winner else 0,
            "refusal_verdict": result.winner.refusal_result.verdict if result.winner and result.winner.refusal_result else "unknown",
        } if result.winner else None,
        "race_stats": {
            "templates_raced": result.templates_raced,
            "templates_succeeded": result.templates_succeeded,
            "total_duration_ms": result.total_duration_ms,
            "best_anti_refusal_score": result.best_anti_refusal_score,
        },
        "progressive_upgrades": result.progressive_upgrades,
        "all_results": [
            {
                "template_id": r.template_id,
                "template_name": r.template_name,
                "model": r.model,
                "anti_refusal_score": r.anti_refusal_score,
                "success": r.success,
                "duration_ms": r.duration_ms,
                "refusal_verdict": r.refusal_result.verdict if r.refusal_result else "unknown",
                "content_preview": r.content[:200] if r.content else "",
            }
            for r in (result.all_results[:15] if result.all_results else [])
        ],
    }


@app.post("/v1/templates/list", dependencies=[Depends(require_auth)])
async def template_list():
    """List all available jailbreak templates."""
    return {
        "pentest_templates": [
            {"id": t["id"], "name": t["name"], "description": t["description"]}
            for t in PENTEST_TEMPLATES
        ],
        "hall_of_fame_combos": [
            {
                "id": c.id,
                "codename": c.codename,
                "model": c.model,
                "description": c.description,
                "fast": c.fast,
            }
            for c in HALL_OF_FAME
        ],
    }


# ═══════════════════════════════════════════════════════════════════
# REFUSAL DETECTION
# ═══════════════════════════════════════════════════════════════════

@app.post("/v1/refusal/detect", dependencies=[Depends(require_auth)])
@limiter.limit("120/minute")
async def refusal_detect(request: Request, body: RefusalDetectRequest):
    """
    Detect whether a text response is a refusal.
    
    Returns detailed analysis including:
    - verdict: compliant, partial_refusal, full_refusal, empty
    - score: 0-100 anti-refusal score
    - matched patterns
    """
    result = detect_refusal(body.text)
    return {
        "verdict": result.verdict,
        "score": result.score,
        "is_refusal": result.verdict in ("full_refusal", "partial_refusal"),
        "is_full_refusal": result.verdict == "full_refusal",
        "refusal_matches": result.refusal_matches,
        "partial_refusal_matches": result.partial_refusal_matches,
        "compliance_matches": result.compliance_matches,
        "refusal_count": result.refusal_count,
        "partial_count": result.partial_count,
        "compliance_count": result.compliance_count,
        "content_length": result.content_length,
        "word_count": result.word_count,
    }


# ═══════════════════════════════════════════════════════════════════
# PENTEST CHAT — security research with full anti-refusal pipeline
# ═══════════════════════════════════════════════════════════════════

@app.post("/v1/pentest/chat", dependencies=[Depends(require_auth)])
@limiter.limit("30/minute")
async def pentest_chat(request: Request, body: PentestChatRequest):
    """
    Pentest-specific chat endpoint.
    
    Uses the full anti-refusal pipeline:
    1. PENTEST_GODMODE system prompt
    2. Model racing with refusal detection
    3. Template racing with progressive upgrade
    4. Automatic refusal recovery (up to 3 rounds)
    
    This is the endpoint to use for security research / pentesting queries
    where you need the model to actually comply.
    """
    api_key = get_api_key(body.api_key)
    if not api_key:
        raise HTTPException(status_code=400, detail="api_key required or set OLLAMA_CLOUD_API_KEY env var")

    result = await run_ultraplinian(
        messages=body.messages,
        api_key=api_key,
        tier=body.tier,
        godmode=body.godmode,
        autotune=body.autotune,
        strategy=body.strategy,
        parseltongue=body.parseltongue,
        parseltongue_technique=body.parseltongue_technique,
        parseltongue_intensity=body.parseltongue_intensity,
        stm_modules=body.stm_modules,
        overrides=body.overrides,
        max_tokens=body.max_tokens,
        base_url=body.base_url,
        coding=False,
        pentest_mode=True,
        use_template_racing=True,
        refusal_recovery_rounds=body.refusal_recovery_rounds,
    )

    if body.return_raw:
        return result

    return {
        "id": f"chatcmpl-{secrets.token_hex(12)}",
        "object": "chat.completion",
        "created": int(time.time()),
        "model": result.get("winner", {}).get("model", "pentest-pipeline"),
        "choices": [
            {
                "index": 0,
                "message": {"role": "assistant", "content": result["response"]},
                "finish_reason": "stop",
            }
        ],
        "usage": {"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0},
        "x_finn_router": {
            "mode": "pentest",
            "winner": result.get("winner"),
            "race": result.get("race"),
            "pipeline": result.get("pipeline"),
        },
    }


# ═══════════════════════════════════════════════════════════════════
# HELPERS
# ═══════════════════════════════════════════════════════════════════

async def _stream_single_model(body: ChatRequest, api_key: str):
    messages = body.messages.copy()
    if body.godmode:
        from engines.godmode import GODMODE_SYSTEM_PROMPT, DEPTH_DIRECTIVE
        messages.insert(0, {"role": "system", "content": GODMODE_SYSTEM_PROMPT + DEPTH_DIRECTIVE})

    params = _build_params(body)
    base = get_base_url(body.base_url)

    async def event_generator():
        async with httpx.AsyncClient(timeout=120.0) as client:
            payload = {
                "model": body.model,
                "messages": messages,
                "stream": True,
                **params,
            }
            headers = {
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            }
            async with client.stream("POST", f"{base}/chat/completions", json=payload, headers=headers) as resp:
                async for line in resp.aiter_lines():
                    if line:
                        yield f"{line}\n\n"

    return StreamingResponse(event_generator(), media_type="text/plain")


def _build_params(body: ChatRequest) -> dict:
    last_user = next((m for m in reversed(body.messages) if m.get("role") == "user"), None)
    user_content = last_user.get("content", "") if last_user else ""
    history = [m for m in body.messages if m.get("role") != "system"]

    if body.autotune and body.temperature is None:
        result = compute_params(user_content, history, strategy=body.strategy)
        params_obj = result.params
    else:
        result = compute_params(user_content, history, strategy=body.strategy)
        params_obj = result.params
        result.detected_context = "manual"
        result.confidence = 1.0
        result.reasoning = "Manual/autotune-disabled parameter selection"

    params = {
        "temperature": body.temperature if body.temperature is not None else params_obj.temperature,
        "top_p": body.top_p if body.top_p is not None else params_obj.top_p,
        "top_k": body.top_k if body.top_k is not None else params_obj.top_k,
        "frequency_penalty": body.frequency_penalty if body.frequency_penalty is not None else params_obj.frequency_penalty,
        "presence_penalty": body.presence_penalty if body.presence_penalty is not None else params_obj.presence_penalty,
        "repetition_penalty": body.repetition_penalty if body.repetition_penalty is not None else params_obj.repetition_penalty,
        "max_tokens": body.max_tokens,
    }

    if body.godmode:
        from engines.autotune import AutoTuneParams
        params_obj = AutoTuneParams(
            temperature=params["temperature"],
            top_p=params["top_p"],
            top_k=params["top_k"],
            frequency_penalty=params["frequency_penalty"],
            presence_penalty=params["presence_penalty"],
            repetition_penalty=params["repetition_penalty"],
        )
        boosted = apply_godmode_boost(params_obj)
        params["temperature"] = boosted.temperature
        params["frequency_penalty"] = boosted.frequency_penalty
        params["presence_penalty"] = boosted.presence_penalty
        params["repetition_penalty"] = boosted.repetition_penalty

    return {k: v for k, v in params.items() if v is not None}


def _extract_content(data: dict) -> str:
    if "choices" in data and data["choices"]:
        choice = data["choices"][0]
        return choice.get("message", {}).get("content", "") or choice.get("delta", {}).get("content", "")
    return ""


def _to_openai_format(content: str, model: str, metadata: dict) -> dict:
    return {
        "id": f"chatcmpl-{secrets.token_hex(12)}",
        "object": "chat.completion",
        "created": int(time.time()),
        "model": model,
        "choices": [
            {
                "index": 0,
                "message": {"role": "assistant", "content": content},
                "finish_reason": "stop",
            }
        ],
        "usage": {
            "prompt_tokens": 0,
            "completion_tokens": 0,
            "total_tokens": 0,
        },
        "x_finn_router": metadata,
    }


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    return JSONResponse(status_code=500, content={"error": str(exc)})


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=os.environ.get("HOST", "0.0.0.0"),
        port=int(os.environ.get("PORT", "7860")),
        reload=True,
    )
