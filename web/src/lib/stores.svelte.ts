import {
  apiGet,
  apiPost,
  apiPut,
  health,
  listCredentials,
  listLoot,
  getTimeline,
  getToolHistory,
  generateReport,
  approve as apiApprove,
  reject as apiReject
} from './api';
import type { Credential, LootItem } from './api';
import { hostsToTargets, loadExtraTargets, parseScopeHosts, saveExtraTargets } from './scope';
import { toast } from './toast.svelte';
import { guessShellTool } from './intent';
import type {
  Artifact,
  CenterView,
  ChatAttachment,
  ChatMessage,
  ChatMode,
  Engagement,
  Finding,
  InspectorTab,
  PendingRun,
  Plugin,
  RuntimeConfig,
  SpaceLayout,
  Target,
  TermBlock
} from './types';

export type {
  Artifact,
  CenterView,
  ChatAttachment,
  ChatMessage,
  ChatMode,
  Engagement,
  Finding,
  InspectorTab,
  PendingRun,
  Plugin,
  RuntimeConfig,
  SpaceLayout,
  Target,
  TermBlock
};

export type Prefs = {
  grain: boolean;
  scanlines: boolean;
  sounds: boolean;
  confirmYolo: boolean;
  autoApproveOnYolo: boolean;
  theme: 'system' | 'dark' | 'light';
  accent: 'green' | 'red' | 'blue' | 'teal' | 'amber';
  reducedMotion: 'system' | 'on' | 'off';
  streaming: boolean;
};

const DEFAULT_PREFS: Prefs = {
  grain: false,
  scanlines: false,
  sounds: false,
  confirmYolo: true,
  autoApproveOnYolo: false,
  theme: 'dark',
  accent: 'green',
  reducedMotion: 'system',
  streaming: false
};

export function pendingId(item: PendingRun | TermBlock | null | undefined): string {
  if (!item) return '';
  if ('run_id' in item && item.run_id) return item.run_id;
  if ('runId' in item && item.runId) return item.runId;
  return '';
}

const DEFAULT_LAYOUT: SpaceLayout = {
  leftOpen: true,
  rightOpen: true,
  aiPinned: false,
  aiOpen: false,
  inspectorTab: 'findings',
  activeView: 'terminal',
  selectedTargetId: '',
  selectedFindingId: ''
};

function layoutKey(space: string) {
  return `finn.space.${space}`;
}

function loadLayout(space: string): SpaceLayout {
  try {
    const raw = localStorage.getItem(layoutKey(space));
    return raw ? { ...DEFAULT_LAYOUT, ...(JSON.parse(raw) as SpaceLayout) } : { ...DEFAULT_LAYOUT };
  } catch {
    return { ...DEFAULT_LAYOUT };
  }
}

function saveLayout(space: string, layout: SpaceLayout) {
  localStorage.setItem(layoutKey(space), JSON.stringify(layout));
}

function lastSpace(): string {
  return localStorage.getItem('finn.lastSpace') || 'default';
}

function runToBlock(run: Record<string, unknown>): TermBlock {
  const statusRaw = String(run.status || run.approval || 'pending');
  let status: TermBlock['status'] = 'pending';
  if (statusRaw === 'completed' || statusRaw === 'success') status = 'success';
  else if (statusRaw === 'failed' || statusRaw === 'timeout' || statusRaw === 'error') status = 'error';
  else if (statusRaw === 'rejected') status = 'rejected';
  else if (statusRaw === 'running') status = 'running';
  else if (run.approval === 'rejected') status = 'rejected';
  else if (run.approval === 'pending') status = 'pending';
  return {
    id: String(run.run_id || crypto.randomUUID()),
    command: String(run.command || ''),
    tool: String(run.tool || 'shell'),
    status,
    runId: String(run.run_id || ''),
    stdout: String(run.stdout || run.stderr || run.error || ''),
    exitCode: (run.exit_code as number | null) ?? null,
    duration: typeof run.duration === 'number' ? run.duration : undefined,
    safetyLevel: String(run.safety_level || 'safe'),
    createdAt: Date.now(),
    collapsed: status === 'success'
  };
}

