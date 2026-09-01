// Tabs store — custom Svelte store with derived accessors
import { writable, get } from 'svelte/store';

export interface Tab {
  id: string;
  type: 'terminal' | 'editor' | 'preview' | 'diff' | 'chat';
  label: string;
  dirty: boolean;
  data?: any;
}

interface TabsState {
  tabs: Tab[];
  activeTabId: string | null;
}

function createTabsStore() {
  const { subscribe, update } = writable<TabsState>({ tabs: [], activeTabId: null });

  return {
    subscribe,
    get tabs() { return get({ subscribe }).tabs; },
    get activeTabId() { return get({ subscribe }).activeTabId; },
    addTab: (tab: Tab) => update(s => {
      const exists = s.tabs.find(t => t.id === tab.id);
      if (exists) return { ...s, activeTabId: tab.id };
      return { tabs: [...s.tabs, tab], activeTabId: tab.id };
    }),
    closeTab: (id: string) => update(s => {
      const idx = s.tabs.findIndex(t => t.id === id);
      const newTabs = s.tabs.filter(t => t.id !== id);
      let newActive = s.activeTabId;
      if (s.activeTabId === id) {
        newActive = newTabs[idx - 1]?.id || newTabs[0]?.id || null;
      }
      return { tabs: newTabs, activeTabId: newActive };
    }),
    switchTab: (id: string) => update(s => ({ ...s, activeTabId: id })),
    markDirty: (id: string, dirty: boolean) => update(s => ({
      ...s,
      tabs: s.tabs.map(t => t.id === id ? { ...t, dirty } : t)
    })),
  };
}

export const tabsStore = createTabsStore();
