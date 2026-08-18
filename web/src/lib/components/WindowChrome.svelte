<script>
  import { appState } from '$lib/stores.svelte';
  import LiquidMetal from './LiquidMetal.svelte';

  let { isTauri = false, isMac = false } = $props();

  const yoloTitle = $derived(
    appState.yolo
      ? 'YOLO enabled — commands auto-run (still sandboxed and logged)'
      : 'YOLO disabled — commands require approval'
  );
</script>

<header class="chrome" class:tauri={isTauri} class:mac={isMac} aria-label="Window title bar">
  <div class="metal" aria-hidden="true">
    <LiquidMetal
      intensity={appState.yolo ? 0.38 : 0.22}
      speed={0.45}
      color1={appState.yolo ? '#ff5c5c' : '#00d992'}
      interactive={false}
    />
  </div>
  <div class="drag" data-tauri-drag-region></div>
  <div class="cluster left">
    <button type="button" class="space-name" onclick={() => (appState.paletteOpen = true)} title="Switch Space">
      {appState.engagement}
    </button>
    {#if appState.activeTarget}
      <span class="host mono">{appState.activeTarget.host}</span>
    {/if}
    <span class="mode-pill">{appState.mode}</span>
  </div>
  <div class="cluster right no-drag">
    <button
      type="button"
      class="safety"
      class:yolo={appState.yolo}
      onclick={() => appState.toggleYolo()}
      title={yoloTitle}
      aria-pressed={appState.yolo}
    >{appState.yolo ? 'YOLO' : 'SAFE'}</button>
    <span class="dot" class:on={appState.connected} title={appState.connected ? 'API connected' : 'API offline'}></span>
  </div>
</header>

<style>
  .chrome {
    position: relative;
    height: var(--titlebar-height);
    flex-shrink: 0;
    display: flex;
    align-items: center;
    overflow: hidden;
    border-bottom: 1px solid var(--glass-border);
    user-select: none;
    z-index: 40;
  }
  .metal { position: absolute; inset: 0; opacity: 0.7; pointer-events: none; }
  .drag { position: absolute; inset: 0; z-index: 0; }
  .cluster {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
  }
  .cluster.left {
    margin-left: 16px;
    flex: 1;
  }
  .chrome.mac.tauri .cluster.left { margin-left: 78px; }
  .cluster.right { margin-left: auto; margin-right: 14px; }
  .no-drag { -webkit-app-region: no-drag; }
  .space-name {
    border: none;
    background: transparent;
    color: var(--text);
    font-size: 13px;
    font-weight: 600;
    padding: 0;
    min-height: unset;
    letter-spacing: -0.01em;
  }
  .space-name:hover { color: var(--green); background: transparent; }
  .host {
    font-size: 11px;
    color: var(--text-dim);
    max-width: 220px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .mode-pill {
    font-size: 10px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--green);
    background: var(--green-soft);
    padding: 2px 6px;
    border-radius: 4px;
  }
  .safety {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.06em;
    padding: 2px 8px;
    min-height: unset;
    border-radius: 4px;
    background: var(--green-soft);
    color: var(--green);
    border: 1px solid transparent;
  }
  .safety.yolo {
    background: var(--danger-soft);
    color: var(--danger);
  }
  .dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--danger);
  }
  .dot.on {
    background: var(--green);
    box-shadow: 0 0 8px var(--green-glow);
  }
</style>
