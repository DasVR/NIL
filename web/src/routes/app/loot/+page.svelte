<script>
  import { onMount } from 'svelte';
  import { appState } from '$lib/stores.svelte';
  import { apiGet } from '$lib/api';

  let loot = $state([]);

  onMount(async () => {
    const data = await apiGet(`/v1/engagements/${appState.engagement}/loot`);
    loot = data.loot || [];
  });
</script>

<section class="page">
  <h1>Loot</h1>
  {#if loot.length === 0}
    <p>No files in this engagement loot directory yet.</p>
  {:else}
    <ul>
      {#each loot as f}
        <li>{f.name} <span class="muted">{f.size} bytes</span></li>
      {/each}
    </ul>
  {/if}
</section>

<style>
  .page { padding: 1.2rem; }
  .muted { color: var(--muted); }
</style>
