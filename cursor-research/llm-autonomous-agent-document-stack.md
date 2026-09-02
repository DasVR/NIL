# LLM Autonomous Agent Capabilities & Document Stack Research

A technical breakdown of how leading LLMs (Anthropic Claude, OpenAI ChatGPT, Google Gemini) execute autonomous tasks, manipulate production documents, and wire into enterprise tooling — and what stack you can build to mirror those capabilities locally.

## Scope

- **Date researched:** 2026-09-01
- **Sources:** Official docs, engineering blogs, research papers, and production benchmarks. Inline citations use bracket IDs; full URLs are listed at the end.
- **Focus:** native model capabilities, tool/protocol architecture, document handlers, creative/analytical automation, and an actionable recommended stack.

---

## 1. Native Capabilities vs. Connected Tools

### 1.1 Anthropic Claude

Claude exposes capability through three layers:

1. **Native model skills** — reasoning, coding, analysis, multi-turn planning.
2. **Anthropic client/server tools** — schemas Anthropic defines that your app or Anthropic executes (memory, bash, text editor, computer use, browser, web search/fetch, code execution, MCP connector).[1]
3. **MCP servers** — external servers exposing `resources`, `prompts`, and `tools` over JSON-RPC; Claude Desktop/Claude Code can connect to them.[2]

Native capabilities do **not** by themselves read your local files or send email. Those require connected tools, either built into the client or served via MCP.

### 1.2 OpenAI ChatGPT / GPT Platform

OpenAI unifies agentic behavior under **tool calling**:

- **Functions/tools** — JSON-schema-defined functions executed by your app.[3]
- **Built-in tools** — web search, file search, code interpreter, computer use, shell/apply-patch/local-shell, image generation, and remote MCP tunnels.[4]
- **ChatGPT Work / Workspace agents** — higher-level agent mode with plugins/"apps" connecting to Slack, Gmail, Google Drive, SharePoint, Salesforce, etc., plus scheduled tasks and desktop app integration.[5]

The model itself only emits structured tool requests; all execution, auth, and state management lives in the surrounding platform or your own orchestrator.

### 1.3 Google Gemini

Gemini's API supports:

- **Function calling** over the Interactions API / `generateContent` API, where the model returns structured calls against user-provided declarations.[6]
- **Workspace integration** via Google Apps Script ("workspace tools" pattern) that Gemini calls to create calendar events, draft emails, and build slide skeletons in Docs/Slides/Sheets.[7]
- **Native in-product AI** (Gemini in Docs/Sheets/Slides) that edits cells, writes formulas, creates tables, summarizes Drive/Gmail files, and builds charts.[8][9]

Again, the model is not executing directly; it is selecting from function declarations whose implementations you (or Google Apps Script) provide.

---

## 2. Protocol & Architecture

### 2.1 Anthropic Model Context Protocol (MCP)

MCP is an open JSON-RPC protocol connecting hosts, clients, and servers. Server features include:[2]

- **Resources** — context/data for the user or model.
- **Prompts** — templated message workflows.
- **Tools** — functions the model can execute.

Client features include **sampling** (server-initiated LLM calls), **roots** (URI/filesystem boundaries), and **elicitation** (asking the user for more info). Anthropic's engineering team notes that direct tool calls consume excessive context; a "code mode" pattern lets agents write code that calls MCP tools, reducing token usage up to 98.7%.[10]

Key architectural takeaways for building a local equivalent:

- Define a **tool registry** with JSON schemas.
- Let the model **discover tools** on demand (filesystem or `search_tools`) rather than loading all definitions up front.
- Execute code in a **sandbox** and return filtered results to the model.
- Maintain state via files in a per-engagement workspace.

### 2.2 OpenAI Function Calling / Responses API

OpenAI's function calling flow has five steps:[3]

1. Request with available tools.
2. Model returns a tool call.
3. Your application executes the function.
4. You send the tool output back to the model.
5. Model returns final text (or more tool calls).

Recent additions:

