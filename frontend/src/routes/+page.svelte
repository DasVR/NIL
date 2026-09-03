<script lang="ts">
  import { onMount } from 'svelte';
  import Icon from '@iconify/svelte';
  import ThinkingLogo from '$lib/components/effects/ThinkingLogo.svelte';
  import { appState } from '$lib/stores/appState.svelte.ts';
  import { tabsStore } from '$lib/stores/tabsStore';

  let mounted = $state(false);

  onMount(() => {
    requestAnimationFrame(() => { mounted = true; });
  });

  const templates = [
    {
      id: 'local-scan',
      label: 'New local scan',
      desc: 'Sandboxed audit against a local target.',
      icon: 'ph:shield-check-bold',
      accent: 'coral',
    },
    {
      id: 'web-audit',
      label: 'New web audit',
      desc: 'Crawl, fingerprint, and score a public web app.',
      icon: 'ph:globe-bold',
      accent: 'violet',
    },
    {
      id: 'import',
      label: 'Import engagement',
      desc: 'Load an existing engagement from JSON.',
      icon: 'ph:folder-open-bold',
      accent: 'cream',
    },
  ];

  function startEngagement(id: string) {
    const terminalId = `terminal-${Date.now()}`;
    tabsStore.addTab({ id: terminalId, type: 'terminal', label: 'Terminal', dirty: false });
    appState.aiStripState = 'composer';
  }
</script>

<section class="empty-state" class:mounted>
  <div class="hero">
    <div class="hero-logo">
      <ThinkingLogo state="idle" size="2.5rem" />
    </div>
    <h1 class="title">NIL</h1>
    <p class="subtitle">Open an engagement or start a new one.</p>
    <div class="hero-hints">
      <span class="hint"><kbd>Cmd+K</kbd> Command palette</span>
      <span class="hint-sep">·</span>
      <span class="hint"><kbd>Cmd+J</kbd> AI strip</span>
      <span class="hint-sep">·</span>
      <span class="hint"><kbd>Cmd+T</kbd> New terminal</span>
    </div>
  </div>

  <div class="templates">
    {#each templates as template, i (template.id)}
      <button
        class="template-card accent-{template.accent}"
        type="button"
        style:--delay="{i * 60}ms"
        onclick={() => startEngagement(template.id)}
      >
        <span class="template-icon">
          <Icon icon={template.icon} width="16" height="16" />
        </span>
        <span class="template-text">
          <span class="template-label">{template.label}</span>
          <span class="template-desc">{template.desc}</span>
        </span>
        <span class="template-arrow" aria-hidden="true">
          <Icon icon="ph:arrow-right-bold" width="12" height="12" />
        </span>
      </button>
    {/each}
  </div>
</section>

<style>
  .empty-state {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--space-7);
    padding: var(--space-6);
    overflow: auto;
  }

  .hero {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-2);
    text-align: center;
    opacity: 0;
    transform: translateY(12px);
    transition: opacity 360ms var(--spring-smooth), transform 360ms var(--spring-smooth);
  }

  .mounted .hero {
    opacity: 1;
    transform: translateY(0);
  }

  .hero-logo {
    margin-bottom: var(--space-1);
  }

  .title {
    font-family: var(--font-mono);
    font-size: var(--step-4);
    font-weight: 700;
    letter-spacing: -0.04em;
    color: var(--color-cream);
    line-height: 1;
  }

  .subtitle {
    font-size: var(--font-xs);
    color: var(--text-tertiary);
    max-width: 36ch;
    line-height: 1.5;
  }

  .hero-hints {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    margin-top: var(--space-2);
    font-size: 11px;
    color: var(--text-tertiary);
    flex-wrap: wrap;
    justify-content: center;
  }

  .hint {
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .hint kbd {
    font-family: var(--font-mono);
    font-size: 10px;
    padding: 2px 5px;
    border-radius: 4px;
    background: var(--surface-hover);
    border: 1px solid var(--surface-border);
    color: var(--text-secondary);
    line-height: 1.4;
  }

  .hint-sep {
    color: var(--text-muted);
    font-size: 10px;
  }

  .templates {
    display: flex;
    flex-direction: column;
    gap: 6px;
    width: 100%;
    max-width: 380px;
    opacity: 0;
    transform: translateY(8px);
    transition: opacity 400ms 80ms var(--spring-smooth), transform 400ms 80ms var(--spring-smooth);
  }

  .mounted .templates {
    opacity: 1;
    transform: translateY(0);
  }

  .template-card {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: 10px var(--space-3);
    text-align: left;
    color: var(--text-primary);
    background: var(--surface-card);
    border: 1px solid var(--surface-border);
    border-radius: var(--radius-control);
    cursor: pointer;
    transition:
      border-color var(--dur-fast) var(--spring-snappy),
      background var(--dur-fast) var(--spring-snappy),
      transform var(--dur-fast) var(--spring-snappy);
    animation: cardIn 300ms var(--delay, 0ms) var(--spring-smooth) both;
  }

  @keyframes cardIn {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .template-card:hover {
    border-color: var(--accent-primary-light);
    background: var(--surface-hover);
    transform: translateX(2px);
  }

  .template-card:active {
    transform: translateX(1px) scale(0.99);
  }

  .template-card:focus-visible {
    outline: 2px solid var(--accent-primary);
    outline-offset: 2px;
  }

  .template-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: var(--radius-control);
    flex-shrink: 0;
    transition: transform var(--dur-fast) var(--spring-bouncy);
  }

  .template-card:hover .template-icon {
    transform: scale(1.1);
  }

  .accent-coral .template-icon {
    color: var(--color-coral);
    background: rgba(254, 111, 105, 0.1);
  }

  .accent-violet .template-icon {
    color: var(--color-violet-light);
    background: rgba(169, 177, 240, 0.1);
  }

  .accent-cream .template-icon {
    color: var(--color-cream);
    background: rgba(245, 242, 236, 0.08);
  }

  .template-text {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
    flex: 1;
  }

  .template-label {
    font-size: var(--font-xs);
    font-weight: 500;
    color: var(--text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .template-desc {
    font-size: 11px;
    color: var(--text-tertiary);
    line-height: 1.3;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .template-arrow {
    color: var(--text-tertiary);
    flex-shrink: 0;
    opacity: 0;
    transform: translateX(-4px);
    transition: opacity var(--dur-fast) var(--spring-snappy),
      transform var(--dur-fast) var(--spring-snappy);
  }

  .template-card:hover .template-arrow {
    opacity: 1;
    transform: translateX(0);
  }

  @media (prefers-reduced-motion: reduce) {
    .hero, .templates { transition: none; opacity: 1; transform: none; }
    .template-card { animation: none; transition: none; }
    .template-card:hover { transform: none; }
    .template-icon, .template-arrow { transition: none; }
    .mounted .hero, .mounted .templates { opacity: 1; transform: none; }
  }
</style>
