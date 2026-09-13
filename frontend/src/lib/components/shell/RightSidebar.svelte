<script lang="ts">
  import { onMount } from 'svelte';
  import { agentRun } from '$lib/agent/run.svelte.ts';
  import FindingRow from '$lib/components/ui/FindingRow.svelte';
  import TimelinePanel from '$lib/components/shell/TimelinePanel.svelte';
  import EvidencePanel from '$lib/components/shell/EvidencePanel.svelte';
  import { tabsStore } from '$lib/stores/tabsStore';
  import { workspace } from '$lib/stores/workspace.svelte.ts';
  import NilIcon from '$lib/ui/NilIcon.svelte';
  import { droplet } from '$lib/motion/droplet';
  import type { Finding } from '$lib/agent/types';

  type InspectorTab = 'findings' | 'timeline' | 'evidence' | 'context';

  interface RightSidebarProps {
    open?: boolean;
    width?: number;
    onToggle?: () => void;
    onResize?: (w: number) => void;
  }

  let { open = $bindable(true), width = $bindable(320), onToggle, onResize }: RightSidebarProps = $props();

  let activeTab = $state<InspectorTab>('context');
  let dragStartX = 0;
  let startWidth = 0;
  let resizing = $state(false);

  let findings = $derived(agentRun.findings);
  let activeTabId = $derived($tabsStore.activeTabId);
  let pentest = $derived(workspace.workstationMode === 'pentest');

  $effect(() => {
    activeTab = pentest ? 'findings' : 'context';
  });

  function openFinding(finding: Finding) {
    tabsStore.addTab({
      id: `finding-${finding.id}`,
      type: 'finding',
      label: finding.title,
      dirty: false,
      data: finding,
    });
  }

  function handleResizeStart(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    resizing = true;
    dragStartX = e.clientX;
    startWidth = width;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }

  const MIN_W = 240;
  const MAX_W = 500;

  function setWidth(next: number) {
    const clamped = Math.max(MIN_W, Math.min(MAX_W, next));
    width = clamped;
    if (onResize) onResize(clamped);
  }

  function handleResizeKeydown(e: KeyboardEvent) {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      setWidth(width + (e.key === 'ArrowLeft' ? 1 : -1) * 16);
    } else if (e.key === 'Home') {
      e.preventDefault();
      setWidth(MIN_W);
    } else if (e.key === 'End') {
      e.preventDefault();
      setWidth(MAX_W);
    }
  }

  function handleResizeMove(e: MouseEvent) {
    if (!resizing) return;
    const delta = dragStartX - e.clientX;
    setWidth(startWidth + delta);
  }

  function handleResizeEnd() {
    resizing = false;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }

  onMount(() => {
    window.addEventListener('mousemove', handleResizeMove);
    window.addEventListener('mouseup', handleResizeEnd);
    return () => {
      window.removeEventListener('mousemove', handleResizeMove);
      window.removeEventListener('mouseup', handleResizeEnd);
    };
  });
</script>

<aside
  class="right-sidebar {open ? '' : 'collapsed'} {resizing ? 'resizing' : ''}"
  style:width={open ? `${width}px` : '0px'}
  aria-label="Inspector"
  aria-hidden={!open}
  inert={!open}
