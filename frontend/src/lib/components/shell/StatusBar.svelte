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
    <div class="status-item">
      <span class="status-dot" style:background={status === 'running' ? 'var(--accent-primary)' : status === 'error' ? 'var(--color-danger)' : appState.backendHealthy ? 'var(--color-success)' : 'var(--color-danger)'} />
      <span>{status === 'running' ? 'Agent running' : status === 'error' ? 'Error' : appState.backendHealthy ? 'Ready' : 'Backend offline'}</span>
    </div>

    <div class="status-divider" />
    <div class="status-item">
      <Icon icon="ph:briefcase-bold" width="14" height="14" />
      <span>{engagementLabel}</span>
    </div>

    {#if activeTab}
      <div class="status-divider" />
      <div class="status-item">
        <Icon icon="ph:terminal-bold" width="14" height="14" />
        <span>{activeTab.label}</span>
      </div>
    {/if}

    {#if $agentStore.pendingApproval}
      <div class="status-divider" />
      <div class="status-item pending">
        <span class="status-dot blinking" />
        <span>Approval pending</span>
        <kbd>Cmd+Enter</kbd>
      </div>
    {/if}
  </div>

  <div class="status-center">
    <div class="status-item">
      <span>Ln 1, Col 1</span>
    </div>
    <div class="status-item">
      <span>UTF-8</span>
    </div>
    <div class="status-item">
      <span>LF</span>
    </div>
    <div class="status-item">
      <span>TypeScript</span>
    </div>
  </div>

  <div class="status-right">
    {#if appState.yoloMode}
      <div class="status-item yolo">
        <Icon icon="ph:rocket-launch-bold" width="14" height="14" />
        <span>YOLO</span>
      </div>
      <div class="status-divider" />
    {/if}

    <div class="status-item">
      <Icon icon="ph:memory-bold" width="14" height="14" />
      <span>~42 MB</span>
    </div>

    <div class="status-divider" />

    <div class="status-item">
      <Icon icon="ph:network-bold" width="14" height="14" />
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
    gap: 6px;
    color: var(--text-tertiary);
  }

  .status-item:hover {
    color: var(--text-secondary);
  }

  .status-item.pending {
    color: var(--accent-primary);
    animation: pulse 1.5s var(--spring-bouncy) infinite;
  }

  .status-item.yolo {
    color: var(--accent-primary);
    font-weight: 600;
  }

  .status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .status-dot.blinking {
    animation: blink 1s infinite;
  }

  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }

  .status-divider {
    width: 1px;
    height: 16px;
    background: var(--surface-border);
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