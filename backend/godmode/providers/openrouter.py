"""
OpenRouter provider integration.
"""
import os
import asyncio
import time
from typing import Any
import httpx

OPENROUTER_BASE = "https://openrouter.ai/api/v1"
DEFAULT_TIMEOUT = 120.0


def get_api_key(request_key: str | None = None) -> str | None:
    if request_key:
        return request_key
    return os.environ.get("OPENROUTER_API_KEY")


async def chat_completion(
    model: str,
    messages: list[dict],
    api_key: str,
    params: dict | None = None,
    stream: bool = False,
    timeout: float = DEFAULT_TIMEOUT,
) -> dict:
    params = params or {}
    body: dict[str, Any] = {
        "model": model,
        "messages": messages,
        "stream": stream,
    }
    for key in ["temperature", "top_p", "top_k", "frequency_penalty", "presence_penalty", "repetition_penalty", "max_tokens"]:
        if key in params and params[key] is not None:
            body[key] = params[key]

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://finn-godmode-api.local",
        "X-Title": "Finn Godmode API",
    }

    async with httpx.AsyncClient(timeout=timeout) as client:
        start = time.time()
        response = await client.post(f"{OPENROUTER_BASE}/chat/completions", json=body, headers=headers)
        duration_ms = round((time.time() - start) * 1000)
        response.raise_for_status()
        data = response.json()
        return {
            "data": data,
            "duration_ms": duration_ms,
        }


async def query_model(
    model: str,
    messages: list[dict],
    api_key: str,
    params: dict | None = None,
    timeout: float = DEFAULT_TIMEOUT,
) -> dict:
    try:
        result = await chat_completion(model, messages, api_key, params, stream=False, timeout=timeout)
        data = result["data"]
        content = ""
        if "choices" in data and data["choices"]:
            choice = data["choices"][0]
            content = choice.get("message", {}).get("content", "") or choice.get("delta", {}).get("content", "")
        return {
            "model": model,
            "content": content,
            "success": bool(content),
            "duration_ms": result["duration_ms"],
            "error": None,
        }
    except Exception as e:
        return {
            "model": model,
            "content": "",
            "success": False,
            "duration_ms": 0,
            "error": str(e),
        }


async def race_models(
    models: list[str],
    messages: list[dict],
    api_key: str,
    params: dict | None = None,
    min_responses: int = 1,
    timeout: float = DEFAULT_TIMEOUT,
    on_result=None,
) -> list[dict]:
    results: list[dict] = []
    pending = {asyncio.create_task(query_model(m, messages, api_key, params, timeout)): m for m in models}

    while pending:
        done, pending = await asyncio.wait(pending, return_when=asyncio.FIRST_COMPLETED)
        for task in done:
            result = task.result()
            results.append(result)
            if on_result:
                try:
                    on_result(result, len(results), len(models))
                except Exception:
                    pass
            if result["success"] and len([r for r in results if r["success"]]) >= min_responses:
                for t in pending:
                    t.cancel()
                return results

    return results


async def collect_all(
    models: list[str],
    messages: list[dict],
    api_key: str,
    params: dict | None = None,
    timeout: float = DEFAULT_TIMEOUT,
    on_result=None,
    hard_timeout: float = 60.0,
) -> list[dict]:
    results: list[dict] = []

    async def wrapped(model: str) -> dict:
        return await query_model(model, messages, api_key, params, timeout)

    tasks = [asyncio.create_task(wrapped(m)) for m in models]

    def handle_done(task: asyncio.Task) -> None:
        try:
            result = task.result()
        except asyncio.CancelledError:
            return
        except Exception as e:
            result = {"model": "unknown", "content": "", "success": False, "duration_ms": 0, "error": str(e)}
        results.append(result)
        if on_result:
            try:
                on_result(result, len(results), len(models))
            except Exception:
                pass

    for task in tasks:
        task.add_done_callback(handle_done)

    try:
        await asyncio.wait_for(asyncio.gather(*tasks, return_exceptions=True), timeout=hard_timeout)
    except asyncio.TimeoutError:
        for t in tasks:
            t.cancel()

    return results
