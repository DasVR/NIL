<script lang="ts">
  import { onMount } from 'svelte';
  import { appState } from '$lib/stores/appState.svelte.ts';
  import { workspace, type RailId } from '$lib/stores/workspace.svelte.ts';
  import { agentRun } from '$lib/agent/run.svelte.ts';
  import TargetTree from '$lib/components/shell/TargetTree.svelte';
  import FileExplorer from '$lib/components/shell/FileExplorer.svelte';
  import SourceControl from '$lib/components/shell/SourceControl.svelte';
  import GitHubPanel from '$lib/components/shell/GitHubPanel.svelte';
  import McpPanel from '$lib/components/shell/McpPanel.svelte';
  import HoldConfirm from '$lib/ui/HoldConfirm.svelte';
  import api from '$lib/api';
  import NilIcon from '$lib/ui/NilIcon.svelte';
  import MatrixRain from '$lib/ui/MatrixRain.svelte';

  interface SidebarProps {
    open?: boolean;
    width?: number;
    onToggle?: () => void;
    onResize?: (w: number) => void;
  }

  let { open = $bindable(false), width = $bindable(280), onToggle, onResize }: SidebarProps = $props();

  let dragStartX = 0;
  let startWidth = 0;
  let resizing = $state(false);
  let panel = $derived(workspace.sidePanel);

  const RAIL = workspace.RAIL_WIDTH;
  const pinned = $derived(open || workspace.railPinned);
  const totalWidth = $derived(pinned ? RAIL + width : RAIL);

  const items: { id: RailId; icon: string; label: string }[] = [
    { id: 'files', icon: 'folder', label: 'Files' },
    { id: 'terminal', icon: 'terminal', label: 'Terminal' },
    { id: 'diffs', icon: 'git-compare', label: 'Diffs' },
    { id: 'pentest', icon: 'shield', label: 'Pentest' },
  ];

  function clickRail(id: RailId) {
    workspace.selectRail(id);
    open = workspace.railPinned;
    appState.sidebarOpen = workspace.railPinned;
  }

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
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      const next = Math.max(200, Math.min(400, width + (e.key === 'ArrowRight' ? 16 : -16)));
      width = next;
      if (onResize) onResize(next);
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
  class="sidebar {pinned ? 'pinned' : 'collapsed'} {resizing ? 'resizing' : ''}"
  style:width={`${totalWidth}px`}
  aria-label="Workspace rail"
