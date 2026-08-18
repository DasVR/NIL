<script>
  import { appState } from '$lib/stores.svelte';

  const templates = [
    { name: 'External Penetration Test', scope: '10.10.10.0/24, example.com' },
    { name: 'Internal Network Assessment', scope: '192.168.1.0/24' },
    { name: 'Web Application Test', scope: 'https://target.example.com' },
    { name: 'Wireless Audit', scope: 'WiFi SSID: CorpNet' }
  ];

  function createFromTemplate(t) {
    appState.createEngagement(t.name);
    appState.scope = t.scope;
  }

  function createBlank() {
    const name = prompt('Engagement name?');
    if (name) appState.createEngagement(name.trim());
  }
</script>

<div class="empty-state">
  <div class="empty-content">
    <div class="empty-brand">
      <span class="empty-logo">F</span>
    </div>
    <h1 class="empty-title">New Engagement</h1>
    <p class="empty-desc">
      Start a new pentest engagement. Define your scope, add targets, and let Finn handle the tooling.
    </p>

    <div class="empty-actions">
      <button type="button" class="btn primary" onclick={createBlank}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 5v14M5 12h14"/>
        </svg>
        Blank Engagement
      </button>
    </div>

    <div class="template-grid">
      <span class="label-micro template-label">Quick Start Templates</span>
      {#each templates as t}
        <button type="button" class="template-card" onclick={() => createFromTemplate(t)}>
          <span class="template-name">{t.name}</span>
          <span class="template-scope mono">{t.scope}</span>
        </button>
      {/each}
    </div>

    {#if appState.engagements.length > 0}
      <div class="recent-engagements">
        <span class="label-micro">Recent</span>
        <div class="recent-list">
          {#each appState.engagements.slice(0, 5) as eng}
            <button type="button" class="recent-row" onclick={() => appState.select(eng.name)}>
              <span class="recent-name">{eng.name}</span>
              <span class="recent-meta mono">{eng.findings_count} findings</span>
            </button>
          {/each}
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  .empty-state {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    overflow-y: auto;
    padding: 40px 20px;
  }

  .empty-content {
    max-width: 480px;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;
  }

  .empty-brand {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .empty-logo {
    width: 64px;
    height: 64px;
    border-radius: 16px;
    background: linear-gradient(135deg, var(--green), var(--green-dim));
    color: var(--abyss);
    font-size: 32px;
    font-weight: 700;
    display: grid;
    place-items: center;
    box-shadow: var(--shadow-glow);
  }

  .empty-title {
    font-size: 22px;
    font-weight: 600;
    color: var(--text);
    margin: 0;
    text-align: center;
  }

  .empty-desc {
    font-size: 14px;
    color: var(--text-dim);
    line-height: 1.5;
    text-align: center;
    margin: 0;
    max-width: 380px;
  }

  .empty-actions {
    display: flex;
    gap: 10px;
  }

  .empty-actions .btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 18px;
    font-size: 14px;
    font-weight: 500;
  }

  .template-grid {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-top: 8px;
  }

  .template-label {
    margin-bottom: 4px;
  }

  .template-card {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 12px 14px;
    border-radius: 8px;
    background: var(--glass-2);
    border: 1px solid var(--glass-border);
    text-align: left;
    cursor: pointer;
    transition: border-color 150ms var(--spring-control), background 150ms var(--spring-control);
  }

  .template-card:hover {
    border-color: var(--green-soft);
    background: var(--glass-3);
  }

  .template-name {
    font-size: 13px;
    font-weight: 500;
    color: var(--text);
  }

  .template-scope {
    font-size: 11px;
    color: var(--text-faint);
  }

  .recent-engagements {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 8px;
    padding-top: 16px;
    border-top: 1px solid var(--glass-border);
  }

  .recent-list {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .recent-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 10px;
    border-radius: 6px;
    background: transparent;
    border: none;
    cursor: pointer;
    transition: background 120ms var(--spring-control);
  }

  .recent-row:hover {
    background: var(--glass-2);
  }

  .recent-name {
    font-size: 13px;
    color: var(--text);
  }

  .recent-meta {
    font-size: 11px;
    color: var(--text-faint);
  }

  @media (prefers-reduced-motion: reduce) {
    .template-card, .recent-row {
      transition: none;
    }
  }
</style>
