<script lang="ts">
  import TerminalTab from '$lib/components/shell/TerminalTab.svelte';
  import EditorTab from '$lib/components/shell/EditorTab.svelte';
  import PreviewTab from '$lib/components/shell/PreviewTab.svelte';
  import FindingCard from '$lib/components/ui/FindingCard.svelte';
  import AgentStream from '$lib/components/shell/AgentStream.svelte';
  import DiffSurface from '$lib/components/shell/DiffSurface.svelte';
  import { tabsStore, type Tab } from '$lib/stores/tabsStore';
  import { workspace } from '$lib/stores/workspace.svelte.ts';
  import NilIcon from '$lib/ui/NilIcon.svelte';
  import type { Snippet } from 'svelte';

  let { emptyState }: { emptyState?: Snippet } = $props();

  let store = $derived($tabsStore);
  let activeTab = $derived(store.activeTabId);
  let fileTabs = $derived(
    store.tabs.filter((t) => t.type === 'editor' || t.type === 'preview' || t.type === 'finding'),
  );
  let activeFile = $derived(fileTabs.find((t) => t.id === activeTab) ?? null);

  function tabIcon(tab: Tab): string {
    switch (tab.type) {
      case 'editor': return 'file';
      case 'preview': return 'app-window';
      case 'finding': return 'flag';
      case 'terminal':
      case 'diff':
        return 'file';
      default: {
        const _n: never = tab.type;
        return _n;
      }
    }
  }

  function closeTab(id: string) {
    tabsStore.closeTab(id);
  }

  function handleTabKeydown(e: KeyboardEvent, tabId: string) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      tabsStore.switchTab(tabId);
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      closeTab(tabId);
    }
  }
</script>

<div class="main-workspace" role="main">
  {#if fileTabs.length > 0}
    <div class="workspace-tabs" role="tablist" aria-label="Open files">
      {#each fileTabs as tab (tab.id)}
        <div
          class="workspace-tab"
          class:active={tab.id === activeTab}
          role="tab"
          aria-selected={tab.id === activeTab}
          id={`tab-${tab.id}`}
          tabindex={tab.id === activeTab ? 0 : -1}
          onclick={() => tabsStore.switchTab(tab.id)}
          onkeydown={(e) => handleTabKeydown(e, tab.id)}
        >
          <NilIcon name={tabIcon(tab)} size={16} />
          <span class="workspace-tab-label">{tab.label}</span>
          {#if tab.dirty}
            <span class="workspace-tab-dirty" aria-label="Unsaved changes"></span>
          {/if}
          <button
            type="button"
            class="workspace-tab-close nil-halo"
            onclick={(e) => { e.stopPropagation(); closeTab(tab.id); }}
            aria-label="Close"
            tabindex="-1"
          >
            <NilIcon name="x" size={16} />
          </button>
        </div>
      {/each}
    </div>
  {/if}

  <div class="workspace-panels">
    {#if activeFile}
      <div class="workspace-panel active" role="tabpanel" aria-labelledby={`tab-${activeFile.id}`}>
        {#if activeFile.type === 'editor'}
          <EditorTab tab={activeFile} />
        {:else if activeFile.type === 'preview'}
          <PreviewTab tab={activeFile} />
        {:else if activeFile.type === 'finding'}
          <div class="finding-detail-host">
            <FindingCard finding={activeFile.data} />
          </div>
        {/if}
      </div>
    {:else if workspace.surface === 'diff'}
      <div class="workspace-panel active stream-host">
        <DiffSurface />
      </div>
    {:else}
      <div class="workspace-panel active stream-host">
        <AgentStream {emptyState} />
      </div>
    {/if}
  </div>
</div>

<style>
  .stream-host {
    display: flex;
    flex-direction: column;
    padding: var(--s-2);
  }

  .finding-detail-host {
    height: 100%;
    overflow-y: auto;
    padding: var(--s-6);
    display: flex;
    justify-content: center;
  }

  .finding-detail-host :global(.finding) {
    width: 100%;
    max-width: 40rem;
    height: fit-content;
  }

  .main-workspace {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    background: transparent;
    overflow: hidden;
  }

  .workspace-tabs {
    display: flex;
    align-items: stretch;
    height: 32px;
    background: transparent;
    border-bottom: 1px solid var(--nil-line);
    padding: 0 var(--s-2);
    gap: 2px;
    flex-shrink: 0;
    overflow-x: auto;
  }

  .workspace-tab {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 0 10px;
    min-width: 0;
    max-width: 200px;
    height: 26px;
    margin-top: 3px;
    border: none;
    border-radius: var(--r-field) var(--r-field) 0 0;
    background: transparent;
    color: var(--nil-ink-2);
    font: var(--t-meta)/1 var(--font-ui);
    cursor: pointer;
  }

  .workspace-tab:hover,
  .workspace-tab.active {
    background: var(--nil-panel);
    color: var(--nil-ink);
  }

  .workspace-tab-label {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .workspace-tab-dirty {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--nil-ink-2);
    flex-shrink: 0;
  }

  .workspace-tab-close {
    display: grid;
    place-items: center;
    width: 20px;
    height: 20px;
    border: none;
    border-radius: var(--r-chip);
    background: transparent;
    color: var(--nil-ink-3);
    cursor: pointer;
    flex-shrink: 0;
  }

  .workspace-tab-close:hover { color: var(--nil-ink); }

  .workspace-panels {
    flex: 1;
    min-height: 0;
    position: relative;
    overflow: hidden;
  }

  .workspace-panel {
    position: absolute;
    inset: 0;
  }

  .workspace-panel.active {
    z-index: 1;
  }
</style>
