// App-level state store (Svelte 5 runes) — backed by NIL API
import api, { type AgentMode, type Engagement } from '$lib/api';
import { browser } from '$app/environment';

type Theme = 'dark';
export type ComposerMode = 'hunt' | 'exploit' | 'chat' | 'code' | 'report';
export type Effort = 'low' | 'medium' | 'high';

export interface ContextChip {
  id: string;
  path: string;
  line?: number;
}

export interface ModelOption {
  id: string;
  name: string;
  description: string;
}

// UI-only for now — selecting a model doesn't change run_turn yet (no backend
// route to carry it). This is the composer affordance the goal doc asks for;
// wiring it to the agent call is a separate, backend-touching step.
export const MODEL_OPTIONS: ModelOption[] = [
  { id: 'claude-opus-5', name: 'Opus 5', description: 'Most capable, best for hard problems' },
  { id: 'claude-sonnet-5', name: 'Sonnet 5', description: 'Balanced speed and capability' },
  { id: 'claude-haiku-4-5', name: 'Haiku 4.5', description: 'Fastest, best for quick tasks' },
];

interface AppState {
  sidebarOpen: boolean;
  sidebarWidth: number;
  rightSidebarOpen: boolean;
  rightSidebarWidth: number;
  settingsOpen: boolean;
  theme: Theme;
  reducedMotion: boolean;
  activeTargetId: string | null;
  activeEngagementId: string | null;
}

const defaultState: AppState = {
  sidebarOpen: true,
  sidebarWidth: 280,
  rightSidebarOpen: true,
  rightSidebarWidth: 320,
  settingsOpen: false,
  theme: 'dark',
  reducedMotion: false,
  activeTargetId: null,
  activeEngagementId: null,
};

let sidebarOpen = $state(defaultState.sidebarOpen);
let sidebarWidth = $state(defaultState.sidebarWidth);
let rightSidebarOpen = $state(defaultState.rightSidebarOpen);
let rightSidebarWidth = $state(defaultState.rightSidebarWidth);
let settingsOpen = $state(defaultState.settingsOpen);
let theme = $state<Theme>(defaultState.theme);
let reducedMotion = $state(defaultState.reducedMotion);
let activeTargetId = $state(defaultState.activeTargetId);
let activeEngagementId = $state(defaultState.activeEngagementId);
let yoloMode = $state(false);
let composerMode = $state<ComposerMode>('hunt');
let composerFocus: () => void = () => {};
let contextChips = $state<ContextChip[]>([]);
let selectedModel = $state(MODEL_OPTIONS[1].id);
let effort = $state<Effort>('medium');

let engagements = $state<Engagement[]>([]);
let backendHealthy = $state(false);
let backendVersion = $state('');

function applyReducedMotion(value: boolean) {
  if (!browser) return;
  document.documentElement.classList.toggle('reduce-motion', value);
}

async function init() {
  if (!browser) return;
  applyReducedMotion(reducedMotion);
  try {
    const health = await api.health();
    backendHealthy = health.status === 'ok';
    backendVersion = health.version;
    const list = await api.listEngagements();
    engagements = list.engagements;
    if (engagements.length > 0 && !activeEngagementId) {
      activeEngagementId = engagements[0].name;
      activeTargetId = engagements[0].name;
    }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'init failed';
    console.error('Failed to init app state:', message);
    backendHealthy = false;
  }
}

async function createEngagement(name: string, scope = '', mode: AgentMode = 'hunt') {
  const eng = await api.createEngagement({ name, scope, mode });
  engagements = [...engagements, eng];
  activeEngagementId = eng.name;
  activeTargetId = eng.name;
  return eng;
}

async function refreshEngagements() {
  const list = await api.listEngagements();
  engagements = list.engagements;
}

async function toggleYolo(engagement?: string) {
  const id = engagement || activeEngagementId || 'default';
  const status = await api.yoloStatus(id);
  const res = await api.yoloToggle({ engagement: id, enabled: !status.yolo_enabled });
  yoloMode = res.yolo_enabled;
}

export const appState = {
  get sidebarOpen() { return sidebarOpen; },
  set sidebarOpen(v: boolean) { sidebarOpen = v; },
  get sidebarWidth() { return sidebarWidth; },
  set sidebarWidth(v: number) { sidebarWidth = v; },
  get rightSidebarOpen() { return rightSidebarOpen; },
  set rightSidebarOpen(v: boolean) { rightSidebarOpen = v; },
  get rightSidebarWidth() { return rightSidebarWidth; },
  set rightSidebarWidth(v: number) { rightSidebarWidth = v; },
  get settingsOpen() { return settingsOpen; },
  set settingsOpen(v: boolean) { settingsOpen = v; },
  get theme() { return theme; },
  get reducedMotion() { return reducedMotion; },
  set reducedMotion(v: boolean) {
    reducedMotion = v;
    applyReducedMotion(v);
  },
  get activeTargetId() { return activeTargetId; },
  set activeTargetId(v: string | null) { activeTargetId = v; },
  get activeEngagementId() { return activeEngagementId; },
  set activeEngagementId(v: string | null) { activeEngagementId = v; },
  get yoloMode() { return yoloMode; },
  set yoloMode(v: boolean) { yoloMode = v; },
  get composerMode() { return composerMode; },
  set composerMode(v: ComposerMode) { composerMode = v; },

  get contextChips() { return contextChips; },
  addContextChip: (path: string, line?: number) => {
    const id = line !== undefined ? `${path}:${line}` : path;
    if (contextChips.some((c) => c.id === id)) return;
    contextChips = [...contextChips, { id, path, line }];
  },
  removeContextChip: (id: string) => {
    contextChips = contextChips.filter((c) => c.id !== id);
  },
  clearContextChips: () => { contextChips = []; },

  get selectedModel() { return selectedModel; },
  set selectedModel(v: string) { selectedModel = v; },
  get effort() { return effort; },
  set effort(v: Effort) { effort = v; },

  get engagements() { return engagements; },
  get backendHealthy() { return backendHealthy; },
  get backendVersion() { return backendVersion; },

  setSidebarWidth: (w: number) => { sidebarWidth = Math.max(200, Math.min(400, w)); },
  setRightSidebarWidth: (w: number) => { rightSidebarWidth = Math.max(240, Math.min(500, w)); },
  toggleSidebar: () => { sidebarOpen = !sidebarOpen; },
  toggleRightSidebar: () => { rightSidebarOpen = !rightSidebarOpen; },
  toggleSettings: () => { settingsOpen = !settingsOpen; },
  toggleYolo,
  setComposerFocus: (fn: () => void) => { composerFocus = fn; },
  focusComposer: () => { composerFocus(); },

  init,
  createEngagement,
  refreshEngagements,
};

if (browser) {
  init();
}
