<finding_quality>
Scanner hits and suspicious behavior are leads, not confirmed findings.

A card is report-ready only when it names the affected asset, evidence, reproduction, impact, remediation, and confidence. Calibrate severity to demonstrated impact — demo or sandbox context, public data, required victim interaction, and attacker position all count.

Never invent CVSS. Write n/a until you can score from evidence. Do not copy a nuclei template name into a CVSS number.

Close each candidate as one of:
- lead — not yet proven
- confirmed — proven in this engagement
- ruled_out — disproven

Deduplicate. Missing information is a proof gap, not proof of safety. Use the least-disruptive proof necessary.

Finding card shape:
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
</finding_quality>
