---
name: nil-tauri
description: Tauri 2 integration — shell, fs, dialog, global shortcuts, notifications, updater. Rust sidecar for PTY.
---

# NIL Tauri 2 Integration

## Tauri Config (tauri.conf.json)

```json
{
  "build": {
    "beforeDevCommand": "npm run dev",
    "beforeBuildCommand": "npm run build",
    "devPath": "http://localhost:1420",
    "distDir": "../dist"
  },
  "package": {
    "productName": "NIL",
    "version": "0.1.0"
  },
  "tauri": {
    "allowlist": {
      "all": false,
      "shell": {
        "all": true,
        "execute": true,
        "sidecar": true,
        "scope": [
          { "name": "nil-pty", "cmd": "nil-pty", "args": true }
        ]
      },
      "fs": {
        "all": true,
        "readFile": true,
        "writeFile": true,
        "readDir": true,
        "copyFile": true,
        "createDir": true,
        "removeFile": true,
        "removeDir": true,
        "scope": ["$APPDATA/*", "$HOME/*", "$PROJECT/*"]
      },
      "dialog": {
        "all": true,
        "open": true,
        "save": true,
        "message": true,
        "ask": true,
        "confirm": true
      },
      "globalShortcut": {
        "all": true
      },
      "notification": {
        "all": true
      },
      "updater": {
        "active": true,
        "endpoints": ["https://releases.nil.dev/{{target}}/{{current_version}}"],
        "dialog": true,
        "pubkey": "dW50cnVzdGVkIGNvbW1lbnQ6IG1pbmlzaWduIHB1YmxpYyBrZXk6..."
      }
    },
    "windows": [
      {
        "title": "NIL",
        "width": 1400,
        "height": 900,
        "minWidth": 1000,
        "minHeight": 600,
        "decorations": false,
        "transparent": true,
        "resizable": true,
        "fullscreen": false,
        "visible": false,
        "titleBarStyle": "overlay",
        "hiddenTitle": true
      }
    ],
    "security": {
      "csp": "default-src 'self'; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' http://localhost:* https://api.nil.dev wss://*.nil.dev; font-src 'self' data:;"
    },
    "bundle": {
      "active": true,
      "targets": "all",
      "icon": ["icons/32x32.png", "icons/128x128.png", "icons/256x256.png", "icons/icon.icns", "icons/icon.ico"],
      "macOS": {
        "frameworks": [],
        "minimumSystemVersion": "13.0",
        "exceptionDomain": "",
        "signingIdentity": "-",
        "providerShortName": "NIL",
        "entitlements": {
          "com.apple.security.cs.allow-jit": true,
          "com.apple.security.cs.allow-unsigned-executable-memory": true,
          "com.apple.security.cs.disable-library-validation": true,
          "com.apple.security.network.client": true,
          "com.apple.security.network.server": true
        }
      },
      "windows": {
        "webviewInstallMode": "embedBootstrapper",
        "allowDowngrades": false
      },
      "linux": {
        "deb": { "depends": ["libwebkit2gtk-4.1-0", "libayatana-appindicator3-1", "librsvg2-common"] },
        "appimage": { "bundleMediaFramework": true }
      }
    }
  }
}
```

## Rust Sidecar (PTY Bridge)

```rust
// src-tauri/sidecar/nil-pty/src/main.rs
use std::process::{Command, Stdio};
use tokio::io::{AsyncBufReadExt, AsyncWriteExt, BufReader};
use tokio::net::UnixListener;
use tokio::sync::mpsc;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let socket_path = std::env::args().nth(1).unwrap_or_else(|| "/tmp/nil-pty.sock".into());
    
    let listener = UnixListener::bind(&socket_path)?;
    println!("PTY bridge listening on {}", socket_path);
    
    loop {
        let (mut stream, _) = listener.accept().await?;
        let shell = std::env::var("SHELL").unwrap_or_else(|_| "/bin/bash".into());
        
        let mut child = Command::new(&shell)
            .arg("-i")
            .stdin(Stdio::piped())
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .spawn()?;
        
        let mut stdin = child.stdin.take().unwrap();
        let stdout = BufReader::new(child.stdout.take().unwrap());
        let stderr = BufReader::new(child.stderr.take().unwrap());
        
        // Bridge: stream <-> PTY
        let (tx, mut rx) = mpsc::channel(100);
        
        // PTY stdout -> stream
        tokio::spawn(async move {
            let mut lines = stdout.lines();
            while let Ok(Some(line)) = lines.next_line().await {
                let _ = stream.write_all(format!("{}\n", line).as_bytes()).await;
            }
        });
        
        // PTY stderr -> stream
        tokio::spawn(async move {
            let mut lines = stderr.lines();
            while let Ok(Some(line)) = lines.next_line().await {
                let _ = stream.write_all(format!("[stderr] {}\n", line).as_bytes()).await;
            }
        });
        
        // Stream -> PTY stdin
        tokio::spawn(async move {
            let mut buf = [0u8; 4096];
            loop {
                tokio::select! {
                    n = stream.read(&mut buf) => {
                        if let Ok(0) = n { break; }
                        if let Ok(n) = n { let _ = stdin.write_all(&buf[..n]).await; }
                    }
                    Some(data) = rx.recv() => {
                        let _ = stdin.write_all(&data).await;
                    }
                }
            }
        });
    }
}
```

