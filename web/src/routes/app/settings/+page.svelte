<script>
  import { getApiBase, setApiBase, getApiKey, setApiKey } from '$lib/api';
  import { appState } from '$lib/stores.svelte';
  import { apiGet, apiPut } from '$lib/api';

  let apiBase = $state(getApiBase());
  let apiKey = $state(getApiKey());
  let providers = $state({ priority: [] });

  async function load() {
    const data = await apiGet('/v1/providers');
    providers = data.config || { priority: [] };
  }

  async function save() {
    setApiBase(apiBase);
    setApiKey(apiKey);
    await apiPut('/v1/providers', providers);
    await appState.refresh();
  }

  load().catch(() => {});
</script>

<section class="page">
  <h1>Settings</h1>
  <label for="api-base">API base URL</label>
  <input id="api-base" bind:value={apiBase} placeholder="http://127.0.0.1:8766" />
  <label for="api-key">API key (optional)</label>
  <input id="api-key" type="password" bind:value={apiKey} placeholder="PENTEST_API_KEY if backend requires auth" />
  <label class="check">
    <input type="checkbox" bind:checked={appState.scanlines} />
    CRT scanlines
  </label>
  <h3>Provider priority</h3>
  {#each providers.priority || [] as p, i}
    <div class="prov">
      <input bind:value={p.name} />
      <input bind:value={p.model} />
      <input bind:value={p.base_url} />
    </div>
  {/each}
  <button class="primary" onclick={save}>Save</button>
</section>

<svelte:head>
  {#if appState.scanlines}
    <style>html { }</style>
  {/if}
</svelte:head>

<style>
  .page { padding: 1.2rem; display: flex; flex-direction: column; gap: 0.6rem; max-width: 760px; }
  .prov { display: grid; grid-template-columns: 1fr 1fr 2fr; gap: 0.4rem; }
  .check { display: flex; gap: 0.5rem; align-items: center; }
</style>
