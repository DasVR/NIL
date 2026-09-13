import api, { type ChatRequest, type ChatResponse, type TokenUsagePayload, type ToolApprove, type ToolRun } from '$lib/api';
import type { ApprovalGrant, Finding, Step, TokenUsage, ToolState, ToolStep } from './types';
import { fromListedFinding, type ListedFinding } from '$lib/findings/display';
import { fromApiUsage } from '$lib/usage/format';
import { usageStore } from '$lib/usage/store.svelte.ts';
import { clarifyFromPayload, parseClarifyFromText, transcriptForClarify, type AgentClarify } from './clarify';

export interface TurnExtras {
  model?: string;
  effort?: 'low' | 'medium' | 'high';
}

export interface QueuedTurn {
  id: string;
  text: string;
  engagement: string;
  mode: string;
  model?: string;
  effort?: 'low' | 'medium' | 'high';
}

let steps = $state<Step[]>([]);
let findings = $state<Finding[]>([]);
let running = $state(false);
let interrupted = $state(false);
let sessionId = $state<string | null>(null);
let startedAt = $state<number | null>(null);
let toolIndex = 0;
let queued = $state<QueuedTurn[]>([]);
let engagementLog = $state<string[]>([]);
let huntLoop = $state(false);
let lastEngagement = $state<string | null>(null);
let httpInFlight = false;
let settleTimer: ReturnType<typeof setTimeout> | null = null;
let clarify = $state<AgentClarify | null>(null);

function markRunning() {
  if (!running) startedAt = Date.now();
  running = true;
  interrupted = false;
}

function primaryArg(args: unknown, fallback: string): string {
  if (args && typeof args === 'object') {
    const rec = args as Record<string, unknown>;
    const v = rec.command ?? rec.target ?? rec.path ?? rec.url ?? rec.host;
    if (typeof v === 'string' && v.length) return v;
  }
  return fallback;
}

function runId(run: ToolRun): string {
  return run.run_id || run.id || '';
}

function runOutput(run: ToolRun): string | undefined {
  return run.output || run.stdout || undefined;
}

function mapRunState(run: ToolRun): ToolState {
  if (run.approval === 'rejected') return 'error';
  if (run.status === 'running') return 'running';
  if (run.status === 'pending' || run.status === 'proposed') return 'pending';
  if (run.status === 'failed' || run.status === 'error' || run.status === 'timeout' || run.status === 'cancelled') {
    return 'error';
  }
  if (run.status === 'completed' || run.status === 'done' || run.status === 'ok' || run.status === 'approved') {
    return 'ok';
  }
  return 'pending';
}

function stripFences(text: string): string {
  return text.replace(/```[\s\S]*?```/g, ' ').replace(/\s+/g, ' ').trim();
}

function chatText(res: { response?: string; text?: string; content?: string }): string {
  return res.response || res.text || res.content || '';
}

function toolsBusy(): boolean {
  return steps.some((s) => s.kind === 'tool' && (s.state === 'running' || s.state === 'pending'));
}

function settleIfIdle() {
  if (httpInFlight || interrupted) return;
  if (toolsBusy()) return;
  huntLoop = false;
  running = false;
  agentRun.drainFollowup();
}

function scheduleHuntSettle() {
  if (!huntLoop) return;
  if (settleTimer) clearTimeout(settleTimer);
  settleTimer = setTimeout(settleIfIdle, 800);
}

function appendAssistantDelta(chunk: string) {
  const t = chunk;
  if (!t) return;
  const pending = [...steps].reverse().find(
    (s): s is Extract<Step, { kind: 'message' }> => s.kind === 'message' && s.role === 'assistant' && Boolean(s.streaming),
  );
  if (pending) {
    pending.text += t;
    steps = [...steps];
    return;
  }
  steps = [...steps, {
    kind: 'message',
    id: `assistant-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    role: 'assistant',
    text: t,
    streaming: true,
  }];
}

function appendAssistant(text: string, usage?: TokenUsage, failed = false) {
  const t = text.trim();
  const pending = [...steps].reverse().find(
    (s): s is Extract<Step, { kind: 'message' }> => s.kind === 'message' && s.role === 'assistant' && Boolean(s.streaming),
  );
  if (pending) {
    if (t) pending.text = t;
    pending.streaming = false;
    pending.failed = failed;
    if (usage) pending.usage = usage;
    if (!t && !failed) {
      steps = steps.filter((s) => s.id !== pending.id);
      return;
    }
    steps = [...steps];
    return;
  }
  if (!t) return;
  const last = steps[steps.length - 1];
  if (last?.kind === 'message' && last.role === 'assistant' && last.text === t) return;
  steps = [...steps, {
    kind: 'message',
    id: `assistant-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    role: 'assistant',
    text: t,
    failed,
    usage,
  }];
}

