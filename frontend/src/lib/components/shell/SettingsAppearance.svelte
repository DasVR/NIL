<script lang="ts">
  import { appState } from '$lib/stores/appState.svelte.ts';
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
        <span class="setting-label">Sidebar width</span>
        <span class="setting-desc">Left rail width in pixels</span>
      </div>
      <div class="setting-control">
        <input
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
        <span class="setting-label">Inspector width</span>
        <span class="setting-desc">Findings rail width in pixels</span>
      </div>
      <div class="setting-control">
        <input
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
    <div class="setting-row">
      <div class="setting-info">
        <span class="setting-label">Reduced motion</span>
        <span class="setting-desc">Skip springs and scanline. Instant state changes.</span>
      </div>
      <div class="setting-control">
        <label class="toggle">
          <input
            type="checkbox"
            checked={appState.reducedMotion}
            onchange={(e) => appState.reducedMotion = (e.currentTarget as HTMLInputElement).checked}
          />
          <span class="toggle-slider"></span>
        </label>
      </div>
    </div>
  </div>
</div>

<style>
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
