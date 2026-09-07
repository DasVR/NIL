# NIL — the agentic window

A design doc for turning NIL's composer into a multi-mind, multi-tier workspace: one
window, many providers, one continuous memory. Companion to
[`FRAMEWORK.md`](../FRAMEWORK.md) (visual law) and
[`docs/WELCOME.md`](WELCOME.md) (operator journey). This file is the product/architecture
law for *what NIL talks to and how it decides who answers*.

Status: **proposal — nothing here is built yet.** Where it references existing code
(`finn_pentest/providers/`, `finn_pentest/godmode/`, `finn_pentest/ai/`), that code is
real today and this doc extends it. Where it invents new concepts (Skills, Minds, the
Session Ledger), they are marked **NEW**.

---

## 1. The idea

Right now, "which AI answers" is a backend implementation detail: `AIRouter` picks the
first available provider off a list and fails silently to the next one
(`finn_pentest/providers/router.py`). That's the right instinct — the operator should
never have to think about provider plumbing — but it's not yet a *product*. There is no
way, today, to say "use Opus for this report, a fast model for this triage, and my
Cursor-style local agent for this refactor," and have NIL remember that decision as part
of the engagement.

The ask is to make that explicit, without turning NIL into a chatbot picker. The
organizing idea:

> **One window. Many minds. One memory.**

The shell you already see — Titlebar, target Sidebar, MainWorkspace, Composer, right-hand
Findings/Timeline panel — does not fork per provider. It never grows a "Claude tab" next
to a "Codex tab." What changes underneath a single composer is *which mind is currently
listening*, chosen by task, not by brand loyalty. This is the same discipline as the
color law in `FRAMEWORK.md` — one surface, a small number of load-bearing signals — applied
to compute instead of pixels.

---

## 2. Vocabulary (read this before the tables)

The request mixes several real but distinct concepts. Naming them precisely now avoids
building the wrong abstraction later.

