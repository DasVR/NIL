<script lang="ts">
  import { appState } from '$lib/stores/appState';
</script>

<div class="settings-pane">
  <h3>General</h3>
  <p class="settings-description">Core application settings</p>

  <div class="settings-group">
    <h4>Theme</h4>
    <div class="setting-row">
      <div class="setting-info">
        <span class="setting-label">Theme</span>
        <span class="setting-desc">Choose color theme</span>
      </div>
      <div class="setting-control">
        <select bind:value={appState.theme}>
          <option value="dark">Dark</option>
          <option value="light">Light</option>
          <option value="system">System</option>
        </select>
      </div>
    </div>
  </div>

  <div class="settings-group">
    <h4>Startup</h4>
    <div class="setting-row">
      <div class="setting-info">
        <span class="setting-label">Open last engagement</span>
        <span class="setting-desc">Automatically restore last session</span>
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
        <span class="setting-label">Open command palette on start</span>
        <span class="setting-desc">Show command palette immediately</span>
      </div>
      <div class="setting-control">
        <label class="toggle">
          <input type="checkbox" />
          <span class="toggle-slider"></span>
        </label>
      </div>
    </div>
  </div>

  <div class="settings-group">
    <h4>Updates</h4>
    <div class="setting-row">
      <div class="setting-info">
        <span class="setting-label">Auto-check for updates</span>
        <span class="setting-desc">Check for app updates on startup</span>
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
        <span class="setting-label">Channel</span>
        <span class="setting-desc">Update channel</span>
      </div>
      <div class="setting-control">
        <select>
          <option value="stable">Stable</option>
          <option value="beta">Beta</option>
          <option value="nightly">Nightly</option>
        </select>
      </div>
    </div>
  </div>
</div>

<style>
  .settings-pane {
    flex: 1;
    overflow-y: auto;
    padding: var(--space-4) var(--space-6);
  }

  .settings-pane > h3 {
    font-size: var(--step-0);
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 4px;
  }

  .settings-description {
    font-size: var(--font-xs);
    color: var(--text-tertiary);
    margin-bottom: var(--space-6);
  }

  .settings-group {
    margin-bottom: var(--space-8);
  }

  .settings-group h4 {
    font-size: var(--font-2xs);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: var(--tracking-wide);
    color: var(--text-tertiary);
    margin-bottom: var(--space-3);
  }

  .setting-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-3) 0;
    border-bottom: 1px solid var(--surface-border);
  }

  .setting-row:last-child {
    border-bottom: none;
  }

  .setting-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
    flex: 1;
    min-width: 0;
  }

  .setting-label {
    font-size: var(--font-xs);
    font-weight: 500;
    color: var(--text-primary);
  }

  .setting-desc {
    font-size: var(--font-2xs);
    color: var(--text-tertiary);
  }

  .setting-control {
    flex-shrink: 0;
    margin-left: var(--space-4);
  }

  .setting-control select {
    padding: 6px 10px;
    border: 1px solid var(--surface-border);
    border-radius: var(--radius-control);
    background: var(--surface-input);
    color: var(--input-text);
    font-family: var(--font-sans);
    font-size: var(--font-xs);
    cursor: pointer;
    outline: none;
  }

  .setting-control select:focus {
    border-color: var(--accent-primary);
  }

  .toggle {
    position: relative;
    display: inline-block;
    width: 44px;
    height: 24px;
  }

  .toggle input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .toggle-slider {
    position: absolute;
    cursor: pointer;
    inset: 0;
    background: var(--surface-border);
    border-radius: 12px;
    transition: background var(--spring-snappy);
  }

  .toggle-slider:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 3px;
    bottom: 3px;
    background: var(--text-tertiary);
    border-radius: 50%;
    transition: transform var(--spring-snappy), background var(--spring-snappy);
  }

  .toggle input:checked + .toggle-slider {
    background: var(--accent-primary);
  }

  .toggle input:checked + .toggle-slider:before {
    transform: translateX(20px);
    background: var(--color-abyss-0);
  }

  .toggle input:focus-visible + .toggle-slider {
    outline: 2px solid var(--accent-primary);
    outline-offset: 2px;
  }
</style>