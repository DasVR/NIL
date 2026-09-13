import { tabsStore } from '$lib/stores/tabsStore';
import { appState, type ComposerMode } from '$lib/stores/appState.svelte.ts';

export type RailId = 'files' | 'terminal' | 'diffs' | 'pentest';
export type WorkstationMode = 'build' | 'pentest';

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

let activeRail = $state<RailId>('files');
let railPinned = $state(false);
let workstationMode = $state<WorkstationMode>('pentest');
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

export const workspace = {
  RAIL_WIDTH,
  get activeRail() { return activeRail; },
  get railPinned() { return railPinned; },
  set railPinned(v: boolean) { railPinned = v; },
  get workstationMode() { return workstationMode; },
  set workstationMode(v: WorkstationMode) { applyMode(v); },
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
