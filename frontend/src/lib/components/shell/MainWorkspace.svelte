<script lang="ts">
  import { onMount } from 'svelte';
  import TerminalTab from '$lib/components/shell/TerminalTab.svelte';
  import EditorTab from '$lib/components/shell/EditorTab.svelte';
  import PreviewTab from '$lib/components/shell/PreviewTab.svelte';
  import DiffTab from '$lib/components/shell/DiffTab.svelte';
  import ChatTab from '$lib/components/shell/ChatTab.svelte';
  import { tabsStore, type Tab } from '$lib/stores/tabsStore';

  import type { Snippet } from 'svelte';

  let { emptyState }: { emptyState?: Snippet } = $props();

  let store = $derived($tabsStore);
  let activeTab = $derived(store.activeTabId);
  let tabs = $derived(store.tabs);

  function setActiveTab(id: string) {
    tabsStore.switchTab(id);
  }

  function newTab(type: 'terminal' | 'editor' | 'preview' | 'diff' | 'chat' = 'terminal') {
    const id = `${type}-${Date.now()}`;
    const label = type[0].toUpperCase() + type.slice(1);
    tabsStore.addTab({ id, type, label, dirty: false });
  }

  function closeTab(id: string) {
    tabsStore.closeTab(id);
  }

  function handleTabKeydown(e: KeyboardEvent, tabId: string) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setActiveTab(tabId);
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      closeTab(tabId);
    }
  }
</script>

