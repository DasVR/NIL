<script lang="ts">
  let {
    state = 'idle',
    size = '2rem',
    className = ''
  }: {
    state?: 'idle' | 'thinking' | 'streaming' | 'done';
    size?: string;
    className?: string;
  } = $props();

  let sizeStyle = $derived(`width: ${size}; height: ${size};`);
</script>

<div class="thinking-logo {className} thinking-logo--{state}" style={sizeStyle} aria-hidden="true">
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- Blocky N monogram -->
    <g class="n-shape">
      <rect x="4" y="4" width="6" height="24" rx="1" />
      <rect x="22" y="4" width="6" height="24" rx="1" />
      <path d="M10 4 L16 4 L22 28 L16 28 Z" />
    </g>
    {#if state === 'thinking' || state === 'streaming'}
      <g class="orbs">
        <circle class="orb orb--1" cx="28" cy="8" r="2.5" />
        <circle class="orb orb--2" cx="30" cy="16" r="2" />
        <circle class="orb orb--3" cx="28" cy="24" r="2.5" />
      </g>
    {/if}
  </svg>
</div>

<style>
  .thinking-logo {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .thinking-logo svg {
    width: 100%;
    height: 100%;
    overflow: visible;
  }

  .n-shape > * {
    fill: var(--accent-primary);
    transition:
      fill var(--dur-base) var(--spring-smooth),
      transform var(--dur-base) var(--spring-smooth);
  }

  /* Idle: static violet */
  .thinking-logo--idle .n-shape rect {
    fill: var(--accent-primary);
  }

  /* Thinking: notches breathe, orbits */
  .thinking-logo--thinking .n-shape rect {
    animation: breathe 2.4s var(--spring-smooth) infinite;
  }
  .thinking-logo--thinking .n-shape rect:nth-child(1) { animation-delay: 0s; }
  .thinking-logo--thinking .n-shape rect:nth-child(2) { animation-delay: 0.4s; }
  .thinking-logo--thinking .n-shape rect:nth-child(3) { animation-delay: 0.8s; }

  .orb {
    opacity: 0;
    transform-origin: center;
    animation: orbit 2.4s var(--spring-smooth) infinite;
  }
  .thinking-logo--thinking .orb { opacity: 1; }
  .orb--1 { fill: var(--accent-warm); animation-delay: 0s; }
  .orb--2 { fill: var(--accent-primary-light); animation-delay: 0.3s; }
  .orb--3 { fill: var(--accent-coral); animation-delay: 0.6s; }

  /* Streaming: orbs converge to N */
  .thinking-logo--streaming .n-shape rect {
    fill: var(--accent-primary-light);
    filter: drop-shadow(0 0 6px rgba(169, 177, 240, 0.5));
  }
  .thinking-logo--streaming .orb {
    opacity: 1;
    animation: converge 1.2s var(--spring-smooth) infinite alternate;
  }

  /* Done: solid cream, soft pulse */
  .thinking-logo--done .n-shape rect {
    fill: var(--accent-cream);
    animation: pulse 2s var(--spring-smooth) infinite;
  }

  @keyframes breathe {
    0%, 100% { transform: scaleY(1); }
    50% { transform: scaleY(0.92); }
  }

  @keyframes orbit {
    0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.7; }
    50% { transform: translate(-4px, 0) scale(1.15); opacity: 1; }
  }

  @keyframes converge {
    0% { transform: translate(0, 0); }
    100% { transform: translate(-10px, 0); }
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.78; }
  }

  @media (prefers-reduced-motion: reduce) {
    .n-shape rect,
    .orb {
      animation: none !important;
    }
    .thinking-logo--streaming .n-shape rect {
      filter: none;
    }
  }
</style>
