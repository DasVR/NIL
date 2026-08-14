<script>
  import { appState } from '$lib/stores.svelte';
</script>

<section class="page">
  <h1>Notes — {appState.engagement}</h1>
  <h3>Scope</h3>
  <textarea bind:value={appState.scope} rows="6"></textarea>
  <button onclick={() => appState.saveScope()}>Save scope</button>
  <h3>Notes</h3>
  <textarea bind:value={appState.notes} rows="18"></textarea>
  <button class="primary" onclick={() => appState.saveNotes()}>Save notes</button>
</section>

<style>
  .page { padding: 1rem 1.2rem; display: flex; flex-direction: column; gap: 0.6rem; }
  textarea { width: 100%; }
</style>