| Term | Definition | Existing code |
|---|---|---|
| **Provider** | An account/endpoint relationship: Anthropic API key, OpenAI key, a local Ollama daemon, a Cursor/Codex/Antigravity CLI wrapper. Owns auth and billing. | `finn_pentest/providers/openai_compat.py`, `ProviderConfig` |
| **Mind** *(NEW)* | A specific model reachable through a provider, at a specific tier: "Claude Opus via Anthropic," "Kimi K3 via Moonshot," "GPT-4o-mini via OpenAI." A provider can expose many minds. | `finn_pentest/godmode/models.py` → `ModelSpec` (already has `provider`, `tier`, `coding`, `reasoning`) |
| **Tier** | A quality/cost band a Mind sits in: `fast(1–12)`, `standard(13–27)`, `smart(28–41)`, `power(42–53)`, `ultra(54–60)`. | `TIER_BANDS` in `godmode/models.py` |
| **Mode** | The task grammar NIL already speaks: `hunt`, `exploit`, `chat`, `code`, `report` (mode chips in `Titlebar.svelte` / `StreamComposer.svelte`, prompt bodies in `finn_pentest/ai/prompts.py`). | Already shipped |
| **Session** | One continuous back-and-forth inside an engagement, persisted with a mode. | `finn_pentest/ai/chat_store.py` |
| **Engagement memory** | The durable, provider-agnostic record of an engagement: scope, findings, notes, timeline, plugin run history, RAG index. | `finn_pentest/ai/context.py::build_context_prompt`, `finn_pentest/ai/rag.py` |
| **Plugin** | A wrapped external tool NIL can invoke: nmap, nuclei, ffuf, gobuster, etc. Capability, not intelligence. | `finn_pentest/plugins/*` |
| **Skill** *(NEW)* | A packaged, reusable instruction set + optional few-shot pattern any Mind can load — "write a PTES-style report section," "explain a CVE for a junior pentester," "triage nuclei output." Distinct from a Plugin: a Plugin runs a binary, a Skill shapes a prompt. | Does not exist yet — closest ancestor is the static `prompts/*.md` files |
| **Space** | An engagement-scoped workspace (per `WELCOME.md`'s "first Space"). | Already shipped concept |

If a future conversation uses "subscription" it means **Provider** (an account with a
billing relationship); if it uses "session" loosely it usually means **Session** above,
occasionally **engagement memory**. Keep them separate in code and UI copy.

---

## 3. What already exists — don't rebuild this

Before adding anything, credit and reuse what's there:

- **`AIRouter`** (`providers/router.py`) — ordered provider list, first-success wins,
  silent failover on `RateLimitError` / `TimeoutError` / `ProviderError`, cost logging via
  `log_usage`. This is the seed of provider orchestration.
- **`MODEL_REGISTRY` + `TIER_BANDS`** (`godmode/models.py`) — a real cross-provider model
  catalog with tier numbers already assigned, plus `models_for_tier()` and
  `models_for_provider()` lookups.
- **`godmode/` package** (`pipeline.py`, `autotune.py`, `scoring.py`, `liquid.py`,
  `godmode_classic.py`) — an existing orchestration engine that already reasons about
  model selection and scoring. This doc treats `autotune`/`scoring` as the natural home
  for tier-by-task logic (§5) rather than inventing a parallel system.
- **`build_context_prompt()`** (`ai/context.py`) — the one place engagement memory is
  assembled: scope, plugins, run history, findings, notes, timeline, RAG hits. This is
  already provider-agnostic — exactly right. Its slicing today is fixed and manual
  (`history[:10]`, `stdout[:400]`, `findings[:20]`, `notes.splitlines()[-50:]`); §7 turns
  this into a token-budgeted packer instead of ad hoc truncation.
- **`ai/rag.py`** — a working retrieval layer over past notes. Under-used today (only
  called when `query` is non-empty in `build_context_prompt`); §7 leans on it harder.
- **`chat_store.py`** — sessions already persist per engagement + mode with a title and
  timestamp. This is the substrate for the Session Ledger in §6.
- **Provider adapters** (`providers/openai_compat.py`, `godmode/providers.py`) — OpenAI-
  compatible, Anthropic-native, and Gemini-native completion functions already exist.
  Cursor/Codex/Antigravity are named in a docstring as an aim but have no adapter yet —
  that's new work (§4).

Nothing above should be thrown away. The job is: connect it to the UI, make the
task→tier→provider decision visible and editable instead of implicit, and close the
token-efficiency gaps that come from `build_context_prompt` not knowing which Mind (and
therefore which context window and price) it's feeding.

---

## 4. The laws

Extending `FRAMEWORK.md`'s three laws with four more, governing compute instead of pixels.

**Law 4 — One window, many minds.** The shell never forks per provider. No "Claude
panel" beside a "Codex panel." The Composer is the only input surface, in every mode, for
every Mind. What's selectable is *which Mind answers this message*, surfaced the same way
the mode chips already are — small, ink-toned, in the status/composer chrome, never as a
provider-branded logo or color (Anthropic orange, OpenAI teal, etc. are brand colors —
Law 1 forbids decorative color in the workstation, and a provider is not a severity).

**Law 5 — Tier is chosen by task, not by vibe.** Every Mode has a *default* tier band and
a *default* Mind, both overridable per-message, never overridable silently. `report` mode
defaults toward `power`/`ultra` (synthesis, long-form prose quality matters). `hunt` in
YOLO-on defaults toward `fast`/`standard` (many small proposals, low individual stakes,
speed compounds). `exploit` defaults to a reasoning-tuned Mind regardless of tier, because
correctness there has real consequences. `code` prefers a `coding=True` Mind
(`ModelSpec.coding`) over a higher raw tier. This mapping is data (§5's table), not
scattered `if mode == "x"` logic, so it can be tuned without a redeploy.

**Law 6 — Memory is layered and singular, never duplicated per Mind.** There is exactly
one engagement memory (§3's `build_context_prompt`, extended by §6). Switching the active
Mind mid-engagement must not reset context, re-ask the operator what the scope is, or
fork the findings list. A Mind is a lens on one memory, not a new memory.

**Law 7 — Spend is visible before it's incurred, not audited after.** Every send shows
its projected Mind + tier + rough cost before it goes out, the same way a severity badge
is never hidden. This is table stakes for "token efficiency" to be a felt property of the
product and not a backend metric nobody sees. It also means `AIRouter`'s failover order
should become cost-aware, not just availability-ordered (§7).

---

## 5. The Mode × Tier × Mind matrix

This table is the concrete artifact `godmode/autotune.py` should encode (today it likely
has some of this logic already — audit before adding a parallel table). Read it as
*defaults*, always overridable:

| Mode | Default tier | Mind preference | Why |
|---|---|---|---|
| `hunt` | `fast`→`standard` (scales with YOLO cadence) | any; prioritize latency | High message volume, low per-message stakes, speed compounds over a long loop |
| `exploit` | `power`→`ultra` | `reasoning=True` preferred | Wrong exploitation guidance has real consequences; pay for care |
| `chat` | `standard`→`smart` | balanced | Explaining techniques/findings; correctness matters, latency is secondary |
| `code` | `smart`→`power` | `coding=True` preferred | Prefer a coding-tuned Mind over a raw-tier-only choice |
| `report` | `power`→`ultra` | strongest prose Mind available | Client-facing deliverable; this is the one place to spend the most |

External CLI-style agents (Cursor, Codex, Antigravity) slot in as **Minds under a new
`local_agent` provider family** (§8), most naturally surfaced in `code` mode where their
repo-aware editing loop is the actual value proposition — not as a general chat
alternative to `chat` mode.

---

## 6. Sessions and the memory stack

Three layers, cleanly separated so a Mind swap never loses history and a long engagement
never blows a context window:

1. **Engagement memory** (durable, cross-session, cross-Mind) — scope, findings, notes,
   timeline, plugin capability list. Lives in the existing engagement store. Read by
   every Mind, written by the operator and by tool runs, never by a single provider's
   private state.
2. **Session memory** (this conversation's turns) — already modeled by `chat_store.py`.
   **NEW**: extend the session row with a **Session Ledger** — an ordered list of
   `{turn_id, mind_used, tier, prompt_tokens, completion_tokens, cost_usd}` so a session
   that started on a fast Mind and escalated to `ultra` for one hard turn has an honest,
   inspectable record. This is what Law 7 renders in the UI.
3. **Working context** (what actually goes in the next API call) — the token-budgeted
   output of `build_context_prompt`, sized to the *chosen Mind's* context window and tier,
   not a fixed slice. See §7.

Switching Minds mid-session appends to the same Session Ledger; it does not create a new
session. The operator should be able to look at one session and see "started on Kimi K3
fast, escalated to Opus for the exploit confirmation, back to fast for the write-up" as a
single coherent timeline — the master-detail pattern already built for findings
(compact row → full inspector) is the right shape for the Session Ledger's UI too.

---

## 7. Token efficiency — where the real gains are

In priority order, highest leverage first:

1. **Token-budgeted context packing, not fixed slicing.** `build_context_prompt` today
   truncates every section to a fixed count regardless of which Mind will consume it
   (`history[:10]`, `findings[:20]`, `notes[-50:]` lines). A `fast` Mind with an 8K window
   and an `ultra` Mind with a 1M window should not receive the same packed prompt.
   **Fix:** compute a per-section token budget from the target Mind's `ModelSpec.context`
   and tier, and pack sections by relevance (RAG-ranked) until the budget is spent, not by
   a hardcoded count. This is the single highest-leverage change in this whole doc.
2. **Lean on RAG harder.** `rag_search` only runs when `query` is non-empty; the
   fallback (`history[:10]`, `notes[-50:]`) is a blunt substitute for retrieval. Make RAG
   the default path for "recent notes" and "past findings," with the fixed-slice fallback
   only firing if the RAG index is empty (new engagement, cold start).
3. **Prompt caching where the provider supports it.** `base.md` + the plugin capability
   list + the mode prompt are static per engagement for long stretches; the timeline tail
   and latest findings are volatile. Anthropic and OpenAI both support prefix/prompt
   caching keyed on a stable prefix — structure `build_context_prompt`'s output so the
   static block is a stable prefix and the volatile block is appended, so a caching-aware
   provider adapter can skip re-billing the static part every turn.
4. **Cost-aware failover, not just availability-ordered.** `AIRouter.available()` orders
   by pin, then list order. Extend the ordering to consider `cost_per_1k` against the
   chosen tier band, so failover doesn't silently jump from a cheap Mind to an expensive
   one (or vice versa) without that being a deliberate, visible choice per Law 7.
5. **Escalate, don't default up.** Per §5, most modes should default to the cheapest tier
   that reliably succeeds, with an explicit, visible escalation path (one click, one
   keystroke) rather than defaulting every mode to `power`/`ultra` "to be safe." Quality
   should come from *choosing correctly*, not from *always paying for the ceiling*.

None of this trades quality for cost — it trades **wasted tokens** (stale slices, cold
re-sends of static prefixes, wrong-size context for the Mind actually answering) for
tokens that do work. That's the "perfect balance" the brief is asking for: efficiency
work that a user never sees, and a UI restrained enough that there's less to render,
animate, and re-fetch in the first place. A quieter interface and a cheaper one are not
in tension here — they're the same discipline pointed at two ends of the stack.

---

## 8. Providers beyond API keys — Cursor, Codex, Antigravity

These are agentic *products* (repo-aware, tool-using, often local-CLI-driven), not plain
completion endpoints — they don't fit `openai_compat_completion` cleanly. Model them as a
new provider family:

```
provider: "local_agent"
  driver: "cursor-cli" | "codex-cli" | "antigravity" | ...
  invocation: shell-out with a structured task + repo path, streaming stdout back
  auth: whatever that CLI's own login/session state is (NOT an API key NIL stores)
```

Consequences:

- **Auth stays with the tool.** NIL does not store or proxy credentials for a CLI-driven
  Mind — it shells out to a tool the operator already authenticated on their machine, the
  same trust boundary as the sandboxed tool runs `plugins/*` already perform.
- **These Minds are `code`-mode citizens first.** Their value is repo-aware editing, not
  general chat — don't offer them in `chat`/`report` mode.
- **Cost tracking degrades gracefully.** A local CLI agent likely won't return
  token-accurate usage the way an API does. The Session Ledger should accept an
  "unmetered" cost entry rather than pretending a $0.00 cost is real data.
- **Build the adapter interface once, generically**, so a fifth or sixth agentic CLI is a
  new driver, not a new subsystem. `Provider.provider` already reads as an enum-ish
  string in `godmode/providers.py`; formalize it before adding `local_agent` rather than
  bolting on a special case.

---

## 9. Skills — the missing layer

Plugins (§3) give NIL capabilities (run nmap). Modes give NIL task grammar (hunt vs
report). Neither covers "a reusable, packaged way of shaping a prompt that any Mind can
load" — e.g. "summarize findings for an executive audience," "explain this CVE at a
junior level," "convert raw nuclei output into a finding draft." That's a **Skill**: a
named, versioned instruction block (optionally with few-shot examples) that composes with
a Mode and a Mind, provider-agnostically. Concretely, this generalizes the static
`prompts/*.md` files from "one per mode" to "a library, loadable by name, several per
mode, user-authorable." This doc flags the concept and its boundary; a full Skill schema
is its own follow-up doc once §4–§7 are settled.

---

## 10. UI surface (builds on the shipped command-center + master-detail shell)

- **Composer chip**, next to the existing mode chips: `mind · tier` as plain ink-toned
  text (e.g. `kimi-k3 · fast`, `opus · ultra`), click to change. Never a provider logo,
  never a brand color — Law 4.
- **Cost/tier preview** inline before send, same visual weight as the existing token/cost
  readout already in the AI strip concept — Law 7 made literal.
- **Session Ledger view**: a new tab in the right sidebar's inspector family (alongside
  Findings/Timeline/Evidence/Context), rendered as a master-detail list exactly like the
  findings redesign — one row per turn, `mind · tier · cost`, click for the full
  prompt/response if the operator wants to audit it.
- **Provider/Subscription management** lives in `SettingsAI.svelte` (already exists) —
  extend it to list Providers (with connection status, not a "pro/free" marketing badge)
  and let the operator set per-Mode default Minds, i.e. make §5's table user-editable
  data, not hardcoded.

---

## 11. Phased plan

1. **Phase 0 — audit, don't duplicate.** Read `godmode/autotune.py`, `scoring.py`,
   `pipeline.py` in full before writing any new routing logic; this doc assumes they
   already do *some* of §5's job. Confirm what's there, extend rather than parallel-build.
2. **Phase 1 — make the Mode×Tier×Mind mapping data, and surface it.** §5's table as a
   config, editable in `SettingsAI.svelte`, read by the router. No new providers yet.
3. **Phase 2 — token-budgeted context packing.** §7 items 1–2. This is backend-only and
   has no UI dependency; do it early, it pays for everything after it.
4. **Phase 3 — Session Ledger.** §6's ledger + the UI in §10. Requires Phase 1's mind/tier
   data to exist per turn.
5. **Phase 4 — `local_agent` provider family.** §8. Cursor/Codex/Antigravity adapters,
   `code`-mode only, gated behind the operator having that CLI already installed/authed.
6. **Phase 5 — Skills.** §9. Deliberately last; it's the most speculative piece and
   benefits from Phases 1–3 existing first (a Skill is only as good as the memory and
   routing it composes with).

---

## 12. Open questions (need a decision before Phase 1 starts)

1. Is a "subscription" ever *more* than a Provider — e.g. does a single Anthropic
   subscription need to expose multiple seats/rate-limit pools inside NIL, or is
   Provider = subscription, one-to-one?
2. For `local_agent` Minds (§8): shell out to an installed CLI, or is there ever a case
   for NIL bundling/managing that CLI itself? (Recommend: never bundle — trust boundary.)
3. Does cost tracking need to roll up per-engagement (client billing) or only
   per-operator (personal spend awareness), or both?
4. Should tier defaults (§5) be global or overridable per-engagement (a client with a
   strict budget vs. one where quality trumps cost)?
5. How much of `godmode`'s existing `autotune`/`scoring` logic already answers §5, and how
   much of this doc is redundant with it? (This needs the Phase 0 audit before anything
   else proceeds.)
