import { browser } from '$app/environment';
import { tabsStore } from '$lib/stores/tabsStore';
import { appState, type ComposerMode } from '$lib/stores/appState.svelte.ts';
import { agentRun, toolFilePath } from '$lib/agent/run.svelte.ts';
import { project, writeProjectFile, refreshProject } from '$lib/project.svelte.ts';
import api from '$lib/api';

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

export interface RecentSession {
  id: string;
  label: string;
  mode: WorkstationMode;
  at: number;
}

export interface ReportCover {
  title: string;
  status: 'writing' | 'ready' | 'error';
  error?: string;
}

const FALLBACK_MODELS: ModelOption[] = [
  { id: 'default', name: 'Default', description: 'Whatever the harness is configured to use' },
  { id: 'fast', name: 'Fast', description: 'Lower latency, lighter reasoning' },
  { id: 'strong', name: 'Strong', description: 'Deeper reasoning for hard hunts and refactors' },
];

const RAIL_WIDTH = 48;
const RECENTS_KEY = 'nil.recent-sessions';
const PREFS_KEY = 'nil.workstation-prefs';
const SPLIT_MIN = 0.34;
const SPLIT_MAX = 0.72;
const SPLIT_DEFAULT = 0.56;

function loadRecents(): RecentSession[] {
  if (!browser) return [];
  try {
    const raw = localStorage.getItem(RECENTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((row): row is RecentSession => {
        if (!row || typeof row !== 'object') return false;
        const r = row as RecentSession;
        return typeof r.id === 'string'
          && typeof r.label === 'string'
          && (r.mode === 'build' || r.mode === 'pentest')
          && typeof r.at === 'number';
      })
      .slice(0, 5);
  } catch {
    return [];
  }
}

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
let models = $state<ModelOption[]>(FALLBACK_MODELS);
let modelId = $state('default');
let effort = $state<'low' | 'medium' | 'high'>('medium');
let splitPct = $state(SPLIT_DEFAULT);
let dictationActive = $state(false);
let dictationPaused = $state(false);
let dictationLevel = $state(0);
let recents = $state<RecentSession[]>(loadRecents());
let diffText = $state('');
let handoff = $state(0);
let reportCover = $state<ReportCover | null>(null);

function persistRecents() {
  if (!browser) return;
  localStorage.setItem(RECENTS_KEY, JSON.stringify(recents));
}

function clampSplit(value: number): number {
  if (!Number.isFinite(value)) return SPLIT_DEFAULT;
  return Math.min(SPLIT_MAX, Math.max(SPLIT_MIN, value));
}

function persistPrefs() {
  if (!browser) return;
  localStorage.setItem(PREFS_KEY, JSON.stringify({ modelId, effort, splitPct }));
}

function loadPrefs() {
  if (!browser) return;
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') return;
    const row = parsed as { modelId?: unknown; effort?: unknown; splitPct?: unknown };
    if (typeof row.modelId === 'string' && row.modelId) modelId = row.modelId;
    if (row.effort === 'low' || row.effort === 'medium' || row.effort === 'high') effort = row.effort;
    if (typeof row.splitPct === 'number') splitPct = clampSplit(row.splitPct);
  } catch {
    // Keep defaults when prefs are missing or malformed.
  }
}

loadPrefs();

function rememberSession(mode: WorkstationMode, label?: string) {
  const name = label || (mode === 'pentest' ? 'hunt' : 'build');
  const entry: RecentSession = {
    id: `${mode}:${name}`,
    label: name,
    mode,
    at: Date.now(),
  };
  recents = [entry, ...recents.filter((r) => r.id !== entry.id)].slice(0, 5);
  persistRecents();
}

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
    if (appState.activeEngagementId) void agentRun.loadEngagement(appState.activeEngagementId);
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
      persistPrefs();
      break;
    case 'broad':
      effort = 'high';
      persistPrefs();
      break;
    case 'ask':
      effort = 'medium';
      persistPrefs();
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

function classifyDock(name: string): DockJob['kind'] {
  const n = name.toLowerCase();
  if (/(^|[^a-z])(test|pytest|vitest|jest)([^a-z]|$)/.test(n)) return 'test';
  if (/(build|compile|vite|webpack|cargo)/.test(n)) return 'build';
  if (/(lint|ruff|eslint|clippy)/.test(n)) return 'lint';
  return 'command';
}

async function refreshModels() {
  try {
    const res = await api.getProviders();
    const resolved = res.resolved || [];
    if (resolved.length === 0) return;
    models = resolved.map((p) => ({
      id: p.name,
      name: p.model || p.name,
      description: [p.type, p.enabled ? 'on' : 'off'].filter(Boolean).join(' · '),
    }));
    if (!models.some((m) => m.id === modelId)) modelId = models[0]?.id ?? 'default';
    persistPrefs();
  } catch {
    // Keep the fallback list when the API is down.
  }
}

function dismissReportCover() {
  reportCover = null;
}

