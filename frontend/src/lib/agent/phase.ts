import { agentRun } from '$lib/agent/run.svelte.ts';
import type { ToolStep } from '$lib/agent/types';
import { workspace } from '$lib/stores/workspace.svelte.ts';

/**
 * The one glanceable answer to "what is the agent doing right now".
 *
 * Wireframe section 3 frames five states; four are spec-final and rendered by
 * AgentGlyph. `running` is the wireframe's own open question, so it stays
 * whatever the surrounding chrome already does (SCANLINE) and AgentGlyph
 * renders nothing for it.
 */
export type AgentPhase = 'idle' | 'thinking' | 'editing' | 'running' | 'needs-you';

// Tool names that mutate files. Read-shaped tools (read/search/grep/glob) fall
// through to plain `running`; only a mutation earns the ember ±.
const EDIT_RE = /(write|edit|patch|apply|replace|create|insert|rename|move|delete|remove)/i;

export function isEditingTool(name: string): boolean {
  return EDIT_RE.test(name);
}

/** Read inside a $derived so store reads stay reactive. */
export function agentPhase(): AgentPhase {
  // Blocked on a person beats everything: it is the only state that cannot
  // resolve itself.
  if (agentRun.pendingApproval || agentRun.clarify || workspace.clarify) return 'needs-you';
  if (!agentRun.running) return 'idle';
  const tool = agentRun.steps.find(
    (s): s is ToolStep => s.kind === 'tool' && s.state === 'running',
  );
  if (tool) return isEditingTool(tool.name) ? 'editing' : 'running';
  return 'thinking';
}

export function phaseLabel(phase: AgentPhase): string {
  switch (phase) {
    case 'idle':
      return 'Idle';
    case 'thinking':
      return 'Thinking';
    case 'editing':
      return 'Editing files';
    case 'running':
      return 'Running';
    case 'needs-you':
      return 'Needs you';
    default: {
      const never: never = phase;
      return never;
    }
  }
}
