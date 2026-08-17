<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { appState } from '$lib/stores.svelte';
  import Sidebar from '$lib/components/Sidebar.svelte';
  import StatusBar from '$lib/components/StatusBar.svelte';
  import CommandPalette from '$lib/components/CommandPalette.svelte';
  import WindowChrome from '$lib/components/WindowChrome.svelte';
  import Dock from '$lib/components/Dock.svelte';
  import SettingsPanel from '$lib/components/SettingsPanel.svelte';
  import DitherOverlay from '$lib/components/DitherOverlay.svelte';

  let { children } = $props();
  let collapsed = $state(false);
  let mobileOpen = $state(false);
  let isTauri = $state(false);
  let isMobile = $state(false);
  let touchStartX = $state(0);

  function toggleSidebar() {
    if (isMobile) {
      mobileOpen = !mobileOpen;
    } else {
      collapsed = !collapsed;
    }
  }

  function closeMobile() {
    mobileOpen = false;
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
      appState.settingsOpen = true;
    }
    if (mod && ev.key.toLowerCase() === 'n') {
      ev.preventDefault();
      const name = prompt('Engagement name?');
      if (name) appState.createEngagement(name.trim());
    }
    if (ev.key === 'Escape') {
      appState.paletteOpen = false;
      appState.settingsOpen = false;
      closeMobile();
    }
  }

  function onTouchStart(e) {
    touchStartX = e.changedTouches[0].screenX;
  }

  function onTouchEnd(e) {
    const dx = e.changedTouches[0].screenX - touchStartX;
    if (dx > 80 && touchStartX < 24) mobileOpen = true;
    if (dx < -80 && mobileOpen) mobileOpen = false;
  }

  function checkViewport() {
    isMobile = window.innerWidth <= 1024;
    if (!isMobile) mobileOpen = false;
  }

  onMount(() => {
    isTauri = Boolean(window.__TAURI_INTERNALS__);
    checkViewport();
    window.addEventListener('resize', checkViewport);
    document.documentElement.classList.toggle('scanlines', appState.scanlines);
    appState.refresh();
    window.addEventListener('keydown', onKey);
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    const timer = setInterval(() => appState.ping(), 8000);
    return () => {
      window.removeEventListener('resize', checkViewport);
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

<div class="app-frame">
  <WindowChrome {isTauri} />

  <div class="shell" class:collapsed class:has-dock={!isMobile}>
    {#if isMobile}
      <button
        type="button"
        class="mobile-menu"
        onclick={() => (mobileOpen = true)}
        aria-label="Open sidebar"
        title="Open sidebar"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>
    {/if}

    <Sidebar
      {collapsed}
      mobileOpen={mobileOpen}
      showNav={isMobile}
      onToggle={toggleSidebar}
      onMobileClose={closeMobile}
    />

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
  </div>

  {#if !isMobile}
    <Dock />
  {/if}

  <CommandPalette />
  <SettingsPanel bind:open={appState.settingsOpen} />
  <DitherOverlay type="noise" intensity={0.02} animate={true} />
</div>

<style>
  .app-frame {
    min-height: 100vh;
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
    background: var(--abyss);
    overflow: hidden;
  }

  .shell {
    flex: 1;
    min-height: 0;
    display: grid;
    grid-template-columns: var(--sidebar-width) 1fr;
    grid-template-rows: 1fr auto;
    transition: grid-template-columns 380ms var(--spring-layout);
    position: relative;
  }

  .shell.collapsed {
    grid-template-columns: 72px 1fr;
  }

  .shell.has-dock .main {
    padding-bottom: 72px;
  }

  .main {
    grid-column: 2;
    grid-row: 1;
    min-width: 0;
    min-height: 0;
    display: flex;
    flex-direction: column;
    position: relative;
    overflow: hidden;
  }

  .banner {
    background: rgba(255, 69, 58, 0.12);
    color: #ffd0d0;
    padding: 0.6rem 1rem;
    font-size: 0.85rem;
    border-bottom: 1px solid rgba(255, 69, 58, 0.2);
    flex-shrink: 0;
  }

  .mobile-menu {
    display: none;
    position: fixed;
    top: calc(var(--titlebar-height) + 8px);
    left: 8px;
    z-index: 95;
    width: 44px;
    height: 44px;
    padding: 0;
    border-radius: var(--radius-control);
    background: var(--abyss-1);
    border: 1px solid var(--glass-border);
    color: var(--text-secondary);
  }

  .mobile-menu:hover {
    color: var(--accent);
    border-color: var(--accent-20);
  }

  @media (max-width: 1024px) {
    .shell {
      grid-template-columns: 0 1fr;
    }

    .shell.collapsed {
      grid-template-columns: 0 1fr;
    }

    .mobile-menu {
      display: grid;
      place-items: center;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .shell {
      transition: none;
    }
  }
</style>
