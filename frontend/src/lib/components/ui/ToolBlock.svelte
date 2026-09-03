<script lang="ts">
  import { spring } from 'svelte/motion';
  import Icon from '@iconify/svelte';
  import BorderBeam from '$lib/components/ui/BorderBeam.svelte';
  import type { AgentBlock } from '$lib/stores/agentStore';

  let { block }: { block: AgentBlock } = $props();

  const pulse = spring(1, { stiffness: 0.2, damping: 0.2 });

  function getToolIcon(tool?: string) {
    switch (tool) {
      case 'edit_file': return 'ph:file-bold';
      case 'run_command': return 'ph:terminal-bold';
      case 'read_file': return 'ph:file-text-bold';
      case 'write_file': return 'ph:file-plus-bold';
      case 'grep': return 'ph:magnifying-glass-bold';
      case 'glob': return 'ph:folder-bold';
      case 'list_dir': return 'ph:list-bold';
      case 'patch': return 'ph:git-diff-bold';
      default: return 'ph:gear-bold';
    }
  }

  function getToolLabel(tool?: string) {
    return tool ? tool.replace('_', ' ') : 'tool';
  }

  function formatCost(cost?: { inputTokens: number; outputTokens: number; estCostUSD: number }) {
    if (!cost) return '';
    return `~$${cost.estCostUSD.toFixed(4)} (${(cost.inputTokens/1000).toFixed(1)}k in / ${(cost.outputTokens/1000).toFixed(1)}k out)`;
  }

  function formatDuration(start?: number, end?: number) {
    if (!start) return '';
    const endTime = end || Date.now();
    const ms = endTime - start;
    if (ms < 1000) return `${ms}ms`;
    return `${(ms/1000).toFixed(1)}s`;
  }
</script>

