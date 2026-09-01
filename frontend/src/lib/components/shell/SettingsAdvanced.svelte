<script lang="ts">
</script>

<div class="settings-pane">
  <h3>Advanced</h3>
  <p class="settings-description">Power user and debug settings</p>
  <div class="settings-group">
    <h4>Developer</h4>
    <div class="settings-row">
      <label>Debug logging</label>
      <input type="checkbox" />
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