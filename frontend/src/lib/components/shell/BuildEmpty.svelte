<script lang="ts">
  import { appState } from '$lib/stores/appState.svelte.ts';
  import { workspace } from '$lib/stores/workspace.svelte.ts';
  import NilIcon from '$lib/ui/NilIcon.svelte';
  import { magnetic } from '$lib/motion/magnetic.svelte.ts';

  function openFiles() {
    workspace.openSide('targets');
  }

  function focusComposer() {
    appState.focusComposer();
  }
</script>

<section class="empty" aria-label="Build">
  <div class="copy">
    <p class="kicker">Build</p>
    <h1>Ready when you are.</h1>
    <p class="lede">Describe a task in the composer, pin a path with @, or open the files rail.</p>
    <div class="actions">
      <button class="nil-lift nil-halo nil-magnetic go" type="button" {@attach magnetic} onclick={openFiles}>
        <NilIcon name="folder" size={16} />
        Open files
      </button>
      <button class="nil-lift nil-halo go" type="button" onclick={focusComposer}>
        Focus composer
      </button>
    </div>
  </div>
</section>

<style>
  .empty {
    width: 100%;
    height: 100%;
    display: grid;
    place-items: center;
  }
  .copy {
    display: flex;
    flex-direction: column;
    gap: var(--s-3);
    max-width: 36ch;
    padding: var(--s-6);
  }
  .kicker {
    font: 600 var(--t-micro)/1 var(--font-ui);
    letter-spacing: var(--track-tick);
    text-transform: uppercase;
    color: var(--nil-ink-3);
    margin: 0;
  }
  h1 {
    font: 500 var(--t-head)/var(--lh-tight) var(--font-ui);
    color: var(--nil-ink);
    margin: 0;
  }
  .lede { font: var(--t-body)/var(--lh-body) var(--font-ui); color: var(--nil-ink-2); margin: 0; }
  .actions { display: flex; flex-wrap: wrap; gap: 6px; }
  .go {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 28px;
    padding: 0 var(--s-3);
    border: 1px solid var(--nil-line);
    border-radius: var(--r-field);
    background: var(--nil-raised);
    color: var(--nil-ink);
    font: 500 var(--t-meta)/1 var(--font-ui);
    cursor: pointer;
  }
</style>
