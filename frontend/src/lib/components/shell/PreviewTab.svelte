<script lang="ts">
  import { onMount } from 'svelte';

  import type { Tab } from '$lib/stores/tabsStore';

  let { tab }: { tab: Tab } = $props();

  let container: HTMLDivElement;
  let iframe: HTMLIFrameElement;

  onMount(() => {
    if (!container) return;
    iframe = document.createElement('iframe');
    iframe.src = 'about:blank';
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    iframe.style.background = 'var(--nil-void)';
    container.appendChild(iframe);

    return () => {
      iframe?.remove();
    };
  });
</script>

<div class="preview-tab" bind:this={container}></div>

<style>
  .preview-tab {
    width: 100%;
    height: 100%;
    background: var(--nil-void);
    overflow: hidden;
  }
</style>