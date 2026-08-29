<script lang="ts">
  import Icon from '@iconify/svelte';

  interface Engagement {
    id: string;
    name: string;
    status: 'active' | 'paused' | 'done' | 'blocked';
    targets: number;
  }

  interface SidebarProps {
    engagements?: Engagement[];
    activeId?: string;
    collapsed?: boolean;
    onSelect?: (id: string) => void;
    onToggleCollapse?: () => void;
    className?: string;
  }

  let {
    engagements = [],
    activeId = '',
    collapsed = false,
    onSelect = () => {},
    onToggleCollapse = () => {},
    className = ''
  }: SidebarProps = $props();

  const statusIcon: Record<Engagement['status'], string> = {
    active: 'ph:circle-fill',
    paused: 'ph:pause-circle-fill',
    done: 'ph:check-circle-fill',
    blocked: 'ph:warning-circle-fill'
  };
</script>

<nav
  class="sidebar shell-panel {collapsed ? 'sidebar--collapsed' : ''} {className}"
  aria-label="Engagements"
>
  <div class="sidebar__header">
    <span class="sidebar__eyebrow">Engagements</span>
    <button
      class="icon-btn"
      onclick={() => onToggleCollapse()}
      aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
    >
      <Icon icon={collapsed ? 'ph:sidebar-simple-bold' : 'ph:sidebar-simple-fill'} />
    </button>
  </div>

  {#if !collapsed}
    <ul class="sidebar__list" role="tree">
      {#each engagements as eng (eng.id)}
        <li>
          <button
            class="sidebar__row {activeId === eng.id ? 'sidebar__row--active' : ''}"
            class:row-active={activeId === eng.id}
            role="treeitem"
            aria-selected={activeId === eng.id}
            onclick={() => onSelect(eng.id)}
          >
            <Icon
              class="sidebar__status"
              icon={statusIcon[eng.status]}
              aria-hidden="true"
            />
            <span class="sidebar__name">{eng.name}</span>
            {#if eng.targets > 0}
              <span class="sidebar__count">{eng.targets}</span>
            {/if}
          </button>
        </li>
      {/each}
    </ul>
  {/if}

  <div class="sidebar__footer">
    <button class="sidebar__new" onclick={undefined as any} aria-label="New engagement">
      <Icon icon="ph:plus-bold" aria-hidden="true" />
      {#if !collapsed}<span>New engagement</span>{/if}
    </button>
  </div>
</nav>

<style>
  .sidebar {
    display: flex;
    flex-direction: column;
    background: var(--surface-1);
    border-right: 1px solid var(--border-subtle);
    min-width: 236px;
    width: 236px;
    transition: width var(--spring-smooth);
    overflow: hidden;
    flex-shrink: 0;
  }
  .sidebar--collapsed {
    width: 52px;
    min-width: 52px;
  }
  .sidebar__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: var(--control-height);
    padding: 0 var(--space-3);
    border-bottom: 1px solid var(--border-subtle);
    flex-shrink: 0;
  }
  .sidebar__eyebrow {
    font: var(--type-overline);
    color: var(--text-tertiary);
    letter-spacing: var(--tracking-wide);
  }
  .sidebar__list {
    list-style: none;
    margin: 0;
    padding: var(--space-1);
    display: flex;
    flex-direction: column;
    gap: 2px;
    flex: 1;
    overflow-y: auto;
  }
  .sidebar__row {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    width: 100%;
    height: var(--row-height);
    padding: 0 var(--space-2);
    border: 1px solid transparent;
    border-radius: 6px;
    background: transparent;
    color: var(--text-secondary);
    cursor: pointer;
    font: var(--type-ui);
  }
  .sidebar__row:hover {
    background: var(--surface-2);
    color: var(--text-primary);
  }
  .sidebar__status {
    color: var(--text-tertiary);
    flex-shrink: 0;
  }
  .sidebar__name {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: left;
  }
  .sidebar__count {
    font: var(--type-mono);
    font-size: var(--font-2xs);
    color: var(--text-tertiary);
    background: var(--surface-3);
    border-radius: 999px;
    padding: 1px var(--space-2);
  }
  .sidebar__footer {
    padding: var(--space-2);
    border-top: 1px solid var(--border-subtle);
    flex-shrink: 0;
  }
  .sidebar__new {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    width: 100%;
    height: var(--control-height);
    padding: 0 var(--space-2);
    border: 1px dashed var(--border-strong);
    border-radius: 6px;
    background: transparent;
    color: var(--text-secondary);
    cursor: pointer;
    font: var(--type-ui);
  }
  .sidebar__new:hover {
    border-color: var(--accent);
    color: var(--accent);
    background: var(--accent-soft);
  }
</style>
