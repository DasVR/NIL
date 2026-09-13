<script lang="ts">
  import ToggleRow from '$lib/ui/ToggleRow.svelte';
  import { browser } from '$app/environment';
  import { project, type McpServer } from '$lib/project.svelte.ts';

  interface Row extends McpServer {
    on: boolean;
  }

  const KEY = 'nil.mcp.servers';

  const FALLBACK: McpServer[] = [
    { id: 'local', name: 'Local filesystem', description: 'Read workspace files', source: 'session' },
    { id: 'github', name: 'GitHub', description: 'Issues, PRs, and checks', source: 'session' },
  ];

  function loadToggles(): Record<string, boolean> {
    if (!browser) return {};
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return {};
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) return {};
      const out: Record<string, boolean> = {};
      for (const row of parsed) {
        if (!row || typeof row !== 'object') continue;
        const s = row as { id?: unknown; on?: unknown };
        if (typeof s.id === 'string') out[s.id] = Boolean(s.on);
      }
      return out;
    } catch {
      return {};
    }
  }

  let toggles = $state<Record<string, boolean>>(loadToggles());

  const listed = $derived(project.mcp);
  const source = $derived(listed && listed.length > 0 ? listed : FALLBACK);
  const rows = $derived<Row[]>(
    source.map((s) => ({
      ...s,
      on: s.id in toggles ? toggles[s.id] : true,
    })),
  );

  const empty = $derived(project.bridge && listed !== null && listed.length === 0);

  function toggle(id: string, on: boolean) {
    const next = { ...toggles, [id]: on };
    toggles = next;
    if (browser) {
      localStorage.setItem(KEY, JSON.stringify(Object.entries(next).map(([key, value]) => ({ id: key, on: value }))));
    }
  }
</script>

<section class="pane" aria-label="MCP tools">
  <header class="head">
    <span class="eyebrow">MCP tools</span>
    <p class="lede">
      {#if listed && listed.length > 0}
        Servers declared in this workspace. Toggles stay on this machine and do not start or stop a process.
      {:else}
        Servers the agent can call. Toggle one off without disconnecting the rest. These toggles stay on this machine.
      {/if}
    </p>
  </header>
  {#if empty}
    <p class="empty">No MCP servers declared in this workspace yet.</p>
  {:else}
    {#each rows as s (s.id)}
      <ToggleRow
        label={s.name}
        description={s.source === 'session' ? s.description : `${s.description} · ${s.source}`}
        checked={s.on}
        onChange={(on) => toggle(s.id, on)}
      />
    {/each}
  {/if}
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
  .empty { font: var(--t-meta)/var(--lh-body) var(--font-ui); color: var(--nil-ink-3); margin: 0; }
</style>
