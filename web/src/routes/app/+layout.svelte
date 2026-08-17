<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { appState } from '$lib/stores.svelte';
  import Sidebar from '$lib/components/Sidebar.svelte';
  import StatusBar from '$lib/components/StatusBar.svelte';
  import CommandPalette from '$lib/components/CommandPalette.svelte';
  import DitherOverlay from '$lib/components/DitherOverlay.svelte';

  let { children } = $props();
  let collapsed = $state(false);
  let touchStartX = $state(0);

  function toggleSidebar() {
    collapsed = !collapsed;
  }

  function newChat() {
    appState.messages = [];
    appState.sessionId = '';
    goto('/app');
  }

  function onKey(ev) {
    const mod = ev.metaKey || ev.ctrlKey;
    if (mod && ev.key.toLowerCase() === 'k') {
      ev.preventDefault();
      appState.paletteOpen = true;
    }
    if (mod && ev.key.toLowerCase() === 'b') {
      ev.preventDefault();
      toggleSidebar();
    }
    if (mod && ev.key.toLowerCase() === 'y') {
      ev.preventDefault();
      appState.toggleYolo();
    }
    if (mod && ev.key.toLowerCase() === 'j') {
      ev.preventDefault();
      newChat();
    }
    if (mod && ev.key.toLowerCase() === ',') {
      ev.preventDefault();
      goto('/app/settings');
    }
    if (mod && ev.key.toLowerCase() === 'n') {
      ev.preventDefault();
      const name = prompt('Engagement name?');
      if (name) appState.createEngagement(name.trim());
    }
    if (ev.key === 'Escape') {
      appState.paletteOpen = false;
    }
  }

  function onTouchStart(e) {
    touchStartX = e.changedTouches[0].screenX;
  }

  function onTouchEnd(e) {
    const dx = e.changedTouches[0].screenX - touchStartX;
    if (dx > 80 && touchStartX < 24) collapsed = false;
    if (dx < -80 && !collapsed) collapsed = true;
  }

  onMount(() => {
    const apply = () => document.documentElement.classList.toggle('scanlines', appState.scanlines);
    apply();
    appState.refresh();
    window.addEventListener('keydown', onKey);
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    const timer = setInterval(() => appState.ping(), 8000);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onTouchEnd);
      clearInterval(timer);
    };
  });

  $effect(() => {
    appState.scanlines;
    document.documentElement.classList.toggle('scanlines', appState.scanlines);
  });
</script>

<div class="shell" class:collapsed>
  <Sidebar {collapsed} onToggle={toggleSidebar} />
  <div class="main" role="main" aria-label="Finn Pentest Harness">
    {#if !appState.connected}
      <div class="banner" role="alert">
        Backend offline. Start it with <code>finn api</code> then refresh.
        Default: http://127.0.0.1:8766 — configure in Settings.
      </div>
    {/if}
    {@render children()}
  </div>
  <StatusBar />
  <CommandPalette />
  <DitherOverlay type="noise" intensity={0.03} animate={true} />
</div>

<style>
  .shell {
    min-height: 100vh;
    min-height: 100dvh;
    display: grid;
    grid-template-columns: var(--sidebar-width) 1fr;
    grid-template-rows: 1fr auto;
    transition: grid-template-columns 380ms var(--spring-layout);
    background: var(--abyss);
  }
  .shell.collapsed {
    grid-template-columns: 72px 1fr;
  }
  .main {
    grid-column: 2;
    grid-row: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    position: relative;
  }
  .banner {
    background: rgba(255, 69, 58, 0.12);
    color: #ffd0d0;
    padding: 0.6rem 1rem;
    font-size: 0.85rem;
    border-bottom: 1px solid rgba(255, 69, 58, 0.2);
  }

  @media (max-width: 768px) {
    .shell {
      grid-template-columns: 0 1fr;
    }
    .shell.collapsed {
      grid-template-columns: 0 1fr;
    }
  }
</style>