function appendThought(text: string) {
  const t = text.trim();
  if (!t) return;
  steps = [...steps, {
    kind: 'thought',
    id: `thought-${Date.now()}`,
    text: t,
  }];
}

function upsertToolFromRun(run: ToolRun, reason?: string, usage?: TokenUsage) {
  const id = runId(run) || `tool-${run.tool || 'run'}-${run.command || ''}`;
  const existing = steps.find((s): s is ToolStep => s.kind === 'tool' && s.id === id);
  if (existing) {
    existing.state = mapRunState(run);
    existing.output = runOutput(run) ?? existing.output;
    existing.error = run.error ?? existing.error;
    existing.exitCode = run.exit_code ?? run.returncode ?? existing.exitCode;
    existing.primaryArg = run.command || existing.primaryArg;
    existing.name = run.tool || existing.name;
    if (reason) existing.reason = reason;
    if (existing.state === 'running' && existing.startTime == null) existing.startTime = Date.now();
    if (existing.state === 'ok' || existing.state === 'error') existing.endTime = Date.now();
    steps = [...steps];
    return;
  }
  toolIndex += 1;
  const state = mapRunState(run);
  steps = [...steps, {
    kind: 'tool',
    id,
    index: toolIndex,
    name: run.tool || 'run_command',
    primaryArg: run.command,
    args: { command: run.command },
    state,
    output: runOutput(run),
    error: run.error,
    exitCode: run.exit_code ?? run.returncode,
    safetyLevel: run.safety_level,
    reason,
    usage,
    startTime: state === 'running' ? Date.now() : undefined,
    endTime: state === 'ok' || state === 'error' ? Date.now() : undefined,
  }];
}

function asRun(value: unknown): ToolRun | null {
  if (!value || typeof value !== 'object') return null;
  const rec = value as ToolRun;
  if (!rec.tool && !rec.command && !rec.id && !rec.run_id) return null;
  return rec;
}

function pendingTool(): boolean {
  return steps.some((s) => s.kind === 'tool' && (s.state === 'running' || s.state === 'pending'));
}

function rewriteAssistantForClarify(card: AgentClarify, sourceText: string) {
  const display = transcriptForClarify(sourceText, card);
  const last = [...steps].reverse().find(
    (s): s is Extract<Step, { kind: 'message' }> => s.kind === 'message' && s.role === 'assistant',
  );
  if (!last || last.text === display) return;
  last.text = display;
  steps = [...steps];
}

function adoptClarify(next: AgentClarify | null, sourceText?: string) {
  if (!next) return;
  if (pendingTool()) return;
  clarify = next;
  if (sourceText != null) rewriteAssistantForClarify(next, sourceText);
}

function ingestClarify(res: ChatResponse, text: string) {
  const fromPayload = clarifyFromPayload(res.clarify);
  adoptClarify(fromPayload ?? parseClarifyFromText(text), text);
}

