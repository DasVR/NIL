//! Start the bundled Finn API as a child of the desktop app.

use std::io::{Read, Write};
use std::net::{TcpStream, ToSocketAddrs};
use std::path::{Path, PathBuf};
use std::process::{Child, Command, Stdio};
use std::sync::Mutex;
use std::thread;
use std::time::Duration;

pub struct Backend {
    child: Mutex<Option<Child>>,
}

impl Backend {
    pub fn new() -> Self {
        Self {
            child: Mutex::new(None),
        }
    }

    pub fn start(&self, resource_dir: &Path) -> Result<(), String> {
        if health_ok() {
            return Ok(());
        }
        let python = find_python()?;
        let launcher = find_launcher(resource_dir)?;
        let mut cmd = Command::new(&python);
        cmd.arg(&launcher)
            .env("FINN_API_ROOT", launcher.parent().unwrap_or(resource_dir))
            .stdin(Stdio::null())
            .stdout(Stdio::null())
            .stderr(Stdio::null());
        #[cfg(windows)]
        {
            use std::os::windows::process::CommandExt;
            const CREATE_NO_WINDOW: u32 = 0x0800_0000;
            cmd.creation_flags(CREATE_NO_WINDOW);
        }
        let child = cmd
            .spawn()
            .map_err(|e| format!("could not start Finn API ({python:?} {launcher:?}): {e}"))?;
        *self.child.lock().expect("backend mutex") = Some(child);
        if !wait_healthy() {
            return Err(
                "Finn API started but did not become healthy on http://127.0.0.1:8766."
                    .into(),
            );
        }
        Ok(())
    }

    pub fn stop(&self) {
        if let Ok(mut guard) = self.child.lock() {
            if let Some(mut child) = guard.take() {
                let _ = child.kill();
                let _ = child.wait();
            }
        }
    }
}

fn find_python() -> Result<String, String> {
    for name in ["python3", "python"] {
        if Command::new(name)
            .arg("-c")
            .arg("import sys; raise SystemExit(0 if sys.version_info >= (3, 11) else 1)")
            .status()
            .map(|s| s.success())
            .unwrap_or(false)
        {
            return Ok(name.into());
        }
    }
    Err("Python 3.11+ is required. Install it, then reopen Finn.".into())
}

fn find_launcher(resource_dir: &Path) -> Result<PathBuf, String> {
    let candidates = [
        resource_dir.join("api").join("run-api.py"),
        resource_dir.join("resources").join("api").join("run-api.py"),
        PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../../install/run-api.py"),
    ];
    for path in candidates {
        if path.is_file() {
            return Ok(path.canonicalize().unwrap_or(path));
        }
    }
    Err("Bundled API launcher (run-api.py) was not found in the app resources.".into())
}

fn health_ok() -> bool {
    probe("127.0.0.1:8766")
}

fn wait_healthy() -> bool {
    for _ in 0..48 {
        if health_ok() {
            return true;
        }
        thread::sleep(Duration::from_millis(250));
    }
    false
}

fn probe(addr: &str) -> bool {
    let Ok(mut addrs) = addr.to_socket_addrs() else {
        return false;
    };
    let Some(sock) = addrs.next() else {
        return false;
    };
    let Ok(mut stream) = TcpStream::connect_timeout(&sock, Duration::from_millis(400)) else {
        return false;
    };
    let _ = stream.set_read_timeout(Some(Duration::from_millis(800)));
    if stream
        .write_all(b"GET /v1/health HTTP/1.1\r\nHost: 127.0.0.1\r\nConnection: close\r\n\r\n")
        .is_err()
    {
        return false;
    }
    let mut buf = [0u8; 160];
    let Ok(n) = stream.read(&mut buf) else {
        return false;
    };
    let text = String::from_utf8_lossy(&buf[..n]);
    text.contains("200") || text.contains("ok")
}
