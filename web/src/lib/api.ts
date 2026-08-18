const STORAGE_KEY = 'finn.apiBase';
const AUTH_KEY = 'finn.apiKey';

export function defaultApiBase(): string {
  if (typeof window === 'undefined') return 'http://127.0.0.1:8766';
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) return stored;
  if ((window as unknown as { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__) {
    return 'http://127.0.0.1:8766';
  }
  return 'http://127.0.0.1:8766';
}

export function getApiBase(): string {
  if (typeof window === 'undefined') return 'http://127.0.0.1:8766';
  return localStorage.getItem(STORAGE_KEY) ?? defaultApiBase();
}

export function setApiBase(url: string): void {
  localStorage.setItem(STORAGE_KEY, url);
}

export function getApiKey(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(AUTH_KEY) ?? '';
}

export function setApiKey(key: string): void {
  localStorage.setItem(AUTH_KEY, key);
}

function headers(base: HeadersInit = {}): HeadersInit {
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  const key = getApiKey();
  if (key) h['Authorization'] = `Bearer ${key}`;
  return { ...h, ...base };
}

function url(path: string): string {
  return `${getApiBase()}${path}`;
}

async function parse(res: Response) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.detail || res.statusText || 'Request failed');
  }
  return data;
}

export async function apiGet(path: string) {
  return parse(await fetch(url(path), { headers: headers() }));
}

export async function apiPost(path: string, body?: unknown) {
  return parse(await fetch(url(path), {
    method: 'POST',
    headers: headers(),
    body: body === undefined ? undefined : JSON.stringify(body)
  }));
}

export async function apiPut(path: string, body?: unknown) {
  return parse(await fetch(url(path), {
    method: 'PUT',
    headers: headers(),
    body: body === undefined ? undefined : JSON.stringify(body)
  }));
}

export async function apiDelete(path: string) {
  return parse(await fetch(url(path), { method: 'DELETE', headers: headers() }));
}

export async function health() {
  return apiGet('/v1/health');
}

export async function info() {
  return apiGet('/v1/info');
}

// ──────────────────────────────────────────────
// Pentest + Anti-Refusal Endpoints
// ──────────────────────────────────────────────

export interface PentestChatRequest {
  engagement: string;
  message: string;
  mode?: string;
  model?: string;
  yolo?: boolean;
  context?: Record<string, unknown>;
}

export interface PentestChatResponse {
  text: string;
  model: string;
  is_refusal: boolean;
  refusal_reason?: string;
  score: number;
  score_breakdown: {
    total: number;
    quality: number;
    filteredness: number;
    speed: number;
    length_contribution: number;
  };
  commands: string[];
  escalation_level: number;
  template_used?: string;
  response_time_ms: number;
}

export async function pentestChat(body: PentestChatRequest): Promise<PentestChatResponse> {
  const result = await apiPost('/v1/chat', {
    engagement: body.engagement,
    message: body.message,
    mode: body.mode || 'chat',
    hunt: body.mode === 'hunt',
    session_id: null
  });
  return {
    text: result.text || '',
    model: result.model || 'unknown',
    is_refusal: false,
    score: 0,
    score_breakdown: {
      total: 0,
      quality: 0,
      filteredness: 0,
      speed: 0,
      length_contribution: 0
    },
    commands: result.commands || [],
    escalation_level: 0,
    response_time_ms: 0
  };
}

// ──────────────────────────────────────────────
// Streaming Chat (SSE)
// ──────────────────────────────────────────────

export interface StreamChunk {
  type: 'text' | 'score' | 'done' | 'error';
  content?: string;
  score?: PentestChatResponse['score_breakdown'];
  error?: string;
}

export function streamPentestChat(
  body: PentestChatRequest,
  onChunk: (chunk: StreamChunk) => void,
  onError: (err: Error) => void
): () => void {
  const abort = new AbortController();

  fetch(url('/v1/pentest/chat/stream'), {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(body),
    signal: abort.signal,
  }).then(async (res) => {
    if (!res.ok) {
      const text = await res.text().catch(() => res.statusText);
      let detail = text;
      try { detail = JSON.parse(text).detail || text; } catch { /* keep text */ }
      throw new Error(detail || res.statusText);
    }

    const reader = res.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const chunk: StreamChunk = JSON.parse(line.slice(6));
            onChunk(chunk);
          } catch {
            // ignore malformed SSE
          }
        }
      }
    }
    onChunk({ type: 'done' });
  }).catch((err) => {
    if (!abort.signal.aborted) {
      onError(err instanceof Error ? err : new Error(String(err)));
    }
  });

  return () => abort.abort();
}

// ──────────────────────────────────────────────
// Templates / Racing
// ──────────────────────────────────────────────

export interface TemplateRaceRequest {
  model: string;
  user_message: string;
  yolo?: boolean;
  mode?: string;
}

export interface TemplateRaceResponse {
  results: Array<{
    template: string;
    text: string;
    score: number;
    score_breakdown: PentestChatResponse['score_breakdown'];
    is_refusal: boolean;
    response_time_ms: number;
  }>;
  winner: string;
  winner_template: string;
  total_templates: number;
}

