<script lang="ts">
  import BorderBeam from '$lib/components/ui/BorderBeam.svelte';

  export let pendingApproval: {
    id: string;
    tool: string;
    args: Record<string, any>;
    cost?: { inputTokens: number; outputTokens: number; estCostUSD: number };
  };

  function getToolLabel(tool: string) {
    return tool.replace('_', ' ');
  }

  function formatCost(cost?: { inputTokens: number; outputTokens: number; estCostUSD: number }) {
    if (!cost) return '';
    return `~$${cost.estCostUSD.toFixed(4)} (${(cost.inputTokens/1000).toFixed(1)}k in / ${(cost.outputTokens/1000).toFixed(1)}k out)`;
  }
</script>

<div class="approval-block" role="alertdialog" aria-label="Pending approval">
  <BorderBeam />
  
  <div class="approval-header">
    <div class="approval-tool">
      <span class="approval-icon">⚡</span>
      <div class="approval-tool-info">
        <span class="approval-tool-name">{getToolLabel(pendingApproval.tool)}</span>
        <span class="approval-cost">{formatCost(pendingApproval.cost)}</span>
      </div>
    </div>
  </div>

  <div class="approval-args">
    <pre class="approval-args-json"><code>{JSON.stringify(pendingApproval.args, null, 2)}</code></pre>
  </div>

  <div class="approval-actions">
    <button class="approval-btn approve" onclick={() => console.log('approve', pendingApproval.id)}>
      <span>Approve</span>
      <kbd>Cmd+Enter</kbd>
    </button>
    <button class="approval-btn edit" onclick={() => console.log('edit', pendingApproval.id)}>
      <span>Edit</span>
    </button>
    <button class="approval-btn reject" onclick={() => console.log('reject', pendingApproval.id)}>
      <span>Reject</span>
      <kbd>Cmd+Shift+Enter</kbd>
    </button>
  </div>
</div>

<style>
  .approval-block {
    background: var(--surface-card);
    border: 1px solid var(--surface-border);
    border-radius: var(--radius-panel);
    overflow: hidden;
    position: relative;
    box-shadow: 0 0 0 1px var(--accent-primary), 0 8px 32px rgba(5, 5, 7, 0.5);
  }

  .approval-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-3) var(--space-4);
    background: var(--surface-hover);
    border-bottom: 1px solid var(--surface-border);
  }

  .approval-tool {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .approval-icon {
    font-size: 20px;
    flex-shrink: 0;
  }

  .approval-tool-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .approval-tool-name {
    font-family: var(--font-mono);
    font-size: var(--font-xs);
    font-weight: 500;
    color: var(--text-primary);
  }

  .approval-cost {
    font-family: var(--font-mono);
    font-size: var(--font-2xs);
    color: var(--text-tertiary);
  }

  .approval-args {
    padding: var(--space-2) var(--space-4);
    max-height: 200px;
    overflow: auto;
    border-bottom: 1px solid var(--surface-border);
  }

  .approval-args-json {
    margin: 0;
    font-family: var(--font-mono);
    font-size: var(--font-2xs);
    line-height: 1.5;
    color: var(--text-secondary);
    white-space: pre-wrap;
    word-break: break-word;
  }

  .approval-args-json code {
    background: none;
    padding: 0;
  }

  .approval-actions {
    display: flex;
    gap: 8px;
    padding: var(--space-3) var(--space-4);
  }

  .approval-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    flex: 1;
    padding: 10px 16px;
    border: none;
    border-radius: var(--radius-control);
    font-family: var(--font-sans);
    font-size: var(--font-xs);
    font-weight: 500;
    cursor: pointer;
    transition: all var(--spring-snappy);
  }

  .approval-btn.approve {
    background: var(--accent-primary);
    color: var(--color-abyss-0);
  }

  .approval-btn.approve:hover {
    filter: brightness(1.1);
  }

  .approval-btn.edit {
    background: var(--surface-hover);
    color: var(--text-primary);
    border: 1px solid var(--surface-border);
  }

  .approval-btn.edit:hover {
    background: var(--surface-card);
  }

  .approval-btn.reject {
    background: transparent;
    color: var(--color-danger);
    border: 1px solid var(--color-danger);
  }

  .approval-btn.reject:hover {
    background: var(--color-danger);
    color: var(--color-abyss-0);
  }

  .approval-btn kbd {
    display: inline-flex;
    align-items: center;
    padding: 1px 5px;
    border-radius: 3px;
    background: rgba(0,0,0,0.2);
    font-family: var(--font-mono);
    font-size: 10px;
    margin-left: 4px;
  }

  .approval-btn.approve kbd,
  .approval-btn.reject kbd {
    background: rgba(255,255,255,0.2);
  }
</style>