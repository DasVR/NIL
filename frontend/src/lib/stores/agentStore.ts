import { agentRun } from '$lib/agent/run.svelte.ts';
import type { Step } from '$lib/agent/types';

export interface AgentBlock {
  id: string;
  type: 'tool' | 'diff' | 'finding' | 'plan' | 'artifact' | 'message';
  role?: 'user' | 'assistant';
  content?: string;
  tool?: string;
  args?: Record<string, unknown>;
  status?: 'proposed' | 'running' | 'done' | 'failed';
  output?: string;
  error?: string;
  cost?: { inputTokens: number; outputTokens: number; estCostUSD: number };
  startTime?: number;
  endTime?: number;
}

export interface AgentPlanStep {
  id: string;
  label: string;
  status: 'done' | 'running' | 'pending';
  detail?: string;
}

export function stepToBlock(s: Step): AgentBlock {
  if (s.kind === 'tool') {
    return {
      id: s.id,
      type: 'tool',
      tool: s.name,
      args: (s.args ?? {}) as Record<string, unknown>,
      status: s.state === 'pending' ? 'proposed'
        : s.state === 'running' ? 'running'
        : s.state === 'ok' ? 'done'
        : 'failed',
      output: s.output,
      error: s.error,
      cost: s.usage
        ? { inputTokens: s.usage.promptTokens, outputTokens: s.usage.completionTokens, estCostUSD: s.usage.costUsd }
        : undefined,
      startTime: s.startTime,
      endTime: s.endTime,
    };
  }
  if (s.kind === 'message') {
    return { id: s.id, type: 'message', role: s.role, content: s.text };
  }
  if (s.kind === 'finding') {
    return { id: s.id, type: 'finding' };
  }
  return { id: s.id, type: 'message', content: s.text };
}

export const agentStore = agentRun;

export const sendMessage = agentRun.sendMessage.bind(agentRun);
export const proposeTool = agentRun.proposeTool.bind(agentRun);
export const approve = agentRun.approve.bind(agentRun);
export const reject = agentRun.reject.bind(agentRun);
export const cancel = agentRun.stop.bind(agentRun);
export const clear = agentRun.clear.bind(agentRun);
export const addFinding = agentRun.addFinding.bind(agentRun);
