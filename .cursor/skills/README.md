# .cursor/skills — NIL Workspace Skill Library

This directory contains Cursor `.mdc` skill files that define the NIL design system, architecture, and build standards. Cursor automatically loads these when you reference them in prompts.

## Skill Files

| Skill | Purpose |
|-------|---------|
| `finn-ui/SKILL.md` | NIL workspace UI rules (tokens, density, materials, layout) |
| `nil-design-system/SKILL.md` | Token architecture (primitive → semantic → component) |
| `nil-agent-patterns/SKILL.md` | Agent loop UI patterns (Cursor 3, Claude Code, Warp) |
| `nil-terminal-ui/SKILL.md` | Terminal-first IA (terminal = product, AI strip = Cmd+J) |
| `nil-motion/SKILL.md` | Spring physics, reduced-motion, animation rules |
| `nil-typography/SKILL.md` | Inter (human) vs JetBrains Mono (machine) rules |
| `nil-anti-slop/SKILL.md` | Anti-slop rules from hallmark + bookmarks |
| `nil-components/SKILL.md` | Component primitives spec (bits-ui + our tokens) |
| `nil-reference-workflow/SKILL.md` | Pengsonal reference-first methodology |
| `nil-plugins/SKILL.md` | Plugin system (tool, UI, model, workflow types) |
| `nil-tauri/SKILL.md` | Tauri 2 integration (shell, fs, dialog, shortcuts) |

## How Cursor Uses These

1. **Auto-loaded** — When you prompt "apply NIL skills" or "follow nil-design-system", Cursor reads the relevant `.mdc` files
2. **Explicit reference** — "Read `.cursor/skills/nil-agent-patterns/SKILL.md` and build the agent conversation view"
3. **Rule files** — `.cursor/rules/nil-design-system.mdc` and `.cursor/rules/nil-workspace.mdc` are auto-applied to matching files

## Verification

Before any build, verify skills are present:
```bash
ls -la .cursor/skills/
```

## Adding New Skills

1. Create `.cursor/skills/<name>/SKILL.md` with the skill content
2. Reference it in your prompt
3. Run `npm run check && npm run build` to verify