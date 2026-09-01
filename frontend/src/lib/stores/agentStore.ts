// Agent store — custom Svelte store with state + actions combined
import { writable, get } from 'svelte/store';
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

interface AgentState {
  blocks: AgentBlock[];
  plan: AgentPlanStep[];
  pendingApproval: AgentBlock | null;
  findings: any[];
  running: boolean;
  sessionId: string | null;
}

const initial: AgentState = {
  blocks: [],
  plan: [],
  pendingApproval: null,
  findings: [],
  running: false,
  sessionId: null,
};

function createAgentStore() {
  const { subscribe, set, update } = writable<AgentState>(initial);

  function getState() { return get({ subscribe }); }

  return {
    subscribe,
    get blocks() { return getState().blocks; },
    get plan() { return getState().plan; },
    get pendingApproval() { return getState().pendingApproval; },
    get findings() { return getState().findings; },
    get running() { return getState().running; },
    get sessionId() { return getState().sessionId; },

    clear() {
      set(initial);
    },

    async sendMessage(input: string, engagement: string, mode: string) {
      update(s => ({ ...s, running: true, blocks: [...s.blocks, {
        id: `user-${Date.now()}`, type: 'message', role: 'user', content: input
      }]}));

      try {
        const body: ChatRequest = { engagement, message: input, mode: mode as any, stream: false };
        const res = await api.chat(body);

        update(s => ({
          ...s,
          sessionId: res.session_id,
          blocks: [...s.blocks, { id: `assistant-${Date.now()}`, type: 'message', role: 'assistant', content: res.response }],
        }));

        // If backend signals a tool call, render a proposal block
        if (res.tool_call) {
          const tc = res.tool_call;
          const proposal: AgentBlock = {
            id: tc.run_id || `tool-${Date.now()}`,
            type: 'tool',
            tool: tc.tool || 'run_command',
            args: tc.args || {},
            status: 'proposed',
            content: tc.reason,
          };
          update(s => ({
            ...s,
            blocks: [...s.blocks, proposal],
            pendingApproval: proposal,
            plan: [
              { id: '1', label: 'Analyze target', status: 'done' },
              { id: '2', label: `Run ${tc.tool || 'command'}`, status: 'pending' },
              { id: '3', label: 'Process output', status: 'pending' },
            ],
          }));
        }
      } catch (err: any) {
        update(s => ({
          ...s,
          blocks: [...s.blocks, { id: `error-${Date.now()}`, type: 'message', role: 'assistant', content: `Error: ${err.message}` }],
        }));
      } finally {
        update(s => ({ ...s, running: false }));
      }
    },

    async proposeTool(engagement: string, tool: string, command: string, safety_level: 'safe' | 'unsafe' | 'dangerous' = 'safe') {
      update(s => ({ ...s, running: true }));
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
        update(s => ({
          ...s,
          blocks: [...s.blocks, block],
          pendingApproval: block,
          plan: [
            { id: '1', label: 'Proposed', status: 'done' },
            { id: '2', label: 'Waiting approval', status: 'running' },
            { id: '3', label: 'Execute', status: 'pending' },
          ],
        }));
        return run;
      } finally {
        update(s => ({ ...s, running: false }));
      }
    },

    async approve(id: string) {
      update(s => {
        const blocks = s.blocks.map(b => b.id === id ? { ...b, status: 'running' as const, startTime: Date.now() } : b);
        return { ...s, blocks, pendingApproval: null, running: true };
      });

      try {
        const body: ToolApprove = { run_id: id };
        const run = await api.approveTool(body);
        update(s => {
          const blocks = s.blocks.map(b => b.id === id ? {
            ...b,
            status: (run.status === 'error' ? 'failed' : 'done') as AgentBlock['status'],
            endTime: Date.now(),
            output: run.output,
            error: run.error,
            cost: { inputTokens: 0, outputTokens: 0, estCostUSD: 0 }
          } : b);
          const plan = s.plan.map(p => p.status === 'running' ? { ...p, status: 'done' as AgentPlanStep['status'] } : p);
          return { ...s, blocks, plan, running: false };
        });
      } catch (err: any) {
        update(s => {
          const blocks = s.blocks.map(b => b.id === id ? { ...b, status: 'failed' as const, error: err.message } : b);
          return { ...s, blocks, running: false };
        });
      }
    },

    reject(id: string) {
      api.rejectTool(id).catch(console.error);
      update(s => ({
        ...s,
        blocks: s.blocks.filter(b => b.id !== id),
        pendingApproval: s.pendingApproval?.id === id ? null : s.pendingApproval,
      }));
    },

    edit(id: string) {
      console.log('edit', id);
    },

    cancel() {
      update(s => ({ ...s, running: false, blocks: s.blocks.filter(b => b.status !== 'running') }));
    },

    addFinding(finding: any) {
      update(s => ({ ...s, findings: [...s.findings, finding] }));
    },
  };
}

export const agentStore = createAgentStore();
// Re-export actions for convenience
export const { sendMessage, proposeTool, approve, reject, edit, cancel, clear, addFinding } = agentStore;
