<script>
  let { title, count = null, subtitle = '' } = $props();
</script>

<header class="page-header">
  <div class="ph-left">
    <span class="ph-title">{title}</span>
    {#if count !== null}
      <span class="ph-count mono">{count}</span>
    {/if}
  </div>
  {#if subtitle}
    <span class="ph-subtitle">{subtitle}</span>
  {/if}
</header>

<style>
  .page-header {
    height: 44px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 14px;
    background: var(--glass-3);
    border-bottom: 1px solid var(--glass-border);
    user-select: none;
  }

  .ph-left {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .ph-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--text);
    letter-spacing: -0.01em;
  }

  .ph-count {
    font-size: 11px;
    font-weight: 600;
    padding: 2px 8px;
    border-radius: 10px;
    background: var(--glass-2);
    color: var(--text-dim);
    border: 1px solid var(--glass-border);
  }

  .ph-subtitle {
    font-size: 11px;
    color: var(--text-faint);
  }
</style>
