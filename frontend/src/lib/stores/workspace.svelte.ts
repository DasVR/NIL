import { tabsStore } from '$lib/stores/tabsStore';
import { appState, type ComposerMode } from '$lib/stores/appState.svelte.ts';
import { agentRun, toolFilePath } from '$lib/agent/run.svelte.ts';
import { project } from '$lib/project.svelte.ts';

export type RailId = 'files' | 'terminal' | 'diffs' | 'pentest';
export type WorkstationMode = 'build' | 'pentest';
export type SidePanel = 'targets' | 'scm' | 'github' | 'mcp';
export type WorkspaceSurface = 'stream' | 'diff';
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
let surface = $state<WorkspaceSurface>('stream');
let sessionStarted = $state(false);
let clarifyIndex = $state<number | null>(null);
let pendingMode = $state<WorkstationMode | null>(null);
let dock = $state<DockJob | null>(null);
let dockLinger: ReturnType<typeof setTimeout> | null = null;
let attached = $state<ContextFile[]>([]);
let modelId = $state('default');
let effort = $state<'low' | 'medium' | 'high'>('medium');
let dictationActive = $state(false);
let diffText = $state('');
let handoff = $state(0);

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
  if (next !== workstationMode && sessionStarted) handoff += 1;
  workstationMode = next;
  if (next === 'build') appState.composerMode = 'code';
  else {
    if (!pentestMode(appState.composerMode)) appState.composerMode = 'hunt';
    appState.rightSidebarOpen = true;
    clarifyIndex = null;
    surface = 'stream';
    tabsStore.showStream();
  }
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
      if (dock?.id === 'terminal') {
        closeDock();
        activeRail = 'files';
      } else {
        openDock({
          id: 'terminal',
          title: 'Terminal',
          kind: 'terminal',
          status: 'running',
          output: '',
        });
      }
      break;
    case 'diffs':
      railPinned = false;
      appState.sidebarOpen = false;
      if (surface === 'diff') {
        surface = 'stream';
        activeRail = 'files';
      } else {
        activeRail = 'diffs';
        surface = 'diff';
      }
      tabsStore.showStream();
      break;
    case 'pentest':
      activeRail = 'pentest';
      railPinned = false;
      appState.sidebarOpen = false;
      surface = 'stream';
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
  if (attached.some((f) => f.id === file.id || f.path === file.path)) return;
  attached = [...attached, file];
}

function detachFile(id: string) {
  attached = attached.filter((f) => f.id !== id);
}

function openFile(path: string, content?: string) {
  const trimmed = path.trim();
  if (!trimmed) return;
  const label = trimmed.split('/').pop() || trimmed;
  tabsStore.addTab({
    id: `editor:${trimmed}`,
    type: 'editor',
    label,
    dirty: false,
    data: content !== undefined ? { path: trimmed, content } : { path: trimmed },
  });
}

function pinPath(raw: string) {
  const path = raw.trim().replace(/^@/, '');
  if (!path) return;
  const label = path.split('/').pop() || path;
  attachFile({ id: `pin:${path}`, path, label });
  openFile(path);
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
  surface = 'stream';
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
  get sessionLabel() {
    if (appState.activeEngagementId) return appState.activeEngagementId;
    if (sessionStarted) return workstationMode === 'pentest' ? 'hunt' : 'build';
    return 'nil';
  },
  get sessionStarted() { return sessionStarted; },
  get surface() { return surface; },
  get diffText() { return diffText; },
  setDiff(text: string) { diffText = text; },
  showStream() {
    surface = 'stream';
    tabsStore.showStream();
  },
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
  get handoff() { return handoff; },
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
  openFile,
  pinPath,
};

export function engagementFiles(): ContextFile[] {
  const list: ContextFile[] = [];
  const seen = new Set<string>();

  function push(file: ContextFile) {
    if (seen.has(file.path)) return;
    seen.add(file.path);
    list.push(file);
  }

  for (const f of attached) push(f);
  for (const f of project.files) push(f);
  for (const eng of appState.engagements) {
    const root = eng.path || eng.name;
    push({ id: `${eng.name}:scope`, path: `${root}/scope`, label: 'scope' });
    push({ id: `${eng.name}:notes`, path: `${root}/notes`, label: 'notes' });
    push({ id: `${eng.name}:findings`, path: `${root}/findings`, label: 'findings' });
    push({ id: `${eng.name}:timeline`, path: `${root}/timeline`, label: 'timeline' });
  }
  for (const tab of tabsStore.tabs) {
    if (tab.type !== 'editor') continue;
    const path = typeof tab.data?.path === 'string' ? tab.data.path : tab.label;
    push({ id: `tab:${tab.id}`, path, label: tab.label });
  }
  for (const step of agentRun.steps) {
    if (step.kind !== 'tool') continue;
    const path = toolFilePath(step);
    if (!path) continue;
    const label = path.split('/').pop() || path;
    push({ id: `tool:${step.id}`, path, label });
  }
  return list;
}
