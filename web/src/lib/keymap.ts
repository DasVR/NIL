export type Shortcut =
  | 'palette'
  | 'gotoTarget'
  | 'toggleAi'
  | 'pinAi'
  | 'settings'
  | 'toggleLeft'
  | 'toggleRight'
  | 'toggleYolo'
  | 'newSpace'
  | 'focusTerminal'
  | 'artifact'
  | 'split'
  | 'focusLeft'
  | 'focusCenter'
  | 'focusRight'
  | 'approve'
  | 'reject'
  | 'save'
  | 'escape'
  | 'spaceSwitch';

export function isMod(ev: KeyboardEvent): boolean {
  return ev.metaKey || ev.ctrlKey;
}

export function isTypingTarget(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  return el.isContentEditable;
}

export type ResolvedShortcut = {
  name: Shortcut;
  spaceIndex?: number;
};

export function resolveShortcut(ev: KeyboardEvent): ResolvedShortcut | null {
  const key = ev.key.length === 1 ? ev.key.toLowerCase() : ev.key;
  const mod = isMod(ev);
  const shift = ev.shiftKey;
  const ctrl = ev.ctrlKey;
  const meta = ev.metaKey;

  if (key === 'Escape') return { name: 'escape' };

  if (ctrl && !meta && !shift && /^[1-9]$/.test(ev.key)) {
    return { name: 'spaceSwitch', spaceIndex: Number(ev.key) - 1 };
  }

  if (!mod) return null;

  if (key === 'k' && !shift) return { name: 'palette' };
  if (key === 'p' && !shift) return { name: 'gotoTarget' };
  if (key === 'j' && shift) return { name: 'pinAi' };
  if (key === 'j' && !shift) return { name: 'toggleAi' };
  if (key === ',' && !shift) return { name: 'settings' };
  if (key === 'b' && shift) return { name: 'toggleRight' };
  if (key === 'b' && !shift) return { name: 'toggleLeft' };
  if (key === 'y' && !shift) return { name: 'toggleYolo' };
  if (key === 'n' && !shift) return { name: 'newSpace' };
  if (key === 't' && !shift) return { name: 'focusTerminal' };
  if (key === 'e' && !shift) return { name: 'artifact' };
  if (key === '\\' && !shift) return { name: 'split' };
  if (key === '1' && !shift) return { name: 'focusLeft' };
  if (key === '2' && !shift) return { name: 'focusCenter' };
  if (key === '3' && !shift) return { name: 'focusRight' };
  if (key === 'enter' && shift) return { name: 'reject' };
  if (key === 'enter' && !shift) return { name: 'approve' };
  if (key === 's' && !shift) return { name: 'save' };

  return null;
}

export const PALETTE_RECENTS_KEY = 'finn.palette.recents';

export const SHORTCUT_HELP: { keys: string; action: string }[] = [
  { keys: '⌘K', action: 'Command palette' },
  { keys: '⌘P', action: 'Go to target' },
  { keys: '⌘J', action: 'Toggle AI strip' },
  { keys: '⌘⇧J', action: 'Pin AI strip' },
  { keys: '⌘,', action: 'Settings' },
  { keys: '⌘B', action: 'Toggle sidebar' },
  { keys: '⌘⇧B', action: 'Toggle inspector' },
  { keys: '⌘Y', action: 'Toggle YOLO' },
  { keys: '⌘N', action: 'New Space' },
  { keys: '⌘T', action: 'Focus terminal' },
  { keys: '⌘E', action: 'Artifact view' },
  { keys: '⌘\\', action: 'Split view' },
  { keys: '⌘1/2/3', action: 'Focus panes' },
  { keys: '⌘↵', action: 'Approve pending' },
  { keys: '⌘⇧↵', action: 'Reject pending' },
  { keys: '⌘S', action: 'Save notes / artifact' },
  { keys: 'Ctrl+1–9', action: 'Switch Space' },
  { keys: 'Esc', action: 'Peel one layer' }
];
