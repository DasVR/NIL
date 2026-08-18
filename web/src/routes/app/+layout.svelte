<script lang="ts">
  import { onMount } from 'svelte';
  import { appState } from '$lib/stores.svelte';
  import { resolveShortcut, isTypingTarget } from '$lib/keymap';
  import Sidebar from '$lib/components/Sidebar.svelte';
  import Inspector from '$lib/components/Inspector.svelte';
  import CommandPalette from '$lib/components/CommandPalette.svelte';
  import WindowChrome from '$lib/components/WindowChrome.svelte';
  import StatusBar from '$lib/components/StatusBar.svelte';
  import SettingsPanel from '$lib/components/SettingsPanel.svelte';
  import NewSpaceSheet from '$lib/components/NewSpaceSheet.svelte';
  import HudToast from '$lib/components/HudToast.svelte';

  let { children } = $props();
  let isTauri = $state(false);
  let isMac = $state(false);
  let isMobile = $state(false);

  function peel() {
    if (appState.paletteOpen) {
      appState.paletteOpen = false;
      appState.paletteMode = 'root';
      return;
    }
    if (appState.settingsOpen) {
      appState.settingsOpen = false;
      return;
    }
    if (appState.newSpaceOpen) {
      appState.newSpaceOpen = false;
      return;
    }
    if (appState.pluginMenu) {
      appState.pluginMenu = '';
      return;
    }
    const active = document.activeElement;
    const typing = isTypingTarget(active);
    const inFinn = active instanceof HTMLElement && active.dataset.composer === 'finn';
    if ((inFinn || !typing) && !appState.aiStripPinned) {
      appState.hideFinn();
    }
  }

  function onKey(ev: KeyboardEvent) {
    const hit = resolveShortcut(ev);
    if (!hit) return;

    const overlay =
      appState.paletteOpen || appState.settingsOpen || appState.newSpaceOpen;
    if (overlay && hit.name !== 'escape' && hit.name !== 'palette') return;
    if (appState.paletteOpen && hit.name === 'palette') {
      ev.preventDefault();
      appState.paletteOpen = false;
      return;
    }

    const typing = isTypingTarget(ev.target);
    if (typing && (hit.name === 'focusLeft' || hit.name === 'focusCenter' || hit.name === 'focusRight')) {
      return;
    }
    const inFinn =
      ev.target instanceof HTMLElement && ev.target.dataset.composer === 'finn';
    if (inFinn && (hit.name === 'approve' || hit.name === 'reject')) {
      return;
    }

    ev.preventDefault();
    switch (hit.name) {
      case 'palette':
        appState.paletteMode = 'root';
        appState.paletteOpen = true;
        break;
      case 'gotoTarget':
        appState.paletteMode = 'goto';
        appState.paletteOpen = true;
        break;
      case 'toggleAi':
        appState.toggleAi();
        break;
      case 'pinAi':
        appState.pinAi();
        break;
      case 'settings':
        appState.settingsOpen = !appState.settingsOpen;
        break;
      case 'toggleLeft':
        appState.toggleLeft();
        break;
      case 'toggleRight':
        appState.toggleRight();
        break;
      case 'toggleYolo':
        void appState.toggleYolo();
        break;
      case 'newSpace':
        appState.newSpaceOpen = true;
        break;
      case 'focusTerminal':
        appState.setView('terminal');
        break;
      case 'artifact':
        appState.setView('artifact');
        break;
      case 'split':
        appState.setView('split');
        break;
      case 'focusLeft':
        appState.focusPane = 'left';
        appState.leftSidebarOpen = true;
        break;
      case 'focusCenter':
        appState.focusPane = 'center';
        break;
      case 'focusRight':
        appState.focusPane = 'right';
        appState.rightSidebarOpen = true;
        break;
      case 'approve':
        void appState.approve(appState.topPendingId());
        break;
      case 'reject':
        void appState.reject(appState.topPendingId());
        break;
      case 'save':
        void appState.saveArtifact();
        break;
      case 'escape':
        peel();
        break;
      case 'spaceSwitch': {
        const space = appState.engagements[hit.spaceIndex ?? 0];
        if (space) void appState.select(space.name);
        break;
      }
      default: {
        const _never: never = hit.name;
        void _never;
      }
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
    isMac = /Mac|iPhone|iPad/.test(navigator.platform) || navigator.userAgent.includes('Mac');
    appState.loadPrefs();
    appState.applyLayout(appState.engagement);
    checkViewport();
    window.addEventListener('resize', checkViewport);
    void appState.refresh();
    window.addEventListener('keydown', onKey);
    const timer = setInterval(() => void appState.ping(), 8000);
    return () => {
      window.removeEventListener('resize', checkViewport);
      window.removeEventListener('keydown', onKey);
      clearInterval(timer);
    };
  });

  $effect(() => {
    appState.prefs.grain;
    appState.prefs.scanlines;
    appState.prefs.theme;
    appState.prefs.accent;
    appState.prefs.reducedMotion;
    appState.applyAppearance();
  });
</script>

<div class="app-frame workstation">
  <WindowChrome {isTauri} {isMac} />

  <div
    class="workspace"
    class:left-open={appState.leftSidebarOpen}
    class:right-open={appState.rightSidebarOpen}
  >
    <Sidebar />
    <main class="main" aria-label="Finn workstation" class:focus={appState.focusPane === 'center'}>
      {#if !appState.connected}
        <div class="banner" role="alert">
          Backend offline. Start it with <code class="mono">finn api</code> then refresh.
        </div>
      {/if}
      {@render children()}
    </main>
    <Inspector />
  </div>

  {#if !isMobile}
    <StatusBar />
  {/if}

  {#if appState.paletteOpen}
    <CommandPalette />
  {/if}
  {#if appState.settingsOpen}
    <SettingsPanel />
  {/if}
  {#if appState.newSpaceOpen}
    <NewSpaceSheet />
  {/if}
  <HudToast />
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

  .workspace {
    flex: 1;
    min-height: 0;
    display: grid;
    grid-template-columns: 0px 1fr 0px;
    transition: grid-template-columns 320ms var(--spring-layout);
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
  .main.focus {
    box-shadow: inset 0 0 0 1px var(--green-soft);
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
    .workspace { transition: none; }
  }
</style>
