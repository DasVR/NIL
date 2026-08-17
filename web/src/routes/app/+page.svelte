<script>
  import ChatPanel from '$lib/components/ChatPanel.svelte';
  import TerminalPane from '$lib/components/TerminalPane.svelte';
  import ToolPanel from '$lib/components/ToolPanel.svelte';
  import { appState } from '$lib/stores.svelte';

  let toolsOpen = $state(false);
  let terminalOpen = $state(false);

  const pendingCount = $derived(appState.pending.length);
</script>

<div class="workspace">
  <main class="chat-stage">
    <ChatPanel />
  </main>

  <aside class="tools-rail" class:open={toolsOpen}>
    <button
      type="button"
      class="rail-handle tools-handle"
      onclick={() => (toolsOpen = !toolsOpen)}
      aria-expanded={toolsOpen}
      aria-controls="tools-panel"
      aria-label={toolsOpen ? 'Collapse tools panel' : 'Expand tools panel'}
    >
      <span class="handle-icon" aria-hidden="true">{toolsOpen ? '›' : '‹'}</span>
      <span class="handle-label">Tools</span>
      {#if pendingCount > 0}
        <span class="handle-badge">{pendingCount}</span>
      {/if}
    </button>
    <div id="tools-panel" class="rail-panel tools-panel" aria-hidden={!toolsOpen}>
      <div class="panel-connector"></div>
      <ToolPanel />
    </div>
  </aside>

  <section class="terminal-rail" class:open={terminalOpen}>
    <button
      type="button"
      class="rail-handle terminal-handle"
      onclick={() => (terminalOpen = !terminalOpen)}
      aria-expanded={terminalOpen}
      aria-controls="terminal-panel"
      aria-label={terminalOpen ? 'Collapse terminal' : 'Expand terminal'}
    >
      <span class="handle-icon" aria-hidden="true">{terminalOpen ? '▾' : '▴'}</span>
      <span class="handle-label">Terminal</span>
    </button>
    <div id="terminal-panel" class="rail-panel terminal-panel" aria-hidden={!terminalOpen}>
      <div class="panel-connector horizontal"></div>
      <TerminalPane />
    </div>
  </section>
</div>

<style>
  .workspace {
    display: grid;
    grid-template-columns: 1fr auto;
    grid-template-rows: 1fr auto;
    height: 100%;
    min-height: 0;
    background: var(--abyss);
    position: relative;
    overflow: hidden;
  }

  .chat-stage {
    grid-column: 1;
    grid-row: 1;
    min-width: 0;
    min-height: 0;
    overflow: hidden;
    position: relative;
  }

  .chat-stage::after {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: radial-gradient(ellipse 80% 50% at 50% 100%, rgba(0, 217, 146, 0.03), transparent 70%);
  }

  .tools-rail {
    grid-column: 2;
    grid-row: 1;
    display: flex;
    align-items: stretch;
    min-height: 0;
    border-left: 1px solid var(--glass-border);
    background: linear-gradient(to left, var(--abyss-1), transparent 24px);
    transition: width 320ms var(--spring-layout);
    width: 36px;
    overflow: hidden;
  }

  .tools-rail.open {
    width: min(340px, 38vw);
  }

  .tools-handle {
    flex-shrink: 0;
    width: 36px;
    writing-mode: vertical-rl;
    text-orientation: mixed;
    transform: rotate(180deg);
    border: none;
    border-left: 1px solid var(--glass-border);
    border-radius: 0;
    background: var(--glass);
    color: var(--text-secondary);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.45rem;
    padding: 0.75rem 0;
    font-size: 11px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    transition: background 150ms, color 150ms;
  }

  .tools-handle:hover {
    background: var(--glass-2);
    color: var(--accent);
  }

  .tools-panel {
    flex: 1;
    min-width: 0;
    opacity: 0;
    transform: translateX(12px);
    transition: opacity 260ms var(--spring-panel), transform 260ms var(--spring-panel);
    pointer-events: none;
  }

  .tools-rail.open .tools-panel {
    opacity: 1;
    transform: translateX(0);
    pointer-events: auto;
  }

  .terminal-rail {
    grid-column: 1 / -1;
    grid-row: 2;
    display: flex;
    flex-direction: column;
    border-top: 1px solid var(--glass-border);
    background: var(--abyss-1);
    transition: grid-row-height 320ms var(--spring-layout);
    max-height: 36px;
    overflow: hidden;
  }

  .terminal-rail.open {
    max-height: 220px;
  }

  .terminal-handle {
    flex-shrink: 0;
    height: 36px;
    width: 100%;
    border: none;
    border-radius: 0;
    background: var(--glass);
    color: var(--text-secondary);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    font-size: 11px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    transition: background 150ms, color 150ms;
  }

  .terminal-handle:hover {
    background: var(--glass-2);
    color: var(--accent);
  }

  .terminal-panel {
    flex: 1;
    min-height: 0;
    opacity: 0;
    transform: translateY(8px);
    transition: opacity 260ms var(--spring-panel), transform 260ms var(--spring-panel);
    pointer-events: none;
  }

  .terminal-rail.open .terminal-panel {
    opacity: 1;
    transform: translateY(0);
    pointer-events: auto;
  }

  .rail-panel {
    position: relative;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }

  .panel-connector {
    position: absolute;
    left: 0;
    top: 12%;
    bottom: 12%;
    width: 2px;
    background: linear-gradient(to bottom, transparent, var(--accent-20), transparent);
    pointer-events: none;
  }

  .panel-connector.horizontal {
    left: 8%;
    right: 8%;
    top: 0;
    bottom: auto;
    width: auto;
    height: 2px;
    background: linear-gradient(to right, transparent, var(--accent-20), transparent);
  }

  .rail-panel :global(.tool-panel) {
    border: none;
    border-radius: 0;
    max-height: none;
    height: 100%;
    background: transparent;
  }

  .rail-panel :global(.terminal-panel) {
    border-top: none;
    height: 100%;
    resize: none;
  }

  .handle-icon {
    font-size: 12px;
    color: var(--accent);
    opacity: 0.8;
  }

  .handle-label {
    font-family: var(--font-mono);
  }

  .handle-badge {
    font-family: var(--font-mono);
    font-size: 9px;
    min-width: 16px;
    height: 16px;
    padding: 0 4px;
    border-radius: 999px;
    background: var(--danger-20);
    color: var(--danger);
    border: 1px solid rgba(255, 69, 58, 0.25);
    display: grid;
    place-items: center;
    transform: rotate(180deg);
  }

  @media (max-width: 900px) {
    .tools-rail.open {
      width: min(300px, 72vw);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .tools-rail,
    .terminal-rail,
    .tools-panel,
    .terminal-panel {
      transition: none;
    }

    .tools-rail.open .tools-panel,
    .terminal-rail.open .terminal-panel {
      opacity: 1;
      transform: none;
    }
  }
</style>
