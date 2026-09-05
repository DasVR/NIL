<script lang="ts">
</script>

<div class="settings-pane">
  <h3>Agent</h3>
  <p class="settings-description">Models come from the API provider list. Mode prompts ship in prompts/.</p>
  <div class="settings-group">
    <h4>Modes</h4>
    <div class="settings-row">
      <span class="mode">hunt</span>
      <span>Recon and evidence</span>
    </div>
    <div class="settings-row">
      <span class="mode">chat</span>
      <span>Questions against the engagement</span>
    </div>
    <div class="settings-row">
      <span class="mode">code</span>
      <span>Payloads and scripts</span>
    </div>
    <div class="settings-row">
      <span class="mode">report</span>
      <span>Write-up from findings</span>
    </div>
  </div>
</div>

<style>
  .settings-pane { padding: var(--s-4); }
  .settings-description { font: var(--t-meta)/var(--lh-body) var(--font-ui); color: var(--nil-ink-3); margin-bottom: var(--s-4); }
  .settings-group { margin-bottom: var(--s-4); }
  .settings-group h4 { font: 600 var(--t-micro)/1 var(--font-ui); letter-spacing: var(--track-tick); text-transform: uppercase; color: var(--nil-ink-3); margin-bottom: var(--s-2); }
  .settings-row { display: flex; align-items: center; justify-content: space-between; padding: var(--s-2) 0; border-bottom: 1px solid var(--nil-line); font: var(--t-meta)/1 var(--font-ui); color: var(--nil-ink); }
  .settings-row span.mode { font-family: var(--font-machine); color: var(--nil-ink-2); }
</style>
