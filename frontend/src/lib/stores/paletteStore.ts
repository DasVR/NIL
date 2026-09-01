// Command palette store (Svelte 5 runes)

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
let commands = $state<PaletteCommand[]>([
  { id: 'new-engagement', label: 'New Engagement', shortcut: 'Cmd+N', action: () => console.log('new engagement'), section: 'Engagement', icon: 'ph:plus-bold' },
  { id: 'open-engagement', label: 'Open Engagement', shortcut: 'Cmd+O', action: () => console.log('open engagement'), section: 'Engagement', icon: 'ph:folder-open-bold' },
  { id: 'save-engagement', label: 'Save Engagement', shortcut: 'Cmd+S', action: () => console.log('save engagement'), section: 'Engagement', icon: 'ph:floppy-disk-bold' },
  { id: 'run-scan', label: 'Run Target Scan', shortcut: 'Cmd+R', action: () => console.log('run scan'), section: 'Tools', icon: 'ph:radar-bold' },
  { id: 'run-nuclei', label: 'Run Nuclei Templates', action: () => console.log('run nuclei'), section: 'Tools', icon: 'ph:play-circle-bold' },
  { id: 'generate-report', label: 'Generate Report', action: () => console.log('generate report'), section: 'Report', icon: 'ph:file-text-bold' },
  { id: 'toggle-ai-strip', label: 'Toggle AI Strip', shortcut: 'Cmd+J', action: () => console.log('toggle ai strip'), section: 'View', icon: 'ph:chat-circle-dots-bold' },
  { id: 'toggle-sidebar', label: 'Toggle Sidebar', shortcut: 'Cmd+B', action: () => console.log('toggle sidebar'), section: 'View', icon: 'ph:sidebar-bold' },
  { id: 'toggle-right-sidebar', label: 'Toggle Inspector', shortcut: 'Cmd+Shift+B', action: () => console.log('toggle right sidebar'), section: 'View', icon: 'ph:sidebar-bold' },
  { id: 'toggle-yolo', label: 'Toggle YOLO Mode', shortcut: 'Cmd+Y', action: () => console.log('toggle yolo'), section: 'Agent', icon: 'ph:rocket-launch-bold' },
  { id: 'open-settings', label: 'Open Settings', shortcut: 'Cmd+,', action: () => console.log('open settings'), section: 'Settings', icon: 'ph:gear-bold' },
  { id: 'open-palette', label: 'Open Command Palette', shortcut: 'Cmd+K', action: () => console.log('open palette'), section: 'Help', icon: 'ph:keyboard-bold' },
]);

export const paletteStore = {
  get open() { return open; },
  set open(v: boolean) { open = v; if (!v) query = ''; },
  get query() { return query; },
  set query(v: string) { query = v; },
  get commands() { return commands; },
  set commands(v: PaletteCommand[]) { commands = v; },

  get filteredCommands() {
    if (!query) return commands;
    const q = query.toLowerCase();
    return commands.filter(c => 
      c.label.toLowerCase().includes(q) || 
      c.shortcut?.toLowerCase().includes(q) ||
      c.section?.toLowerCase().includes(q)
    );
  },

  openPalette: () => { open = true; },
  closePalette: () => { open = false; query = ''; },
  togglePalette: () => { open = !open; if (!open) query = ''; },

  registerCommand: (cmd: PaletteCommand) => {
    commands = [...commands, cmd];
  },

  unregisterCommand: (id: string) => {
    commands = commands.filter(c => c.id !== id);
  },

  registerCommands: (cmds: PaletteCommand[]) => {
    commands = [...commands, ...cmds];
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