>
  <div class="right-sidebar-header">
    <div class="right-sidebar-tabs" role="tablist">
      {#if pentest}
        <button
          class="right-sidebar-tab nil-halo"
          class:active={activeTab === 'findings'}
          role="tab"
          aria-selected={activeTab === 'findings'}
          onclick={() => (activeTab = 'findings')}
        >
          <NilIcon name="flag" size={16} />
          <span>Findings</span>
          <span class="tab-badge">{findings.length}</span>
        </button>
        <button
          class="right-sidebar-tab nil-halo"
          class:active={activeTab === 'timeline'}
          role="tab"
          aria-selected={activeTab === 'timeline'}
          onclick={() => (activeTab = 'timeline')}
        >
          <NilIcon name="clock" size={16} />
          <span>Timeline</span>
        </button>
        <button
          class="right-sidebar-tab nil-halo"
          class:active={activeTab === 'evidence'}
          role="tab"
          aria-selected={activeTab === 'evidence'}
          onclick={() => (activeTab = 'evidence')}
        >
          <NilIcon name="folder" size={16} />
          <span>Evidence</span>
        </button>
      {:else}
        <button
          class="right-sidebar-tab nil-halo"
          class:active={activeTab === 'context'}
          role="tab"
          aria-selected={activeTab === 'context'}
          onclick={() => (activeTab = 'context')}
        >
          <NilIcon name="paperclip" size={16} />
          <span>Context</span>
          <span class="tab-badge">{workspace.attached.length}</span>
        </button>
      {/if}
    </div>
    {#if onToggle}
      <button class="icon-btn nil-halo" type="button" aria-label="Hide inspector" onclick={onToggle}>
        <NilIcon name="x" size={16} />
      </button>
    {/if}
  </div>

  <div class="right-sidebar-content">
    {#if pentest && activeTab === 'findings'}
      <div class="findings-list">
        {#each findings as finding (finding.id)}
          <FindingRow
            {finding}
            active={activeTabId === `finding-${finding.id}`}
            onSelect={() => openFinding(finding)}
          />
        {/each}
        {#if findings.length === 0}
          <div class="empty-state">
            <NilIcon name="flag" size={20} />
            <p>No findings yet.</p>
            <span>Run a hunt to start collecting evidence.</span>
          </div>
        {/if}
      </div>
    {:else if pentest && activeTab === 'timeline'}
      <TimelinePanel />
    {:else if pentest && activeTab === 'evidence'}
      <EvidencePanel />
    {:else}
      <div class="context">
        <dl class="meta">
          <div>
            <dt>Model</dt>
            <dd>{workspace.model?.name ?? 'Default'}</dd>
          </div>
          <div>
            <dt>Effort</dt>
            <dd>{workspace.effort}</dd>
          </div>
        </dl>
        {#if workspace.attached.length === 0}
          <div class="empty-state">
            <NilIcon name="paperclip" size={20} />
            <p>No files attached</p>
            <span>Mention a path with @ in the composer to pin it here.</span>
          </div>
        {:else}
          <ul class="files">
            {#each workspace.attached as file (file.id)}
              <li class="file-row">
                <button
                  class="file nil-halo"
                  type="button"
                  {@attach droplet}
                  aria-label={`Open ${file.path}`}
                  onclick={() => workspace.openFile(file.path)}
                >
                  <span class="file-path">{file.path}</span>
                </button>
                <button
                  class="file-x nil-halo"
                  type="button"
                  aria-label={`Detach ${file.path}`}
                  onclick={() => workspace.detachFile(file.id)}
                >Detach</button>
              </li>
            {/each}
          </ul>
        {/if}
      </div>
    {/if}
  </div>

  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <div
    class="right-sidebar-resize-handle"
    onmousedown={handleResizeStart}
    onkeydown={handleResizeKeydown}
    aria-label="Resize inspector"
    role="separator"
    aria-orientation="vertical"
    aria-valuemin={240}
    aria-valuemax={500}
    aria-valuenow={Math.round(width)}
    tabIndex={0}
  ></div>
</aside>

<style>
  .right-sidebar {
    position: relative;
    height: 100%;
    background: var(--nil-panel);
    border: 1px solid var(--nil-line);
    border-radius: var(--r-panel);
    box-shadow: var(--lift-2);
    display: flex;
    flex-direction: column;
    z-index: var(--z-rail);
    transition: width var(--dur-panel) var(--ease-out);
    overflow: hidden;
    flex-shrink: 0;
  }

  .right-sidebar.collapsed {
    width: 0 !important;
    border: 0;
    box-shadow: none;
  }

  .right-sidebar.resizing { transition: none; }

  .right-sidebar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 36px;
    padding: 0 6px 0 var(--s-2);
    border-bottom: 1px solid var(--nil-line);
    flex-shrink: 0;
    gap: 4px;
  }

  .right-sidebar-tabs {
    display: flex;
    gap: 1px;
    flex: 1;
    overflow-x: auto;
    scrollbar-width: none;
  }
  .right-sidebar-tabs::-webkit-scrollbar { display: none; }

  .right-sidebar-tab {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 4px 8px;
    border: 0;
    border-radius: var(--r-field);
    background: transparent;
    color: var(--nil-ink-3);
    font: var(--t-micro)/1 var(--font-ui);
    cursor: pointer;
    white-space: nowrap;
  }

  .right-sidebar-tab:hover,
  .right-sidebar-tab.active {
    color: var(--nil-ink);
    background: var(--nil-raised);
  }

  .tab-badge {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 16px;
    height: 16px;
    padding: 0 4px;
    border-radius: var(--r-chip);
    background: var(--nil-ink);
    color: var(--nil-void);
    font: 600 var(--t-micro)/1 var(--font-machine);
  }

  .icon-btn {
    display: grid;
    place-items: center;
    width: 24px;
    height: 24px;
    border: 0;
    border-radius: var(--r-chip);
    background: transparent;
    color: var(--nil-ink-3);
    cursor: pointer;
  }
  .icon-btn:hover { color: var(--nil-ink); }

  .right-sidebar-content {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding: var(--s-2);
  }

  .findings-list,
  .files {
    display: flex;
    flex-direction: column;
    gap: 1px;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .context { display: flex; flex-direction: column; gap: var(--s-3); }
  .meta { margin: 0; display: flex; flex-direction: column; gap: var(--s-2); }
  .meta div { display: flex; justify-content: space-between; gap: var(--s-3); }
  dt { font: var(--t-micro)/1 var(--font-ui); color: var(--nil-ink-3); }
  dd { margin: 0; font: var(--t-meta)/1 var(--font-machine); color: var(--nil-ink-2); }

  .file-row {
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .file {
    display: flex;
    align-items: center;
    gap: var(--s-2);
    min-width: 0;
    flex: 1;
    height: var(--row-h);
    padding: 0 var(--s-2);
    border: 0;
    border-radius: var(--r-field);
    background: transparent;
    color: var(--nil-ink-2);
    cursor: pointer;
    text-align: left;
  }
  .file-path {
    font: var(--t-meta)/1 var(--font-machine);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .file-x {
    height: 22px;
    padding: 0 6px;
    border: 0;
    background: transparent;
    font: var(--t-micro)/1 var(--font-ui);
    color: var(--nil-ink-3);
    cursor: pointer;
    border-radius: var(--r-chip);
    flex-shrink: 0;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 160px;
    gap: var(--s-2);
    color: var(--nil-ink-3);
    text-align: center;
    padding: var(--s-5);
  }
  .empty-state p {
    margin: 0;
    font: 500 var(--t-meta)/1 var(--font-ui);
    color: var(--nil-ink-2);
  }
  .empty-state span { font: var(--t-micro)/var(--lh-body) var(--font-ui); }

  .right-sidebar-resize-handle {
    position: absolute;
    top: 0;
    left: -4px;
    bottom: 0;
    width: 8px;
    cursor: col-resize;
    background: transparent;
    z-index: 10;
  }
  .right-sidebar-resize-handle::after {
    content: "";
    position: absolute;
    inset-block: 0;
    inset-inline-start: 4px;
    width: 1px;
    background: var(--nil-line);
    transition: background-color var(--dur-flip) var(--ease-out);
  }
  .right-sidebar-resize-handle:hover::after,
  .right-sidebar-resize-handle:focus-visible::after {
    background: var(--nil-line-hot);
  }
  .right-sidebar.resizing .right-sidebar-resize-handle::after {
    background: var(--nil-ink-2);
  }
</style>
