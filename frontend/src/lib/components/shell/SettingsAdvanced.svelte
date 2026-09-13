<script lang="ts">
  import { appState } from '$lib/stores/appState.svelte.ts';
  import ToggleRow from '$lib/ui/ToggleRow.svelte';
</script>

<div class="settings-pane">
  <h3>Advanced</h3>
  <p class="settings-description">YOLO auto-approves tool runs for the active engagement.</p>
  <div class="settings-group">
    <h4>Agent</h4>
    <ToggleRow
      label="YOLO mode"
      description="Skip the approval gate for this engagement"
      checked={appState.yoloMode}
      onChange={() => { void appState.toggleYolo(); }}
    />
  </div>
</div>

<style>
  .settings-pane { padding: var(--s-4); }
  .settings-description { font: var(--t-meta)/var(--lh-body) var(--font-ui); color: var(--nil-ink-3); margin-bottom: var(--s-4); }
  .settings-group { margin-bottom: var(--s-4); }
  .settings-group h4 { font: 600 var(--t-micro)/1 var(--font-ui); letter-spacing: var(--track-tick); text-transform: uppercase; color: var(--nil-ink-3); margin-bottom: var(--s-2); }
</style>