async function exportReport() {
  const name = appState.activeEngagementId;
  if (!name) {
    reportCover = {
      title: 'No target',
      status: 'error',
      error: 'Load a target, then export a report.',
    };
    return;
  }
  reportCover = { title: name, status: 'writing' };
  applyMode('pentest');
  try {
    const res = await api.generateReport(name, 'markdown');
    const md = typeof res.report === 'string' ? res.report : '';
    reportCover = { title: name, status: 'ready' };
    openFile(`${name}/report.md`, md);
  } catch (err: unknown) {
    reportCover = {
      title: name,
      status: 'error',
      error: err instanceof Error ? err.message : 'Report export failed.',
    };
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
      break;
    case 'pentest':
      activeRail = 'pentest';
      railPinned = false;
      appState.sidebarOpen = false;
      surface = 'stream';
      applyMode('pentest');
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

function splitFileRef(raw: string): { path: string; line: number | null } {
  const trimmed = raw.trim().replace(/^@/, '');
  const match = trimmed.match(/^(.*):(\d+)(?:-\d+)?$/);
  if (!match || !match[1] || match[1].endsWith(':')) return { path: trimmed, line: null };
  return { path: match[1], line: Number.parseInt(match[2], 10) };
}

function openFile(path: string, content?: string) {
  const ref = splitFileRef(path);
  const trimmed = ref.path;
  if (!trimmed) return;
  const label = trimmed.split('/').pop() || trimmed;
  tabsStore.addTab({
    id: `editor:${trimmed}`,
    type: 'editor',
    label,
    dirty: false,
    data: content !== undefined
      ? { path: trimmed, content, line: ref.line }
      : { path: trimmed, line: ref.line },
  });
}

function pinPath(raw: string) {
  const path = raw.trim().replace(/^@/, '');
  if (!path) return;
  const label = path.split('/').pop() || path;
  attachFile({ id: `pin:${path}`, path, label });
  openFile(path);
}

async function saveActiveFile(): Promise<boolean> {
  if (browser) {
    window.dispatchEvent(new Event('nil:flush-editors'));
    await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
  }
  const id = tabsStore.activeTabId;
  if (!id) return false;
  const tab = tabsStore.tabs.find((t) => t.id === id);
  if (!tab || tab.type !== 'editor') return false;
  const filePath = typeof tab.data?.path === 'string' ? tab.data.path : tab.label;
  const content = typeof tab.data?.content === 'string' ? tab.data.content : null;
  if (!filePath || content == null) {
    if (browser) window.dispatchEvent(new CustomEvent('nil:file-saved', { detail: { path: filePath, ok: false } }));
    return false;
  }
  const ok = await writeProjectFile(filePath, content);
  if (ok) {
    tabsStore.markDirty(id, false);
    void refreshProject();
  }
  if (browser) window.dispatchEvent(new CustomEvent('nil:file-saved', { detail: { path: filePath, ok } }));
  return ok;
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
  rememberSession(mode, appState.activeEngagementId || undefined);
  if (mode === 'pentest') {
    clarifyIndex = null;
    selectRail('pentest');
  } else {
    clarifyIndex = 0;
  }
}

function resumeSession(mode: WorkstationMode, label?: string) {
  sessionStarted = true;
  surface = 'stream';
  applyMode(mode);
  pendingMode = null;
  clarifyIndex = null;
  rememberSession(mode, label);
  if (mode === 'pentest') selectRail('pentest');
}

function requestMode(next: WorkstationMode) {
  if (next === workstationMode) {
    pendingMode = null;
    return;
  }
  pendingMode = next;
  surface = 'stream';
}

function commitPendingMode() {
  if (pendingMode) applyMode(pendingMode);
  pendingMode = null;
}

function cancelPendingMode() {
  pendingMode = null;
}

function dismissClarify() {
  clarifyIndex = null;
}

function sendClarifyTurn(text: string) {
  clarifyIndex = null;
  const mode: ComposerMode = workstationMode === 'build' ? 'code' : appState.composerMode;
  const engagement = appState.activeEngagementId || 'default';
  void agentRun.sendMessage(text, engagement, mode, { model: modelId, effort });
}

function answerClarify(id: string, other?: string) {
  const extra = other?.trim();
  if ((id === 'reply' || id === 'other') && extra) {
    sendClarifyTurn(extra);
    return;
  }
  if (id === 'reply') {
    appState.focusComposer();
    return;
  }
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
  },
  get clarify() {
    if (clarifyIndex == null) return null;
    const q = ONBOARD[clarifyIndex];
    return q ? { ...q, index: clarifyIndex + 1, total: ONBOARD.length } : null;
  },
  get pendingMode() { return pendingMode; },
  get dock() { return dock; },
  get attached() { return attached; },
  get models() { return models; },
  get modelId() { return modelId; },
  set modelId(v: string) {
    modelId = v;
    persistPrefs();
  },
  get effort() { return effort; },
  set effort(v: 'low' | 'medium' | 'high') {
    effort = v;
    persistPrefs();
  },
  get splitPct() { return splitPct; },
  set splitPct(v: number) {
    splitPct = clampSplit(v);
    persistPrefs();
  },
  get dictationActive() { return dictationActive; },
  set dictationActive(v: boolean) {
    dictationActive = v;
    if (v) dictationPaused = false;
    else dictationLevel = 0;
  },
  get dictationPaused() { return dictationPaused; },
  set dictationPaused(v: boolean) {
    dictationPaused = v;
    if (v) dictationLevel = 0;
  },
  get dictationLevel() { return dictationLevel; },
  set dictationLevel(v: number) {
    dictationLevel = Math.min(1, Math.max(0, v));
  },
  get recents() { return recents; },
  get handoff() { return handoff; },
  get reportCover() { return reportCover; },
  get model() { return models.find((m) => m.id === modelId) ?? models[0]; },
  selectRail,
  togglePin,
  openSide,
  beginSession,
  resumeSession,
  requestMode,
  commitPendingMode,
  cancelPendingMode,
  answerClarify,
  dismissClarify,
  prevClarify,
  nextClarify,
  openDock,
  updateDock,
  closeDock,
  attachFile,
  detachFile,
  openFile,
  pinPath,
  saveActiveFile,
  refreshModels,
  classifyDock,
  exportReport,
  dismissReportCover,
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
