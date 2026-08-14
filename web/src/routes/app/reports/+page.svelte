<script>
  import { appState } from '$lib/stores.svelte';
  import { apiPost } from '$lib/api';

  let report = $state('');
  let fmt = $state('markdown');

  async function generate() {
    const data = await apiPost('/v1/reports/generate', {
      engagement: appState.engagement,
      format: fmt
    });
    report = fmt === 'json' ? JSON.stringify(data.report, null, 2) : data.report;
  }

  function download() {
    const blob = new Blob([report], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `finn-${appState.engagement}.${fmt === 'json' ? 'json' : 'md'}`;
    a.click();
  }
</script>

<section class="page">
  <h1>Reports</h1>
  <div class="row">
    <select bind:value={fmt}><option>markdown</option><option>json</option></select>
    <button class="primary" onclick={generate}>Generate</button>
    <button onclick={download} disabled={!report}>Download</button>
  </div>
  <pre>{report}</pre>
</section>

<style>
  .page { padding: 1.2rem; display: flex; flex-direction: column; height: 100%; }
  .row { display: flex; gap: 0.5rem; }
  pre { flex: 1; overflow: auto; background: var(--navy); padding: 1rem; border-radius: 8px; }
</style>
