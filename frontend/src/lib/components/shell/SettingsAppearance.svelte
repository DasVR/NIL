<script lang="ts">
  import { appState } from '$lib/stores/appState';
</script>

<div class="settings-pane">
  <h3>Appearance</h3>
  <p class="settings-description">Visual customization and density</p>

  <div class="settings-group">
    <h4>Color Scheme</h4>
    <div class="setting-row">
      <div class="setting-info">
        <span class="setting-label">Accent Color</span>
        <span class="setting-desc">Primary accent color for UI</span>
      </div>
      <div class="setting-control">
        <div class="color-picker-row">
          <button class="color-swatch" style="background: #452a84" title="Deep Violet" />
          <button class="color-swatch" style="background: #8b5cf6" title="Violet" />
          <button class="color-swatch" style="background: #00d992" title="Mint (Legacy)" />
          <button class="color-swatch" style="background: #10b981" title="Emerald" />
          <button class="color-swatch" style="background: #f59e0b" title="Amber" />
          <button class="color-swatch" style="background: #ef4444" title="Red" />
        </div>
      </div>
    </div>
  </div>

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
        <span class="setting-desc">ThinkingOrbs, BorderBeam, LiquidMetal</span>
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
  .color-picker-row {
    display: flex;
    gap: 8px;
  }

  .color-swatch {
    width: 28px;
    height: 28px;
    border-radius: var(--radius-control);
    border: 2px solid transparent;
    cursor: pointer;
    transition: transform var(--spring-snappy), border-color var(--spring-snappy);
  }

  .color-swatch:hover {
    transform: scale(1.15);
    border-color: var(--accent-primary);
  }

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