import asyncio

import pytest

from finn_pentest.core.bootstrap import bootstrap
from finn_pentest.providers.openai_compat import ProviderConfig, RateLimitError, save_providers
from finn_pentest.providers.router import AIRouter, AllProvidersExhausted


def test_router_failsover_on_429(finn_home, monkeypatch):
    bootstrap()
    save_providers(
        {
            "priority": [
                {
                    "name": "primary",
                    "model": "m1",
                    "base_url": "https://primary.example/v1",
                    "api_key": "k1",
                    "cost_per_1k": 0.001,
                },
                {
                    "name": "secondary",
                    "model": "m2",
                    "base_url": "https://secondary.example/v1",
                    "api_key": "k2",
                    "cost_per_1k": 0.001,
                },
            ]
        }
    )

    calls = []

    async def fake_chat(provider: ProviderConfig, messages, stream=False):
        calls.append(provider.name)
        if provider.name == "primary":
            raise RateLimitError("429")
        return {
            "choices": [{"message": {"content": "hello from secondary"}}],
            "usage": {"prompt_tokens": 10, "completion_tokens": 5},
        }

    monkeypatch.setattr("finn_pentest.providers.router.chat_completion", fake_chat)
    router = AIRouter()

    async def _run():
        return await router.send([{"role": "user", "content": "hi"}], engagement="acme")

    result = asyncio.run(_run())
    assert result.text == "hello from secondary"
    assert result.provider == "secondary"
    assert result.prompt_tokens == 10
    assert result.completion_tokens == 5
    assert result.cost_usd == pytest.approx(0.000015)
    assert calls == ["primary", "secondary"]


def test_router_exhausted(finn_home, monkeypatch):
    bootstrap()
    router = AIRouter(
        providers=[
            ProviderConfig(
                name="dead",
                model="x",
                base_url="https://dead.example/v1",
                api_key="k",
            )
        ]
    )

    async def fake_chat(provider, messages, stream=False):
        raise RateLimitError("429")

    monkeypatch.setattr("finn_pentest.providers.router.chat_completion", fake_chat)

    with pytest.raises(AllProvidersExhausted):
        asyncio.run(router.send([{"role": "user", "content": "hi"}]))
