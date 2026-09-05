<script lang="ts">
  import { magnetic } from '$lib/motion/magnetic.svelte.ts';
  import { tabsStore } from '$lib/stores/tabsStore';
  import { appState } from '$lib/stores/appState.svelte.ts';

  const templates = [
    { id: 'local-scan', label: 'New local scan', desc: 'Sandboxed audit against a local target.' },
    { id: 'web-audit', label: 'New web audit', desc: 'Crawl, fingerprint, and score a public web app.' },
    { id: 'import', label: 'Import engagement', desc: 'Load an existing engagement from JSON.' },
  ];

  function startEngagement() {
    tabsStore.showStream();
    appState.focusComposer();
  }
</script>

<section class="empty">
  <p class="kicker">nil</p>
  <h1 class="title">Open an engagement or start a new one.</h1>
  <p class="lede">No findings yet. Run a hunt to start collecting evidence.</p>

  <div class="actions">
    {#each templates as template (template.id)}
      <button
        class="nil-lift nil-halo nil-magnetic row"
        type="button"
        {@attach magnetic}
        onclick={() => startEngagement()}
      >
        <span class="label">{template.label}</span>
        <span class="desc">{template.desc}</span>
      </button>
    {/each}
  </div>
</section>

<style>
  .empty {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    gap: var(--s-3);
    padding: var(--s-6);
    max-width: 36rem;
  }

  .kicker {
    font: 600 var(--t-micro)/1 var(--font-machine);
    letter-spacing: var(--track-tick);
    text-transform: lowercase;
    color: var(--nil-ink-3);
  }

  .title {
    font: 500 var(--t-head)/var(--lh-tight) var(--font-ui);
    letter-spacing: var(--track-tight);
    color: var(--nil-ink);
  }

  .lede {
    font: var(--t-body)/var(--lh-body) var(--font-ui);
    color: var(--nil-ink-2);
    max-width: 42ch;
  }

  .actions {
    display: flex;
    flex-direction: column;
    gap: 6px;
    width: 100%;
    margin-block-start: var(--s-3);
  }

  .row {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
    padding: 10px var(--s-3);
    text-align: left;
    background: var(--nil-raised);
    border: 1px solid var(--nil-line);
    border-radius: var(--r-field);
    cursor: pointer;
  }

  .label {
    font: 500 var(--t-body)/1.3 var(--font-ui);
    color: var(--nil-ink);
  }

  .desc {
    font: var(--t-meta)/1.3 var(--font-ui);
    color: var(--nil-ink-3);
  }
</style>
