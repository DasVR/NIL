<script lang="ts">
  import { onMount } from 'svelte';
  import { appState } from '$lib/stores/appState.svelte.ts';
  import TargetTree from '$lib/components/shell/TargetTree.svelte';
  import Icon from '@iconify/svelte';

  interface SidebarProps {
    open?: boolean;
    width?: number;
    onToggle?: () => void;
    onResize?: (w: number) => void;
  }

  let { open = $bindable(true), width = $bindable(280), onToggle, onResize }: SidebarProps = $props();

  let collapsed = $derived(!open);
  let dragStartX = 0;
  let startWidth = 0;
  let resizing = $state(false);

  // Rail mode: collapsed isn't just the tree squeezed into 48px anymore — it's
  // a real icon rail (one destination per engagement), and clicking a
  // destination pins the sidebar open, the way hovering a label then clicking
  // it does in a Claude/Grok-style rail. `open` arrives one-way from the
  // parent (appState.sidebarOpen); onToggle is a flip, so only call it while
  // actually collapsed or this would re-collapse an already-open sidebar.
  function selectEngagementFromRail(name: string) {
    appState.activeEngagementId = name;
    appState.activeTargetId = name;
    if (collapsed) onToggle?.();
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

  function handleResizeMove(e: MouseEvent) {
    if (!resizing) return;
    const delta = e.clientX - dragStartX;
    const newWidth = Math.max(200, Math.min(400, startWidth + delta));
    width = newWidth;
    if (onResize) onResize(newWidth);
  }

  function handleResizeEnd() {
    resizing = false;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }

  function handleResizeKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleResizeStart(e as unknown as MouseEvent);
    }
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
  class="sidebar {collapsed ? 'collapsed' : ''} {resizing ? 'resizing' : ''}" 
  style:width={width}px
  aria-label="Targets sidebar"
