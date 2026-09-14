import { base } from '$app/paths';
import api, { API_BASE } from '$lib/api';

export interface ProjectFile {
  id: string;
  path: string;
  label: string;
}

export interface GitEntry {
  path: string;
  status: string;
}

export interface GitCi {
  name: string;
  status: string;
  conclusion: string | null;
  url: string;
  branch: string;
}

export interface GitSnapshot {
  branch: string;
  ahead: number | null;
  behind: number | null;
  staged: GitEntry[];
  unstaged: GitEntry[];
  diff: string;
  ci: GitCi | null;
  ciLoaded: boolean;
  ghAvailable: boolean;
}

export interface GithubItem {
  number: number;
  title: string;
  url: string;
  state: string;
}

export interface GithubSnapshot {
  repo: string;
  pullRequests: GithubItem[] | null;
  issues: GithubItem[] | null;
  ghAvailable: boolean;
}

export interface McpServer {
  id: string;
  name: string;
  description: string;
  source: string;
}

let files = $state<ProjectFile[]>([]);
let git = $state<GitSnapshot | null>(null);
let github = $state<GithubSnapshot | null>(null);
let mcp = $state<McpServer[] | null>(null);
let bridge = $state(false);
let loading = $state(false);

/**
 * Two bridges serve the same contract. The real one is the FastAPI
 * /v1/workspace/* router (works in every build, including Tauri and static
 * deploys). The Vite middleware under /__nil/* exists only in `vite dev` /
 * `vite preview`. Prefer the backend; fall back to the dev bridge only when
 * the backend did not answer, and remember which one worked so file reads and
 * writes go to the same place the listing came from.
 */
type BridgeSource = 'backend' | 'dev';
let source: BridgeSource | null = null;

function devPrefix(): string {
  const root = base.endsWith('/') ? base.slice(0, -1) : base;
  return `${root}/__nil`;
}

function prefixFor(which: BridgeSource): string {
  return which === 'backend' ? `${API_BASE}/workspace` : devPrefix();
}

function candidates(): BridgeSource[] {
  if (source) return [source];
  return ['backend', 'dev'];
}

async function parseJson<T>(res: Response): Promise<T | null> {
  if (!res.ok) return null;
  const text = await res.text();
  if (!text || /^\s*</.test(text)) return null;
  return JSON.parse(text) as T;
}

async function getJson<T>(path: string): Promise<T | null> {
  for (const which of candidates()) {
    try {
      const res = await fetch(`${prefixFor(which)}${path}`, { headers: { Accept: 'application/json' } });
      const data = await parseJson<T>(res);
      if (data == null) continue;
      source = which;
      return data;
    } catch {
      continue;
    }
  }
  return null;
}

export async function readProjectFile(rel: string): Promise<string | null> {
  const data = await getJson<{ ok: boolean; content?: string }>(
    `/file?path=${encodeURIComponent(rel)}`,
  );
  if (!data?.ok || typeof data.content !== 'string') return null;
  return data.content;
}

function engagementArtifact(rel: string): { name: string; kind: 'scope' | 'notes' } | null {
  const decoded = rel.replace(/\\/g, '/').replace(/^\/+/, '');
  const match = decoded.match(/^(?:.*\/)?([^/]+)\/(scope|notes)$/);
  if (!match) return null;
  const name = match[1];
  const kind = match[2];
  if (kind !== 'scope' && kind !== 'notes') return null;
  return { name, kind };
}

export async function writeProjectFile(rel: string, content: string): Promise<boolean> {
  const artifact = engagementArtifact(rel);
  if (artifact) {
    try {
      if (artifact.kind === 'scope') await api.putScope(artifact.name, content);
      else await api.putNotes(artifact.name, content);
      return true;
    } catch {
      // Not an engagement on the harness — try the workspace file bridge.
    }
  }
  for (const which of candidates()) {
    try {
      const res = await fetch(`${prefixFor(which)}/file`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ path: rel, content }),
      });
      // A 4xx from a bridge that exists is a real answer (bad path, secret,
      // too large) — do not fall through to the other bridge for it.
      if (res.status >= 400 && res.status < 500) {
        const text = await res.text();
        if (text && !/^\s*</.test(text)) return false;
        continue;
      }
      const data = await parseJson<{ ok?: boolean }>(res);
      if (data == null) continue;
      source = which;
      return Boolean(data.ok);
    } catch {
      continue;
    }
  }
  return false;
}

export async function refreshProject(): Promise<void> {
  loading = true;
  // Re-probe on every refresh so a backend that comes up later takes over
  // from the dev bridge (and vice versa) without a reload.
  source = null;
  const listed = await getJson<{ ok: boolean; files?: string[] }>('/files');
  if (!listed?.ok || !Array.isArray(listed.files)) {
    bridge = false;
    files = [];
    git = null;
    github = null;
    mcp = null;
    loading = false;
    return;
  }
  bridge = true;
  files = listed.files.map((p) => ({
    id: `proj:${p}`,
    path: p,
    label: p.split('/').pop() || p,
  }));

  const gitRaw = await getJson<{
    ok: boolean;
    git?: boolean;
    branch?: string;
    ahead?: number | null;
    behind?: number | null;
    staged?: GitEntry[];
    unstaged?: GitEntry[];
    diff?: string;
    ci?: GitCi | null;
    ciLoaded?: boolean;
    ghAvailable?: boolean;
  }>('/git');
  git = gitRaw?.ok && gitRaw.git && gitRaw.branch
    ? {
        branch: gitRaw.branch,
        ahead: gitRaw.ahead ?? null,
        behind: gitRaw.behind ?? null,
        staged: gitRaw.staged ?? [],
        unstaged: gitRaw.unstaged ?? [],
        diff: gitRaw.diff ?? '',
        ci: gitRaw.ci ?? null,
        ciLoaded: Boolean(gitRaw.ciLoaded),
        ghAvailable: gitRaw.ghAvailable !== false,
      }
    : null;

  const ghRaw = await getJson<{
    ok: boolean;
    github?: boolean;
    repo?: string;
    pullRequests?: GithubItem[] | null;
    issues?: GithubItem[] | null;
    ghAvailable?: boolean;
  }>('/github');
  github = ghRaw?.ok && ghRaw.github && ghRaw.repo
    ? {
        repo: ghRaw.repo,
        pullRequests: ghRaw.pullRequests ?? null,
        issues: ghRaw.issues ?? null,
        ghAvailable: ghRaw.ghAvailable !== false,
      }
    : null;

  const mcpRaw = await getJson<{
    ok: boolean;
    mcp?: boolean;
    servers?: McpServer[];
  }>('/mcp');
  mcp = mcpRaw?.ok && mcpRaw.mcp && Array.isArray(mcpRaw.servers) ? mcpRaw.servers : [];
  loading = false;
}

export function gitCiLabel(ci: GitCi): string {
  if (ci.conclusion === 'success') return 'passed';
  if (ci.conclusion === 'failure') return 'failed';
  if (ci.conclusion === 'cancelled') return 'cancelled';
  if (ci.conclusion === 'skipped') return 'skipped';
  if (ci.status === 'in_progress') return 'in progress';
  if (ci.status === 'queued' || ci.status === 'waiting' || ci.status === 'pending') return ci.status;
  return ci.conclusion || ci.status || 'unknown';
}

export const project = {
  get files() { return files; },
  get git() { return git; },
  get github() { return github; },
  get mcp() { return mcp; },
  get bridge() { return bridge; },
  get loading() { return loading; },
};
