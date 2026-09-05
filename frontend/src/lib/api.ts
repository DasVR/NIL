// NIL API client — typed fetch wrapper for the Python backend
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000/v1';

interface FetchOptions extends RequestInit {
  body?: any;
}

async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!res.ok) {
    let detail: any = await res.text();
    try { detail = JSON.parse(detail); } catch { /* keep string */ }
    throw new Error(typeof detail === 'string' ? detail : detail?.detail || `HTTP ${res.status}`);
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

export interface EngagementCreate {
  name: string;
  scope?: string;
  target?: string;
  mode?: 'hunt' | 'chat' | 'code' | 'report';
}

export interface ChatRequest {
  engagement: string;
  message: string;
  mode?: 'hunt' | 'chat' | 'code' | 'report';
  stream?: boolean;
  session_id?: string;
  hunt?: boolean;
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
  response: string;
  text?: string;
  mode: string;
  tool_call?: {
    run_id?: string;
    tool?: string;
    args?: Record<string, unknown>;
    reason?: string;
    safety_level?: string;
  };
  runs?: ToolRun[];
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

  listFindings: () => apiFetch<{ findings: any[] }>('/findings'),
  getTimeline: (engagement: string) => apiFetch<{ timeline: string }>(`/timeline/${encodeURIComponent(engagement)}`),
};

export default api;
