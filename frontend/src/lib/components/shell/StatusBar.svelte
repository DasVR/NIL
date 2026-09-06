<script lang="ts">
  import { agentRun } from '$lib/agent/run.svelte.ts';
  import { appState } from '$lib/stores/appState.svelte.ts';
  import { tabsStore } from '$lib/stores/tabsStore';
  import SpendMeter from '$lib/components/ui/SpendMeter.svelte';
  import { usageStore } from '$lib/usage/store.svelte.ts';

  let tabs = $derived($tabsStore);
  let activeTab = $derived(tabs.tabs.find(t => t.id === tabs.activeTabId));
  let backendStatus = $derived(appState.backendHealthy ? 'connected' : 'offline');
  let engagementLabel = $derived(appState.activeEngagementId || 'no engagement');
</script>

<footer class="status-bar" role="status" aria-live="polite">
  <div class="cluster">
    <span class="dot" class:ok={appState.backendHealthy}></span>
    <span>{backendStatus}</span>
    <span class="div" aria-hidden="true"></span>
    <span class="mono">{engagementLabel}</span>
    {#if agentRun.pendingApproval}
      <span class="div" aria-hidden="true"></span>
      <span>awaiting approval</span>
      <kbd>⌘↵</kbd>
    {/if}
    {#if agentRun.running}
      <span class="div" aria-hidden="true"></span>
      <span class="nil-scan" data-state="working">running</span>
    {/if}
    <SpendMeter usage={usageStore.totals} compact />
  </div>

  <div class="cluster">
    {#if activeTab}
      <span class="mono">{activeTab.label}</span>
    {/if}
    {#if appState.yoloMode}
      <button class="ghost nil-halo" type="button" onclick={() => appState.toggleYolo()}>yolo</button>
    {/if}
    <button class="ghost nil-halo" type="button" onclick={() => appState.toggleSettings()} aria-label="Open settings">set</button>
  </div>
</footer>

<style>
  .status-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: var(--statusbar-h);
    padding: 0 var(--s-3);
    background: var(--nil-panel);
    border-top: 1px solid var(--nil-line);
    font: var(--t-micro)/1 var(--font-ui);
    letter-spacing: var(--track-tick);
    text-transform: uppercase;
    color: var(--nil-ink-3);
    flex-shrink: 0;
  }

  .cluster {
    display: flex;
    align-items: center;
    gap: var(--s-2);
  }

  .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--nil-ink-4);
  }
  .dot.ok { background: var(--nil-ink-2); }

  .div {
    width: 1px;
    height: 10px;
    background: var(--nil-line);
  }

  .mono {
    font-family: var(--font-machine);
    text-transform: none;
    letter-spacing: var(--track-mono);
  }

  .ghost {
    border: 0;
    background: none;
    color: inherit;
    font: inherit;
    letter-spacing: inherit;
    text-transform: inherit;
    cursor: pointer;
    padding: 0 4px;
  }

  kbd {
    font: var(--t-micro)/1 var(--font-machine);
    text-transform: none;
  }
</style>
