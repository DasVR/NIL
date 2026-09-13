<script lang="ts">
  import { onMount } from 'svelte';
  import { paintWaterfall, tokenColor } from '$lib/motion/dither';

  let canvas: HTMLCanvasElement | undefined = $state();

  function draw() {
    if (!canvas) return;
    paintWaterfall(
      canvas,
      tokenColor('--brand-ember-700', '#7a3320'),
      tokenColor('--nil-void', '#0a0908'),
    );
  }

  onMount(() => {
    draw();
    const ro = new ResizeObserver(draw);
    if (canvas) ro.observe(canvas);
    return () => ro.disconnect();
  });
</script>

<canvas class="fall" bind:this={canvas} aria-hidden="true"></canvas>

<style>
  .fall {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }
</style>
