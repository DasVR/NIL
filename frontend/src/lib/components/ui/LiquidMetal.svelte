<script lang="ts">
  import { onMount } from 'svelte';
  import { agentRun } from '$lib/agent/run.svelte.ts';

  interface Props {
    paused?: boolean;
  }

  let { paused = false }: Props = $props();

  let canvas: HTMLCanvasElement;
  let animationId = 0;
  let last = 0;
  let reducedMotion = false;
  let hidden = false;

  const FPS = 30;
  const FRAME = 1000 / FPS;

  onMount(() => {
    if (!canvas) return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotion = mediaQuery.matches;
    const onReduce = (e: MediaQueryListEvent) => {
      reducedMotion = e.matches;
      if (reducedMotion) {
        cancelAnimationFrame(animationId);
        drawStatic();
      }
    };
    mediaQuery.addEventListener('change', onReduce);

    const onVis = () => {
      hidden = document.hidden || !document.hasFocus();
    };
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('blur', onVis);
    window.addEventListener('focus', onVis);

    drawStatic();
    if (!reducedMotion) loop(performance.now());

    return () => {
      mediaQuery.removeEventListener('change', onReduce);
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('blur', onVis);
      window.removeEventListener('focus', onVis);
      cancelAnimationFrame(animationId);
    };
  });

  function loop(now: number) {
    animationId = requestAnimationFrame(loop);
    if (paused || hidden || reducedMotion || agentRun.running) return;
    if (now - last < FRAME) return;
    last = now;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    draw(ctx, now / 1000);
  }

  function drawStatic() {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = Math.min(devicePixelRatio || 1, 2) * 0.75;
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const g = ctx.createLinearGradient(0, 0, w, 0);
    g.addColorStop(0, 'rgba(232,230,227,0.06)');
    g.addColorStop(1, 'rgba(232,230,227,0.02)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }

  function draw(ctx: CanvasRenderingContext2D, t: number) {
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    ctx.clearRect(0, 0, w, h);
    for (let x = 0; x < w; x += 8) {
      const v = (Math.sin(x * 0.02 + t * 0.4) + 1) * 0.5;
      ctx.fillStyle = `rgba(232,230,227,${0.04 + 0.06 * v})`;
      ctx.fillRect(x, 0, 8, h);
    }
  }
</script>

<canvas class="liquid-metal-canvas" bind:this={canvas} aria-hidden="true"></canvas>

<style>
  .liquid-metal-canvas {
    display: block;
    width: 100%;
    height: 100%;
  }
</style>
