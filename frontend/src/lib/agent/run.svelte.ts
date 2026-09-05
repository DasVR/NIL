import api, { type ChatRequest, type ToolApprove, type ToolRun } from '$lib/api';
import type { ApprovalGrant, Finding, Step, TokenUsage, ToolState, ToolStep } from './types';
import { fromApiUsage } from '$lib/usage/format';
import { usageStore } from '$lib/usage/store.svelte.ts';

let steps = $state<Step[]>([]);
let findings = $state<Finding[]>([]);
let running = $state(false);
let interrupted = $state(false);
let sessionId = $state<string | null>(null);
let toolIndex = 0;

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

function chatText(res: { response?: string; text?: string }): string {
  return res.response || res.text || '';
}

export const agentRun = {
  get steps() { return steps; },
  get findings() { return findings; },
  get running() { return running; },
  get interrupted() { return interrupted; },
  get sessionId() { return sessionId; },
  get pendingApproval() {
    return steps.find((s): s is ToolStep => s.kind === 'tool' && s.state === 'pending') ?? null;
  },

  clear() {
    steps = [];
    findings = [];
    running = false;
    interrupted = false;
    sessionId = null;
    toolIndex = 0;
  },

  stop() {
    running = false;
    interrupted = true;
    const last = steps[steps.length - 1];
    if (last?.kind === 'message' && last.role === 'assistant') {
      last.interrupted = true;
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

  async sendMessage(input: string, engagement: string, mode: string) {
    interrupted = false;
    running = true;
    steps = [...steps, {
      kind: 'message',
      id: `user-${Date.now()}`,
      role: 'user',
      text: input,
    }];

    try {
      const body: ChatRequest = { engagement, message: input, mode: mode as ChatRequest['mode'], stream: false };
      const res = await api.chat(body);
      sessionId = res.session_id;
      if (interrupted) return;

      const usage: TokenUsage | null = fromApiUsage(res.usage);
      usageStore.recordTurn(usage);
      void usageStore.refresh(engagement);

      const assistantText = chatText(res);
      steps = [...steps, {
        kind: 'message',
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        text: assistantText,
        usage: usage ?? undefined,
      }];

      const reason = stripFences(assistantText).slice(0, 280);
      const pendingRuns = (res.runs || []).filter((run) => run.approval === 'pending');
      const toolCalls = res.tool_call ? [res.tool_call] : [];
      if (pendingRuns.length === 0 && toolCalls.length === 0) {
        for (const run of res.runs || []) {
          if (run.approval === 'pending') continue;
          toolIndex += 1;
          const tool: ToolStep = {
            kind: 'tool',
            id: runId(run),
            index: toolIndex,
            name: run.tool || 'run_command',
            primaryArg: run.command,
            args: { command: run.command },
            state: mapRunState(run),
            output: runOutput(run),
            error: run.error,
            exitCode: run.exit_code ?? run.returncode,
            safetyLevel: run.safety_level,
            usage: usage ?? undefined,
          };
          steps = [...steps, tool];
        }
        return;
      }

      if (res.tool_call) {
        const tc = res.tool_call;
        toolIndex += 1;
        const command = primaryArg(tc.args, '');
        const tool: ToolStep = {
          kind: 'tool',
          id: tc.run_id || `tool-${Date.now()}`,
          index: toolIndex,
          name: tc.tool || 'run_command',
          primaryArg: command,
          args: tc.args || {},
          state: 'pending',
          safetyLevel: tc.safety_level,
          reason,
          usage: usage ?? undefined,
        };
        steps = [...steps, tool];
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Request failed';
      steps = [...steps, {
        kind: 'message',
        id: `error-${Date.now()}`,
        role: 'assistant',
        text: message,
      }];
    } finally {
      running = false;
    }
  },

  async proposeTool(engagement: string, tool: string, command: string, safety_level: 'safe' | 'unsafe' | 'dangerous' = 'safe') {
    running = true;
    interrupted = false;
    try {
      const run = await api.proposeTool({ engagement, tool, command, safety_level });
      toolIndex += 1;
      const step: ToolStep = {
        kind: 'tool',
        id: runId(run),
        index: toolIndex,
        name: run.tool,
        primaryArg: run.command,
        args: { command: run.command },
        state: mapRunState(run),
        output: runOutput(run),
        error: run.error,
        safetyLevel: run.safety_level,
      };
      steps = [...steps, step];
      return run;
    } finally {
      running = false;
    }
  },

  async approve(id: string, grant: ApprovalGrant = 'once') {
    const step = steps.find((s): s is ToolStep => s.kind === 'tool' && s.id === id);
    if (!step) return;
    step.state = 'running';
    step.startTime = Date.now();
    running = true;
    interrupted = false;

    try {
      const body: ToolApprove = { run_id: id, grant, execute: true };
      const run = await api.approveTool(body);
      if (interrupted) return;
      step.state = mapRunState(run);
      if (step.state === 'pending' || run.status === 'approved') {
        step.state = run.error ? 'error' : 'ok';
      }
      step.endTime = Date.now();
      step.output = runOutput(run);
      step.error = run.error;
      step.exitCode = run.exit_code ?? run.returncode;
    } catch (err: unknown) {
      step.state = 'error';
      step.error = err instanceof Error ? err.message : 'Approve failed';
    } finally {
      running = false;
    }
  },

  reject(id: string) {
    api.rejectTool(id).catch(console.error);
    const step = steps.find((s): s is ToolStep => s.kind === 'tool' && s.id === id);
    if (step) {
      step.state = 'error';
      step.error = 'Denied';
    }
  },

  addFinding(finding: Finding) {
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
    }];
  },
};

export const sendMessage = agentRun.sendMessage.bind(agentRun);
export const proposeTool = agentRun.proposeTool.bind(agentRun);
export const approve = agentRun.approve.bind(agentRun);
export const reject = agentRun.reject.bind(agentRun);
export const cancel = agentRun.stop.bind(agentRun);
export const clear = agentRun.clear.bind(agentRun);
export const addFinding = agentRun.addFinding.bind(agentRun);
