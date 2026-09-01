// Keyboard shortcuts (Svelte 5 runes)

import { appState } from '$lib/stores/appState';
import { paletteStore } from '$lib/stores/paletteStore';
import { agentStore } from '$lib/stores/agentStore';
import { tabsStore } from '$lib/stores/tabsStore';

let shortcutsEnabled = $state(true);

function handleKeydown(e: KeyboardEvent) {
  if (!shortcutsEnabled) return;
  
  // Don't trigger shortcuts when typing in inputs
  const target = e.target as HTMLElement;
  if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
    // Allow Cmd+Enter for approval even in inputs
    if (!((e.metaKey || e.ctrlKey) && e.key === 'Enter')) return;
  }

  const isMac = navigator.platform.includes('Mac');
  const mod = isMac ? e.metaKey : e.ctrlKey;
  const shift = e.shiftKey;

  // Cmd+K / Cmd+Shift+P — Command palette
  if (mod && (e.key === 'k' || (shift && e.key === 'p'))) {
    e.preventDefault();
    paletteStore.togglePalette();
    return;
  }

  // Cmd+J — Toggle AI strip
  if (mod && e.key === 'j') {
    e.preventDefault();
    appState.cycleAIStrip();
    return;
  }

  // Cmd+Enter — Approve pending
  if (mod && e.key === 'Enter' && !shift) {
    if (agentStore.pendingApproval) {
      e.preventDefault();
      agentStore.approve(agentStore.pendingApproval.id);
      return;
    }
  }

  // Cmd+Shift+Enter — Reject pending
  if (mod && shift && e.key === 'Enter') {
    if (agentStore.pendingApproval) {
      e.preventDefault();
      agentStore.reject(agentStore.pendingApproval.id);
      return;
    }
  }

  // Cmd+Y — Toggle YOLO
  if (mod && e.key === 'y') {
    e.preventDefault();
    appState.toggleYolo();
    return;
  }

  // Cmd+, — Settings
  if (mod && e.key === ',') {
    e.preventDefault();
    appState.toggleSettings();
    return;
  }

  // Cmd+T — New terminal tab
  if (mod && e.key === 't') {
    e.preventDefault();
    tabsStore.addTab('terminal');
    return;
  }

  // Cmd+W — Close tab
  if (mod && e.key === 'w') {
    e.preventDefault();
    if (tabsStore.activeTabId) {
      tabsStore.closeTab(tabsStore.activeTabId);
    }
    return;
  }

  // Cmd+1/2/3 — Switch tabs
  if (mod && !shift && ['1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(e.key)) {
    const idx = parseInt(e.key) - 1;
    const tab = tabsStore.tabs[idx];
    if (tab) {
      e.preventDefault();
      tabsStore.setActiveTab(tab.id);
    }
    return;
  }

  // Escape — Peel layer
  if (e.key === 'Escape') {
    // Close palette
    if (paletteStore.open) {
      e.preventDefault();
      paletteStore.closePalette();
      return;
    }
    // Close settings
    if (appState.settingsOpen) {
      e.preventDefault();
      appState.toggleSettings();
      return;
    }
    // Collapse AI strip
    if (appState.aiStripState !== 'collapsed') {
      e.preventDefault();
      appState.aiStripState = 'collapsed';
      return;
    }
  }
}

function init() {
  document.addEventListener('keydown', handleKeydown);
}

function destroy() {
  document.removeEventListener('keydown', handleKeydown);
}

export const keymap = {
  handleKeydown,
  init,
  destroy,
  setEnabled: (enabled: boolean) => { shortcutsEnabled = enabled; },
};