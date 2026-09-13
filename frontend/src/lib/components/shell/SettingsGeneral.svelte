<script lang="ts">
  import { appState } from '$lib/stores/appState.svelte.ts';
  import { soundStore } from '$lib/stores/soundStore.svelte.ts';
  import ToggleRow from '$lib/ui/ToggleRow.svelte';
</script>

<div class="settings-pane">
  <h3>General</h3>
  <p class="settings-description">Session and API status.</p>

  <div class="settings-group">
    <h4>Session</h4>
    <div class="setting-row">
      <div class="setting-info">
        <span class="setting-label">API</span>
        <span class="setting-desc">Health check against the local harness</span>
      </div>
      <span class="mono">{appState.backendHealthy ? 'connected' : 'offline'}</span>
    </div>
    {#if appState.backendVersion}
      <div class="setting-row">
        <div class="setting-info">
          <span class="setting-label">Version</span>
          <span class="setting-desc">Reported by GET /health</span>
        </div>
        <span class="mono">{appState.backendVersion}</span>
      </div>
    {/if}
    <div class="setting-row">
      <div class="setting-info">
        <span class="setting-label">Engagement</span>
        <span class="setting-desc">Active space</span>
      </div>
      <span class="mono">{appState.activeEngagementId || 'none'}</span>
    </div>
  </div>

  <div class="settings-group">
    <h4>Agent</h4>
    <ToggleRow
      label="YOLO mode"
      description="Auto-approve tool runs for this engagement"
      checked={appState.yoloMode}
      onChange={() => { void appState.toggleYolo(); }}
    />
  </div>

  <div class="settings-group">
    <h4>Sound</h4>
    <ToggleRow
      label="Interaction sounds"
      description="Synthesized cues on hover, press, and approve/deny"
      checked={soundStore.enabled}
      onChange={(on) => { soundStore.enabled = on; }}
    />
    <div class="setting-row">
      <div class="setting-info">
        <span class="setting-label">Volume</span>
        <span class="setting-desc">Global playback level</span>
      </div>
      <input
        class="volume-slider"
        type="range"
        min="0"
        max="1"
        step="0.05"
        value={soundStore.volume}
        disabled={!soundStore.enabled}
        oninput={(e) => soundStore.volume = Number(e.currentTarget.value)}
        data-cuelume-release="tick"
        aria-label="Sound volume"
      />
    </div>
  </div>
</div>

<style>
  .settings-pane {
    flex: 1;
    overflow-y: auto;
    padding: var(--s-4) var(--s-5);
  }

  .settings-pane > h3 {
    font: 600 var(--t-body)/var(--lh-tight) var(--font-ui);
    color: var(--nil-ink);
    margin-bottom: 4px;
  }

  .settings-description {
    font: var(--t-meta)/var(--lh-body) var(--font-ui);
    color: var(--nil-ink-3);
    margin-bottom: var(--s-5);
  }

  .settings-group { margin-bottom: var(--s-6); }

  .settings-group h4 {
    font: 600 var(--t-micro)/1 var(--font-ui);
    letter-spacing: var(--track-tick);
    text-transform: uppercase;
    color: var(--nil-ink-3);
    margin-bottom: var(--s-3);
  }

  .setting-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--s-3) 0;
    border-bottom: 1px solid var(--nil-line);
  }

  .setting-info { display: flex; flex-direction: column; gap: 2px; flex: 1; min-width: 0; }
  .setting-label { font: 500 var(--t-meta)/1 var(--font-ui); color: var(--nil-ink); }
  .setting-desc { font: var(--t-micro)/1.4 var(--font-ui); color: var(--nil-ink-3); }
  .mono { font: var(--t-meta)/1 var(--font-machine); color: var(--nil-ink-2); }

  .volume-slider {
    width: 120px;
    accent-color: var(--nil-ink-2);
  }
  .volume-slider:disabled { opacity: 0.4; }
</style>
