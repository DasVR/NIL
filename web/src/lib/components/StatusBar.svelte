<script lang="ts">
  import { appState } from '$lib/stores.svelte';
  import { APP_TAG } from '$lib/version';

  const pending = $derived(appState.topPending);
  const last = $derived(appState.lastBlock);
  const pendingTool = $derived(pending ? ('tool' in pending ? pending.tool : 'command') : '');
</script>

<footer class="status">
  <span class="dot" class:ok={appState.connected}></span>
  <span class="mono dim">{appState.connected ? 'API live' : 'API down'}</span>
  <span class="sep">·</span>
  <span class="mode">{appState.mode}</span>
  {#if appState.activeTarget}
    <span class="sep">·</span>
    <span class="mono host">{appState.activeTarget.host}</span>
  {/if}

  <span class="grow center">
    {#if last}
      <span class="mono last" title={last.command}>
        {last.command.slice(0, 48)}{last.command.length > 48 ? '…' : ''}
        {#if last.exitCode != null}<span class="dim"> exit {last.exitCode}</span>{/if}
        {#if last.duration != null}<span class="dim"> {last.duration.toFixed(1)}s</span>{/if}
      </span>
    {/if}
  </span>

  {#if pending}
    <span class="pending">
      {pendingTool}
      <kbd>⌘↵</kbd> approve
      <kbd>⌘⇧↵</kbd> reject
    </span>
    <span class="sep">·</span>
  {/if}

  <button type="button" class="yolo" class:on={appState.yolo} onclick={() => appState.toggleYolo()}>
    {appState.yolo ? 'YOLO' : 'SAFE'}
  </button>
  <span class="mono dim">{APP_TAG}</span>
  <button type="button" class="gear" onclick={() => (appState.settingsOpen = true)} title="Settings (⌘,)">⚙</button>
</footer>

<style>
  .status {
    display: flex;
    align-items: center;
    gap: 8px;
    height: var(--statusbar-height);
    padding: 0 14px;
    border-top: 1px solid var(--glass-border);
    background: var(--abyss);
    font-size: 11px;
    color: var(--text-faint);
    flex-shrink: 0;
    font-variant-numeric: tabular-nums;
    z-index: 4;
  }
  .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--danger);
  }
  .dot.ok { background: var(--green); }
  .dim { color: var(--text-faint); }
  .host { color: var(--green); }
  .mode { text-transform: uppercase; letter-spacing: 0.06em; font-size: 10px; color: var(--text-dim); }
  .sep { color: var(--text-faint); opacity: 0.6; }
  .grow { flex: 1; min-width: 0; }
  .center { display: flex; justify-content: center; }
  .last {
    max-width: 420px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--text-dim);
  }
  .pending {
    color: var(--warning);
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .yolo, .gear {
    height: 18px;
    min-height: unset;
    padding: 0 6px;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.06em;
    border: 0;
    background: transparent;
    color: var(--green);
  }
  .yolo.on { color: var(--danger); }
  .gear { color: var(--text-faint); font-size: 12px; }
</style>
