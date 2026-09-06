import { appState } from '$lib/stores/appState.svelte.ts';
import { paletteStore } from '$lib/stores/paletteStore.svelte.ts';
import { agentStore } from '$lib/stores/agentStore';
import { tabsStore } from '$lib/stores/tabsStore';

let shortcutsEnabled = $state(true);

function handleKeydown(e: KeyboardEvent) {
  if (!shortcutsEnabled) return;

  const target = e.target as HTMLElement;
  if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
    if (!((e.metaKey || e.ctrlKey) && e.key === 'Enter')) return;
  }

  const isMac = navigator.platform.includes('Mac');
  const mod = isMac ? e.metaKey : e.ctrlKey;
  const shift = e.shiftKey;

  if (mod && (e.key === 'k' || (shift && e.key === 'p'))) {
    e.preventDefault();
    paletteStore.togglePalette();
    return;
  }

  if (mod && !shift && e.key === 'j') {
    e.preventDefault();
    appState.focusComposer();
    return;
  }

  if (mod && e.key === 'Enter' && !shift) {
    if (agentStore.pendingApproval) {
      e.preventDefault();
      agentStore.approve(agentStore.pendingApproval.id);
      return;
    }
  }

  if (mod && shift && e.key === 'Enter') {
    if (agentStore.pendingApproval) {
      e.preventDefault();
      agentStore.reject(agentStore.pendingApproval.id);
      return;
    }
  }

  if (mod && e.key === 'y') {
    e.preventDefault();
    appState.toggleYolo();
    return;
  }

  if (mod && e.key === ',') {
    e.preventDefault();
    appState.toggleSettings();
    return;
  }

  if (mod && e.key === 'n' && !shift) {
    e.preventDefault();
    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
    void appState.createEngagement(`engagement-${stamp}`).then(() => tabsStore.showStream());
    return;
  }

  if (mod && e.key === 't') {
    e.preventDefault();
    const id = `terminal-${Date.now()}`;
    tabsStore.addTab({ id, type: 'terminal', label: 'Terminal', dirty: false });
    return;
  }

  if (mod && e.key === 'w') {
    e.preventDefault();
    if (tabsStore.activeTabId) {
      tabsStore.closeTab(tabsStore.activeTabId);
    }
    return;
  }

  if (mod && !shift && ['1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(e.key)) {
    const idx = parseInt(e.key) - 1;
    const tab = tabsStore.tabs[idx];
    if (tab) {
      e.preventDefault();
      tabsStore.switchTab(tab.id);
    }
    return;
  }

  if (mod && e.key === 'b' && !shift) {
    e.preventDefault();
    appState.toggleSidebar();
    return;
  }

  if (mod && e.key === '\\') {
    e.preventDefault();
    appState.toggleRightSidebar();
    return;
  }

  if (e.key === 'Escape') {
    if (paletteStore.open) {
      e.preventDefault();
      paletteStore.closePalette();
      return;
    }
    if (appState.settingsOpen) {
      e.preventDefault();
      appState.toggleSettings();
      return;
    }
    appState.focusComposer();
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
