import { API_BASE } from '$lib/api';

export interface WsLocation {
  protocol: string;
  host: string;
}

const ABSOLUTE_HTTP = /^https?:\/\//i;

function wsProtocol(httpProtocol: string): string {
  return httpProtocol === 'https:' ? 'wss:' : 'ws:';
}

/**
 * Event-bus WebSocket URL for an engagement.
 *
 * When the API base is an absolute http(s) URL (GitHub Pages builds set
 * VITE_API_BASE to the Homelab API), the socket must follow it to that host
 * and path prefix instead of the page origin. A relative base keeps the
 * same-origin behaviour desktop and dev builds rely on.
 */
export function wsUrl(engagement: string, apiBase: string = API_BASE, loc: WsLocation = location): string {
  const q = engagement ? `?engagement=${encodeURIComponent(engagement)}` : '';
  if (ABSOLUTE_HTTP.test(apiBase)) {
    const base = new URL(apiBase);
    const prefix = base.pathname.replace(/\/+$/, '');
    return `${wsProtocol(base.protocol)}//${base.host}${prefix}/ws${q}`;
  }
  const trimmed = apiBase.replace(/\/+$/, '');
  const prefix = trimmed && !trimmed.startsWith('/') ? `/${trimmed}` : trimmed;
  return `${wsProtocol(loc.protocol)}//${loc.host}${prefix}/ws${q}`;
}
