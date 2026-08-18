<script>
  import { appState } from '$lib/stores.svelte';
  import { apiPost } from '$lib/api';
  import PageHeader from '$lib/components/PageHeader.svelte';

  let title = $state('');
  let severity = $state('High');
  let description = $state('');
  let selected = $state(null);
  let showAdd = $state(false);

  const severityOrder = { critical: 4, high: 3, medium: 2, low: 1, info: 0 };
  const severityColor = {
    critical: '#ff2d55',
    high: '#ff5c5c',
    medium: '#ffb454',
    low: '#5cb8ff',
    info: '#9a9a94'
  };

  const sortedFindings = $derived(
    [...appState.findings].sort((a, b) => {
      const sa = severityOrder[a.severity?.toLowerCase()] || 0;
      const sb = severityOrder[b.severity?.toLowerCase()] || 0;
      return sb - sa;
    })
  );

  async function add() {
    await apiPost('/v1/findings', {
      engagement: appState.engagement,
      title,
      severity: severity.toLowerCase(),
      description
    });
    title = '';
    description = '';
    showAdd = false;
    await appState.refresh();
  }

  function select(f) {
    selected = f;
  }

  function explainFinding(f) {
    appState.aiStripOpen = true;
    appState.send(`Explain finding "${f.title}" and suggest remediation.`);
  }

  function addToReport(f) {
    appState.aiStripOpen = true;
    appState.send(`Draft a report section for finding "${f.title}" with CVSS reasoning.`);
  }
</script>

