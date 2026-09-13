import { base } from '$app/paths';
import api from '$lib/api';

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

function prefix(): string {
  const root = base.endsWith('/') ? base.slice(0, -1) : base;
  return `${root}/__nil`;
}

async function getJson<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${prefix()}${path}`, { headers: { Accept: 'application/json' } });
    if (!res.ok) return null;
    const text = await res.text();
    if (!text || /^\s*</.test(text)) return null;
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
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
  try {
    const res = await fetch(`${prefix()}/file`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ path: rel, content }),
    });
    if (!res.ok) return false;
    const text = await res.text();
    if (!text || /^\s*</.test(text)) return false;
    const data = JSON.parse(text) as { ok?: boolean };
    return Boolean(data.ok);
  } catch {
    return false;
  }
}

export async function refreshProject(): Promise<void> {
  loading = true;
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
      }
    : null;

  const ghRaw = await getJson<{
    ok: boolean;
    github?: boolean;
    repo?: string;
    pullRequests?: GithubItem[] | null;
    issues?: GithubItem[] | null;
  }>('/github');
  github = ghRaw?.ok && ghRaw.github && ghRaw.repo
    ? {
        repo: ghRaw.repo,
        pullRequests: ghRaw.pullRequests ?? null,
        issues: ghRaw.issues ?? null,
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
