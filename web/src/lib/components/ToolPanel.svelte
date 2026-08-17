<script>
  import { appState } from '$lib/stores.svelte';
  import { approve, reject } from '$lib/api';

  let expandedRunId = $state(null);
  let editedCommand = $state('');
  let actionLoading = $state(null);

  async function handleApprove(runId) {
    actionLoading = runId;
    try {
      await approve(runId, editedCommand || undefined);
    } catch (err) {
      console.error('Approve failed:', err);
    } finally {
      actionLoading = null;
      expandedRunId = null;
      editedCommand = '';
    }
  }

  async function handleReject(runId) {
    actionLoading = runId;
    try {
      await reject(runId);
    } finally {
      actionLoading = null;
      expandedRunId = null;
      editedCommand = '';
    }
  }

  function toggleExpand(runId, command) {
    if (expandedRunId === runId) {
      expandedRunId = null;
      editedCommand = '';
    } else {
      expandedRunId = runId;
      editedCommand = command;
    }
  }

  function safetyColor(level) {
    switch (level?.toLowerCase()) {
      case 'critical': return 'var(--danger)';
      case 'high': return '#ff6b6b';
      case 'medium': return 'var(--warning)';
      case 'low': return 'var(--accent)';
      default: return 'var(--text-tertiary)';
    }
  }
</script>

<div class="tool-panel">
  <div class="panel-header">
    <span class="title">🔧 Tool Execution</span>
    {#if appState.pending.length > 0}
      <span class="badge-count">{appState.pending.length}</span>
    {/if}
  </div>

  {#if appState.pending.length === 0}
    <div class="empty-state">
      <span class="empty-icon">✅</span>
      <span class="empty-text">No pending commands</span>
      {#if appState.yolo}
        <span class="empty-hint">YOLO mode is ON — commands execute automatically</span>
      {/if}
    </div>
  {:else}
    <div class="pending-list">
      {#each appState.pending as run}
        <div class="run-card">
          <div class="run-header" role="button" tabindex="0" aria-expanded={expandedRunId === run.run_id} onclick={() => toggleExpand(run.run_id, run.command)} onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleExpand(run.run_id, run.command); }}}>
            <div class="run-info">
              <span class="tool-name">{run.tool}</span>
              {#if run.safety_level}
                <span class="safety-badge" style="color: {safetyColor(run.safety_level)}; border-color: {safetyColor(run.safety_level)}">
                  {run.safety_level.toUpperCase()}
                </span>
              {/if}
            </div>
            <div class="run-actions">
              <button
                class="action-btn approve"
                onclick={(e) => { e.stopPropagation(); handleApprove(run.run_id); }}
                disabled={actionLoading === run.run_id}
                aria-label="Approve"
              >{actionLoading === run.run_id ? '...' : '✓'}</button>
              <button
                class="action-btn reject"
                onclick={(e) => { e.stopPropagation(); handleReject(run.run_id); }}
                disabled={actionLoading === run.run_id}
                aria-label="Reject"
              >{actionLoading === run.run_id ? '...' : '✕'}</button>
            </div>
          </div>

          {#if expandedRunId === run.run_id}
            <div class="run-details">
              <textarea bind:value={editedCommand} rows={3} class="command-editor" aria-label="Edit command"></textarea>
              <div class="detail-actions">
                <button class="primary" onclick={() => handleApprove(run.run_id)} disabled={actionLoading === run.run_id}>
                  ✓ Approve & Execute
                </button>
                <button class="danger" onclick={() => handleReject(run.run_id)} disabled={actionLoading === run.run_id}>
                  ✕ Reject
                </button>
              </div>
            </div>
          {:else}
            <div class="run-preview">
              <code>$ {run.command.slice(0, 80)}{run.command.length > 80 ? '...' : ''}</code>
            </div>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .tool-panel {
    background: var(--glass);
    border: 1px solid var(--glass-border);
    border-radius: var(--radius-panel);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    max-height: 420px;
  }
  .panel-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.7rem 1rem;
    border-bottom: 1px solid var(--glass-border);
    font-family: var(--font-mono);
    font-size: 13px;
    color: var(--accent);
  }
  .title { flex: 1; }
  .badge-count {
    background: var(--danger-20);
    color: var(--danger);
    font-size: 10px;
    padding: 1px 6px;
    border-radius: 10px;
    border: 1px solid rgba(255, 69, 58, 0.3);
  }
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.4rem;
    padding: 2rem;
    color: var(--text-tertiary);
    font-family: var(--font-mono);
    font-size: 12px;
    text-align: center;
  }
  .empty-icon { font-size: 24px; }
  .empty-text { color: var(--text-secondary); }
  .empty-hint { font-size: 10px; }
  .pending-list {
    overflow-y: auto;
    padding: 0.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .run-card {
    background: var(--accent-8);
    border: 1px solid rgba(0, 217, 146, 0.1);
    border-radius: var(--radius-control);
    overflow: hidden;
    transition: border-color 0.2s;
  }
  .run-card:hover { border-color: rgba(0, 217, 146, 0.25); }
  .run-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.55rem 0.7rem;
    cursor: pointer;
    user-select: none;
  }
  .run-info { display: flex; align-items: center; gap: 0.45rem; flex: 1; }
  .tool-name {
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--text-secondary);
  }
  .safety-badge {
    font-size: 9px;
    padding: 1px 4px;
    border-radius: 3px;
    border: 1px solid;
    font-family: var(--font-mono);
  }
  .run-actions { display: flex; gap: 0.25rem; }
  .action-btn {
    width: 28px;
    height: 28px;
    border-radius: 5px;
    border: 1px solid;
    background: transparent;
    cursor: pointer;
    font-size: 14px;
    display: grid;
    place-items: center;
    transition: background 0.15s;
  }
  .action-btn.approve { border-color: rgba(0, 217, 146, 0.3); color: var(--accent); }
  .action-btn.approve:hover:not(:disabled) { background: rgba(0, 217, 146, 0.15); }
  .action-btn.reject { border-color: rgba(255, 69, 58, 0.3); color: var(--danger); }
  .action-btn.reject:hover:not(:disabled) { background: rgba(255, 69, 58, 0.15); }
  .action-btn:disabled { opacity: 0.35; cursor: not-allowed; }
  .run-preview { padding: 0 0.7rem 0.55rem; }
  .run-preview code {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--text-tertiary);
    background: var(--abyss-1);
    padding: 0.35rem 0.5rem;
    border-radius: 4px;
    display: block;
    overflow-x: auto;
    white-space: nowrap;
  }
  .run-details {
    padding: 0.7rem;
    border-top: 1px solid rgba(0, 217, 146, 0.08);
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .command-editor {
    width: 100%;
    font-family: var(--font-mono);
    font-size: 12px;
  }
  .detail-actions { display: flex; gap: 0.5rem; }
</style>