- **Structured outputs** with `strict: true` JSON Schema guarantee arguments match the schema.[11]
- **Custom tools** with free-form text or grammar/regex-constrained inputs.[4]
- **Tool search** for deferring rarely used tools (GPT-5.4+).[4]
- **Built-in computer use** and **shell tools** in the Responses API / Agents SDK.[4]

### 2.3 Google Gemini Function Calling

Gemini's Interactions API supports:[6]

- Single and parallel function calls.
- Compositional function calls (chaining).
- Function calling modes: `auto`, `any`, `none`.
- Multi-tool / native tool use.
- Remote MCP servers.
- Structured output schemas.

Best-practice from Google: if you need the model to emit structured notes before a tool call, wrap them in a dedicated `update()` function rather than raw XML/markdown, avoiding `Malformed_Function_Call` errors.[6]

---

## 3. Productivity Software Handlers

### 3.1 Word / DOCX

- **Anthropic Claude:** Claude can create `.docx` and `.pdf` files inside its sandboxed computing environment using Python libraries, and the user downloads the result.[12]
- **OpenAI ChatGPT Work:** Generates editable Word docs, converts docs to presentations, extracts PDF tables into spreadsheets.[5]
- **Local stack:** `python-docx` for creating/editing DOCX; `docx2pdf` for PDF conversion on Windows/macOS (requires Word installed); `pypandoc` / `weasyprint` for cross-platform markdown→DOCX/PDF; `reportlab`/`platypus` for precise PDF layout.

### 3.2 Excel / Sheets

- **OpenAI ChatGPT:** edits `.xlsx` directly, scored 45.5% on SpreadsheetBench vs Copilot in Excel at 20.0%.[13]
- **Google Gemini in Sheets:** creates tables, formulas, pivot tables, conditional formatting, dropdowns, charts, and can summarize Drive/Gmail data inline.[8][9]
- **Local stack:** `openpyxl` / `xlsxwriter` for Excel; Google Sheets API via `gws` / `google-api-python-client`; for pure Python sheets, `pandas` + `openpyxl`. For report-style PDFs, `reportlab`.

### 3.3 Google Docs / Slides / Workspace

- **Google Apps Script + Gemini:** functions declared as tools can create calendar events, draft Gmail, build skeleton decks, and write Docs.[7]
- **Gemini in Docs/Slides/Drive:** side-panel AI that writes content, summarizes files, generates images, and exports responses to Docs.[9]
- **Local stack:** Google Workspace skill (`google-workspace`) wrapping Gmail/Calendar/Drive/Sheets/Docs APIs; Obsidian vault sync for markdown-first notes; `python-pptx` for PowerPoint generation.

### 3.4 Markdown as the Lingua Franca

All three platforms ultimately move data through structured text. A robust local agent should treat **markdown** as the canonical intermediate format and render it to DOCX/PPTX/XLSX/PDF on demand. This mirrors GPT Researcher's design: deep research → markdown → PDF/DOCX/PPT exports.[14]

---

## 4. Creative & Analytical Automation Skills

### 4.1 Multi-Step Research & Synthesis

OpenAI's **Deep Research** and **ChatGPT Work** combine web browsing, text extraction, code execution, and long-context reasoning to produce reports, slide decks, and analyses.[5][13] GPT Researcher does the same with open-source multi-agent orchestration: planner → researcher → editor → publisher, outputting markdown, PDF, DOCX, and PPTX.[14]

Pattern to copy:

1. **Planner** breaks the task into sub-questions.
2. **Researcher** calls web/file/search tools in parallel.
3. **Curator/editor** filters and structures findings.
4. **Publisher** renders the final artifact into the desired format.

### 4.2 Data Transformation

- **Code execution environments** let the model run Python/JS to filter, join, aggregate, and visualize data before returning concise results.[10][12]
- **Structured outputs** (OpenAI `strict`, Gemini schema, Claude tool schemas) enforce typed intermediates so downstream code can reliably parse results.[11]
- **State persistence** via workspace files lets agents resume tasks and build reusable skills.[10]

