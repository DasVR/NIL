<script>
  import { appState } from '$lib/stores.svelte';
  import { apiPost } from '$lib/api';

  let target = $state('');
  let plugin = $state('nmap');

  async function run() {
    await apiPost('/v1/plugins/run', {
      engagement: appState.engagement,
      plugin_name: plugin,
      target,
      args: {}
    });
    await appState.refresh();
  }
</script>

<section class="page">
  <h1>Plugins</h1>
  <p>Proposes commands into the approval queue. Review them in Chat.</p>
  <div class="row">
    <select bind:value={plugin}>
      {#each appState.plugins as p}
        <option value={p.name}>{p.name} ({p.safety_level})</option>
      {/each}
    </select>
    <input bind:value={target} placeholder="target (in-scope host or URL)" />
    <button class="primary" onclick={run}>Propose</button>
  </div>
  <ul>
    {#each appState.plugins as p}
      <li><strong>{p.name}</strong> — {p.description}</li>
    {/each}
  </ul>
</section>

<style>
  .page { padding: 1.2rem; }
  .row { display: flex; gap: 0.5rem; margin: 1rem 0; }
  .row input { flex: 1; }
</style>
