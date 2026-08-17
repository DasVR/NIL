<script lang="ts">
  import { onMount, onDestroy } from 'svelte';

  let {
    type = 'noise',
    intensity = 0.025,
    size = 4,
    animate = true,
    color = '#ffffff'
  }: {
    type?: 'bayer' | 'noise' | 'scanlines' | 'grain';
    intensity?: number;
    size?: number;
    animate?: boolean;
    color?: string;
  } = $props();

  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D | null;
  let animationId: number;
  let seed: number = Math.random() * 1000;

  const BAYER_2x2 = [[0, 2], [3, 1]];
  const BAYER_4x4 = [
    [0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]
  ];
  const BAYER_8x8 = [
    [0, 32, 8, 40, 2, 34, 10, 42], [48, 16, 56, 24, 50, 18, 58, 26],
    [12, 44, 4, 36, 14, 46, 6, 38], [60, 28, 52, 20, 62, 30, 54, 22],
    [3, 35, 11, 43, 1, 33, 9, 41], [51, 19, 59, 27, 49, 17, 57, 25],
    [15, 47, 7, 39, 13, 45, 5, 37], [63, 31, 55, 23, 61, 29, 53, 21]
  ];

  function getBayerMatrix(n: number): number[][] {
    if (n <= 2) return BAYER_2x2;
    if (n <= 4) return BAYER_4x4;
    return BAYER_8x8;
  }

  function drawBayerDither() {
    if (!ctx || !canvas) return;
    const w = canvas.width;
    const h = canvas.height;
    const matrix = getBayerMatrix(size);
    const matrixSize = matrix.length;
    const threshold = intensity * (matrixSize * matrixSize);
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = color;
    for (let y = 0; y < h; y += matrixSize) {
      for (let x = 0; x < w; x += matrixSize) {
        for (let my = 0; my < matrixSize && y + my < h; my++) {
          for (let mx = 0; mx < matrixSize && x + mx < w; mx++) {
            if (matrix[my][mx] < threshold) ctx.fillRect(x + mx, y + my, 1, 1);
          }
        }
      }
    }
  }

  function drawNoise() {
    if (!ctx || !canvas) return;
    const w = canvas.width;
    const h = canvas.height;
    const imageData = ctx.createImageData(w, h);
    const data = imageData.data;
    const alpha = Math.floor(intensity * 255);
    for (let i = 0; i < data.length; i += 4) {
      const val = Math.random() < intensity ? alpha : 0;
      data[i] = 255;
      data[i + 1] = 255;
      data[i + 2] = 255;
      data[i + 3] = val;
    }
    ctx.putImageData(imageData, 0, 0);
  }

  function drawScanlines() {
    if (!ctx || !canvas) return;
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = `rgba(255, 255, 255, ${intensity})`;
    for (let y = 0; y < h; y += 6) ctx.fillRect(0, y, w, 2);
  }

  function drawGrain() {
    if (!ctx || !canvas) return;
    const w = canvas.width;
    const h = canvas.height;
    const imageData = ctx.createImageData(w, h);
    const data = imageData.data;
    const timeOffset = animate ? (Date.now() / 1000 + seed) % 1000 : seed;
    for (let i = 0; i < data.length; i += 4) {
      const x = (i / 4) % w;
      const y = Math.floor(i / 4 / w);
      const noise = Math.sin(x * 12.9898 + y * 78.233 + timeOffset) * 43758.5453;
      const val = ((noise - Math.floor(noise)) - 0.5) * intensity * 255;
      data[i] = 128 + val;
      data[i + 1] = 128 + val;
      data[i + 2] = 128 + val;
      data[i + 3] = Math.abs(val) * 0.5;
    }
    ctx.putImageData(imageData, 0, 0);
  }

  function draw() {
    switch (type) {
      case 'bayer': drawBayerDither(); break;
      case 'scanlines': drawScanlines(); break;
      case 'grain': drawGrain(); break;
      default: drawNoise(); break;
    }
  }

  function animateFrame() {
    if (animate && (type === 'noise' || type === 'grain')) {
      draw();
      animationId = requestAnimationFrame(animateFrame);
    }
  }

  function resize() {
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio, 2);
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    draw();
  }

  $effect(() => {
    intensity;
    type;
    if (canvas && ctx) draw();
  });

  onMount(() => {
    ctx = canvas.getContext('2d');
    if (!ctx) return;
    resize();
    if (animate && (type === 'noise' || type === 'grain')) animateFrame();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  });

  onDestroy(() => {
    if (animationId) cancelAnimationFrame(animationId);
  });
</script>

<canvas
  bind:this={canvas}
  class="dither-overlay"
  style="--dither-intensity: {intensity};"
  aria-hidden="true"
></canvas>

<style>
  .dither-overlay {
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100%;
    z-index: 9999;
    pointer-events: none;
    mix-blend-mode: overlay;
    opacity: var(--dither-intensity, 0.025);
  }

  @media (prefers-reduced-motion: reduce) {
    .dither-overlay {
      display: none;
    }
  }
</style>
