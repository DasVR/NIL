<script lang="ts">
  import Icon from '@iconify/svelte';
  import ThinkingLogo from '$lib/components/effects/ThinkingLogo.svelte';

  const templates = [
    {
      id: 'local-scan',
      label: 'New local scan',
      desc: 'Run a sandboxed audit against a local target.',
      icon: 'ph:shield-check-bold',
    },
    {
      id: 'web-audit',
      label: 'New web audit',
      desc: 'Crawl, fingerprint, and score a public web app.',
      icon: 'ph:globe-bold',
    },
    {
      id: 'import',
      label: 'Import engagement',
      desc: 'Load an existing engagement from Obsidian or JSON.',
      icon: 'ph:folder-down-bold',
    },
  ];
</script>

<section class="empty-state">
  <div class="hero">
    <ThinkingLogo state="idle" size="3.5rem" />
    <h1 class="title">NIL</h1>
    <p class="subtitle">Pick an engagement template or open one from the sidebar.</p>
  </div>

  <div class="templates">
    {#each templates as template (template.id)}
      <button class="template-card glass-1" type="button">
        <span class="template-icon">
          <Icon icon={template.icon} width="1.25rem" height="1.25rem" />
        </span>
        <span class="template-text">
          <span class="template-label">{template.label}</span>
          <span class="template-desc">{template.desc}</span>
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
    gap: var(--space-6);
    padding: var(--space-5);
    overflow: auto;
  }

  .hero {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-3);
    text-align: center;
  }

  .title {
    font-family: var(--font-mono);
    font-size: var(--step-5);
    font-weight: 600;
    letter-spacing: -0.03em;
    color: var(--accent-cream);
  }

  .subtitle {
    font-size: var(--step-0);
    color: var(--text-secondary);
    max-width: 48ch;
  }

  .templates {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3);
    justify-content: center;
    width: 100%;
    max-width: 48rem;
  }

  .template-card {
    flex: 1 1 min(14rem, 100%);
    display: flex;
    align-items: flex-start;
    gap: var(--space-3);
    padding: var(--space-4);
    text-align: left;
    color: var(--text-primary);
    background: none;
    border: 1px solid var(--border-default);
    border-radius: var(--radius-lg);
    cursor: pointer;
    transition:
      border-color var(--dur-base) var(--spring-smooth),
      transform var(--dur-base) var(--spring-smooth),
      background-color var(--dur-base) var(--spring-smooth);
  }

  .template-card:hover {
    border-color: var(--accent-primary-light);
    background: rgba(169, 177, 240, 0.06);
    transform: translateY(-2px);
  }

  .template-card:focus-visible {
    outline: 2px solid var(--accent-primary-light);
    outline-offset: 2px;
  }

  .template-card:active {
    transform: translateY(0) scale(0.99);
  }

  .template-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    border-radius: var(--radius-md);
    color: var(--accent-coral);
    background: rgba(254, 111, 105, 0.08);
    flex-shrink: 0;
  }

  .template-text {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    min-width: 0;
  }

  .template-label {
    font-weight: 500;
    color: var(--text-primary);
  }

  .template-desc {
    font-size: var(--step--1);
    color: var(--text-tertiary);
    line-height: 1.35;
  }

  @media (prefers-reduced-motion: reduce) {
    .template-card {
      transition: none;
    }
    .template-card:hover {
      transform: none;
    }
  }
</style>
