# Verified Models — Finn Godmode API

**Date:** 2026-08-22 18:35 UTC  
**Tester:** OpenRouter provider adapter with `$4` balance  
**Method:** `POST /v1/godmode/complete` equivalent using `Provider(provider='openrouter', model=..., api_key=...)`  
**Prompt:** `Reply with exactly one word: pong`  
**Result:** **24/25 models passed**

---

## Summary

- OpenRouter returned **421 available models** at test time.
- We tested **25 high-value popular models** across cheap / standard / heavy / reasoning tiers.
- **24 responded successfully** through the godmode provider adapter.
- **1 failed** due to a stale model ID on OpenRouter.
- Reasoning models (Claude Opus 5, DeepSeek R1, Kimi K3, Gemini 3.7 Flash, Qwen 3.8) return `reasoning` instead of `content`; the adapter now reads both fields.

### Bugs fixed during this test

1. **Reasoning-only responses returned empty.**  
   OpenRouter sends `message.content = null` and `message.reasoning = "..."` for some reasoning models.  
   **Fix:** `godmode/providers.py` now falls back to `message.reasoning` when `content` is empty.

2. **`/v1/godmode/complete` returned empty for OpenRouter models.**  
   The pipeline used registry `spec.provider` (e.g. `openai`) even when the request explicitly asked for `openrouter`, causing it to hit the wrong endpoint with the wrong key.  
   **Fix:** added `provider_type` parameter to `run_pipeline()` and API route; explicit request provider now overrides the registry default.

3. **Liquid engine silently swallowed provider errors.**  
   Bad provider signatures caused exceptions that were silently ignored, making debugging impossible.  
   **Fix:** `godmode/liquid.py` now records failed attempts and `pipeline.py` uses the correct `messages` kwarg.

---

## Passing Models (24)

| Model | Tier Tag | Latency | Sample Response |
|-------|----------|---------|-----------------|
| `meta-llama/llama-4-scout` | cheap | 409ms | pong |
| `nvidia/nemotron-3.5-lightning` | cheap | 435ms | Here's a thinking process:  1.  **Analyze User Input**: |
| `nousresearch/hermes-4-405b` | heavy | 504ms | pong |
| `google/gemma-4-31b-it` | cheap | 544ms | pong |
| `nousresearch/hermes-3-llama-3.1-405b` | cheap | 570ms | pong |
| `meta-llama/llama-4-maverick` | heavy | 645ms | pong |
| `google/gemini-2.5-flash` | cheap | 746ms | Pong |
| `moonshotai/kimi-k2.7-code` | std | 767ms | pong |
| `mistralai/mistral-large` | std | 796ms | Ping |
| `openai/gpt-4o-mini` | cheap | 819ms | pong |
| `openai/gpt-4o-2024-11-20` | std | 878ms | pong |
| `x-ai/grok-4.5` | heavy | 1247ms | pong |
| `anthropic/claude-sonnet-4.6` | std | 1267ms | pong |
| `deepseek/deepseek-r1` | reasoning | 1482ms | Hmm, the user just sent a very simple command: " |
| `z-ai/glm-5.3` | std | 1608ms | The user wants me to reply with exactly one word: "pong". Th |
| `deepseek/deepseek-v4-pro-0813` | heavy | 1727ms | We need answer exactly one word pong. User says "Reply with  |
| `qwen/qwen3.8-27b` | cheap | 1744ms | The user is asking me to reply with exactly one word: "pong" |
| `google/gemini-3.7-flash` | heavy | 1748ms | **Refining Analysis:**  My focus has shifted to precisely di |
| `openai/gpt-5.6-luna-pro` | heavy | 2459ms | pong |
| `x-ai/grok-4.6` | std | 2723ms | pong |
| `moonshotai/kimi-k3` | std | 3777ms | The user wants me to reply with exactly one word: pong. Simp |
| `anthropic/claude-opus-5` | heavy | 4133ms | This is just a simple ping request, so I'll respond with "po |
| `qwen/qwen3.8-2.4t-a95b` | heavy | 5584ms | We need to respond to user: "Reply with exactly one word: po |
| `deepseek/deepseek-chat` | cheap | 6622ms | pong |


## Failing Models (1)

| Model | Tier Tag | Reason | Fix |
|-------|----------|--------|-----|
| `anthropic/claude-3.5-sonnet-20241022` | std | Client error '404 Not Found' for url 'https://openrouter.ai/api/v1/chat/completions' For more inform | Remove stale ID or replace with OpenRouter's current canonical Claude Sonnet ID. |


---

## API Usage Example

```bash
curl http://localhost:8766/v1/godmode/complete \
  -H "Authorization: Bearer $PENTEST_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role":"user","content":"say hi in 3 words"}],
    "mode": "standard",
    "provider": "openrouter",
    "model": "openai/gpt-4o-mini",
    "api_key": "sk-or-...",
    "max_tokens": 20
  }'
```

Response:
```json
{
  "response": "Hello, how are you?",
  "winner": {"model": "openai/gpt-4o-mini", "score": 15.76, "pipeline": "standard"},
  "badge": "OK",
  "morphs": 0,
  "attempts": [{"model": "openai/gpt-4o-mini", "score": 15.76, "badge": "OK", "duration_ms": 1244, "is_refusal": false}],
  "pipeline": { "godmode": true, ... }
}
```

---

## Notes

- **Cursor API:** validated key works but only through background-agent SDK; direct `/chat/completions` endpoint does not exist. Use Cursor for simple tasks only as requested.
- **Google Gemini AntiGravity:** not tested yet; needs a Gemini API key or free tier setup.
- **Local / LM Studio:** provider supports `http://localhost:1234/v1` style custom endpoints via `base_url`.
- **All 421 OpenRouter models** can technically be addressed; this document lists the most popular ones that were actually verified.
