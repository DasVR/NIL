<script>
  import { toast } from '$lib/toast.svelte';
</script>

{#if toast.items.length}
  <div class="hud" role="status" aria-live="polite">
    {#each toast.items as item (item.id)}
      <div class="hud-item" class:warn={item.kind === 'warn'} class:danger={item.kind === 'danger'} class:info={item.kind === 'info'}>
        {item.message}
      </div>
    {/each}
  </div>
{/if}

<style>
  .hud {
    position: fixed;
    top: 52px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 200;
    display: flex;
    flex-direction: column;
    gap: 6px;
    pointer-events: none;
  }
  .hud-item {
    padding: 6px 12px;
    border-radius: 8px;
    background: var(--abyss-3);
    border: 1px solid var(--glass-border);
    box-shadow: var(--shadow-panel);
    font-size: 12px;
    color: var(--text);
    animation: hud-in 180ms var(--spring-snappy) both;
  }
  .hud-item.warn { color: var(--warning); border-color: rgba(255, 180, 84, 0.3); }
  .hud-item.danger { color: var(--danger); border-color: rgba(255, 92, 92, 0.3); }
  .hud-item.info { color: var(--info); }
  @keyframes hud-in {
    from { opacity: 0; transform: translateY(-6px) scale(0.98); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }
  @media (prefers-reduced-motion: reduce) {
    .hud-item { animation: none; }
  }
</style>
