import { listen } from '@tauri-apps/api/event';
import { appState } from '$lib/stores/appState.svelte.ts';
import { paletteStore } from '$lib/stores/paletteStore.svelte.ts';

let unlisteners: (() => void)[] = [];

export async function setupTauriEvents() {
  if (!window.__TAURI__) return;

  unlisteners.push(await listen('nil:focus-composer', () => {
    appState.focusComposer();
  }));

  unlisteners.push(await listen('nil:open-palette', () => {
    paletteStore.openPalette();
  }));

  unlisteners.push(await listen('nil:toggle-yolo', () => {
    appState.toggleYolo();
  }));
}
