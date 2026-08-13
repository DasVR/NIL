<script lang="ts">
  import { Home, Briefcase, FlaskConical, User, Mail } from 'lucide-svelte';

  interface DockItem {
    id: string;
    label: string;
    icon: any;
    href: string;
    active?: boolean;
  }

  let { items = [] }: { items: DockItem[] } = $props();
  let hoveredIndex = $state<number | null>(null);
</script>

<div class="dock">
  {#each items as item, i}
    <a
      href={item.href}
      class="dock-item"
      class:active={item.active}
      onmouseenter={() => hoveredIndex = i}
      onmouseleave={() => hoveredIndex = null}
      style:transform={hoveredIndex === i ? 'scale(1.25)' : 'scale(1)'}
    >
      <span class="tooltip" class:visible={hoveredIndex === i}>
        {item.label}
      </span>
      <div class="icon-container">
        <span class="icon"><item.icon /></span>
        {#if item.active}
          <span class="active-dot"></span>
        {/if}
      </div>
    </a>
  {/each}
</div>

<style>
  .dock {
    position: fixed;
    bottom: 1.5rem;
    left: 50%;
    transform: translateX(-50%);
    z-index: 50;
    display: flex;
    align-items: flex-end;
    gap: 0.25rem;
    padding: 0.75rem 1rem;
    border-radius: 1rem;
    background: rgba(10, 10, 12, 0.7);
    backdrop-filter: blur(20px) saturate(1.2);
    -webkit-backdrop-filter: blur(20px) saturate(1.2);
    border: 1px solid rgba(255, 255, 255, 0.06);
  }

  .dock-item {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    transition: transform 250ms cubic-bezier(0.16, 1, 0.3, 1);
  }

  .tooltip {
    position: absolute;
    top: -2.25rem;
    padding: 0.25rem 0.5rem;
    border-radius: 0.375rem;
    font-size: 0.75rem;
    font-weight: 500;
    background: #111113;
    color: #e0e0e0;
    border: 1px solid #1a1a1e;
    opacity: 0;
    transform: translateY(0.5rem);
    transition: all 200ms;
    pointer-events: none;
    white-space: nowrap;
  }

  .tooltip.visible {
    opacity: 1;
    transform: translateY(0);
  }

  .icon-container {
    position: relative;
    width: 3rem;
    height: 3rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 0.75rem;
    transition: all 200ms;
  }

  .active .icon-container {
    background: rgba(0, 217, 146, 0.1);
  }

  .icon {
    color: #e0e0e0;
  }

  .active-dot {
    position: absolute;
    bottom: -0.25rem;
    width: 0.25rem;
    height: 0.25rem;
    border-radius: 50%;
    background: #00d992;
  }
</style>
