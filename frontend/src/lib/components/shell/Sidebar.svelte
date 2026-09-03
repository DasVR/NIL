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
  </div>

  <div class="sidebar-divider"></div>

  <TargetTree />

  <div class="sidebar-divider"></div>

  <div class="sidebar-footer">
    <button class="sidebar-footer-btn" aria-label="Toggle sidebar" onclick={() => { if (onToggle) onToggle(); }}>
      <Icon icon={collapsed ? 'ph:caret-right-bold' : 'ph:caret-left-bold'} width="16" height="16" />
    </button>
  </div>

  <button
    class="sidebar-resize-handle"
    onmousedown={handleResizeStart}
    onkeydown={handleResizeKeydown}
    aria-label="Resize sidebar"
    aria-valuenow={width}
    aria-valuemin={200}
    aria-valuemax={400}
    type="button"
  ></button>
</aside>

<style>
  .sidebar {
    position: fixed;
    top: var(--titlebar-h);
    left: 0;
    bottom: var(--statusbar-h);
    background: var(--sidebar-bg);
    border-right: 1px solid var(--sidebar-border);
    display: flex;
    flex-direction: column;
    z-index: var(--z-sticky);
    transition: width var(--spring-snappy), transform var(--spring-snappy);
    overflow: hidden;
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

  .sidebar.collapsed .sidebar-title,
  .sidebar.collapsed .sidebar-actions {
    opacity: 0;
    pointer-events: none;
    width: 0;
    overflow: hidden;
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