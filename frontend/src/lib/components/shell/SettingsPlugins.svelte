<script lang="ts">
  const plugins = ['nmap', 'nuclei', 'ffuf', 'gobuster', 'httpx', 'whatweb', 'nikto', 'sslscan', 'subfinder'];
</script>

<div class="settings-pane">
  <h3>Plugins</h3>
  <p class="settings-description">Built-in scanners. Drop a file in finn_pentest/plugins to add another.</p>
  <div class="settings-group">
    <h4>Shipped</h4>
    {#each plugins as name}
      <div class="settings-row">
        <span class="mono">{name}</span>
      </div>
    {/each}
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