### 4.3 Persistent & Scheduled Execution

- **ChatGPT Work** supports scheduled tasks that monitor apps and produce recurring deliverables.[5]
- **Workspace agents** can act across connected enterprise apps with RBAC and audit logging.[15]
- **Local equivalent:** Hermes cron jobs with tool-restricted subagents, writing to a per-project workspace and notifying via Discord/webhook.

### 4.4 Enterprise Reliability

The DuMateBench paper (2026) evaluated agents on real-world workflows spanning document reading, editing, file organization, coding, and web retrieval under insufficient, unstable, and noisy conditions. It found that both the LLM capability and the surrounding agent framework jointly determine robustness.[16]

Implication: don't rely on the model alone; invest in:

- deterministic verification,
- retry/backoff logic,
- sandboxed execution,
- human-in-the-loop approval gates,
- structured logging and replay.

---

## 5. Recommended Stack for an Autonomous Agent

To mirror Claude / ChatGPT Work / Gemini Workspace locally, equip your agent with the following layers.

### 5.1 Core Runtime

| Component | Purpose | Tool/Library |
|---|---|---|
| LLM router | Switch models/providers; fail over on rate limits | OpenRouter, Ollama, custom endpoint manager |
| Tool registry | JSON-schema definitions + execution dispatch | Hermes skills, MCP servers, FastAPI routes |
| Agent loop | Plan → call tools → observe → decide | Custom loop or LangGraph/CrewAI-style orchestrator |
| Sandbox | Run untrusted code/files safely | Docker per-engagement, gVisor, or systemd-nspawn |
| State store | Per-project files, creds, notes, timeline | SQLite/SQLCipher + markdown workspace |
| Memory | Long-term facts across sessions | Hermes memory + optional vector DB (Chroma, Milvus) |

### 5.2 Document & Productivity Tools

| Output | Recommended Library |
|---|---|
| DOCX | `python-docx` |
| XLSX | `openpyxl`, `xlsxwriter`, `pandas` |
| PPTX | `python-pptx` |
| PDF | `reportlab`, `weasyprint`, `pypandoc` |
| Markdown→DOCX/PDF | `pandoc` + `weasyprint` |
| DOCX→PDF (Win/Mac only) | `docx2pdf` |
| Google Workspace | `google-workspace` skill / `google-api-python-client` |
| Microsoft 365 | Microsoft Graph API |

### 5.3 Creative / Analytical Skills

| Skill | Implementation |
|---|---|
| Deep research | Multi-agent planner/researcher/editor/publisher + web search + grounding citations |
| Code execution | `execute_code` / Jupyter kernel / Docker sandbox |
| Structured extraction | Pydantic schemas + `strict`/structured-output modes |
| Report generation | Markdown templates → DOCX/PDF/PPTX |
| Data visualization | Matplotlib/Plotly → PNG/SVG embedded in documents |
| Scheduling | Hermes cron with project-specific prompts |
| Browser automation | `browser_exec`, `computer_use`, or Playwright in sandbox |
| MCP ecosystem | Host local MCP servers for GitHub, filesystem, Postgres, etc. |

### 5.4 Security & Control Layer

- **Approval gate** before destructive actions (send email, delete file, modify calendar).[17]
- **YOLO mode per engagement** with sandboxing and full audit logging (matches user request in memory).
- **Network egress controls** matching Claude Enterprise: off / package managers only / allowlisted domains / all domains.[12]
- **PII tokenization / redaction** before data enters the LLM context when desired.[10]

---

## 6. How the Big Three Map to Your Requirements

