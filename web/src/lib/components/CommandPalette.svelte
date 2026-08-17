<script>
  import { goto } from '$app/navigation';
  import { appState } from '$lib/stores.svelte';

  let q = $state('');
  let selectedIndex = $state(0);

  const commands = [
    { id: 'chat', label: 'Go to chat', run: () => goto('/app') },
    { id: 'findings', label: 'Go to findings', run: () => goto('/app/findings') },
    { id: 'notes', label: 'Go to notes', run: () => goto('/app/notes') },
    { id: 'tools', label: 'Go to tools', run: () => goto('/app/tools') },
    { id: 'settings', label: 'Go to settings', run: () => goto('/app/settings') },
    { id: 'yolo', label: 'Toggle YOLO', run: () => appState.toggleYolo() },
    { id: 'hunt', label: 'Mode: hunt', run: () => (appState.mode = 'hunt') },
    { id: 'chatmode', label: 'Mode: chat', run: () => (appState.mode = 'chat') },
    { id: 'code', label: 'Mode: code', run: () => (appState.mode = 'code') },
    { id: 'report', label: 'Mode: report', run: () => (appState.mode = 'report') },
    { id: 'newEng', label: 'New engagement', run: () => { const n = prompt('Name?'); if (n) appState.createEngagement(n); } }
  ];

  let filtered = $derived(
    commands.filter((c) => c.label.toLowerCase().includes(q.toLowerCase()))
  );

  function pick(cmd) {
    cmd.run();
    appState.paletteOpen = false;
    q = '';
    selectedIndex = 0;
  }

  function onKey(ev) {
    if (ev.key === 'ArrowDown') {
      ev.preventDefault();
      selectedIndex = (selectedIndex + 1) % filtered.length;
    } else if (ev.key === 'ArrowUp') {
      ev.preventDefault();
      selectedIndex = (selectedIndex - 1 + filtered.length) % filtered.length;
    } else if (ev.key === 'Enter') {
      ev.preventDefault();
      if (filtered[selectedIndex]) pick(filtered[selectedIndex]);
    } else if (ev.key === 'Escape') {
      appState.paletteOpen = false;
      q = '';
      selectedIndex = 0;
    }
  }
</script>

{#if appState.paletteOpen}
<div class="overlay" onclick={() => (appState.paletteOpen = false)} role="presentation">
  <div class="box" onclick={(e) => e.stopPropagation()} role="dialog" aria-label="Command palette">
    <input
      bind:value={q}
      placeholder="Type a command…"
      autofocus
      onkeydown={onKey}
      aria-autocomplete="list"
      aria-controls="palette-list"
      aria-activedescendant={filtered[selectedIndex] ? `cmd-${filtered[selectedIndex].id}` : undefined}
    />
    <ul id="palette-list" role="listbox">
      {#each filtered as cmd, i}
        <li
          id={`cmd-${cmd.id}`}
          role="option"
          aria-selected={i === selectedIndex}
          class:selected={i === selectedIndex}
          onclick={() => pick(cmd)}
          onkeydown={(e) => { if (e.key === 'Enter') pick(cmd); }}
          tabindex="0"
        >
          {cmd.label}
        </li>
      {:else}
        <li class="empty">No matching commands</li>
      {/each}
    </ul>
  </div>
</div>
{/if}

<style>
  .overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.55);
    display: grid;
    place-items: start center;
    padding-top: 12vh;
    z-index: 50;
    animation: finn-fade-in 200ms var(--spring-panel) both;
  }
  .box {
    width: min(520px, 92vw);
    background: var(--glass);
    border: 1px solid var(--glass-border);
    backdrop-filter: blur(28px) saturate(1.3);
    -webkit-backdrop-filter: blur(28px) saturate(1.3);
    border-radius: var(--radius-panel);
    box-shadow: var(--shadow-panel);
    padding: 0.7rem;
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    overflow: hidden;
  }
  input {
    width: 100%;
    margin-bottom: 0.3rem;
  }
  ul {
    list-style: none;
    margin: 0;
    padding: 0;
    max-height: 320px;
    overflow-y: auto;
  }
  li {
    padding: 0.45rem 0.6rem;
    border-radius: var(--radius-control);
    cursor: pointer;
    color: var(--text-secondary);
    font-size: 13px;
    transition: background 120ms var(--spring-control), color 100ms var(--spring-control);
  }
  li:hover, li.selected {
    background: rgba(255,255,255,0.06);
    color: var(--text-primary);
  }
  .empty {
    color: var(--text-tertiary);
    cursor: default;
  }
  @keyframes finn-fade-in {
    from { opacity: 0; transform: translateY(4px); }
    to { opacity: 1; transform: translateY(0); }
  }
</style>
