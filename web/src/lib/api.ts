const STORAGE_KEY = 'finn.apiBase';

export function defaultApiBase(): string {
  if (typeof window === 'undefined') return 'http://127.0.0.1:8766';
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) return stored;
  if ((window as unknown as { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__) {
    return 'http://127.0.0.1:8766';
  }
  return '';
}

export function getApiBase(): string {
  if (typeof window === 'undefined') return 'http://127.0.0.1:8766';
  return localStorage.getItem(STORAGE_KEY) ?? defaultApiBase();
}

export function setApiBase(url: string): void {
  localStorage.setItem(STORAGE_KEY, url);
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
  return parse(await fetch(url(path)));
}

export async function apiPost(path: string, body?: unknown) {
  return parse(await fetch(url(path), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body)
  }));
}

export async function apiPut(path: string, body?: unknown) {
  return parse(await fetch(url(path), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body)
  }));
}

export async function apiDelete(path: string) {
  return parse(await fetch(url(path), { method: 'DELETE' }));
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

  (async () => {
    try {
      const result = await apiPost('/v1/chat', {
        engagement: body.engagement,
        message: body.message,
        mode: body.mode || 'chat',
        hunt: body.mode === 'hunt',
        session_id: null
      });
      if (abort.signal.aborted) return;
      const text = result.text || '';
      if (text) onChunk({ type: 'text', content: text });
      onChunk({ type: 'done' });
    } catch (err) {
      if (!abort.signal.aborted) {
        onError(err instanceof Error ? err : new Error(String(err)));
      }
    }
  })();

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

export async function connectWs(engagement: string, onEvent: (event: Record<string, unknown>) => void): WebSocket {
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