>
  <div class="sidebar-header">
    {#if collapsed}
      <button class="icon-btn rail-new" aria-label="New target" title="New Target (Cmd+N)">
        <Icon icon="ph:plus-bold" width="16" height="16" />
      </button>
    {:else}
      <div class="sidebar-title">Targets</div>
      <div class="sidebar-actions">
        <button class="icon-btn" aria-label="New target" title="New Target (Cmd+N)">
          <Icon icon="ph:plus-bold" width="16" height="16" />
        </button>
        <button class="icon-btn" aria-label="Import scope" title="Import Scope">
          <Icon icon="ph:import-bold" width="16" height="16" />
        </button>
        <button class="icon-btn" aria-label="Templates" title="Templates">
          <Icon icon="ph:layout-bold" width="16" height="16" />
        </button>
      </div>
    {/if}
  </div>

  <div class="sidebar-divider"></div>

  {#if collapsed}
    <!-- Rail mode: one icon per engagement, not the full tree squeezed down.
         Hover for the name (native title, matches the rest of the app),
         click to select it AND pin the sidebar open. -->
    <div class="rail-list" role="group" aria-label="Targets">
      {#each appState.engagements as eng (eng.name)}
        <button
          class="rail-icon"
          class:active={appState.activeEngagementId === eng.name}
          type="button"
          title={eng.name}
          aria-label={eng.name}
          onclick={() => selectEngagementFromRail(eng.name)}
        >
          <Icon icon="ph:briefcase-bold" width="16" height="16" />
          {#if eng.findings_count > 0}
            <span class="rail-badge" aria-hidden="true"></span>
          {/if}
        </button>
      {/each}
    </div>
  {:else}
    <TargetTree />
  {/if}

  <div class="sidebar-divider"></div>

  <div class="sidebar-footer">
    <button class="icon-btn sidebar-footer-btn" aria-label="Toggle sidebar" onclick={() => { if (onToggle) onToggle(); }}>
      <Icon icon={collapsed ? 'ph:caret-right-bold' : 'ph:caret-left-bold'} width="16" height="16" />
    </button>
  </div>

  <!-- WAI-ARIA APG "window splitter" pattern, matching RightSidebar's resize
       handle: a focusable separator with aria-valuenow/min/max, not a button
       (those value attributes aren't valid ARIA on role="button"). -->
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
  <div
    class="sidebar-resize-handle"
    onmousedown={handleResizeStart}
    onkeydown={handleResizeKeydown}
    aria-label="Resize sidebar"
    role="separator"
    aria-orientation="vertical"
    aria-valuenow={width}
    aria-valuemin={200}
    aria-valuemax={400}
    tabindex="0"
  ></div>
</aside>

<style>
  .sidebar {
    position: relative;
    top: auto;
    left: auto;
    bottom: auto;
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

  .sidebar.collapsed {
    width: 48px !important;
  }

  .sidebar.resizing {
    transition: none;
  }

  .sidebar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 36px;
    padding: 0 var(--space-2) 0 var(--space-3);
    border-bottom: 1px solid var(--sidebar-border);
    flex-shrink: 0;
    gap: var(--space-2);
  }

  .sidebar.collapsed .sidebar-header {
    justify-content: center;
    padding: 0;
  }

  .sidebar-title {
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--text-faint, var(--text-tertiary));
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex: 1;
    transition: opacity var(--spring-snappy), width var(--spring-snappy);
  }

  .sidebar-actions {
    display: flex;
    gap: 4px;
    transition: opacity var(--spring-snappy), width var(--spring-snappy);
  }

  .sidebar-divider {
    height: 1px;
    background: var(--sidebar-border);
    margin: 0 var(--space-2);
  }

  .sidebar.collapsed .sidebar-divider {
    margin: 0;
  }

  .sidebar-footer {
    height: var(--row-h);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 var(--space-2);
    border-top: 1px solid var(--sidebar-border);
    flex-shrink: 0;
  }

  .sidebar-footer-btn {
    color: var(--text-tertiary);
    border-radius: var(--radius-control);
    transition: color var(--dur-fast) var(--spring-snappy),
      background var(--dur-fast) var(--spring-snappy),
      transform var(--dur-fast) var(--spring-snappy);
  }
  .sidebar-footer-btn:hover {
    color: var(--text-primary);
    background: var(--surface-hover);
  }
  .sidebar-footer-btn:active {
    transform: scale(0.9);
  }

  /* Rail mode — one icon per destination, hover for the name, click to
     select it and pin the sidebar back open. */
  .rail-list {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-1);
    padding: var(--space-2) 0;
  }

  .rail-new {
    margin: 0;
  }

  .rail-icon {
    position: relative;
    display: grid;
    place-items: center;
    width: 32px;
    height: 32px;
    border: none;
    border-radius: var(--r-field);
    background: transparent;
    color: var(--nil-ink-3);
    cursor: pointer;
    flex-shrink: 0;
    transition: color var(--dur-flip) var(--ease-out),
                background-color var(--dur-flip) var(--ease-out);
  }

  .rail-icon:hover {
    color: var(--nil-ink);
    background: var(--nil-raised);
  }

  .rail-icon.active {
    color: var(--nil-ink);
    background: var(--nil-void);
    box-shadow: 0 0 0 1px var(--nil-line-hot) inset;
  }

  .rail-icon:active {
    transform: scale(0.9);
  }

  .rail-badge {
    position: absolute;
    top: 2px;
    right: 2px;
    min-width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--nil-ink-2);
  }

  .sidebar-resize-handle {
    position: absolute;
    top: 0;
    right: -4px;
    bottom: 0;
    width: 8px;
    cursor: col-resize;
    background: transparent;
    border: none;
    padding: 0;
    z-index: 10;
    transition: background var(--spring-snappy);
  }

  .sidebar-resize-handle:hover {
    background: var(--accent-primary);
  }

  .sidebar.collapsed .sidebar-resize-handle {
    right: -4px;
  }
</style>