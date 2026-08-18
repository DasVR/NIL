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
        <button type="button" class:on={appState.aiStripOpen} onclick={() => appState.toggleAi()} title="Finn (⌘J)">Finn</button>
      </div>
    </div>

    <div class="surface" class:split={appState.activeView === 'split'}>
      {#if appState.activeView === 'terminal' || appState.activeView === 'split'}
        <TerminalBlocks />
      {/if}
      {#if appState.activeView === 'artifact' || appState.activeView === 'split'}
        <ArtifactPane />
      {/if}
    </div>

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
  .chrome-title { font-size: 11px; color: var(--text-dim); }
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
  .surface {
    flex: 1;
    min-height: 0;
    display: flex;
    overflow: hidden;
    position: relative;
    padding-bottom: 26px;
  }
  .surface.split > :global(*) { flex: 1; min-width: 0; }
  .surface.split > :global(.artifact) { border-left: 1px solid var(--glass-border); }
</style>