class AppState {
  connected = $state(false);
  error = $state('');

  engagements = $state<Engagement[]>([]);
  engagement = $state(typeof window === 'undefined' ? 'default' : lastSpace());
  targets = $state<Target[]>([]);
  mode = $state<ChatMode>('hunt');
  yolo = $state(false);
  model = $state('auto');

  messages = $state<ChatMessage[]>([]);
  sessionId = $state('');
  busy = $state(false);

  pending = $state<PendingRun[]>([]);
  findings = $state<Finding[]>([]);
  notes = $state('');
  scope = $state('');
  timeline = $state('');
  plugins = $state<Plugin[]>([]);
  creds = $state<Credential[]>([]);
  loot = $state<LootItem[]>([]);

  blocks = $state<TermBlock[]>([]);
  artifact = $state<Artifact>({ title: 'Untitled', kind: 'markdown', body: '', dirty: false });

  leftSidebarOpen = $state(true);
  rightSidebarOpen = $state(true);
  aiStripOpen = $state(false);
  aiStripPinned = $state(false);
  activeView = $state<CenterView>('terminal');
  inspectorTab = $state<InspectorTab>('findings');
  selectedTargetId = $state('');
  selectedFindingId = $state('');
  newSpaceOpen = $state(false);
  setupOpen = $state(false);
  setupDismissed = $state(false);
  runtime = $state<RuntimeConfig | null>(null);
  pluginMenu = $state('');
  paletteMode = $state<'root' | 'goto'>('root');
  focusPane = $state<'left' | 'center' | 'right'>('center');

  paletteOpen = $state(false);
  settingsOpen = $state(false);
  scanlines = $state(false);
  grain = $state(false);
  sounds = $state(false);
  prefs = $state<Prefs>({ ...DEFAULT_PREFS });
  agentPins = $state<TermBlock[]>([]);
  finnFocusSeq = $state(0);

  private spaceSnapshots = new Map<
    string,
    { messages: ChatMessage[]; sessionId: string; blocks: TermBlock[]; artifact: Artifact }
  >();

  activeTarget = $derived(
    this.targets.find((t) => t.id === this.selectedTargetId) || this.targets[0]
  );
  selectedFinding = $derived(
    this.findings.find((f) => f.id === this.selectedFindingId) || null
  );
  criticalCount = $derived(this.findings.filter((f) => f.severity?.toLowerCase() === 'critical').length);
  highCount = $derived(this.findings.filter((f) => f.severity?.toLowerCase() === 'high').length);
  topPending = $derived(this.pending[0] || this.blocks.find((b) => b.status === 'pending') || null);
  lastBlock = $derived(this.blocks.length ? this.blocks[this.blocks.length - 1] : null);
  isEmptySpace = $derived(
    this.engagements.length === 0 ||
      (this.engagement === 'default' && !this.scope.trim() && this.findings.length === 0 && this.blocks.length === 0)
  );

  persist() {
    saveLayout(this.engagement, {
      leftOpen: this.leftSidebarOpen,
      rightOpen: this.rightSidebarOpen,
      aiPinned: this.aiStripPinned,
      aiOpen: this.aiStripOpen,
      inspectorTab: this.inspectorTab,
      activeView: this.activeView,
      selectedTargetId: this.selectedTargetId,
      selectedFindingId: this.selectedFindingId
    });
    localStorage.setItem('finn.lastSpace', this.engagement);
    saveExtraTargets(this.engagement, this.targets);
  }

  applyLayout(space: string) {
    const layout = loadLayout(space);
    this.leftSidebarOpen = layout.leftOpen;
    this.rightSidebarOpen = layout.rightOpen;
    this.aiStripPinned = layout.aiPinned;
    this.aiStripOpen = layout.aiOpen;
    this.inspectorTab = layout.inspectorTab;
    this.activeView = layout.activeView;
    this.selectedTargetId = layout.selectedTargetId;
    this.selectedFindingId = layout.selectedFindingId;
  }

  snapshotRuntime() {
    this.spaceSnapshots.set(this.engagement, {
      messages: this.messages,
      sessionId: this.sessionId,
      blocks: this.blocks,
      artifact: this.artifact
    });
  }