| Requirement | Anthropic Claude | OpenAI ChatGPT Work | Google Gemini | Local Equivalent |
|---|---|---|---|---|
| Generate Word/DOCX reports | Sandbox Python + python-docx[12] | ChatGPT Work creates .docx[5] | Gemini in Docs / Apps Script[7] | `python-docx` + `pandoc` |
| Edit Excel/Sheets | Code execution on .xlsx | SpreadsheetBench-grade edits[13] | Gemini in Sheets formulas[8] | `openpyxl` / Sheets API |
| Read Gmail/Calendar | MCP server / connector | ChatGPT connectors[5] | Workspace tools via Apps Script[7] | `google-workspace` skill |
| Persistent task execution | Claude Cowork / projects | Scheduled Tasks[5] | N/A via API (custom cron) | Hermes cron + subagents |
| Tool discovery at scale | MCP + `search_tools` / code mode[10] | Tool search (GPT-5.4+)[4] | Multi-tool / MCP[6] | Lazy-load tool registry |
| Sandboxed execution | Anthropic sandbox[12] | Codex/ChatGPT sandbox[5] | Apps Script sandbox | Docker per-engagement |

---

## Sources

[1] Anthropic, "Tool use with Claude — Claude Platform Docs," https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview
[2] Model Context Protocol, "Specification — What is MCP," https://modelcontextprotocol.io/specification/2025-11-25
[3] OpenAI, "Function calling," https://developers.openai.com/api/docs/guides/function-calling
[4] OpenAI API docs, "Tools" section, https://developers.openai.com/api/docs/guides/tools
[5] OpenAI, "ChatGPT is now a partner for your most ambitious work," https://openai.com/index/chatgpt-for-your-most-ambitious-work/
[6] Google AI for Developers, "Function calling with the Gemini API," https://ai.google.dev/gemini-api/docs/function-calling
[7] Google Codelabs, "Automate Google Workspace tasks with the Gemini API," https://codelabs.developers.google.com/codelabs/gemini-workspace
[8] Google Workspace, "Gemini in Google Sheets," https://workspace.google.com/resources/spreadsheet-ai/
[9] Google Docs Editors Help, "Collaborate with Gemini in Google Sheets," https://support.google.com/docs/answer/14356410?hl=en
[10] Anthropic Engineering, "Code execution with MCP: building more efficient agents," https://www.anthropic.com/engineering/code-execution-with-mcp
[11] OpenAI, "Structured model outputs," https://developers.openai.com/api/docs/guides/structured-outputs
[12] Anthropic Help Center, "Create and edit files with Claude," https://support.claude.com/en/articles/12111783-create-and-edit-files-with-claude
[13] OpenAI, "Introducing ChatGPT agent: bridging research and action," https://openai.com/index/introducing-chatgpt-agent/
[14] Assaf Elovic, "GPT Researcher" (GitHub), https://github.com/assafelovic/gpt-researcher
[15] OpenAI Help Center, "ChatGPT agent," https://help.openai.com/en/articles/11752874-chatgpt-agent
[16] Z. Niu et al., "DuMateBench: Evaluating Autonomous Agents in Complex Real-World Workflows," arXiv:2608.26546v1, 2026. https://arxiv.org/html/2608.26546v1
[17] Anthropic, "Writing effective tools for AI agents — using AI agents," https://www.anthropic.com/engineering/writing-tools-for-agents

---

## Actionable Next Steps

1. **Lock the intermediate format:** choose Markdown + frontmatter as the canonical research/report artifact; render to DOCX/PDF/PPTX only at delivery time.
2. **Build the document toolchain:** add `python-docx`, `python-pptx`, `openpyxl`, `reportlab`, and `pypandoc` to the project; verify with a sample report render.
3. **Wire structured output everywhere:** use Pydantic models and `strict`/schema modes so downstream code can rely on typed data.
4. **Implement lazy tool loading:** do not dump all tool schemas into context; expose a `search_tools` or filesystem-based discovery mechanism.
5. **Add a sandboxed code-execution path:** a per-engagement Docker container that the agent can write code into and call tools from, following Anthropic's code-mode pattern.
6. **Connect Google Workspace via the existing skill** for email/calendar/sheets/docs actions with human approval.
7. **Schedule recurring agents** with Hermes cron for monitoring/inbox/research tasks.
8. **Track everything:** per-engagement directory, timeline log, encrypted cred store, and artifact manifest.
