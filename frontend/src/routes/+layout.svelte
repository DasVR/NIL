<script lang="ts">
  import '$lib/styles/tokens.css';
  import '$lib/styles/motion.css';
  import '../app.css';
  import { onMount, type Snippet } from 'svelte';
  import Titlebar from '$lib/components/shell/Titlebar.svelte';
  import Sidebar from '$lib/components/shell/Sidebar.svelte';
  import MainWorkspace from '$lib/components/shell/MainWorkspace.svelte';
  import RightSidebar from '$lib/components/shell/RightSidebar.svelte';
  import StreamComposer from '$lib/components/shell/StreamComposer.svelte';
  import StatusBar from '$lib/components/shell/StatusBar.svelte';
  import CommandPalette from '$lib/components/shell/CommandPalette.svelte';
  import SettingsSheet from '$lib/components/shell/SettingsSheet.svelte';
  import GrainOverlay from '$lib/components/shell/GrainOverlay.svelte';
  import ColdOpen from '$lib/gl/ColdOpen.svelte';
  import { appState } from '$lib/stores/appState.svelte.ts';
  import { paletteStore } from '$lib/stores/paletteStore.svelte.ts';
  import { setupTauriEvents } from '$lib/tauri-events';
  import { keymap } from '$lib/keymap.svelte.ts';
  import { browser } from '$app/environment';
  import { agentRun } from '$lib/agent/run.svelte.ts';

  let { children }: { children: Snippet } = $props();

  let booted = $state(false);
  let composerInput: HTMLTextAreaElement | undefined = $state();

  onMount(() => {
    setupTauriEvents();
    keymap.init();
    keymap.setComposerFocus(() => composerInput?.focus());
  });
</script>

<svelte:window onkeydown={keymap.handleKeydown} />

<div class="app-shell" class:streaming={agentRun.running}>
  <GrainOverlay />
  <Titlebar />

  <div class="workbench">
    <Sidebar
      open={appState.sidebarOpen}
      width={appState.sidebarWidth}
      onToggle={() => appState.sidebarOpen = !appState.sidebarOpen}
      onResize={(w) => appState.sidebarWidth = w}
    />

    <main class="workspace">
      <MainWorkspace>
        {#snippet emptyState()}
          {@render children()}
        {/snippet}
      </MainWorkspace>
      <StreamComposer bind:inputEl={composerInput} />
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

{#if browser && !booted}
  <ColdOpen onbooted={() => (booted = true)} />
{/if}

<style>
  .app-shell {
    position: relative;
    width: 100vw;
    height: 100vh;
    height: 100dvh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: var(--nil-void);
    color: var(--nil-ink);
    font-family: var(--font-ui);
    border-radius: var(--r-window);
  }

  .workbench {
    flex: 1;
    display: flex;
    flex-direction: row;
    overflow: hidden;
    min-height: 0;
    padding: var(--s-2);
    gap: var(--s-2);
  }

  .workspace {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    min-width: 0;
    min-height: 0;
    gap: var(--s-2);
  }
</style>
