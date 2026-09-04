<script lang="ts">
  import { onMount } from 'svelte';
  import { appState } from '$lib/stores/appState.svelte.ts';
  import LiquidMetal from '$lib/components/ui/LiquidMetal.svelte';
  import WindowControls from '$lib/components/ui/WindowControls.svelte';
  import { agentRun } from '$lib/agent/run.svelte.ts';

  let dragging = $state(false);

  function handleMouseDown(e: MouseEvent) {
    if (e.target instanceof HTMLButtonElement) return;
    dragging = true;
  }

  function handleMouseMove() {
    if (!dragging) return;
    if (window.__TAURI__?.window) {
      window.__TAURI__.window.current().dragMove?.();
    }
  }

  function handleMouseUp() {
    dragging = false;
  }

  onMount(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  });

  const engagement = $derived(appState.activeEngagementId || 'no-engagement');
  const modeChips = ['hunt', 'chat', 'code', 'report'] as const;
</script>

<div class="titlebar" onmousedown={handleMouseDown} role="banner" aria-label="Window title bar">
  <div class="metal" class:paused={agentRun.running}>
    <LiquidMetal paused={agentRun.running} />
  </div>

  <div class="titlebar-left titlebar-drag">
    <span class="brand">nil</span>
    <span class="sep" aria-hidden="true">──</span>
    <span class="path">{engagement}</span>
  </div>

  <div class="titlebar-center">
    {#each modeChips as m}
      <span class="mode">{m}</span>
    {/each}
  </div>

  <div class="titlebar-right">
    <WindowControls />
  </div>
</div>

<style>
  .titlebar {
    position: relative;
    height: var(--titlebar-h);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 12px;
    background: var(--nil-panel);
    border-bottom: 1px solid var(--nil-line);
    z-index: var(--z-rail);
    -webkit-app-region: drag;
    flex-shrink: 0;
    overflow: hidden;
  }

  .metal {
    position: absolute;
    inset: 0;
    opacity: 0.18;
    pointer-events: none;
    z-index: 0;
  }

  .metal.paused { opacity: 0.08; }

  .titlebar-left,
  .titlebar-center,
  .titlebar-right {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    height: 100%;
    gap: var(--s-2);
    -webkit-app-region: no-drag;
  }

  .titlebar-left { -webkit-app-region: drag; min-width: 0; }
  .titlebar-center { flex: 1; justify-content: flex-end; gap: var(--s-3); }

  .brand {
    font: 600 var(--t-meta)/1 var(--font-machine);
    letter-spacing: var(--track-tick);
    text-transform: lowercase;
    color: var(--nil-ink);
  }

  .sep { color: var(--nil-ink-4); font: var(--t-micro)/1 var(--font-machine); }

  .path {
    font: var(--t-meta)/1 var(--font-machine);
    color: var(--nil-ink-2);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .mode {
    font: 500 var(--t-micro)/1 var(--font-ui);
    letter-spacing: var(--track-tick);
    text-transform: uppercase;
    color: var(--nil-ink-3);
  }
</style>
