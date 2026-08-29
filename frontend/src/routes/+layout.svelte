<script lang="ts">
  import '../app.css';
  import GrainOverlay from '$lib/components/shell/GrainOverlay.svelte';
  import StatusBar from '$lib/components/shell/StatusBar.svelte';
  import Dock from '$lib/components/shell/Dock.svelte';

  let { children }: { children: () => any } = $props();

  const dockItems = [
    { id: 'home', label: 'Home', icon: 'lucide:home', href: '/', active: true },
    { id: 'work', label: 'Work', icon: 'lucide:briefcase', href: '/work' },
    { id: 'lab', label: 'Lab', icon: 'lucide:flask-conical', href: '/lab' },
    { id: 'about', label: 'About', icon: 'lucide:user', href: '/about' },
  ];
</script>

<div class="app-shell">
  <GrainOverlay />

  <main class="workspace">
    {@render children()}
  </main>

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

  .workspace {
    position: relative;
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }
</style>
