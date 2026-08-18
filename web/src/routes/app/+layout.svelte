<script>
  import { onMount } from 'svelte';
  import { appState } from '$lib/stores.svelte';
  import Sidebar from '$lib/components/Sidebar.svelte';
  import RightSidebar from '$lib/components/RightSidebar.svelte';
  import CommandPalette from '$lib/components/CommandPalette.svelte';
  import WindowChrome from '$lib/components/WindowChrome.svelte';
  import Dock from '$lib/components/Dock.svelte';
  import SettingsPanel from '$lib/components/SettingsPanel.svelte';
  import DitherOverlay from '$lib/components/DitherOverlay.svelte';
  import LiquidMetal from '$lib/components/LiquidMetal.svelte';

  let { children } = $props();
  let isTauri = $state(false);
  let isMobile = $state(false);

  function onKey(ev) {
    const mod = ev.metaKey || ev.ctrlKey;
    if (mod && ev.key.toLowerCase() === 'k') {
      ev.preventDefault();
      appState.paletteOpen = true;
    }
    if (mod && ev.key.toLowerCase() === 'b') {
      ev.preventDefault();
      appState.toggleLeft();
    }
    if (mod && ev.key.toLowerCase() === 'shift' && ev.key.toLowerCase() === 'b') {
      // Cmd+Shift+B toggles right sidebar
      ev.preventDefault();
      appState.toggleRight();
    }
    if (mod && ev.key.toLowerCase() === 'y') {
      ev.preventDefault();
      appState.toggleYolo();
    }
    if (mod && ev.key.toLowerCase() === 'j') {
      ev.preventDefault();
      appState.toggleAi();
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
    if (mod && ev.key.toLowerCase() === 't') {
      ev.preventDefault();
      appState.activeView = 'terminal';
    }
    if (mod && ev.key.toLowerCase() === 'e') {
      ev.preventDefault();
      appState.activeView = 'editor';
    }
    if (ev.key === 'Escape') {
      appState.paletteOpen = false;
      appState.settingsOpen = false;
      if (appState.aiStripOpen && !appState.aiStripPinned) appState.aiStripOpen = false;
    }
  }

  function checkViewport() {
    isMobile = window.innerWidth <= 1024;
    if (isMobile) {
      appState.leftSidebarOpen = false;
      appState.rightSidebarOpen = false;
    }
  }

  onMount(() => {
    isTauri = Boolean(window.__TAURI_INTERNALS__);
    checkViewport();
    window.addEventListener('resize', checkViewport);
    document.documentElement.classList.toggle('scanlines', appState.scanlines);
    appState.refresh();
    window.addEventListener('keydown', onKey);
    const timer = setInterval(() => appState.ping(), 8000);
    return () => {
      window.removeEventListener('resize', checkViewport);
      window.removeEventListener('keydown', onKey);
      clearInterval(timer);
    };
  });

  $effect(() => {
    appState.scanlines;
    document.documentElement.classList.toggle('scanlines', appState.scanlines);
  });
</script>

<div class="app-frame">
  <!-- Titlebar with liquid metal -->
  <div class="titlebar">
    <div class="titlebar-metal">
      <LiquidMetal intensity={0.22} speed={0.5} interactive={false} />
    </div>
    <WindowChrome {isTauri} />
    <div class="titlebar-context">
      <span class="engagement-name">{appState.engagement}</span>
      {#if appState.activeTarget}
        <span class="target-pill">
          <span class="target-dot"></span>
          {appState.activeTarget.host}
        </span>
      {/if}
      <span class="safety-indicator" class:yolo={appState.yolo}>
        {appState.yolo ? 'YOLO' : 'SAFE'}
      </span>
    </div>
  </div>

  <!-- Main 3-pane workspace -->
  <div class="workspace"
    class:left-open={appState.leftSidebarOpen}
    class:right-open={appState.rightSidebarOpen}
    class:has-dock={!isMobile}
  >
    <!-- Left sidebar -->
    <Sidebar />

    <!-- Center: primary work surface -->
    <main class="main" role="main" aria-label="Finn Pentest Harness">
      {#if !appState.connected}
        <div class="banner" role="alert">
          Backend offline. Start it with <code class="mono">finn api</code> then refresh.
        </div>
      {/if}
      {@render children()}
    </main>

    <!-- Right sidebar -->
    <RightSidebar />
  </div>

  <!-- Status bar / Dock -->
  {#if !isMobile}
    <Dock />
  {/if}

  <!-- Overlays -->
  <CommandPalette />
  <SettingsPanel bind:open={appState.settingsOpen} />
  <DitherOverlay type="noise" intensity={0.018} animate={true} />
</div>

<style>
  .app-frame {
    min-height: 100vh;
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
    background: var(--abyss);
    overflow: hidden;
    position: relative;
  }

  .titlebar {
    position: relative;
    height: var(--titlebar-height);
    flex-shrink: 0;
    display: flex;
    align-items: center;
    z-index: 100;
    overflow: hidden;
    border-bottom: 1px solid var(--glass-border);
  }

  .titlebar-metal {
    position: absolute;
    inset: 0;
    z-index: -1;
    opacity: 0.85;
  }

  .titlebar-context {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-left: auto;
    margin-right: 16px;
    font-family: var(--font-sans);
    font-size: 12px;
    color: var(--text-dim);
    z-index: 2;
  }

  .engagement-name {
    font-weight: 500;
    color: var(--text);
  }

  .target-pill {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 2px 8px;
    border-radius: 6px;
    background: var(--glass-2);
    border: 1px solid var(--glass-border);
    font-family: var(--font-mono);
    font-size: 11px;
  }

  .target-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--green);
    box-shadow: 0 0 6px var(--green-glow);
  }

  .safety-indicator {
    padding: 2px 8px;
    border-radius: 4px;
    background: var(--green-soft);
    color: var(--green);
    font-weight: 600;
    font-size: 10px;
    letter-spacing: 0.05em;
  }

  .safety-indicator.yolo {
    background: var(--danger-soft);
    color: var(--danger);
  }

  .workspace {
    flex: 1;
    min-height: 0;
    display: grid;
    grid-template-columns: 0px 1fr 0px;
    grid-template-rows: 1fr;
    transition: grid-template-columns 380ms var(--spring-layout);
    position: relative;
    overflow: hidden;
  }

  .workspace.left-open {
    grid-template-columns: var(--sidebar-width) 1fr 0px;
  }

  .workspace.right-open {
    grid-template-columns: 0px 1fr var(--rightbar-width);
  }

  .workspace.left-open.right-open {
    grid-template-columns: var(--sidebar-width) 1fr var(--rightbar-width);
  }

  .workspace.has-dock .main {
    padding-bottom: 72px;
  }

  .main {
    grid-column: 2;
    min-width: 0;
    min-height: 0;
    display: flex;
    flex-direction: column;
    position: relative;
    overflow: hidden;
    background: var(--abyss);
  }

  .banner {
    background: rgba(255, 45, 85, 0.12);
    color: #ffd0d0;
    padding: 0.5rem 1rem;
    font-size: 0.8rem;
    border-bottom: 1px solid rgba(255, 45, 85, 0.2);
    flex-shrink: 0;
    font-family: var(--font-mono);
  }

  @media (max-width: 1024px) {
    .workspace,
    .workspace.left-open,
    .workspace.right-open,
    .workspace.left-open.right-open {
      grid-template-columns: 0px 1fr 0px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .workspace {
      transition: none;
    }
  }
</style>
