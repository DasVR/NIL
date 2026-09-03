<script lang="ts">
  import { onMount } from 'svelte';

  let canvas: HTMLCanvasElement;
  let animationId: number = 0;
  let reducedMotion = $state(false);
  let ctx: CanvasRenderingContext2D | null = null;
  let dpr = 1;
  let animating = false;

  const orbs = [
    { angle: 0, radius: 18, speed: 0.005, phase: 0, color: '#fe6f69', size: 6 },
    { angle: 2.09, radius: 18, speed: 0.005, phase: 2.09, color: '#a9b1f0', size: 5 },
    { angle: 4.18, radius: 18, speed: 0.005, phase: 4.18, color: '#fe6f69', size: 6 },
  ];

  function resize() {
    if (!canvas || !ctx) return;
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;
    canvas.style.width = canvas.offsetWidth + 'px';
    canvas.style.height = canvas.offsetHeight + 'px';
    ctx.scale(dpr, dpr);
  }

  function animate() {
    if (!canvas || !ctx || reducedMotion) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.offsetWidth / 2;
    const centerY = canvas.offsetHeight / 2;

    for (const orb of orbs) {
      orb.angle += orb.speed;
      const x = centerX + Math.cos(orb.angle) * orb.radius;
      const y = centerY + Math.sin(orb.angle) * orb.radius;
      const scale = 0.8 + 0.4 * Math.sin(orb.angle * 2);

      ctx.beginPath();
      ctx.arc(x, y, orb.size * scale, 0, Math.PI * 2);
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, orb.size * scale);
      gradient.addColorStop(0, orb.color);
      gradient.addColorStop(1, orb.color + '00');
      ctx.fillStyle = gradient;
      ctx.filter = 'blur(1px)';
      ctx.fill();
      ctx.filter = 'none';
    }

    animationId = requestAnimationFrame(animate);
  }

  onMount(() => {
    if (!canvas) return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotion = mediaQuery.matches || document.documentElement.classList.contains('reduce-motion');
    mediaQuery.addEventListener('change', handleReducedMotionChange);

    if (reducedMotion) return;

    ctx = canvas.getContext('2d');
    if (!ctx) return;
    dpr = window.devicePixelRatio || 1;

    resize();
    window.addEventListener('resize', resize);

    animate();
    animating = true;

    return () => {
      window.removeEventListener('resize', resize);
      mediaQuery.removeEventListener('change', handleReducedMotionChange);
      cancelAnimationFrame(animationId);
      animating = false;
    };
  });

  function handleReducedMotionChange(e: MediaQueryListEvent) {
    reducedMotion = e.matches || document.documentElement.classList.contains('reduce-motion');
    if (reducedMotion) {
      cancelAnimationFrame(animationId);
      animating = false;
    } else if (!animating && ctx) {
      animate();
      animating = true;
    }
  }
</script>

<canvas class="thinking-orbs" bind:this={canvas} aria-hidden="true"></canvas>

<style>
  .thinking-orbs {
    display: block;
    width: 100%;
    height: 100%;
    min-height: 40px;
  }

  @media (prefers-reduced-motion: reduce) {
    .thinking-orbs { display: none; }
  }

  :global(html.reduce-motion) .thinking-orbs { display: none; }
</style>