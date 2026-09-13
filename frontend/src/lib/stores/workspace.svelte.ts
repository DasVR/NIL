import { tabsStore } from '$lib/stores/tabsStore';
import { appState, type ComposerMode } from '$lib/stores/appState.svelte.ts';

export type RailId = 'files' | 'terminal' | 'diffs' | 'pentest';
export type WorkstationMode = 'build' | 'pentest';
export type SidePanel = 'targets' | 'scm' | 'github' | 'mcp';
export type ClarifyId =
  | 'files'
  | 'task'
  | 'diff'
  | 'small'
  | 'broad'
  | 'ask'
  | 'stream'
  | 'terminal'
  | 'pin'
  | 'other';

export interface ClarifyQuestion {
  title: string;
  options: { id: ClarifyId; label: string }[];
}

export interface DockJob {
  id: string;
  title: string;
  kind: 'terminal' | 'test' | 'build' | 'lint' | 'command';
  status: 'running' | 'ok' | 'error';
  output: string;
}

export interface ContextFile {
  id: string;
  path: string;
  label: string;
}

export interface ModelOption {
  id: string;
  name: string;
  description: string;
}

const MODELS: ModelOption[] = [
  { id: 'default', name: 'Default', description: 'Whatever the harness is configured to use' },
  { id: 'fast', name: 'Fast', description: 'Lower latency, lighter reasoning' },
  { id: 'strong', name: 'Strong', description: 'Deeper reasoning for hard hunts and refactors' },
];

const RAIL_WIDTH = 48;

const ONBOARD: ClarifyQuestion[] = [
  {
    title: 'What should we work on first?',
    options: [
      { id: 'files', label: 'Open files in the rail' },
      { id: 'task', label: 'Describe a task in the composer' },
      { id: 'diff', label: 'Review the current diff' },
    ],
  },
  {
    title: 'How should NIL treat this session?',
    options: [
      { id: 'small', label: 'Small, reviewable edits' },
      { id: 'broad', label: 'Broader changes when the task needs them' },
      { id: 'ask', label: 'Ask before changing files' },
    ],
  },
  {
    title: 'Where should we land when work starts?',
    options: [
      { id: 'stream', label: 'Stay on the stream' },
      { id: 'terminal', label: 'Keep a terminal ready' },
      { id: 'pin', label: 'Keep the file rail pinned' },
    ],
  },
];

let activeRail = $state<RailId>('files');
let railPinned = $state(false);
let sidePanel = $state<SidePanel>('targets');
let workstationMode = $state<WorkstationMode>('build');
let sessionStarted = $state(false);
let clarifyIndex = $state<number | null>(null);
let pendingMode = $state<WorkstationMode | null>(null);
let dock = $state<DockJob | null>(null);
let dockLinger: ReturnType<typeof setTimeout> | null = null;
let attached = $state<ContextFile[]>([]);
let modelId = $state('default');
let effort = $state<'low' | 'medium' | 'high'>('medium');
let dictationActive = $state(false);

function pentestMode(mode: ComposerMode): boolean {
  switch (mode) {
    case 'hunt':
    case 'exploit':
    case 'report':
      return true;
    case 'chat':
    case 'code':
      return false;
    default: {
      const _n: never = mode;
      return _n;
    }
  }
}

function applyMode(next: WorkstationMode) {
  workstationMode = next;
  if (next === 'build') appState.composerMode = 'code';
  else if (!pentestMode(appState.composerMode)) appState.composerMode = 'hunt';
}

function applyClarify(id: ClarifyId) {
  switch (id) {
    case 'files':
    case 'pin':
      activeRail = 'files';
      railPinned = true;
      appState.sidebarOpen = true;
      break;
    case 'task':
    case 'other':
      appState.focusComposer();
      break;
    case 'diff':
      selectRail('diffs');
      break;
    case 'small':
      effort = 'low';
      break;
    case 'broad':
      effort = 'high';
      break;
    case 'ask':
      effort = 'medium';
      break;
    case 'stream':
      tabsStore.showStream();
      break;
    case 'terminal':
      selectRail('terminal');
      break;
    default: {
      const _n: never = id;
      return _n;
    }
  }
}

function parseClarify(id: string): ClarifyId {
  switch (id) {
    case 'files':
    case 'task':
    case 'diff':
    case 'small':
    case 'broad':
    case 'ask':
    case 'stream':
    case 'terminal':
    case 'pin':
    case 'other':
      return id;
    default:
      return 'other';
  }
}

function selectRail(id: RailId) {
  switch (id) {
    case 'files':
      if (activeRail === 'files' && railPinned) {
        railPinned = false;
      } else {
        activeRail = 'files';
        railPinned = true;
      }
      appState.sidebarOpen = railPinned;
      break;
    case 'terminal':
      activeRail = 'terminal';
      railPinned = false;
      appState.sidebarOpen = false;
      openDock({
        id: `term-${Date.now()}`,
        title: 'Terminal',
        kind: 'terminal',
        status: 'running',
        output: '',
      });
      tabsStore.addTab({
        id: `terminal-${Date.now()}`,
        type: 'terminal',
        label: 'Terminal',
        dirty: false,
      });
      break;
    case 'diffs':
      activeRail = 'diffs';
      railPinned = false;
      appState.sidebarOpen = false;
      tabsStore.addTab({
        id: 'diffs',
        type: 'diff',
        label: 'Diffs',
        dirty: false,
      });
      break;
    case 'pentest':
      activeRail = 'pentest';
      railPinned = false;
      appState.sidebarOpen = false;
      applyMode('pentest');
      tabsStore.showStream();
      break;
    default: {
      const _n: never = id;
      return _n;
    }
  }
}