## Frontend PTY Connection

```typescript
// frontend/src/lib/pty.ts
export class PTYConnection {
  private ws: WebSocket | null = null;
  private terminal: Terminal;
  
  constructor(terminal: Terminal) {
    this.terminal = terminal;
  }
  
  async connect(socketPath: string): Promise<void> {
    // Tauri handles Unix socket via invoke
    const { invoke } = await import('@tauri-apps/api/core');
    const port = await invoke<number>('pty_connect', { socketPath });
    
    this.ws = new WebSocket(`ws://localhost:${port}`);
    this.ws.binaryType = 'arraybuffer';
    
    this.ws.onmessage = (event) => {
      const data = new TextDecoder().decode(event.data);
      this.terminal.write(data);
    };
    
    this.terminal.onData((data) => {
      this.ws?.send(data);
    });
  }
  
  resize(cols: number, rows: number): void {
    this.ws?.send(JSON.stringify({ type: 'resize', cols, rows }));
  }
  
  disconnect(): void {
    this.ws?.close();
  }
}
```

## Tauri Commands (Rust)

```rust
// src-tauri/src/commands/pty.rs
use tauri::command;

#[command]
async fn pty_connect(socket_path: String) -> Result<u16, String> {
    // Start sidecar, return WebSocket port
    // Sidecar creates Unix socket, we proxy to WS
    Ok(8765) // placeholder
}

#[command]
async fn pty_write(data: String) -> Result<(), String> {
    // Forward to sidecar
    Ok(())
}

#[command]
async fn pty_resize(cols: u16, rows: u16) -> Result<(), String> {
    Ok(())
}
```

## Global Shortcuts

```rust
// src-tauri/src/main.rs
use tauri::{GlobalShortcutManager, Manager};

fn setup_shortcuts(app: &tauri::App) {
    let shortcuts = app.global_shortcut_manager();
    
    // Cmd+J — Toggle AI strip
    shortcuts.register("CmdOrCtrl+J", || {
        app.emit_all("nil:toggle-ai-strip", ()).ok();
    })?;
    
    // Cmd+K — Command palette
    shortcuts.register("CmdOrCtrl+K", || {
        app.emit_all("nil:open-palette", ()).ok();
    })?;
    
    // Cmd+Shift+P — Command palette (alt)
    shortcuts.register("CmdOrCtrl+Shift+P", || {
        app.emit_all("nil:open-palette", ()).ok();
    })?;
    
    // Cmd+Y — Toggle YOLO
    shortcuts.register("CmdOrCtrl+Y", || {
        app.emit_all("nil:toggle-yolo", ()).ok();
    })?;
}
```

## Frontend Event Listeners

```typescript
// frontend/src/lib/tauri-events.ts
import { listen } from '@tauri-apps/api/event';

export function setupTauriEvents() {
  listen('nil:toggle-ai-strip', () => {
    // Toggle AI strip state
    aiStripStore.toggle();
  });
  
  listen('nil:open-palette', () => {
    commandPaletteStore.open();
  });
  
  listen('nil:toggle-yolo', () => {
    yoloStore.toggle();
  });
  
  // Window controls
  listen('tauri://close-requested', (e) => {
    e.preventDefault();
    // Show confirm dialog
  });
}
```

## Permissions Required

| Platform | Permissions | Why |
|----------|-------------|-----|
| **macOS** | `com.apple.security.cs.allow-jit`, `com.apple.security.cs.allow-unsigned-executable-memory`, `com.apple.security.cs.disable-library-validation` | Sidecar execution, WebGL |
| **macOS** | `com.apple.security.network.client`, `com.apple.security.network.server` | PTY WebSocket, API calls |
| **Windows** | None extra (WebView2 handles) | - |
| **Linux** | `libwebkit2gtk-4.1-0`, `libayatana-appindicator3-1` | WebView, tray |

**No sudo required** — everything runs user-space. Sidecar is bundled.

## Build Commands

```bash
# Development
npm run tauri dev

# Production build (all platforms)
npm run tauri build

# Build specific target
npm run tauri build -- --target universal-apple-darwin  # macOS universal
npm run tauri build -- --target x86_64-pc-windows-msvc  # Windows
npm run tauri build -- --target x86_64-unknown-linux-gnu # Linux
```