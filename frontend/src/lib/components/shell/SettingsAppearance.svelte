<script lang="ts">
  import { appState } from '$lib/stores/appState.svelte.ts';
  import ToggleRow from '$lib/ui/ToggleRow.svelte';

  const uid = $props.id();
  const sidebarId = `${uid}-sidebar-width`;
  const inspectorId = `${uid}-inspector-width`;
</script>

<div class="settings-pane">
  <h3>Appearance</h3>
  <p class="settings-description">Density and motion. Color means risk — chrome stays greyscale.</p>

  <div class="settings-group">
    <h4>Theme</h4>
    <div class="setting-row">
      <div class="setting-info">
        <span class="setting-label">Color scheme</span>
        <span class="setting-desc">Dark only. Light mode is a non-goal for long low-light sessions.</span>
      </div>
      <div class="setting-control">
        <span class="fixed">Dark</span>
      </div>
    </div>
  </div>

  <div class="settings-group">
    <h4>Density</h4>
    <div class="setting-row">
      <div class="setting-info">
        <label class="setting-label" for={sidebarId}>Sidebar width</label>
        <span class="setting-desc" id={`${sidebarId}-desc`}>Left rail width in pixels</span>
      </div>
      <div class="setting-control">
        <input
          id={sidebarId}
          aria-describedby={`${sidebarId}-desc`}
          type="number"
          min="200"
          max="400"
          step="10"
          value={appState.sidebarWidth}
          oninput={(e) => appState.setSidebarWidth(Number((e.currentTarget as HTMLInputElement).value))}
        />
      </div>
    </div>
    <div class="setting-row">
      <div class="setting-info">
        <label class="setting-label" for={inspectorId}>Inspector width</label>
        <span class="setting-desc" id={`${inspectorId}-desc`}>Right inspector width in pixels</span>
      </div>
      <div class="setting-control">
        <input
          id={inspectorId}
          aria-describedby={`${inspectorId}-desc`}
          type="number"
          min="240"
          max="500"
          step="10"
          value={appState.rightSidebarWidth}
          oninput={(e) => appState.setRightSidebarWidth(Number((e.currentTarget as HTMLInputElement).value))}
        />
      </div>
    </div>
  </div>

  <div class="settings-group">
    <h4>Motion</h4>
    <ToggleRow
      label="Reduced motion"
      description="Skip springs and scanline. Instant state changes."
      checked={appState.reducedMotion}
      onChange={(on) => { appState.reducedMotion = on; }}
    />
  </div>
</div>

<style>
  .settings-pane { padding: var(--s-4) var(--s-5); }
  .settings-pane > h3 { font: 600 var(--t-body)/var(--lh-tight) var(--font-ui); color: var(--nil-ink); margin-bottom: 4px; }
  .settings-description { font: var(--t-meta)/var(--lh-body) var(--font-ui); color: var(--nil-ink-3); margin-bottom: var(--s-5); }
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
  .setting-info { display: flex; flex-direction: column; gap: 2px; }
  .setting-label { font: 500 var(--t-meta)/1 var(--font-ui); color: var(--nil-ink); }
  .setting-desc { font: var(--t-micro)/1.4 var(--font-ui); color: var(--nil-ink-3); }
  .fixed {
    font: 500 var(--t-meta)/1 var(--font-ui);
    color: var(--nil-ink-2);
  }

  .setting-control input[type="number"] {
    width: 80px;
    padding: 6px 10px;
    border: 1px solid var(--nil-line);
    border-radius: var(--r-field);
    background: var(--nil-raised);
    color: var(--nil-ink);
    font-family: var(--font-machine);
    font-size: var(--t-meta);
  }
</style>
