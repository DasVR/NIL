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


def test_router_role_prefers_tagged_provider(finn_home, monkeypatch):
    bootstrap()
    save_providers(
        {
            "priority": [
                {
                    "name": "flash",
                    "model": "deepseek-v4-flash",
                    "base_url": "https://flash.example/v1",
                    "api_key": "k1",
                    "cost_per_1k": 0.001,
                    "roles": ["hunt"],
                },
                {
                    "name": "pro",
                    "model": "deepseek-v4-pro",
                    "base_url": "https://pro.example/v1",
                    "api_key": "k2",
                    "cost_per_1k": 0.002,
                    "roles": ["code"],
                },
                {
                    "name": "grok",
                    "model": "grok-4.5",
                    "base_url": "https://grok.example/v1",
                    "api_key": "k3",
                    "cost_per_1k": 0.003,
                    "roles": ["recover"],
                },
            ]
        }
    )
    calls = []

    async def fake_chat(provider: ProviderConfig, messages, stream=False):
        calls.append(provider.name)
        return {
            "choices": [{"message": {"content": provider.name}}],
            "usage": {"prompt_tokens": 1, "completion_tokens": 1},
        }

    monkeypatch.setattr("finn_pentest.providers.router.chat_completion", fake_chat)
    router = AIRouter()
    result = asyncio.run(router.send([{"role": "user", "content": "hi"}], engagement="acme", role="hunt"))
    assert result.provider == "flash"
    assert calls == ["flash"]


def test_router_skip_names_on_recover(finn_home, monkeypatch):
    bootstrap()
    save_providers(
        {
            "priority": [
                {
                    "name": "flash",
                    "model": "deepseek-v4-flash",
                    "base_url": "https://flash.example/v1",
                    "api_key": "k1",
                    "roles": ["hunt"],
                },
                {
                    "name": "grok",
                    "model": "grok-4.5",
                    "base_url": "https://grok.example/v1",
                    "api_key": "k3",
                    "roles": ["recover"],
                },
            ]
        }
    )
    calls = []

    async def fake_chat(provider: ProviderConfig, messages, stream=False):
        calls.append(provider.name)
        return {
            "choices": [{"message": {"content": provider.name}}],
            "usage": {"prompt_tokens": 1, "completion_tokens": 1},
        }

    monkeypatch.setattr("finn_pentest.providers.router.chat_completion", fake_chat)
    router = AIRouter()
    result = asyncio.run(
        router.send(
            [{"role": "user", "content": "hi"}],
            engagement="acme",
            role="recover",
            skip_names={"flash"},
        )
    )
    assert result.provider == "grok"
    assert calls == ["grok"]


def _two_providers():
    save_providers(
        {
            "priority": [
                {
                    "name": "primary",
                    "model": "m1",
                    "base_url": "https://primary.example/v1",
                    "api_key": "k1",
                },
                {
                    "name": "secondary",
                    "model": "m2",
                    "base_url": "https://secondary.example/v1",
                    "api_key": "k2",
                },
            ]
        }
    )


def _echo_provider(monkeypatch, calls):
    async def fake_chat(provider: ProviderConfig, messages, stream=False):
        calls.append(provider.name)
        return {
            "choices": [{"message": {"content": provider.name}}],
            "usage": {"prompt_tokens": 1, "completion_tokens": 1},
        }

    monkeypatch.setattr("finn_pentest.providers.router.chat_completion", fake_chat)


def test_router_per_request_model_pins_by_provider_name(finn_home, monkeypatch):
    bootstrap()
    _two_providers()
    calls = []
    _echo_provider(monkeypatch, calls)
    router = AIRouter()
    result = asyncio.run(
        router.send([{"role": "user", "content": "hi"}], engagement="acme", model="secondary")
    )
    assert result.provider == "secondary"
    assert result.model == "m2"
    assert calls == ["secondary"]


def test_router_per_request_model_pins_by_model_id(finn_home, monkeypatch):
    bootstrap()
    _two_providers()
    calls = []
    _echo_provider(monkeypatch, calls)
    router = AIRouter()
    result = asyncio.run(
        router.send([{"role": "user", "content": "hi"}], engagement="acme", model="m2")
    )
    assert result.provider == "secondary"
    assert calls == ["secondary"]


