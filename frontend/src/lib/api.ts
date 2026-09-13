// NIL API client — typed fetch wrapper for the Python backend
// Production builds are served by the same FastAPI app they talk to (see
// shipped_web_dir() in finn_pentest/core/config.py), so a relative path
// always reaches the right origin. Vite dev/preview proxy /v1 to :8766.
const API_BASE = import.meta.env.VITE_API_BASE || '/v1';

interface FetchOptions extends RequestInit {
  body?: any;
}

async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const url = `${API_BASE}${path}`;
  let res: Response;
  try {
    res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw new Error('Backend unavailable. Start the API, then send again.');
  }

  if (!res.ok) {
    let detail: any = await res.text();
    if (typeof detail === 'string' && /^\s*</.test(detail)) {
      throw new Error(`Backend unavailable (HTTP ${res.status}). Start the API, then send again.`);
    }
    try { detail = JSON.parse(detail); } catch { /* keep string */ }
    const fromJson = typeof detail === 'object' && detail ? (detail.detail || detail.error) : null;
    if (typeof fromJson === 'string' && /econnrefused|econnreset|proxy error/i.test(fromJson)) {
      throw new Error(`Backend unavailable (HTTP ${res.status}). Start the API, then send again.`);
    }
    const message = typeof detail === 'string' ? detail.trim() : (typeof fromJson === 'string' ? fromJson : '');
    throw new Error(message || `Backend unavailable (HTTP ${res.status}). Start the API, then send again.`);
  }

  return res.json() as Promise<T>;
}

export interface Engagement {
  name: string;
  path: string;
  scope: string;
  notes: string;
  findings_count: number;
  loot_count: number;
  created_at: string;
}

export type AgentMode = 'hunt' | 'exploit' | 'chat' | 'code' | 'report';

export interface EngagementCreate {
  name: string;
  scope?: string;
  target?: string;
  mode?: AgentMode;
}

export interface ChatRequest {
  engagement: string;
  message: string;
  mode?: AgentMode;
  stream?: boolean;
  session_id?: string;
  hunt?: boolean;
  /** Session picker value. The harness uses the enabled provider until it reads this. */
  model?: string;
  effort?: 'low' | 'medium' | 'high';
}

export interface TokenUsagePayload {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  cost_usd: number;
  provider?: string;
  model?: string;
}

export interface ChatResponse {
  session_id: string;
  response?: string;
  text?: string;
  mode?: string;
  status?: string;
  tool_call?: {
    run_id?: string;
    tool?: string;
    args?: Record<string, unknown>;
    reason?: string;
    safety_level?: string;
  };
  runs?: ToolRun[];
  findings?: Array<{
    title?: string;
    severity?: 'critical' | 'high' | 'medium' | 'low' | 'info';
    status?: 'lead' | 'confirmed' | 'ruled_out';
    cvss?: number | null;
    evidence?: string;
    assessment?: string;
    remediation?: string;
    vector?: string;
  }>;
  usage?: TokenUsagePayload | null;
}

export interface ToolRun {
  id?: string;
  run_id?: string;
  engagement: string;
  tool: string;
  command: string;
  status: string;
  approval?: string;
  output?: string;
  stdout?: string;
  error?: string;
  returncode?: number;
  exit_code?: number;
  yolo?: boolean;
  safety_level?: string;
}

export interface ToolPropose {
  engagement: string;
  tool: string;
  command: string;
  safety_level?: 'safe' | 'unsafe' | 'dangerous';
}

export interface ToolApprove {
  run_id: string;
  edited_command?: string;
  grant?: 'once' | 'engagement_prefix';
  execute?: boolean;
}

export interface UsageSummary {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  cost_usd: number;
  by_provider: Array<{
    provider: string;
    model: string;
    prompt_tokens: number;
    completion_tokens: number;
    cost_usd: number;
  }>;
  recent?: Array<{
    engagement?: string;
    provider: string;
    model: string;
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
    cost_usd: number;
    created_at: string;
  }>;
}

