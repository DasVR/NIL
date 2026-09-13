<script lang="ts">
  import { onMount } from 'svelte';
  import { playDither, tokenColor, type DitherMode } from '$lib/motion/dither';

  interface Props {
    play?: boolean;
    mode?: DitherMode;
    onDone?: () => void;
  }

  let { play = true, mode = 'dissolve', onDone }: Props = $props();
  let canvas: HTMLCanvasElement | undefined = $state();
  let done = $state(false);

  onMount(() => {
    if (!play || !canvas) return;
    const color = tokenColor('--nil-panel', '#141210');
    void playDither(canvas, { mode, color }).finally(() => {
      done = true;
      onDone?.();
    });
  });
</script>

{#if !done}
  <canvas class="nil-dither wipe" bind:this={canvas} aria-hidden="true"></canvas>
{/if}

<style>
  .wipe {
    width: 100%;
    height: 100%;
  }
</style>
