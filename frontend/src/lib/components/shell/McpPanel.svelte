<script lang="ts">
  import ToggleRow from '$lib/ui/ToggleRow.svelte';
  import { browser } from '$app/environment';

  interface Server {
    id: string;
    name: string;
    description: string;
    on: boolean;
  }

  const KEY = 'nil.mcp.servers';

  const DEFAULTS: Server[] = [
    { id: 'local', name: 'Local filesystem', description: 'Read workspace files', on: true },
    { id: 'github', name: 'GitHub', description: 'Issues, PRs, and checks', on: false },
  ];

  function load(): Server[] {
    if (!browser) return DEFAULTS;
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return DEFAULTS;
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) return DEFAULTS;
      return DEFAULTS.map((d) => {
        const hit = parsed.find((s) => s && typeof s === 'object' && (s as Server).id === d.id) as Server | undefined;
        return hit ? { ...d, on: Boolean(hit.on) } : d;
      });
    } catch {
      return DEFAULTS;
    }
  }

  let servers = $state<Server[]>(load());

  function toggle(id: string, on: boolean) {
    servers = servers.map((s) => (s.id === id ? { ...s, on } : s));
    if (browser) localStorage.setItem(KEY, JSON.stringify(servers));
  }
</script>

<section class="pane" aria-label="MCP tools">
  <header class="head">
    <span class="eyebrow">MCP tools</span>
    <p class="lede">Servers the agent can call. Toggle one off without disconnecting the rest. These toggles stay on this machine.</p>
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
