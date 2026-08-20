#!/usr/bin/env python3
"""Finn Setup — standalone installer with a progress-bar wizard.

Double-click Finn Setup.app (macOS), Finn-Setup.exe (Windows NSIS), or run:
  python3 install/wizard.py
  python3 install/wizard.py --cli --user --offline --host
  bash install/unix/install.sh --user --offline --host
"""

from __future__ import annotations

import argparse
import os
import subprocess
import sys
import threading
import traceback
from pathlib import Path

HERE = Path(__file__).resolve().parent
if str(HERE) not in sys.path:
    sys.path.insert(0, str(HERE))

from engine import DOCKER_TOS, SETUP_VERSION, find_api_src, find_macos_app, find_wheel, launch_app, run_install  # noqa: E402
from palette import COLOR  # noqa: E402
from catalog import launch_lines, welcome_line  # noqa: E402


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    p = argparse.ArgumentParser(description="Finn Setup")
    p.add_argument("--cli", action="store_true", help="Headless install (no window)")
    p.add_argument("--user", dest="privilege", action="store_const", const="user")
    p.add_argument("--admin", dest="privilege", action="store_const", const="admin")
    p.add_argument("--online", dest="channel", action="store_const", const="online")
    p.add_argument("--offline", dest="channel", action="store_const", const="offline")
    p.add_argument("--host", dest="sandbox", action="store_const", const="host")
    p.add_argument("--docker", dest="sandbox", action="store_const", const="docker")
    p.add_argument("--accept-docker-tos", action="store_true")
    p.add_argument("--print-docker-tos", action="store_true")
    p.add_argument("--from-source", action="store_true")
    p.add_argument("--tag", default="latest")
    p.set_defaults(privilege="user", channel="online", sandbox="host")
    return p.parse_args(argv)


def cli_main(args: argparse.Namespace) -> int:
    if args.print_docker_tos:
        print(DOCKER_TOS)
        return 0

    def progress(pct: int, msg: str) -> None:
        print(f"[{pct:3d}%] {msg}", flush=True)

    result = run_install(
        privilege=args.privilege,
        channel=args.channel,
        sandbox=args.sandbox,
        accept_tos=args.accept_docker_tos,
        tag=args.tag,
        from_source=args.from_source,
        start=HERE,
        progress=progress,
    )
    print("Done.")
    for key, value in result.items():
        if value:
            print(f"  {key}: {value}")
    if args.privilege == "admin":
        print("Launch Finn as a normal user after this install.")
    return 0


