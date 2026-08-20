<script>
  import { appState } from '$lib/stores.svelte';
  import LiquidMetal from './LiquidMetal.svelte';
  import { cssToken, COLOR } from '$lib/tokens';
  import {
    closeWindow,
    minimizeWindow,
    startWindowDrag,
    toggleWindowMaximize
  } from '$lib/tauri';

  let { isTauri = false, isMac = false } = $props();

  const yoloTitle = $derived(
    appState.yolo
      ? 'YOLO enabled — commands auto-run (still logged)'
      : 'YOLO disabled — commands require approval'
  );
  const metalColor = $derived.by(() => {
    void appState.prefs.accent;
    void appState.prefs.theme;
    return appState.yolo ? cssToken('--danger', COLOR.danger) : cssToken('--green', COLOR.green);
  });
  const metalBase = $derived.by(() => {
    void appState.prefs.theme;
    return cssToken('--abyss', COLOR.abyss);
  });

  function onDragMouseDown(ev) {
    if (ev.button !== 0) return;
    if (ev.target instanceof HTMLElement && ev.target.closest('.no-drag')) return;
    void startWindowDrag();
  }

  function onDragDblClick(ev) {
    if (ev.target instanceof HTMLElement && ev.target.closest('.no-drag')) return;
    void toggleWindowMaximize();
  }
</script>

<div
  class="chrome"
  class:tauri={isTauri}
  class:mac={isMac}
  role="toolbar"
  tabindex="-1"
  aria-label="Window title bar"
  data-tauri-drag-region
  onmousedown={onDragMouseDown}
  ondblclick={onDragDblClick}
>
  <div class="metal" aria-hidden="true">
    <LiquidMetal
      intensity={appState.yolo ? 0.48 : 0.34}
      speed={0.55}
      color1={metalColor}
      color2={metalBase}
      interactive={false}
    />
  </div>
  <div class="specular" aria-hidden="true"></div>
  {#if isTauri && !isMac}
    <div class="win-controls no-drag">
      <button type="button" class="win-btn" onclick={() => minimizeWindow()} title="Minimize" aria-label="Minimize">─</button>
      <button type="button" class="win-btn" onclick={() => toggleWindowMaximize()} title="Maximize" aria-label="Maximize">□</button>
      <button type="button" class="win-btn close" onclick={() => closeWindow()} title="Close" aria-label="Close">✕</button>
    </div>
  {/if}
  <div class="cluster left">
    <button
      type="button"
      class="space-name no-drag"
      onclick={() => (appState.paletteOpen = true)}
      title="Switch Space"
    >
      {appState.engagement}
    </button>
    {#if appState.activeTarget}
      <span class="host mono">{appState.activeTarget.host}</span>
    {/if}
    <span class="mode-pill">{appState.mode}</span>
    {#if appState.runtime}
      <span class="sandbox mono">{appState.runtime.sandbox}</span>
    {/if}
  </div>
  <div class="cluster right">
    <button
      type="button"
      class="safety no-drag"
      class:yolo={appState.yolo}
      onclick={() => appState.toggleYolo()}
      title={yoloTitle}
      aria-pressed={appState.yolo}
    >{appState.yolo ? 'YOLO' : 'SAFE'}</button>
    <span class="dot" class:on={appState.connected} title={appState.connected ? 'API connected' : 'API offline'}></span>
  </div>
</div>

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
    -webkit-app-region: drag;
    background: color-mix(in srgb, var(--abyss-1) 55%, transparent);
    backdrop-filter: blur(22px) saturate(1.55);
    -webkit-backdrop-filter: blur(22px) saturate(1.55);
  }
  .metal { position: absolute; inset: 0; opacity: 0.88; pointer-events: none; }
  .specular {
    pointer-events: none;
    position: absolute;
    inset: 0 auto auto 0;
    height: 1px;
    width: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.28), transparent);
    z-index: 1;
  }
  .cluster {
    position: relative;
    z-index: 2;
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
    pointer-events: none;
  }
  .cluster :global(button),
  .cluster .no-drag {
    pointer-events: auto;
    -webkit-app-region: no-drag;
  }
  .cluster.left {
    margin-left: 16px;
    flex: 1;
  }
  .chrome.mac.tauri .cluster.left { margin-left: 78px; }
  .cluster.right { margin-left: auto; margin-right: 14px; }
  .win-controls {
    position: relative;
    z-index: 3;
    display: flex;
    gap: 2px;
    margin-left: 8px;
    -webkit-app-region: no-drag;
    pointer-events: auto;
  }
  .win-btn {
    width: 28px;
    height: 22px;
    padding: 0;
    min-height: unset;
    border: 0;
    background: transparent;
    color: var(--text-dim);
    font-size: 11px;
  }
  .win-btn:hover { background: var(--abyss-3); color: var(--text); }
  .win-btn.close:hover { background: var(--danger-soft); color: var(--danger); }
  .space-name {
    border: none;
    background: transparent;
    color: var(--text);
    font-size: 13px;
    font-weight: 600;
    padding: 0;
    min-height: unset;
    letter-spacing: -0.01em;
    max-width: 22ch;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
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
  .sandbox {
    font-size: 10px;
    color: var(--text-faint);
    letter-spacing: 0.04em;
    text-transform: uppercase;
    max-width: 12ch;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
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
    pointer-events: auto;
  }
  .dot.on {
    background: var(--green);
    box-shadow: 0 0 8px var(--green-glow);
  }
</style>