>
  <nav class="rail" aria-label="Primary">
    {#each items as item}
      {@const active = workspace.activeRail === item.id}
      <button
        class="rail-btn nil-halo nil-lift"
        class:active
        type="button"
        aria-label={item.label}
        aria-pressed={active}
        data-tip={item.label}
        onclick={() => clickRail(item.id)}
      >
        {#if item.id === 'pentest' && workspace.workstationMode === 'pentest' && agentRun.findings.length === 0 && agentRun.steps.length === 0}
          <span class="rain-slot" aria-hidden="true">
            <MatrixRain faint />
          </span>
        {/if}
        <NilIcon name={item.icon} size={20} />
      </button>
    {/each}
  </nav>

  {#if pinned}
    <div class="panel">
      <div class="panel-head">
        <div class="segs" role="tablist" aria-label="Sidebar panel">
          <button class="seg nil-quiet" class:on={panel === 'targets'} type="button" onclick={() => (workspace.sidePanel = 'targets')}>
            {workspace.workstationMode === 'pentest' ? 'Targets' : 'Files'}
          </button>
          <button class="seg nil-quiet" class:on={panel === 'scm'} type="button" onclick={() => (workspace.sidePanel = 'scm')}>Source</button>
          <button class="seg nil-quiet" class:on={panel === 'github'} type="button" onclick={() => (workspace.sidePanel = 'github')}>GitHub</button>
          <button class="seg nil-quiet" class:on={panel === 'mcp'} type="button" onclick={() => (workspace.sidePanel = 'mcp')}>MCP</button>
        </div>
      </div>
      {#if panel === 'targets'}
        {#if workspace.workstationMode === 'pentest'}
          <TargetTree />
          {#if appState.activeEngagementId}
            <div class="danger">
              <HoldConfirm
                label="Delete target"
                confirmLabel="Hold to delete"
                ariaLabel="Hold to delete this target"
                onConfirm={() => {
                  const name = appState.activeEngagementId;
                  if (!name) return;
                  void api.deleteEngagement(name).then(() => appState.refreshEngagements());
                }}
              />
            </div>
          {/if}
        {:else}
          <FileExplorer />
        {/if}
      {:else if panel === 'scm'}
        <SourceControl />
      {:else if panel === 'github'}
        <GitHubPanel />
      {:else if panel === 'mcp'}
        <McpPanel />
      {/if}
    </div>

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
  {/if}
</aside>

<style>
  .sidebar {
    position: relative;
    height: 100%;
    display: flex;
    flex-direction: row;
    z-index: var(--z-rail);
    transition: width var(--dur-panel) var(--ease-out);
    overflow: hidden;
    flex-shrink: 0;
  }
  .sidebar.resizing { transition: none; }

  .rail {
    width: 48px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: var(--s-2) 0;
    background: var(--nil-panel);
    border: 1px solid var(--nil-line);
    border-radius: var(--r-panel);
    box-shadow: var(--lift-2);
  }

  .rail-btn {
    position: relative;
    z-index: 0;
    display: grid;
    place-items: center;
    width: 36px;
    height: 36px;
    border: 0;
    border-radius: var(--r-field);
    background: transparent;
    color: var(--nil-ink-3);
    cursor: pointer;
    overflow: hidden;
    transition: color var(--dur-flip) var(--ease-out),
                background var(--dur-flip) var(--ease-out);
  }
  .rail-btn:hover { color: var(--nil-ink); background: var(--nil-raised); }
  .rail-btn.active {
    color: var(--nil-ink);
    background: var(--nil-raised);
    box-shadow: inset 0 0 0 1px var(--nil-line-hot);
  }
  .rail-btn[data-tip]:hover::after {
    content: attr(data-tip);
    position: absolute;
    left: calc(100% + 8px);
    top: 50%;
    transform: translateY(-50%);
    padding: 4px 8px;
    background: var(--nil-raised);
    border: 1px solid var(--nil-line-hot);
    border-radius: var(--r-chip);
    color: var(--nil-ink);
    font: 500 var(--t-meta)/1 var(--font-ui);
    white-space: nowrap;
    pointer-events: none;
    z-index: var(--z-tooltip);
    box-shadow: var(--lift-2);
  }

  .rain-slot {
    position: absolute;
    inset: 4px;
    border-radius: inherit;
    overflow: hidden;
    z-index: -1;
    pointer-events: none;
  }

  .panel {
    flex: 1;
    min-width: 0;
    margin-left: var(--s-2);
    background: var(--nil-panel);
    border: 1px solid var(--nil-line);
    border-radius: var(--r-panel);
    box-shadow: var(--lift-2);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .panel-head {
    padding: var(--s-2);
    border-bottom: 1px solid var(--nil-line);
    flex-shrink: 0;
  }
  .segs {
    display: flex;
    gap: 2px;
  }
  .seg {
    flex: 1;
    height: 24px;
    border: 0;
    border-radius: var(--r-chip);
    background: transparent;
    color: var(--nil-ink-3);
    font: 500 var(--t-micro)/1 var(--font-ui);
    cursor: pointer;
  }
  .seg.on { color: var(--nil-ink); background: var(--nil-raised); }
  .danger { padding: var(--s-2); border-top: 1px solid var(--nil-line); }

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
    z-index: 10;
  }
  .sidebar-resize-handle:hover { background: var(--nil-line-hot); }
</style>
