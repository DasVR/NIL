<script>
  import { appState } from '$lib/stores.svelte';
  import { page } from '$app/stores';
  import { Motion } from 'svelte-motion';

  let {
    collapsed = false,
    mobileOpen = false,
    showNav = false,
    onToggle = () => {},
    onMobileClose = () => {}
  } = $props();

  const navItems = [
    { href: '/app', label: 'Chat', icon: 'chat' },
    { href: '/app/findings', label: 'Findings', icon: 'findings' },
    { href: '/app/notes', label: 'Notes', icon: 'notes' },
    { href: '/app/tools', label: 'Tools', icon: 'tools' },
    { href: '/app/creds', label: 'Creds', icon: 'creds' },
    { href: '/app/reports', label: 'Reports', icon: 'reports' },
    { href: '/app/loot', label: 'Loot', icon: 'loot' },
    { href: '/app/settings', label: 'Settings', icon: 'settings' }
  ];

  let sidebarWidth = $state(260);
  let isResizing = $state(false);

  function startResize(e) {
    isResizing = true;
    document.body.style.cursor = 'col-resize';
    window.addEventListener('mousemove', onResize);
    window.addEventListener('mouseup', stopResize);
  }

  function onResize(e) {
    if (!isResizing) return;
    const next = Math.min(400, Math.max(200, e.clientX));
    sidebarWidth = next;
    document.documentElement.style.setProperty('--sidebar-width', `${next}px`);
  }

  function stopResize() {
    isResizing = false;
    document.body.style.cursor = '';
    window.removeEventListener('mousemove', onResize);
    window.removeEventListener('mouseup', stopResize);
  }

  async function addEngagement() {
    const name = prompt('Engagement name?');
    if (name) await appState.createEngagement(name.trim());
  }

  function isActive(href) {
    const path = $page.url.pathname;
    return path === href || (href !== '/app' && path.startsWith(href + '/'));
  }

  function selectEngagement(name) {
    appState.select(name);
    onMobileClose();
  }
</script>

