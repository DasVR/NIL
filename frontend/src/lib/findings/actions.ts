import type { Finding } from '$lib/agent/types';
import { agentRun } from '$lib/agent/run.svelte.ts';
import { appState } from '$lib/stores/appState.svelte.ts';

function engagement(): string {
  return appState.activeEngagementId || 'default';
}

export function explainFinding(finding: Finding) {
  appState.composerMode = 'chat';
  const body = [
    `Explain this finding and what to do next.`,
    finding.title,
    finding.assessment,
    finding.evidence,
  ].filter(Boolean).join('\n\n');
  void agentRun.sendMessage(body, engagement(), 'chat');
}

export function draftFinding(finding: Finding) {
  appState.composerMode = 'report';
  void agentRun.sendMessage(
    `Draft a report section for: ${finding.title}`,
    engagement(),
    'report',
  );
}
