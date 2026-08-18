<script lang="ts">
  import { SEVERITY_COLOR, parseFindingBody } from '$lib/findings';
  import type { Finding } from '$lib/types';
  import { appState } from '$lib/stores.svelte';

  let { finding }: { finding: Finding } = $props();

  const sev = $derived((finding.severity || 'info').toLowerCase());
  const color = $derived(SEVERITY_COLOR[sev] || SEVERITY_COLOR.info);
  const sections = $derived(parseFindingBody(finding.body));
</script>

<article class="card" class:critical={sev === 'critical'}>
  <header>
    <span class="sev mono" style="color:{color}">{sev.toUpperCase()}</span>
    {#if sections.cvss && sections.cvss !== 'n/a'}
      <span class="mono cvss">{sections.cvss}</span>
    {/if}
    <span class="file mono">{finding.file}</span>
  </header>
  <h3>{finding.title}</h3>
  {#if sections.description}
    <section>
      <span class="label-micro">Why it matters</span>
      <p>{sections.description.slice(0, 600)}</p>
    </section>
  {/if}
  {#if sections.evidence}
    <section>
      <span class="label-micro">Evidence</span>
      <pre class="mono">{sections.evidence.slice(0, 800)}</pre>
    </section>
  {/if}
  {#if sections.remediation}
    <section>
      <span class="label-micro">Remediation</span>
      <p>{sections.remediation.slice(0, 400)}</p>
    </section>
  {/if}
  <footer>
    <button type="button" onclick={() => appState.askAboutFinding(finding, 'Explain this finding.')}>Explain</button>
    <button type="button" onclick={() => appState.askAboutFinding(finding, 'Draft a report section for this finding.')}>Draft</button>
    <button
      type="button"
      onclick={() => {
        navigator.clipboard.writeText(finding.body);
      }}>Copy</button
    >
    <button type="button" onclick={() => appState.openFindingArtifact(finding)}>Export</button>
  </footer>
</article>

<style>
  .card {
    padding: 10px 12px;
    border: 1px solid var(--glass-border);
    border-radius: 8px;
    background: var(--abyss-3);
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .card.critical {
    border-color: rgba(255, 45, 85, 0.35);
    box-shadow: var(--shadow-critical);
  }
  header { display: flex; align-items: center; gap: 8px; }
  .sev { font-size: 10px; font-weight: 700; letter-spacing: 0.04em; }
  .cvss, .file { font-size: 10px; color: var(--text-faint); }
  h3 { margin: 0; font-size: 13px; font-weight: 600; }
  p { margin: 4px 0 0; font-size: 12px; color: var(--text-dim); line-height: 1.45; }
  pre {
    margin: 4px 0 0;
    font-size: 11px;
    color: var(--text-dim);
    white-space: pre-wrap;
    max-height: 120px;
    overflow: auto;
  }
  footer { display: flex; gap: 6px; flex-wrap: wrap; }
  footer button {
    height: 24px;
    min-height: unset;
    font-size: 11px;
    padding: 0 8px;
  }
</style>