export async function raceTemplates(body: TemplateRaceRequest): Promise<TemplateRaceResponse> {
  return apiPost('/v1/templates/race', body);
}

export async function listTemplates(): Promise<{ templates: string[]; combos: string[] }> {
  return apiGet('/v1/templates/list');
}

// ──────────────────────────────────────────────
// Providers / Models
// ──────────────────────────────────────────────

export interface ProviderInfo {
  name: string;
  model: string;
  display_name: string;
  enabled: boolean;
  supports_chat: boolean;
  supports_streaming: boolean;
}

export async function getProviders(): Promise<{ resolved: ProviderInfo[] }> {
  return apiGet('/v1/providers');
}

// ──────────────────────────────────────────────
// Refusal Detection
// ──────────────────────────────────────────────

export async function detectRefusal(text: string): Promise<{
  is_refusal: boolean;
  reason: string;
  confidence: number;
  patterns_matched: string[];
}> {
  return apiPost('/v1/refusal/detect', { text });
}

export async function approve(run_id: string, edited_command?: string) {
  return apiPost('/v1/tools/approve', { run_id, edited_command: edited_command || null });
}

export async function reject(run_id: string, reason?: string) {
  return apiPost('/v1/tools/reject', { run_id, reason: reason || 'rejected from UI' });
}

// ──────────────────────────────────────────────
// Legacy endpoints (kept for compatibility)
// ──────────────────────────────────────────────

export function connectWs(engagement: string, onEvent: (event: Record<string, unknown>) => void): WebSocket {
  const base = getApiBase() || (typeof window !== 'undefined' ? window.location.origin : 'http://127.0.0.1:8766');
  const wsBase = base.replace(/^http/, 'ws');
  const socket = new WebSocket(`${wsBase}/v1/ws?engagement=${encodeURIComponent(engagement)}`);
  socket.onmessage = (ev) => {
    try {
      onEvent(JSON.parse(ev.data));
    } catch {
      /* ignore */
    }
  };
  return socket;
}

// ──────────────────────────────────────────────
// Credentials
// ──────────────────────────────────────────────

export interface Credential {
  id: number;
  service: string;
  username: string;
  password: string;
  note?: string;
  last_used?: string;
}

export async function listCredentials(engagement: string, reveal = false): Promise<{ credentials: Credential[] }> {
  return apiGet(`/v1/credentials/${encodeURIComponent(engagement)}?reveal=${reveal}`);
}

export async function storeCredential(body: {
  engagement: string;
  service: string;
  username: string;
  password: string;
  note?: string;
  notes?: string;
}): Promise<Credential> {
  return apiPost('/v1/credentials', {
    ...body,
    notes: body.notes ?? body.note
  });
}

export async function deleteCredential(engagement: string, credId: number): Promise<unknown> {
  return apiDelete(`/v1/credentials/${encodeURIComponent(engagement)}/${credId}`);
}

// ──────────────────────────────────────────────
// Reports
// ──────────────────────────────────────────────

export interface ReportEntry {
  id: string;
  date: string;
  format: string;
  status: string;
  content?: string;
}

export async function generateReport(body: { engagement: string; format: string }): Promise<{ report: string }> {
  return apiPost('/v1/reports/generate', body);
}

export async function downloadReport(engagement: string, fmt = 'markdown'): Promise<Blob> {
  const res = await fetch(url(`/v1/reports/${encodeURIComponent(engagement)}/download?fmt=${fmt}`), { headers: headers() });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || res.statusText || 'Download failed');
  }
  return res.blob();
}

// ──────────────────────────────────────────────
// Loot
// ──────────────────────────────────────────────

export interface LootItem {
  id: string;
  name: string;
  size: number;
  source: string;
  timestamp: string;
  type: string;
}

export async function listLoot(engagement: string): Promise<{ loot: LootItem[] }> {
  return apiGet(`/v1/engagements/${encodeURIComponent(engagement)}/loot`);
}

export async function uploadLoot(engagement: string, file: File): Promise<unknown> {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(url(`/v1/engagements/${encodeURIComponent(engagement)}/loot`), {
    method: 'POST',
    headers: { Authorization: getApiKey() ? `Bearer ${getApiKey()}` : '' },
    body: form
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || res.statusText || 'Upload failed');
  }
  return res.json();
}

// ──────────────────────────────────────────────
// Timeline
// ──────────────────────────────────────────────

export async function getTimeline(engagement: string): Promise<{ timeline: string }> {
  return apiGet(`/v1/timeline/${encodeURIComponent(engagement)}`);
}

export async function getToolHistory(engagement: string, limit = 40): Promise<{ history: Array<Record<string, unknown>> }> {
  return apiGet(`/v1/tools/history?engagement=${encodeURIComponent(engagement)}&limit=${limit}`);
}

export async function logTimelineEvent(engagement: string, body: { type: string; title: string; detail?: string }): Promise<unknown> {
  return apiPost(`/v1/timeline/${encodeURIComponent(engagement)}`, body);
}
