<script lang="ts">
  import Icon from '@iconify/svelte';
</script>

<footer class="status-bar">
  <div class="status-section">
    <span class="status-dot status-dot--safe" aria-hidden="true"></span>
    <span class="status-label">Approval gate: on</span>
  </div>

  <div class="status-section">
    <span class="status-label mono">No engagement</span>
  </div>

  <div class="status-section status-actions">
    <button class="status-action" type="button" aria-label="Command palette">
      <Icon icon="lucide:command" width="0.75rem" height="0.75rem" />
      <span class="status-label">K</span>
    </button>
  </div>
</footer>

<style>
  .status-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3);
    height: var(--statusbar-h);
    min-height: var(--statusbar-h);
    padding-inline: var(--space-3);
    background: var(--statusbar-bg);
    border-top: 1px solid var(--border-subtle);
    font-size: var(--step--2);
    color: var(--text-tertiary);
    flex-shrink: 0;
  }

  .status-section {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  .status-dot {
    width: 0.375rem;
    height: 0.375rem;
    border-radius: var(--radius-full);
    background: currentColor;
  }

  .status-dot--safe {
    background: var(--status-success);
  }

  .status-label {
    line-height: 1;
  }

  .status-actions {
    gap: var(--space-2);
  }

  .status-action {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
    padding: 0.125rem 0.375rem;
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-sm);
    background: transparent;
    color: var(--text-tertiary);
    font-size: var(--step--2);
    cursor: pointer;
    transition: border-color var(--dur-fast) var(--spring-smooth);
  }

  .status-action:hover {
    border-color: var(--border-default);
    color: var(--text-primary);
  }

  .status-action:focus-visible {
    outline: 2px solid var(--accent-primary-light);
    outline-offset: 1px;
  }
</style>
