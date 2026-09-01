<script lang="ts">
  import { onMount, onDestroy } from 'svelte';

  let canvas: HTMLCanvasElement;
  let animationId: number;
  let progress = 0;
  let direction = 1;
  let reducedMotion = false;

  onMount(() => {
    if (!canvas) return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotion = mediaQuery.matches || document.documentElement.classList.contains('reduce-motion');
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
      progress += direction * 0.008;
      if (progress >= 1) {
        progress = 1;
        direction = -1;
      } else if (progress <= 0) {
        progress = 0;
        direction = 1;
      }
      draw(ctx);
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
    reducedMotion = e.matches || document.documentElement.classList.contains('reduce-motion');
    if (reducedMotion) {
      cancelAnimationFrame(animationId);
      drawStatic();
    } else {
      animate();
    }
  }

  function animate() {
    progress += direction * 0.008;
    if (progress >= 1) {
      progress = 1;
      direction = -1;
    } else if (progress <= 0) {
      progress = 0;
      direction = 1;
    }
    if (canvas) {
      const ctx = canvas.getContext('2d')!;
      draw(ctx);
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

    const gradient = ctx.createLinearGradient(0, 0, w, 0);
    gradient.addColorStop(0, 'rgba(69, 42, 132, 0.6)');
    gradient.addColorStop(0.5, 'rgba(169, 177, 240, 0.3)');
    gradient.addColorStop(1, 'rgba(254, 111, 105, 0.6)');
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, w, h);
  }

  function draw(ctx: CanvasRenderingContext2D) {
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    ctx.clearRect(0, 0, w, h);

    // Conic gradient sweep
    const centerX = w / 2;
    const centerY = h / 2;
    const radius = Math.max(w, h) * 0.7;

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(progress * Math.PI * 2);

    const gradient = ctx.createConicGradient(0, 0, 0);
    gradient.addColorStop(0, 'rgba(69, 42, 132, 0)');
    gradient.addColorStop(0.1, 'rgba(69, 42, 132, 0.8)');
    gradient.addColorStop(0.2, 'rgba(169, 177, 240, 0.9)');
    gradient.addColorStop(0.3, 'rgba(254, 111, 105, 0.8)');
    gradient.addColorStop(0.4, 'rgba(69, 42, 132, 0)');

    ctx.strokeStyle = gradient;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';

    // Draw on all four edges
    ctx.beginPath();
    ctx.moveTo(-w/2, -h/2);
    ctx.lineTo(w/2, -h/2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(w/2, -h/2);
    ctx.lineTo(w/2, h/2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(w/2, h/2);
    ctx.lineTo(-w/2, h/2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-w/2, h/2);
    ctx.lineTo(-w/2, -h/2);
    ctx.stroke();

    ctx.restore();
  }
</script>

<canvas class="border-beam" bind:this={canvas} aria-hidden="true"></canvas>

<style>
  .border-beam {
    position: absolute;
    inset: -1px;
    z-index: 10;
    pointer-events: none;
    border-radius: inherit;
  }

  @media (prefers-reduced-motion: reduce) {
    .border-beam { display: none; }
  }

  html.reduce-motion .border-beam { display: none; }
</style>