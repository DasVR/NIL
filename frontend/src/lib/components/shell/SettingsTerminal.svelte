<script lang="ts">
</script>

<div class="settings-pane">
  <h3>Terminal</h3>
  <p class="settings-description">Live PTY is Tauri-only. Browser sessions show a notice instead of a fake prompt.</p>
  <div class="settings-group">
    <h4>Defaults</h4>
    <div class="settings-row">
      <span>Font</span>
      <span class="mono">JetBrains Mono 13</span>
    </div>
    <div class="settings-row">
      <span>PTY</span>
      <span>Tauri sidecar</span>
    </div>
  </div>
</div>

<style>
  .settings-pane { padding: var(--s-4); }
  .settings-description { font: var(--t-meta)/var(--lh-body) var(--font-ui); color: var(--nil-ink-3); margin-bottom: var(--s-4); }
  .settings-group { margin-bottom: var(--s-4); }
  .settings-group h4 { font: 600 var(--t-micro)/1 var(--font-ui); letter-spacing: var(--track-tick); text-transform: uppercase; color: var(--nil-ink-3); margin-bottom: var(--s-2); }
  .settings-row { display: flex; align-items: center; justify-content: space-between; padding: var(--s-2) 0; border-bottom: 1px solid var(--nil-line); font: var(--t-meta)/1 var(--font-ui); color: var(--nil-ink); }
  .mono { font-family: var(--font-machine); color: var(--nil-ink-2); }
</style>
