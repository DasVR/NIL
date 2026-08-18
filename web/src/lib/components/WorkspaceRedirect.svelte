<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { appState } from '$lib/stores.svelte';
  import type { InspectorTab } from '$lib/types';

  let {
    tab,
    palette = false,
    settings = false,
    report = false,
    space = ''
  }: {
    tab?: InspectorTab;
    palette?: boolean;
    settings?: boolean;
    report?: boolean;
    space?: string;
  } = $props();

  onMount(() => {
    if (space) void appState.select(space);
    if (tab) {
      appState.inspectorTab = tab;
      appState.rightSidebarOpen = true;
      appState.persist();
    }
    if (palette) {
      appState.paletteMode = 'root';
      appState.paletteOpen = true;
    }
    if (settings) appState.settingsOpen = true;
    if (report) void appState.draftReport();
    void goto('/app');
  });
</script>

<p class="mono" style="padding:16px;color:var(--text-faint)">Opening workstation…</p>
