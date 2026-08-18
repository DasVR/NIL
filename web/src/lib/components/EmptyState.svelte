<script lang="ts">
  import { appState } from '$lib/stores.svelte';

  const templates = [
    { name: 'external-pt', label: 'External pentest', scope: '10.0.0.0/24, example.com' },
    { name: 'internal-net', label: 'Internal network', scope: '192.168.1.0/24' },
    { name: 'web-app', label: 'Web application', scope: 'https://app.example.com' },
    { name: 'wireless', label: 'Wireless audit', scope: 'SSID: CorpNet' }
  ];

  let name = $state('');
  let scope = $state('');
  let error = $state('');
  let busy = $state(false);

  async function create(n = name, s = scope) {
    error = '';
    const trimmed = n.trim();
    if (!trimmed) {
      error = 'Name the Space.';
      return;
    }
    busy = true;
    try {
      await appState.createEngagement(trimmed, s);
      name = '';
      scope = '';
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
    } finally {
      busy = false;
    }
  }
</script>

<div class="empty-state">
  <div class="empty-content">
    <h1>New Space</h1>
    <p>
      Name an engagement and paste scope. The terminal is home — Finn sits beside it.
    </p>
    <label>
      Name
      <input bind:value={name} placeholder="acme-corp" onkeydown={(e) => e.key === 'Enter' && create()} />
    </label>
    <label>
      Scope
      <textarea bind:value={scope} rows="3" placeholder="10.0.0.0/24, app.acme.com"></textarea>
    </label>
    {#if error}<p class="err">{error}</p>{/if}
    <button type="button" class="primary" disabled={busy} onclick={() => create()}>
      {busy ? 'Creating…' : 'Create Space'}
    </button>

    <div class="template-grid">
      <span class="label-micro">Templates</span>
      {#each templates as t}
        <button type="button" class="template-card" onclick={() => create(t.name, t.scope)}>
          <span class="template-name">{t.label}</span>
          <span class="template-scope mono">{t.scope}</span>
        </button>
      {/each}
    </div>

    {#if appState.engagements.length > 0}
      <div class="recent-engagements">
        <span class="label-micro">Recent</span>
        {#each appState.engagements.slice(0, 5) as eng}
          <button type="button" class="recent-row" onclick={() => appState.select(eng.name)}>
            <span>{eng.name}</span>
            <span class="mono dim">{eng.findings_count} findings</span>
          </button>
        {/each}
      </div>
    {/if}
  </div>
</div>

<style>
  .empty-state {
    flex: 1;
    min-height: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow-y: auto;
    padding: 40px 20px;
  }
  .empty-content {
    max-width: 440px;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  h1 { margin: 0; font-size: 22px; font-weight: 600; letter-spacing: -0.02em; }
  p { margin: 0; font-size: 14px; color: var(--text-dim); line-height: 1.5; }
  label {
    display: flex; flex-direction: column; gap: 6px;
    font-size: 11px; color: var(--text-faint); text-transform: uppercase; letter-spacing: 0.06em;
  }
  input, textarea { text-transform: none; letter-spacing: 0; }
  .err { color: var(--danger); font-size: 12px; }
  .primary { align-self: flex-start; min-height: 32px; }
  .template-grid { display: flex; flex-direction: column; gap: 6px; margin-top: 8px; }
  .template-card {
    display: flex; flex-direction: column; align-items: flex-start; gap: 2px;
    padding: 10px 12px; min-height: unset; text-align: left;
  }
  .template-name { font-size: 13px; }
  .template-scope { font-size: 11px; color: var(--text-faint); }
  .recent-engagements { display: flex; flex-direction: column; gap: 4px; padding-top: 12px; border-top: 1px solid var(--glass-border); }
  .recent-row {
    display: flex; justify-content: space-between; min-height: unset; height: 28px;
    background: transparent; border: 0;
  }
  .dim { color: var(--text-faint); font-size: 11px; }
</style>
