<script>
  import ChatPanel from '$lib/components/ChatPanel.svelte';
  import TerminalPane from '$lib/components/TerminalPane.svelte';
  import ToolPanel from '$lib/components/ToolPanel.svelte';
  import { appState } from '$lib/stores.svelte';

  const modes = ['hunt', 'chat', 'code', 'report'];
</script>

<div class="chat-view">
  <header class="mode-bar">
    <div class="modes">
      {#each modes as m}
        <button
          class="mode-pill"
          class:active={appState.mode === m}
          onclick={() => (appState.mode = m)}
          aria-current={appState.mode === m ? 'true' : undefined}
        >{m}</button>
      {/each}
    </div>
  </header>

  <div class="chat-body">
    <ChatPanel />
  </div>

  <div class="bottom-row">
    <div class="tool-col">
      <ToolPanel />
    </div>
  </div>

  <TerminalPane />
</div>

<style>
  .chat-view {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
    background: var(--abyss);
  }
  .mode-bar {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.55rem 1rem;
    border-bottom: 1px solid var(--glass-border);
    background: var(--abyss-1);
  }
  .modes {
    display: flex;
    gap: 0.35rem;
  }
  .mode-pill {
    border: 1px solid var(--glass-border);
    background: transparent;
    color: var(--text-secondary);
    border-radius: 999px;
    padding: 0.3rem 0.7rem;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    transition: background 150ms var(--spring-control), color 120ms var(--spring-control), border-color 150ms var(--spring-control);
    cursor: pointer;
  }
  .mode-pill.active {
    background: var(--accent-12);
    border-color: var(--accent-20);
    color: var(--accent);
    font-weight: 600;
  }
  .mode-pill:hover:not(.active) {
    background: var(--glass-2);
    color: var(--text-primary);
  }
  .chat-body {
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }
  .bottom-row {
    display: flex;
    gap: 0.75rem;
    padding: 0.6rem 1rem;
    border-top: 1px solid var(--glass-border);
    background: var(--abyss-1);
  }
  .tool-col {
    flex: 1;
    min-width: 0;
  }
</style>
