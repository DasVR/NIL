<script lang="ts">
  import { appState } from '$lib/stores.svelte';
  import { approve, reject } from '$lib/api';

  // Local state
  let expandedRunId = $state<string | null>(null);
  let editedCommand = $state('');
  let actionLoading = $state<string | null>(null);

  async function handleApprove(runId: string) {
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

  async function handleReject(runId: string) {
    actionLoading = runId;
    try {
      await reject(runId);
    } catch (err) {
      console.error('Reject failed:', err);
    } finally {
      actionLoading = null;
      expandedRunId = null;
    }
  }

  function toggleExpand(runId: string, command: string) {
    if (expandedRunId === runId) {
      expandedRunId = null;
      editedCommand = '';
    } else {
      expandedRunId = runId;
      editedCommand = command;
    }
  }

  function getSafetyColor(level?: string): string {
    switch (level?.toLowerCase()) {
      case 'critical': return '#ff3333';
      case 'high': return '#ff6b6b';
      case 'medium': return '#ffaa00';
      case 'low': return '#00d992';
      default: return '#888';
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
          <div class="run-header" onclick={() => toggleExpand(run.run_id, run.command)}>
            <div class="run-info">
              <span class="tool-name">{run.tool}</span>
              {#if run.safety_level}
                <span class="safety-badge" style="color: {getSafetyColor(run.safety_level)}; border-color: {getSafetyColor(run.safety_level)}">
                  {run.safety_level.toUpperCase()}
                </span>
              {/if}
            </div>
            <div class="run-actions">
              <button
                class="action-btn approve"
                onclick={(e) => { e.stopPropagation(); handleApprove(run.run_id); }}
                disabled={actionLoading === run.run_id}
              >
                {actionLoading === run.run_id ? '...' : '✓'}
              </button>
              <button
                class="action-btn reject"
                onclick={(e) => { e.stopPropagation(); handleReject(run.run_id); }}
                disabled={actionLoading === run.run_id}
              >
                {actionLoading === run.run_id ? '...' : '✕'}
              </button>
            </div>
          </div>

          {#if expandedRunId === run.run_id}
            <div class="run-details">
              <div class="detail-row">
                <span class="detail-label">Command:</span>
              </div>
              <textarea
                bind:value={editedCommand}
                rows={3}
                class="command-editor"
              ></textarea>
              <div class="detail-actions">
                <button
                  class="btn btn-approve"
                  onclick={() => handleApprove(run.run_id)}
                  disabled={actionLoading === run.run_id}
                >
                  ✓ Approve &amp; Execute
                </button>
                <button
                  class="btn btn-reject"
                  onclick={() => handleReject(run.run_id)}
                  disabled={actionLoading === run.run_id}
                >
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
    background: rgba(5, 5, 7, 0.8);
    border: 1px solid rgba(0, 217, 146, 0.1);
    border-radius: 12px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    max-height: 400px;
  }

  .panel-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    border-bottom: 1px solid rgba(0, 217, 146, 0.1);
    font-family: 'JetBrains Mono', monospace;
    font-size: 13px;
    color: #00d992;
  }

  .title { flex: 1; }

  .badge-count {
    background: rgba(255, 107, 107, 0.2);
    color: #ff6b6b;
    font-size: 10px;
    padding: 1px 6px;
    border-radius: 10px;
    border: 1px solid rgba(255, 107, 107, 0.3);
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 2rem;
    color: #666;
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    text-align: center;
  }

  .empty-icon { font-size: 24px; }
  .empty-text { color: #888; }
  .empty-hint { font-size: 10px; color: #555; }

  .pending-list {
    overflow-y: auto;
    padding: 0.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .run-card {
    background: rgba(0, 217, 146, 0.03);
    border: 1px solid rgba(0, 217, 146, 0.1);
    border-radius: 8px;
    overflow: hidden;
    transition: border-color 0.2s;
  }
  .run-card:hover {
    border-color: rgba(0, 217, 146, 0.2);
  }

  .run-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.625rem 0.75rem;
    cursor: pointer;
    user-select: none;
  }

  .run-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex: 1;
  }

  .tool-name {
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    color: #ccc;
  }

  .safety-badge {
    font-size: 9px;
    padding: 1px 4px;
    border-radius: 3px;
    border: 1px solid;
    font-family: 'JetBrains Mono', monospace;
  }

  .run-actions {
    display: flex;
    gap: 0.25rem;
  }

  .action-btn {
    width: 28px;
    height: 28px;
    border-radius: 6px;
    border: 1px solid;
    background: none;
    cursor: pointer;
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
  }
  .action-btn.approve {
    border-color: rgba(0, 217, 146, 0.3);
    color: #00d992;
  }
  .action-btn.approve:hover:not(:disabled) {
    background: rgba(0, 217, 146, 0.15);
  }
  .action-btn.reject {
    border-color: rgba(255, 107, 107, 0.3);
    color: #ff6b6b;
  }
  .action-btn.reject:hover:not(:disabled) {
    background: rgba(255, 107, 107, 0.15);
  }
  .action-btn:disabled { opacity: 0.3; cursor: not-allowed; }

  .run-preview {
    padding: 0 0.75rem 0.625rem 0.75rem;
  }

  .run-preview code {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: #888;
    background: rgba(0, 0, 0, 0.3);
    padding: 0.375rem 0.5rem;
    border-radius: 4px;
    display: block;
    overflow-x: auto;
    white-space: nowrap;
  }

  .run-details {
    padding: 0.75rem;
    border-top: 1px solid rgba(0, 217, 146, 0.08);
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .detail-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    color: #666;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .command-editor {
    background: rgba(0, 0, 0, 0.4);
    border: 1px solid rgba(0, 217, 146, 0.2);
    border-radius: 6px;
    color: #00d992;
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    padding: 0.5rem;
    resize: vertical;
    min-height: 60px;
  }
  .command-editor:focus {
    outline: none;
    border-color: rgba(0, 217, 146, 0.4);
  }

  .detail-actions {
    display: flex;
    gap: 0.5rem;
  }

  .btn {
    flex: 1;
    padding: 0.5rem;
    border-radius: 6px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    cursor: pointer;
    border: 1px solid;
    transition: all 0.2s;
  }
  .btn:disabled { opacity: 0.3; cursor: not-allowed; }

  .btn-approve {
    background: rgba(0, 217, 146, 0.1);
    border-color: rgba(0, 217, 146, 0.3);
    color: #00d992;
  }
  .btn-approve:hover:not(:disabled) {
    background: rgba(0, 217, 146, 0.2);
  }

  .btn-reject {
    background: rgba(255, 107, 107, 0.1);
    border-color: rgba(255, 107, 107, 0.3);
    color: #ff6b6b;
  }
  .btn-reject:hover:not(:disabled) {
    background: rgba(255, 107, 107, 0.2);
  }
</style>