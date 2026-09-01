// Agent store — Svelte writable-derived store
import { writable, derived } from 'svelte/store';

export interface AgentBlock {
  id: string;
  type: 'tool' | 'diff' | 'finding' | 'plan' | 'artifact';
  tool?: string;
  args?: Record<string, any>;
  status?: 'proposed' | 'running' | 'done' | 'failed';
  output?: string;
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

export const agentStore = derived(
  [_blocks, _plan, _pendingApproval, _findings, _running],
  ([$blocks, $plan, $pendingApproval, $findings, $running]) => ({
    blocks: $blocks,
    plan: $plan,
    pendingApproval: $pendingApproval,
    findings: $findings,
    running: $running,
  })
);

export function sendMessage(input: string, mode: string) {
  _running.set(true);
  _blocks.update(b => [...b, { id: `user-${Date.now()}`, type: 'artifact', output: input }]);
  setTimeout(() => simulateAgentResponse(mode), 500);
}

export function approve(id: string) {
  _blocks.update(blocks => {
    const block = blocks.find(b => b.id === id);
    if (block && block.status === 'proposed') {
      block.status = 'running';
      block.startTime = Date.now();
    }
    return blocks;
  });
  _pendingApproval.set(null);
  setTimeout(() => {
    _blocks.update(blocks => {
      const block = blocks.find(b => b.id === id);
      if (block) {
        block.status = 'done';
        block.endTime = Date.now();
        block.output = 'Command executed successfully.\nOutput here...';
        block.cost = { inputTokens: 1200, outputTokens: 800, estCostUSD: 0.003 };
      }
      return blocks;
    });
    _plan.update(p => p.map(step => step.status === 'running' ? { ...step, status: 'done' } : step));
    _running.set(false);
  }, 1500);
}

export function reject(id: string) {
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

export function clear() {
  _blocks.set([]);
  _plan.set([]);
  _pendingApproval.set(null);
  _findings.set([]);
  _running.set(false);
}

function simulateAgentResponse(mode: string) {
  _plan.set([
    { id: '1', label: 'Analyze target', status: 'done', detail: 'Found 3 open ports' },
    { id: '2', label: 'Run nmap scan', status: 'running', detail: 'Scanning ports 1-65535' },
    { id: '3', label: 'Run nuclei templates', status: 'pending' },
    { id: '4', label: 'Generate findings', status: 'pending' },
  ]);

  const proposal: AgentBlock = {
    id: `tool-${Date.now()}`,
    type: 'tool',
    tool: 'run_command',
    args: { command: 'nmap -sS -p- 192.168.1.100', timeout: 60000 },
    status: 'proposed',
    cost: { inputTokens: 500, outputTokens: 200, estCostUSD: 0.001 },
  };
  
  _blocks.update(b => [...b, proposal]);
  _pendingApproval.set(proposal);
}