function openDock(job: DockJob) {
  if (dockLinger) {
    clearTimeout(dockLinger);
    dockLinger = null;
  }
  dock = job;
}

function updateDock(patch: Partial<DockJob>) {
  if (!dock) return;
  dock = { ...dock, ...patch };
  if (patch.status && patch.status !== 'running') {
    dockLinger = setTimeout(() => {
      dock = null;
      dockLinger = null;
    }, 900);
  }
}

function closeDock() {
  if (dockLinger) {
    clearTimeout(dockLinger);
    dockLinger = null;
  }
  dock = null;
}

function attachFile(file: ContextFile) {
  if (attached.some((f) => f.id === file.id)) return;
  attached = [...attached, file];
}

function detachFile(id: string) {
  attached = attached.filter((f) => f.id !== id);
}

function togglePin() {
  railPinned = !railPinned;
  if (railPinned) activeRail = 'files';
  appState.sidebarOpen = railPinned;
}

function openSide(panel: SidePanel) {
  sidePanel = panel;
  railPinned = true;
  activeRail = 'files';
  appState.sidebarOpen = true;
}

function beginSession(mode: WorkstationMode) {
  sessionStarted = true;
  applyMode(mode);
  pendingMode = null;
  if (mode === 'pentest') {
    clarifyIndex = null;
    selectRail('pentest');
  } else {
    clarifyIndex = 0;
    tabsStore.showStream();
  }
}

function requestMode(next: WorkstationMode) {
  if (next === workstationMode) {
    pendingMode = null;
    return;
  }
  pendingMode = next;
}

function commitPendingMode() {
  if (pendingMode) applyMode(pendingMode);
  pendingMode = null;
}

function cancelPendingMode() {
  pendingMode = null;
}

function answerClarify(id: string) {
  applyClarify(parseClarify(id));
  if (clarifyIndex == null) return;
  if (clarifyIndex < ONBOARD.length - 1) clarifyIndex += 1;
  else clarifyIndex = null;
}

function prevClarify() {
  if (clarifyIndex == null) return;
  clarifyIndex = Math.max(0, clarifyIndex - 1);
}

function nextClarify() {
  if (clarifyIndex == null) return;
  clarifyIndex = Math.min(ONBOARD.length - 1, clarifyIndex + 1);
}

export const workspace = {
  RAIL_WIDTH,
  get activeRail() { return activeRail; },
  get railPinned() { return railPinned; },
  set railPinned(v: boolean) { railPinned = v; },
  get sidePanel() { return sidePanel; },
  set sidePanel(v: SidePanel) { sidePanel = v; },
  get workstationMode() { return workstationMode; },
  set workstationMode(v: WorkstationMode) { applyMode(v); },
  get sessionStarted() { return sessionStarted; },
  get clarify() {
    if (clarifyIndex == null) return null;
    const q = ONBOARD[clarifyIndex];
    return q ? { ...q, index: clarifyIndex + 1, total: ONBOARD.length } : null;
  },
  get pendingMode() { return pendingMode; },
  get dock() { return dock; },
  get attached() { return attached; },
  get models() { return MODELS; },
  get modelId() { return modelId; },
  set modelId(v: string) { modelId = v; },
  get effort() { return effort; },
  set effort(v: 'low' | 'medium' | 'high') { effort = v; },
  get dictationActive() { return dictationActive; },
  set dictationActive(v: boolean) { dictationActive = v; },
  get model() { return MODELS.find((m) => m.id === modelId) ?? MODELS[0]; },
  selectRail,
  togglePin,
  openSide,
  beginSession,
  requestMode,
  commitPendingMode,
  cancelPendingMode,
  answerClarify,
  prevClarify,
  nextClarify,
  openDock,
  updateDock,
  closeDock,
  attachFile,
  detachFile,
};

export function engagementFiles(): ContextFile[] {
  const list: ContextFile[] = [];
  for (const eng of appState.engagements) {
    list.push({ id: `${eng.name}:scope`, path: `${eng.path || eng.name}/scope`, label: 'scope' });
    list.push({ id: `${eng.name}:notes`, path: `${eng.path || eng.name}/notes`, label: 'notes' });
    list.push({ id: `${eng.name}:findings`, path: `${eng.path || eng.name}/findings`, label: 'findings' });
    list.push({ id: `${eng.name}:timeline`, path: `${eng.path || eng.name}/timeline`, label: 'timeline' });
  }
  for (const tab of tabsStore.tabs) {
    if (tab.type === 'editor') {
      list.push({ id: `tab:${tab.id}`, path: tab.label, label: tab.label });
    }
  }
  return list;
}
