<script>
  import { appState } from '$lib/stores.svelte';
  import { Motion } from 'svelte-motion';

  const severityStyles = {
    critical: { color: '#ff2d55', glow: 'var(--shadow-critical)' },
    high: { color: '#ff5c5c', glow: '0 0 16px rgba(255, 92, 92, 0.25)' },
    medium: { color: '#ffb454', glow: 'none' },
    low: { color: '#5cb8ff', glow: 'none' },
    info: { color: '#9a9a94', glow: 'none' }
  };

  const timelineIcons = {
    scan: '🔍',
    finding: '⚡',
    command: '⌘',
    note: '📝',
    chat: '💬'
  };

  function severityClass(s) {
    return s?.toLowerCase() || 'info';
  }
</script>

<aside class="right-sidebar" class:open={appState.rightSidebarOpen} aria-label="Findings and timeline">
  <div class="rs-header">
    <span class="label-micro">Workspace</span>
    <button
      type="button"
      class="rs-toggle"
      onclick={() => appState.toggleRight()}
      aria-label={appState.rightSidebarOpen ? 'Collapse findings' : 'Expand findings'}
      title={appState.rightSidebarOpen ? 'Collapse (Cmd+Shift+B)' : 'Expand'}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        {#if appState.rightSidebarOpen}
          <path d="m9 18 6-6-6-6"/>
        {:else}
          <path d="m15 18-6-6 6-6"/>
        {/if}
      </svg>
    </button>
  </div>

  {#if appState.rightSidebarOpen}
    <!-- Findings -->
    <section class="rs-section">
      <div class="rs-section-header">
        <span class="label-micro">Findings</span>
        <span class="badge">{appState.findings.length}</span>
      </div>
      <div class="rs-list findings-list">
        {#if appState.findings.length === 0}
          <p class="rs-empty">No findings yet. Run a scan to populate.</p>
        {:else}
          {#each appState.findings.slice(0, 20) as finding}
            <div class="finding-card" class:critical={finding.severity === 'critical'}>
              <div class="finding-bar" style="background: {severityStyles[severityClass(finding.severity)]?.color || '#9a9a94'}"></div>
              <div class="finding-body">
                <span class="finding-title mono">{finding.title}</span>
                <span class="finding-meta mono">{finding.severity?.toUpperCase()} · {finding.file}</span>
              </div>
            </div>
          {/each}
        {/if}
      </div>
    </section>

    <!-- Scope -->
    <section class="rs-section">
      <div class="rs-section-header">
        <span class="label-micro">Scope</span>
      </div>
      <div class="scope-box">
        {#if appState.scope}
          <pre class="scope-text mono">{appState.scope}</pre>
        {:else}
          <p class="rs-empty">No scope defined.</p>
        {/if}
      </div>
    </section>

    <!-- Activity Timeline -->
    <section class="rs-section">
      <div class="rs-section-header">
        <span class="label-micro">Timeline</span>
      </div>
      <div class="rs-list timeline-list">
        {#if appState.timeline.length === 0}
          <p class="rs-empty">Activity will appear here.</p>
        {:else}
          {#each appState.timeline.slice(0, 15) as event}
            <div class="timeline-item">
              <span class="timeline-icon">{timelineIcons[event.type] || '•'}</span>
              <div class="timeline-body">
                <span class="timeline-title">{event.title}</span>
                <span class="timeline-time mono">{event.timestamp}</span>
              </div>
            </div>
          {/each}
        {/if}
      </div>
    </section>
  {/if}
</aside>

<style>
  .right-sidebar {
    grid-column: 3;
    grid-row: 1;
    background: var(--glass-2);
    border-left: 1px solid var(--glass-border);
    backdrop-filter: blur(24px) saturate(1.5);
    -webkit-backdrop-filter: blur(24px) saturate(1.5);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    transition: width 320ms var(--spring-layout), opacity 200ms var(--spring-smooth);
    width: 0px;
    opacity: 0;
  }

  .right-sidebar.open {
    width: var(--rightbar-width);
    opacity: 1;
  }

  .rs-header {
    height: 36px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 12px;
    border-bottom: 1px solid var(--glass-border);
    background: var(--glass-3);
  }

  .rs-toggle {
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

  .rs-toggle:hover {
    background: var(--glass-3);
    color: var(--text);
  }

  .rs-section {
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    min-height: 0;
    border-bottom: 1px solid var(--glass-border);
  }

  .rs-section:last-child {
    border-bottom: none;
    flex: 1;
  }

  .rs-section-header {
    height: 32px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 12px;
    background: rgba(255, 255, 255, 0.02);
  }

  .badge {
    font-size: 10px;
    font-weight: 600;
    padding: 1px 6px;
    border-radius: 10px;
    background: var(--glass-3);
    color: var(--text-dim);
    font-family: var(--font-mono);
  }

  .rs-list {
    overflow-y: auto;
    padding: 6px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-height: 0;
  }

  .rs-empty {
    font-size: 11px;
    color: var(--text-faint);
    padding: 12px;
    text-align: center;
  }

  /* Findings cards */
  .finding-card {
    display: flex;
    gap: 8px;
    padding: 8px 10px;
    border-radius: 6px;
    background: var(--glass-3);
    border: 1px solid var(--glass-border);
    transition: border-color 150ms var(--spring-control);
    cursor: pointer;
  }

  .finding-card:hover {
    border-color: var(--glass-border-strong);
  }

  .finding-card.critical {
    border-color: rgba(255, 45, 85, 0.3);
    box-shadow: var(--shadow-critical);
  }

  .finding-bar {
    width: 3px;
    border-radius: 2px;
    flex-shrink: 0;
  }

  .finding-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  .finding-title {
    font-size: 12px;
    color: var(--text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .finding-meta {
    font-size: 10px;
    color: var(--text-faint);
  }

  /* Scope */
  .scope-box {
    padding: 10px;
    overflow: auto;
  }

  .scope-text {
    font-size: 11px;
    line-height: 1.5;
    color: var(--text-dim);
    margin: 0;
    white-space: pre-wrap;
    word-break: break-word;
  }

  /* Timeline */
  .timeline-list {
    gap: 2px;
  }

  .timeline-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 8px;
    border-radius: 5px;
    transition: background 120ms var(--spring-control);
  }

  .timeline-item:hover {
    background: var(--glass-3);
  }

  .timeline-icon {
    font-size: 12px;
    flex-shrink: 0;
  }

  .timeline-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 1px;
    min-width: 0;
  }

  .timeline-title {
    font-size: 11px;
    color: var(--text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .timeline-time {
    font-size: 10px;
    color: var(--text-faint);
  }

  @media (prefers-reduced-motion: reduce) {
    .right-sidebar {
      transition: none;
    }
  }
</style>
