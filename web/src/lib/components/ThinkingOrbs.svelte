<script lang="ts">
  let { label = 'Working' }: { label?: string } = $props();
</script>

<span class="orbs" role="status" aria-label={label}>
  <span class="orb"></span>
  <span class="orb"></span>
  <span class="orb"></span>
  <span class="orb"></span>
  <span class="orb"></span>
</span>

<style>
  .orbs {
    display: inline-flex;
    align-items: flex-end;
    justify-content: center;
    gap: 4px;
    height: 16px;
    flex-shrink: 0;
  }
  .orb {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--green);
    box-shadow: 0 0 10px var(--green-glow);
    animation: orb-think 1.15s var(--spring-smooth) infinite;
  }
  .orb:nth-child(1) { animation-delay: 0s; }
  .orb:nth-child(2) { animation-delay: 0.08s; height: 8px; width: 8px; }
  .orb:nth-child(3) { animation-delay: 0.16s; height: 11px; width: 11px; }
  .orb:nth-child(4) { animation-delay: 0.24s; height: 8px; width: 8px; }
  .orb:nth-child(5) { animation-delay: 0.32s; }

  @keyframes orb-think {
    0%, 100% { transform: translateY(3px) scale(0.75); opacity: 0.35; }
    50% { transform: translateY(-4px) scale(1); opacity: 1; }
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
