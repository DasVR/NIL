<script>
  import { appState } from '$lib/stores.svelte';
  import { page } from '$app/stores';

  let { collapsed = false, onToggle = () => {} } = $props();

  const items = [
    { href: '/app', label: 'Chat', icon: '💬' },
    { href: '/app/findings', label: 'Findings', icon: '🎯' },
    { href: '/app/notes', label: 'Notes', icon: '📝' },
    { href: '/app/tools', label: 'Tools', icon: '🧰' },
    { href: '/app/creds', label: 'Creds', icon: '🔐' },
    { href: '/app/reports', label: 'Reports', icon: '📄' },
    { href: '/app/loot', label: 'Loot', icon: '📁' },
    { href: '/app/settings', label: 'Settings', icon: '⚙️' }
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

<aside class="sidebar" role="complementary" aria-label="Sidebar"
  class:collapsed
  style={collapsed ? '' : `--local-width:${sidebarWidth}px`}>
  <div class="brand">
    <span class="logo">F</span>
    <span class="brand-text">Finn</span>
  </div>

  <button class="palette-btn" onclick={() => (appState.paletteOpen = true)} aria-label="Open command palette">
    <span class="key">⌘K</span>
    <span class="label" class:hide={collapsed}>command palette</span>
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
        class="row"
        class:active={isActive(item.href)}
        href={item.href}
        aria-current={isActive(item.href) ? 'page' : undefined}
        aria-label={item.label}
        title={item.label}
      >
        <span class="icon">{item.icon}</span>
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
    gap: 0.5rem;
    width: 100%;
    text-align: left;
    border-color: var(--glass-border);
    color: var(--text-secondary);
    margin: 0.4rem 0;
    font-size: 0.78rem;
    padding: 0.35rem 0.5rem;
  }
  .key {
    font-family: var(--font-mono);
    font-size: 0.65rem;
    background: var(--abyss-1);
    padding: 0.1rem 0.3rem;
    border-radius: 4px;
    border: 1px solid var(--glass-border);
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
    padding: 0.4rem 0.5rem;
    border-radius: var(--radius-control);
    text-decoration: none;
    cursor: pointer;
    transition: background 180ms var(--spring-control), color 120ms var(--spring-control);
    font-size: 0.85rem;
  }
  .row:hover, .row.active {
    background: rgba(255, 255, 255, 0.06);
    color: var(--text-primary);
  }
  .row.active {
    box-shadow: inset 2px 0 0 var(--accent);
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
    width: 22px;
    text-align: center;
    flex-shrink: 0;
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
