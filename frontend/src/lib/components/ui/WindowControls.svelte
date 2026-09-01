<script lang="ts">
  import { onMount } from 'svelte';

  let minimizeBtn: HTMLButtonElement;
  let maximizeBtn: HTMLButtonElement;
  let closeBtn: HTMLButtonElement;

  const tauri = (window as any).__TAURI__;

  onMount(() => {
    if (!tauri?.appWindow) return;

    const appWindow = tauri.appWindow;

    minimizeBtn?.addEventListener('click', () => appWindow.minimize());
    maximizeBtn?.addEventListener('click', () => appWindow.toggleMaximize());
    closeBtn?.addEventListener('click', () => appWindow.close());

    appWindow.isMaximized().then((maximized: boolean) => {
      updateMaximizeIcon(maximized);
    });

    appWindow.onMaximizedChanged((event: { payload: boolean }) => {
      updateMaximizeIcon(event.payload);
    });
  });

  function updateMaximizeIcon(maximized: boolean) {
    if (!maximizeBtn) return;
    maximizeBtn.innerHTML = maximized
      ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h6a2 2 0 0 1 2 2v6"/><path d="M14 4h6a2 2 0 0 1 2 2v6"/><path d="M4 14h6a2 2 0 0 1 2 2v6"/><path d="M14 14h6a2 2 0 0 1 2 2v6"/></svg>'
      : '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>';
  }

  function handleCloseHover(entering: boolean) {
    if (!closeBtn) return;
    if (entering) {
      closeBtn.style.background = 'var(--color-danger)';
      closeBtn.style.color = 'var(--color-abyss-0)';
    } else {
      closeBtn.style.background = 'transparent';
      closeBtn.style.color = 'var(--text-tertiary)';
    }
  }
</script>

<div class="window-controls" role="group" aria-label="Window controls">
  <button
    class="window-btn"
    bind:this={minimizeBtn}
    aria-label="Minimize"
    title="Minimize (Cmd+M)"
  >
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  </button>

  <button
    class="window-btn"
    bind:this={maximizeBtn}
    aria-label="Maximize"
    title="Maximize"
  >
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
    </svg>
  </button>

  <button
    class="window-btn window-btn--close"
    bind:this={closeBtn}
    aria-label="Close"
    title="Close (Cmd+W)"
    onmouseenter={() => handleCloseHover(true)}
    onmouseleave={() => handleCloseHover(false)}
  >
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  </button>
</div>

<style>
  .window-controls {
    display: flex;
    gap: 6px;
    margin-left: 8px;
  }

  .window-btn {
    display: grid;
    place-items: center;
    width: 28px;
    height: 28px;
    border: none;
    border-radius: var(--radius-control);
    background: transparent;
    color: var(--text-tertiary);
    cursor: pointer;
    transition: background-color var(--spring-snappy), color var(--spring-snappy);
  }

  .window-btn:hover {
    background: var(--surface-hover);
    color: var(--text-primary);
  }

  .window-btn:focus-visible {
    outline: 2px solid var(--accent-primary);
    outline-offset: 2px;
  }

  .window-btn--close:hover {
    background: var(--color-danger);
    color: var(--color-abyss-0);
  }

  .window-btn--close:focus-visible {
    outline-color: var(--color-danger);
  }

  @media (min-width: 0) {
    :global(.tauri-titlebar-overlay) .window-controls {
      display: none;
    }
  }
</style>
