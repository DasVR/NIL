<script lang="ts">
</script>

<div class="settings-pane">
  <h3>Terminal</h3>
  <p class="settings-description">Shell, PTY, and terminal emulator preferences</p>
  <div class="settings-group">
    <h4>Shell</h4>
    <div class="settings-row">
      <label>Default shell</label>
      <select>
        <option>/bin/bash</option>
        <option>/bin/zsh</option>
        <option>/bin/fish</option>
      </select>
    </div>
  </div>
</div>

<style>
  .settings-pane { padding: var(--space-4); }
  .settings-description { font-size: var(--font-xs); color: var(--text-tertiary); margin-bottom: var(--space-4); }
  .settings-group { margin-bottom: var(--space-4); }
  .settings-group h4 { font-size: var(--font-xs); text-transform: uppercase; letter-spacing: var(--tracking-wide); color: var(--text-tertiary); margin-bottom: var(--space-2); }
  .settings-row { display: flex; align-items: center; justify-content: space-between; padding: var(--space-2) 0; border-bottom: 1px solid var(--surface-border); }
</style>