<div class="main-workspace" role="main">
  <div class="workspace-tabs" role="tablist" aria-label="Workspace tabs">
    {#each tabs as tab, i}
      <div
        class="workspace-tab {tab.id === activeTab ? 'active' : ''}"
        role="tab"
        aria-selected={tab.id === activeTab}
        aria-controls={`panel-${tab.id}`}
        id={`tab-${tab.id}`}
        tabindex={tab.id === activeTab ? 0 : -1}
        onclick={() => setActiveTab(tab.id)}
        onkeydown={(e) => handleTabKeydown(e, tab.id)}
      >
        <span class="workspace-tab-icon" data-type={tab.type}></span>
        <span class="workspace-tab-label">{tab.label}</span>
        {#if tab.dirty}
          <span class="workspace-tab-dirty" aria-label="Unsaved changes"></span>
        {/if}
        <button
          type="button"
          class="workspace-tab-close"
          onclick={(e) => { e.stopPropagation(); closeTab(tab.id); }}
          aria-label="Close tab"
          tabindex="-1"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    {/each}

    <button class="workspace-tab-new" onclick={() => newTab()} aria-label="New tab (Cmd+T)">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="12" y1="5" x2="12" y2="19"/>
        <line x1="5" y1="12" x2="19" y2="12"/>
      </svg>
    </button>
  </div>

  <div class="workspace-panels">
    {#each tabs as tab}
      <div
        id="panel-{tab.id}"
        class="workspace-panel {tab.id === activeTab ? 'active' : ''}"
        role="tabpanel"
        aria-labelledby={`tab-${tab.id}`}
        hidden={tab.id !== activeTab}
      >
        {#if tab.type === 'terminal'}
          <TerminalTab {tab} />
        {:else if tab.type === 'editor'}
          <EditorTab {tab} />
        {:else if tab.type === 'preview'}
          <PreviewTab {tab} />
        {:else if tab.type === 'diff'}
          <DiffTab {tab} />
        {:else if tab.type === 'chat'}
          <ChatTab {tab} />
        {/if}
      </div>
    {/each}
    {#if tabs.length === 0 && emptyState}
      <div class="workspace-empty">
        {@render emptyState()}
      </div>
    {/if}
  </div>
</div>

<style>
  .workspace-empty {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .main-workspace {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    background: var(--surface-base);
    overflow: hidden;
  }

  .workspace-tabs {
    display: flex;
    align-items: stretch;
    height: 32px;
    background: var(--surface-panel);
    border-bottom: 1px solid var(--surface-border);
    padding: 0 8px;
    gap: 2px;
    flex-shrink: 0;
    overflow-x: auto;
  }

  .workspace-tab {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 0 10px;
    min-width: 120px;
    max-width: 200px;
    height: 26px;
    margin-top: 3px;
    border: none;
    border-radius: var(--radius-control) var(--radius-control) 0 0;
    background: transparent;
    color: var(--text-secondary);
    font-size: var(--font-xs);
    font-weight: 400;
    cursor: pointer;
    transition: background var(--spring-snappy), color var(--spring-snappy);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .workspace-tab:hover {
    background: var(--surface-hover);
    color: var(--text-primary);
  }

  .workspace-tab.active {
    background: var(--surface-base);
    color: var(--text-primary);
    border-bottom: 2px solid var(--accent-primary);
    margin-top: 1px;
    height: 28px;
  }

  .workspace-tab-icon {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
    color: var(--text-tertiary);
  }

  .workspace-tab.active .workspace-tab-icon {
    color: var(--accent-primary);
  }

  .workspace-tab-icon[data-type="terminal"] { background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Cpath d='M8 9h8'/%3E%3Cpath d='M8 15h6'/%3E%3C/svg%3E") center/contain no-repeat; }
  .workspace-tab-icon[data-type="editor"] { background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Cpath d='M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7'/%3E%3Cpath d='M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z'/%3E%3C/svg%3E") center/contain no-repeat; }
  .workspace-tab-icon[data-type="preview"] { background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Crect x='2' y='3' width='20' height='14' rx='2'/%3E%3Cpath d='M8 21h8'/%3E%3Cpath d='M12 17v4'/%3E%3C/svg%3E") center/contain no-repeat; }
  .workspace-tab-icon[data-type="diff"] { background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Cpath d='M12 3v18'/%3E%3Cpath d='M3 12h18'/%3E%3C/svg%3E") center/contain no-repeat; }
  .workspace-tab-icon[data-type="chat"] { background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Cpath d='M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z'/%3E%3C/svg%3E") center/contain no-repeat; }

  .workspace-tab-dirty {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--color-warning);
    flex-shrink: 0;
  }

  .workspace-tab-close {
    display: grid;
    place-items: center;
    width: 20px;
    height: 20px;
    border: none;
    border-radius: 4px;
    background: transparent;
    color: var(--text-tertiary);
    cursor: pointer;
    opacity: 0;
    transition: opacity var(--spring-snappy), background var(--spring-snappy), color var(--spring-snappy);
    flex-shrink: 0;
  }

  .workspace-tab:hover .workspace-tab-close,
  .workspace-tab.active .workspace-tab-close {
    opacity: 1;
  }

  .workspace-tab-close:hover {
    background: var(--surface-hover);
    color: var(--text-primary);
  }

  .workspace-tab-new {
    display: grid;
    place-items: center;
    width: 28px;
    height: 26px;
    margin-top: 3px;
    border: none;
    border-radius: var(--radius-control);
    background: transparent;
    color: var(--text-tertiary);
    cursor: pointer;
    transition: color var(--spring-snappy), background var(--spring-snappy);
    flex-shrink: 0;
  }

  .workspace-tab-new:hover {
    color: var(--accent-primary);
    background: var(--surface-hover);
  }

  .workspace-panels {
    flex: 1;
    min-height: 0;
    position: relative;
    overflow: hidden;
  }

  .workspace-panel {
    position: absolute;
    inset: 0;
    opacity: 0;
    visibility: hidden;
    transition: opacity var(--spring-smooth), visibility 0s linear var(--spring-smooth);
    pointer-events: none;
  }

  .workspace-panel.active {
    opacity: 1;
    visibility: visible;
    transition: opacity var(--spring-smooth);
    pointer-events: auto;
    z-index: 1;
  }
</style>