<section class="page">
  <PageHeader title="Findings" count={appState.findings.length} subtitle={appState.engagement} />

  <div class="pane-body">
    <div class="list-pane">
      <div class="list-toolbar">
        <button type="button" class="toolbar-btn primary" onclick={() => showAdd = !showAdd}>
          {showAdd ? 'Cancel' : '+ Add finding'}
        </button>
        <div class="severity-legend">
          {#each Object.entries(severityColor) as [sev, color]}
            <span class="legend-dot" style="background: {color}"></span>
            <span class="legend-label">{sev}</span>
          {/each}
        </div>
      </div>

      {#if sortedFindings.length === 0}
        <div class="empty-pane">
          <span class="empty-icon">⚡</span>
          <p class="empty-title">No findings yet</p>
          <p class="empty-desc">Run a scan or add findings manually. They'll appear here sorted by severity.</p>
          <button type="button" class="toolbar-btn primary" onclick={() => showAdd = true}>+ Add first finding</button>
        </div>
      {:else}
        <div class="findings-list">
          {#each sortedFindings as f}
            <button
              type="button"
              class="finding-row"
              class:selected={selected?.id === f.id}
              onclick={() => select(f)}
            >
              <span class="severity-bar" style="background: {severityColor[f.severity?.toLowerCase()] || '#9a9a94'}"></span>
              <div class="finding-meta">
                <span class="finding-title mono">{f.title}</span>
                <span class="finding-sev mono">{f.severity?.toUpperCase()}</span>
              </div>
            </button>
          {/each}
        </div>
      {/if}
    </div>

    <div class="detail-pane">
      {#if showAdd}
        <div class="detail-card">
          <span class="label-micro">New Finding</span>
          <input bind:value={title} placeholder="Title" />
          <select bind:value={severity}>
            {#each ['Critical', 'High', 'Medium', 'Low', 'Info'] as s}
              <option>{s}</option>
            {/each}
          </select>
          <textarea bind:value={description} placeholder="Description, impact, remediation..." rows="6" />
          <div class="detail-actions">
            <button type="button" class="toolbar-btn" onclick={() => showAdd = false}>Cancel</button>
            <button type="button" class="toolbar-btn primary" onclick={add}>Save</button>
          </div>
        </div>
      {:else if selected}
        <div class="detail-card">
          <div class="detail-header">
            <span class="detail-severity-badge" style="background: {severityColor[selected.severity?.toLowerCase()] || '#9a9a94'}">
              {selected.severity?.toUpperCase()}
            </span>
            <span class="detail-file mono">{selected.file}</span>
          </div>
          <h3 class="detail-title">{selected.title}</h3>
          <pre class="detail-body">{selected.body || 'No description.'}</pre>
          <div class="detail-actions">
            <button type="button" class="toolbar-btn" onclick={() => explainFinding(selected)}>Explain</button>
            <button type="button" class="toolbar-btn" onclick={() => addToReport(selected)}>Add to report</button>
            <button type="button" class="toolbar-btn danger" onclick={() => selected = null}>Close</button>
          </div>
        </div>
      {:else}
        <div class="empty-pane">
          <p class="empty-desc">Select a finding from the list to view details.</p>
        </div>
      {/if}
    </div>
  </div>
</section>

<style>
  .page {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .pane-body {
    flex: 1;
    min-height: 0;
    display: grid;
    grid-template-columns: 320px 1fr;
    overflow: hidden;
  }

  .list-pane {
    display: flex;
    flex-direction: column;
    min-height: 0;
    border-right: 1px solid var(--glass-border);
    background: var(--glass-2);
  }

  .list-toolbar {
    height: 40px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 10px;
    border-bottom: 1px solid var(--glass-border);
    gap: 8px;
  }

  .toolbar-btn {
    padding: 4px 10px;
    font-size: 11px;
    font-weight: 500;
    border-radius: 5px;
    border: 1px solid var(--glass-border);
    background: var(--glass-3);
    color: var(--text);
    min-height: unset;
    cursor: pointer;
    transition: all 120ms var(--spring-control);
  }

  .toolbar-btn.primary {
    background: var(--green-soft);
    color: var(--green);
    border-color: var(--green-soft);
  }

  .toolbar-btn.danger {
    color: var(--danger);
    border-color: var(--danger-soft);
  }

  .toolbar-btn:hover {
    border-color: var(--glass-border-strong);
  }

  .severity-legend {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .legend-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
  }

  .legend-label {
    font-size: 9px;
    text-transform: uppercase;
    color: var(--text-faint);
    letter-spacing: 0.04em;
  }

  .findings-list {
    flex: 1;
    overflow-y: auto;
    padding: 4px;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .finding-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 8px;
    border-radius: 5px;
    border: none;
    background: transparent;
    color: var(--text);
    text-align: left;
    cursor: pointer;
    transition: background 120ms var(--spring-control);
    min-height: 32px;
  }

  .finding-row:hover {
    background: var(--glass-3);
  }

  .finding-row.selected {
    background: var(--glass-3);
    border-left: 2px solid var(--green);
    padding-left: 6px;
  }

  .severity-bar {
    width: 3px;
    height: 20px;
    border-radius: 2px;
    flex-shrink: 0;
  }

  .finding-meta {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 1px;
    min-width: 0;
  }

  .finding-title {
    font-size: 12px;
    color: var(--text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .finding-sev {
    font-size: 10px;
    color: var(--text-faint);
  }

  .detail-pane {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: 12px;
    display: flex;
    flex-direction: column;
  }

  .detail-card {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 14px;
    border-radius: 8px;
    background: var(--glass-2);
    border: 1px solid var(--glass-border);
  }

  .detail-header {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .detail-severity-badge {
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.04em;
    color: var(--abyss);
  }

  .detail-file {
    font-size: 11px;
    color: var(--text-faint);
  }

  .detail-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--text);
    margin: 0;
  }

  .detail-body {
    font-family: var(--font-mono);
    font-size: 12px;
    line-height: 1.5;
    color: var(--text-dim);
    white-space: pre-wrap;
    word-break: break-word;
    margin: 0;
    padding: 10px;
    border-radius: 6px;
    background: var(--abyss-2);
    border: 1px solid var(--glass-border);
    overflow-x: auto;
  }

  .detail-actions {
    display: flex;
    gap: 6px;
  }

  .empty-pane {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 20px;
    opacity: 0.7;
  }

  .empty-icon {
    font-size: 24px;
  }

  .empty-title {
    font-size: 14px;
    font-weight: 500;
    color: var(--text);
    margin: 0;
  }

  .empty-desc {
    font-size: 12px;
    color: var(--text-faint);
    text-align: center;
    max-width: 280px;
    margin: 0;
  }

  @media (max-width: 768px) {
    .pane-body {
      grid-template-columns: 1fr;
      grid-template-rows: 1fr 1fr;
    }
  }
</style>
