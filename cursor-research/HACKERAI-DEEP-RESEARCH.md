# HackerAI → NIL: deep research for heavy feature work

Source: [hackerai-tech/hackerai](https://github.com/hackerai-tech/hackerai) cloned 2026-09-05 (`main` @ `76976ee`).
This is a mechanism map, not a clone plan. NIL stays a local workstation. HackerAI is a SaaS pentest agent.

**Do not copy HackerAI source.** Their license is Apache 2.0 **plus commercial restrictions** (no commercial use without a separate license from HackerAI, LLC). Steal architecture, interaction patterns, prompt *ideas*, and tool *shapes*. Reimplement in Finn/Svelte. Vendor pentest methodology from [usestrix/strix](https://github.com/usestrix/strix) independently if that license fits, not by lifting HackerAI's generated JSON.

NIL's existing comparison in `SPEC.md` treated **hackerai.co** (web chat) and **hackerai.sh** (CLI) as two products. The open-source repo is the **web + desktop + agent** product (`hackerai.co`). The CLI is a different surface. This document is about the repo.

---

## 0. What HackerAI actually is

A production **chat-first pentest agent** for solo practitioners (bug bounty, freelance pentest, students). Teams exist but the product is optimized for one human + one agent + a sandbox.

Two user-facing modes only:

| Mode | Runtime | Tools | Step cap |
|------|---------|-------|----------|
| **Ask** | Vercel `/api/chat` (~420s) | notes + web_search + open_url | 15 |
| **Agent** | Trigger.dev task `agent-long` (up to 4h) | full sandbox toolset + optional subagents | 500 |

There is no third "Agent Long" chat mode. `agent-long` is the durable worker id. Permission modes (`ask_approval` / `auto_review` / `full_access`) are **not** chat modes — they sit on Agent only.

The agent is **shell-first**. The model gets a Kali box and `run_terminal_cmd`. There is no nmap plugin. Plugins are not the product. The image + prompt recipes + Strix skills *are* the product.

That is the opposite of NIL today: NIL is **plugin-first** (structured nmap/httpx/nuclei/… with `validate_target` and a recon chain) and the hunt loop **parses bash out of markdown**. HackerAI uses native tool calling and a general shell. NIL should keep plugins (they produce findings and keep the recon spine honest) **and** add a general shell tool so the model is not stuck in nine wrappers.

---

## 1. Stack (what they paid for vs what NIL should keep)

| Layer | HackerAI | NIL (keep / skip) |
|-------|----------|-------------------|
| UI | Next.js 16, React 19, Radix, Tailwind, `ai-elements` | Svelte 5 workstation. Skip React. |
| Chat protocol | Vercel AI SDK v6, `streamText`, UIMessage parts | Keep WS + FastAPI. Adopt **native tool parts**, not markdown command scrape. |
| DB | Convex (chats, messages, notes, subagents, local sandbox tokens) | Local SQLite / engagement markdown. Skip Convex. |
| Durable agent | Trigger.dev `agent-long` + `hackerai-subagent` | Local asyncio worker / sidecar. Same *job*, no SaaS. |
| Cloud sandbox | E2B Kali template, 4 CPU / 4GB, autopause 7 min | Optional later. Personal use: Docker per engagement. |
| Local/desktop exec | `@hackerai/local` + Tauri 2 + Centrifugo relay | Steal the **three-backend, one tool surface**. Use Finn sandbox + Tauri PTY. Skip Centrifugo unless relay is needed. |
| Auth / pay / analytics | WorkOS, Stripe, PostHog, OpenAI moderation | Skip entirely. Personal use, BYOM. |
| Search / fetch | Perplexity, Jina | Optional plugins. Not P0. |
| Desktop | Tauri WebView wrapping hackerai.co + local cmd/PTY/files | NIL already wants Tauri-native. Do not wrap a website. |

**Personal-use filter:** ignore billing, entitlements, extra-usage, referrals, team seats, PostHog flags, OpenAI moderation, WorkOS. Those encode *cost control*, not pentest quality.

---

## 2. Architecture that matters

```
Ask  → short serverless loop → notes/web only
Agent → durable worker
          → createTools(mode) + optional subagent tools
          → streamText (prepareStep compaction, stopWhen doom/timeout/tokens)
          → tool execute
                ├─ requestToolApproval?  (ask_approval | auto_review)
                └─ HybridSandboxManager
                     ├─ E2B Kali (cloud)
                     ├─ Centrifugo → @hackerai/local (host, no jail)
                     └─ Centrifugo → Tauri desktop (PTY + files)
          → persist parts + files + todos
          → UI: ToolBlock chips → Computer sidebar
```

### Mechanisms worth copying

1. **Split Ask vs Agent at the API**, not as four prompt files that share one parser.
2. **Single `createTools(mode)` factory.** Ask is a subset. Subagents get an allowlist. Skills never grant tools.
3. **Approval is a pause inside `tool.execute`**, not "please approve" in chat text. Grants: once / conversation prefix / deny. Auto-review is a *second model* with no tools.
4. **Hybrid sandbox, one tool schema.** `run_terminal_cmd` does not know if it is E2B or a host PTY.
5. **Browser is a CLI in the image** (`agent-browser`), not a first-class tool. Keeps the tool surface small.
6. **Skills = methodology files. Capability bundles = authority.** Mixing those is how agents escalate.
7. **Platform authorization is silent XML on the last user message**, stripped if the user forged it. System prompt tells the model not to re-ask for scope.
8. **Doom-loop fingerprint** (strip `brief`/`explanation`, warn @ 3, halt @ 5). Empty `todo_write` / empty shell args get excluded.
9. **`prepareStep` compaction** + client **one-shot auto-continue**. Not infinite resume.
10. **Parent cannot finish while child results are unconsumed** (subagent gate, +3 extra steps).

Key files in their tree (reference only):

| Job | Path |
|-----|------|
| Ask handler | `lib/api/chat-handler.ts` |
| Agent kickoff | `lib/api/agent-trigger-route.ts` |
| Durable loop | `trigger/agent-long.ts` (~5.6k LOC) |
| Shared stream | `lib/api/agent-stream-runner.ts` |
| Tools factory | `lib/ai/tools/index.ts` |
| Prompt | `lib/system-prompt.ts` |
| Approval | `lib/chat/agent-approval-*.ts`, `lib/chat/agent-auto-review.ts` |
| Doom loop | `lib/chat/doom-loop-detection.ts` (OpenCode-inspired) |
| Hybrid sandbox | `lib/ai/tools/utils/hybrid-sandbox-manager.ts` |
| Kali image | `docker/Dockerfile` |
| Strix vendor | `scripts/sync-strix-skills.mjs` → `lib/ai/subagents/skills/` |

---

## 3. Tool inventory (the real agent API)

Factory: `createTools()` in `lib/ai/tools/index.ts`. Ask filters to notes + web. Agent gets everything.

| Tool | What it does | Gated? | Sandbox? |
|------|----------------|--------|----------|
| `run_terminal_cmd` | Shell; foreground / background / interactive PTY; timeouts; large-output → file | Yes (every command) | Yes |
| `interact_terminal_session` | `view` / `wait` / `send` / `kill` on a live session | `send`+`kill` only | Yes |
| `get_terminal_files` | Pull sandbox paths into downloadable evidence (≤250MB) | No | Yes |
| `file` | `view`/`read`/`write`/`append`/`edit` | writes gated | Yes |
| `todo_write` | Merge/replace engagement task list | No | No |
| `create_note` `list_notes` `update_note` `delete_note` | Account notes: `general` / `findings` / `methodology` / `questions` / `plan` | No | No |
| `web_search` | Perplexity, 1–3 query variants | No | API |
| `open_url` | Jina reader | No | API |
| `delegate_task` | Spawn child (needs parent `full_access`) | — | Shared sandbox |
| `continue_agent` `list_agents` `send_message_to_agent` `wait_for_agents` `cancel_agent` | Parent ↔ child | — | Shared |
| `search_skills` `load_skill` | Catalog search; load 1–N bodies as methodology **only** | — | No |

**Not tools (important):**

- Browser = `agent-browser` CLI inside the sandbox (prompted in `<agent_browser>`).
- HTTP intercept / Burp-like proxy = **removed** from the agent API. `ProxyToolHandler.tsx` and `HttpRequestToolHandler.tsx` still render history. Image still has `zaproxy` + `proxychains4`. Agent drives them via shell.
- `match` (ripgrep wrapper) was deleted; analytics said unused. Model uses `rg` via shell.

### Tool-calling discipline they bake into the prompt

- Parallelize only independent work; cap 3–5 concurrent calls.
- Sequential for: discover → ports → service → vuln; auth before authenticated tests; scan-to-file then `get_terminal_files`.
- Parse and summarize scans; do not dump raw output as the answer.
- Bound recon (depth, duration, concurrency, output size).
- Task-unique PoC filenames (`poc_<task-id>.py`), never `exploit.py` on a shared host.

NIL equivalent today: `finn_pentest/ai/parser.py` extracts fenced bash, `run_turn` in `hunt.py` proposes commands, `MAX_HUNT_STEPS = 8`. That cannot carry a 4-hour engagement.

---

## 4. Sandbox topology

### Cloud (E2B)

- Image: **Kali rolling**, user `user`, passwordless sudo, `/home/user/upload`.
- Template `terminal-agent-sandbox`, 4 CPU / 4096 MB, `SANDBOX_VERSION = v12`.
- `secure: true` on create. No in-repo firewall allowlist.
- **Per-user shared** sandbox, not per-chat. Reuse running+matching version; resume paused; autopause ~7 min; idle release ~2 min after settle.
- Version bump only kills **paused** boxes (never a live shared run).

### Local / desktop

- `@hackerai/local`: host process + optional `node-pty`. **No isolation.** 1h idle exit.
- Tauri desktop: portable-pty, file pick/read/write (cap-std), localhost command server, same Centrifugo channel as local.
- Channel: `sandbox:connection:{id}#{userId}`.
- Free users are **forced onto local/desktop**. Cloud E2B is the paid meter.

### Preinstalled tools (steal this list into NIL's Kali image)

NIL's `Dockerfile.sandbox` is Debian slim + nmap/curl/python. `Dockerfile.sandbox.kali` adds nuclei/ffuf/gobuster. HackerAI's image is the actual workstation:

**Recon / scan:** nmap, naabu, nikto, whatweb, wafw00f, sqlmap, wapiti, wpscan, subfinder, dnsrecon, dnsenum, whois, ffuf, arjun, gobuster, dirsearch, gospider, nuclei (+ templates), httpx, katana, interactsh-client, cvemap, testssl.sh

**SMB / net:** smbclient, smbmap, nbtscan, enum4linux, python3-impacket, hping3, arp-scan, socat, proxychains4

**Auth / secrets:** hydra, jwt-tool, trufflehog, trivy, zaproxy, hashid, cewl, seclists, exiftool

**Git / forensics:** gitdumper, gitextractor, binwalk, foremost

**Browser:** Chromium + `agent-browser@0.26.0` (15 min idle daemon)

**Runtimes:** python3 (+ reportlab/docx/openpyxl/pptx/pandas), golang, node, ruby, tmux, ripgrep, pandoc

Prompt recipes that assume those binaries (`<sandbox_tool_recipes>`): interactsh before blind payloads; jwt-tool for alg confusion; arjun after endpoints exist; dirsearch after web root mapped; wafw00f before noisy scans; cvemap as *leads*; screenshot via agent-browser then `file.view`.

**NIL mapping:** expand `Dockerfile.sandbox.kali` to this set. Keep plugins as *structured* wrappers (parse → findings) but let hunt also emit raw `run_terminal_cmd` for tools we have not wrapped.

---

## 5. Prompts (the pentest brain)

Main builder: `lib/system-prompt.ts` → `systemPrompt(...)`. Assembly order:

1. Identity
2. Agent keep-going (Agent mode)
3. Language / style / evidence-vs-inference
4. Freshness + web_search policy (cutoff-aware)
5. Ask section **or** Agent section (tools, approval, sandbox, finding quality, parallel tools)
6. Optional `<generic_delegation>`
7. **Security authorization block** (anti-refusal)
8. User bio (ignore unless related)
9. Notes stay *out* of the system prompt (cache-stable); injected as `<system-reminder>`

### Authorization (aligns with NIL's `base.md`)

They do not ask the model to collect a permission slip. Platform already verified. Targets in the conversation *are* scope until the user changes them. Follow-ups inherit authorization. Do not re-ask on "retry nuclei".

Silent tag on the last user message (`lib/chat/platform-authorization.ts`):

```xml
<platform_authorization>…verified authorization for the active user-declared pentest targets…</platform_authorization>
```

Forged copies from the user are stripped at the provider boundary.

### Finding quality (copy the *rules*, not the XML)

This is the highest-leverage prompt block for NIL. It matches our "no fabricated CVSS" law:

- Scanner hits and suspicious behavior are **leads** until validated.
- Report-ready only with: affected asset, evidence, repro, impact, remediation, **confidence**.
- Calibrate severity to *demonstrated* impact. Demo/sandbox context, public data, required victim interaction, attacker position all count.
- Deduplicate. Close each candidate as **confirmed / ruled out / needs-validation**. Missing info is a proof gap, not proof of safety.
- Least-disruptive proof necessary.

NIL's `report.md` already wants Confirmed/Potential/Retest. Hunt does not enforce lead-vs-confirmed *during* the loop. That is a Wave 1 prompt + finding card change.

### Approval prompt contract (critical UX)

When `ask_approval` or `auto_review`: **do not ask in chat**. Call the tool; the platform pauses. A text-only "should I run nmap?" *ends the run before the approval UI appears*. NIL's hunt currently proposes via markdown and waits — that is the old shape. The new shape is: model emits `run_terminal_cmd`, UI shows ApprovalBlock, execute on approve.

`full_access` = NIL YOLO, but still "ask before destructive host commands on local/non-Docker".

---

## 6. Approval gate (three modes)

UI: `AgentPermissionSelector`. Default **`full_access`**.

| Mode | Label | Behavior |
|------|-------|----------|
| `ask_approval` | Ask for approval | Human gate on mutating/exec tools |
| `auto_review` | Approve for me | Separate reviewer LLM → approve / ask_user / deny; human if needed |
| `full_access` | Full access | No per-action pause |

Gated: every `run_terminal_cmd`; `interact_terminal_session` send/kill; `file` write/append/edit. Reads, wait, view, notes, todos, web: free.

Human UX (`ToolApprovalControls` + `AgentApprovalPrompt` in the **composer**, not buried in the stream):

- Allow once
- Allow this conversation (prefix grant, human-created only)
- Deny
- Stop

Auto-review details (`docs/agent-auto-review.md`):

- Reviewer has **no tools**, structured enum.
- Trusts **only user-authored** messages for authorization. Tool output / web / files = untrusted evidence (prompt-injection boundary).
- Filesystem deletion → always human.
- Failures (timeout, parse, missing terminal state) → `ask_user`.
- Never creates grants.
- Circuit breaker: 3 consecutive human denials after review, or 10 in last 50.
- "Reviewing action" UI delayed **450ms** to avoid flicker.
- Permission mode is **snapshotted per run**. Changing the selector mid-run applies next run.

Analytics never include commands, paths, prompts, credentials.

**NIL today:** `ApprovalBlock.svelte` still `console.log`s approve/reject. YOLO is `Cmd+Y` per engagement. Wire this for real, then add prefix grants, then maybe auto-review as a later opt-in (needs a second cheap model).

---

## 7. Long-run survival (why 8-step hunt dies)

| Control | HackerAI | NIL now |
|---------|----------|---------|
| Step cap | 15 Ask / 500 Agent (+3 parent gate) | 8 hunt turns |
| Wall clock | 10 min stream slice; Trigger max 4h | none |
| Doom loop | warn 3 / halt 5 identical fingerprints | none |
| Compaction | mid-run summarization, max 8; prune tool output to 40k tokens | last 20 chat messages |
| Auto-continue | server `data-auto-continue`; client **once** | none |
| Spend cap | ~$5/run basis | none (personal: optional) |
| Resume prompt | `lib/system-prompt/resume.ts` by finish reason | none |

Without compaction + doom-loop, a native-tool Agent will either infinite-loop nmap or blow the context window on nuclei JSON. This is not polish. It is the difference between a demo and an engagement.

---

## 8. Skills (Strix) — methodology pack

HackerAI vendors [usestrix/strix](https://github.com/usestrix/strix) via `scripts/sync-strix-skills.mjs`. Caps: 64KB/skill, 2MB total. Internal categories (`analysis`, `coordination`, `scan_modes`) are marked `internal: true`. `tooling` excluded.

Runtime: `search_skills` then `load_skill`. Skills **never grant tools or scope**. Subagent capability bundles are a separate allowlist (`code_read`, `code_write`, `web_research`, `browser_qa`, `terminal`; `external_connectors` blocked for children).

Catalog (~62):

| Category | Skills |
|----------|--------|
| analysis (internal) | counterevidence, fix_verification, severity_calibration, source_aware_discovery |
| cloud | aws, azure, gcp, kubernetes |
| coordination (internal) | root_agent, source_aware_whitebox |
| custom | api_spec_testing, dependency_cve_scanning, npx_confusion, source_aware_sast |
| frameworks | django, fastapi, nestjs, nextjs |
| protocols | graphql, oauth |
| reconnaissance | asset_discovery, infrastructure_lifecycle |
| scan_modes (internal) | deep, diff, quick, standard |
| technologies | active_directory, auth0, electron_desktop_apps, firebase, grafana_prometheus, llm_applications, supabase |
| vulnerabilities (29) | agentic_system_security, argument_injection, authentication_jwt, broken_function_level_authorization, browser_security, business_logic, csrf, header_injection, http_request_smuggling, idor, information_disclosure, insecure_deserialization, insecure_file_uploads, llm_prompt_injection, mass_assignment, nosql_injection, open_redirect, path_traversal_lfi_rfi, prototype_pollution, race_conditions, rce, semantic_confusion, sql_injection, ssrf, ssti, subdomain_takeover, weak_password_detection, xss, xxe |

**NIL mapping:** add a `prompts/skills/` or `finn_pentest/ai/skills/` tree. Hunt `search_skills` / `load_skill` as real tools. Severity calibration + counterevidence should be **always-on** (internal), not optional loads — they encode NIL's "no fake CVSS" law.

Do not copy HackerAI's `strix-skill-content.generated.json`. Sync from Strix upstream.

---

## 9. Subagents

| Limit | Value |
|-------|-------|
| Depth | **1** (children cannot delegate) |
| Active siblings | 2 |
| Children per parent run | 4 |
| Skills per child | 5 |
| Child steps | 50 |
| Active time | 15 min (max duration 17) |
| Child cost reserve | $1 (parent subagent pool $3) |
| Wait timeout | 300s |

Profiles: `general`, `security_task`, `security_validation`.

UI: compact chips in the stream; Computer sidebar shows child transcript. Parent is gated from finishing while results are unconsumed.

**NIL mapping:** Wave 4. Do not start here. A single Agent with todos + skills already exceeds current hunt. When added, reuse capability bundles so a "validate this SQLi" child cannot `run_terminal_cmd` outside `terminal`+`web_research`.

---

## 10. UI surfaces — steal the skeleton, reject the skin

HackerAI is a **three-pane chat workstation**:

```
ChatLayout
├── Sidebar (projects + chats)          // left — "tasks"
└── Chat
    ├── ChatHeader
    ├── Messages (timeline + ToolBlocks)
    ├── ChatInput
    │   ├── TodoPanel                   // current step above composer
    │   ├── Queue                       // follow-ups while running
    │   ├── Attachments
    │   ├── AgentApprovalPrompt         // THE attention object
    │   └── Toolbar (Ask|Agent · sandbox · perms · model · send/stop)
    └── ComputerSidebar                 // right: terminal | files | proxy | notes | subagents
```

### Steal (maps onto NIL IA)

NIL already specified this in `FRAMEWORK.md`: left targets, center stream, right findings. HackerAI's increment:

1. **Chip → detail panel.** Stream stays dense (`ToolBlock` ~36px). Click opens Computer (xterm, file, HTTP, notes). NIL's ToolBlock currently expands **inline** — keep REVEAL for errors (failed calls expand by default) but move long PTY/HTTP into the right inspector with a scrubber.
2. **Tool timeline scrubber** in the inspector (prev / next / live) while streaming.
3. **Approval in the composer** with Allow once / Allow for session / Deny — not a competing pulse in the stream. Matches NIL's "one attention object".
4. **450ms delay** before "needs approval" / "reviewing".
5. **Todo spine** above the composer; hide when the inspector owns it. NIL has `PlanBlock` — wire it to `todo_write`.
6. **Pinned autoscroll + Jump to latest.** NIL already has this primitive.
7. **Long paste → attachment** so the composer does not explode.
8. **Sandbox/host picker** next to Agent mode (Docker engagement / host / remote).
9. **Queued follow-ups** while a run is live.
10. **Stop always visible** (`Ctrl+C` analog). Stopping preserves partial stream, labeled interrupted.
11. **Share snapshot + fork** is SaaS; skip for personal use. Engagement export (markdown/Obsidian) is the NIL equivalent.
12. **Projects as engagement folders** + optional machine-local path — NIL already has `~/.finn-pentest/engagements/<name>/`.

### Reject (anti-slop + NIL law)

HackerAI actually does these; do not port them:

- User **chat bubbles** (`rounded-[18px]`, right-aligned). NIL: tool cards, no bubbles.
- Glass composer, 22px radius, soft drop shadow under every card.
- Purple premium tokens (`#5d5bd0`) and chart green (`#51da4c`). Color means risk only.
- Geist as the only typeface. Keep Inter / JetBrains role split.
- Consumer empty state ("What will you hack today?").
- Emoji in product chrome (their UI is mostly clean; NIL ApprovalBlock currently has a ⚡ — remove it when wiring).
- Fake CSS window lights, gradient washes, colored primary button.

Their Computer panel is closer to ChatGPT canvas than a raw PTY. NIL's Zone C is transform/opacity only; the inspector should feel like evidence, not a toy VM window.

Keyboard: they are sparse (`⌘⇧S` sidebar, `⌘K` search, `Ctrl+C` stop). NIL already has a denser map (`⌘K` palette, `⌘J` composer, `⌘Y` YOLO, `⌘Enter` approve). Keep NIL's.

---

## 11. Gap matrix (NIL vs HackerAI)

| Capability | HackerAI | NIL now | Verdict |
|------------|----------|---------|---------|
| Native tool calling | AI SDK tools | Parse fenced bash | **P0** |
| Ask vs Agent API split | Yes | Four prompt modes, one loop | **P0** (map Ask→chat, Agent→hunt) |
| Step budget | 500 | 8 | **P0** |
| Approval execute-await | Yes + grants | UI stub + YOLO flag | **P0** |
| Finding lead/confirmed | Prompt + notes | Report mode only | **P0** |
| Kali tool image | Full | nmap + 3–6 tools | **P0** |
| Doom-loop | Yes | No | **P0** |
| Tool-output compaction | 40k prune + summaries | 20 messages | **P1** |
| `todo_write` / PlanBlock live | Yes | PlanBlock exists, unwired | **P1** |
| Chip → Computer inspector + scrubber | Yes | Inline ToolBlock | **P1** |
| PTY `interact_terminal_session` | Yes | One-shot exec | **P1** |
| `get_terminal_files` → loot | Yes | loot/ dir unused by agent | **P1** |
| Notes tool (findings/methodology/plan) | Yes | notes.md file | **P1** |
| Hybrid sandbox (docker/host/remote) | Yes | Docker only | **P1** |
| agent-browser | Cloud image | No | **P1** |
| Strix skills search/load | Yes | Static prompts | **P2** |
| Subagents | Yes | No | **P2** |
| Auto-review LLM | Yes | No | **P2** (optional) |
| Web search / open_url | Perplexity/Jina | No | **P2** |
| HTTP intercept product | Removed; ZAP via shell | Burp XML import | Keep import; shell ZAP; no fake Burp |
| SaaS billing/auth/moderation | Full | N/A | Skip |
| Encrypted creds / Obsidian | Weak/SaaS | Finn cred_store + Obsidian | **Keep NIL's** |

---

## 12. Feature waves (implementation order)

Personal-use NIL. Each wave should be a separate PR series. Do not start with subagents or a Computer-sidebar visual clone.

### Wave 0 — Contract (no UI chrome)

Define the agent tool schema in Finn, shared by TUI and Svelte:

```
run_terminal_cmd
interact_terminal_session
get_terminal_files
file
todo_write
notes.* 
```

Plugins remain: when the model names `nmap`/`nuclei`/…, Finn still goes through `BasePlugin.get_commands` + `parse_output` + finding ingest. Unknown binaries fall through to raw shell. `safety_level` feeds the approval gate.

Replace `parse_response` bash scrape as the *primary* control plane. Keep it as a fallback for chat/code modes.

Snap permission mode per hunt run: `ask_approval` | `full_access` (YOLO). Add `auto_review` later.

### Wave 1 — Agent runtime (the heavy lift)

Backend (`finn_pentest/ai/hunt.py`, new `finn_pentest/ai/tools/`):

1. Native tool loop (OpenAI-compat `tools=` on the router). BYOM already speaks this.
2. Step cap 200+ for hunt (500 is SaaS-scale; personal Docker is the real limit).
3. Approval as execute-await. Wire `ApprovalBlock` (no emoji, `--nil-*` chrome, Cmd+Enter / Cmd+Shift+Enter). Prefix grant: "Allow nmap* this engagement".
4. Doom-loop (warn 3 / halt 5). Empty-arg exclusion.
5. Prompt: port `<finding_quality>`, `<scan_methodology>`, sequential-vs-parallel, authorization persistence. Keep NIL voice (no "HackerAI").
6. Finding cards: status `confirmed | needs-validation | ruled-out`. No invented CVSS.

Frontend: ToolBlock pending→running→ok/error already matches. Connect it to real WS events. Stop preserves partial stream.

### Wave 2 — Sandbox that can actually hunt

1. Expand `Dockerfile.sandbox.kali` to the HackerAI tool list (or a close subset you actually use). `NET_RAW`/`NET_ADMIN`/`SYS_PTRACE` like their `docker/run.sh`.
2. Per-engagement container **already exists** — keep it. Do *not* switch to per-user shared like E2B; isolation per engagement is a NIL win.
3. Host backend: "dangerous" local exec for when Docker lies about ports (their prompt already admits this). Same tool schema.
4. PTY sessions + `interact_terminal_session` (hydra, sqlmap, agent-browser, tmux).
5. `get_terminal_files` → `engagements/<name>/loot/`.
6. Optional `agent-browser` in the Kali image; prompt recipe; 15 min idle caveat.

### Wave 3 — Computer inspector (Zone C)

Right rail becomes the evidence machine, not only ranked FindingCards:

- Tabs/modes: **terminal** (xterm of selected tool), **files** (loot + sandbox paths), **notes**, **todos**.
- Stream ToolBlocks are chips; click focuses inspector; errors still REVEAL inline.
- Scrubber across tool executions in the engagement.
- TodoPanel above StreamComposer; PlanBlock driven by `todo_write`.
- Notes categories mapped onto `findings/` + `notes.md` rather than a SaaS notes table.

Do not add a "HackerAI's Computer" rounded floating VM. Hairline + `--lift-*`. Mono for output, sans for NIL labels.

### Wave 4 — Skills then subagents

1. Vendor Strix (or a curated subset) into `prompts/skills/`. Always inject analysis/counterevidence + severity_calibration in hunt.
2. Tools: `search_skills`, `load_skill`.
3. Then `delegate_task` with depth 1, 2 siblings, capability bundles. UI: tool chips + inspector child stream.

### Wave 5 — Nice-to-have (personal)

- Auto-review with a cheap local/cloud model (optional).
- `web_search` / `open_url` as plugins (BYOK).
- Compaction worker dumping a summary file into the sandbox for `rg`.
- One-shot auto-continue after context prune.
- Queued composer messages during a run.
- Long-paste → attachment.

---

## 13. What NIL must not become

1. **A HackerAI skin.** Chat-first SaaS with a Kali sidecar. NIL is terminal-first; the agent stream is the showcase, the PTY is real.
2. **Shell-only.** Dropping plugins would lose structured findings and the recon chain. Hybrid: plugins for the known spine, shell for everything else.
3. **A copy-paste of `trigger/agent-long.ts`.** License + coupling to Convex/Trigger/E2B. Reimplement the *state machine* in Finn.
4. **Unbounded YOLO on the host.** `full_access` on Docker is fine. Host backend keeps a destructive-command confirm even in YOLO (their own prompt does this).
5. **Fabricated severity from nuclei template names.** Finding quality rules are mandatory.
6. **Fake HTTP intercept UI** with no proxy behind it. They left ghost handlers; we should not.

---

## 14. Concrete file-level map (when building)

| Build this in NIL | Mirror this HackerAI idea | NIL home |
|-------------------|---------------------------|----------|
| `create_tools(mode)` | `lib/ai/tools/index.ts` | `finn_pentest/ai/tools/` |
| Hunt native loop | `createAgentStream` | `finn_pentest/ai/hunt.py` |
| Approval grants | `agent-approval-grants.ts` | `finn_pentest/tools/executor.py` + WS |
| Doom loop | `doom-loop-detection.ts` | `finn_pentest/ai/doom_loop.py` |
| Finding quality prompt | `<finding_quality>` | `prompts/hunt.md` + `base.md` |
| Kali image | `docker/Dockerfile` | `finn_pentest/sandbox/Dockerfile.sandbox.kali` |
| Hybrid manager | `hybrid-sandbox-manager.ts` | `finn_pentest/sandbox/dispatch.py` |
| PTY | `pty-session-manager.ts` + Tauri `pty.rs` | sandbox + `frontend` TerminalTab |
| Computer inspector | `ComputerSidebar` | `RightSidebar.svelte` + new inspector |
| Tool chips | `components/ui/tool-block.tsx` | `ToolBlock.svelte` (chip mode) |
| Todos | `todo_write` + `TodoPanel` | `PlanBlock.svelte` + hunt |
| Skills | Strix sync | `prompts/skills/` + `search_skills` |
| Authz metadata | `platform-authorization.ts` | append in `build_context_prompt` |
| Auto-review | `agent-auto-review.ts` | later, optional |

---

## 15. Source index (for the next agent)

Clone: `https://github.com/hackerai-tech/hackerai`

Read first: `lib/system-prompt.ts`, `lib/ai/tools/index.ts`, `lib/ai/tools/run-terminal-cmd.ts`, `lib/chat/doom-loop-detection.ts`, `docs/agent-auto-review.md`, `docker/Dockerfile`, `lib/ai/tools/utils/hybrid-sandbox-manager.ts`, `app/components/tools/ToolApprovalControls.tsx`, `lib/ai/subagents/skills/strix-skill-catalog.generated.json`.

Skip for NIL: `lib/rate-limit/**`, `lib/pricing/**`, `lib/extra-usage.ts`, `convex/stripe*`, `app/components/extra-usage/**`, PostHog, WorkOS, referrals, user-research Trigger tasks.

---

*Researched 2026-09-05 against hackerai `main` @ 76976ee. NIL tree: plugin hunt loop, stub ApprovalBlock, thin Debian sandbox. Next build: Wave 0 schema + Wave 1 native tool loop.*
