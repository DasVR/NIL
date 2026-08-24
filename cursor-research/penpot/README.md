# Penpot — NIL Workspace Design System

Local Penpot design source for the NIL desktop app wireframes.

## Quick start

```bash
# Requires Docker with working host networking (used when bridge L2 is broken)
cd cursor-research/penpot
docker compose -f docker-compose.host.yaml up -d

# Frontend listens on :8080; bridge to the documented :9001
socat TCP-LISTEN:9001,fork,reuseaddr TCP:127.0.0.1:8080 &

# Open
open http://localhost:9001
```

Create a demo account from the login screen (“Create demo account”), or:

```bash
curl -s -c /tmp/penpot.cookies -X POST http://localhost:9001/api/rpc/command/create-demo-profile \
  -H 'content-type: application/transit+json' -d '["^ "]'
# then login-with-password using the returned email/password
```

## Design file

**NIL Workspace Design System** (created in the Default team)

Page `02 Layouts` boards:

| Board | Source |
|-------|--------|
| 00 Tokens | `wireframes/00-tokens.svg` |
| 01 Components | `wireframes/01-components.svg` |
| 02 Main Window | `wireframes/02-main-window.svg` |
| 02 Empty State | `wireframes/02-empty-state.svg` |
| 02 Command Palette | `wireframes/02-command-palette.svg` |
| 03 Flows | `wireframes/03-flows.svg` |
| NIL Wordmark / Icon | `cursor-research/logo/nil-*.png` |

Workspace URL pattern:

`http://localhost:9001/#/workspace/<team-id>/<file-id>`

## Regenerate wireframes

```bash
cd cursor-research/penpot/wireframes
python3 generate_wireframes.py
# optional PNG previews
for f in *.svg; do rsvg-convert -w 1440 "$f" -o "${f%.svg}.png"; done
```

Then re-import PNGs in Penpot (Assets → import) or re-run the upload/`update-file` flow.

## Brand + research grounding

- Logo: NIL wordmark (violet) + coral cursor dash — `cursor-research/logo/`
- Tokens / pages: `cursor-research/PENPOT-SETUP.md`
- IA: agent conversation as primary surface — `cursor-research/redesign/MASTER-REDESIGN.md`
- Density / glass / springs — `cursor-research/redesign/DESIGN-TOKENS.md`

Accent model: **violet** = brand / primary actions · **coral** = single attention object (pending approval) · **phosphor green** = live machine status · **abyss** work surface.

## Compose notes

- `docker-compose.yaml` — upstream Penpot bridge-network stack (port 9001).
- `docker-compose.host.yaml` — host-network variant for environments where container↔container bridge traffic fails.
