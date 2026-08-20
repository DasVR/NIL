# Finn — Install, Welcome, Workstation

Living spec for first contact. Information architecture of `/app` stays in
[`UX_REDESIGN.md`](../UX_REDESIGN.md) (v3). This file is the operator journey from
download to the first approved command.

Three eras. One product. Per operating system.

```
Download Finn-Setup for this OS
        │
        ▼
   INSTALL ERA     native wizard (pkg / exe / deb / AppImage)
        │          writes ~/.finn-pentest/runtime.json
        ▼
   WELCOME ERA     first open of Finn — sandbox confirm, first Space
        │          first terminal block: scope loaded · N hosts · ⌘K
        ▼
 WORKSTATION ERA   terminal is home; Finn is a summoned column
```

The in-app sheet is **not a second installer**. Privilege (user vs admin) and
channel (offline vs GitHub) belong only to Finn Setup on disk. After the app is
running, Welcome only asks how tools run, then names the Space.

---

## 1. Install era (native)

Double-click **Finn-Setup**. No Terminal. Source of truth for files, paths, and
first-launch notes: [`install/catalog.json`](../install/catalog.json)
(copied to `web/src/lib/install-catalog.json`).

| OS | Primary file | Also |
|---|---|---|
| macOS 12+ | `Finn-Setup.pkg` | `.dmg`, kit `.zip` (then Finn Setup.app) |
| Windows 10+ | `Finn-Setup.exe` | `.msi` |
| Linux x86_64 | `Finn-Setup.deb` | `.AppImage` (`chmod +x`), `.rpm` |

Do **not** use the Python wheel zip as a Mac installer.

Headless (clone or unzipped kit):

```bash
python3 install/wizard.py --cli --user --offline --host
bash install/unix/install.sh --user --offline --host
powershell -File install/windows/install.ps1 -Cli -User -Offline -HostSandbox
```

Flags: `--user` / `--admin`, `--online` / `--offline`, `--host` / `--docker`
(Docker needs `--accept-docker-tos` and admin).

Tk Setup (macOS zip / `python3 install/wizard.py`) is three pages:

1. **Welcome** — who installs, where files come from, how tools run
2. **Installing** — progress
3. **Launch** — OS-specific next steps, then Launch Finn

NSIS / Apple Installer / Software Center wrap the same engine.

---

## 2. Welcome era (first open)

### Desktop, after a successful native install

`runtime.json` already has `setup_complete: true`. Skip the in-app overlay.
The center pane is the empty Space (Wegonorth-quiet):

- Name
- Scope textarea
- Four template **rows**
- Recent Spaces if any exist

After create, the terminal shows one success block:

```
scope loaded · 3 hosts · press ⌘K to scan
```

Never a chatbot empty state. Never “Ask anything about your scope.”

### Browser `/app`, or a machine with no runtime.json

One glass sheet, two choices:

1. Host sandbox (default) — per-Space folder, no Docker
2. Docker sandbox — admin + terms

Continue writes runtime with `privilege=user`, `channel=offline` (those questions
were for Setup, not for a running app). Then the empty Space form.

Esc peels the sheet and still applies host defaults so the workstation is usable.
Sandbox can change later in Settings → Install.

### TUI

Same shape: Spaces tree | block log | findings. First lines are OS-aware.
`:new <name>` creates a Space. Placeholder is a command prompt, not
“Message the copilot…”.

---

## 3. Workstation era

Unchanged from v3: terminal default, Finn via `⌘J`, palette `⌘K`, approval
gate, YOLO per Space. See `UX_REDESIGN.md`.

---

## 4. Per-OS first launch (short)

**macOS.** Gatekeeper on GitHub files: `fix-gatekeeper.command` or `xattr -cr`,
then Right-click → Open. Local Network is required. Do not run as root.

**Windows.** Start Menu / desktop shortcut named Finn. SmartScreen → Run anyway
is expected on unsigned GitHub builds. WebView2 + bundled Python. Normal user,
not Administrator.

**Linux.** Software Center for `.deb`, or `chmod +x` the AppImage. No root.
GTK/WebKit only for source builds.

---

## 5. What this is not

- Re-asking user vs admin inside `/app`
- A v5 Agents-window homepage (`cursor-research/redesign/MASTER-REDESIGN.md`
  is research; it does not own first-run)
- Emoji empty states, `window.prompt`, or a second settings page
