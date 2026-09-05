<script lang="ts">
  import { appState } from '$lib/stores/appState.svelte.ts';
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
    <div class="setting-row">
      <div class="setting-info">
        <span class="setting-label">YOLO mode</span>
        <span class="setting-desc">Auto-approve tool runs for this engagement</span>
      </div>
      <label class="toggle">
        <input
          type="checkbox"
          checked={appState.yoloMode}
          onchange={() => appState.toggleYolo()}
        />
        <span class="toggle-slider"></span>
      </label>
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

  .toggle { position: relative; display: inline-block; width: 36px; height: 20px; }
  .toggle input { opacity: 0; width: 0; height: 0; }
  .toggle-slider {
    position: absolute;
    cursor: pointer;
    inset: 0;
    background: var(--nil-line);
    border-radius: 10px;
    transition: background var(--dur-flip) var(--ease-out);
  }
  .toggle-slider:before {
    position: absolute;
    content: "";
    height: 14px;
    width: 14px;
    left: 3px;
    bottom: 3px;
    background: var(--nil-ink-3);
    border-radius: 50%;
    transition: transform var(--dur-flip) var(--ease-out), background var(--dur-flip) var(--ease-out);
  }
  .toggle input:checked + .toggle-slider { background: var(--nil-ink-2); }
  .toggle input:checked + .toggle-slider:before { transform: translateX(16px); background: var(--nil-void); }
  .toggle input:focus-visible + .toggle-slider {
    outline: 2px solid var(--nil-halo);
    outline-offset: 2px;
  }
</style>
