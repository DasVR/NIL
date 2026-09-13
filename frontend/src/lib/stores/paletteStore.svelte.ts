import { appState } from '$lib/stores/appState.svelte.ts';
import { tabsStore } from '$lib/stores/tabsStore';
import { workspace } from '$lib/stores/workspace.svelte.ts';

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
    id: 'start-build',
    label: 'Start building',
    section: 'Session',
    icon: 'hammer',
    action: () => {
      workspace.beginSession('build');
      tabsStore.showStream();
      appState.focusComposer();
    },
  },
  {
    id: 'start-hunt',
    label: 'Start a hunt',
    section: 'Session',
    icon: 'shield',
    action: () => {
      workspace.beginSession('pentest');
      tabsStore.showStream();
      appState.focusComposer();
    },
  },
  {
    id: 'open-source',
    label: 'Open source control',
    section: 'View',
    icon: 'git-branch',
    action: () => workspace.openSide('scm'),
  },
  {
    id: 'open-github',
    label: 'Open GitHub',
    section: 'View',
    icon: 'github',
    action: () => workspace.openSide('github'),
  },
  {
    id: 'open-mcp',
    label: 'Open MCP tools',
    section: 'View',
    icon: 'plug',
    action: () => workspace.openSide('mcp'),
  },
  {
    id: 'new-engagement',
    label: 'New engagement',
    shortcut: 'Cmd+N',
    section: 'Engagement',
    icon: 'plus',
    action: () => {
      void appState.createEngagement(newEngagementName()).then(() => tabsStore.showStream());
    },
  },
  {
    id: 'show-stream',
    label: 'Show stream',
    section: 'View',
    icon: 'rows-3',
    action: () => tabsStore.showStream(),
  },
  {
    id: 'new-terminal',
    label: 'New terminal',
    shortcut: 'Cmd+T',
    section: 'View',
    icon: 'terminal',
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
    icon: 'type',
    action: () => appState.focusComposer(),
  },
  {
    id: 'toggle-sidebar',
    label: 'Toggle sidebar',
    shortcut: 'Cmd+B',
    section: 'View',
    icon: 'panel-left',
    action: () => workspace.togglePin(),
  },
  {
    id: 'toggle-inspector',
    label: 'Toggle inspector',
    shortcut: 'Cmd+\\',
    section: 'View',
    icon: 'panel-right',
    action: () => appState.toggleRightSidebar(),
  },
  {
    id: 'toggle-yolo',
    label: 'Toggle YOLO mode',
    shortcut: 'Cmd+Y',
    section: 'Agent',
    icon: 'fast-forward',
    action: () => { void appState.toggleYolo(); },
  },
  {
    id: 'open-settings',
    label: 'Open settings',
    shortcut: 'Cmd+,',
    section: 'Settings',
    icon: 'settings',
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
