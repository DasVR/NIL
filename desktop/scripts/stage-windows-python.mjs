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

const zipPath = join(dest, "python-embed.zip");
console.log(`stage-windows-python: fetching ${ZIP_URL}`);
await download(ZIP_URL, zipPath);
const unzip = spawnSync("tar", ["-xf", zipPath, "-C", dest], { stdio: "inherit" });
if (unzip.status !== 0) {
  throw new Error("failed to unzip embeddable Python");
}
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

const apiDir = join(root, "desktop", "src-tauri", "resources", "api");
const installTarget = existsSync(join(apiDir, "pyproject.toml")) ? apiDir : root;
const pkgs = spawnSync(
  join(dest, "python.exe"),
  ["-m", "pip", "install", "--no-warn-script-location", installTarget],
  { cwd: dest, stdio: "inherit" }
);
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
