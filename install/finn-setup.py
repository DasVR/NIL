#!/usr/bin/env python3
"""Finn Setup — standalone installer with a progress-bar wizard.

Double-click Finn Setup.app (macOS), Finn-Setup.exe (Windows NSIS), or run:
  python3 install/finn-setup.py
  python3 install/finn-setup.py --cli --user --offline --host
"""

from __future__ import annotations

import argparse
import sys
import threading
import traceback
from pathlib import Path

HERE = Path(__file__).resolve().parent
if str(HERE) not in sys.path:
    sys.path.insert(0, str(HERE))

from engine import DOCKER_TOS, SETUP_VERSION, find_api_src, find_macos_app, find_wheel, launch_app, run_install  # noqa: E402


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


def gui_main(args: argparse.Namespace) -> int:
    try:
        import tkinter as tk
        from tkinter import ttk, messagebox
    except ImportError:
        print(
            "Finn Setup needs Tk (the windowed installer).\n"
            "macOS Homebrew:  brew install python-tk@3.14\n"
            "Or run headless: python3 install/finn-setup.py --cli --user --offline --host",
            file=sys.stderr,
        )
        return cli_main(args)

    # Native Aqua radio/check controls paint system chrome and Tk text at once
    # if you set fg/bg. Hidden pages stacked with pack_forget also leak
    # scrollbars. Custom cards + one raised page avoid both.

    abyss, panel, green, text, dim, border = "#07090d", "#10141c", "#3dff8a", "#e8edf2", "#8b95a3", "#2a3340"
    ui_font, ui_bold, ui_small, mono = ("Helvetica", 13), ("Helvetica", 13, "bold"), ("Helvetica", 11), ("Menlo", 11)

    root = tk.Tk()
    root.title(f"Finn Setup {SETUP_VERSION}")
    root.geometry("720x560")
    root.minsize(640, 500)
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

    shell = tk.Frame(root, bg=abyss, padx=28, pady=22)
    shell.pack(fill=tk.BOTH, expand=True)

    tk.Label(shell, text="INSTALLER", bg=abyss, fg=green, font=("Helvetica", 10)).pack(anchor="w")
    tk.Label(shell, text="Finn Setup", bg=abyss, fg=text, font=("Helvetica", 22, "bold")).pack(anchor="w", pady=(2, 4))
    tk.Label(
        shell,
        text="Pick options, watch the bar, done. The API is installed with the app.",
        bg=abyss,
        fg=dim,
        font=ui_small,
        wraplength=640,
        justify="left",
    ).pack(anchor="w", pady=(0, 16))

    stage = tk.Frame(shell, bg=abyss)
    stage.pack(fill=tk.BOTH, expand=True)
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
            item["dot"].itemconfigure("mark", fill=green if selected else panel, outline=green if selected else dim)

    def option_card(parent: tk.Misc, title: str, blurb: str, variable: tk.StringVar, value: str) -> tk.Frame:
        frame = tk.Frame(parent, bg=panel, highlightbackground=border, highlightthickness=1, padx=14, pady=12, cursor="hand2")
        row = tk.Frame(frame, bg=panel)
        row.pack(fill=tk.X)
        dot = tk.Canvas(row, width=18, height=18, bg=panel, highlightthickness=0, bd=0)
        dot.pack(side=tk.LEFT, padx=(0, 10))
        dot.create_oval(2, 2, 16, 16, outline=dim, width=2, fill=panel, tags="mark")
        tk.Label(row, text=title, bg=panel, fg=text, font=ui_bold, anchor="w").pack(side=tk.LEFT, fill=tk.X, expand=True)
        tk.Label(frame, text=blurb, bg=panel, fg=dim, font=ui_small, wraplength=600, justify="left", anchor="w").pack(
            fill=tk.X, pady=(6, 0)
        )

        def pick(_event: object | None = None) -> None:
            variable.set(value)
            refresh_cards()
            if variable is sandbox:
                sync_tos()

        for widget in (frame, row, dot):
            widget.bind("<Button-1>", pick)
        for child in frame.winfo_children():
            child.bind("<Button-1>", pick)
            if isinstance(child, tk.Frame):
                for nested in child.winfo_children():
                    nested.bind("<Button-1>", pick)
        cards.append({"frame": frame, "dot": dot, "variable": variable, "value": value})
        return frame

    def accept_row(parent: tk.Misc) -> tk.Frame:
        frame = tk.Frame(parent, bg=abyss, cursor="hand2")
        box = tk.Canvas(frame, width=18, height=18, bg=abyss, highlightthickness=0, bd=0)
        box.pack(side=tk.LEFT, padx=(0, 8))
        box.create_rectangle(2, 2, 16, 16, outline=dim, width=2, fill=abyss, tags="mark")
        tk.Label(frame, text="I accept the Docker sandbox terms", bg=abyss, fg=text, font=ui_font).pack(side=tk.LEFT)

        def toggle(_event: object | None = None) -> None:
            accept.set(not accept.get())
            box.itemconfigure("mark", fill=green if accept.get() else abyss, outline=green if accept.get() else dim)

        for widget in (frame, box):
            widget.bind("<Button-1>", toggle)
        frame.winfo_children()[-1].bind("<Button-1>", toggle)
        return frame

    pages: list[tk.Frame] = []

    def page() -> tk.Frame:
        frame = tk.Frame(stage, bg=abyss)
        frame.grid(row=0, column=0, sticky="nsew")
        pages.append(frame)
        return frame

    p0 = page()
    tk.Label(p0, text="Who is installing?", bg=abyss, fg=text, font=ui_bold).pack(anchor="w", pady=(0, 8))
    if sys.platform == "win32":
        option_card(p0, "This PC, this user", "No administrator password. Files under your user folder.", privilege, "user").pack(fill=tk.X, pady=5)
        option_card(p0, "This PC, all users", "Program Files. You still open Finn as a normal user afterward.", privilege, "admin").pack(fill=tk.X, pady=5)
    elif sys.platform == "darwin":
        option_card(p0, "This Mac, this user", "No administrator password. Files under your home folder, including ~/Applications.", privilege, "user").pack(fill=tk.X, pady=5)
        option_card(p0, "This Mac, all users", "System folders. You still open Finn as a normal user afterward.", privilege, "admin").pack(fill=tk.X, pady=5)
    else:
        option_card(p0, "This computer, this user", "No administrator password. Files under your home folder.", privilege, "user").pack(fill=tk.X, pady=5)
        option_card(p0, "This computer, all users", "System folders. You still open Finn as a normal user afterward.", privilege, "admin").pack(fill=tk.X, pady=5)

    p1 = page()
    tk.Label(p1, text="Where do the files come from?", bg=abyss, fg=text, font=ui_bold).pack(anchor="w", pady=(0, 8))
    option_card(p1, "This folder (offline)", "Use the .app, API, and wheel next to this installer. No GitHub.", channel, "offline").pack(fill=tk.X, pady=5)
    option_card(p1, "Download (online)", "Fetch the matching GitHub release with curl.", channel, "online").pack(fill=tk.X, pady=5)

    p2 = page()
    tk.Label(p2, text="How should tools run?", bg=abyss, fg=text, font=ui_bold).pack(anchor="w", pady=(0, 8))
    option_card(p2, "Host sandbox", "Approved commands run in a per-Space folder. No Docker daemon.", sandbox, "host").pack(fill=tk.X, pady=5)
    option_card(p2, "Docker sandbox", "Per-engagement container. Admin install. Requires the terms below.", sandbox, "docker").pack(fill=tk.X, pady=5)
    tos_wrap = tk.Frame(p2, bg=panel, highlightbackground=border, highlightthickness=1)
    tos_scroll = tk.Scrollbar(tos_wrap)
    tos = tk.Text(
        tos_wrap,
        height=8,
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
    )
    tos_scroll.configure(command=tos.yview)
    tos_scroll.pack(side=tk.RIGHT, fill=tk.Y)
    tos.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
    tos.insert("1.0", DOCKER_TOS)
    tos.configure(state=tk.DISABLED)
    accept_ui = accept_row(p2)

    def sync_tos() -> None:
        if sandbox.get() == "docker":
            tos_wrap.pack(fill=tk.BOTH, expand=True, pady=(10, 6))
            accept_ui.pack(anchor="w", pady=(0, 4))
        else:
            tos_wrap.pack_forget()
            accept_ui.pack_forget()

    p3 = page()
    tk.Label(p3, text="Installing…", bg=abyss, fg=text, font=ui_bold).pack(anchor="w")
    ttk.Progressbar(p3, maximum=100, variable=percent, style="Green.Horizontal.TProgressbar").pack(fill=tk.X, pady=12, ipady=2)
    tk.Label(p3, textvariable=status, bg=abyss, fg=dim, font=ui_small, wraplength=640, justify="left", anchor="w").pack(
        fill=tk.X
    )
    log_wrap = tk.Frame(p3, bg=panel, highlightbackground=border, highlightthickness=1)
    log_wrap.pack(fill=tk.BOTH, expand=True, pady=(12, 0))
    log_scroll = tk.Scrollbar(log_wrap)
    log = tk.Text(
        log_wrap,
        height=10,
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
    )
    log_scroll.configure(command=log.yview)
    log_scroll.pack(side=tk.RIGHT, fill=tk.Y)
    log.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)

    p4 = page()
    done_label = tk.Label(p4, text="Finn is installed.", bg=abyss, fg=green, font=("Helvetica", 18, "bold"))
    done_label.pack(anchor="w", pady=(8, 10))
    done_detail = tk.Label(p4, text="", bg=abyss, fg=dim, font=ui_font, justify="left", wraplength=640, anchor="w")
    done_detail.pack(anchor="w")

    footer = tk.Frame(shell, bg=abyss)
    footer.pack(fill=tk.X, pady=(16, 0))
    step_label = tk.Label(footer, text="1 / 3", bg=abyss, fg=dim, font=ui_small)
    step_label.pack(side=tk.LEFT)
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
        if idx <= 2:
            step_label.config(text=f"{idx + 1} / 3")
        elif idx == 3:
            step_label.config(text="Installing")
        else:
            step_label.config(text="Done")
        back_btn.config(state=tk.NORMAL if idx in (1, 2) else tk.DISABLED)
        if idx < 2:
            next_btn.config(text="Continue", state=tk.NORMAL, bg=green, fg="#04140a")
        elif idx == 2:
            next_btn.config(text="Install", state=tk.NORMAL, bg=green, fg="#04140a")
        else:
            next_btn.config(text="Install", state=tk.DISABLED, bg=panel, fg=dim)
        if idx == 4:
            launch_btn.pack(side=tk.RIGHT, padx=(0, 8))
        else:
            launch_btn.pack_forget()

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
            step.set(2)
            show_step()
            return

        step.set(3)
        show_step()
        next_btn.config(state=tk.DISABLED)
        back_btn.config(state=tk.DISABLED)

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
                        f"API: {result['prefix']}",
                        f"CLI: {result['wrapper']}",
                    ]
                    if result.get("app"):
                        lines.append(f"App: {result['app']}")
                    else:
                        lines.append("Desktop app: not in this folder — open the macOS kit zip and run Setup from there.")
                    lines.append("The workstation starts the API itself. Launch Finn as a normal user.")
                    done_detail.config(text="\n".join(lines))
                    step.set(4)
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
                    step.set(2)
                    show_step()

                root.after(0, fail)

        threading.Thread(target=work, daemon=True).start()

    def next_page() -> None:
        idx = step.get()
        if idx < 2:
            if idx == 0 and sandbox.get() == "docker":
                privilege.set("admin")
            step.set(idx + 1)
            show_step()
        elif idx == 2:
            do_install()

    def back_page() -> None:
        idx = step.get()
        if idx in (1, 2):
            step.set(idx - 1)
            show_step()

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
    )
    next_btn = tk.Button(
        footer,
        text="Continue",
        command=next_page,
        bg=green,
        fg="#04140a",
        relief=tk.FLAT,
        padx=18,
        pady=8,
        font=ui_bold,
        highlightthickness=0,
        bd=0,
    )
    next_btn.pack(side=tk.RIGHT)
    back_btn = tk.Button(
        footer,
        text="Back",
        command=back_page,
        bg=panel,
        fg=text,
        relief=tk.FLAT,
        padx=14,
        pady=8,
        font=ui_font,
        highlightthickness=0,
        bd=0,
    )
    back_btn.pack(side=tk.RIGHT, padx=(0, 8))

    refresh_cards()
    show_step()
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