{#snippet navIcon(name)}
  {#if name === 'chat'}
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
  {:else if name === 'findings'}
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>
  {:else if name === 'notes'}
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
  {:else if name === 'tools'}
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>
  {:else if name === 'creds'}
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
  {:else if name === 'reports'}
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><path d="M9 17H7A2 2 0 015 15V5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2h-2"/><rect x="9" y="13" width="6" height="8" rx="1"/></svg>
  {:else if name === 'loot'}
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>
  {:else}
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
  {/if}
{/snippet}

{#if mobileOpen}
  <button class="mobile-backdrop" type="button" aria-label="Close sidebar" onclick={onMobileClose}></button>
{/if}

<aside
  class="sidebar"
  class:collapsed
  class:mobile-open={mobileOpen}
  role="complementary"
  aria-label="Engagement spaces"
  style="width: {collapsed ? '72px' : `${sidebarWidth}px`}"
>
    <div class="brand">
      <span class="logo">F</span>
      <span class="brand-text" class:hide={collapsed}>Finn</span>
    </div>

    <button
      class="palette-btn"
      onclick={() => {
        appState.paletteOpen = true;
        onMobileClose();
      }}
      aria-label="Open command palette"
    >
      <span class="palette-left">
        <svg class="palette-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <circle cx="11" cy="11" r="7"/><path d="M20 20l-3-3"/>
        </svg>
        <span class="label" class:hide={collapsed}>Search…</span>
      </span>
      <kbd class="palette-kbd" class:hide={collapsed}>⌘K</kbd>
    </button>

    <div class="section" class:hide={collapsed}>Spaces</div>

    <div class="engagements">
      {#each appState.engagements as eng (eng.name)}
        <button
          class="row"
          class:active={eng.name === appState.engagement}
          onclick={() => selectEngagement(eng.name)}
          aria-label={`Select engagement ${eng.name}`}
          title={eng.name}
        >
          <span class="dot">{eng.name[0]?.toUpperCase() || '?'}</span>
          <span class="label" class:hide={collapsed}>{eng.name}</span>
        </button>
      {/each}
    </div>

    <button class="new-engagement" onclick={addEngagement} aria-label="Create new engagement">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
      </svg>
      <span class="label" class:hide={collapsed}>New Engagement</span>
    </button>

    {#if showNav}
      <div class="section mobile-nav-label" class:hide={collapsed}>Navigate</div>
      <nav class="mobile-nav" aria-label="Mobile navigation">
        {#each navItems as item}
          <a
            class="row nav-row"
            class:active={isActive(item.href)}
            href={item.href}
            aria-current={isActive(item.href) ? 'page' : undefined}
            onclick={onMobileClose}
          >
            <span class="icon">{@render navIcon(item.icon)}</span>
            <span class="label">{item.label}</span>
          </a>
        {/each}
      </nav>
    {/if}

    <Motion
      let:motion
      animate={{ rotate: collapsed ? 0 : 180 }}
      transition={{ type: 'spring', stiffness: 400, damping: 24 }}
    >
    <button
      use:motion
      class="collapse desktop-only"
      onclick={onToggle}
      aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
    >
      {collapsed ? '→' : '←'}
    </button>
    </Motion>

    {#if !collapsed}
      <div
        class="resize-handle"
        role="separator"
        aria-orientation="vertical"
        aria-valuemin={200}
        aria-valuemax={400}
        aria-valuenow={sidebarWidth}
        aria-label="Resize sidebar"
        onmousedown={startResize}
        tabindex="0"
        onkeydown={(e) => {
          if (e.key === 'ArrowLeft') sidebarWidth = Math.max(200, sidebarWidth - 16);
          if (e.key === 'ArrowRight') sidebarWidth = Math.min(400, sidebarWidth + 16);
        }}
      ></div>
    {/if}
  </aside>

<style>
  .mobile-backdrop {
    display: none;
    position: fixed;
    inset: 0;
    z-index: 85;
    border: none;
    background: rgba(0, 0, 0, 0.55);
    cursor: pointer;
    padding: 0;
  }

  .sidebar {
    grid-column: 1;
    grid-row: 1 / span 2;
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    padding: 0.75rem 0.6rem;
    background: var(--abyss-1);
    border-right: 1px solid var(--glass-border);
    min-width: 0;
    z-index: 90;
    height: 100%;
    overflow: hidden;
    transition: width 420ms var(--spring-bouncy), padding 280ms var(--spring-smooth);
  }

  .sidebar.collapsed {
    padding: 0.75rem 0.4rem;
    align-items: center;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.3rem 0.4rem;
    margin-bottom: 0.4rem;
  }

  .logo {
    display: grid;
    place-items: center;
    width: 28px;
    height: 28px;
    border-radius: 7px;
    background: var(--accent);
    color: var(--abyss);
    font-weight: 800;
    font-size: 14px;
    flex-shrink: 0;
  }

  .brand-text {
    font-weight: 700;
    color: var(--accent);
    font-size: 1.05rem;
    transition: opacity 200ms var(--spring-control);
  }

  .palette-btn {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    width: 100%;
    text-align: left;
    border-color: rgba(255, 255, 255, 0.08);
    background: rgba(0, 0, 0, 0.25);
    color: var(--text-secondary);
    margin: 0.4rem 0;
    font-size: 0.78rem;
    padding: 0.42rem 0.55rem;
    min-height: 44px;
    border-radius: var(--radius-control);
  }

  .palette-btn:hover {
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(255, 255, 255, 0.12);
  }

  .palette-left {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    min-width: 0;
  }

  .palette-icon {
    flex-shrink: 0;
    opacity: 0.55;
  }

  .palette-kbd {
    font-family: var(--font-mono);
    font-size: 0.62rem;
    font-weight: 500;
    background: var(--abyss-2);
    padding: 0.12rem 0.35rem;
    border-radius: 5px;
    border: 1px solid var(--glass-border);
    color: var(--text-tertiary);
    flex-shrink: 0;
    line-height: 1.4;
  }

  .section {
    font-size: 11px;
    font-weight: 600;
    color: var(--text-tertiary);
    margin: 0.7rem 0.4rem 0.2rem;
    transition: opacity 200ms var(--spring-control);
  }

  .engagements {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
    flex: 1;
    min-height: 0;
    overflow-y: auto;
  }

  .row {
    display: flex;
    align-items: center;
    gap: 0.55rem;
    width: 100%;
    text-align: left;
    border: none;
    background: transparent;
    color: var(--text-secondary);
    padding: 0.45rem 0.55rem;
    min-height: 44px;
    border-radius: var(--radius-control);
    text-decoration: none;
    cursor: pointer;
    transition:
      background 180ms var(--spring-control),
      color 120ms var(--spring-control),
      box-shadow 180ms var(--spring-control);
    font-size: 0.85rem;
  }

  .row:hover {
    background: rgba(255, 255, 255, 0.05);
    color: var(--text-primary);
  }

  .row.active {
    background: var(--accent);
    color: var(--abyss);
    font-weight: 600;
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.25),
      inset 0 -2px 4px rgba(0, 0, 0, 0.2);
  }

  .row.active .dot {
    background: rgba(5, 5, 7, 0.2);
    color: var(--abyss);
  }

  .new-engagement {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.45rem;
    width: 100%;
    margin-top: 0.5rem;
    padding: 0.5rem 0.65rem;
    min-height: 44px;
    border-radius: var(--radius-control);
    border: 1px dashed var(--accent-20);
    background: var(--accent-8);
    color: var(--accent);
    font-size: 12px;
    font-weight: 600;
    transition: background 150ms, border-color 150ms;
  }

  .new-engagement:hover {
    background: var(--accent-12);
    border-color: var(--accent-60);
  }

  .dot {
    display: grid;
    place-items: center;
    width: 22px;
    height: 22px;
    border-radius: 5px;
    background: var(--abyss-2);
    font-size: 0.7rem;
    font-weight: 600;
    flex-shrink: 0;
  }

  .icon {
    display: grid;
    place-items: center;
    width: 22px;
    height: 22px;
    flex-shrink: 0;
    opacity: 0.85;
  }

  .label {
    transition: opacity 200ms var(--spring-control), width 200ms var(--spring-control);
    white-space: nowrap;
    overflow: hidden;
  }

  .hide {
    opacity: 0;
    width: 0;
    overflow: hidden;
  }

  .collapse {
    margin-top: auto;
    border: 1px solid var(--glass-border);
    color: var(--text-tertiary);
    width: 100%;
    padding: 0.3rem;
    min-height: 44px;
    border-radius: var(--radius-control);
  }

  .resize-handle {
    position: absolute;
    top: 0;
    right: -3px;
    width: 6px;
    height: 100%;
    cursor: col-resize;
    touch-action: none;
    z-index: 5;
    transition: box-shadow 180ms var(--spring-snappy), background 180ms ease;
  }

  .resize-handle:hover,
  .resize-handle:focus-visible {
    background: var(--accent-20);
    box-shadow: 0 0 12px var(--accent-60);
    outline: none;
  }

  .mobile-nav {
    display: none;
  }

  .mobile-nav-label {
    display: none;
  }

  @media (max-width: 1024px) {
    .mobile-nav,
    .mobile-nav-label {
      display: block;
    }

    .mobile-nav {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
      margin-top: 0.5rem;
      border-top: 1px solid var(--glass-border);
      padding-top: 0.5rem;
    }

    .desktop-only {
      display: none;
    }

    .mobile-backdrop {
      display: block;
    }

    .sidebar {
      position: fixed;
      left: 0;
      top: var(--titlebar-height);
      bottom: var(--statusbar-height);
      width: min(320px, 88vw) !important;
      transform: translateX(-105%);
      transition: transform 380ms var(--spring-layout);
      box-shadow: var(--elevation-3);
    }

    .sidebar.mobile-open {
      transform: translateX(0);
    }

    .resize-handle {
      display: none;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .sidebar {
      transition: none;
    }
  }
</style>
