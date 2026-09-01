// Agent store — Svelte writable-derived store, backed by NIL API
import { writable, derived } from 'svelte/store';
import api, { type ChatRequest, type ToolPropose, type ToolApprove } from '$lib/api';

export interface AgentBlock {
  id: string;
  type: 'tool' | 'diff' | 'finding' | 'plan' | 'artifact' | 'message';
  role?: 'user' | 'assistant';
  content?: string;
  tool?: string;
  args?: Record<string, any>;
  status?: 'proposed' | 'running' | 'done' | 'failed';
  output?: string;
  error?: string;
  cost?: { inputTokens: number; outputTokens: number; estCostUSD: number };
  startTime?: number;
  endTime?: number;
  file?: string;
  oldContent?: string;
  newContent?: string;
  language?: string;
  finding?: any;
}

export interface AgentPlanStep {
  id: string;
  label: string;
  status: 'done' | 'running' | 'pending';
  detail?: string;
}

const _blocks = writable<AgentBlock[]>([]);
const _plan = writable<AgentPlanStep[]>([]);
const _pendingApproval = writable<AgentBlock | null>(null);
const _findings = writable<any[]>([]);
const _running = writable(false);
const _sessionId = writable<string | null>(null);

export const agentStore = derived(
  [_blocks, _plan, _pendingApproval, _findings, _running, _sessionId],
  ([$blocks, $plan, $pendingApproval, $findings, $running, $sessionId]) => ({
    blocks: $blocks,
    plan: $plan,
    pendingApproval: $pendingApproval,
    findings: $findings,
    running: $running,
    sessionId: $sessionId,
  })
);

export function clear() {
  _blocks.set([]);
  _plan.set([]);
  _pendingApproval.set(null);
  _findings.set([]);
  _running.set(false);
  _sessionId.set(null);
}

export async function sendMessage(input: string, engagement: string, mode: string) {
  _running.set(true);
  _blocks.update(b => [...b, {
    id: `user-${Date.now()}`,
    type: 'message',
    role: 'user',
    content: input,
  }]);

  try {
    const body: ChatRequest = {
      engagement,
      messages: [{ role: 'user', content: input }],
      mode: mode as any,
      stream: false,
    };
    const res = await api.chat(body);

    _sessionId.set(res.session_id);

    // Parse response for tool proposal (if assistant includes JSON)
    const toolMatch = res.response.match(/```json\s*({.*?})\s*```/s);
    if (toolMatch) {
      try {
        const tool = JSON.parse(toolMatch[1]);
        const proposal: AgentBlock = {
          id: `tool-${Date.now()}`,
          type: 'tool',
          tool: tool.tool || 'run_command',
          args: tool.args || {},
          status: 'proposed',
          content: tool.reason || res.response,
        };
        _blocks.update(b => [...b, {
          id: `assistant-${Date.now()}`,
          type: 'message',
          role: 'assistant',
          content: res.response,
        }, proposal]);
        _pendingApproval.set(proposal);
        _plan.set([
          { id: '1', label: 'Analyze target', status: 'done' },
          { id: '2', label: `Run ${tool.tool || 'command'}`, status: 'pending' },
          { id: '3', label: 'Process output', status: 'pending' },
        ]);
      } catch {
        _blocks.update(b => [...b, {
          id: `assistant-${Date.now()}`,
          type: 'message',
          role: 'assistant',
          content: res.response,
        }]);
      }
    } else {
      _blocks.update(b => [...b, {
        id: `assistant-${Date.now()}`,
        type: 'message',
        role: 'assistant',
        content: res.response,
      }]);
    }
  } catch (err: any) {
    _blocks.update(b => [...b, {
      id: `error-${Date.now()}`,
      type: 'message',
      role: 'assistant',
      content: `Error: ${err.message}`,
    }]);
  } finally {
    _running.set(false);
  }
}

export async function proposeTool(engagement: string, tool: string, command: string, safety_level: 'safe' | 'unsafe' | 'dangerous' = 'safe') {
  _running.set(true);
  try {
    const body: ToolPropose = { engagement, tool, command, safety_level };
    const run = await api.proposeTool(body);

    const block: AgentBlock = {
      id: run.id,
      type: 'tool',
      tool: run.tool,
      args: { command: run.command },
      status: 'proposed',
      output: run.output,
      error: run.error,
    };
    _blocks.update(b => [...b, block]);
    _pendingApproval.set(block);
    _plan.set([
      { id: '1', label: 'Proposed', status: 'done' },
      { id: '2', label: 'Waiting approval', status: 'running' },
      { id: '3', label: 'Execute', status: 'pending' },
    ]);
    return run;
  } finally {
    _running.set(false);
  }
}

export async function approve(id: string, engagement: string) {
  _running.set(true);
  _pendingApproval.set(null);

  _blocks.update(blocks => {
    const block = blocks.find(b => b.id === id);
    if (block) {
      block.status = 'running';
      block.startTime = Date.now();
    }
    return blocks;
  });

  try {
    const body: ToolApprove = { run_id: id };
    const run = await api.approveTool(body);

    _blocks.update(blocks => {
      const block = blocks.find(b => b.id === id);
      if (block) {
        block.status = run.status === 'error' ? 'failed' : 'done';
        block.endTime = Date.now();
        block.output = run.output;
        block.error = run.error;
        block.cost = { inputTokens: 0, outputTokens: 0, estCostUSD: 0 };
      }
      return blocks;
    });

    _plan.update(p => p.map(step => step.status === 'running' ? { ...step, status: 'done' } : step));
  } catch (err: any) {
    _blocks.update(blocks => {
      const block = blocks.find(b => b.id === id);
      if (block) {
        block.status = 'failed';
        block.error = err.message;
      }
      return blocks;
    });
  } finally {
    _running.set(false);
  }
}

export function reject(id: string) {
  api.rejectTool(id).catch(console.error);
  _blocks.update(b => b.filter(x => x.id !== id));
  _pendingApproval.set(null);
}

export function edit(id: string) {
  console.log('edit', id);
}

export function cancel() {
  _running.set(false);
  _blocks.update(b => b.filter(x => x.status !== 'running'));
}

export function addFinding(finding: any) {
  _findings.update(f => [...f, finding]);
}
