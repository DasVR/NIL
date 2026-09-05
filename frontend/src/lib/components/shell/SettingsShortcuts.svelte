<script lang="ts">
</script>

<div class="settings-pane">
  <h3>Keyboard shortcuts</h3>
  <p class="settings-description">Workstation bindings. Cmd is Ctrl on Windows and Linux.</p>
  <div class="settings-group">
    <h4>General</h4>
    <div class="settings-row">
      <span>Command palette</span>
      <kbd>Cmd+K</kbd>
    </div>
    <div class="settings-row">
      <span>Focus composer</span>
      <kbd>Cmd+J</kbd>
    </div>
    <div class="settings-row">
      <span>Settings</span>
      <kbd>Cmd+,</kbd>
    </div>
    <div class="settings-row">
      <span>Toggle sidebar</span>
      <kbd>Cmd+B</kbd>
    </div>
    <div class="settings-row">
      <span>Toggle inspector</span>
      <kbd>Cmd+\</kbd>
    </div>
  </div>
  <div class="settings-group">
    <h4>Agent</h4>
    <div class="settings-row">
      <span>Approve pending tool</span>
      <kbd>Cmd+Enter</kbd>
    </div>
    <div class="settings-row">
      <span>Reject pending tool</span>
      <kbd>Cmd+Shift+Enter</kbd>
    </div>
    <div class="settings-row">
      <span>Toggle YOLO</span>
      <kbd>Cmd+Y</kbd>
    </div>
  </div>
  <div class="settings-group">
    <h4>Tabs</h4>
    <div class="settings-row">
      <span>New terminal</span>
      <kbd>Cmd+T</kbd>
    </div>
    <div class="settings-row">
      <span>Close tab</span>
      <kbd>Cmd+W</kbd>
    </div>
  </div>
</div>

<style>
  .settings-pane { padding: var(--s-4); }
  .settings-description { font-size: var(--t-meta); color: var(--nil-ink-3); margin-bottom: var(--s-4); }
  .settings-group { margin-bottom: var(--s-4); }
  .settings-group h4 { font-size: var(--t-micro); letter-spacing: var(--track-tick); text-transform: uppercase; color: var(--nil-ink-3); margin-bottom: var(--s-2); }
  .settings-row { display: flex; align-items: center; justify-content: space-between; padding: var(--s-2) 0; border-bottom: 1px solid var(--nil-line); font: var(--t-meta)/1 var(--font-ui); color: var(--nil-ink); }
  kbd { font: var(--t-micro)/1 var(--font-machine); color: var(--nil-ink-2); }
</style>
