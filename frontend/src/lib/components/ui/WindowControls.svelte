<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { shortcutLabel } from '$lib/shortcuts';

  interface TauriWindow {
    minimize: () => void;
    toggleMaximize: () => void;
    close: () => void;
    isMaximized: () => Promise<boolean>;
    onMaximizedChanged: (cb: (event: { payload: boolean }) => void) => void;
  }

  let minimizeBtn: HTMLButtonElement;
  let maximizeBtn: HTMLButtonElement;
  let closeBtn: HTMLButtonElement;
  let maximized = $state(false);

  onMount(() => {
    if (!browser) return;
    const tauri = (window as Window & { __TAURI__?: { appWindow?: TauriWindow } }).__TAURI__;
    if (!tauri?.appWindow) return;

    const appWindow = tauri.appWindow;

    minimizeBtn?.addEventListener('click', () => appWindow.minimize());
    maximizeBtn?.addEventListener('click', () => appWindow.toggleMaximize());
    closeBtn?.addEventListener('click', () => appWindow.close());

    void appWindow.isMaximized().then((next) => {
      maximized = next;
    });

    appWindow.onMaximizedChanged((event) => {
      maximized = event.payload;
    });
  });
</script>

<div class="window-controls" role="group" aria-label="Window controls">
  <button
    class="window-btn nil-halo"
    bind:this={minimizeBtn}
    aria-label="Minimize"
    title={`Minimize (${shortcutLabel('Mod+M')})`}
  >
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  </button>

  <button
    class="window-btn nil-halo"
    bind:this={maximizeBtn}
    aria-label={maximized ? 'Restore' : 'Maximize'}
    title="Maximize"
  >
    {#if maximized}
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M4 4h6a2 2 0 0 1 2 2v6"/>
        <path d="M14 4h6a2 2 0 0 1 2 2v6"/>
        <path d="M4 14h6a2 2 0 0 1 2 2v6"/>
        <path d="M14 14h6a2 2 0 0 1 2 2v6"/>
      </svg>
    {:else}
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
      </svg>
    {/if}
  </button>

  <button
    class="window-btn nil-halo"
    bind:this={closeBtn}
    aria-label="Close"
    title={`Close (${shortcutLabel('Mod+W')})`}
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
    border-radius: var(--r-field);
    background: transparent;
    color: var(--nil-ink-3);
    cursor: pointer;
  }

  .window-btn:hover {
    background: var(--nil-raised);
    color: var(--nil-ink);
  }

  @media (min-width: 0) {
    :global(.tauri-titlebar-overlay) .window-controls {
      display: none;
    }
  }
</style>
