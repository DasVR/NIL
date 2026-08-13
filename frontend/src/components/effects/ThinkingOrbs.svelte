<script lang="ts">
  let { className = '', count = 3 }: { className?: string; count?: number } = $props();
</script>

<div class="thinking-orbs {className}">
  {#each Array(count) as _, i}
    <div
      class="orb"
      style="animation-delay: {i * 0.2}s; box-shadow: 0 0 8px rgba(0, 217, 146, 0.4), 0 0 16px rgba(0, 217, 146, 0.13);"
    ></div>
  {/each}
</div>

<style>
  .thinking-orbs {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .orb {
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
    background: #00d992;
    animation: thinking-pulse 1.5s ease-in-out infinite;
  }

  @keyframes thinking-pulse {
    0%, 100% { opacity: 0.3; transform: scale(0.8); }
    50% { opacity: 1; transform: scale(1.2); }
  }
</style>
