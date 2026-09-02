// App-level state store (Svelte 5 runes) — backed by NIL API
import api, { type Engagement } from '$lib/api';
import { browser } from '$app/environment';

interface AppState {
  sidebarOpen: boolean;
  sidebarWidth: number;
  rightSidebarOpen: boolean;
  rightSidebarWidth: number;
  aiStripState: 'collapsed' | 'composer' | 'running' | 'review';
  settingsOpen: boolean;
  theme: 'dark' | 'light' | 'system';
  activeTargetId: string | null;
  activeEngagementId: string | null;
}

const defaultState: AppState = {
  sidebarOpen: true,
  sidebarWidth: 280,
  rightSidebarOpen: true,
  rightSidebarWidth: 320,
  aiStripState: 'collapsed',
  settingsOpen: false,
  theme: 'dark',
  activeTargetId: null,
  activeEngagementId: null,
};

let sidebarOpen = $state(defaultState.sidebarOpen);
let sidebarWidth = $state(defaultState.sidebarWidth);
let rightSidebarOpen = $state(defaultState.rightSidebarOpen);
let rightSidebarWidth = $state(defaultState.rightSidebarWidth);
let aiStripState = $state(defaultState.aiStripState);
let settingsOpen = $state(defaultState.settingsOpen);
let theme = $state(defaultState.theme);
let activeTargetId = $state(defaultState.activeTargetId);
let activeEngagementId = $state(defaultState.activeEngagementId);
let yoloMode = $state(false);

let engagements = $state<Engagement[]>([]);
let backendHealthy = $state(false);
let backendVersion = $state('');

function applyTheme() {
  if (!browser) return;
  if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

async function init() {
  if (!browser) return;
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
  } catch (e: any) {
    console.error('Failed to init app state:', e.message);
    backendHealthy = false;
  }
}

async function createEngagement(name: string, scope = '', mode: 'hunt' | 'chat' | 'code' | 'report' = 'hunt') {
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
  get aiStripState() { return aiStripState; },
  set aiStripState(v: AppState['aiStripState']) { aiStripState = v; },
  get settingsOpen() { return settingsOpen; },
  set settingsOpen(v: boolean) { settingsOpen = v; },
  get theme() { return theme; },
  set theme(v: AppState['theme']) { theme = v; },
  get activeTargetId() { return activeTargetId; },
  set activeTargetId(v: string | null) { activeTargetId = v; },
  get activeEngagementId() { return activeEngagementId; },
  set activeEngagementId(v: string | null) { activeEngagementId = v; },
  get yoloMode() { return yoloMode; },
  set yoloMode(v: boolean) { yoloMode = v; },

  get engagements() { return engagements; },
  get backendHealthy() { return backendHealthy; },
  get backendVersion() { return backendVersion; },

  setSidebarWidth: (w: number) => { sidebarWidth = Math.max(200, Math.min(400, w)); },
  setRightSidebarWidth: (w: number) => { rightSidebarWidth = Math.max(240, Math.min(500, w)); },
  toggleSidebar: () => { sidebarOpen = !sidebarOpen; },
  toggleRightSidebar: () => { rightSidebarOpen = !rightSidebarOpen; },
  cycleAIStrip: () => {
    const states: AppState['aiStripState'][] = ['collapsed', 'composer', 'running', 'review'];
    const idx = states.indexOf(aiStripState);
    aiStripState = states[(idx + 1) % states.length];
  },
  toggleSettings: () => { settingsOpen = !settingsOpen; },
  toggleYolo,

  init,
  createEngagement,
  refreshEngagements,
};

if (browser) {
  init();
}
