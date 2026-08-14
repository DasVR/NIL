<script>
  import { appState } from '$lib/stores.svelte';
</script>

<footer>
  <button class:on={appState.yolo} onclick={() => appState.toggleYolo()}>
    YOLO: {appState.yolo ? 'ON' : 'OFF'}
  </button>
  <span>MODE: {appState.mode}</span>
  <span>ENG: {appState.engagement}</span>
  <span>MODEL: {appState.model}</span>
  <span class:ok={appState.connected}>{appState.connected ? 'API up' : 'API down'}</span>
</footer>

<style>
  footer {
    grid-column: 2;
    grid-row: 2;
    display: flex;
    gap: 1rem;
    align-items: center;
    padding: 0.4rem 0.8rem;
    border-top: 1px solid #1c1c28;
    font-family: "JetBrains Mono", monospace;
    font-size: 0.75rem;
    background: #08080c;
  }
  button {
    border-color: var(--muted);
    color: var(--muted);
    padding: 0.15rem 0.5rem;
    font-size: 0.75rem;
  }
  button.on {
    border-color: var(--danger);
    color: var(--danger);
    animation: pulse 1.4s ease-in-out infinite;
  }
  .ok { color: var(--accent); }
  @keyframes pulse {
    50% { opacity: 0.55; }
  }
</style>
