<script lang="ts">
  import { appState } from '$lib/stores/appState.svelte.ts';
</script>

<div class="settings-pane">
  <h3>Advanced</h3>
  <p class="settings-description">YOLO auto-approves tool runs for the active engagement.</p>
  <div class="settings-group">
    <h4>Agent</h4>
    <div class="settings-row">
      <label>YOLO</label>
      <span class="mono">{appState.yoloMode ? 'on' : 'off'}</span>
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
