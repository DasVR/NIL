<script>
  import { appState } from '$lib/stores.svelte';
  import { page } from '$app/stores';

  let { collapsed = false, onToggle = () => {} } = $props();

  const items = [
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
    window.removeEventListener('mousemove', onResize);
    window.removeEventListener('mouseup', stopResize);
  }

  async function addEngagement() {
    const name = prompt('Engagement name?');
    if (name) await appState.createEngagement(name.trim());
  }

  function isActive(href) {
    return $page.url.pathname === href || $page.url.pathname.startsWith(href + '/');
  }
</script>

{#snippet navIcon(name)}
  {#if name === 'chat'}
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
  {:else if name === 'findings'}
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/></svg>
  {:else if name === 'notes'}
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
  {:else if name === 'tools'}
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>
  {:else if name === 'creds'}
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
  {:else if name === 'reports'}
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
  {:else if name === 'loot'}
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>
  {:else}
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
  {/if}
{/snippet}

<aside class="sidebar" role="complementary" aria-label="Sidebar"
  class:collapsed
  style={collapsed ? '' : `--local-width:${sidebarWidth}px`}>
  <div class="brand">
    <span class="logo">F</span>
    <span class="brand-text">Finn</span>
  </div>

  <button class="palette-btn" onclick={() => (appState.paletteOpen = true)} aria-label="Open command palette">
    <span class="palette-left">
      <svg class="palette-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <circle cx="11" cy="11" r="7"/><path d="M20 20l-3-3"/>
      </svg>
      <span class="label" class:hide={collapsed}>Search…</span>
    </span>
    <kbd class="palette-kbd" class:hide={collapsed}>⌘K</kbd>
  </button>

  <div class="section" class:hide={collapsed}>Engagements</div>
  <div class="engagements">
    {#each appState.engagements as eng}
      <button
        class="row"
        class:active={eng.name === appState.engagement}
        onclick={() => appState.select(eng.name)}
        aria-label={`Select engagement ${eng.name}`}
        title={eng.name}
      >
        <span class="dot">{eng.name[0]?.toUpperCase() || '?'}</span>
        <span class="label" class:hide={collapsed}>{eng.name}</span>
      </button>
    {/each}
    <button class="row muted" onclick={addEngagement} aria-label="New engagement" title="New engagement">
      <span class="dot">+</span>
      <span class="label" class:hide={collapsed}>New</span>
    </button>
  </div>

  <div class="section" class:hide={collapsed}>Navigate</div>
  <nav aria-label="App navigation">
    {#each items as item}
      <a
        class="row nav-row"
        class:active={isActive(item.href)}
        href={item.href}
        aria-current={isActive(item.href) ? 'page' : undefined}
        aria-label={item.label}
        title={item.label}
      >
        <span class="icon">{@render navIcon(item.icon)}</span>
        <span class="label" class:hide={collapsed}>{item.label}</span>
      </a>
    {/each}
  </nav>

  <button class="collapse" onclick={onToggle} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
    {collapsed ? '→' : '←'}
  </button>

  {#if !collapsed}
    <div
      class="resize-handle"
      role="separator"
      aria-orientation="vertical"
      aria-valuemin={200}
      aria-valuemax={400}
      aria-valuenow={sidebarWidth}
      onmousedown={startResize}
      tabindex="0"
    ></div>
  {/if}
</aside>

<style>
  .sidebar {
    grid-column: 1;
    grid-row: 1 / span 2;
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    padding: 0.75rem 0.6rem;
    background: var(--glass);
    border-right: 1px solid var(--glass-border);
    backdrop-filter: blur(24px) saturate(1.2);
    -webkit-backdrop-filter: blur(24px) saturate(1.2);
    transition: width 380ms var(--spring-layout), padding 200ms var(--spring-layout);
    width: var(--sidebar-width, 260px);
    min-width: 0;
  }
  .sidebar.collapsed {
    width: 72px;
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
  }
  .brand-text {
    font-weight: 700;
    color: var(--accent);
    font-size: 1.05rem;
    transition: opacity 200ms var(--spring-control);
  }
  .collapsed .brand-text { opacity: 0; width: 0; }

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
    border-radius: 999px;
    transition:
      background 180ms var(--spring-control),
      border-color 180ms var(--spring-control),
      transform 180ms var(--spring-control);
  }

  .palette-btn:hover {
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(255, 255, 255, 0.12);
    transform: translateY(-1px);
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
    font-size: 0.65rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text-tertiary);
    margin: 0.7rem 0.4rem 0.2rem;
    transition: opacity 200ms var(--spring-control), height 200ms var(--spring-control);
  }

  .engagements {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
    max-height: 35vh;
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
    padding: 0.4rem 0.55rem;
    border-radius: 999px;
    text-decoration: none;
    cursor: pointer;
    transition:
      background 180ms var(--spring-control),
      color 120ms var(--spring-control),
      transform 180ms var(--spring-control),
      box-shadow 180ms var(--spring-control);
    font-size: 0.85rem;
  }

  .nav-row:hover {
    background: rgba(255, 255, 255, 0.05);
    color: var(--text-primary);
    transform: translateY(-1px);
  }

  .row:hover {
    background: rgba(255, 255, 255, 0.05);
    color: var(--text-primary);
  }

  .nav-row.active,
  .row.active {
    background: var(--accent-12);
    color: var(--text-primary);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.06),
      inset 0 -1px 0 rgba(0, 0, 0, 0.25);
  }

  .row.muted { color: var(--text-tertiary); }

  .dot {
    display: grid;
    place-items: center;
    width: 22px;
    height: 22px;
    border-radius: 5px;
    background: var(--abyss-1);
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
  .hide { opacity: 0; width: 0; }

  .collapse {
    margin-top: auto;
    border: 1px solid var(--glass-border);
    color: var(--text-tertiary);
    width: 100%;
    padding: 0.3rem;
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
  }
  .resize-handle:hover, .resize-handle:focus-visible {
    background: rgba(0, 217, 146, 0.25);
    outline: none;
  }

  @media (prefers-reduced-motion: reduce) {
    .palette-btn:hover,
    .nav-row:hover {
      transform: none;
    }
  }

  @media (max-width: 768px) {
    .sidebar {
      position: fixed;
      left: 0;
      top: 0;
      bottom: 0;
      z-index: 90;
      transform: translateX(-100%);
      transition: transform 380ms var(--spring-layout), width 380ms var(--spring-layout);
      width: min(320px, 85vw);
    }
    .sidebar.collapsed { transform: translateX(0); }
    .resize-handle { display: none; }
    .collapse { display: none; }
  }
</style>
