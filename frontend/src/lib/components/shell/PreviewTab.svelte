<script lang="ts">
  import { onMount } from 'svelte';

  let container: HTMLDivElement;
  let iframe: HTMLIFrameElement;

  onMount(() => {
    if (!container) return;
    iframe = document.createElement('iframe');
    iframe.src = 'about:blank';
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    iframe.style.background = 'var(--color-abyss-0)';
    container.appendChild(iframe);

    return () => {
      iframe?.remove();
    };
  });

  function loadPreview(url: string) {
    if (iframe) iframe.src = url;
  }
</script>

<div class="preview-tab" bind:this={container} />

<style>
  .preview-tab {
    width: 100%;
    height: 100%;
    background: var(--color-abyss-0);
    overflow: hidden;
  }
</style>