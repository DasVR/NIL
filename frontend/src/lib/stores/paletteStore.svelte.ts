import { appState } from '$lib/stores/appState.svelte.ts';
import { workspace } from '$lib/stores/workspace.svelte.ts';
import { refreshProject } from '$lib/project.svelte.ts';
import { agentRun } from '$lib/agent/run.svelte.ts';
import { tabsStore } from '$lib/stores/tabsStore';
import type { NilIconName } from '$lib/ui/NilIcon.svelte';

interface PaletteCommand {
  id: string;
  label: string;
  shortcut?: string;
  action: () => void;
  section?: string;
  icon?: NilIconName;
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
      workspace.showStream();
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
      workspace.showStream();
      appState.focusComposer();
    },
  },
  {
    id: 'mode-build',
    label: 'Switch to Build',
    section: 'Session',
    icon: 'hammer',
    action: () => { workspace.workstationMode = 'build'; },
  },
  {
    id: 'mode-pentest',
    label: 'Switch to Pentest',
    section: 'Session',
    icon: 'shield',
    action: () => { workspace.workstationMode = 'pentest'; },
  },
  {
    id: 'open-files',
    label: 'Open files rail',
    section: 'View',
    icon: 'folder',
    action: () => workspace.openSide('targets'),
  },
  {
    id: 'refresh-workspace',
    label: 'Refresh workspace files',
    section: 'View',
    icon: 'refresh-cw',
    action: () => { void refreshProject(); },
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
    icon: 'git-pull-request',
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
    id: 'export-report',
    label: 'Export report',
    section: 'Engagement',
    icon: 'file-text',
    action: () => { void workspace.exportReport(); },
  },
  {
    id: 'refresh-findings',
    label: 'Refresh findings',
    section: 'Engagement',
    icon: 'flag',
    action: () => {
      const id = appState.activeEngagementId;
      if (id) void agentRun.loadEngagement(id);
    },
  },
  {
    id: 'new-engagement',
    label: 'New engagement',
    shortcut: 'Mod+N',
    section: 'Engagement',
    icon: 'plus',
    action: () => {
      void appState.createEngagement(newEngagementName()).then(() => workspace.showStream());
    },
  },
  {
    id: 'show-stream',
    label: 'Show stream',
    section: 'View',
    icon: 'rows-3',
    action: () => {
      workspace.showStream();
      tabsStore.showStream();
    },
  },
  {
    id: 'show-diffs',
    label: 'Show diffs',
    section: 'View',
    icon: 'git-compare',
    action: () => workspace.selectRail('diffs'),
  },
  {
    id: 'new-terminal',
    label: 'Open terminal',
    shortcut: 'Mod+T',
    section: 'View',
    icon: 'terminal',
    action: () => workspace.selectRail('terminal'),
  },
  {
    id: 'focus-composer',
    label: 'Focus composer',
    shortcut: 'Mod+J',
    section: 'View',
    icon: 'type',
    action: () => appState.focusComposer(),
  },
  {
    id: 'toggle-sidebar',
    label: 'Toggle sidebar',
    shortcut: 'Mod+B',
    section: 'View',
    icon: 'panel-left',
    action: () => workspace.togglePin(),
  },
  {
    id: 'toggle-inspector',
    label: 'Toggle inspector',
    shortcut: 'Mod+\\',
    section: 'View',
    icon: 'panel-right',
    action: () => appState.toggleRightSidebar(),
  },
  {
    id: 'toggle-yolo',
    label: 'Toggle YOLO mode',
    shortcut: 'Mod+Y',
    section: 'Agent',
    icon: 'fast-forward',
    action: () => { void appState.toggleYolo(); },
  },
  {
    id: 'save-file',
    label: 'Save file',
    shortcut: 'Mod+S',
    section: 'View',
    icon: 'save',
    action: () => { void workspace.saveActiveFile(); },
  },
  {
    id: 'open-settings',
    label: 'Open settings',
    shortcut: 'Mod+,',
    section: 'Settings',
    icon: 'settings',
    action: () => appState.toggleSettings(),
  },
];

export const paletteStore = {
  get open() { return open; },
  set open(v: boolean) {
    open = v;
    if (!v) query = '';
    else void refreshProject();
  },
  get query() { return query; },
  set query(v: string) { query = v; },
  get commands() { return commands; },

  openPalette: () => { open = true; void refreshProject(); },
  closePalette: () => { open = false; query = ''; },
  togglePalette: () => {
    open = !open;
    if (!open) query = '';
    else void refreshProject();
  },

  executeCommand: (id: string) => {
    const cmd = commands.find(c => c.id === id);
    if (cmd) {
      cmd.action();
      open = false;
      query = '';
    }
  },
};
