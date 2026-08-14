<script>
  import { onMount } from 'svelte';
  import { appState } from '$lib/stores.svelte';
  import Sidebar from '$lib/components/Sidebar.svelte';
  import StatusBar from '$lib/components/StatusBar.svelte';
  import CommandPalette from '$lib/components/CommandPalette.svelte';

  let { children } = $props();

  onMount(() => {
    const apply = () => document.documentElement.classList.toggle('scanlines', appState.scanlines);
    apply();
    appState.refresh();
    const onKey = (ev) => {
      if ((ev.metaKey || ev.ctrlKey) && ev.key.toLowerCase() === 'k') {
        ev.preventDefault();
        appState.paletteOpen = true;
      }
      if ((ev.metaKey || ev.ctrlKey) && ev.key.toLowerCase() === 'y') {
        ev.preventDefault();
        appState.toggleYolo();
      }
    };
    window.addEventListener('keydown', onKey);
    const timer = setInterval(() => appState.ping(), 8000);
    return () => {
      window.removeEventListener('keydown', onKey);
      clearInterval(timer);
    };
  });
</script>

<div class="shell">
  <Sidebar />
  <div class="main">
    {#if !appState.connected}
      <div class="banner">
        Backend offline. Start it with <code>finn api</code> then refresh.
        Default: http://127.0.0.1:8766 — configure in Settings.
      </div>
    {/if}
    {@render children()}
  </div>
  <StatusBar />
  <CommandPalette />
</div>

<style>
  .shell {
    min-height: 100vh;
    display: grid;
    grid-template-columns: 220px 1fr;
    grid-template-rows: 1fr auto;
  }
  .main {
    grid-column: 2;
    grid-row: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
  }
  .banner {
    background: #3a1020;
    color: #ffd0d8;
    padding: 0.6rem 1rem;
    font-size: 0.9rem;
  }
</style>
