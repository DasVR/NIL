import { appState } from '$lib/stores/appState.svelte.ts';
import { paletteStore } from '$lib/stores/paletteStore.svelte.ts';
import { agentStore } from '$lib/stores/agentStore';
import { tabsStore } from '$lib/stores/tabsStore';
import { workspace } from '$lib/stores/workspace.svelte.ts';

let shortcutsEnabled = $state(true);

function handleKeydown(e: KeyboardEvent) {
  if (!shortcutsEnabled) return;

  const target = e.target as HTMLElement;
  const inField =
    target.tagName === 'INPUT' ||
    target.tagName === 'TEXTAREA' ||
    target.isContentEditable;
  // Modifier chords still run from the composer (⌘K, ⌘,, ⌘B, …).
  // Bare keys stay with the field so typing is never stolen.
  if (inField && !(e.metaKey || e.ctrlKey)) return;

  const isMac = navigator.platform.includes('Mac');
  const mod = isMac ? e.metaKey : e.ctrlKey;
  const shift = e.shiftKey;
  const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;

  if (mod && (key === 'k' || (shift && key === 'p'))) {
    e.preventDefault();
    paletteStore.togglePalette();
    return;
  }

  if (mod && !shift && key === 'j') {
    e.preventDefault();
    appState.focusComposer();
    return;
  }

  if (mod && key === 'Enter' && !shift) {
    if (agentStore.pendingApproval) {
      e.preventDefault();
      agentStore.approve(agentStore.pendingApproval.id);
      return;
    }
  }

  if (mod && shift && key === 'Enter') {
    if (agentStore.pendingApproval) {
      e.preventDefault();
      agentStore.reject(agentStore.pendingApproval.id);
      return;
    }
  }

  if (mod && key === 'y') {
    e.preventDefault();
    appState.toggleYolo();
    return;
  }

  if (mod && key === ',') {
    e.preventDefault();
    appState.toggleSettings();
    return;
  }

  if (mod && key === 'n' && !shift) {
    e.preventDefault();
    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
    void appState.createEngagement(`engagement-${stamp}`).then(() => tabsStore.showStream());
    return;
  }

  if (mod && key === 't') {
    e.preventDefault();
    workspace.selectRail('terminal');
    return;
  }

  if (mod && key === 's') {
    e.preventDefault();
    void workspace.saveActiveFile();
    return;
  }

  if (mod && key === 'w') {
    e.preventDefault();
    if (workspace.dock) {
      workspace.closeDock();
    } else if (tabsStore.activeTabId) {
      tabsStore.closeTab(tabsStore.activeTabId);
    }
    return;
  }

  if (mod && !shift && ['1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(key)) {
    const idx = parseInt(key) - 1;
    const tab = tabsStore.tabs[idx];
    if (tab) {
      e.preventDefault();
      tabsStore.switchTab(tab.id);
    }
    return;
  }

  if (mod && key === 'b' && !shift) {
    e.preventDefault();
    workspace.togglePin();
    return;
  }

  if (mod && key === '\\') {
    e.preventDefault();
    appState.toggleRightSidebar();
    return;
  }

  if (key === 'Escape') {
    // A dialog (palette, settings sheet, model menu) that already consumed this
    // Escape has closed itself synchronously; falling through would yank focus
    // to the composer instead of letting the dialog hand it back to its opener.
    if (e.defaultPrevented) return;
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
    return;
  }

  // Bare G: jump the agent stream to latest (backs the "Jump to latest <kbd>G</kbd>"
  // keycap). Editable targets already returned above, so this never steals typing.
  if (!mod && !shift && key === 'g') {
    if (paletteStore.open || appState.settingsOpen) return;
    window.dispatchEvent(new CustomEvent('nil:jump-latest'));
    return;
  }
}

function init() {
  shortcutsEnabled = true;
}

function destroy() {
  shortcutsEnabled = false;
}

export const keymap = {
  handleKeydown,
  init,
  destroy,
  setEnabled: (enabled: boolean) => { shortcutsEnabled = enabled; },
};
