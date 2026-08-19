//! Start the bundled Finn API as a child of the desktop app.

use std::fs::{self, OpenOptions};
use std::io::{Read, Write};
use std::net::{TcpStream, ToSocketAddrs};
use std::path::{Path, PathBuf};
use std::process::{Child, Command, Stdio};
use std::sync::Mutex;
use std::thread;
use std::time::Duration;

const API_HOST: &str = "127.0.0.1";
const API_PORT: &str = "8766";

pub struct Backend {
    child: Mutex<Option<Child>>,
}

struct Python {
    program: PathBuf,
    prefix_args: Vec<String>,
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
        let python = find_python(resource_dir)?;
        let launcher = find_launcher(resource_dir)?;
        let api_root = launcher.parent().unwrap_or(resource_dir).to_path_buf();
        let log_path = api_log_path();
        if let Some(dir) = log_path.parent() {
            let _ = fs::create_dir_all(dir);
        }
        {
            let mut header = OpenOptions::new()
                .create(true)
                .append(true)
                .open(&log_path)
                .map_err(|e| format!("could not write API log {}: {e}", log_path.display()))?;
            let _ = writeln!(
                header,
                "---- Finn API start ----\npython={:?} launcher={}",
                python.program,
                launcher.display()
            );
        }
        let log_file = OpenOptions::new()
            .create(true)
            .append(true)
            .open(&log_path)
            .map_err(|e| format!("could not write API log {}: {e}", log_path.display()))?;
        let log_err = log_file
            .try_clone()
            .map_err(|e| format!("could not clone API log: {e}"))?;

        let mut cmd = Command::new(&python.program);
        cmd.args(&python.prefix_args)
            .arg(&launcher)
            .env("FINN_API_ROOT", &api_root)
            .env("FINN_API_HOST", API_HOST)
            .env("FINN_API_PORT", API_PORT)
            .env("PYTHONUNBUFFERED", "1")
            .env(
                "PYTHONPATH",
                match std::env::var("PYTHONPATH") {
                    Ok(existing) if !existing.is_empty() => {
                        format!("{}{}{}", api_root.display(), path_sep(), existing)
                    }
                    _ => api_root.display().to_string(),
                },
            )
            .stdin(Stdio::null())
            .stdout(Stdio::from(log_file))
            .stderr(Stdio::from(log_err));
        #[cfg(windows)]
        {
            use std::os::windows::process::CommandExt;
            const CREATE_NO_WINDOW: u32 = 0x0800_0000;
            cmd.creation_flags(CREATE_NO_WINDOW);
        }
        let mut child = cmd.spawn().map_err(|e| {
            format!(
                "could not start Finn API ({:?} {}): {e}",
                python.program,
                launcher.display()
            )
        })?;
        if !wait_healthy(&mut child) {
            let tail = read_log_tail(&log_path);
            let died = matches!(child.try_wait(), Ok(Some(_)));
            *self.child.lock().expect("backend mutex") = Some(child);
            if died {
                return Err(format!(
                    "Finn API exited before it was ready on http://{API_HOST}:{API_PORT}.\nLog: {}\n{tail}",
                    log_path.display()
                ));
            }
            return Ok(());
        }
        *self.child.lock().expect("backend mutex") = Some(child);
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

fn path_sep() -> &'static str {
    if cfg!(windows) {
        ";"
    } else {
        ":"
    }
}

pub fn api_log_path() -> PathBuf {
    if let Ok(dir) = std::env::var("LOCALAPPDATA") {
        return PathBuf::from(dir).join("Finn").join("api.log");
    }
    if let Ok(home) = std::env::var("HOME") {
        return PathBuf::from(home).join(".finn-pentest").join("api.log");
    }
    std::env::temp_dir().join("finn-api.log")
}

fn read_log_tail(path: &Path) -> String {
    let Ok(bytes) = fs::read(path) else {
        return String::new();
    };
    let text = String::from_utf8_lossy(&bytes);
    let clipped: String = text.chars().rev().take(1200).collect();
    clipped.chars().rev().collect()
}

fn python_is_311(program: &Path, prefix_args: &[String]) -> bool {
    let mut cmd = Command::new(program);
    cmd.args(prefix_args)
        .arg("-c")
        .arg("import sys; raise SystemExit(0 if sys.version_info >= (3, 11) else 1)");
    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        cmd.creation_flags(0x0800_0000);
    }
    cmd.status().map(|s| s.success()).unwrap_or(false)
}

fn find_python(resource_dir: &Path) -> Result<Python, String> {
    let bundled = [
        resource_dir.join("python").join("python.exe"),
        resource_dir.join("python").join("python3"),
        resource_dir.join("python").join("bin").join("python3"),
        resource_dir.join("resources").join("python").join("python.exe"),
    ];
    for path in bundled {
        if path.is_file() {
            return Ok(Python {
                program: path,
                prefix_args: Vec::new(),
            });
        }
    }

    #[cfg(windows)]
    {
        let py = PathBuf::from("py");
        let prefix = vec!["-3".to_string()];
        if python_is_311(&py, &prefix) {
            return Ok(Python {
                program: py,
                prefix_args: prefix,
            });
        }
    }

    for name in ["python3", "python"] {
        let program = PathBuf::from(name);
        if python_is_311(&program, &[]) {
            return Ok(Python {
                program,
                prefix_args: Vec::new(),
            });
        }
    }

    Err(format!(
        "Python 3.11+ was not found (bundled runtime missing under {}).",
        resource_dir.display()
    ))
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
    probe(&format!("{API_HOST}:{API_PORT}"))
}

fn wait_healthy(child: &mut Child) -> bool {
    for _ in 0..120 {
        if health_ok() {
            return true;
        }
        if matches!(child.try_wait(), Ok(Some(_))) {
            return false;
        }
        thread::sleep(Duration::from_millis(250));
    }
    health_ok()
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
