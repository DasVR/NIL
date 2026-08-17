<script>
  import { page } from '$app/stores';
  import { appState } from '$lib/stores.svelte';

  let { isTauri = false } = $props();

  const routeLabels = {
    '/app': 'Chat',
    '/app/findings': 'Findings',
    '/app/notes': 'Notes',
    '/app/tools': 'Tools',
    '/app/creds': 'Creds',
    '/app/reports': 'Reports',
    '/app/loot': 'Loot',
    '/app/settings': 'Settings'
  };

  const pageName = $derived.by(() => {
    const path = $page.url.pathname;
    if (routeLabels[path]) return routeLabels[path];
    for (const [href, label] of Object.entries(routeLabels)) {
      if (path.startsWith(href + '/')) return label;
    }
    return 'Finn';
  });

  const titleText = $derived(`${pageName} · ${appState.engagement}`);

  async function tauriWindow(action) {
    if (!isTauri) return false;
    try {
      const tauriWindowPath = '@tauri-apps/api/window';
      const { getCurrentWindow } = await import(/* @vite-ignore */ tauriWindowPath);
      const win = getCurrentWindow();
      if (action === 'close') await win.close();
      else if (action === 'minimize') await win.minimize();
      else if (action === 'maximize') await win.toggleMaximize();
      return true;
    } catch {
      return false;
    }
  }

  async function handleClose() {
    if (!(await tauriWindow('close'))) {
      if (window.history.length > 1) window.history.back();
    }
  }

  async function handleMinimize() {
    await tauriWindow('minimize');
  }

  async function handleMaximize() {
    await tauriWindow('maximize');
  }
</script>

<header class="window-chrome" aria-label="Window title bar">
  <div class="chrome-left no-drag">
    <div class="traffic-lights" role="toolbar" aria-label="Window controls">
      <button
        type="button"
        class="traffic close"
        onclick={handleClose}
        aria-label="Close window"
        title="Close"
      ></button>
      <button
        type="button"
        class="traffic minimize"
        onclick={handleMinimize}
        aria-label="Minimize window"
        title="Minimize"
      ></button>
      <button
        type="button"
        class="traffic maximize"
        onclick={handleMaximize}
        aria-label="Maximize window"
        title="Maximize"
      ></button>
    </div>
  </div>

  <div class="chrome-center drag-region" title={titleText}>
    <span class="page-name">{pageName}</span>
    <span class="sep" aria-hidden="true">·</span>
    <span class="engagement-name">{appState.engagement}</span>
  </div>

  <div class="chrome-right no-drag" aria-hidden="true"></div>
</header>

<style>
  .window-chrome {
    grid-column: 1 / -1;
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    height: var(--titlebar-height);
    padding: 0 12px;
    background: rgba(10, 10, 12, 0.82);
    border-bottom: 1px solid var(--glass-border);
    backdrop-filter: blur(12px) saturate(1.15);
    -webkit-backdrop-filter: blur(12px) saturate(1.15);
    box-shadow: var(--elevation-1);
    user-select: none;
    z-index: 20;
    flex-shrink: 0;
  }

  .drag-region {
    -webkit-app-region: drag;
    app-region: drag;
  }

  .no-drag {
    -webkit-app-region: no-drag;
    app-region: no-drag;
  }

  .chrome-left {
    justify-self: start;
  }

  .chrome-center {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.45rem;
    min-width: 0;
    max-width: 100%;
    font-size: 12px;
    font-weight: 500;
    color: var(--text-secondary);
    letter-spacing: -0.01em;
  }

  .page-name {
    color: var(--text-primary);
    white-space: nowrap;
  }

  .engagement-name {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--accent);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 180px;
  }

  .sep {
    color: var(--text-tertiary);
    opacity: 0.6;
  }

  .chrome-right {
    width: 68px;
    justify-self: end;
  }

  .traffic-lights {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .traffic {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: none;
    padding: 0;
    cursor: pointer;
    transition: transform 180ms var(--spring-snappy), filter 120ms ease;
  }

  .traffic:hover {
    transform: scale(1.1);
    filter: brightness(1.08);
  }

  .traffic:active {
    transform: scale(0.94);
  }

  .traffic.close { background: #ff5f57; }
  .traffic.minimize { background: #febc2e; }
  .traffic.maximize { background: #28c840; }

  .traffic:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }

  @media (prefers-reduced-motion: reduce) {
    .traffic {
      transition: none;
    }
  }

  @media (max-width: 480px) {
    .engagement-name {
      max-width: 100px;
    }
  }
</style>