export interface ProviderInfo {
  name: string;
  model: string;
  base_url: string;
  enabled: boolean;
  type: string;
}

export interface YoloToggle {
  engagement: string;
  enabled: boolean;
}

export const api = {
  health: () => apiFetch<{ status: string; version: string }>('/health'),
  info: () => apiFetch<{ modes: string[]; endpoints: Record<string, string> }>('/info'),

  listEngagements: () => apiFetch<{ engagements: Engagement[] }>('/engagements'),
  createEngagement: (body: EngagementCreate) => apiFetch<Engagement>('/engagements', { method: 'POST', body }),
  getEngagement: (name: string) => apiFetch<Engagement>(`/engagements/${encodeURIComponent(name)}`),
  deleteEngagement: (name: string) => apiFetch<void>(`/engagements/${encodeURIComponent(name)}`, { method: 'DELETE' }),

  getScope: (name: string) => apiFetch<{ scope: string }>(`/engagements/${encodeURIComponent(name)}/scope`),
  putScope: (name: string, scope: string) => apiFetch<void>(`/engagements/${encodeURIComponent(name)}/scope`, {
    method: 'PUT',
    body: { scope }
  }),
  getNotes: (name: string) => apiFetch<{ notes: string }>(`/engagements/${encodeURIComponent(name)}/notes`),
  putNotes: (name: string, notes: string) => apiFetch<void>(`/engagements/${encodeURIComponent(name)}/notes`, {
    method: 'PUT',
    body: { notes }
  }),

  chat: (body: ChatRequest) => apiFetch<ChatResponse>('/chat', { method: 'POST', body }),

  proposeTool: (body: ToolPropose) => apiFetch<ToolRun>('/tools/propose', { method: 'POST', body }),
  approveTool: (body: ToolApprove) => apiFetch<ToolRun>('/tools/approve', { method: 'POST', body }),
  rejectTool: (run_id: string, reason?: string) => apiFetch<ToolRun>('/tools/reject', {
    method: 'POST',
    body: { run_id, reason }
  }),
  getPendingRuns: (engagement?: string) => apiFetch<{ pending: ToolRun[] }>(
    engagement ? `/tools/pending?engagement=${encodeURIComponent(engagement)}` : '/tools/pending'
  ),
  getRunHistory: (engagement?: string, limit = 50) => apiFetch<{ history: ToolRun[] }>(
    `/tools/history?${engagement ? `engagement=${encodeURIComponent(engagement)}&` : ''}limit=${limit}`
  ),

  yoloStatus: (engagement: string) => apiFetch<{ yolo_enabled: boolean }>(`/yolo/${encodeURIComponent(engagement)}`),
  yoloToggle: (body: YoloToggle) => apiFetch<{ yolo_enabled: boolean }>('/yolo/toggle', { method: 'POST', body }),

  getUsage: (engagement?: string) => apiFetch<UsageSummary>(
    engagement ? `/usage?engagement=${encodeURIComponent(engagement)}` : '/usage'
  ),

  getProviders: () => apiFetch<{ resolved: ProviderInfo[] }>('/providers'),
  listFindings: (engagement: string) => apiFetch<{ findings: Array<Record<string, unknown>> }>(
    `/findings?engagement=${encodeURIComponent(engagement)}`,
  ),
  getTimeline: (engagement: string) => apiFetch<{ timeline: string }>(`/timeline/${encodeURIComponent(engagement)}`),
  stopHunt: (engagement: string) => apiFetch<{ stopped: boolean; engagement: string }>(
    `/hunt/stop?engagement=${encodeURIComponent(engagement)}`,
    { method: 'POST' },
  ),
  generateReport: (engagement: string, format: 'markdown' | 'json' = 'markdown') =>
    apiFetch<{ format: string; report: string; files?: unknown }>(
      '/reports/generate',
      { method: 'POST', body: { engagement, format } },
    ),
};

export default api;
