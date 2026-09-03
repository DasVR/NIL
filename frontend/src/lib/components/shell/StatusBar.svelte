<script lang="ts">
  import { onMount } from 'svelte';
  import { appState } from '$lib/stores/appState.svelte.ts';
  import { agentStore } from '$lib/stores/agentStore';
  import { tabsStore } from '$lib/stores/tabsStore';
  import Icon from '@iconify/svelte';

  let store = $derived($agentStore);
  let tabs = $derived($tabsStore);
  let activeTab = $derived(tabs.tabs.find(t => t.id === tabs.activeTabId));
  let status = $derived(store.running ? 'running' : ($agentStore.pendingApproval ? 'idle' : 'idle'));
  let backendStatus = $derived(appState.backendHealthy ? 'Connected' : 'Offline');
  let engagementLabel = $derived(appState.activeEngagementId || 'No engagement');

  onMount(() => {
    // Subscribe to agent running state
    // In real app, would use $effect to sync
  });
</script>

<footer class="status-bar" role="status" aria-live="polite">
  <div class="status-left">
    <button class="status-item status-btn backend" title="Backend connection status" aria-label="Backend status: {backendStatus}">
      <span class="status-dot" class:online={appState.backendHealthy} class:offline={!appState.backendHealthy} />
      <span>{appState.backendHealthy ? 'Ready' : 'Offline'}</span>
    </button>

    <div class="status-divider" aria-hidden="true" />

    <button class="status-item status-btn" title="Active engagement" aria-label="Engagement: {engagementLabel}">
      <Icon icon="ph:folder-simple-bold" width="12" height="12" />
      <span class="status-truncate">{engagementLabel}</span>
    </button>

    {#if $agentStore.pendingApproval}
      <div class="status-divider" aria-hidden="true" />
      <button class="status-item status-btn pending" aria-label="Approval pending — press Cmd+Enter to approve">
        <span class="status-dot blinking" />
        <span>Awaiting approval</span>
        <kbd>⌘↵</kbd>
      </button>
    {/if}

    {#if store.running}
      <div class="status-divider" aria-hidden="true" />
      <div class="status-item running">
        <span class="status-spinner" aria-hidden="true"></span>
        <span>Agent running</span>
      </div>
    {/if}
  </div>

  <div class="status-center">
    {#if activeTab}
      <div class="status-item mono">
        <span>{activeTab.label}</span>
      </div>
    {/if}
  </div>

  <div class="status-right">
    {#if appState.yoloMode}
      <button class="status-item status-btn yolo" onclick={() => appState.toggleYolo()} title="YOLO mode active — click to disable" aria-label="YOLO mode active">
        <Icon icon="ph:rocket-launch-bold" width="12" height="12" />
        <span>YOLO</span>
      </button>
      <div class="status-divider" aria-hidden="true" />
    {/if}

    <button class="status-item status-btn" onclick={() => appState.toggleSettings()} title="Open settings (Cmd+,)" aria-label="Open settings">
      <Icon icon="ph:gear-bold" width="12" height="12" />
    </button>

    <div class="status-divider" aria-hidden="true" />

    <div class="status-item mono" title="Backend: {backendStatus}">
      <span>{backendStatus}</span>
    </div>
  </div>
</footer>

<style>
  .status-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: var(--statusbar-h);
    padding: 0 var(--space-2);
    background: var(--surface-card);
    border-top: 1px solid var(--surface-border);
    font-size: var(--font-2xs);
    font-family: var(--font-mono);
    color: var(--text-tertiary);
    z-index: var(--z-sticky);
    flex-shrink: 0;
  }

  .status-left,
  .status-center,
  .status-right {
    display: flex;
    align-items: center;
    gap: var(--space-3);
  }

  .status-item {
    display: flex;
    align-items: center;
    gap: 5px;
    color: var(--text-tertiary);
    white-space: nowrap;
  }

  .status-item.mono {
    font-family: var(--font-mono);
  }

  .status-btn {
    background: transparent;
    border: none;
    cursor: pointer;
    border-radius: 3px;
    padding: 1px 4px;
    margin: 0 -4px;
    transition: background var(--dur-fast) var(--spring-snappy),
      color var(--dur-fast) var(--spring-snappy);
  }

  .status-btn:hover {
    background: var(--surface-hover);
    color: var(--text-secondary);
  }

  .status-btn:active {
    background: var(--surface-card);
  }

  .status-btn:focus-visible {
    outline: 1px solid var(--accent-primary);
    outline-offset: 1px;
  }

  .status-item.pending {
    color: var(--color-violet-light);
  }

  .status-item.running {
    color: var(--color-violet-light);
  }

  .status-item.yolo {
    color: var(--color-coral);
    font-weight: 600;
  }

  .status-item.backend { gap: 5px; }
  .status-item.backend.online { color: var(--color-success); }
  .status-item.backend.offline { color: var(--color-danger); }

  .status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    flex-shrink: 0;
    background: currentColor;
  }

  .status-dot.online { background: var(--color-success); }
  .status-dot.offline { background: var(--color-danger); }

  .status-dot.blinking {
    animation: blink 1.2s var(--spring-bouncy) infinite;
  }

  .status-spinner {
    width: 8px;
    height: 8px;
    border: 1.5px solid var(--color-violet-light);
    border-top-color: transparent;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    flex-shrink: 0;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.25; }
  }

  .status-divider {
    width: 1px;
    height: 12px;
    background: var(--surface-border);
    flex-shrink: 0;
  }

  .status-truncate {
    max-width: 140px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .status-item kbd {
    font-family: var(--font-mono);
    font-size: 10px;
    padding: 1px 4px;
    border-radius: 3px;
    background: var(--surface-hover);
    border: 1px solid var(--surface-border);
  }
</style>