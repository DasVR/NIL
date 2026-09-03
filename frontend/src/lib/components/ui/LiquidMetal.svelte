<script lang="ts">
  import { onMount, onDestroy } from 'svelte';

  let canvas: HTMLCanvasElement;
  let animationId: number;
  let time = 0;
  let reducedMotion = false;

  onMount(() => {
    if (!canvas) return;
    
    // Check reduced motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotion = mediaQuery.media === 'reduce' || document.documentElement.classList.contains('reduce-motion');
    mediaQuery.addEventListener('change', handleReducedMotionChange);
    
    if (reducedMotion) {
      drawStatic();
      return;
    }

    const ctx = canvas.getContext('2d')!;
    const dpr = window.devicePixelRatio || 1;
    
    function resize() {
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      canvas.style.width = canvas.offsetWidth + 'px';
      canvas.style.height = canvas.offsetHeight + 'px';
      ctx.scale(dpr, dpr);
    }
    
    resize();
    window.addEventListener('resize', resize);
    
    function animate() {
      time += 0.016;
      draw(ctx, time);
      animationId = requestAnimationFrame(animate);
    }
    
    animate();
    
    return () => {
      window.removeEventListener('resize', resize);
      mediaQuery.removeEventListener('change', handleReducedMotionChange);
      cancelAnimationFrame(animationId);
    };
  });

  function handleReducedMotionChange(e: MediaQueryListEvent) {
    reducedMotion = e.matches;
    if (reducedMotion) {
      cancelAnimationFrame(animationId);
      drawStatic();
    } else {
      animate();
    }
  }

  function animate() {
    time += 0.016;
    if (canvas) {
      const ctx = canvas.getContext('2d')!;
      draw(ctx, time);
    }
    animationId = requestAnimationFrame(animate);
  }

  function drawStatic() {
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    
    // Static gradient
    const gradient = ctx.createLinearGradient(0, 0, w, 0);
    gradient.addColorStop(0, 'rgba(69, 42, 132, 0.4)');
    gradient.addColorStop(0.5, 'rgba(169, 177, 240, 0.2)');
    gradient.addColorStop(1, 'rgba(254, 111, 105, 0.3)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);
  }

  function draw(ctx: CanvasRenderingContext2D, t: number) {
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    ctx.clearRect(0, 0, w, h);

    // Flowing metal simulation - simplified Navier-Stokes
    const cols = Math.ceil(w / 4);
    const rows = Math.ceil(h / 4);
    
    for (let x = 0; x < w; x += 4) {
      for (let y = 0; y < h; y += 4) {
        const noise = simplexNoise(x * 0.01, y * 0.01, t * 0.5);
        const flow = Math.sin(x * 0.02 + t) * 0.5 + Math.cos(y * 0.02 + t * 0.7) * 0.5;
        const v = (noise + flow) * 0.5;
        
        // Chromatic aberration
        const r = Math.floor(69 + 100 * v + 80 * Math.sin(t + x * 0.05));
        const g = Math.floor(42 + 80 * v + 60 * Math.sin(t + y * 0.05 + 2));
        const b = Math.floor(132 + 120 * v + 100 * Math.sin(t + x * 0.03 + 4));
        const a = 0.3 + 0.2 * v;
        
        ctx.fillStyle = `rgba(${Math.min(255, r)}, ${Math.min(255, g)}, ${Math.min(255, b)}, ${a})`;
        ctx.fillRect(x, y, 4, 4);
      }
    }

    // Edge highlight
    const edgeGradient = ctx.createLinearGradient(0, 0, w, 0);
    edgeGradient.addColorStop(0, 'rgba(255,255,255,0.08)');
    edgeGradient.addColorStop(0.5, 'rgba(255,255,255,0.02)');
    edgeGradient.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = edgeGradient;
    ctx.fillRect(0, 0, w, 2);
    ctx.fillRect(0, h - 2, w, 2);
  }

  // Simple simplex noise approximation
  function simplexNoise(x: number, y: number, z: number): number {
    const n = Math.sin(x * 12.9898 + y * 78.233 + z * 43.758) * 43758.5453;
    return (n - Math.floor(n)) * 2 - 1;
  }
</script>

<canvas class="liquid-metal-canvas" bind:this={canvas} aria-hidden="true"></canvas>

<style>
  .liquid-metal-canvas {
    display: block;
    width: 100%;
    height: 100%;
    border-radius: inherit;
  }
</style>