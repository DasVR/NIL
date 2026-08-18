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
from pathlib import Path

HERE = Path(__file__).resolve().parent
if str(HERE) not in sys.path:
    sys.path.insert(0, str(HERE))

from engine import DOCKER_TOS, find_api_src, find_macos_app, launch_app, run_install  # noqa: E402


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
        from tkinter import ttk, messagebox, scrolledtext
    except ImportError:
        print(
            "Finn Setup needs Tk (the windowed installer).\n"
            "macOS Homebrew:  brew install python-tk@3.14\n"
            "Or run headless: python3 install/finn-setup.py --cli --user --offline --host",
            file=sys.stderr,
        )
        return cli_main(args)

    root = tk.Tk()
    root.title("Finn Setup")
    root.geometry("720x540")
    root.minsize(640, 480)
    abyss, panel, green, text, dim, border = "#07090d", "#10141c", "#3dff8a", "#e8edf2", "#8b95a3", "#2a3340"
    root.configure(bg=abyss)

    privilege = tk.StringVar(value=args.privilege)
    channel = tk.StringVar(value="offline" if find_api_src(HERE) or find_macos_app(HERE) else args.channel)
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
    style.configure("TFrame", background=abyss)
    style.configure("Card.TFrame", background=panel)
    style.configure("TLabel", background=abyss, foreground=text, font=("Helvetica", 13))
    style.configure("Dim.TLabel", background=abyss, foreground=dim, font=("Helvetica", 11))
    style.configure("Head.TLabel", background=abyss, foreground=text, font=("Helvetica", 20, "bold"))
    style.configure("Micro.TLabel", background=abyss, foreground=green, font=("Helvetica", 10))
    style.configure("TRadiobutton", background=abyss, foreground=text, font=("Helvetica", 12))
    style.configure("Green.Horizontal.TProgressbar", troughcolor=panel, background=green, bordercolor=border)

    shell = ttk.Frame(root, padding=22)
    shell.pack(fill=tk.BOTH, expand=True)

    ttk.Label(shell, text="INSTALLER", style="Micro.TLabel").pack(anchor="w")
    ttk.Label(shell, text="Finn Setup", style="Head.TLabel").pack(anchor="w", pady=(4, 2))
    ttk.Label(
        shell,
        text="Same idea as a Windows setup.exe: pick options, watch the bar, done. The API is installed with the app.",
        style="Dim.TLabel",
        wraplength=640,
    ).pack(anchor="w", pady=(0, 16))

    body = ttk.Frame(shell)
    body.pack(fill=tk.BOTH, expand=True)

    log = scrolledtext.ScrolledText(
        shell, height=8, bg=panel, fg=text, insertbackground=text, relief=tk.FLAT, font=("Menlo", 11)
    )

    def card(parent, title: str, body_text: str, variable: tk.StringVar, value: str) -> ttk.Frame:
        frame = tk.Frame(parent, bg=panel, highlightbackground=border, highlightthickness=1, padx=12, pady=10)
        tk.Radiobutton(
            frame,
            text=title,
            variable=variable,
            value=value,
            bg=panel,
            fg=text,
            selectcolor=abyss,
            activebackground=panel,
            activeforeground=green,
            highlightthickness=0,
            font=("Helvetica", 13, "bold"),
            anchor="w",
        ).pack(fill=tk.X)
        tk.Label(frame, text=body_text, bg=panel, fg=dim, font=("Helvetica", 11), wraplength=560, justify="left").pack(
            anchor="w"
        )
        return frame

    pages: list[tk.Frame] = []

    p0 = tk.Frame(body, bg=abyss)
    tk.Label(p0, text="Who is installing?", bg=abyss, fg=text, font=("Helvetica", 14, "bold")).pack(anchor="w")
    card(p0, "User", "No administrator password. Files under your home folder. Best default.", privilege, "user").pack(
        fill=tk.X, pady=6
    )
    card(
        p0,
        "Admin",
        "System folders and optional Docker. You will still open Finn as a normal user afterward.",
        privilege,
        "admin",
    ).pack(fill=tk.X, pady=6)
    pages.append(p0)

    p1 = tk.Frame(body, bg=abyss)
    tk.Label(p1, text="Where do the files come from?", bg=abyss, fg=text, font=("Helvetica", 14, "bold")).pack(anchor="w")
    card(p1, "This folder (offline)", "Use the .app, API, and wheel next to this installer. No GitHub.", channel, "offline").pack(
        fill=tk.X, pady=6
    )
    card(
        p1,
        "Download (online)",
        "Fetch the matching GitHub release with curl (macOS certificates — not Homebrew urllib).",
        channel,
        "online",
    ).pack(fill=tk.X, pady=6)
    pages.append(p1)

    p2 = tk.Frame(body, bg=abyss)
    tk.Label(p2, text="How should tools run?", bg=abyss, fg=text, font=("Helvetica", 14, "bold")).pack(anchor="w")
    card(p2, "Host sandbox", "Approved commands run in a per-Space folder. No Docker daemon.", sandbox, "host").pack(
        fill=tk.X, pady=6
    )
    card(
        p2,
        "Docker sandbox",
        "Per-engagement container. Admin install. Requires the terms below.",
        sandbox,
        "docker",
    ).pack(fill=tk.X, pady=6)
    tos = scrolledtext.ScrolledText(p2, height=7, bg=panel, fg=dim, relief=tk.FLAT, font=("Menlo", 10))
    tos.insert("1.0", DOCKER_TOS)
    tos.configure(state=tk.DISABLED)
    tos.pack(fill=tk.X, pady=(8, 4))
    tk.Checkbutton(
        p2,
        text="I accept the Docker sandbox terms",
        variable=accept,
        bg=abyss,
        fg=text,
        selectcolor=abyss,
        activebackground=abyss,
        highlightthickness=0,
    ).pack(anchor="w")
    pages.append(p2)

    p3 = tk.Frame(body, bg=abyss)
    tk.Label(p3, text="Installing…", bg=abyss, fg=text, font=("Helvetica", 14, "bold")).pack(anchor="w")
    ttk.Progressbar(p3, maximum=100, variable=percent, style="Green.Horizontal.TProgressbar", length=640).pack(
        fill=tk.X, pady=12
    )
    ttk.Label(p3, textvariable=status, style="Dim.TLabel").pack(anchor="w")
    pages.append(p3)

    p4 = tk.Frame(body, bg=abyss)
    done_label = tk.Label(p4, text="Finn is installed.", bg=abyss, fg=green, font=("Helvetica", 16, "bold"))
    done_label.pack(anchor="w", pady=(8, 8))
    done_detail = tk.Label(p4, text="", bg=abyss, fg=dim, font=("Helvetica", 12), justify="left", wraplength=640)
    done_detail.pack(anchor="w")
    pages.append(p4)

    footer = ttk.Frame(shell)
    footer.pack(fill=tk.X, pady=(12, 0))
    step_label = ttk.Label(footer, text="1 / 3", style="Dim.TLabel")
    step_label.pack(side=tk.LEFT)
    result_app = {"path": ""}

    def show_step() -> None:
        for i, page in enumerate(pages):
            page.pack_forget()
        idx = step.get()
        pages[idx].pack(fill=tk.BOTH, expand=True)
        if idx <= 2:
            step_label.config(text=f"{idx + 1} / 3")
        elif idx == 3:
            step_label.config(text="Installing")
        else:
            step_label.config(text="Done")
        back_btn.config(state=tk.NORMAL if idx in (1, 2) else tk.DISABLED)
        if idx < 2:
            next_btn.config(text="Continue", state=tk.NORMAL)
        elif idx == 2:
            next_btn.config(text="Install", state=tk.NORMAL)
        else:
            next_btn.config(text="Install", state=tk.DISABLED)
        if idx >= 3:
            log.pack(fill=tk.BOTH, expand=False, pady=(12, 0))

    def append_log(line: str) -> None:
        log.configure(state=tk.NORMAL)
        log.insert(tk.END, line + "\n")
        log.see(tk.END)
        log.configure(state=tk.DISABLED)

    def do_install() -> None:
        if sandbox.get() == "docker" and privilege.get() != "admin":
            privilege.set("admin")
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
                def fail() -> None:
                    status.set(str(exc))
                    append_log(f"ERROR  {exc}")
                    messagebox.showerror("Finn Setup", str(exc))
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

    back_btn = tk.Button(footer, text="Back", command=back_page, bg=panel, fg=text, relief=tk.FLAT, padx=14, pady=6)
    back_btn.pack(side=tk.RIGHT, padx=6)
    next_btn = tk.Button(
        footer, text="Continue", command=next_page, bg=green, fg="#04140a", relief=tk.FLAT, padx=16, pady=6
    )
    next_btn.pack(side=tk.RIGHT)
    launch_btn = tk.Button(
        footer,
        text="Launch Finn",
        command=lambda: launch_app(result_app["path"]),
        bg=panel,
        fg=text,
        relief=tk.FLAT,
        padx=14,
        pady=6,
        state=tk.DISABLED,
    )
    launch_btn.pack(side=tk.RIGHT, padx=6)

    log.configure(state=tk.DISABLED)
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
