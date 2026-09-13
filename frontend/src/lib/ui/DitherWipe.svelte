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

  onMount(() => {
    if (!play || !canvas) return;
    const color = tokenColor('--nil-panel', '#141210');
    void playDither(canvas, { mode, color }).then(() => onDone?.());
  });
</script>

<canvas class="nil-dither wipe" bind:this={canvas} aria-hidden="true"></canvas>

<style>
  .wipe {
    width: 100%;
    height: 100%;
  }
</style>
