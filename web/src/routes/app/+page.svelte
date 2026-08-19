<script lang="ts">
  import { appState } from '$lib/stores.svelte';
  import TerminalBlocks from '$lib/components/TerminalBlocks.svelte';
  import ArtifactPane from '$lib/components/ArtifactPane.svelte';
  import AiStrip from '$lib/components/AiStrip.svelte';
  import EmptyState from '$lib/components/EmptyState.svelte';
</script>

<div class="workspace-page">
  {#if appState.isEmptySpace}
    <EmptyState />
  {:else}
    <div class="surface-chrome">
      <span class="chrome-title mono">{appState.engagement}</span>
      <div class="views">
        <button type="button" class:on={appState.activeView === 'terminal'} onclick={() => appState.setView('terminal')} title="Terminal (⌘T)">Term</button>
        <button type="button" class:on={appState.activeView === 'artifact'} onclick={() => appState.setView('artifact')} title="Artifact (⌘E)">Artifact</button>
        <button type="button" class:on={appState.activeView === 'split'} onclick={() => appState.setView('split')} title="Split (⌘\\)">Split</button>
        <button
          type="button"
          class:on={appState.aiStripOpen}
          class:busy={appState.busy && !appState.aiStripOpen}
          onclick={() => appState.toggleAi()}
          title="Finn (⌘J)"
        >Finn</button>
      </div>
    </div>

    <div class="work-row">
      <div class="surface" class:split={appState.activeView === 'split'}>
        {#if appState.activeView === 'terminal' || appState.activeView === 'split'}
          <TerminalBlocks />
        {/if}
        {#if appState.activeView === 'artifact' || appState.activeView === 'split'}
          <ArtifactPane />
        {/if}
      </div>
      {#if appState.aiStripOpen}
        <AiStrip />
      {:else}
        <button type="button" class="finn-bar" onclick={() => appState.openFinn({ focus: true })}>
          <span class="dot" class:busy={appState.busy}></span>
          Finn
          <span class="mode">{appState.mode}</span>
          <span class="hint">Ask in English · ⌘J</span>
        </button>
      {/if}
    </div>
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
  .surface-chrome {
    height: 32px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 12px;
    border-bottom: 1px solid var(--glass-border);
    background: var(--abyss-1);
  }
  .chrome-title {
    font-size: 11px;
    color: var(--text-dim);
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .views { display: flex; gap: 4px; }
  .views button {
    height: 24px;
    min-height: unset;
    padding: 0 8px;
    font-size: 11px;
    border: 1px solid transparent;
    background: transparent;
    color: var(--text-faint);
  }
  .views button.on { color: var(--green); background: var(--green-soft); }
  .views button.busy { color: var(--green); }
  .work-row {
    flex: 1;
    min-width: 0;
    min-height: 0;
    display: flex;
    flex-direction: column;
    position: relative;
    overflow: hidden;
  }
  .surface {
    flex: 1;
    min-width: 0;
    min-height: 0;
    display: flex;
    overflow: hidden;
    position: relative;
  }
  .surface.split > :global(*) { flex: 1; min-width: 0; min-height: 0; }
  .surface.split > :global(.artifact) { border-left: 1px solid var(--glass-border); }
  .finn-bar {
    flex-shrink: 0;
    height: 32px;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 12px;
    border: 0;
    border-top: 1px solid var(--glass-border);
    border-radius: 0;
    background: var(--abyss-1);
    color: var(--text-dim);
    font-size: 12px;
    min-height: unset;
    min-width: 0;
  }
  .finn-bar:hover { color: var(--text); background: var(--abyss-2); }
  .finn-bar .mode {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--green);
  }
  .finn-bar .hint { margin-left: auto; font-size: 11px; color: var(--text-faint); }
  .finn-bar .dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--green);
    box-shadow: 0 0 6px var(--green-glow);
  }
  .finn-bar .dot.busy { animation: pulse 1.2s ease-in-out infinite; }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }
</style>
