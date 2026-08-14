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

export async function apiSend(path: string, method: string, body?: unknown) {
  return parse(
    await fetch(url(path), {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body)
    })
  );
}

export async function apiPost(path: string, body?: unknown) {
  return apiSend(path, 'POST', body);
}

export async function apiPut(path: string, body?: unknown) {
  return apiSend(path, 'PUT', body);
}

export async function apiDelete(path: string) {
  return apiSend(path, 'DELETE');
}

export async function health() {
  return apiGet('/v1/health');
}

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
