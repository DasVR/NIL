import { appState } from '$lib/stores/appState.svelte.ts';
import { tabsStore } from '$lib/stores/tabsStore';

interface PaletteCommand {
  id: string;
  label: string;
  shortcut?: string;
  action: () => void;
  section?: string;
  icon?: string;
}

let open = $state(false);
let query = $state('');

function newEngagementName(): string {
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
  return `engagement-${stamp}`;
}

const commands: PaletteCommand[] = [
  {
    id: 'new-engagement',
    label: 'New engagement',
    shortcut: 'Cmd+N',
    section: 'Engagement',
    icon: 'ph:plus-bold',
    action: () => {
      void appState.createEngagement(newEngagementName()).then(() => tabsStore.showStream());
    },
  },
  {
    id: 'show-stream',
    label: 'Show stream',
    section: 'View',
    icon: 'ph:rows-bold',
    action: () => tabsStore.showStream(),
  },
  {
    id: 'new-terminal',
    label: 'New terminal',
    shortcut: 'Cmd+T',
    section: 'View',
    icon: 'ph:terminal-bold',
    action: () => {
      const id = `terminal-${Date.now()}`;
      tabsStore.addTab({ id, type: 'terminal', label: 'Terminal', dirty: false });
    },
  },
  {
    id: 'focus-composer',
    label: 'Focus composer',
    shortcut: 'Cmd+J',
    section: 'View',
    icon: 'ph:text-aa-bold',
    action: () => appState.focusComposer(),
  },
  {
    id: 'toggle-sidebar',
    label: 'Toggle sidebar',
    shortcut: 'Cmd+B',
    section: 'View',
    icon: 'ph:sidebar-simple-bold',
    action: () => appState.toggleSidebar(),
  },
  {
    id: 'toggle-inspector',
    label: 'Toggle inspector',
    shortcut: 'Cmd+\\',
    section: 'View',
    icon: 'ph:sidebar-simple-bold',
    action: () => appState.toggleRightSidebar(),
  },
  {
    id: 'toggle-yolo',
    label: 'Toggle YOLO mode',
    shortcut: 'Cmd+Y',
    section: 'Agent',
    icon: 'ph:fast-forward-bold',
    action: () => { void appState.toggleYolo(); },
  },
  {
    id: 'open-settings',
    label: 'Open settings',
    shortcut: 'Cmd+,',
    section: 'Settings',
    icon: 'ph:gear-bold',
    action: () => appState.toggleSettings(),
  },
];

export const paletteStore = {
  get open() { return open; },
  set open(v: boolean) { open = v; if (!v) query = ''; },
  get query() { return query; },
  set query(v: string) { query = v; },
  get commands() { return commands; },

  openPalette: () => { open = true; },
  closePalette: () => { open = false; query = ''; },
  togglePalette: () => { open = !open; if (!open) query = ''; },

  executeCommand: (id: string) => {
    const cmd = commands.find(c => c.id === id);
    if (cmd) {
      cmd.action();
      open = false;
      query = '';
    }
  },
};
