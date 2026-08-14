import { apiGet, apiPost, apiPut, health } from './api';

export type Engagement = {
  name: string;
  scope: string;
  notes: string;
  findings_count: number;
};

export type Plugin = {
  name: string;
  description: string;
  safety_level: string;
  tools: string[];
};

export type Finding = {
  id: string;
  file: string;
  title: string;
  severity: string;
  body: string;
};

export type PendingRun = {
  run_id: string;
  engagement: string;
  tool: string;
  command: string;
  safety_level?: string;
};

export type ChatMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

class AppState {
  connected = $state(false);
  error = $state('');
  engagements = $state<Engagement[]>([]);
  engagement = $state('default');
  mode = $state<'hunt' | 'chat' | 'code' | 'report'>('chat');
  yolo = $state(false);
  model = $state('auto');
  messages = $state<ChatMessage[]>([]);
  pending = $state<PendingRun[]>([]);
  findings = $state<Finding[]>([]);
  notes = $state('');
  scope = $state('');
  plugins = $state<Plugin[]>([]);
  termLines = $state<string[]>([]);
  busy = $state(false);
  sessionId = $state('');
  paletteOpen = $state(false);
  scanlines = $state(false);

  async ping() {
    try {
      await health();
      this.connected = true;
      this.error = '';
    } catch (err) {
      this.connected = false;
      this.error = err instanceof Error ? err.message : 'API offline';
    }
  }

  async refresh() {
    await this.ping();
    if (!this.connected) return;
    const [eng, plugins, yolo, findings, pending, notes, scope] = await Promise.all([
      apiGet('/v1/engagements'),
      apiGet('/v1/plugins'),
      apiGet(`/v1/yolo/${this.engagement}`).catch(() => ({ yolo_enabled: false })),
      apiGet(`/v1/findings?engagement=${this.engagement}`).catch(() => ({ findings: [] })),
      apiGet(`/v1/tools/pending?engagement=${this.engagement}`).catch(() => ({ pending: [] })),
      apiGet(`/v1/engagements/${this.engagement}/notes`).catch(() => ({ notes: '' })),
      apiGet(`/v1/engagements/${this.engagement}/scope`).catch(() => ({ scope: '' }))
    ]);
    this.engagements = eng.engagements || [];
    this.plugins = plugins.plugins || [];
    this.yolo = Boolean(yolo.yolo_enabled);
    this.findings = findings.findings || [];
    this.pending = pending.pending || [];
    this.notes = notes.notes || '';
    this.scope = scope.scope || '';
    const providers = await apiGet('/v1/providers').catch(() => ({ resolved: [] }));
    const enabled = (providers.resolved || []).find((p: { enabled: boolean }) => p.enabled);
    this.model = enabled ? `${enabled.name}/${enabled.model}` : 'auto';
  }

  async ensureEngagement() {
    await apiPost('/v1/engagements', { name: this.engagement });
  }

  async select(name: string) {
    this.engagement = name;
    this.messages = [];
    this.sessionId = '';
    await this.refresh();
  }

  async createEngagement(name: string) {
    await apiPost('/v1/engagements', { name });
    await this.select(name);
  }

  async send(text: string) {
    this.busy = true;
    this.messages = [...this.messages, { role: 'user', content: text }];
    try {
      await this.ensureEngagement();
      const result = await apiPost('/v1/chat', {
        engagement: this.engagement,
        message: text,
        mode: this.mode,
        session_id: this.sessionId || null,
        hunt: this.mode === 'hunt'
      });
      this.sessionId = result.session_id || this.sessionId;
      if (result.text) {
        this.messages = [...this.messages, { role: 'assistant', content: result.text }];
      }
      for (const run of result.runs || []) {
        if (run.stdout) this.termLines = [...this.termLines, `$ ${run.command}`, run.stdout];
      }
      await this.refresh();
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'chat failed';
      this.messages = [
        ...this.messages,
        { role: 'assistant', content: `Error: ${this.error}` }
      ];
    } finally {
      this.busy = false;
    }
  }

  async toggleYolo() {
    await apiPost('/v1/yolo/toggle', { engagement: this.engagement, enabled: !this.yolo });
    await this.refresh();
  }

  async approve(runId: string, edited?: string) {
    await apiPost('/v1/tools/approve', { run_id: runId, edited_command: edited || null });
    const run = await apiPost('/v1/tools/execute', { run_id: runId });
    if (run.stdout) this.termLines = [...this.termLines, `$ ${run.command}`, run.stdout];
    await this.refresh();
  }

  async reject(runId: string) {
    await apiPost('/v1/tools/reject', { run_id: runId, reason: 'rejected from UI' });
    await this.refresh();
  }

  async saveNotes() {
    await apiPut(`/v1/engagements/${this.engagement}/notes`, { notes: this.notes });
  }

  async saveScope() {
    await apiPut(`/v1/engagements/${this.engagement}/scope`, { scope: this.scope });
  }

  appendTerm(line: string) {
    this.termLines = [...this.termLines, line];
  }
}

export const appState = new AppState();
