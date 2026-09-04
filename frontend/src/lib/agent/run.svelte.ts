import api, { type ChatRequest, type ToolPropose, type ToolApprove } from '$lib/api';
import type { Finding, Step, ToolStep } from './types';

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
    if (!running) return;
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
      if (s.kind === 'tool' && s.state === 'running') s.state = 'error';
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

      steps = [...steps, {
        kind: 'message',
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        text: res.response,
      }];

      if (res.tool_call) {
        const tc = res.tool_call;
        toolIndex += 1;
        const tool: ToolStep = {
          kind: 'tool',
          id: tc.run_id || `tool-${Date.now()}`,
          index: toolIndex,
          name: tc.tool || 'run_command',
          primaryArg: primaryArg(tc.args, tc.reason || ''),
          args: tc.args || {},
          state: 'pending',
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
      const body: ToolPropose = { engagement, tool, command, safety_level };
      const run = await api.proposeTool(body);
      toolIndex += 1;
      const step: ToolStep = {
        kind: 'tool',
        id: run.id,
        index: toolIndex,
        name: run.tool,
        primaryArg: run.command,
        args: { command: run.command },
        state: 'pending',
        output: run.output,
        error: run.error,
      };
      steps = [...steps, step];
      return run;
    } finally {
      running = false;
    }
  },

  async approve(id: string) {
    const step = steps.find((s): s is ToolStep => s.kind === 'tool' && s.id === id);
    if (!step) return;
    step.state = 'running';
    step.startTime = Date.now();
    running = true;
    interrupted = false;

    try {
      const body: ToolApprove = { run_id: id };
      const run = await api.approveTool(body);
      if (interrupted) return;
      step.state = run.status === 'error' ? 'error' : 'ok';
      step.endTime = Date.now();
      step.output = run.output;
      step.error = run.error;
    } catch (err: unknown) {
      step.state = 'error';
      step.error = err instanceof Error ? err.message : 'Approve failed';
    } finally {
      running = false;
    }
  },

  reject(id: string) {
    api.rejectTool(id).catch(console.error);
    steps = steps.filter((s) => s.id !== id);
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
