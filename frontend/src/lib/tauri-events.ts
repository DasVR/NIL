// Tauri event listeners

import { listen, emit } from '@tauri-apps/api/event';
import { appState } from '$lib/stores/appState';
import { agentStore } from '$lib/stores/agentStore';
import { paletteStore } from '$lib/stores/paletteStore';

let unlisteners: (() => void)[] = [];

export async function setupTauriEvents() {
  if (!window.__TAURI__) return;

  // Window controls
  unlisteners.push(await listen('nil:toggle-ai-strip', () => {
    appState.cycleAIStrip();
  }));

  unlisteners.push(await listen('nil:open-palette', () => {
    paletteStore.openPalette();
  }));

  unlisteners.push(await listen('nil:toggle-yolo', () => {
    appState.toggleYolo();
  }));

  unlisteners.push(await listen('nil:new-engagement', () => {
    console.log('New engagement requested');
  }));

  // Theme change from system
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e: MediaQueryListEvent) => {
      if (appState.theme === 'system') {
        appState.theme = 'system'; // triggers applyTheme effect
      }
    });
  }
}

export function cleanupTauriEvents() {
  for (const unlisten of unlisteners) {
    unlisten();
  }
  unlisteners = [];
}

// Emit events to Tauri
export async function emitTauriEvent(event: string, payload?: Record<string, unknown>) {
  if (!window.__TAURI__) return;
  await emit(event, payload);
}