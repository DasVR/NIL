import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Plugin, PreviewServer, ViteDevServer } from 'vite';

const SKIP_DIRS = new Set([
  'node_modules',
  '.git',
  '.svelte-kit',
  'dist',
  'build',
  'target',
  '__pycache__',
  '.venv',
  'venv',
  'coverage',
  'playwright-report',
  'test-results',
]);

const SKIP_NAMES = new Set([
  '.env',
  '.env.local',
  '.env.production',
  'id_rsa',
  'id_ed25519',
  'credentials.json',
]);

const BINARY_EXT = new Set([
  'png', 'jpg', 'jpeg', 'gif', 'webp', 'ico', 'icns',
  'woff', 'woff2', 'ttf', 'eot',
  'wasm', 'zip', 'gz', 'bz2', '7z', 'tar',
  'mp4', 'webm', 'mov', 'mp3', 'wav',
  'pdf', 'bin', 'exe', 'so', 'dylib', 'o',
]);

const MAX_FILES = 800;
const MAX_READ = 400_000;
const MAX_DIFF = 200_000;

function repoRoot(from: string): string {
  let dir = path.resolve(from);
  for (let i = 0; i < 8; i += 1) {
    if (fs.existsSync(path.join(dir, '.git'))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return path.resolve(from);
}

function looksSecret(name: string): boolean {
  const lower = name.toLowerCase();
  if (SKIP_NAMES.has(lower)) return true;
  if (lower.endsWith('.pem') || lower.endsWith('.key')) return true;
  if (lower.startsWith('.env.')) return true;
  return false;
}

function extOf(name: string): string {
  const i = name.lastIndexOf('.');
  return i >= 0 ? name.slice(i + 1).toLowerCase() : '';
}

function walk(dir: string, rel: string, out: string[]): void {
  if (out.length >= MAX_FILES) return;
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  entries.sort((a, b) => a.name.localeCompare(b.name));
  for (const ent of entries) {
    if (out.length >= MAX_FILES) return;
    if (ent.name.startsWith('.')) continue;
    if (SKIP_DIRS.has(ent.name)) continue;
    const nextRel = rel ? `${rel}/${ent.name}` : ent.name;
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      walk(full, nextRel, out);
    } else if (ent.isFile()) {
      if (looksSecret(ent.name)) continue;
      if (BINARY_EXT.has(extOf(ent.name))) continue;
      out.push(nextRel);
    }
  }
}

/**
 * Path-traversal guard for every route that touches the filesystem. Exported
 * for the unit tests only; nothing else should build workspace paths without it.
 */
export function safePath(root: string, rel: string): string | null {
  const decoded = rel.replace(/\\/g, '/').replace(/^\/+/, '');
  if (!decoded || decoded.includes('\0') || decoded.split('/').includes('..')) return null;
  const rootResolved = path.resolve(root);
  const full = path.resolve(rootResolved, decoded);
  if (full !== rootResolved && !full.startsWith(rootResolved + path.sep)) return null;
  return full;
}

function run(cmd: string, args: string[], cwd: string): string | null {
  try {
    return execFileSync(cmd, args, {
      cwd,
      encoding: 'utf8',
      timeout: 4000,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  } catch {
    return null;
  }
}

function parsePorcelain(text: string): {
  staged: Array<{ path: string; status: string }>;
  unstaged: Array<{ path: string; status: string }>;
} {
  const staged: Array<{ path: string; status: string }> = [];
  const unstaged: Array<{ path: string; status: string }> = [];
  for (const line of text.split('\n')) {
    if (line.length < 4) continue;
    const x = line[0];
    const y = line[1];
    const filePath = line.slice(3);
    if (x !== ' ' && x !== '?') staged.push({ path: filePath, status: x });
    if (y !== ' ') unstaged.push({ path: filePath, status: y === '?' ? '?' : y });
  }
  return { staged, unstaged };
}

function json(res: ServerResponse, status: number, body: unknown): void {
  const payload = JSON.stringify(body);
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(payload);
}

function stripBase(urlPath: string, base: string): string {
  if (base && base !== '/' && urlPath.startsWith(base)) {
    const next = urlPath.slice(base.length);
    return next.startsWith('/') ? next : `/${next}`;
  }
  return urlPath;
}

function handle(root: string, base: string, req: IncomingMessage, res: ServerResponse): boolean {
  const raw = req.url ?? '/';
  const qIndex = raw.indexOf('?');
  const pathname = stripBase(qIndex >= 0 ? raw.slice(0, qIndex) : raw, base);
  const search = qIndex >= 0 ? raw.slice(qIndex + 1) : '';
  const query = new URLSearchParams(search);

  if (pathname === '/__nil/files') {
    const files: string[] = [];
    walk(root, '', files);
    json(res, 200, { ok: true, root: path.basename(root), files });
    return true;
  }

  if (pathname === '/__nil/file' && (req.method === 'PUT' || req.method === 'POST')) {
    const chunks: Buffer[] = [];
    req.on('data', (c) => {
      chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c));
    });
    req.on('end', () => {
      try {
        const parsed = JSON.parse(Buffer.concat(chunks).toString('utf8')) as {
          path?: string;
          content?: string;
        };
        const rel = typeof parsed.path === 'string' ? parsed.path : '';
        const content = typeof parsed.content === 'string' ? parsed.content : null;
        if (content == null) {
          json(res, 400, { ok: false, error: 'Missing content.' });
          return;
        }
        if (content.length > MAX_READ) {
          json(res, 413, { ok: false, error: 'File is too large to write here.' });
          return;
        }
        const full = safePath(root, rel);
        if (!full) {
          json(res, 400, { ok: false, error: 'Path is outside the workspace.' });
          return;
        }
        if (looksSecret(path.basename(full)) || BINARY_EXT.has(extOf(path.basename(full)))) {
          json(res, 403, { ok: false, error: 'That file is not writable here.' });
          return;
        }
        const parent = path.dirname(full);
        if (!fs.existsSync(parent) || !fs.statSync(parent).isDirectory()) {
          json(res, 404, { ok: false, error: 'Parent folder is not in the workspace.' });
          return;
        }
        fs.writeFileSync(full, content, 'utf8');
        json(res, 200, { ok: true, path: rel });
      } catch (err) {
        json(res, 400, { ok: false, error: err instanceof Error ? err.message : 'Write failed.' });
      }
    });
    req.on('error', () => {
      json(res, 400, { ok: false, error: 'Write failed.' });
    });
    return true;
  }

  if (pathname === '/__nil/file') {
    const rel = query.get('path') ?? '';
    const full = safePath(root, rel);
    if (!full) {
      json(res, 400, { ok: false, error: 'Path is outside the workspace.' });
      return true;
    }
    if (!fs.existsSync(full) || !fs.statSync(full).isFile()) {
      json(res, 404, { ok: false, error: 'File not found.' });
      return true;
    }
    if (looksSecret(path.basename(full))) {
      json(res, 403, { ok: false, error: 'That file is not readable here.' });
      return true;
    }
    const rawText = fs.readFileSync(full, 'utf8');
    const truncated = rawText.length > MAX_READ;
    json(res, 200, {
      ok: true,
      path: rel,
      content: truncated ? rawText.slice(0, MAX_READ) : rawText,
      truncated,
    });
    return true;
  }

  if (pathname === '/__nil/git') {
    const inside = run('git', ['rev-parse', '--is-inside-work-tree'], root)?.trim() === 'true';
    if (!inside) {
      json(res, 200, { ok: true, git: false });
      return true;
    }
    const branch = run('git', ['rev-parse', '--abbrev-ref', 'HEAD'], root)?.trim() || 'HEAD';
    const porcelain = run('git', ['status', '--porcelain'], root) ?? '';
    const { staged, unstaged } = parsePorcelain(porcelain);
    let ahead: number | null = null;
    let behind: number | null = null;
    const counts = run('git', ['rev-list', '--left-right', '--count', '@{upstream}...HEAD'], root);
    if (counts) {
      const [b, a] = counts.trim().split(/\s+/);
      behind = Number.parseInt(b ?? '', 10);
      ahead = Number.parseInt(a ?? '', 10);
      if (!Number.isFinite(behind)) behind = null;
      if (!Number.isFinite(ahead)) ahead = null;
    }
    let diff = run('git', ['diff', 'HEAD'], root) ?? '';
    let truncated = false;
    if (diff.length > MAX_DIFF) {
      diff = diff.slice(0, MAX_DIFF);
      truncated = true;
    }
    const ciRaw = run('gh', ['run', 'list', '--limit', '8', '--json', 'name,status,conclusion,headBranch,url,displayTitle'], root);
    const { ci, ciLoaded } = parseCi(ciRaw, branch);
    json(res, 200, {
      ok: true,
      git: true,
      branch,
      ahead,
      behind,
      staged,
      unstaged,
      diff,
      truncated,
      ci,
      ciLoaded,
    });
    return true;
  }

  if (pathname === '/__nil/github') {
    const remote = run('git', ['remote', 'get-url', 'origin'], root)?.trim() ?? '';
    const repo = parseGithubRepo(remote);
    if (!repo) {
      json(res, 200, { ok: true, github: false });
      return true;
    }
    const prRaw = run('gh', ['pr', 'list', '--repo', repo, '--limit', '8', '--json', 'number,title,url,state'], root);
    const issueRaw = run('gh', ['issue', 'list', '--repo', repo, '--limit', '8', '--json', 'number,title,url,state'], root);
    json(res, 200, {
      ok: true,
      github: true,
      repo,
      pullRequests: prRaw ? JSON.parse(prRaw) : null,
      issues: issueRaw ? JSON.parse(issueRaw) : null,
    });
    return true;
  }

  if (pathname === '/__nil/mcp') {
    json(res, 200, { ok: true, mcp: true, servers: readMcpServers(root) });
    return true;
  }

  return false;
}

function parseCi(raw: string | null, branch: string): { ci: {
  name: string;
  status: string;
  conclusion: string | null;
  url: string;
  branch: string;
} | null; ciLoaded: boolean } {
  if (raw == null) return { ci: null, ciLoaded: false };
  try {
    const runs = JSON.parse(raw) as unknown;
    if (!Array.isArray(runs) || runs.length === 0) return { ci: null, ciLoaded: true };
    const typed = runs.filter((row): row is Record<string, unknown> => Boolean(row) && typeof row === 'object');
    const hit = typed.find((row) => row.headBranch === branch) ?? typed[0];
    if (!hit) return { ci: null, ciLoaded: true };
    const name = typeof hit.name === 'string' && hit.name
      ? hit.name.split('/').pop()?.replace(/\.ya?ml$/i, '') || hit.name
      : (typeof hit.displayTitle === 'string' ? hit.displayTitle : 'CI');
    return {
      ciLoaded: true,
      ci: {
        name,
        status: typeof hit.status === 'string' ? hit.status : '',
        conclusion: typeof hit.conclusion === 'string' ? hit.conclusion : null,
        url: typeof hit.url === 'string' ? hit.url : '',
        branch: typeof hit.headBranch === 'string' ? hit.headBranch : branch,
      },
    };
  } catch {
    return { ci: null, ciLoaded: false };
  }
}

function parseGithubRepo(remote: string): string | null {
  const ssh = remote.match(/github\.com[:/]([^/]+\/[^/]+?)(?:\.git)?$/);
  return ssh ? ssh[1] : null;
}

function mcpDescription(value: unknown): string {
  if (!value || typeof value !== 'object') return '';
  const rec = value as Record<string, unknown>;
  if (typeof rec.url === 'string' && rec.url) return rec.url;
  if (typeof rec.serverUrl === 'string' && rec.serverUrl) return rec.serverUrl;
  if (typeof rec.command === 'string' && rec.command) {
    const args = Array.isArray(rec.args) ? rec.args.filter((a) => typeof a === 'string').join(' ') : '';
    return args ? `${rec.command} ${args}` : rec.command;
  }
  return '';
}

function serversFromMcpJson(raw: string, source: string): Array<{
  id: string;
  name: string;
  description: string;
  source: string;
}> {
  try {
    const data = JSON.parse(raw) as unknown;
    if (!data || typeof data !== 'object') return [];
    const rec = data as Record<string, unknown>;
    const bag = rec.mcpServers ?? rec.servers;
    if (!bag || typeof bag !== 'object' || Array.isArray(bag)) return [];
    return Object.entries(bag as Record<string, unknown>).map(([id, value]) => ({
      id,
      name: id,
      description: mcpDescription(value) || source,
      source,
    }));
  } catch {
    return [];
  }
}

function readMcpServers(root: string): Array<{
  id: string;
  name: string;
  description: string;
  source: string;
}> {
  const sources = ['.cursor/mcp.json', '.mcp.json', 'mcp.json', '.vscode/mcp.json'];
  const out: Array<{ id: string; name: string; description: string; source: string }> = [];
  const seen = new Set<string>();
  for (const rel of sources) {
    const full = safePath(root, rel);
    if (!full || !fs.existsSync(full) || !fs.statSync(full).isFile()) continue;
    let raw = '';
    try {
      raw = fs.readFileSync(full, 'utf8');
    } catch {
      continue;
    }
    for (const server of serversFromMcpJson(raw, rel)) {
      if (seen.has(server.id)) continue;
      seen.add(server.id);
      out.push(server);
    }
  }
  return out;
}

function attach(server: ViteDevServer | PreviewServer, root: string, base: string): void {
  server.middlewares.use((req, res, next) => {
    try {
      if (handle(root, base, req, res)) return;
    } catch (err) {
      json(res, 500, { ok: false, error: err instanceof Error ? err.message : 'Workspace bridge failed.' });
      return;
    }
    next();
  });
}

export function nilWorkspace(): Plugin {
  return {
    name: 'nil-workspace',
    configureServer(server) {
      const root = repoRoot(server.config.root);
      const base = (server.config.base ?? '/').replace(/\/$/, '');
      attach(server, root, base);
    },
    configurePreviewServer(server) {
      const root = repoRoot(server.config.root);
      const base = (server.config.base ?? '/').replace(/\/$/, '');
      attach(server, root, base);
    },
  };
}
