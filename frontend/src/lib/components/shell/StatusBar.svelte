<script lang="ts">
  import { agentRun } from '$lib/agent/run.svelte.ts';
  import { appState } from '$lib/stores/appState.svelte.ts';
  import { workspace } from '$lib/stores/workspace.svelte.ts';
  import { tabsStore } from '$lib/stores/tabsStore';
  import { project, gitCiLabel } from '$lib/project.svelte.ts';
  import SpendMeter from '$lib/components/ui/SpendMeter.svelte';
  import { usageStore } from '$lib/usage/store.svelte.ts';

  let tabs = $derived($tabsStore);
  let activeTab = $derived(tabs.tabs.find(t => t.id === tabs.activeTabId));
  let backendStatus = $derived(appState.backendHealthy ? 'connected' : 'offline');
  let sessionLabel = $derived(workspace.sessionLabel);
  // "Needs you": the agent is blocked on a person — a pending approval or an
  // unanswered clarify — as opposed to thinking or running a tool.
  let needsYou = $derived(Boolean(agentRun.pendingApproval || agentRun.clarify || workspace.clarify));
</script>

<footer class="status-bar" role="status" aria-live="polite">
  <div class="cluster">
    <span class="dot" class:ok={appState.backendHealthy}></span>
    <span>{backendStatus}</span>
    <span class="div" aria-hidden="true"></span>
    <span class="mono">{sessionLabel}</span>
    {#if sessionLabel !== workspace.workstationMode}
      <span class="div" aria-hidden="true"></span>
      <span>{workspace.workstationMode}</span>
    {/if}
    {#if needsYou}
      <span class="div" aria-hidden="true"></span>
      <span class="needs-you">
        <span class="nil-ring" aria-hidden="true"></span>
        {agentRun.pendingApproval ? 'awaiting approval' : 'needs you'}
      </span>
      {#if agentRun.pendingApproval}
        <kbd>⌘↵</kbd>
      {/if}
    {/if}
    {#if agentRun.running && !needsYou}
      <span class="div" aria-hidden="true"></span>
      <span class="nil-scan" data-state="working">running</span>
    {/if}
    <SpendMeter usage={usageStore.totals} compact />
  </div>

  <div class="cluster">
    {#if project.git}
      <span class="mono">{project.git.branch}</span>
      {#if project.git.ci}
        <span class="div" aria-hidden="true"></span>
        <span class="mono">{gitCiLabel(project.git.ci)}</span>
      {/if}
    {/if}
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

  .needs-you {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: var(--nil-ink);
  }

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
