#!/usr/bin/env node
/** Windows only: embed Python 3.12 + Finn API deps so the app does not need a system Python. */
import { createWriteStream } from "node:fs";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..", "..");
const dest = join(root, "desktop", "src-tauri", "resources", "python");
const PY_VER = "3.12.10";
const ZIP_URL = `https://www.python.org/ftp/python/${PY_VER}/python-${PY_VER}-embed-amd64.zip`;
const GET_PIP = "https://bootstrap.pypa.io/get-pip.py";

if (process.platform !== "win32") {
  console.log("stage-windows-python: skip (not Windows)");
  process.exit(0);
}

const bundled = join(dest, "python.exe");
const probe = spawnSync(bundled, ["-c", "import finn_pentest, uvicorn"], { encoding: "utf8" });
if (existsSync(bundled) && probe.status === 0) {
  console.log(`stage-windows-python: already ready at ${dest}`);
  process.exit(0);
}

if (existsSync(dest)) {
  rmSync(dest, { recursive: true, force: true });
}
mkdirSync(dest, { recursive: true });

async function download(url, to) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`download ${url} failed: ${res.status}`);
  }
  await pipeline(Readable.fromWeb(res.body), createWriteStream(to));
}

function unzipWindows(zip, destDir) {
  // Git's tar on Actions treats "D:" in -C as a remote host.
  const ps = `Expand-Archive -LiteralPath ${JSON.stringify(zip)} -DestinationPath ${JSON.stringify(destDir)} -Force`;
  const expand = spawnSync("powershell.exe", ["-NoProfile", "-NonInteractive", "-Command", ps], {
    stdio: "inherit",
  });
  if (expand.status === 0) {
    return;
  }
  const tar = spawnSync("tar", ["--force-local", "-xf", zip], { cwd: destDir, stdio: "inherit" });
  if (tar.status !== 0) {
    throw new Error("failed to unzip embeddable Python");
  }
}

const zipPath = join(root, "desktop", "src-tauri", "resources", "python-embed.zip");
console.log(`stage-windows-python: fetching ${ZIP_URL}`);
await download(ZIP_URL, zipPath);
unzipWindows(zipPath, dest);
rmSync(zipPath, { force: true });

const pth = join(dest, "python312._pth");
if (existsSync(pth)) {
  writeFileSync(
    pth,
    "python312.zip\n.\nLib\\site-packages\n..\\api\nimport site\n",
    "utf8"
  );
}

const getPip = join(dest, "get-pip.py");
await download(GET_PIP, getPip);
const pip = spawnSync(join(dest, "python.exe"), [getPip, "--no-warn-script-location"], {
  cwd: dest,
  stdio: "inherit",
});
if (pip.status !== 0) {
  throw new Error("get-pip failed");
}

const py = join(dest, "python.exe");
const bootstrap = spawnSync(py, ["-m", "pip", "install", "--no-warn-script-location", "setuptools", "wheel"], {
  cwd: dest,
  stdio: "inherit",
});
if (bootstrap.status !== 0) {
  throw new Error("pip install setuptools failed");
}

// Embeddable Python cannot run PEP 517 isolated builds (setuptools.build_meta).
// Install wheels only; finn_pentest comes from resources/api via python312._pth.
const deps = [
  "fastapi>=0.111.0",
  "uvicorn[standard]>=0.30.0",
  "httpx>=0.27.0",
  "pydantic>=2.8.0",
  "python-dotenv>=1.0.0",
  "slowapi>=0.1.9",
  "docker>=7.0.0",
  "cryptography>=42.0.0",
  "textual>=0.80.0",
  "rich>=13.0.0",
  "typer>=0.12.0",
  "pyyaml>=6.0.0",
  "python-multipart>=0.0.9",
];
const pkgs = spawnSync(py, ["-m", "pip", "install", "--no-warn-script-location", ...deps], {
  cwd: dest,
  stdio: "inherit",
});
if (pkgs.status !== 0) {
  throw new Error("pip install Finn API failed");
}

const check = spawnSync(join(dest, "python.exe"), ["-c", "import finn_pentest, uvicorn; print('ok')"], {
  encoding: "utf8",
});
if (check.status !== 0) {
  throw new Error(`bundled Python cannot import Finn API: ${check.stderr || check.stdout}`);
}
console.log(`stage-windows-python: ready at ${dest}`);