def test_router_per_request_pin_does_not_leak_between_turns(finn_home, monkeypatch):
    bootstrap()
    _two_providers()
    calls = []
    _echo_provider(monkeypatch, calls)
    router = AIRouter()
    asyncio.run(router.send([{"role": "user", "content": "hi"}], model="secondary"))
    asyncio.run(router.send([{"role": "user", "content": "hi"}]))
    assert calls == ["secondary", "primary"]
    assert router.pin is None


def test_router_unknown_model_falls_back_to_priority_order(finn_home, monkeypatch):
    bootstrap()
    _two_providers()
    calls = []
    _echo_provider(monkeypatch, calls)
    router = AIRouter()
    result = asyncio.run(
        router.send([{"role": "user", "content": "hi"}], engagement="acme", model="does-not-exist")
    )
    assert result.provider == "primary"
    assert calls == ["primary"]


def test_router_pinned_provider_still_fails_over(finn_home, monkeypatch):
    bootstrap()
    _two_providers()
    calls = []

    async def fake_chat(provider: ProviderConfig, messages, stream=False):
        calls.append(provider.name)
        if provider.name == "secondary":
            raise RateLimitError("429")
        return {
            "choices": [{"message": {"content": provider.name}}],
            "usage": {"prompt_tokens": 1, "completion_tokens": 1},
        }

    monkeypatch.setattr("finn_pentest.providers.router.chat_completion", fake_chat)
    router = AIRouter()
    result = asyncio.run(
        router.send([{"role": "user", "content": "hi"}], engagement="acme", model="secondary")
    )
    assert calls == ["secondary", "primary"]
    assert result.provider == "primary"


def _fake_stream(monkeypatch, script):
    """script: provider name -> list of deltas, or an exception to raise."""
    calls = []

    async def fake_stream(provider: ProviderConfig, messages, usage=None):
        calls.append(provider.name)
        plan = script[provider.name]
        if isinstance(plan, Exception):
            raise plan
        for delta in plan:
            yield delta
        if usage is not None:
            usage["prompt_tokens"] = 7
            usage["completion_tokens"] = len(plan)

    monkeypatch.setattr("finn_pentest.providers.router.stream_completion", fake_stream)
    return calls


def test_router_stream_result_delivers_deltas_then_full_text(finn_home, monkeypatch):
    bootstrap()
    _two_providers()
    calls = _fake_stream(monkeypatch, {"primary": ["Hel", "lo", " world"], "secondary": ["x"]})
    seen = []

    async def on_delta(d):
        seen.append(d)

    router = AIRouter()
    result = asyncio.run(
        router.stream_result([{"role": "user", "content": "hi"}], on_delta, engagement="acme")
    )
    assert seen == ["Hel", "lo", " world"]
    assert result.text == "Hello world"
    assert result.provider == "primary"
    assert result.prompt_tokens == 7
    assert result.completion_tokens == 3
    assert calls == ["primary"]


def test_router_stream_result_fails_over_and_honors_pin(finn_home, monkeypatch):
    bootstrap()
    _two_providers()
    calls = _fake_stream(
        monkeypatch, {"secondary": RateLimitError("429"), "primary": ["ok"]}
    )
    seen = []

    async def on_delta(d):
        seen.append(d)

    router = AIRouter()
    result = asyncio.run(
        router.stream_result(
            [{"role": "user", "content": "hi"}], on_delta, engagement="acme", model="secondary"
        )
    )
    assert calls == ["secondary", "primary"]
    assert result.provider == "primary"
    assert seen == ["ok"]


def test_router_stream_result_exhausted(finn_home, monkeypatch):
    bootstrap()
    _two_providers()
    _fake_stream(monkeypatch, {"primary": RateLimitError("429"), "secondary": RateLimitError("429")})

    async def on_delta(d):
        pass

    router = AIRouter()
    with pytest.raises(AllProvidersExhausted):
        asyncio.run(router.stream_result([{"role": "user", "content": "hi"}], on_delta))
