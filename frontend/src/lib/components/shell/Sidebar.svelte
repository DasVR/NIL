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
  import { dissolve } from '$lib/motion/settle';
  import api from '$lib/api';
  import NilIcon, { type NilIconName } from '$lib/ui/NilIcon.svelte';
  import MatrixRain from '$lib/ui/MatrixRain.svelte';

  interface SidebarProps {
    open?: boolean;
    width?: number;
    onToggle?: () => void;
    onResize?: (w: number) => void;
  }

  let { open = $bindable(false), width = $bindable(280), onToggle, onResize }: SidebarProps = $props();

  const uid = $props.id();
  function tabId(id: string): string {
    return `${uid}-tab-${id}`;
  }
  function panelId(id: string): string {
    return `${uid}-panel-${id}`;
  }

  let dragStartX = 0;
  let startWidth = 0;
  let resizing = $state(false);
  let panel = $derived(workspace.sidePanel);

  const RAIL = workspace.RAIL_WIDTH;
  const pinned = $derived(open || workspace.railPinned);
  const totalWidth = $derived(pinned ? RAIL + width : RAIL);

  const items: { id: RailId; icon: NilIconName; label: string }[] = [
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
  style:--panel-w={`${width}px`}
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
    <!-- The rail's width slide (--dur-panel) does the moving; the panel only
         fades under it on the way out so it is not yanked from the DOM the
         frame the slide starts. -->
    <div class="panel" out:dissolve>
      <div class="panel-head">
        <div class="segs" role="tablist" aria-label="Sidebar panel">
          <button
            class="seg nil-quiet nil-halo"
            class:on={panel === 'targets'}
            id={tabId('targets')}
            type="button"
            role="tab"
            aria-selected={panel === 'targets'}
            aria-controls={panelId('targets')}
            onclick={() => (workspace.sidePanel = 'targets')}
          >
            {workspace.workstationMode === 'pentest' ? 'Targets' : 'Files'}
          </button>
          <button
            class="seg nil-quiet nil-halo"
            class:on={panel === 'scm'}
            id={tabId('scm')}
            type="button"
            role="tab"
            aria-selected={panel === 'scm'}
            aria-controls={panelId('scm')}
            onclick={() => (workspace.sidePanel = 'scm')}
          >Source</button>
          <button
            class="seg nil-quiet nil-halo"
            class:on={panel === 'github'}
            id={tabId('github')}
            type="button"
            role="tab"
            aria-selected={panel === 'github'}
            aria-controls={panelId('github')}
            onclick={() => (workspace.sidePanel = 'github')}
          >GitHub</button>
          <button
            class="seg nil-quiet nil-halo"
            class:on={panel === 'mcp'}
            id={tabId('mcp')}
            type="button"
            role="tab"
            aria-selected={panel === 'mcp'}
            aria-controls={panelId('mcp')}
            onclick={() => (workspace.sidePanel = 'mcp')}
          >MCP</button>
        </div>
      </div>
      <div
        class="panel-body"
        id={panelId(panel)}
        role="tabpanel"
        aria-labelledby={tabId(panel)}
      >
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
    background-color: var(--nil-panel);
    background-image: var(--panel-depth);
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
    /* LIFT applies here (the class is on the button), so its transform leg
       has to be in this list too — without it the 1px rise snapped while the
       color eased. */
    transition: color var(--dur-flip) var(--ease-out),
                background var(--dur-flip) var(--ease-out),
                transform var(--dur-flip) var(--ease-out),
                box-shadow var(--dur-flip) var(--ease-out);
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
    /* Fixed to the pinned width rather than flex: 1, so while the rail's
       width animates the panel is clipped by the slide instead of being
       squeezed — text no longer reflows and re-truncates every frame. */
    flex: 0 0 calc(var(--panel-w) - var(--s-2));
    min-width: 0;
    margin-left: var(--s-2);
    background-color: var(--nil-panel);
    background-image: var(--panel-depth);
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
  .panel-body {
    flex: 1;
    min-height: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
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
    transition: color var(--dur-flip) var(--ease-out),
                background-color var(--dur-flip) var(--ease-out);
  }
  .seg:hover { color: var(--nil-ink-2); }
  .seg.on { color: var(--nil-ink); background: var(--nil-raised); }
  .danger { padding: var(--s-2); border-top: 1px solid var(--nil-line); }

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
