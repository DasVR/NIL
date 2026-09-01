// App-level state store (Svelte 5 runes)

interface AppState {
  sidebarOpen: boolean;
  sidebarWidth: number;
  rightSidebarOpen: boolean;
  rightSidebarWidth: number;
  aiStripState: 'collapsed' | 'composer' | 'running' | 'review';
  settingsOpen: boolean;
  theme: 'dark' | 'light' | 'system';
  yoloMode: boolean;
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
  yoloMode: false,
  activeTargetId: null,
  activeEngagementId: null,
};

// Reactive state (Svelte 5 runes)
let sidebarOpen = $state(defaultState.sidebarOpen);
let sidebarWidth = $state(defaultState.sidebarWidth);
let rightSidebarOpen = $state(defaultState.rightSidebarOpen);
let rightSidebarWidth = $state(defaultState.rightSidebarWidth);
let aiStripState = $state(defaultState.aiStripState);
let settingsOpen = $state(defaultState.settingsOpen);
let theme = $state(defaultState.theme);
let yoloMode = $state(defaultState.yoloMode);
let activeTargetId = $state(defaultState.activeTargetId);
let activeEngagementId = $state(defaultState.activeEngagementId);

function applyTheme() {
  if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

// Reactive side effects
$effect(() => { sidebarOpen; });
$effect(() => { sidebarWidth; });
$effect(() => { rightSidebarOpen; });
$effect(() => { rightSidebarWidth; });
$effect(() => { aiStripState; });
$effect(() => { settingsOpen; });
$effect(() => { theme; applyTheme(); });
$effect(() => { yoloMode; });
$effect(() => { activeTargetId; });
$effect(() => { activeEngagementId; });

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
  get yoloMode() { return yoloMode; },
  set yoloMode(v: boolean) { yoloMode = v; },
  get activeTargetId() { return activeTargetId; },
  set activeTargetId(v: string | null) { activeTargetId = v; },
  get activeEngagementId() { return activeEngagementId; },
  set activeEngagementId(v: string | null) { activeEngagementId = v; },

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
  toggleYolo: () => { yoloMode = !yoloMode; },
};