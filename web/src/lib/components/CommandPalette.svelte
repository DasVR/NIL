<script>
  import { goto } from '$app/navigation';
  import { appState } from '$lib/stores.svelte';

  let q = $state('');
  const commands = [
    { id: 'chat', label: 'Go to chat', run: () => goto('/app') },
    { id: 'findings', label: 'Go to findings', run: () => goto('/app/findings') },
    { id: 'notes', label: 'Go to notes', run: () => goto('/app/notes') },
    { id: 'settings', label: 'Go to settings', run: () => goto('/app/settings') },
    { id: 'yolo', label: 'Toggle YOLO', run: () => appState.toggleYolo() },
    { id: 'hunt', label: 'Mode: hunt', run: () => (appState.mode = 'hunt') },
    { id: 'chatmode', label: 'Mode: chat', run: () => (appState.mode = 'chat') },
    { id: 'code', label: 'Mode: code', run: () => (appState.mode = 'code') },
    { id: 'report', label: 'Mode: report', run: () => (appState.mode = 'report') }
  ];

  let filtered = $derived(
    commands.filter((c) => c.label.toLowerCase().includes(q.toLowerCase()))
  );

  function pick(cmd) {
    cmd.run();
    appState.paletteOpen = false;
    q = '';
  }
</script>

{#if appState.paletteOpen}
  <div class="overlay" onclick={() => (appState.paletteOpen = false)} role="presentation">
    <div class="box" onclick={(e) => e.stopPropagation()} role="dialog">
      <input bind:value={q} placeholder="Type a command…" autofocus />
      {#each filtered as cmd}
        <button onclick={() => pick(cmd)}>{cmd.label}</button>
      {/each}
    </div>
  </div>
{/if}

<style>
  .overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.55);
    display: grid;
    place-items: start center;
    padding-top: 12vh;
    z-index: 40;
  }
  .box {
    width: min(520px, 92vw);
    background: #0e0e14;
    border: 1px solid #2a2a40;
    border-radius: 10px;
    padding: 0.8rem;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }
  input { width: 100%; }
  button {
    text-align: left;
    border: none;
    color: var(--text);
  }
  button:hover { background: var(--navy); }
</style>
