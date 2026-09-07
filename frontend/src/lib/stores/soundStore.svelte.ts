// Interaction sound settings (cuelume) — Svelte 5 runes, persisted to localStorage
import { browser } from '$app/environment';
import { bind, setEnabled, setVolume } from 'cuelume';

const STORAGE_KEY = 'nil.sound';

interface SoundPrefs {
  enabled: boolean;
  volume: number;
}

const defaults: SoundPrefs = { enabled: true, volume: 0.5 };

function load(): SoundPrefs {
  if (!browser) return defaults;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw);
    return {
      enabled: typeof parsed.enabled === 'boolean' ? parsed.enabled : defaults.enabled,
      volume: typeof parsed.volume === 'number' ? parsed.volume : defaults.volume,
    };
  } catch {
    return defaults;
  }
}

const initial = load();
let enabled = $state(initial.enabled);
let volume = $state(initial.volume);

function persist() {
  if (!browser) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ enabled, volume }));
}

function apply() {
  setEnabled(enabled);
  setVolume(volume);
}

function init() {
  if (!browser) return;
  bind();
  apply();
}

export const soundStore = {
  get enabled() { return enabled; },
  set enabled(v: boolean) {
    enabled = v;
    apply();
    persist();
  },
  get volume() { return volume; },
  set volume(v: number) {
    volume = Math.max(0, Math.min(1, v));
    apply();
    persist();
  },
  init,
};
