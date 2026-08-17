<script>
  import { appState } from '$lib/stores.svelte';

  const version = '0.3.0';

  const connectionTitle = $derived(
    appState.connected
      ? 'Backend API reachable on localhost'
      : `Backend offline${appState.error ? `: ${appState.error}` : ''}. Start with finn api`
  );

  const engagementTitle = $derived(`Active engagement: ${appState.engagement}`);
  const modeTitle = $derived(`Chat mode: ${appState.mode} — controls tool behavior and prompts`);
  const yoloTitle = $derived(
    appState.yolo
      ? 'YOLO enabled — commands auto-run (still sandboxed and logged)'
      : 'YOLO disabled — commands require approval before execution'
  );
  const modelTitle = $derived(`Model routing: ${appState.model}`);
</script>

<footer class="status-bar" aria-label="Status bar">
  <div class="status-left">
    <button
      type="button"
      class="status-item connection"
      class:online={appState.connected}
      title={connectionTitle}
      aria-label={appState.connected ? 'API connected' : 'API disconnected'}
    >
      <span class="status-dot" aria-hidden="true"></span>
      <span>{appState.connected ? 'Connected' : 'Offline'}</span>
    </button>

    <span class="divider" aria-hidden="true"></span>

    <span class="status-item" title={engagementTitle}>
      <span class="label">Eng</span>
      <span class="value">{appState.engagement}</span>
    </span>

    <span class="divider" aria-hidden="true"></span>

    <span class="status-item" title={modeTitle}>
      <span class="label">Mode</span>
      <span class="value mode">{appState.mode}</span>
    </span>

    <span class="divider" aria-hidden="true"></span>

    <button
      type="button"
      class="status-item yolo"
      class:on={appState.yolo}
      onclick={() => appState.toggleYolo()}
      aria-pressed={appState.yolo}
      title={yoloTitle}
    >
      <span class="label">YOLO</span>
      <span class="value">{appState.yolo ? 'ON' : 'OFF'}</span>
    </button>
  </div>

  <div class="status-right">
    <span class="status-item model" title={modelTitle}>
      <span class="value mono">{appState.model}</span>
    </span>

    <span class="divider" aria-hidden="true"></span>

    <span class="status-item version" title="Finn Pentest Harness version">
      v{version}
    </span>
  </div>
</footer>

<style>
  .status-bar {
    grid-column: 1 / -1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    padding: 0 0.85rem;
    height: var(--statusbar-height);
    border-top: 1px solid var(--glass-border);
    font-family: var(--font-mono);
    font-size: 11px;
    background: var(--abyss-1);
    color: var(--text-secondary);
    user-select: none;
    min-width: 0;
    z-index: 15;
  }

  .status-left,
  .status-right {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    min-width: 0;
  }

  .status-right {
    flex-shrink: 0;
  }

  .status-item {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.15rem 0.35rem;
    border-radius: 4px;
    border: none;
    background: transparent;
    color: inherit;
    font: inherit;
    min-height: 44px;
    cursor: default;
    white-space: nowrap;
  }

  button.status-item {
    cursor: pointer;
    transition: background 150ms ease, color 150ms ease;
  }

  button.status-item:hover {
    background: rgba(255, 255, 255, 0.04);
  }

  button.status-item:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 1px;
  }

  .connection {
    color: var(--danger);
  }

  .connection.online {
    color: var(--accent);
  }

  .status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
    flex-shrink: 0;
  }

  .label {
    color: var(--text-tertiary);
    text-transform: capitalize;
  }

  .value {
    color: var(--text-primary);
  }

  .value.mode {
    text-transform: lowercase;
    color: var(--accent);
  }

  .yolo.on .value {
    color: var(--danger);
  }

  .yolo:not(.on) .value {
    color: var(--accent);
  }

  .mono {
    font-family: var(--font-mono);
    max-width: 160px;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .version {
    color: var(--text-tertiary);
    font-size: 10px;
  }

  .divider {
    width: 1px;
    height: 12px;
    background: var(--glass-border);
    flex-shrink: 0;
  }

  @media (max-width: 640px) {
    .model,
    .divider:nth-of-type(6) {
      display: none;
    }

    .status-left {
      overflow-x: auto;
      scrollbar-width: none;
    }

    .status-left::-webkit-scrollbar {
      display: none;
    }
  }

  @media (max-width: 400px) {
    .label {
      display: none;
    }
  }
</style>
