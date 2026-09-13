<script lang="ts">
  import ToggleRow from '$lib/ui/ToggleRow.svelte';

  let servers = $state([
    { id: 'local', name: 'Local filesystem', description: 'Read workspace files', on: true },
    { id: 'github', name: 'GitHub', description: 'Issues, PRs, and checks', on: false },
  ]);

  function toggle(id: string, on: boolean) {
    servers = servers.map((s) => (s.id === id ? { ...s, on } : s));
  }
</script>

<section class="pane" aria-label="MCP tools">
  <header class="head">
    <span class="eyebrow">MCP tools</span>
    <p class="lede">Servers the agent can call. Toggle one off without disconnecting the rest.</p>
  </header>
  {#each servers as s (s.id)}
    <ToggleRow
      label={s.name}
      description={s.description}
      checked={s.on}
      onChange={(on) => toggle(s.id, on)}
    />
  {/each}
</section>

<style>
  .pane { padding: var(--s-3); display: flex; flex-direction: column; }
  .eyebrow {
    font: 600 var(--t-micro)/1 var(--font-ui);
    letter-spacing: var(--track-tick);
    text-transform: uppercase;
    color: var(--nil-ink-3);
  }
  .lede { font: var(--t-meta)/var(--lh-body) var(--font-ui); color: var(--nil-ink-3); margin: var(--s-2) 0 var(--s-3); }
</style>
