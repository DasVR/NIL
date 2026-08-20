<script lang="ts">
  import { appState } from '$lib/stores.svelte';
  import TerminalBlocks from '$lib/components/TerminalBlocks.svelte';
  import ArtifactPane from '$lib/components/ArtifactPane.svelte';
  import AiStrip from '$lib/components/AiStrip.svelte';
  import EmptyState from '$lib/components/EmptyState.svelte';
  import ThinkingOrbs from '$lib/components/ThinkingOrbs.svelte';
  import MorphIcon from '$lib/components/MorphIcon.svelte';

  const thinVisible = $derived(!appState.aiStripHidden);
</script>

<div class="workspace-page">
  {#if appState.isEmptySpace}
    <EmptyState />
  {:else}
    <div class="surface-chrome">
      <span class="chrome-title label-micro">Primary</span>
      <div class="views">
        <button type="button" class:on={appState.activeView === 'terminal'} onclick={() => appState.setView('terminal')} title="Terminal (⌘T)">
          <MorphIcon name="term" on={appState.activeView === 'terminal'} />
          Term
        </button>
        <button type="button" class:on={appState.activeView === 'artifact'} onclick={() => appState.setView('artifact')} title="Artifact (⌘E)">
          <MorphIcon name="artifact" on={appState.activeView === 'artifact'} />
          Artifact
        </button>
        <button type="button" class:on={appState.activeView === 'split'} onclick={() => appState.setView('split')} title="Split (⌘\)">
          <MorphIcon name="split" on={appState.activeView === 'split'} />
          Split
        </button>
        <button
          type="button"
          class:on={appState.aiStripOpen}
          class:busy={appState.busy && !appState.aiStripOpen}
          onclick={() => appState.toggleAi()}
          title="Finn (⌘J)"
        >
          <MorphIcon name="finn" on={appState.aiStripOpen} />
          Finn
        </button>
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
        <div class="finn-sheet liquid-glass">
          <AiStrip />
        </div>
      {/if}
      {#if thinVisible}
        <button type="button" class="finn-bar glass-overlay" onclick={() => appState.openFinn({ focus: true })}>
          {#if appState.busy}
            <ThinkingOrbs label="Finn is working" />
          {:else}
            <span class="dot"></span>
          {/if}
          <span>Finn</span>
          <span class="mode">{appState.mode}</span>
          <span class="hint">{appState.busy ? 'Working on this Space' : 'Ask in English · ⌘J'}</span>
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
    font-size: 10px;
    color: var(--text-faint);
    letter-spacing: 0.08em;
    text-transform: uppercase;
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
    display: inline-flex;
    align-items: center;
    gap: 5px;
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
    padding-bottom: var(--ai-strip-thin);
  }
  .surface.split > :global(*) { flex: 1; min-width: 0; min-height: 0; }
  .surface.split > :global(.artifact) { border-left: 1px solid var(--glass-border); }
  .finn-sheet {
    position: absolute;
    left: 10px;
    right: 10px;
    bottom: calc(var(--ai-strip-thin) + 8px);
    height: min(46vh, 340px);
    z-index: 6;
    overflow: hidden;
    border-radius: var(--radius-panel);
    box-shadow: var(--shadow-modal);
    animation: finn-rise 280ms var(--spring-panel);
  }
  @keyframes finn-rise {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: none; }
  }
  .finn-bar {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 5;
    flex-shrink: 0;
    height: var(--ai-strip-thin);
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 12px;
    border: 0;
    border-top: 1px solid var(--glass-border);
    border-radius: 0;
    color: var(--text-dim);
    font-size: 12px;
    min-height: unset;
    min-width: 0;
  }
  .finn-bar:hover { color: var(--text); }
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
    flex-shrink: 0;
  }
  @media (prefers-reduced-motion: reduce) {
    .finn-sheet { animation: none; }
  }
  :global(html.reduce-motion) .finn-sheet { animation: none; }
</style>
