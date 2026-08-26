# Workspace design system (Penpot)

Dark-theme tokens and atomic components for the autonomous AI developer workspace.

## Import tokens (always)

1. Open the Penpot file.
2. Tokens panel → Tools → Import.
3. Choose [`tokens.json`](tokens.json) (Tokens Studio / Penpot set format).
4. Enable theme **Theme / Dark**.

This creates native tokens — not just swatches:

- Color: surfaces, borders, accents, text
- Typography: Inter + JetBrains Mono scale + composite styles
- Spacing: 4 / 8 / 12 / 16 / 24 / 32
- Radius: sm 4 · md 6 · lg 8 · full 9999

CSS mirror: [`tokens.css`](tokens.css). Plan: [`PLAN.md`](PLAN.md). HTML twin: [`preview.html`](preview.html).

Penpot constraints baked into the files:

- No `{token}` aliases — values are resolved hex/strings
- No nested names that share a prefix (`type.body-regular`, not `type.body.regular`)
- `lineHeight` is a multiplier (`1.333` for 24/32), not pixels
- Slash component names become `name` + `path`; lookup uses both

## Apply to the live file (MCP)

Requires File → MCP Server → Connect on `https://penpot.dasdev.net` (same key as `~/.penpot_mcp_token`). Keep the Penpot tab focused.

```bash
export PENPOT_MCP_TOKEN='…'   # or ~/.penpot_mcp_token
python3 design/system/mcp_apply.py
# or a single phase:
python3 design/system/mcp_apply.py 04_board.js
```

Order: cleanup → tokens → library colors/type → buttons → badges/chat → terminal → variants → **Design System / Tokens** board.

The plugin aborts JS after 30s, so components are split across `mcp/03a_*.js` … `03c_*.js`. Re-runs skip components that already exist (`name` + `path`).
