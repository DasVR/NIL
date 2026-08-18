<script>
  import { appState } from '$lib/stores.svelte';
  import TerminalPane from '$lib/components/TerminalPane.svelte';
  import AiStrip from '$lib/components/AiStrip.svelte';
  import EmptyState from '$lib/components/EmptyState.svelte';
</script>

<div class="workspace-page">
  {#if appState.engagement === 'default' && !appState.engagements.length}
    <!-- First run / empty state -->
    <EmptyState />
  {:else}
    <!-- Terminal is the primary surface -->
    <div class="terminal-hero">
      <div class="terminal-chrome">
        <div class="chrome-left">
          <span class="chrome-dot red"></span>
          <span class="chrome-dot yellow"></span>
          <span class="chrome-dot green"></span>
          <span class="chrome-title mono">{appState.engagement} — zsh</span>
        </div>
        <div class="chrome-right">
          <button
            type="button"
            class="view-btn"
            class:active={appState.activeView === 'terminal'}
            onclick={() => appState.activeView = 'terminal'}
            title="Terminal (Cmd+T)"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="4" y="4" width="16" height="16" rx="2"/>
              <path d="M4 8h16M8 4v4"/>
            </svg>
          </button>
          <button
            type="button"
            class="view-btn"
            class:active={appState.activeView === 'editor'}
            onclick={() => appState.activeView = 'editor'}
            title="Editor (Cmd+E)"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <button
            type="button"
            class="view-btn"
            onclick={() => appState.toggleAi()}
            title="AI Strip (Cmd+J)"
            class:active={appState.aiStripOpen}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </button>
        </div>
      </div>

      <div class="terminal-body">
        <TerminalPane height={appState.aiStripOpen ? 'calc(100% - var(--ai-strip-height))' : '100%'} />
      </div>
    </div>

    <!-- Contextual AI Strip (collapsed by default) -->
    <AiStrip />
  {/if}
</div>

<style>
  .workspace-page {
    flex: 1;
    min-width: 0;
    min-height: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative;
  }

  .terminal-hero {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative;
  }

  .terminal-chrome {
    height: 32px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 14px;
    background: var(--glass-2);
    border-bottom: 1px solid var(--glass-border);
    user-select: none;
    -webkit-user-select: none;
  }

  .chrome-left {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .chrome-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    display: block;
  }

  .chrome-dot.red { background: #ff5f57; }
  .chrome-dot.yellow { background: #febc2e; }
  .chrome-dot.green { background: #28c840; }

  .chrome-title {
    margin-left: 8px;
    font-size: 11px;
    color: var(--text-dim);
    letter-spacing: 0.02em;
  }

  .chrome-right {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .view-btn {
    width: 28px;
    height: 28px;
    padding: 0;
    min-height: unset;
    display: grid;
    place-items: center;
    border-radius: 5px;
    border: 1px solid transparent;
    background: transparent;
    color: var(--text-faint);
    transition: all 180ms var(--spring-control);
  }

  .view-btn:hover {
    background: var(--glass-3);
    color: var(--text-dim);
  }

  .view-btn.active {
    background: var(--glass-3);
    color: var(--green);
    border-color: var(--green-soft);
  }

  .terminal-body {
    flex: 1;
    min-height: 0;
    overflow: hidden;
    position: relative;
  }

  @media (prefers-reduced-motion: reduce) {
    .view-btn {
      transition: none;
    }
  }
</style>
