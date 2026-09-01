<script lang="ts">
  import Icon from '@iconify/svelte';

  interface Finding {
    id: string;
    title: string;
    severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
    cvss: string;
    date: string;
    description: string;
    evidence: string;
    remediation: string;
  }

  interface Props {
    finding: Finding;
    onExplain?: () => void;
    onDraft?: () => void;
  }

  let { finding, onExplain, onDraft }: Props = $props();

  function getSeverityColor(severity: string) {
    switch (severity) {
      case 'critical': return 'var(--color-danger)';
      case 'high': return 'var(--color-danger)';
      case 'medium': return 'var(--color-warning)';
      case 'low': return 'var(--color-info)';
      case 'info': return 'var(--text-tertiary)';
      default: return 'var(--surface-border)';
    }
  }

  function getSeverityLabel(severity: string) {
    return severity.charAt(0).toUpperCase() + severity.slice(1);
  }
</script>

<article class="finding-card" style="--severity-color: {getSeverityColor(finding.severity)}">
  <div class="finding-header">
    <div class="finding-title-row">
      <span class="finding-severity-dot"></span>
      <h3 class="finding-title">{finding.title}</h3>
    </div>
    <div class="finding-meta">
      <span class="finding-severity">{getSeverityLabel(finding.severity)}</span>
      <span class="finding-cvss">CVSS: {finding.cvss}</span>
      <span class="finding-date">{finding.date}</span>
    </div>
  </div>

  <div class="finding-divider"></div>

  <div class="finding-body">
    <section class="finding-section">
      <h4 class="finding-section-title">Description</h4>
      <p class="finding-text">{finding.description}</p>
    </section>

    <section class="finding-section">
      <h4 class="finding-section-title">Evidence</h4>
      <pre class="finding-code"><code>{finding.evidence}</code></pre>
    </section>

    <section class="finding-section">
      <h4 class="finding-section-title">Remediation</h4>
      <p class="finding-text">{finding.remediation}</p>
    </section>
  </div>

  <div class="finding-divider"></div>

  <div class="finding-actions">
    <button class="finding-btn explain" onclick={() => onExplain?.()} disabled={!onExplain}>
      <Icon icon="ph:lightbulb-bold" width="14" height="14" />
      <span>Explain</span>
    </button>
    <button class="finding-btn draft" onclick={() => onDraft?.()} disabled={!onDraft}>
      <Icon icon="ph:pencil-bold" width="14" height="14" />
      <span>Draft</span>
    </button>
  </div>
</article>

<style>
  .finding-card {
    background: var(--surface-card);
    border: 1px solid var(--surface-border);
    border-radius: var(--radius-panel);
    border-left: 3px solid var(--severity-color);
    overflow: hidden;
    transition: border-color var(--spring-snappy), box-shadow var(--spring-snappy);
  }

  .finding-card:hover {
    box-shadow: 0 0 0 1px var(--severity-color);
  }

  .finding-header {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    padding: var(--space-3) var(--space-4);
    background: var(--surface-hover);
    border-bottom: 1px solid var(--surface-border);
  }

  .finding-title-row {
    display: flex;
    align-items: flex-start;
    gap: 8px;
  }

  .finding-severity-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--severity-color);
    flex-shrink: 0;
    margin-top: 3px;
  }

  .finding-title {
    flex: 1;
    font-size: var(--font-xs);
    font-weight: 600;
    color: var(--text-primary);
    line-height: 1.4;
  }

  .finding-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    font-family: var(--font-mono);
    font-size: var(--font-2xs);
    color: var(--text-tertiary);
  }

  .finding-severity {
    text-transform: uppercase;
    font-weight: 600;
    color: var(--severity-color);
  }

  .finding-cvss {
    color: var(--text-secondary);
  }

  .finding-date {
    color: var(--text-tertiary);
  }

  .finding-divider {
    height: 1px;
    background: var(--surface-border);
    margin: 0 var(--space-3);
  }

  .finding-body {
    padding: var(--space-3) var(--space-4);
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .finding-section-title {
    font-size: var(--font-2xs);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: var(--tracking-wide);
    color: var(--text-tertiary);
    margin-bottom: var(--space-1);
  }

  .finding-text {
    font-size: var(--font-xs);
    color: var(--text-secondary);
    line-height: 1.5;
  }

  .finding-code {
    margin: 0;
    padding: var(--space-2);
    background: var(--surface-input);
    border: 1px solid var(--surface-border);
    border-radius: var(--radius-control);
    overflow: auto;
  }

  .finding-code code {
    font-family: var(--font-mono);
    font-size: var(--font-2xs);
    line-height: 1.5;
    color: var(--text-secondary);
    background: none;
    padding: 0;
  }

  .finding-actions {
    display: flex;
    gap: 8px;
    padding: var(--space-2) var(--space-4) var(--space-3);
    border-top: 1px solid var(--surface-border);
  }

  .finding-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    flex: 1;
    padding: 8px 12px;
    border: 1px solid var(--surface-border);
    border-radius: var(--radius-control);
    background: var(--surface-card);
    color: var(--text-secondary);
    font-size: var(--font-xs);
    font-weight: 500;
    cursor: pointer;
    transition: all var(--spring-snappy);
  }

  .finding-btn:hover {
    background: var(--surface-hover);
    color: var(--text-primary);
    border-color: var(--accent-primary);
  }

  .finding-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .finding-btn.explain:hover {
    border-color: var(--accent-primary);
  }

  .finding-btn.draft:hover {
    border-color: var(--accent-secondary);
  }
</style>