function ingestHttpResult(res: ChatResponse, engagement?: string) {
  if (res.session_id) sessionId = res.session_id;
  const usage: TokenUsage | null = fromApiUsage(res.usage);
  if (usage) usageStore.recordTurn(usage);
  if (engagement) void usageStore.refresh(engagement);

  const assistantText = chatText(res);
  appendAssistant(assistantText, usage ?? undefined);

  for (const raw of res.findings || []) {
    const title = raw.title || 'Finding';
    if (findings.some((f) => f.title === title)) continue;
    agentRun.addFinding(fromListedFinding({
      ...raw,
      id: `finding-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    }));
  }

  const reason = stripFences(assistantText).slice(0, 280);
  for (const run of res.runs || []) {
    upsertToolFromRun(run, reason, usage ?? undefined);
  }
  if (res.tool_call) {
    const tc = res.tool_call;
    upsertToolFromRun({
      run_id: tc.run_id,
      tool: tc.tool || 'run_command',
      command: primaryArg(tc.args, ''),
      engagement: engagement || lastEngagement || '',
      status: 'pending',
      approval: 'pending',
      safety_level: tc.safety_level,
    }, reason, usage ?? undefined);
  }
  ingestClarify(res, assistantText);
}

export function toolFilePath(step: ToolStep): string | null {
  if (step.args && typeof step.args === 'object') {
    const rec = step.args as Record<string, unknown>;
    const v = rec.path ?? rec.file ?? rec.filename;
    if (typeof v === 'string' && v.length) return v;
  }
  if (/\.[a-z0-9]{1,8}$/i.test(step.primaryArg) || step.primaryArg.includes('/')) return step.primaryArg;
  return null;
}

export const agentRun = {
  get steps() { return steps; },
  get findings() { return findings; },
  get running() { return running; },
  get interrupted() { return interrupted; },
  get sessionId() { return sessionId; },
  get startedAt() { return startedAt; },
  get queued() { return queued; },
  get engagementLog() { return engagementLog; },
  get huntLoop() { return huntLoop; },
  get thinking() {
    return running && !pendingTool();
  },
  get clarify() { return clarify; },
  get pendingApproval() {
    return steps.find((s): s is ToolStep => s.kind === 'tool' && s.state === 'pending') ?? null;
  },

  dismissClarify() {
    clarify = null;
  },

  clear() {
    steps = [];
    findings = [];
    running = false;
    interrupted = false;
    sessionId = null;
    startedAt = null;
    toolIndex = 0;
    queued = [];
    engagementLog = [];
    huntLoop = false;
    httpInFlight = false;
    clarify = null;
    if (settleTimer) {
      clearTimeout(settleTimer);
      settleTimer = null;
    }
  },

  async loadEngagement(name: string) {
    const trimmed = name.trim();
    if (!trimmed) return;
    lastEngagement = trimmed;
    try {
      const [listed, timeline] = await Promise.all([
        api.listFindings(trimmed),
        api.getTimeline(trimmed),
      ]);
      const mapped = (listed.findings || []).map((row) => fromListedFinding(row as ListedFinding));
      const live = findings.filter((f) => f.id.startsWith('finding-'));
      const liveTitles = new Set(live.map((f) => f.title));
      findings = [...mapped.filter((f) => !liveTitles.has(f.title)), ...live];
      engagementLog = (timeline.timeline || '').split('\n').map((line) => line.trim()).filter(Boolean).slice(-80);
    } catch {
      // Backend down — keep whatever the current session already has.
    }
  },

  stop() {
    huntLoop = false;
    httpInFlight = false;
    running = false;
    interrupted = true;
    if (settleTimer) {
      clearTimeout(settleTimer);
      settleTimer = null;
    }
    if (lastEngagement) void api.stopHunt(lastEngagement).catch(() => undefined);
    const last = steps[steps.length - 1];
    if (last?.kind === 'message' && last.role === 'assistant') {
      last.interrupted = true;
      last.streaming = false;
      if (!last.text.trim()) last.text = 'Run interrupted.';
      steps = [...steps];
    } else {
      steps = [...steps, {
        kind: 'message',
        id: `interrupted-${Date.now()}`,
        role: 'assistant',
        text: 'Run interrupted.',
        interrupted: true,
      }];
    }
    for (const s of steps) {
      if (s.kind === 'tool' && (s.state === 'running' || s.state === 'pending')) {
        s.state = 'error';
        s.error = s.error || 'Stopped';
      }
    }
  },

  resume() {
    interrupted = false;
  },

  queueFollowup(text: string, engagement: string, mode: string, extras?: TurnExtras) {
    const trimmed = text.trim();
    if (!trimmed) return;
    queued = [...queued, {
      id: `queued-${Date.now()}-${queued.length}`,
      text: trimmed,
      engagement,
      mode,
      model: extras?.model,
      effort: extras?.effort,
    }];
  },

  dropFollowup(id: string) {
    queued = queued.filter((item) => item.id !== id);
  },

  drainFollowup() {
    if (running || interrupted || huntLoop) return;
    const next = queued[0];
    if (!next) return;
    queued = queued.slice(1);
    void agentRun.sendMessage(next.text, next.engagement, next.mode, {
      model: next.model,
      effort: next.effort,
    });
  },

  async sendMessage(input: string, engagement: string, mode: string, extras?: TurnExtras) {
    lastEngagement = engagement;
    markRunning();
    httpInFlight = true;
    steps = [...steps, {
      kind: 'message',
      id: `user-${Date.now()}`,
      role: 'user',
      text: input,
    }, {
      kind: 'message',
      id: `assistant-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      role: 'assistant',
      text: '',
      streaming: true,
    }];

    try {
      const body: ChatRequest = {
        engagement,
        message: input,
        mode: mode as ChatRequest['mode'],
        session_id: sessionId || undefined,
        hunt: mode === 'hunt',
        model: extras?.model,
        effort: extras?.effort,
      };
      const res = await api.chat(body);
      sessionId = res.session_id;
      if (interrupted) return;
      if (res.status === 'hunt_started') {
        huntLoop = true;
        appendAssistant('');
        return;
      }
      ingestHttpResult(res, engagement);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Request failed';
      appendAssistant(message, undefined, true);
    } finally {
      httpInFlight = false;
      if (huntLoop) scheduleHuntSettle();
      else {
        running = false;
        if (!interrupted) agentRun.drainFollowup();
      }
    }
  },

  applyEvent(event: Record<string, unknown>) {
    const type = typeof event.type === 'string' ? event.type : '';
    switch (type) {
      case 'chat.message': {
        const content = typeof event.content === 'string' ? event.content : '';
        appendAssistant(content);
        ingestClarify({ session_id: sessionId || '' }, content);
        if (huntLoop) scheduleHuntSettle();
        return;
      }
      case 'chat.clarify':
      case 'agent.clarify':
      case 'clarify': {
        const raw = typeof event.content === 'string' ? event.content : undefined;
        adoptClarify(clarifyFromPayload(event.clarify ?? event), raw);
        return;
      }
      case 'chat.delta':
      case 'chat.token': {
        const chunk = typeof event.content === 'string'
          ? event.content
          : (typeof event.delta === 'string' ? event.delta : '');
        appendAssistantDelta(chunk);
        markRunning();
        return;
      }
      case 'chat.command': {
        markRunning();
        upsertToolFromRun({
          tool: typeof event.tool === 'string' ? event.tool : 'run_command',
          command: typeof event.command === 'string' ? event.command : '',
          engagement: lastEngagement || '',
          status: 'pending',
          approval: 'pending',
          safety_level: typeof event.safety_level === 'string' ? event.safety_level : undefined,
        });
        return;
      }
      case 'chat.result': {
        ingestHttpResult(event as unknown as ChatResponse, lastEngagement || undefined);
        scheduleHuntSettle();
        return;
      }
      case 'tool.started': {
        const run = asRun(event.run);
        if (run) upsertToolFromRun({ ...run, status: 'running' });
        markRunning();
        return;
      }
      case 'tool.completed':
      case 'tool.error': {
        const run = asRun(event.run);
        if (run) upsertToolFromRun(run);
        scheduleHuntSettle();
        return;
      }
      case 'approval.rejected': {
        const id = typeof event.run_id === 'string' ? event.run_id : '';
        const step = steps.find((s): s is ToolStep => s.kind === 'tool' && s.id === id);
        if (step) {
          step.state = 'error';
          step.error = 'Denied';
          steps = [...steps];
        }
        return;
      }
      case 'hunt.doom.halt': {
        const command = typeof event.command === 'string' ? event.command : 'Hunt halted';
        appendThought(command);
        huntLoop = false;
        if (!httpInFlight) settleIfIdle();
        return;
      }
      case 'hunt.doom.warn': {
        const command = typeof event.command === 'string' ? event.command : 'Repeated command';
        appendThought(command);
        return;
      }
      case 'hunt.started':
        huntLoop = true;
        markRunning();
        return;
      case 'usage.turn': {
        const raw = event.usage;
        const usage = fromApiUsage(raw && typeof raw === 'object' ? raw as TokenUsagePayload : null);
        if (usage) {
          usageStore.recordTurn(usage);
          const last = [...steps].reverse().find(
            (s): s is Extract<Step, { kind: 'message' }> => s.kind === 'message' && s.role === 'assistant',
          );
          if (last) {
            last.usage = usage;
            steps = [...steps];
          }
        }
        return;
      }
      case 'approval.granted':
      case 'approval.approved':
      case 'yolo.toggled':
        return;
      default:
        return;
    }
  },

  async proposeTool(engagement: string, tool: string, command: string, safety_level: 'safe' | 'unsafe' | 'dangerous' = 'safe') {
    lastEngagement = engagement;
    markRunning();
    try {
      const run = await api.proposeTool({ engagement, tool, command, safety_level });
      upsertToolFromRun(run);
      return run;
    } finally {
      running = false;
      if (!interrupted) agentRun.drainFollowup();
    }
  },

  async approve(id: string, grant: ApprovalGrant = 'once') {
    const step = steps.find((s): s is ToolStep => s.kind === 'tool' && s.id === id);
    if (!step) return;
    step.state = 'running';
    step.startTime = Date.now();
    markRunning();

    try {
      const body: ToolApprove = { run_id: id, grant, execute: true };
      const run = await api.approveTool(body);
      if (interrupted) return;
      upsertToolFromRun(run);
    } catch (err: unknown) {
      step.state = 'error';
      step.error = err instanceof Error ? err.message : 'Approve failed';
      steps = [...steps];
    } finally {
      running = false;
      if (!interrupted) agentRun.drainFollowup();
    }
  },

  reject(id: string) {
    api.rejectTool(id).catch(console.error);
    const step = steps.find((s): s is ToolStep => s.kind === 'tool' && s.id === id);
    if (step) {
      step.state = 'error';
      step.error = 'Denied';
      steps = [...steps];
    }
  },

  addFinding(finding: Finding) {
    if (findings.some((f) => f.id === finding.id || f.title === finding.title)) return;
    findings = [...findings, finding];
    steps = [...steps, {
      kind: 'finding',
      id: finding.id,
      title: finding.title,
      severity: finding.severity,
      cvss: finding.cvss,
      vector: finding.vector,
      evidence: finding.evidence,
      assessment: finding.assessment,
      remediation: finding.remediation,
      status: finding.status,
    }];
  },
};
