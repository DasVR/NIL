<script>
  import { appState } from '$lib/stores.svelte';

  const items = [
    { href: '/app', label: 'Chat' },
    { href: '/app/findings', label: 'Findings' },
    { href: '/app/notes', label: 'Notes' },
    { href: '/app/tools', label: 'Tools' },
    { href: '/app/creds', label: 'Creds' },
    { href: '/app/reports', label: 'Reports' },
    { href: '/app/loot', label: 'Loot' },
    { href: '/app/settings', label: 'Settings' }
  ];

  async function addEngagement() {
    const name = prompt('Engagement name?');
    if (name) await appState.createEngagement(name.trim());
  }
</script>

<aside>
  <a class="brand" href="/">Finn</a>
  <button class="palette" onclick={() => (appState.paletteOpen = true)}>⌘K command palette</button>
  <div class="section">Engagements</div>
  {#each appState.engagements as eng}
    <button
      class="row"
      class:active={eng.name === appState.engagement}
      onclick={() => appState.select(eng.name)}
    >
      {eng.name}
    </button>
  {/each}
  <button class="row muted" onclick={addEngagement}>+ New</button>
  <div class="section">Navigate</div>
  {#each items as item}
    <a class="row" href={item.href}>{item.label}</a>
  {/each}
</aside>

<style>
  aside {
    grid-column: 1;
    grid-row: 1 / span 2;
    background: #08080c;
    border-right: 1px solid #1c1c28;
    padding: 1rem 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }
  .brand { font-weight: 700; color: var(--accent); padding: 0.3rem 0.4rem; }
  .palette {
    width: 100%;
    text-align: left;
    border-color: #2a2a40;
    color: var(--muted);
    margin: 0.6rem 0;
    font-size: 0.8rem;
  }
  .section { font-size: 0.7rem; color: var(--muted); margin: 0.8rem 0.4rem 0.3rem; text-transform: uppercase; letter-spacing: 0.08em; }
  .row {
    display: block;
    width: 100%;
    text-align: left;
    border: none;
    background: transparent;
    color: var(--text);
    padding: 0.35rem 0.5rem;
    border-radius: 6px;
    text-decoration: none;
  }
  .row:hover, .row.active { background: var(--navy); color: var(--accent); }
  .muted { color: var(--muted); }
</style>
