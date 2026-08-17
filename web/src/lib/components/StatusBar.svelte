<script>
  import { appState } from '$lib/stores.svelte';
</script>

<footer aria-label="Status bar">
  <button class="yolo-badge" class:on={appState.yolo} onclick={() => appState.toggleYolo()} aria-pressed={appState.yolo}>
    YOLO: {appState.yolo ? 'ON' : 'OFF'}
  </button>
  <span class="sep">|</span>
  <span class="mode">MODE: {appState.mode.toUpperCase()}</span>
  <span class="sep">|</span>
  <span class="eng">ENG: {appState.engagement}</span>
  <span class="sep">|</span>
  <span class="model">{appState.model}</span>
  <span class="sep">|</span>
  <span class:ok={appState.connected} class="status">
    {appState.connected ? 'API up' : 'API down'}
  </span>
</footer>

<style>
  footer {
    grid-column: 2;
    grid-row: 2;
    display: flex;
    gap: 0.6rem;
    align-items: center;
    padding: 0.35rem 0.8rem;
    border-top: 1px solid var(--glass-border);
    font-family: var(--font-mono);
    font-size: 0.72rem;
    background: var(--abyss-1);
    color: var(--text-secondary);
    user-select: none;
  }
  .yolo-badge {
    border: 1px solid var(--text-tertiary);
    color: var(--text-tertiary);
    padding: 0.1rem 0.45rem;
    font-size: 0.7rem;
    border-radius: 4px;
    background: transparent;
    cursor: pointer;
    transition: border-color 200ms, color 200ms;
  }
  .yolo-badge.on {
    border-color: var(--danger);
    color: var(--danger);
    animation: pulse 1.4s ease-in-out infinite;
  }
  .sep { color: var(--text-tertiary); opacity: 0.5; }
  .ok { color: var(--accent); }
  .status { min-width: 60px; }
  @keyframes pulse {
    50% { opacity: 0.45; }
  }
</style>
