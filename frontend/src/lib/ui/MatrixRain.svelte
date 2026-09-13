<script lang="ts">
  import { onMount } from 'svelte';
  import { tokenColor } from '$lib/motion/dither';

  interface Props {
    faint?: boolean;
  }

  let { faint = false }: Props = $props();
  let canvas: HTMLCanvasElement | undefined = $state();
  let raf = 0;

  onMount(() => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!canvas || reduced) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const glyphs = '01アイウエオカキクケコ¦:.=*+<>';
    let cols = 0;
    let drops: number[] = [];
    const speed = faint ? 0.35 : 0.9;

    function fit() {
      if (!canvas) return;
      const r = canvas.getBoundingClientRect();
      const w = Math.max(1, Math.round(r.width));
      const h = Math.max(1, Math.round(r.height));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        cols = Math.floor(w / 10);
        drops = Array.from({ length: cols }, () => Math.random() * (h / 10));
      }
    }

    const ink = tokenColor('--nil-ink-4', '#4a443c');
    const tick = () => {
      if (!canvas || !ctx) return;
      fit();
      ctx.globalAlpha = faint ? 0.12 : 0.08;
      ctx.fillStyle = tokenColor('--nil-void', '#0a0908');
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = faint ? 0.35 : 0.55;
      ctx.fillStyle = ink;
      ctx.font = '10px "JetBrains Mono", monospace';
      for (let i = 0; i < drops.length; i++) {
        const ch = glyphs[(Math.random() * glyphs.length) | 0];
        ctx.fillText(ch, i * 10, drops[i] * 10);
        if (drops[i] * 10 > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i] += speed;
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  });
</script>

<canvas class="rain" class:faint bind:this={canvas} aria-hidden="true"></canvas>

<style>
  .rain {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    opacity: 0.55;
  }
  .rain.faint { opacity: 0.28; }
</style>
