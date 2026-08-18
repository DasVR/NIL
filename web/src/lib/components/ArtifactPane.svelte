<script lang="ts">
  import { appState } from '$lib/stores.svelte';
  import { renderMarkdown } from '$lib/markdown';

  let preview = $state(true);

  const html = $derived(preview ? renderMarkdown(appState.artifact.body) : '');

  function onInput() {
    appState.artifact = { ...appState.artifact, dirty: true };
  }
</script>

<section class="artifact" aria-label="Artifact">
  <header>
    <input class="title" bind:value={appState.artifact.title} oninput={onInput} />
    {#if appState.artifact.dirty}<span class="dirty">unsaved</span>{/if}
    <span class="grow"></span>
    <button type="button" class:on={!preview} onclick={() => (preview = false)}>Edit</button>
    <button type="button" class:on={preview} onclick={() => (preview = true)}>Preview</button>
    <button type="button" class="primary" onclick={() => appState.saveArtifact()}>Save ⌘S</button>
  </header>
  {#if preview}
    <div class="preview md">{@html html}</div>
  {:else}
    <textarea
      class="mono"
      bind:value={appState.artifact.body}
      oninput={onInput}
      placeholder="Write the report, PoC, or note for this Space."
    ></textarea>
  {/if}
</section>

<style>
  .artifact {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    background: var(--abyss);
  }
  header {
    height: 36px;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 10px;
    border-bottom: 1px solid var(--glass-border);
  }
  .title {
    border: 0;
    background: transparent;
    color: var(--text);
    font-size: 13px;
    font-weight: 600;
    min-width: 0;
    flex: 1;
    padding: 0;
  }
  .dirty { font-size: 10px; color: var(--warning); }
  .grow { flex: 0; }
  header button { height: 24px; min-height: unset; font-size: 11px; padding: 0 8px; }
  header button.on { color: var(--green); }
  textarea, .preview {
    flex: 1;
    min-height: 0;
    overflow: auto;
    padding: 16px 18px;
    border: 0;
    border-radius: 0;
    font-size: 13px;
    line-height: 1.55;
  }
  .preview :global(h1), .preview :global(h2), .preview :global(h3) { color: var(--text); }
  .preview :global(p), .preview :global(li) { color: var(--text-dim); }
  .preview :global(code), .preview :global(pre) { font-family: var(--font-mono); font-size: 12px; }
  .preview :global(pre) {
    background: var(--abyss-3);
    padding: 10px;
    border-radius: 8px;
    overflow: auto;
  }
</style>
