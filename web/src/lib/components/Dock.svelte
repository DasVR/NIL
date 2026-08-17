<script>
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { Motion } from 'svelte-motion';
  import { appState } from '$lib/stores.svelte';

  const items = [
    { id: 'chat', href: '/app', label: 'Chat', icon: 'chat' },
    { id: 'findings', href: '/app/findings', label: 'Findings', icon: 'findings' },
    { id: 'notes', href: '/app/notes', label: 'Notes', icon: 'notes' },
    { id: 'tools', href: '/app/tools', label: 'Tools', icon: 'tools' },
    { id: 'creds', href: '/app/creds', label: 'Creds', icon: 'creds' },
    { id: 'reports', href: '/app/reports', label: 'Reports', icon: 'reports' },
    { id: 'loot', href: '/app/loot', label: 'Loot', icon: 'loot' },
    { id: 'settings', href: '/app/settings', label: 'Settings', icon: 'settings' }
  ];

  let hoveredId = $state(null);
  let reducedMotion = $state(false);

  function isActive(href) {
    const path = $page.url.pathname;
    return path === href || (href !== '/app' && path.startsWith(href + '/')) || (href === '/app' && path === '/app');
  }

  function navigate(href) {
    goto(href);
  }

  $effect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotion = mq.matches;
    const handler = () => (reducedMotion = mq.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  });
</script>

{#snippet dockIcon(name)}
  {#if name === 'chat'}
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
  {:else if name === 'findings'}
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/></svg>
  {:else if name === 'notes'}
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
  {:else if name === 'tools'}
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>
  {:else if name === 'creds'}
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
  {:else if name === 'reports'}
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M9 17H7A2 2 0 015 15V5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2h-2"/><rect x="9" y="13" width="6" height="8" rx="1"/></svg>
  {:else if name === 'loot'}
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>
  {:else}
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
  {/if}
{/snippet}

<nav class="dock" aria-label="Primary navigation">
  <div class="dock-inner">
    {#each items as item (item.id)}
      {@const active = isActive(item.href)}
      {@const hovered = hoveredId === item.id}
      <Motion
        let:motion
        animate={{ scale: reducedMotion ? 1 : hovered ? 1.1 : 1 }}
        transition={{ type: 'spring', stiffness: 420, damping: 22 }}
      >
        <button
          use:motion
          type="button"
          class="dock-item"
          class:active
          onclick={() => navigate(item.href)}
          onmouseenter={() => (hoveredId = item.id)}
          onmouseleave={() => (hoveredId = null)}
          onfocus={() => (hoveredId = item.id)}
          onblur={() => (hoveredId = null)}
          aria-label={item.label}
          aria-current={active ? 'page' : undefined}
          title={item.label}
        >
          <span class="dock-icon">{@render dockIcon(item.icon)}</span>
          {#if active}
            <span class="dock-dot" aria-hidden="true"></span>
          {/if}
          <span class="dock-label">{item.label}</span>
        </button>
      </Motion>
    {/each}
  </div>
</nav>

<style>
  .dock {
    position: fixed;
    bottom: calc(var(--statusbar-height) + 12px);
    left: 50%;
    transform: translateX(-50%);
    z-index: 80;
    padding: 6px 10px;
    border-radius: var(--radius-dock);
    background: rgba(10, 10, 12, 0.78);
    border: 1px solid var(--glass-border);
    backdrop-filter: blur(16px) saturate(1.2);
    -webkit-backdrop-filter: blur(16px) saturate(1.2);
    box-shadow: var(--elevation-2);
  }

  .dock-inner {
    display: flex;
    align-items: flex-end;
    gap: 4px;
  }

  .dock-item {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 52px;
    min-height: 52px;
    padding: 6px 4px 10px;
    border: none;
    background: transparent;
    color: var(--text-secondary);
    cursor: pointer;
    border-radius: 12px;
    transform-origin: center bottom;
    transition: background 150ms var(--spring-snappy), color 150ms ease;
  }

  .dock-item:hover,
  .dock-item:focus-visible {
    background: rgba(255, 255, 255, 0.06);
    color: var(--text-primary);
  }

  .dock-item.active {
    color: var(--accent);
  }

  .dock-item:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }

  .dock-icon {
    display: grid;
    place-items: center;
    width: 28px;
    height: 28px;
  }

  .dock-dot {
    position: absolute;
    bottom: 4px;
    left: 50%;
    transform: translateX(-50%);
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: var(--accent);
  }

  .dock-label {
    position: absolute;
    bottom: calc(100% + 8px);
    left: 50%;
    transform: translateX(-50%) translateY(4px);
    padding: 4px 10px;
    border-radius: var(--radius-control);
    background: var(--abyss-2);
    border: 1px solid var(--glass-border);
    font-size: 11px;
    font-weight: 500;
    color: var(--text-primary);
    white-space: nowrap;
    opacity: 0;
    pointer-events: none;
    transition: opacity 180ms var(--spring-smooth), transform 180ms var(--spring-smooth);
  }

  .dock-item:hover .dock-label,
  .dock-item:focus-visible .dock-label {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }

  @media (max-width: 1024px) {
    .dock {
      display: none;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .dock-label {
      transition: opacity 120ms ease;
      transform: translateX(-50%);
    }
  }
</style>