def _bring_to_front(root: object) -> None:
    """Finder-launched Tk on macOS often maps a blank window behind everything."""
    root.update_idletasks()
    root.deiconify()
    root.lift()
    try:
        root.attributes("-topmost", True)
        root.after(500, lambda: root.attributes("-topmost", False))
    except Exception:
        pass
    root.focus_force()
    if sys.platform != "darwin":
        return
    try:
        subprocess.Popen(
            [
                "osascript",
                "-e",
                f'tell application "System Events" to set frontmost of every process whose unix id is {os.getpid()} to true',
            ],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
    except OSError:
        pass


def gui_main(args: argparse.Namespace) -> int:
    try:
        import tkinter as tk
        from tkinter import ttk, messagebox
    except ImportError:
        print(
            "Finn Setup needs Tk (the windowed installer).\n"
            "macOS Homebrew:  brew install python-tk\n"
            "Or run headless: python3 install/wizard.py --cli --user --offline --host",
            file=sys.stderr,
        )
        return cli_main(args)

    # Native Aqua radio/check controls paint system chrome and Tk text at once
    # if you set fg/bg. Hidden pages stacked with pack_forget also leak
    # scrollbars. Canvas text + one raised page avoid both. All install
    # choices live on the first page so the zip Setup.app actually shows them.

    abyss, panel, green, text, dim, border = (
        COLOR["abyss"],
        COLOR["abyss_3"],
        COLOR["green"],
        COLOR["text"],
        COLOR["text_dim"],
        COLOR["abyss_4"],
    )
    on_green = COLOR["abyss"]
    ui_font, ui_bold, ui_small, mono = ("Helvetica", 13), ("Helvetica", 13, "bold"), ("Helvetica", 11), ("Menlo", 11)

    root = tk.Tk()
    root.title(f"Finn Setup {SETUP_VERSION}")
    root.geometry("720x720")
    root.minsize(640, 560)
    root.configure(bg=abyss)

    privilege = tk.StringVar(value=args.privilege)
    channel = tk.StringVar(
        value="offline" if find_api_src(HERE) or find_macos_app(HERE) or find_wheel(HERE) else args.channel
    )
    sandbox = tk.StringVar(value=args.sandbox)
    accept = tk.BooleanVar(value=False)
    step = tk.IntVar(value=0)
    status = tk.StringVar(value="Ready to install Finn.")
    percent = tk.IntVar(value=0)

    style = ttk.Style()
    try:
        style.theme_use("clam")
    except tk.TclError:
        pass
    style.configure("Green.Horizontal.TProgressbar", troughcolor=panel, background=green, bordercolor=border, thickness=10)

    shell = tk.Frame(root, bg=abyss, padx=28, pady=18, highlightthickness=0, bd=0)
    shell.pack(fill=tk.BOTH, expand=True)

    def banner(parent: tk.Misc, line: str, fill: str, font: tuple, height: int) -> None:
        canvas = tk.Canvas(parent, bg=abyss, highlightthickness=0, bd=0, height=height)
        canvas.pack(anchor="w", fill=tk.X)
        canvas.create_text(0, height // 2, text=line, fill=fill, anchor="w", font=font)

    banner(shell, "WELCOME", green, ("Helvetica", 10), 18)
    banner(shell, "Finn Setup", text, ("Helvetica", 22, "bold"), 36)
    banner(
        shell,
        "Welcome era: who installs, where files come from, how tools run — then Install.",
        dim,
        ui_small,
        22,
    )

    stage = tk.Frame(shell, bg=abyss, highlightthickness=0, bd=0)
    stage.pack(fill=tk.BOTH, expand=True, pady=(12, 0))
    stage.grid_rowconfigure(0, weight=1)
    stage.grid_columnconfigure(0, weight=1)

    cards: list[dict] = []

    def refresh_cards() -> None:
        for item in cards:
            selected = item["variable"].get() == item["value"]
            item["frame"].configure(
                highlightbackground=green if selected else border,
                highlightthickness=2 if selected else 1,
            )
            item["canvas"].itemconfigure(
                "mark",
                fill=green if selected else panel,
                outline=green if selected else dim,
            )

    def option_card(parent: tk.Misc, title: str, blurb: str, variable: tk.StringVar, value: str) -> tk.Frame:
        frame = tk.Frame(parent, bg=panel, highlightbackground=border, highlightthickness=1, cursor="hand2", bd=0)
        canvas = tk.Canvas(frame, bg=panel, highlightthickness=0, bd=0, height=56)
        canvas.pack(fill=tk.X, padx=10, pady=6)
        canvas.create_oval(6, 20, 22, 36, outline=dim, width=2, fill=panel, tags="mark")
        canvas.create_text(34, 18, text=title, fill=text, anchor="w", font=ui_bold, tags="title")
        canvas.create_text(34, 40, text=blurb, fill=dim, anchor="w", font=ui_small, width=620, tags="blurb")

        def pick(_event: object | None = None) -> None:
            variable.set(value)
            refresh_cards()
            if variable is sandbox:
                sync_tos()

        frame.bind("<Button-1>", pick)
        canvas.bind("<Button-1>", pick)
        cards.append({"frame": frame, "canvas": canvas, "variable": variable, "value": value})
        return frame

    def heading(parent: tk.Misc, line: str) -> None:
        canvas = tk.Canvas(parent, bg=abyss, highlightthickness=0, bd=0, height=24)
        canvas.pack(anchor="w", fill=tk.X, pady=(10, 4))
        canvas.create_text(0, 12, text=line, fill=text, anchor="w", font=ui_bold)

    def accept_row(parent: tk.Misc) -> tuple[tk.Frame, tk.Canvas]:
        frame = tk.Frame(parent, bg=abyss, cursor="hand2", highlightthickness=0, bd=0)
        box = tk.Canvas(frame, width=18, height=18, bg=abyss, highlightthickness=0, bd=0)
        box.pack(side=tk.LEFT, padx=(0, 8))
        box.create_rectangle(2, 2, 16, 16, outline=dim, width=2, fill=abyss, tags="mark")
        label = tk.Canvas(frame, bg=abyss, highlightthickness=0, bd=0, height=20, width=420)
        label.pack(side=tk.LEFT, fill=tk.X, expand=True)
        label.create_text(0, 10, text="I accept the Docker sandbox terms", fill=text, anchor="w", font=ui_font)

        def toggle(_event: object | None = None) -> None:
            accept.set(not accept.get())
            box.itemconfigure("mark", fill=green if accept.get() else abyss, outline=green if accept.get() else dim)

        for widget in (frame, box, label):
            widget.bind("<Button-1>", toggle)
        return frame, box

    pages: list[tk.Frame] = []

    def page() -> tk.Frame:
        frame = tk.Frame(stage, bg=abyss, highlightthickness=0, bd=0)
        frame.grid(row=0, column=0, sticky="nsew")
        pages.append(frame)
        return frame

    p0 = page()
    options_host = tk.Frame(p0, bg=abyss, highlightthickness=0, bd=0)
    options_host.pack(fill=tk.BOTH, expand=True)
    options_canvas = tk.Canvas(options_host, bg=abyss, highlightthickness=0, bd=0)
    options_scroll = tk.Scrollbar(options_host, command=options_canvas.yview)
    options_inner = tk.Frame(options_canvas, bg=abyss, highlightthickness=0, bd=0)
    options_inner.bind(
        "<Configure>",
        lambda _e: options_canvas.configure(scrollregion=options_canvas.bbox("all")),
    )
    options_window = options_canvas.create_window((0, 0), window=options_inner, anchor="nw")
    options_canvas.configure(yscrollcommand=options_scroll.set)

    def _stretch_options(_event: object | None = None) -> None:
        options_canvas.itemconfigure(options_window, width=options_canvas.winfo_width())

    options_canvas.bind("<Configure>", _stretch_options)
    options_canvas.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
    options_scroll.pack(side=tk.RIGHT, fill=tk.Y)

    heading(options_inner, "Who is installing?")
    if sys.platform == "win32":
        option_card(options_inner, "This PC, this user", "No administrator password. Files under your user folder.", privilege, "user").pack(fill=tk.X, pady=4)
        option_card(options_inner, "This PC, all users", "Program Files. You still open Finn as a normal user afterward.", privilege, "admin").pack(fill=tk.X, pady=4)
    elif sys.platform == "darwin":
        option_card(options_inner, "This Mac, this user", "No administrator password. Files under your home folder, including ~/Applications.", privilege, "user").pack(fill=tk.X, pady=4)
        option_card(options_inner, "This Mac, all users", "System folders. You still open Finn as a normal user afterward.", privilege, "admin").pack(fill=tk.X, pady=4)
    else:
        option_card(options_inner, "This computer, this user", "No administrator password. Files under your home folder.", privilege, "user").pack(fill=tk.X, pady=4)
        option_card(options_inner, "This computer, all users", "System folders. You still open Finn as a normal user afterward.", privilege, "admin").pack(fill=tk.X, pady=4)

    heading(options_inner, "Where do the files come from?")
    option_card(options_inner, "This folder (offline)", "Use the .app, API, and wheel next to this installer. No GitHub.", channel, "offline").pack(fill=tk.X, pady=4)
    option_card(options_inner, "Download (online)", "Fetch the matching GitHub release with curl.", channel, "online").pack(fill=tk.X, pady=4)

    heading(options_inner, "How should tools run?")
    option_card(options_inner, "Host sandbox", "Approved commands run in a per-Space folder. No Docker daemon.", sandbox, "host").pack(fill=tk.X, pady=4)
    option_card(options_inner, "Docker sandbox", "Per-engagement container. Admin install. Requires the terms below.", sandbox, "docker").pack(fill=tk.X, pady=4)
    tos_wrap = tk.Frame(options_inner, bg=panel, highlightbackground=border, highlightthickness=1, bd=0)
    tos_scroll = tk.Scrollbar(tos_wrap)
    tos = tk.Text(
        tos_wrap,
        height=7,
        bg=panel,
        fg=dim,
        wrap=tk.WORD,
        relief=tk.FLAT,
        bd=0,
        font=mono,
        highlightthickness=0,
        yscrollcommand=tos_scroll.set,
        padx=10,
        pady=8,
        insertbackground=text,
    )
    tos_scroll.configure(command=tos.yview)
    tos_scroll.pack(side=tk.RIGHT, fill=tk.Y)
    tos.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
    tos.insert("1.0", DOCKER_TOS)
    tos.configure(state=tk.DISABLED)
    accept_ui, _unused_accept_box = accept_row(options_inner)

    def sync_tos() -> None:
        if sandbox.get() == "docker":
            tos_wrap.pack(fill=tk.BOTH, expand=True, pady=(10, 6))
            accept_ui.pack(anchor="w", pady=(0, 8))
        else:
            tos_wrap.pack_forget()
            accept_ui.pack_forget()

    p1 = page()
    banner(p1, "Installing…", text, ui_bold, 28)
    ttk.Progressbar(p1, maximum=100, variable=percent, style="Green.Horizontal.TProgressbar").pack(fill=tk.X, pady=12, ipady=2)
    status_canvas = tk.Canvas(p1, bg=abyss, highlightthickness=0, bd=0, height=28)
    status_canvas.pack(fill=tk.X)
    status_item = status_canvas.create_text(0, 14, text=status.get(), fill=dim, anchor="w", font=ui_small)

    def _sync_status(*_args: object) -> None:
        status_canvas.itemconfigure(status_item, text=status.get())

    status.trace_add("write", _sync_status)
    log_wrap = tk.Frame(p1, bg=panel, highlightbackground=border, highlightthickness=1, bd=0)
    log_wrap.pack(fill=tk.BOTH, expand=True, pady=(12, 0))
    log_scroll = tk.Scrollbar(log_wrap)
    log = tk.Text(
        log_wrap,
        height=12,
        bg=panel,
        fg=text,
        wrap=tk.WORD,
        relief=tk.FLAT,
        bd=0,
        font=mono,
        highlightthickness=0,
        yscrollcommand=log_scroll.set,
        padx=10,
        pady=8,
        state=tk.DISABLED,
        insertbackground=text,
    )
    log_scroll.configure(command=log.yview)
    log_scroll.pack(side=tk.RIGHT, fill=tk.Y)
    log.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)

    p2 = page()
    done_canvas = tk.Canvas(p2, bg=abyss, highlightthickness=0, bd=0, height=40)
    done_canvas.pack(anchor="w", fill=tk.X, pady=(8, 10))
    done_canvas.create_text(0, 20, text=welcome_line(), fill=green, anchor="w", font=("Helvetica", 18, "bold"))
    done_detail = tk.Text(
        p2,
        height=8,
        bg=abyss,
        fg=dim,
        wrap=tk.WORD,
        relief=tk.FLAT,
        bd=0,
        font=ui_font,
        highlightthickness=0,
        padx=0,
        pady=0,
        state=tk.DISABLED,
    )
    done_detail.pack(anchor="w", fill=tk.BOTH, expand=True)

    footer = tk.Frame(shell, bg=abyss, highlightthickness=0, bd=0)
    footer.pack(fill=tk.X, pady=(16, 0))
    step_canvas = tk.Canvas(footer, bg=abyss, highlightthickness=0, bd=0, height=22, width=120)
    step_canvas.pack(side=tk.LEFT)
    step_item = step_canvas.create_text(0, 11, text="Options", fill=dim, anchor="w", font=ui_small)
    result_app = {"path": ""}

    def show_step() -> None:
        idx = step.get()
        for i, frame in enumerate(pages):
            if i == idx:
                frame.grid()
                frame.tkraise()
            else:
                frame.grid_remove()
        refresh_cards()
        sync_tos()
        labels = {0: "Welcome", 1: "Installing", 2: "Launch"}
        step_canvas.itemconfigure(step_item, text=labels.get(idx, ""))
        if idx == 0:
            next_btn.config(text="Install", state=tk.NORMAL, bg=green, fg=on_green)
            launch_btn.pack_forget()
        elif idx == 1:
            next_btn.config(text="Install", state=tk.DISABLED, bg=panel, fg=dim)
            launch_btn.pack_forget()
        else:
            next_btn.config(text="Install", state=tk.DISABLED, bg=panel, fg=dim)
            launch_btn.pack(side=tk.RIGHT, padx=(0, 8))

    def append_log(line: str) -> None:
        log.configure(state=tk.NORMAL)
        log.insert(tk.END, line + "\n")
        log.see(tk.END)
        log.configure(state=tk.DISABLED)

    def do_install() -> None:
        if sandbox.get() == "docker" and privilege.get() != "admin":
            privilege.set("admin")
            refresh_cards()
        if sandbox.get() == "docker" and not accept.get():
            messagebox.showerror("Finn Setup", "Accept the Docker sandbox terms, or choose Host sandbox.")
            step.set(0)
            show_step()
            return

        step.set(1)
        show_step()
        next_btn.config(state=tk.DISABLED)

        def progress(pct: int, msg: str) -> None:
            def apply() -> None:
                percent.set(pct)
                status.set(msg)
                append_log(f"{pct:3d}%  {msg}")

            root.after(0, apply)

        def work() -> None:
            try:
                result = run_install(
                    privilege=privilege.get(),
                    channel=channel.get(),
                    sandbox=sandbox.get(),
                    accept_tos=accept.get(),
                    tag=args.tag,
                    start=HERE,
                    progress=progress,
                )
                result_app["path"] = result.get("app") or ""

                def done() -> None:
                    lines = [
                        welcome_line(),
                        f"API: {result['prefix']}",
                        f"CLI: {result['wrapper']}",
                    ]
                    if result.get("app"):
                        lines.append(f"App: {result['app']}")
                    else:
                        lines.append("Desktop app: not in this folder — open the kit zip and run Setup from there.")
                    lines.append("The workstation starts the API itself. Launch Finn as a normal user.")
                    lines.extend(launch_lines())
                    done_detail.configure(state=tk.NORMAL)
                    done_detail.delete("1.0", tk.END)
                    done_detail.insert("1.0", "\n".join(lines))
                    done_detail.configure(state=tk.DISABLED)
                    step.set(2)
                    show_step()
                    launch_btn.config(state=tk.NORMAL if result.get("app") else tk.DISABLED)

                root.after(0, done)
            except Exception as exc:
                err = f"{type(exc).__name__}: {exc}"
                detail = traceback.format_exc()

                def fail(message: str = err, tb: str = detail) -> None:
                    status.set(message)
                    append_log(f"ERROR  {message}")
                    append_log(tb)
                    messagebox.showerror("Finn Setup", message)
                    step.set(0)
                    show_step()

                root.after(0, fail)

        threading.Thread(target=work, daemon=True).start()

    launch_btn = tk.Button(
        footer,
        text="Launch Finn",
        command=lambda: launch_app(result_app["path"]),
        bg=panel,
        fg=text,
        relief=tk.FLAT,
        padx=14,
        pady=8,
        font=ui_bold,
        state=tk.DISABLED,
        highlightthickness=0,
        bd=0,
        activebackground=panel,
        activeforeground=text,
    )
    next_btn = tk.Button(
        footer,
        text="Install",
        command=do_install,
        bg=green,
        fg=on_green,
        relief=tk.FLAT,
        padx=18,
        pady=8,
        font=ui_bold,
        highlightthickness=0,
        bd=0,
        activebackground=green,
        activeforeground=on_green,
    )
    next_btn.pack(side=tk.RIGHT)

    refresh_cards()
    show_step()
    root.after(0, lambda: _bring_to_front(root))
    root.mainloop()
    return 0


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    try:
        if args.cli or args.print_docker_tos:
            return cli_main(args)
        return gui_main(args)
    except Exception as exc:
        print(str(exc), file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
