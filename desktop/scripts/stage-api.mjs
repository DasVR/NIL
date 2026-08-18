#!/usr/bin/env node
/** Copy the Finn API into Tauri resources so the .app / installer ships with it. */
import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..", "..");
const dest = join(root, "desktop", "src-tauri", "resources", "api");

const skip = new Set(["__pycache__", ".pyc", ".pytest_cache", ".egg-info"]);

function filter(src) {
  const name = src.split(/[/\\]/).pop() || "";
  if (skip.has(name) || name.endsWith(".pyc") || name.endsWith(".egg-info")) {
    return false;
  }
  return true;
}

if (existsSync(dest)) {
  rmSync(dest, { recursive: true, force: true });
}
mkdirSync(dest, { recursive: true });

const copies = [
  ["finn_pentest", "finn_pentest"],
  ["prompts", "prompts"],
  ["pyproject.toml", "pyproject.toml"],
  ["install/run-api.py", "run-api.py"],
];

for (const [fromRel, toRel] of copies) {
  const from = join(root, fromRel);
  if (!existsSync(from)) {
    throw new Error(`stage-api: missing ${from}`);
  }
  cpSync(from, join(dest, toRel), { recursive: true, filter });
}

console.log(`staged API → ${dest}`);
