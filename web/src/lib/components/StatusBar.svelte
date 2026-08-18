<script>
  import { appState } from '$lib/stores.svelte';
  import { appState as state } from '$lib/stores.svelte';

  const version = '0.3.0';

  const connectionTitle = $derived(
    appState.connected
      ? 'Backend API reachable on localhost'
      : `Backend offline${appState.error ? `: ${appState.error}` : ''}. Start with finn api`
  );

  const targetText = $derived(
    appState.activeTarget?.host || appState.scope?.split(/\n|,/).filter(Boolean)[0] || 'no target'
  );

  const lastRun = $derived(
    appState.pending.length > 0
      ? `pending: ${appState.pending[0].tool}`
      : appState.termLines.length > 0
        ? `last: ${appState.termLines.slice(-1)[0]?.slice(0, 28)}`
        : 'idle'
  );

  const sandboxStatus = $derived(
    appState.connected ? 'sandbox ready' : 'offline'
  );

  const yoloTitle = $derived(
    appState.yolo
      ? 'YOLO enabled — commands auto-run (still sandboxed and logged)'
      : 'YOLO disabled — commands require approval before execution'
  );
</script>

<footer class="status-bar" aria-label="Status and safety bar">
  <div class="status-cluster">
    <button
      type="button"
      class="status-pill connection"
      class:online={appState.connected}
      title={connectionTitle}
      aria-label={appState.connected ? 'API connected' : 'API disconnected'}
    >
      <span class="status-dot" aria-hidden="true"></span>
      <span class="mono">{appState.connected ? 'api connected' : 'api offline'}</span>
    </button>

    <span class="status-pill mode-pill">
      <span class="label-micro">mode</span>
      <span class="mono">{appState.mode}</span>
    </span>

    <span class="status-pill target-pill" title="Active target / scope">
      <span class="label-micro">target</span>
      <span class="mono">{targetText}</span>
    </span>
  </div>

  <div class="status-cluster center">
    <span class="status-pill sandbox-pill" title="Sandbox status">
      <span class="label-micro">sandbox</span>
      <span class="mono">{sandboxStatus}</span>
    </span>

    <span class="status-pill run-pill" title="Last tool run">
      <span class="label-micro">last run</span>
      <span class="mono">{lastRun}</span>
    </span>
  </div>

  <div class="status-cluster right">
    <button
      type="button"
      class="status-pill yolo-pill"
      class:on={appState.yolo}
      onclick={() => appState.toggleYolo()}
      aria-pressed={appState.yolo}
      title={yoloTitle}
    >
      <span class="label-micro">yolo</span>
      <span class="mono">{appState.yolo ? 'on' : 'off'}</span>
    </button>

    <span class="status-pill version-pill">
      <span class="label-micro">finn</span>
      <span class="mono">v{version}</span>
    </span>

    <button
      type="button"
      class="status-pill gear-btn"
      onclick={() => appState.settingsOpen = true}
      aria-label="Open settings"
      title="Settings (Cmd+,)"
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </svg>
    </button>
  </div>
</footer>

<style>
  .status-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: var(--statusbar-height);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    padding: 0 12px;
    background: var(--glass-3);
    border-top: 1px solid var(--glass-border);
    backdrop-filter: blur(12px) saturate(1.3);
    -webkit-backdrop-filter: blur(12px) saturate(1.3);
    font-size: 11px;
    user-select: none;
    z-index: 90;
    min-width: 0;
  }

  .status-cluster {
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
  }

  .status-cluster.center {
    flex: 1;
    justify-content: center;
  }

  .status-cluster.right {
    flex-shrink: 0;
  }

  .status-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 2px 8px;
    border-radius: 5px;
    border: 1px solid var(--glass-border);
    background: var(--glass-2);
    color: var(--text);
    font-size: 11px;
    min-height: unset;
    cursor: default;
    transition: border-color 120ms var(--spring-control), background 120ms var(--spring-control);
  }

  .status-pill:not(.mode-pill, .target-pill, .sandbox-pill, .run-pill, .version-pill):hover {
    border-color: var(--glass-border-strong);
  }

  button.status-pill {
    cursor: pointer;
  }

  button.status-pill:hover {
    background: var(--glass-3);
  }

  .status-pill .label-micro {
    color: var(--text-faint);
    font-size: 9px;
    letter-spacing: 0.06em;
  }

  .status-pill .mono {
    color: var(--text-dim);
    font-family: var(--font-mono);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 140px;
  }

  .connection {
    color: var(--danger);
    border-color: rgba(255, 92, 92, 0.2);
  }

  .connection.online {
    color: var(--green);
    border-color: rgba(0, 217, 146, 0.2);
  }

  .connection.online .mono {
    color: var(--green);
  }

  .status-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: currentColor;
    flex-shrink: 0;
  }

  .mode-pill .mono {
    color: var(--green);
    text-transform: lowercase;
  }

  .target-pill .mono {
    color: var(--text);
  }

  .yolo-pill.on {
    background: var(--danger-soft);
    border-color: rgba(255, 92, 92, 0.3);
  }

  .yolo-pill.on .mono {
    color: var(--danger);
  }

  .yolo-pill:not(.on) .mono {
    color: var(--text-dim);
  }

  .gear-btn {
    width: 22px;
    height: 22px;
    padding: 0;
    display: grid;
    place-items: center;
    color: var(--text-faint);
  }

  .gear-btn:hover {
    color: var(--text);
  }

  @media (max-width: 860px) {
    .status-cluster.center {
      display: none;
    }
  }

  @media (max-width: 560px) {
    .version-pill,
    .status-pill .label-micro {
      display: none;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .status-pill {
      transition: none;
    }
  }
</style>
