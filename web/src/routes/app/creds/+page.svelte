<script>
  import { onMount } from 'svelte';
  import { appState } from '$lib/stores.svelte';
  import { apiGet, apiPost } from '$lib/api';

  let creds = $state([]);
  let service = $state('');
  let username = $state('');
  let password = $state('');

  async function load() {
    const data = await apiGet(`/v1/credentials/${appState.engagement}`);
    creds = data.credentials || [];
  }

  async function add() {
    await apiPost('/v1/credentials', {
      engagement: appState.engagement,
      service,
      username,
      password
    });
    service = username = password = '';
    await load();
  }

  onMount(load);
</script>

<section class="page">
  <h1>Credentials</h1>
  <p>Stored encrypted on disk. Passwords are masked in the UI.</p>
  <form onsubmit={(e) => { e.preventDefault(); add(); }}>
    <input bind:value={service} placeholder="service" />
    <input bind:value={username} placeholder="username" />
    <input bind:value={password} placeholder="secret" type="password" />
    <button class="primary">Store</button>
  </form>
  <table>
    <thead><tr><th>Service</th><th>User</th><th>Secret</th></tr></thead>
    <tbody>
      {#each creds as c}
        <tr><td>{c.service}</td><td>{c.username}</td><td>{c.password}</td></tr>
      {/each}
    </tbody>
  </table>
</section>

<style>
  .page { padding: 1.2rem; }
  form { display: flex; gap: 0.5rem; margin: 1rem 0; }
  table { width: 100%; border-collapse: collapse; }
  th, td { text-align: left; padding: 0.4rem; border-bottom: 1px solid #1c1c28; }
</style>
