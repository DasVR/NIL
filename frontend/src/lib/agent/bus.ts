import { browser } from '$app/environment';
import { agentRun } from '$lib/agent/run.svelte.ts';

let socket: WebSocket | null = null;
let current = '';

function wsUrl(engagement: string): string {
  const proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
  const q = engagement ? `?engagement=${encodeURIComponent(engagement)}` : '';
  return `${proto}//${location.host}/v1/ws${q}`;
}

export function connectBus(engagement: string) {
  if (!browser) return;
  const name = engagement.trim();
  if (!name) return;
  if (name === current && socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
    return;
  }
  disconnectBus();
  current = name;
  const ws = new WebSocket(wsUrl(name));
  socket = ws;
  ws.addEventListener('message', (ev) => {
    if (typeof ev.data !== 'string') return;
    try {
      const data = JSON.parse(ev.data) as Record<string, unknown>;
      agentRun.applyEvent(data);
    } catch {
      // Ignore non-JSON frames.
    }
  });
  ws.addEventListener('close', () => {
    if (socket === ws) socket = null;
  });
}

export function disconnectBus() {
  const ws = socket;
  socket = null;
  current = '';
  ws?.close();
}
