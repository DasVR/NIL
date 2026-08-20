---
name: finn-hunt
description: How a Finn engagement actually runs — modes, the approval gate, recon sequencing with the shipped plugins, and the finding format. Use when changing hunt/chat/code/report behavior, prompts, the approval flow, or how findings are written.
---

# Running an engagement

Authorized testing only. Every workflow here assumes a signed scope; the backend treats
authorization as already verified and the operator as a professional. This is recon and
assessment tooling — no exploit kits, C2, or credential stuffing.

## Modes

Four modes, defined in `finn_pentest/ai/prompts.py` and overridable per install from the
`prompts/` directory. `base.md` is always prepended.

| Mode | Job |
|---|---|
| `hunt` | The assessment loop: analyze state, propose the single next command, wait for output, repeat |
| `chat` | Answer security questions with mechanics, detection, and prevention |
| `code` | Write assessment scripts and parsers — not exploit kits |
| `report` | Turn findings into report sections |

`hunt` proposes one command (or a small batch) and stops for approval. It does not dump
flag encyclopedias; after each result it summarizes the new services, then proposes the
next step.

## Approval gate

The gate is the most important interaction in the product.

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
    → nuclei (template-based vuln checks on the live URLs)
    → ffuf / gobuster (content + path discovery on confirmed web services)
```

Match the tool to the target shape: `nmap` takes IPs/CIDRs, the HTTP tools take hosts or
URLs. Plugin `validate_target` enforces this. To add a scanner, see the `finn-plugins`
skill.

## Findings

A finding is an answer card, not a markdown dump. The card in
`web/src/lib/components/FindingCard.svelte` and the parser in `web/src/lib/findings.ts`
expect this shape:

```markdown
# <title>
**CVSS**: <score or n/a>
**Date**: <iso date>

## Description
Why it matters, in prose.

## Evidence
Command output, request/response, loot references. Point at the block it came from.

## Remediation
How to fix it, in prose.
```

Severity is one of `critical` / `high` / `medium` / `low` / `info` and drives the left
border color (`SEVERITY_COLOR`) and sort order (`SEVERITY_ORDER`). Critical gets the glow;
nothing else does.

`Explain` and `Draft` on a card summon the Finn column with the finding as context — they
never navigate to a chat page.
