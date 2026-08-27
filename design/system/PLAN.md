# Design System / Tokens — plan

Dark-theme foundation for the autonomous AI developer workspace
(Slack-style chat, live streaming terminal, file tree / diff viewer).

Native Penpot tokens are created first. The board is a labeled inventory
that *uses* those tokens — it is not a substitute for the Tokens panel.

## Token structure

Sets (all active under theme `Theme / Dark`):

| Set | Tokens |
|---|---|
| `Foundation/Color` | `color.surface.0–3`, `color.border.{subtle,active,muted}`, `color.accent.{primary,secondary,success,warning,danger}`, `color.text.{primary,secondary,muted,code,on-accent}` |
| `Foundation/Typography` | `font.sans` / `font.mono`, weights, sizes, line-heights, composite `type.display`, `type.heading`, `type.body-regular`, `type.body-small`, `type.code-block` (hyphens — nested `type.body.regular` is blocked by `type.body`) |
| `Foundation/Spacing` | `space.4` `space.8` `space.12` `space.16` `space.24` `space.32` |
| `Foundation/Radius` | `radius.sm` 4 · `radius.md` 6 · `radius.lg` 8 · `radius.full` 9999 |

Companion **library colors** and **library typographies** mirror the same names so Assets and Tokens stay aligned.

`color.text.on-accent` is resolved `#0D1117` (Penpot rejects `{alias}` values) so filled Primary / Danger labels meet contrast on `#58A6FF` / `#F85149`.

Penpot `lineHeight` is a **multiplier**, not pixels. Composites use `1.333` / `1.429` / `1.385` so Display 24 maps to 32px, not 768px.

## Board layout

One board on the focused page: **Design System / Tokens**, Surface-0, 32px padding, column flex, 32px section gaps.

1. Header — product name + token set index
2. Color — swatch rows (name, hex, role)
3. Type — five specimens
4. Space + radius — scale bars / rounded tiles
5. Buttons — Primary, Secondary, Danger, Icon-only × Default, Hover, Active, Disabled
6. Chat — user bubble (right), agent card (left + avatar + badge), code-block container
7. Status — Idle, Running/Thinking, Passed, Error
8. Terminal — stream log card + file tree item (file / folder, hover, active)

## Components (Assets)

Penpot splits slash names into `name` + `path`. Scripts set them separately so paths do not duplicate (`Button / Primary / Default`, not `Button / Primary / Button / Primary / Default`).

- `Button / {Primary,Secondary,Danger,Icon}` × `Default|Hover|Active|Disabled`
- `Chat` × `UserBubble|AgentCard|CodeBlock`
- `Badge / Status` × `Idle|Running|Passed|Error`
- `Terminal` × `StreamLog`
- `Terminal / FileTreeItem / {File,Folder}` × `Default|Hover|Active`

All use Flex layout. Fills/strokes/type bind to tokens where the API allows.

## Apply order

1. Token sets + theme (do not skip; do not set `set.active = true` or themes disable)
2. Library colors + typographies (`setFont` on library type)
3. Components in batches (plugin 30s limit): buttons → badges/chat → terminal
4. Optional `createVariantFromComponents` per variant × state
5. Inventory board — instances looked up by `name` + `path`
