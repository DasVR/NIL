---
name: finn-hunt
description: How a Finn engagement actually runs — modes, the approval gate, recon sequencing with the shipped plugins, and the finding format. Use when changing hunt/exploit/chat/code/report behavior, prompts, the approval flow, or how findings are written.
---

# Running an engagement

Authorized testing only. Every workflow here assumes a signed scope; the backend treats
authorization as already verified and the operator as a professional. Hunt is recon.
Exploit confirms in-scope findings. Neither is a C2 kit, persistence drop, or credential
stuffing pipeline.

## Modes

Five modes, defined in `finn_pentest/ai/prompts.py` and overridable per install from the
`prompts/` directory. Static prefix is `base` + `security_authorization` + `finding_quality`
+ mode. Hunt also loads `scan_methodology`. Hunt and exploit load `plugin_recipes`.
`hunt` and `exploit` share the propose → wait → continue loop (`LOOP_MODES`).

| Mode | Job |
|---|---|
| `hunt` | The assessment loop: analyze state, propose the single next recon command, wait for output, repeat |
| `exploit` | Confirm one in-scope finding at a time with a working PoC, then emit a finding card |
| `chat` | Answer security questions with mechanics, detection, and prevention |
| `code` | Write assessment scripts and parsers — not exploit kits |
| `report` | Turn findings into report sections |

`hunt` proposes one command (or a small batch) and stops for approval. If it proposes work,
it emits a fenced bash block — it does not ask in prose. It does not dump flag
encyclopedias; after each result it summarizes the new services, then proposes the next
step.

`exploit` proposes one confirmation command and stops for approval. After proof it writes
a finding card whose evidence points at the block it came from. It does not dump exploit
encyclopedias, chain unproven steps, or invent CVSS.

## Approval gate

The gate is the default. YOLO is a choice, not a requirement — including in exploit.

- Default: Finn proposes a command, it appears as a pending block, the operator approves,
  edits, or rejects. Approve is `Cmd+Enter`, reject is `Cmd+Shift+Enter`.
- YOLO (`Cmd+Y`, per engagement): auto-runs, still sandboxed, still logged, still creates a
  block. Dangerous plugins still warn.

A pending block is the one attention object on screen. Do not add a competing pulse.

## Recon sequencing

The shipped plugins form a recon chain. Finn should walk it, not fire everything at once.

```
nmap (discover hosts + open ports)
  → httpx (which ports actually speak HTTP, titles, tech)
    → whatweb (fingerprint the stack)
    → sslscan (TLS config on 443)
    → nuclei (template-based vuln checks on the live URLs)
    → nikto (classic web misconfig pass)
    → ffuf / gobuster (content + path discovery on confirmed web services)
subfinder (passive subdomains when the target is a domain, not an IP)
```

Match the tool to the target shape: `nmap` takes IPs/CIDRs, the HTTP tools take hosts or
URLs. Plugin `validate_target` enforces this. To add a scanner, see the `finn-plugins`
skill. Nuclei and nikto hits are leads until confirmed.

## Doom-loop

Identical consecutive commands warn at 3 and halt at 5 (`finn_pentest/ai/doom_loop.py`).
The halt does not enqueue that command. YOLO does not bypass it.

## Findings

A finding is an answer card, not a markdown dump. The card in
`frontend/src/lib/components/ui/FindingCard.svelte` and the parser in `frontend/src/lib/agent/types.ts`
expect this shape:

```markdown
# <title>
**CVSS**: <score or n/a>
**Status**: lead | confirmed | ruled_out
**Date**: <iso date>

## Description
Why it matters, in prose.

## Evidence
Command output, request/response, loot references. Point at the block it came from.

## Remediation
How to fix it, in prose.
```

Status is `lead` until proven. Color (`--sev-*`) is only for **confirmed** severity.
Leads stay greyscale. Never invent CVSS; the card shows `n/a` when there is no score.

`Explain` and `Draft` on a card summon the Finn column with the finding as context — they
never navigate to a chat page.
