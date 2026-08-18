<script>
  import { appState } from '$lib/stores.svelte';

  const severityDots = {
    critical: '#ff2d55',
    high: '#ff5c5c',
    medium: '#ffb454',
    low: '#5cb8ff',
    info: '#9a9a94'
  };

  function addTarget() {
    const host = prompt('Target hostname or IP?');
    if (host) {
      appState.targets = [...appState.targets, {
        id: crypto.randomUUID(),
        host,
        ports: [],
        status: 'pending'
      }];
    }
  }

  function selectTarget(t) {
    // set active target context
  }

  function severityColor(s) {
    return severityDots[s?.toLowerCase()] || '#9a9a94';
  }
</script>

<aside class="left-sidebar" class:open={appState.leftSidebarOpen} aria-label="Engagement targets">
  <div class="ls-header">
    <div class="ls-brand">
      <span class="ls-logo">F</span>
      <span class="ls-title">Finn</span>
    </div>
    <button
      type="button"
      class="ls-toggle"
      onclick={() => appState.toggleLeft()}
      aria-label={appState.leftSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        {#if appState.leftSidebarOpen}
          <path d="m15 18-6-6 6-6"/>
        {:else}
          <path d="m9 18 6-6-6-6"/>
        {/if}
      </svg>
    </button>
  </div>

  {#if appState.leftSidebarOpen}
    <!-- Search / Palette -->
    <button
      type="button"
      class="ls-search"
      onclick={() => appState.paletteOpen = true}
      aria-label="Open command palette"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="7"/><path d="m20 20-3-3"/>
      </svg>
      <span>Search…</span>
      <kbd class="mono">⌘K</kbd>
    </button>

    <!-- Targets Tree -->
    <section class="ls-section">
      <div class="ls-section-header">
        <span class="label-micro">Targets</span>
        <button type="button" class="ls-add-btn" onclick={addTarget} aria-label="Add target">+</button>
      </div>
      <div class="ls-list">
        {#if appState.targets.length === 0}
          <p class="ls-empty">No targets. Add one to start.</p>
        {:else}
          {#each appState.targets as target}
            <div class="target-row" class:active={appState.activeTarget?.id === target.id} onclick={() => selectTarget(target)}>
              <span class="target-status" class:scanning={target.status === 'scanning'} class:done={target.status === 'done'} class:error={target.status === 'error'}></span>
              <span class="target-host mono">{target.host}</span>
              {#if target.ports.length}
                <span class="target-ports mono">{target.ports.join(',')}</span>
              {/if}
            </div>
          {/each}
        {/if}
      </div>
    </section>

    <!-- Findings Quick View -->
    <section class="ls-section">
      <div class="ls-section-header">
        <span class="label-micro">Findings</span>
        <div class="severity-counts">
          {#if appState.criticalCount > 0}
            <span class="count critical">{appState.criticalCount}</span>
          {/if}
          {#if appState.highCount > 0}
            <span class="count high">{appState.highCount}</span>
          {/if}
        </div>
      </div>
      <div class="ls-list">
        {#if appState.findings.length === 0}
          <p class="ls-empty">No findings yet.</p>
        {:else}
          {#each appState.findings.slice(0, 8) as finding}
            <div class="mini-finding">
              <span class="mini-severity" style="background: {severityColor(finding.severity)}"></span>
              <span class="mini-title">{finding.title}</span>
            </div>
          {/each}
        {/if}
      </div>
    </section>

    <!-- Credentials -->
    <section class="ls-section">
      <div class="ls-section-header">
        <span class="label-micro">Creds</span>
      </div>
      <div class="ls-list">
        <p class="ls-empty">Cred store synced with backend.</p>
      </div>
    </section>
  {/if}
</aside>

<style>
  .left-sidebar {
    grid-column: 1;
    grid-row: 1;
    background: var(--glass-2);
    border-right: 1px solid var(--glass-border);
    backdrop-filter: blur(24px) saturate(1.5);
    -webkit-backdrop-filter: blur(24px) saturate(1.5);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    transition: width 320ms var(--spring-layout), opacity 200ms var(--spring-smooth);
    width: 0px;
    opacity: 0;
  }

  .left-sidebar.open {
    width: var(--sidebar-width);
    opacity: 1;
  }

  .ls-header {
    height: 40px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 12px;
    border-bottom: 1px solid var(--glass-border);
    background: var(--glass-3);
  }

  .ls-brand {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .ls-logo {
    width: 24px;
    height: 24px;
    border-radius: 6px;
    background: var(--green);
    color: var(--abyss);
    font-weight: 700;
    font-size: 14px;
    display: grid;
    place-items: center;
    flex-shrink: 0;
  }

  .ls-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--text);
  }

  .ls-toggle {
    width: 24px;
    height: 24px;
    padding: 0;
    min-height: unset;
    display: grid;
    place-items: center;
    border-radius: 5px;
    border: none;
    background: transparent;
    color: var(--text-faint);
    transition: all 150ms var(--spring-control);
  }

  .ls-toggle:hover {
    background: var(--glass-3);
    color: var(--text);
  }

  .ls-search {
    margin: 8px 10px;
    height: 32px;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 10px;
    border-radius: 6px;
    background: var(--glass-3);
    border: 1px solid var(--glass-border);
    color: var(--text-dim);
    font-size: 12px;
    transition: all 150ms var(--spring-control);
  }

  .ls-search:hover {
    border-color: var(--glass-border-strong);
    color: var(--text);
  }

  .ls-search kbd {
    margin-left: auto;
    font-size: 10px;
    padding: 2px 5px;
    border-radius: 4px;
    background: var(--abyss-2);
    border: 1px solid var(--glass-border);
    color: var(--text-faint);
  }

  .ls-section {
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    min-height: 0;
    border-bottom: 1px solid var(--glass-border);
  }

  .ls-section:last-child {
    border-bottom: none;
    flex: 1;
  }

  .ls-section-header {
    height: 28px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 12px;
    background: rgba(255, 255, 255, 0.02);
  }

  .ls-add-btn {
    width: 20px;
    height: 20px;
    padding: 0;
    min-height: unset;
    display: grid;
    place-items: center;
    border-radius: 5px;
    border: none;
    background: transparent;
    color: var(--text-faint);
    font-size: 14px;
    font-weight: 300;
    transition: all 120ms var(--spring-control);
  }

  .ls-add-btn:hover {
    background: var(--glass-3);
    color: var(--green);
  }

  .ls-list {
    overflow-y: auto;
    padding: 4px;
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-height: 0;
  }

  .ls-empty {
    font-size: 11px;
    color: var(--text-faint);
    padding: 12px;
    text-align: center;
  }

  /* Target rows */
  .target-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 8px;
    border-radius: 5px;
    cursor: pointer;
    transition: background 120ms var(--spring-control);
    min-height: 32px;
  }

  .target-row:hover {
    background: var(--glass-3);
  }

  .target-row.active {
    background: var(--glass-3);
    border-left: 2px solid var(--green);
    padding-left: 6px;
  }

  .target-status {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--text-faint);
    flex-shrink: 0;
  }

  .target-status.scanning {
    background: var(--green);
    box-shadow: 0 0 6px var(--green-glow);
    animation: pulse 1.5s ease-in-out infinite;
  }

  .target-status.done { background: var(--green-dim); }
  .target-status.error { background: var(--danger); }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }

  .target-host {
    font-size: 12px;
    color: var(--text);
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .target-ports {
    font-size: 10px;
    color: var(--text-faint);
    flex-shrink: 0;
  }

  /* Severity counts */
  .severity-counts {
    display: flex;
    gap: 4px;
  }

  .count {
    font-size: 10px;
    font-weight: 600;
    padding: 1px 5px;
    border-radius: 8px;
    font-family: var(--font-mono);
  }

  .count.critical {
    background: var(--critical-soft);
    color: var(--critical);
  }

  .count.high {
    background: var(--danger-soft);
    color: var(--danger);
  }

  /* Mini findings */
  .mini-finding {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 5px 8px;
    border-radius: 4px;
    transition: background 120ms var(--spring-control);
    cursor: pointer;
  }

  .mini-finding:hover {
    background: var(--glass-3);
  }

  .mini-severity {
    width: 4px;
    height: 16px;
    border-radius: 2px;
    flex-shrink: 0;
  }

  .mini-title {
    font-size: 11px;
    color: var(--text-dim);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex: 1;
  }

  @media (prefers-reduced-motion: reduce) {
    .left-sidebar {
      transition: none;
    }
    .target-status.scanning {
      animation: none;
      opacity: 1;
    }
  }
</style>
