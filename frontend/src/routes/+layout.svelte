<script lang="ts">
  import '../app.css';
  import GrainOverlay from '$lib/components/shell/GrainOverlay.svelte';
  import StatusBar from '$lib/components/shell/StatusBar.svelte';
  import Dock from '$lib/components/shell/Dock.svelte';
  import Sidebar from '$lib/components/shell/Sidebar.svelte';
  import RightSidebar from '$lib/components/shell/RightSidebar.svelte';
  import AiStrip from '$lib/components/shell/AiStrip.svelte';
  import CommandPalette from '$lib/components/shell/CommandPalette.svelte';

  let { children }: { children: () => any } = $props();

  const dockItems = [
    { id: 'home', label: 'Home', icon: 'ph:house-bold', href: '/', active: true },
    { id: 'work', label: 'Work', icon: 'ph:briefcase-bold', href: '/work' },
    { id: 'lab', label: 'Lab', icon: 'ph:flask-bold', href: '/lab' },
    { id: 'about', label: 'About', icon: 'ph:user-bold', href: '/about' },
  ];

  const engagements = [
    { id: 'dev-local', name: 'dev.local', status: 'active' as const, targets: 3 },
    { id: 'clearwater-hvac', name: 'clearwater-hvac', status: 'active' as const, targets: 12 },
    { id: 'stpete-chiro', name: 'stpete-chiro', status: 'paused' as const, targets: 7 },
  ];

  const commands = [
    { id: 'new-engagement', label: 'New engagement', icon: 'ph:plus-bold', action: () => {} },
    { id: 'open-godmode', label: 'Open godmode', icon: 'ph:sparkle-bold', action: () => {} },
    { id: 'toggle-approval', label: 'Toggle approval gate', icon: 'ph:shield-check-bold', action: () => {} },
    { id: 'toggle-strip', label: 'Toggle AI strip (⌘J)', icon: 'ph:chat-circle-dots-bold', action: () => (aiOpen = !aiOpen) },
    { id: 'run-scan', label: 'Run target scan', icon: 'ph:radar-bold', action: () => {} },
  ];

  let aiOpen = $state(false);
  let aiState = $state<'idle' | 'thinking' | 'streaming' | 'done'>('idle');
  let paletteOpen = $state(false);
  let sidebarCollapsed = $state(false);

  function onGlobalKey(e: KeyboardEvent) {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      paletteOpen = !paletteOpen;
    } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'j') {
      e.preventDefault();
      aiOpen = !aiOpen;
    }
  }
</script>

<svelte:window onkeydown={onGlobalKey} />

<div class="app-shell">
  <GrainOverlay />

  <div class="workbench">
    <Sidebar
      engagements={engagements}
      activeId="dev-local"
      collapsed={sidebarCollapsed}
      onToggleCollapse={() => (sidebarCollapsed = !sidebarCollapsed)}
    />

    <main class="workspace">
      <div class="workspace__center">
        {@render children()}
      </div>
      <AiStrip
        open={aiOpen}
        state={aiState}
        onToggle={() => (aiOpen = !aiOpen)}
      />
    </main>

    <RightSidebar />
  </div>

  <CommandPalette open={paletteOpen} commands={commands} onClose={() => (paletteOpen = false)} />
  <Dock items={dockItems} />
  <StatusBar />
</div>

<style>
  .app-shell {
    position: relative;
    width: 100vw;
    height: 100vh;
    height: 100dvh;
    display: flex;
    flex-direction: column;
    background: var(--surface-base);
    overflow: hidden;
  }

  .workbench {
    flex: 1;
    min-height: 0;
    display: flex;
    overflow: hidden;
  }

  .workspace {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    min-height: 0;
    background: var(--surface-0);
  }

  .workspace__center {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative;
  }
</style>
