<script>
  import { appState } from '$lib/stores.svelte';
  import { marked } from 'marked';
  import { apiPost } from '$lib/api';

  let title = $state('');
  let severity = $state('Medium');
  let description = $state('');
  let selected = $state(null);

  async function add() {
    await apiPost('/v1/findings', {
      engagement: appState.engagement,
      title,
      severity,
      description
    });
    title = '';
    description = '';
    await appState.refresh();
  }
</script>

<section class="page">
  <h1>Findings</h1>
  <form onsubmit={(e) => { e.preventDefault(); add(); }}>
    <input bind:value={title} placeholder="Title" />
    <select bind:value={severity}>
      {#each ['Critical', 'High', 'Medium', 'Low', 'Info'] as s}<option>{s}</option>{/each}
    </select>
    <textarea bind:value={description} placeholder="Description"></textarea>
    <button class="primary" type="submit">Add finding</button>
  </form>
  <div class="split">
    <ul>
      {#each appState.findings as f}
        <li>
          <button onclick={() => (selected = f)}>[{f.severity}] {f.title}</button>
        </li>
      {/each}
    </ul>
    <article>
      {#if selected}
        {@html marked.parse(selected.body || '', { async: false })}
      {:else}
        <p class="muted">Select a finding.</p>
      {/if}
    </article>
  </div>
</section>

<style>
  .page { padding: 1rem 1.2rem; overflow: auto; }
  form { display: grid; gap: 0.5rem; max-width: 640px; margin-bottom: 1rem; }
  .split { display: grid; grid-template-columns: 280px 1fr; gap: 1rem; }
  ul { list-style: none; padding: 0; }
  li button { width: 100%; text-align: left; border: none; }
  .muted { color: var(--muted); }
</style>
