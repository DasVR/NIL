<script lang="ts">
  import { onMount } from 'svelte';
  import { spring } from 'svelte/motion';

  interface ThinkingLogoProps {
    state?: 'idle' | 'thinking' | 'streaming' | 'done';
    size?: number;
  }

  let { state: logoState = 'idle', size = 32 }: ThinkingLogoProps = $props();

  const orbitRadius = spring(0, { stiffness: 0.15, damping: 0.25 });
  const pulse = spring(1, { stiffness: 0.2, damping: 0.2 });
  const notchRotation = spring(0, { stiffness: 0.18, damping: 0.22 });

  let reducedMotion = $state(false);
  let currentState = $state<typeof logoState>('idle');
  let orbsVisible = $derived(logoState === 'thinking' || logoState === 'streaming');

  $effect(() => { currentState = logoState; });

  onMount(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotion = mediaQuery.matches || document.documentElement.classList.contains('reduce-motion');
    mediaQuery.addEventListener('change', handleReducedMotionChange);

    updateForState(logoState);

    return () => {
      mediaQuery.removeEventListener('change', handleReducedMotionChange);
    };
  });

  function handleReducedMotionChange(e: MediaQueryListEvent) {
    reducedMotion = e.matches || document.documentElement.classList.contains('reduce-motion');
    updateForState(logoState);
  }

  function updateForState(newState: typeof logoState) {
    currentState = newState;
    if (reducedMotion) {
      orbitRadius.set(0);
      pulse.set(1);
      notchRotation.set(0);
      return;
    }

    switch (newState) {
      case 'idle':
        orbitRadius.set(0);
        pulse.set(1);
        notchRotation.set(0);
        break;
      case 'thinking':
        orbitRadius.set(1);
        pulse.set(1);
        notchRotation.set(1);
        break;
      case 'streaming':
        orbitRadius.set(0.5);
        pulse.set(1.2);
        notchRotation.set(0);
        break;
      case 'done':
        orbitRadius.set(0);
        pulse.set(1.1);
        notchRotation.set(0);
        setTimeout(() => {
          if (currentState === 'done') {
            pulse.set(1);
          }
        }, 1000);
        break;
    }
  }

  $effect(() => { updateForState(logoState); });
</script>

<div class="thinking-logo" style:width={size}px style:height={size}px aria-label="NIL agent status">
  <svg class="logo-n" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style:transform="rotate({$notchRotation * 5}deg)">
    <rect x="4" y="4" width="24" height="24" rx="6" 
          fill={logoState === 'done' ? 'var(--color-cream)' : 'var(--color-violet)'} 
          style:opacity={$pulse} />
    <path d="M10 22V10" stroke={logoState === 'done' ? 'var(--color-abyss-0)' : 'var(--color-cream)'} stroke-width="3" stroke-linecap="round"/>
    <path d="M10 22L22 10" stroke={logoState === 'done' ? 'var(--color-abyss-0)' : 'var(--color-cream)'} stroke-width="3" stroke-linecap="round"/>
    <path d="M22 10V22" stroke={logoState === 'done' ? 'var(--color-abyss-0)' : 'var(--color-cream)'} stroke-width="3" stroke-linecap="round"/>
    <line x1="10" y1="10" x2="10" y2="14" stroke={logoState === 'done' ? 'var(--color-abyss-0)' : 'var(--color-cream)'} stroke-width="2" stroke-linecap="round"/>
    <line x1="22" y1="10" x2="22" y2="14" stroke={logoState === 'done' ? 'var(--color-abyss-0)' : 'var(--color-cream)'} stroke-width="2" stroke-linecap="round"/>
    <line x1="10" y1="18" x2="10" y2="22" stroke={logoState === 'done' ? 'var(--color-abyss-0)' : 'var(--color-cream)'} stroke-width="2" stroke-linecap="round"/>
    <line x1="22" y1="18" x2="22" y2="22" stroke={logoState === 'done' ? 'var(--color-abyss-0)' : 'var(--color-cream)'} stroke-width="2" stroke-linecap="round"/>
  </svg>

  {#if orbsVisible && !reducedMotion}
    <div class="orbs-container" style:width={size * 2}px style:height={size * 2}px style:transform="translate(-50%, -50%) scale({$orbitRadius})">
      <div class="orb orb-1" style:background="var(--color-coral)"></div>
      <div class="orb orb-2" style:background="var(--color-violet-light)"></div>
      <div class="orb orb-3" style:background="var(--color-coral)"></div>
    </div>
  {/if}

  {#if logoState === 'streaming' && !reducedMotion}
    <div class="convergence-ring" style:opacity={$pulse - 1}></div>
  {/if}

  {#if logoState === 'done' && !reducedMotion}
    <div class="done-pulse" style:opacity={$pulse - 1}></div>
  {/if}
</div>

<style>
  .thinking-logo {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .logo-n {
    width: 100%;
    height: 100%;
    filter: drop-shadow(0 0 8px rgba(69, 42, 132, 0.4));
    transition: filter var(--spring-smooth);
  }

  .logo-n:hover {
    filter: drop-shadow(0 0 16px rgba(69, 42, 132, 0.6));
  }

  .orbs-container {
    position: absolute;
    top: 50%;
    left: 50%;
    pointer-events: none;
  }

  .orb {
    position: absolute;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    filter: blur(1px);
    animation: orbit 3s var(--spring-bouncy) infinite;
  }

  .orb-1 { top: 50%; left: 50%; transform: translate(-50%, -50%); animation-delay: 0s; }
  .orb-2 { top: 50%; left: 50%; transform: translate(-50%, -50%); animation-delay: -1s; }
  .orb-3 { top: 50%; left: 50%; transform: translate(-50%, -50%); animation-delay: -2s; }

  @keyframes orbit {
    0%, 100% { transform: translate(-50%, -50%) rotate(0deg) translateX(18px) rotate(0deg); opacity: 0.8; }
    25% { transform: translate(-50%, -50%) rotate(90deg) translateX(18px) rotate(-90deg); opacity: 1; }
    50% { transform: translate(-50%, -50%) rotate(180deg) translateX(18px) rotate(-180deg); opacity: 0.8; }
    75% { transform: translate(-50%, -50%) rotate(270deg) translateX(18px) rotate(-270deg); opacity: 0.6; }
  }

  .convergence-ring {
    position: absolute;
    inset: -4px;
    border: 2px solid var(--color-violet-light);
    border-radius: 50%;
    animation: converge 1s var(--spring-smooth) infinite;
    pointer-events: none;
  }

  @keyframes converge {
    0% { transform: scale(1.5); opacity: 0; }
    50% { opacity: 0.6; }
    100% { transform: scale(0.8); opacity: 0; }
  }

  .done-pulse {
    position: absolute;
    inset: -8px;
    border: 2px solid var(--color-cream);
    border-radius: 50%;
    animation: donePulse 1.5s var(--spring-smooth) infinite;
    pointer-events: none;
  }

  @keyframes donePulse {
    0% { transform: scale(1); opacity: 0.6; }
    100% { transform: scale(1.8); opacity: 0; }
  }

  @media (prefers-reduced-motion: reduce) {
    .orb { animation: none; }
    .convergence-ring { animation: none; }
    .done-pulse { animation: none; }
  }
</style>
