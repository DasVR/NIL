<script lang="ts">
  let { label = 'Working' }: { label?: string } = $props();
</script>

<span class="orbs" role="status" aria-label={label}>
  <span class="orb"></span>
  <span class="orb"></span>
  <span class="orb"></span>
</span>

<style>
  .orbs {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    flex-shrink: 0;
  }
  .orb {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--green);
    box-shadow: 0 0 8px var(--green-glow);
    animation: orb-float 1.3s var(--spring-smooth) infinite;
  }
  .orb:nth-child(2) { animation-delay: 0.16s; }
  .orb:nth-child(3) { animation-delay: 0.32s; }

  @keyframes orb-float {
    0%, 100% { transform: translateY(0) scale(0.8); opacity: 0.4; }
    50% { transform: translateY(-3px) scale(1); opacity: 1; }
  }

  @media (prefers-reduced-motion: reduce) {
    .orb { animation: none; opacity: 0.85; transform: none; }
  }
  :global(html.reduce-motion) .orb {
    animation: none;
    opacity: 0.85;
    transform: none;
  }
</style>
