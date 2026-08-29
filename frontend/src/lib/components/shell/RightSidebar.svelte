<script lang="ts">
  import Icon from '@iconify/svelte';

  type Tab = 'inspector' | 'findings' | 'timeline';

  interface RightSidebarProps {
    activeTab?: Tab;
    className?: string;
  }

  let { activeTab = 'inspector', className = '' }: RightSidebarProps = $props();

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'inspector', label: 'Inspector', icon: 'ph:sliders-horizontal-bold' },
    { id: 'findings', label: 'Findings', icon: 'ph:detective-bold' },
    { id: 'timeline', label: 'Timeline', icon: 'ph:list-numbers-bold' }
  ];

  let current = $state<Tab>(activeTab);

  $effect(() => {
    current = activeTab;
  });
</script>

<aside class="right-sidebar shell-panel {className}" aria-label="Inspector">
  <div class="right-sidebar__tabs" role="tablist" aria-label="Sidebar sections">
    {#each tabs as tab (tab.id)}
      <button
        class="right-sidebar__tab {current === tab.id ? 'right-sidebar__tab--active' : ''}"
        role="tab"
        aria-selected={current === tab.id}
        aria-label={tab.label}
        onclick={() => (current = tab.id)}
        title={tab.label}
      >
        <Icon icon={tab.icon} aria-hidden="true" />
      </button>
    {/each}
  </div>

  <div class="right-sidebar__content" role="tabpanel">
    {#if current === 'inspector'}
      <div class="glass glass-2 right-sidebar__card">
        <div class="card-row">
          <span class="card-label">Target</span>
          <span class="card-value">unassigned</span>
        </div>
        <div class="card-row">
          <span class="card-label">Tool</span>
          <span class="card-value">none</span>
        </div>
        <div class="card-row">
          <span class="card-label">Approval</span>
          <span class="card-value card-value--ok">gate on</span>
        </div>
      </div>
    {:else if current === 'findings'}
      <div class="right-sidebar__empty">
        <Icon icon="ph:detective-bold" aria-hidden="true" />
        <span>No findings yet</span>
      </div>
    {:else}
      <div class="right-sidebar__timeline">
        {#each ['workspace loaded', 'approval gate armed', 'awaiting command'] as entry, i (i)}
          <div class="timeline-item">
            <span class="timeline-dot" aria-hidden="true"></span>
            <span class="timeline-text">{entry}</span>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</aside>

<style>
  .right-sidebar {
    display: flex;
    flex-direction: column;
    background: var(--surface-1);
    border-left: 1px solid var(--border-subtle);
    width: var(--right-sidebar-width, 264px);
    flex-shrink: 0;
  }
  .right-sidebar__tabs {
    display: flex;
    gap: 2px;
    padding: var(--space-1);
    border-bottom: 1px solid var(--border-subtle);
  }
  .right-sidebar__tab {
    display: grid;
    place-items: center;
    height: var(--control-height);
    padding: 0 var(--space-2);
    border: none;
    border-radius: 6px;
    background: transparent;
    color: var(--text-tertiary);
    cursor: pointer;
  }
  .right-sidebar__tab:hover {
    color: var(--text-secondary);
    background: var(--surface-2);
  }
  .right-sidebar__tab--active {
    color: var(--accent);
    background: var(--accent-soft);
  }
  .right-sidebar__content {
    flex: 1;
    overflow-y: auto;
    padding: var(--space-2);
  }
  .right-sidebar__card {
    padding: var(--space-3);
    border-radius: 12px;
  }
  .card-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    min-height: var(--row-height);
  }
  .card-label {
    font: var(--type-overline);
    color: var(--text-tertiary);
  }
  .card-value {
    font: var(--type-mono);
    font-size: var(--font-xs);
    color: var(--text-secondary);
  }
  .card-value--ok {
    color: var(--success);
  }
  .right-sidebar__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    height: 100%;
    color: var(--text-tertiary);
    font: var(--type-ui);
  }
  .right-sidebar__timeline {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    padding: var(--space-1);
  }
  .timeline-item {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font: var(--type-ui);
    color: var(--text-secondary);
  }
  .timeline-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--accent);
    flex-shrink: 0;
  }
</style>
