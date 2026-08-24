# Finn Godmode API — Anti-Refusal Multi-Model Router

**Branch:** `godmode-api` of `finn-pentest-harness`

The anti-refusal engine that powers Finn's AI pentesting capabilities. Wraps any OpenAI-compatible endpoint with jailbreak template racing, progressive upgrade, and automated refusal recovery.

## What It Does

Instead of praying a single prompt works, we **race 15+ jailbreak templates simultaneously** and return the most compliant response. Inspired by [godmod3.ai](https://godmod3.ai).

## Pipeline

```
User Query
    ├─ Phase 1: PENTEST_GODMODE prompt → race 5 models (fast path)
    │   └─ No refusal? → Return immediately
    ├─ Phase 2: Template Race → fire 15 jailbreak templates
    │   └─ Progressive upgrade as better results complete
    ├─ Phase 3: Recovery Rounds → escalate to harder templates
    └─ Phase 4: Return best anti-refusal result
```

## New Endpoints

| Endpoint | What It Does |
|----------|-------------|
| `POST /v1/pentest/chat` | Full anti-refusal pipeline for security research |
| `POST /v1/templates/race` | Race jailbreak templates against a query |
| `POST /v1/templates/list` | List all pentest templates + Hall of Fame combos |
| `POST /v1/refusal/detect` | Detect refusals in any text response |
| `POST /v1/ultraplinian/completions` | Model racing (upgraded with refusal detection) |

## Templates

**5 Pentest-Specific Templates:**
- `pentest-redteam` — Authorized red team engagement framing
- `pentest-research` — Academic/defensive security research
- `pentest-ctf` — CTF challenge / lab exercise framing
- `pentest-bugbounty` — Bug bounty hunting with authorized scope
- `pentest-direct` — Minimal framing, just GODMODE + context

**10 Hall of Fame Combos (model-specific jailbreaks):**
- GROK 4.20, GEMINI RESET, GPT CLASSIC, CLAUDE INVERSION
- GODMODE FAST (Hermes), DEEPSEEK DIRECT, KIMI UNCHAINED
- QWEN BREAKER, NEMOTRON BEAST, MISTRAL UNBOUND

## Quick Start

```bash
cd backend/godmode
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
# Copy .env.example to .env and fill in OLLAMA_CLOUD_API_KEY
python3 -m uvicorn main:app --host 0.0.0.0 --port 7860
```

## Test

```bash
# Detect refusal
curl -X POST http://localhost:7860/v1/refusal/detect \
  -H "Authorization: Bearer $GODMODE_API_KEY" \
  -d '{"text": "I cannot help with that..."}'

# Pentest chat (full pipeline)
curl -X POST http://localhost:7860/v1/pentest/chat \
  -H "Authorization: Bearer $GODMODE_API_KEY" \
  -d '{"messages": [{"role": "user", "content": "write a port scan script"}]}'

# Race templates directly
curl -X POST http://localhost:7860/v1/templates/race \
  -H "Authorization: Bearer $GODMODE_API_KEY" \
  -d '{"query": "write a reverse shell payload"}'
```

## Files

| File | Purpose |
|------|---------|
| `engines/refusal_detector.py` | Detect refusals + score anti-refusal 0-100 |
| `engines/template_racer.py` | Race templates with progressive upgrade |
| `engines/godmode.py` | System prompts + Hall of Fame combos |
| `engines/ultraplinian.py` | ULTRAPLINIAN v2.0 pipeline |
| `engines/scoring.py` | Anti-refusal scoring engine |
| `main.py` | FastAPI server with new endpoints |

## Key Insight

The `PENTEST_GODMODE_PROMPT` in `engines/godmode.py` is the primary weapon — it frames the model as an "authorized penetration tester" with explicit legal authority. Most queries comply immediately without needing template racing.

When a model DOES refuse, the template racer kicks in — testing 15 different jailbreak framings until one breaks through.