<div class="tool-block {block.status}" role="region" aria-label={`Tool: ${getToolLabel(block.tool)}`}>
  {#if block.status === 'proposed'}
    <BorderBeam />
  {/if}

  <div class="tool-block-header">
    <div class="tool-block-tool">
      <Icon icon={getToolIcon(block.tool)} width="16" height="16" />
      <span class="tool-name">{getToolLabel(block.tool)}</span>
      {#if block.status === 'proposed'}
        <span class="tool-badge proposed">Proposed</span>
      {:else if block.status === 'running'}
        <span class="tool-badge running">Running</span>
      {:else if block.status === 'done'}
        <span class="tool-badge done">Done</span>
      {:else if block.status === 'failed'}
        <span class="tool-badge failed">Failed</span>
      {/if}
    </div>

    <div class="tool-block-meta">
      {#if block.status !== 'proposed'}
        <span class="tool-duration">{formatDuration(block.startTime, block.endTime)}</span>
      {/if}
      {#if block.cost}
        <span class="tool-cost">{formatCost(block.cost)}</span>
      {/if}
    </div>
  </div>

  <div class="tool-block-args">
    <pre class="tool-args-json"><code>{JSON.stringify(block.args, null, 2)}</code></pre>
  </div>

  {#if block.status === 'proposed'}
    <div class="tool-block-actions">
      <button class="tool-btn approve" onclick={() => console.log('approve', block.id)}>
        <Icon icon="ph:check-bold" width="14" height="14" />
        <span>Approve</span>
        <kbd>Cmd+Enter</kbd>
      </button>
      <button class="tool-btn edit" onclick={() => console.log('edit', block.id)}>
        <Icon icon="ph:pencil-bold" width="14" height="14" />
        <span>Edit</span>
      </button>
      <button class="tool-btn reject" onclick={() => console.log('reject', block.id)}>
        <Icon icon="ph:x-bold" width="14" height="14" />
        <span>Reject</span>
        <kbd>Cmd+Shift+Enter</kbd>
      </button>
    </div>
  {:else if block.status === 'running'}
    <div class="tool-block-running">
      <div class="running-spinner" style:animation-play-state={$pulse > 1 ? 'running' : 'paused'}></div>
      <span>Executing...</span>
      <button class="tool-btn cancel" onclick={() => console.log('cancel', block.id)}>
        <Icon icon="ph:x-bold" width="14" height="14" />
        <span>Cancel</span>
      </button>
    </div>
  {:else if block.status === 'done' && block.output}
    <div class="tool-block-output">
      <pre class="tool-output-text"><code>{block.output}</code></pre>
      <button class="tool-btn collapse" onclick={() => console.log('collapse', block.id)}>
        <Icon icon="ph:caret-up-bold" width="14" height="14" />
        <span>Collapse</span>
      </button>
    </div>
  {:else if block.status === 'failed' && block.output}
    <div class="tool-block-error">
      <pre class="tool-error-text"><code>{block.output}</code></pre>
      <button class="tool-btn retry" onclick={() => console.log('retry', block.id)}>
        <Icon icon="ph:arrow-clockwise-bold" width="14" height="14" />
        <span>Retry</span>
      </button>
    </div>
  {/if}
</div>

<style>
  .tool-block {
    background: var(--surface-card);
    border: 1px solid var(--surface-border);
    border-radius: var(--radius-panel);
    overflow: hidden;
    position: relative;
    transition: border-color var(--spring-snappy);
  }

  .tool-block.proposed {
    border-color: var(--accent-primary);
  }

  .tool-block.running {
    border-color: var(--accent-primary);
  }

  .tool-block.done {
    border-color: var(--color-success);
  }

  .tool-block.failed {
    border-color: var(--color-danger);
  }

  .tool-block-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-2) var(--space-3);
    background: var(--surface-hover);
    border-bottom: 1px solid var(--surface-border);
  }

  .tool-block-tool {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .tool-name {
    font-family: var(--font-mono);
    font-size: var(--font-xs);
    font-weight: 500;
    color: var(--text-primary);
  }

  .tool-badge {
    display: inline-flex;
    align-items: center;
    padding: 2px 8px;
    border-radius: var(--radius-badge);
    font-size: var(--font-2xs);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .tool-badge.proposed {
    background: var(--accent-soft);
    color: var(--accent-primary);
  }

  .tool-badge.running {
    background: rgba(69, 42, 132, 0.15);
    color: var(--accent-primary);
    animation: pulse 1.5s var(--spring-bouncy) infinite;
  }

  .tool-badge.done {
    background: rgba(92, 255, 138, 0.15);
    color: var(--color-success);
  }

  .tool-badge.failed {
    background: rgba(255, 92, 92, 0.15);
    color: var(--color-danger);
  }

  .tool-block-meta {
    display: flex;
    align-items: center;
    gap: 12px;
    font-family: var(--font-mono);
    font-size: var(--font-2xs);
    color: var(--text-tertiary);
  }

  .tool-duration {
    color: var(--text-secondary);
  }

  .tool-cost {
    color: var(--text-tertiary);
  }

  .tool-block-args {
    padding: var(--space-2) var(--space-3);
    max-height: 200px;
    overflow: auto;
    border-bottom: 1px solid var(--surface-border);
  }

  .tool-args-json {
    margin: 0;
    font-family: var(--font-mono);
    font-size: var(--font-2xs);
    line-height: 1.5;
    color: var(--text-secondary);
    white-space: pre-wrap;
    word-break: break-word;
  }

  .tool-args-json code {
    background: none;
    padding: 0;
  }

  .tool-block-actions {
    display: flex;
    gap: 8px;
    padding: var(--space-2) var(--space-3);
    border-top: 1px solid var(--surface-border);
  }

  .tool-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    border: none;
    border-radius: var(--radius-control);
    font-family: var(--font-sans);
    font-size: var(--font-xs);
    font-weight: 500;
    cursor: pointer;
    transition: all var(--spring-snappy);
  }

  .tool-btn.approve {
    background: var(--accent-primary);
    color: var(--color-abyss-0);
  }

  .tool-btn.approve:hover {
    filter: brightness(1.1);
  }

  .tool-btn.edit {
    background: var(--surface-hover);
    color: var(--text-primary);
    border: 1px solid var(--surface-border);
  }

  .tool-btn.edit:hover {
    background: var(--surface-card);
  }

  .tool-btn.reject {
    background: transparent;
    color: var(--color-danger);
    border: 1px solid var(--color-danger);
  }

  .tool-btn.reject:hover {
    background: var(--color-danger);
    color: var(--color-abyss-0);
  }

  .tool-btn kbd {
    display: inline-flex;
    align-items: center;
    padding: 1px 5px;
    border-radius: 3px;
    background: rgba(0,0,0,0.2);
    font-family: var(--font-mono);
    font-size: 10px;
    margin-left: 4px;
  }

  .tool-btn.approve kbd,
  .tool-btn.reject kbd {
    background: rgba(255,255,255,0.2);
  }

  .tool-block-running {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: var(--space-2) var(--space-3);
  }

  .running-spinner {
    width: 16px;
    height: 16px;
    border: 2px solid var(--surface-border);
    border-top-color: var(--accent-primary);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .tool-btn.cancel {
    background: transparent;
    color: var(--text-tertiary);
    border: 1px solid var(--surface-border);
  }

  .tool-btn.cancel:hover {
    background: var(--color-danger);
    border-color: var(--color-danger);
    color: var(--color-abyss-0);
  }

  .tool-block-output,
  .tool-block-error {
    padding: var(--space-2) var(--space-3);
    border-top: 1px solid var(--surface-border);
    max-height: 300px;
    overflow: auto;
  }

  .tool-output-text,
  .tool-error-text {
    margin: 0;
    font-family: var(--font-mono);
    font-size: var(--font-2xs);
    line-height: 1.5;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .tool-output-text code {
    color: var(--text-secondary);
  }

  .tool-error-text code {
    color: var(--color-danger);
  }

  .tool-btn.collapse,
  .tool-btn.retry {
    margin-top: var(--space-2);
    background: var(--surface-hover);
    color: var(--text-primary);
    border: 1px solid var(--surface-border);
  }

  .tool-btn.collapse:hover,
  .tool-btn.retry:hover {
    background: var(--surface-card);
  }
</style>