<script>
  import { appState } from '$lib/stores.svelte';
  import { apiPost } from '$lib/api';
  import PageHeader from '$lib/components/PageHeader.svelte';

  let report = $state('');
  let fmt = $state('markdown');
  let generating = $state(false);
  let reports = $state([]);
  let selectedReport = $state(null);

  async function generate() {
    generating = true;
    try {
      const data = await apiPost('/v1/reports/generate', {
        engagement: appState.engagement,
        format: fmt
      });
      report = fmt === 'json' ? JSON.stringify(data.report, null, 2) : data.report;
      // Simulate adding to history
      reports = [{ id: crypto.randomUUID(), date: new Date().toLocaleString(), format: fmt, status: 'ready' }, ...reports];
    } finally {
      generating = false;
    }
  }

  function download() {
    if (!report) return;
    const blob = new Blob([report], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `finn-${appState.engagement}.${fmt === 'json' ? 'json' : 'md'}`;
    a.click();
  }

  function selectReport(r) {
    selectedReport = r;
    report = '';
  }
</script>

<section class="page">
  <PageHeader title="Reports" count={reports.length} subtitle={appState.engagement} />

  <div class="pane-body">
    <div class="list-pane">
      <div class="list-toolbar">
        <span class="label-micro">History</span>
      </div>

      {#if reports.length === 0}
        <div class="empty-pane">
          <span class="empty-icon">📄</span>
          <p class="empty-title">No reports yet</p>
          <p class="empty-desc">Generate your first report from findings, notes, and tool output.</p>
        </div>
      {:else}
        <div class="report-list">
          {#each reports as r}
            <button
              type="button"
              class="report-row"
              class:selected={selectedReport?.id === r.id}
              onclick={() => selectReport(r)}
            >
              <div class="report-meta">
                <span class="report-fmt mono">{r.format.toUpperCase()}</span>
                <span class="report-date mono">{r.date}</span>
              </div>
              <span class="report-status" class:ready={r.status === 'ready'}>{r.status}</span>
            </button>
          {/each}
        </div>
      {/if}
    </div>

    <div class="detail-pane">
      <div class="detail-card">
        <div class="detail-header">
          <span class="label-micro">Draft preview</span>
          <div class="detail-actions-top">
            <select bind:value={fmt}>
              <option>markdown</option>
              <option>json</option>
              <option>pdf</option>
            </select>
            <button
              type="button"
              class="toolbar-btn primary"
              onclick={generate}
              disabled={generating}
            >
              {generating ? 'Generating…' : 'Generate'}
            </button>
            <button type="button" class="toolbar-btn" onclick={download} disabled={!report}>Download</button>
          </div>
        </div>

        {#if report}
          <pre class="report-preview mono">{report.slice(0, 3000)}{report.length > 3000 ? '\n\n... (truncated)' : ''}</pre>
        {:else}
          <div class="empty-pane">
            <p class="empty-desc">Select a format and hit Generate to draft a report from current findings.</p>
          </div>
        {/if}
      </div>
    </div>
  </div>
</section>

<style>
  .page { flex: 1; min-height: 0; display: flex; flex-direction: column; overflow: hidden; }
  .pane-body { flex: 1; min-height: 0; display: grid; grid-template-columns: 240px 1fr; overflow: hidden; }
  .list-pane { display: flex; flex-direction: column; min-height: 0; border-right: 1px solid var(--glass-border); background: var(--glass-2); }
  .list-toolbar { height: 32px; flex-shrink: 0; display: flex; align-items: center; padding: 0 10px; border-bottom: 1px solid var(--glass-border); }
  .report-list { flex: 1; overflow-y: auto; padding: 4px; display: flex; flex-direction: column; gap: 2px; }
  .report-row { display: flex; align-items: center; justify-content: space-between; padding: 6px 8px; border-radius: 5px; border: none; background: transparent; color: var(--text); text-align: left; cursor: pointer; transition: background 120ms var(--spring-control); min-height: 32px; }
  .report-row:hover { background: var(--glass-3); }
  .report-row.selected { background: var(--glass-3); border-left: 2px solid var(--green); padding-left: 6px; }
  .report-meta { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
  .report-fmt { font-size: 11px; font-weight: 500; color: var(--green); }
  .report-date { font-size: 10px; color: var(--text-faint); }
  .report-status { font-size: 10px; padding: 1px 5px; border-radius: 4px; background: var(--glass-3); color: var(--text-faint); }
  .report-status.ready { background: var(--green-soft); color: var(--green); }
  .detail-pane { flex: 1; min-height: 0; overflow-y: auto; padding: 12px; display: flex; flex-direction: column; }
  .detail-card { display: flex; flex-direction: column; gap: 10px; padding: 14px; border-radius: 8px; background: var(--glass-2); border: 1px solid var(--glass-border); flex: 1; min-height: 0; }
  .detail-header { display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; }
  .detail-actions-top { display: flex; align-items: center; gap: 6px; }
  .report-preview { font-size: 12px; line-height: 1.5; color: var(--text-dim); white-space: pre-wrap; word-break: break-word; padding: 10px; border-radius: 6px; background: var(--abyss-2); border: 1px solid var(--glass-border); overflow-y: auto; flex: 1; min-height: 0; }
  .toolbar-btn { padding: 4px 10px; font-size: 11px; font-weight: 500; border-radius: 5px; border: 1px solid var(--glass-border); background: var(--glass-3); color: var(--text); min-height: unset; cursor: pointer; transition: all 120ms var(--spring-control); }
  .toolbar-btn.primary { background: var(--green-soft); color: var(--green); border-color: var(--green-soft); }
  .toolbar-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .toolbar-btn:hover:not(:disabled) { border-color: var(--glass-border-strong); }
  select { padding: 4px 8px; font-size: 11px; border-radius: 5px; background: var(--abyss-2); color: var(--text); border: 1px solid var(--glass-border); }
  .empty-pane { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; padding: 20px; opacity: 0.7; }
  .empty-icon { font-size: 24px; }
  .empty-title { font-size: 14px; font-weight: 500; color: var(--text); margin: 0; }
  .empty-desc { font-size: 12px; color: var(--text-faint); text-align: center; max-width: 280px; margin: 0; }
  @media (max-width: 768px) { .pane-body { grid-template-columns: 1fr; grid-template-rows: auto 1fr; } }
</style>