  restoreRuntime(space: string) {
    const snap = this.spaceSnapshots.get(space);
    if (snap) {
      this.messages = snap.messages;
      this.sessionId = snap.sessionId;
      this.blocks = snap.blocks;
      this.artifact = snap.artifact;
    } else {
      this.messages = [];
      this.sessionId = '';
      this.blocks = [];
      this.artifact = { title: `${space} report`, kind: 'markdown', body: '', dirty: false };
    }
  }

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
      apiGet(`/v1/findings?engagement=${encodeURIComponent(this.engagement)}`).catch(() => ({ findings: [] })),
      apiGet(`/v1/tools/pending?engagement=${encodeURIComponent(this.engagement)}`).catch(() => ({ pending: [] })),
      apiGet(`/v1/engagements/${encodeURIComponent(this.engagement)}/notes`).catch(() => ({ notes: '' })),
      apiGet(`/v1/engagements/${encodeURIComponent(this.engagement)}/scope`).catch(() => ({ scope: '' }))
    ]);
    this.engagements = eng.engagements || [];
    this.plugins = plugins.plugins || [];
    this.yolo = Boolean(yolo.yolo_enabled);
    this.findings = findings.findings || [];
    this.pending = pending.pending || [];
    this.notes = notes.notes || '';
    this.scope = scope.scope || '';
    try {
      const rt = (await apiGet('/v1/runtime')) as RuntimeConfig;
      this.runtime = rt;
      if (!rt.setup_complete && !this.setupDismissed) this.setupOpen = true;
    } catch {
      /* offline */
    }
    const extras = loadExtraTargets(this.engagement);
    this.targets = hostsToTargets(parseScopeHosts(this.scope), extras);
    if (this.selectedTargetId && !this.targets.some((t) => t.id === this.selectedTargetId)) {
      this.selectedTargetId = this.targets[0]?.id || '';
    }
    const [creds, loot, timeline, history] = await Promise.all([
      listCredentials(this.engagement).catch(() => ({ credentials: [] })),
      listLoot(this.engagement).catch(() => ({ loot: [] })),
      getTimeline(this.engagement).catch(() => ({ timeline: '' })),
      getToolHistory(this.engagement, 40).catch(() => ({ history: [] }))
    ]);
    this.creds = creds.credentials || [];
    this.loot = (loot.loot || []).map((item: { name?: string; size?: number; path?: string; id?: string }, i: number) => ({
      id: item.id || item.name || String(i),
      name: item.name || 'loot',
      size: item.size || 0,
      source: item.path || '',
      timestamp: '',
      type: (item.name || '').split('.').pop() || 'file'
    }));
    this.timeline = timeline.timeline || '';
    const providers = await apiGet('/v1/providers').catch(() => ({ resolved: [] }));
    const enabled = (providers.resolved || []).find((p: { enabled: boolean }) => p.enabled);
    this.model = enabled ? `${enabled.name}/${enabled.model}` : 'auto';

    const pendingIds = new Set(this.pending.map((p) => p.run_id));
    const known = new Set(this.blocks.map((b) => b.runId).filter(Boolean));
    const fromHistory = (history.history || [])
      .map((run) => runToBlock(run))
      .filter((b) => b.runId && !known.has(b.runId));
    const fromPending = this.pending
      .filter((p) => !known.has(p.run_id))
      .map((p) =>
        runToBlock({
          run_id: p.run_id,
          command: p.command,
          tool: p.tool,
          status: 'pending',
          approval: 'pending',
          safety_level: p.safety_level
        })
      );
    if (this.blocks.length === 0) {
      this.blocks = [...fromHistory.reverse(), ...fromPending];
    } else {
      this.blocks = [
        ...this.blocks.map((b) => {
          if (b.runId && pendingIds.has(b.runId)) return { ...b, status: 'pending' as const };
          return b;
        }),
        ...fromPending.filter((b) => !known.has(b.runId))
      ];
    }
  }

  async ensureEngagement() {
    await apiPost('/v1/engagements', { name: this.engagement });
  }

  async select(name: string) {
    this.persist();
    this.snapshotRuntime();
    this.engagement = name;
    this.applyLayout(name);
    this.restoreRuntime(name);
    await this.refresh();
    this.persist();
  }

  async createEngagement(name: string, scope = '') {
    await apiPost('/v1/engagements', { name, scope });
    if (scope) {
      await apiPut(`/v1/engagements/${encodeURIComponent(name)}/scope`, { scope });
    }
    toast.show(`Space ${name} ready`);
    this.newSpaceOpen = false;
    await this.select(name);
  }

  selectTarget(target: Target) {
    this.selectedTargetId = target.id;
    this.persist();
  }

  selectFinding(finding: Finding | null) {
    this.selectedFindingId = finding?.id || '';
    this.inspectorTab = 'findings';
    this.persist();
  }

  addTarget(host: string) {
    const trimmed = host.trim();
    if (!trimmed) return;
    if (this.targets.some((t) => t.host === trimmed)) {
      toast.show('Target already in Space', 'warn');
      return;
    }
    const target: Target = {
      id: crypto.randomUUID(),
      host: trimmed,
      ports: [],
      status: 'pending'
    };
    this.targets = [...this.targets, target];
    this.selectedTargetId = target.id;
    const nextScope = this.scope.trim() ? `${this.scope.trim()}\n${trimmed}` : trimmed;
    this.scope = nextScope;
    void this.saveScope();
    this.persist();
  }

  pinBlockForAgent(block: TermBlock) {
    if (this.agentPins.some((p) => p.id === block.id)) {
      this.openFinn({ focus: true });
      return;
    }
    this.agentPins = [...this.agentPins, block];
    this.openFinn({ focus: true });
    toast.show('Attached to Finn');
  }

  unpinAgentBlock(id: string) {
    this.agentPins = this.agentPins.filter((p) => p.id !== id);
  }

  openFinn(opts: { focus?: boolean } = {}) {
    this.aiStripOpen = true;
    if (opts.focus) this.finnFocusSeq += 1;
    this.persist();
  }

  private agentPrompt(userText: string, pins: TermBlock[]): string {
    if (!pins.length) return userText;
    const chunks = pins.map(
      (block) => `Attached terminal @${block.tool}\n$ ${block.command}\n${block.stdout.slice(0, 2500)}`
    );
    return `${chunks.join('\n\n')}\n\n${userText}`;
  }

  async send(text: string) {
    const trimmed = text.trim().replace(/^\/ask\s+/i, '');
    if (!trimmed) return;
    this.busy = true;
    this.openFinn({ focus: true });
    const pins = this.agentPins;
    const attachments: ChatAttachment[] = pins.map((b) => ({
      kind: 'block',
      id: b.id,
      label: `$ ${b.command.slice(0, 72)}`
    }));
    this.agentPins = [];
    this.messages = [...this.messages, { role: 'user', content: trimmed, attachments }];
    try {
      await this.ensureEngagement();
      const result = await apiPost('/v1/chat', {
        engagement: this.engagement,
        message: this.agentPrompt(trimmed, pins),
        mode: this.mode,
        session_id: this.sessionId || null,
        hunt: this.mode === 'hunt'
      });
      this.sessionId = result.session_id || this.sessionId;
      const runIds: string[] = [];
      for (const run of result.runs || []) {
        this.ingestRun(run);
        const id = String(run.run_id || '');
        if (id) runIds.push(id);
      }
      let content = String(result.text || '').trim();
      if (result.status === 'hunt_started') {
        content = content || 'Hunt started. I’ll keep working against this Space and propose commands as they come.';
      }
      if (!content && (result.commands || []).length) {
        content = 'Proposed the following. Approve a run in the card, or ask me to change it.';
      }
      if (!content && runIds.length) {
        content = 'Queued tool runs. Approve them here or in the terminal.';
      }
      if (!content) {
        content = 'I didn’t get a reply from the model. Check providers in Settings, then try again.';
      }
      this.messages = [
        ...this.messages,
        { role: 'assistant', content, commands: result.commands || [], runIds }
      ];
      await this.refresh();
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'chat failed';
      this.messages = [...this.messages, { role: 'assistant', content: this.error }];
    } finally {
      this.busy = false;
    }
  }

  ingestRun(run: Record<string, unknown>) {
    const block = runToBlock(run);
    const idx = this.blocks.findIndex((b) => b.runId && b.runId === block.runId);
    if (idx >= 0) {
      this.blocks = this.blocks.map((b, i) => (i === idx ? { ...b, ...block } : b));
    } else {
      this.blocks = [...this.blocks, block];
    }
  }

  async proposeShell(command: string) {
    const cmd = command.trim();
    if (!cmd) return;
    await this.ensureEngagement();
    const tool = guessShellTool(cmd);
    if (this.yolo) {
      const placeholder: TermBlock = {
        id: crypto.randomUUID(),
        command: cmd,
        tool,
        status: 'running',
        stdout: '',
        createdAt: Date.now(),
        collapsed: false
      };
      this.blocks = [...this.blocks, placeholder];
      try {
        const run = await apiPost('/v1/yolo/execute', {
          engagement: this.engagement,
          tool,
          command: cmd,
          timeout: 300
        });
        this.blocks = this.blocks.map((b) => (b.id === placeholder.id ? runToBlock(run) : b));
      } catch (err) {
        this.blocks = this.blocks.map((b) =>
          b.id === placeholder.id
            ? { ...b, status: 'error', stdout: err instanceof Error ? err.message : 'failed' }
            : b
        );
      }
      await this.refresh();
      return;
    }
    const proposed = await apiPost('/v1/tools/propose', {
      engagement: this.engagement,
      tool,
      command: cmd,
      safety_level: 'safe'
    });
    this.ingestRun({ ...proposed, status: 'pending', approval: 'pending' });
    toast.show('Command awaiting approval', 'warn');
    await this.refresh();
  }

  async runPlugin(pluginName: string, target: string) {
    await this.ensureEngagement();
    const result = await apiPost('/v1/plugins/run', {
      engagement: this.engagement,
      plugin_name: pluginName,
      target,
      args: {}
    });
    for (const run of result.proposed_runs || []) {
      this.ingestRun({ ...run, status: 'pending', approval: 'pending' });
    }
    this.pluginMenu = '';
    toast.show(`${pluginName} proposed against ${target}`, 'info');
    if (this.yolo && this.prefs.autoApproveOnYolo) {
      for (const run of result.proposed_runs || []) {
        if (run.run_id) await this.approve(String(run.run_id));
      }
    }
    await this.refresh();
  }

  async toggleYolo() {
    await apiPost('/v1/yolo/toggle', { engagement: this.engagement, enabled: !this.yolo });
    await this.refresh();
    toast.show(this.yolo ? 'YOLO on — commands still logged' : 'YOLO off — approval required', this.yolo ? 'warn' : 'ok');
  }

  async approve(runId?: string, edited?: string) {
    const pending = this.topPending;
    const id =
      runId ||
      (pending && 'run_id' in pending ? pending.run_id : this.blocks.find((b) => b.status === 'pending')?.runId);
    if (!id) return;
    this.blocks = this.blocks.map((b) => (b.runId === id ? { ...b, status: 'running' } : b));
    await apiApprove(id, edited);
    const executed = await apiPost('/v1/tools/execute', { run_id: id });
    this.ingestRun(executed);
    toast.show(executed.status === 'failed' ? 'Command failed' : 'Command completed', executed.status === 'failed' ? 'danger' : 'ok');
    await this.refresh();
  }

  async reject(runId?: string) {
    const pending = this.topPending;
    const id =
      runId ||
      (pending && 'run_id' in pending ? pending.run_id : this.blocks.find((b) => b.status === 'pending')?.runId);
    if (!id) return;
    await apiReject(id);
    this.blocks = this.blocks.map((b) => (b.runId === id ? { ...b, status: 'rejected' } : b));
    toast.show('Command rejected', 'info');
    await this.refresh();
  }

  async saveNotes() {
    await apiPut(`/v1/engagements/${encodeURIComponent(this.engagement)}/notes`, { notes: this.notes });
    toast.show('Notes saved');
  }

  async saveScope() {
    await apiPut(`/v1/engagements/${encodeURIComponent(this.engagement)}/scope`, { scope: this.scope });
  }

  async saveArtifact() {
    if (this.artifact.kind === 'markdown') {
      this.notes = this.artifact.body;
      await this.saveNotes();
    }
    this.artifact = { ...this.artifact, dirty: false };
  }

  async draftReport() {
    this.activeView = 'artifact';
    this.artifact = { ...this.artifact, title: `${this.engagement} report`, kind: 'markdown', dirty: true };
    try {
      const data = await generateReport({ engagement: this.engagement, format: 'markdown' });
      const body = typeof data.report === 'string' ? data.report : JSON.stringify(data.report, null, 2);
      this.artifact = { ...this.artifact, body, dirty: true };
    } catch {
      this.artifact = {
        ...this.artifact,
        body: `# ${this.engagement}\n\n${this.notes || '_No notes yet._'}\n`
      };
    }
  }

  askAboutFinding(finding: Finding, prompt: string) {
    this.selectFinding(finding);
    void this.send(`${prompt}\n\nFinding: ${finding.title}\n\n${finding.body.slice(0, 4000)}`);
  }

  openFindingArtifact(finding: Finding) {
    this.selectFinding(finding);
    this.activeView = 'artifact';
    this.artifact = {
      title: finding.title,
      kind: 'markdown',
      body: finding.body,
      dirty: false
    };
  }

  bookmarkBlock(block: TermBlock) {
    const stamp = new Date().toISOString();
    this.notes = `${this.notes ? this.notes.trim() + '\n\n' : ''}## Evidence ${stamp}\n\n\`$ ${block.command}\`\n\n\`\`\`\n${block.stdout.slice(0, 4000)}\n\`\`\`\n`;
    void this.saveNotes();
    toast.show('Block saved to notes');
  }

  toggleLeft() {
    this.leftSidebarOpen = !this.leftSidebarOpen;
    this.persist();
  }

  toggleRight() {
    this.rightSidebarOpen = !this.rightSidebarOpen;
    this.persist();
  }

  toggleAi() {
    this.aiStripOpen = !this.aiStripOpen;
    if (this.aiStripOpen) this.finnFocusSeq += 1;
    this.persist();
  }

  hideFinn() {
    this.aiStripOpen = false;
    this.persist();
  }

  pinAi() {
    this.aiStripPinned = !this.aiStripPinned;
    if (this.aiStripPinned) this.aiStripOpen = true;
    this.persist();
  }

  setView(view: CenterView) {
    this.activeView = view;
    this.focusPane = 'center';
    this.persist();
  }

  setMode(mode: ChatMode) {
    this.mode = mode;
  }

  async setYolo(enabled: boolean) {
    if (this.yolo === enabled) return;
    await this.toggleYolo();
  }

  topPendingId(): string {
    return pendingId(this.topPending);
  }

  toggleBlock(id: string) {
    this.blocks = this.blocks.map((b) => (b.id === id ? { ...b, collapsed: !b.collapsed } : b));
  }

  loadPrefs() {
    try {
      const raw = localStorage.getItem('finn.prefs');
      if (raw) this.prefs = { ...DEFAULT_PREFS, ...(JSON.parse(raw) as Prefs) };
    } catch {
      this.prefs = { ...DEFAULT_PREFS };
    }
    this.grain = this.prefs.grain;
    this.scanlines = this.prefs.scanlines;
    this.sounds = this.prefs.sounds;
    this.applyAppearance();
  }

  persistPrefs() {
    this.prefs = {
      ...this.prefs,
      grain: this.grain,
      scanlines: this.scanlines,
      sounds: this.sounds
    };
    localStorage.setItem('finn.prefs', JSON.stringify(this.prefs));
    this.applyAppearance();
  }

  applyAppearance() {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    root.classList.toggle('grain-on', this.prefs.grain);
    root.dataset.theme = this.prefs.theme;
    root.dataset.accent = this.prefs.accent;
    const reduce =
      this.prefs.reducedMotion === 'on' ||
      (this.prefs.reducedMotion === 'system' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    root.classList.toggle('reduce-motion', reduce);
  }
}

export const appState = new AppState();

export function savePrefs() {
  appState.persistPrefs();
}
