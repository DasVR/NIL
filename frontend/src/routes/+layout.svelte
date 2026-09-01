<script lang="ts">
  import '../app.css';
  import { onMount } from 'svelte';
  import Titlebar from '$lib/components/shell/Titlebar.svelte';
  import Sidebar from '$lib/components/shell/Sidebar.svelte';
  import MainWorkspace from '$lib/components/shell/MainWorkspace.svelte';
  import RightSidebar from '$lib/components/shell/RightSidebar.svelte';
  import AIStrip from '$lib/components/shell/AIStrip.svelte';
  import StatusBar from '$lib/components/shell/StatusBar.svelte';
  import CommandPalette from '$lib/components/shell/CommandPalette.svelte';
  import SettingsSheet from '$lib/components/shell/SettingsSheet.svelte';
  import { appState } from '$lib/stores/appState';
  import { paletteStore } from '$lib/stores/paletteStore';
  import { setupTauriEvents } from '$lib/tauri-events';
  import { keymap } from '$lib/keymap';

  let { children }: { children: () => any } = $props();

  onMount(() => {
    setupTauriEvents();
    keymap.init();
  });
</script>

<svelte:window onkeydown={keymap.handleKeydown} />

<div class="app-shell">
  <Titlebar />

  <div class="workbench">
    <Sidebar
      open={appState.sidebarOpen}
      width={appState.sidebarWidth}
      onToggle={() => appState.sidebarOpen = !appState.sidebarOpen}
      onResize={(w) => appState.sidebarWidth = w}
    />

    <main class="workspace">
      {@render children()}
      <MainWorkspace />

      <AIStrip state={appState.aiStripState} onStateChange={(s) => appState.aiStripState = s} />
    </main>

    <RightSidebar
      open={appState.rightSidebarOpen}
      width={appState.rightSidebarWidth}
      onToggle={() => appState.rightSidebarOpen = !appState.rightSidebarOpen}
      onResize={(w) => appState.rightSidebarWidth = w}
    />
  </div>

  <StatusBar />

  <CommandPalette open={paletteStore.open} onToggle={(o) => paletteStore.open = o} />
  <SettingsSheet open={appState.settingsOpen} onToggle={(o) => appState.settingsOpen = o} />
</div>

<style>
  .app-shell {
    position: relative;
    width: 100vw;
    height: 100vh;
    height: 100dvh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: var(--color-abyss-0);
    color: var(--text-primary);
    font-family: var(--font-sans);
  }

  .workbench {
    flex: 1;
    display: flex;
    flex-direction: row;
    overflow: hidden;
    min-height: 0;
  }

  .workspace {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    min-width: 0;
    min-height: 0;
  }
</style>