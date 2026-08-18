<script>
  import { appState } from '$lib/stores.svelte';
  import { apiPost } from '$lib/api';
  import PageHeader from '$lib/components/PageHeader.svelte';

  let target = $state('');
  let plugin = $state('');
  let selectedPlugin = $state(null);
  let proposing = $state(false);

  const safetyColor = {
    safe: '#00d992',
    cautious: '#ffb454',
    destructive: '#ff5c5c',
    dangerous: '#ff2d55'
  };

  const toolRuns = $derived({});

  async function run() {
    if (!target.trim() || !plugin) return;
    proposing = true;
    try {
      await apiPost('/v1/plugins/run', {
        engagement: appState.engagement,
        plugin_name: plugin,
        target: target.trim(),
        args: {}
      });
      await appState.refresh();
    } finally {
      proposing = false;
    }
  }

  function selectPlugin(p) {
    selectedPlugin = p;
    plugin = p.name;
  }

  function getPluginStatus(p) {
    const pending = appState.pending.find(r => r.tool === p.name);
    if (pending) return { label: 'pending', color: '#ffb454' };
    return { label: 'ready', color: '#00d992' };
  }
</script>

<section class="page">
  <PageHeader title="Plugins & Tools" count={appState.plugins.length} subtitle={appState.engagement} />

  <div class="pane-body">
    <div class="list-pane">
      <div class="list-toolbar">
        <span class="label-micro">Tool library</span>
      </div>

      {#if appState.plugins.length === 0}
        <div class="empty-pane">
          <span class="empty-icon">🔧</span>
          <p class="empty-title">No plugins loaded</p>
          <p class="empty-desc">Plugins are loaded from the backend. Start finn api and they'll appear here.</p>
        </div>
      {:else}
        <div class="plugin-list">
          {#each appState.plugins as p}
            {@const status = getPluginStatus(p)}
            <button
              type="button"
              class="plugin-row"
              class:selected={selectedPlugin?.name === p.name}
              onclick={() => selectPlugin(p)}
            >
              <div class="plugin-meta">
                <div class="plugin-top">
                  <span class="plugin-name">{p.name}</span>
                  <span class="safety-badge" style="background: {safetyColor[p.safety_level?.toLowerCase()] || '#9a9a94'}">
                    {p.safety_level}
                  </span>
                </div>
                <span class="plugin-desc">{p.description}</span>
                <span class="plugin-status mono" style="color: {status.color}">{status.label}</span>
              </div>
            </button>
          {/each}
        </div>
      {/if}
    </div>

    <div class="detail-pane">
      {#if selectedPlugin}
        <div class="detail-card">
          <div class="detail-header">
            <span class="detail-name">{selectedPlugin.name}</span>
            <span class="safety-badge" style="background: {safetyColor[selectedPlugin.safety_level?.toLowerCase()] || '#9a9a94'}">
              {selectedPlugin.safety_level}
            </span>
          </div>
          <p class="detail-desc">{selectedPlugin.description}</p>

          <div class="detail-tools">
            <span class="label-micro">Available tools</span>
            <div class="tool-chips">
              {#each selectedPlugin.tools || [] as t}
                <span class="tool-chip mono">{t}</span>
              {/each}
            </div>
          </div>

          <div class="propose-box">
            <input
              bind:value={target}
              placeholder="target host or URL (in-scope)"
            />
            <button
              type="button"
              class="toolbar-btn primary"
              onclick={run}
              disabled={proposing || !target.trim()}
            >
              {proposing ? 'Proposing…' : 'Propose run'}
            </button>
          </div>

          {#if appState.pending.some(r => r.tool === selectedPlugin.name)}
            <div class="pending-banner">
              <span class="pending-dot"></span>
              <span class="mono">Pending approval in terminal</span>
            </div>
          {/if}
        </div>
      {:else}
        <div class="empty-pane">
          <p class="empty-desc">Select a plugin to view tools, safety level, and propose a run.</p>
        </div>
      {/if}
    </div>
  </div>
</section>

<style>
  .page { flex: 1; min-height: 0; display: flex; flex-direction: column; overflow: hidden; }
  .pane-body { flex: 1; min-height: 0; display: grid; grid-template-columns: 280px 1fr; overflow: hidden; }
  .list-pane { display: flex; flex-direction: column; min-height: 0; border-right: 1px solid var(--glass-border); background: var(--glass-2); }
  .list-toolbar { height: 32px; flex-shrink: 0; display: flex; align-items: center; padding: 0 10px; border-bottom: 1px solid var(--glass-border); }
  .plugin-list { flex: 1; overflow-y: auto; padding: 4px; display: flex; flex-direction: column; gap: 2px; }
  .plugin-row { display: flex; align-items: flex-start; padding: 6px 8px; border-radius: 5px; border: none; background: transparent; color: var(--text); text-align: left; cursor: pointer; transition: background 120ms var(--spring-control); min-height: 32px; }
  .plugin-row:hover { background: var(--glass-3); }
  .plugin-row.selected { background: var(--glass-3); border-left: 2px solid var(--green); padding-left: 6px; }
  .plugin-meta { flex: 1; display: flex; flex-direction: column; gap: 2px; min-width: 0; }
  .plugin-top { display: flex; align-items: center; gap: 6px; }
  .plugin-name { font-size: 12px; font-weight: 500; color: var(--text); }
  .plugin-desc { font-size: 11px; color: var(--text-faint); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .plugin-status { font-size: 10px; }
  .safety-badge { font-size: 9px; font-weight: 600; padding: 1px 5px; border-radius: 4px; color: var(--abyss); letter-spacing: 0.02em; }
  .detail-pane { flex: 1; min-height: 0; overflow-y: auto; padding: 12px; display: flex; flex-direction: column; }
  .detail-card { display: flex; flex-direction: column; gap: 10px; padding: 14px; border-radius: 8px; background: var(--glass-2); border: 1px solid var(--glass-border); }
  .detail-header { display: flex; align-items: center; gap: 10px; }
  .detail-name { font-size: 16px; font-weight: 600; color: var(--text); }
  .detail-desc { font-size: 12px; color: var(--text-dim); line-height: 1.5; margin: 0; }
  .detail-tools { display: flex; flex-direction: column; gap: 6px; }
  .tool-chips { display: flex; flex-wrap: wrap; gap: 4px; }
  .tool-chip { font-size: 10px; padding: 2px 7px; border-radius: 4px; background: var(--glass-3); border: 1px solid var(--glass-border); color: var(--text-dim); }
  .propose-box { display: flex; gap: 6px; margin-top: 6px; }
  .propose-box input { flex: 1; }
  .pending-banner { display: flex; align-items: center; gap: 8px; padding: 6px 10px; border-radius: 5px; background: var(--warning-soft); border: 1px solid rgba(255, 180, 84, 0.2); }
  .pending-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--warning); animation: pulse 1.5s ease-in-out infinite; }
  .toolbar-btn { padding: 4px 10px; font-size: 11px; font-weight: 500; border-radius: 5px; border: 1px solid var(--glass-border); background: var(--glass-3); color: var(--text); min-height: unset; cursor: pointer; transition: all 120ms var(--spring-control); }
  .toolbar-btn.primary { background: var(--green-soft); color: var(--green); border-color: var(--green-soft); }
  .toolbar-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .toolbar-btn:hover:not(:disabled) { border-color: var(--glass-border-strong); }
  .empty-pane { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; padding: 20px; opacity: 0.7; }
  .empty-icon { font-size: 24px; }
  .empty-title { font-size: 14px; font-weight: 500; color: var(--text); margin: 0; }
  .empty-desc { font-size: 12px; color: var(--text-faint); text-align: center; max-width: 280px; margin: 0; }
  @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
  @media (max-width: 768px) { .pane-body { grid-template-columns: 1fr; grid-template-rows: 1fr 1fr; } }
  @media (prefers-reduced-motion: reduce) { .pending-dot { animation: none; opacity: 1; } }
</style>
