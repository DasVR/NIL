<script lang="ts">
  import { appState } from '$lib/stores/appState.svelte.ts';
</script>

<div class="settings-pane">
  <h3>Appearance</h3>
  <p class="settings-description">Visual customization and density</p>

  <div class="settings-group">
    <h4>Glass & Transparency</h4>
    <div class="setting-row">
      <div class="setting-info">
        <span class="setting-label">Glass Intensity</span>
        <span class="setting-desc">Blur and opacity of glass panels</span>
      </div>
      <div class="setting-control">
        <select>
          <option value="subtle">Subtle</option>
          <option value="balanced" selected>Balanced</option>
          <option value="strong">Strong</option>
          <option value="off">Disabled</option>
        </select>
      </div>
    </div>
    <div class="setting-row">
      <div class="setting-info">
        <span class="setting-label">Edge Refraction</span>
        <span class="setting-desc">Subtle highlight on glass edges</span>
      </div>
      <div class="setting-control">
        <label class="toggle">
          <input type="checkbox" checked />
          <span class="toggle-slider"></span>
        </label>
      </div>
    </div>
  </div>

  <div class="settings-group">
    <h4>Density</h4>
    <div class="setting-row">
      <div class="setting-info">
        <span class="setting-label">Compact Mode</span>
        <span class="setting-desc">Reduce padding and spacing globally</span>
      </div>
      <div class="setting-control">
        <label class="toggle">
          <input type="checkbox" />
          <span class="toggle-slider"></span>
        </label>
      </div>
    </div>
    <div class="setting-row">
      <div class="setting-info">
        <span class="setting-label">Sidebar Width</span>
        <span class="setting-desc">Default sidebar width in pixels</span>
      </div>
      <div class="setting-control">
        <input type="number" min="200" max="400" step="10" value="280" />
      </div>
    </div>
  </div>

  <div class="settings-group">
    <h4>Effects</h4>
    <div class="setting-row">
      <div class="setting-info">
        <span class="setting-label">Animations</span>
        <span class="setting-desc">Enable spring animations and transitions</span>
      </div>
      <div class="setting-control">
        <label class="toggle">
          <input type="checkbox" checked />
          <span class="toggle-slider"></span>
        </label>
      </div>
    </div>
    <div class="setting-row">
      <div class="setting-info">
        <span class="setting-label">Reduced Motion</span>
        <span class="setting-desc">Respect system prefers-reduced-motion</span>
      </div>
      <div class="setting-control">
        <label class="toggle">
          <input type="checkbox" checked />
          <span class="toggle-slider"></span>
        </label>
      </div>
    </div>
    <div class="setting-row">
      <div class="setting-info">
        <span class="setting-label">Particle Effects</span>
        <span class="setting-desc">BorderBeam, LiquidMetal</span>
      </div>
      <div class="setting-control">
        <label class="toggle">
          <input type="checkbox" checked />
          <span class="toggle-slider"></span>
        </label>
      </div>
    </div>
  </div>
</div>

<style>
  .setting-control input[type="number"] {
    width: 80px;
    padding: 6px 10px;
    border: 1px solid var(--surface-border);
    border-radius: var(--radius-control);
    background: var(--surface-input);
    color: var(--input-text);
    font-family: var(--font-mono);
    font-size: var(--font-xs);
  }
</style>