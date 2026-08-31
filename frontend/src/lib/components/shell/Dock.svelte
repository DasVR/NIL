<script lang="ts">
  import Icon from '@iconify/svelte';

  interface DockItem {
    id: string;
    label: string;
    icon: string;
    href: string;
    active?: boolean;
  }

  let { items = [] }: { items: DockItem[] } = $props();
</script>

<nav class="dock" aria-label="Primary">
  {#each items as item (item.id)}
    <a
      href={item.href}
      class="dock-item"
      class:active={item.active}
      aria-label={item.label}
      aria-current={item.active ? 'page' : undefined}
    >
      <span class="tooltip">{item.label}</span>
      <span class="icon-wrap">
        <Icon icon={item.icon} width="1.25rem" height="1.25rem" />
      </span>
      {#if item.active}
        <span class="active-dot" aria-hidden="true"></span>
      {/if}
    </a>
  {/each}
</nav>

<style>
  .dock {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-1);
    padding: var(--space-2) var(--space-3);
    background: var(--surface-1);
    border-top: 1px solid var(--border-subtle);
  }

  .dock-item {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: var(--space-2);
    border-radius: var(--radius-md);
    color: var(--text-tertiary);
    text-decoration: none;
    transition:
      transform var(--dur-base) var(--spring-bouncy),
      color var(--dur-fast) var(--spring-smooth),
      background-color var(--dur-fast) var(--spring-smooth);
  }

  .dock-item:hover,
  .dock-item:focus-visible {
    transform: scale(1.15);
    color: var(--text-primary);
    background: rgba(169, 177, 240, 0.10);
  }

  .dock-item:focus-visible {
    outline: 2px solid var(--accent-primary-light);
    outline-offset: 2px;
  }

  .dock-item:active {
    transform: scale(1.08);
  }

  .dock-item.active {
    color: var(--accent-cream);
  }

  .icon-wrap {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.75rem;
    height: 1.75rem;
  }

  .tooltip {
    position: absolute;
    top: -1.75rem;
    padding: 0.25rem 0.5rem;
    border-radius: var(--radius-sm);
    font-family: var(--font-mono);
    font-size: var(--step--2);
    background: var(--surface-overlay);
    color: var(--text-primary);
    border: 1px solid var(--border-subtle);
    opacity: 0;
    transform: translateY(0.5rem);
    transition:
      opacity var(--dur-fast) var(--spring-smooth),
      transform var(--dur-fast) var(--spring-smooth);
    pointer-events: none;
    white-space: nowrap;
  }

  .dock-item:hover .tooltip,
  .dock-item:focus-visible .tooltip {
    opacity: 1;
    transform: translateY(0);
  }

  .active-dot {
    position: absolute;
    bottom: 0.125rem;
    width: 0.25rem;
    height: 0.25rem;
    border-radius: var(--radius-full);
    background: var(--accent-warm);
  }

  @media (prefers-reduced-motion: reduce) {
    .dock-item {
      transition: none;
    }
    .tooltip {
      transition: none;
    }
  }
</style>
