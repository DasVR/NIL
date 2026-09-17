<script lang="ts">
  import DitherWaterfall from '$lib/ui/DitherWaterfall.svelte';
  import DitherWipe from '$lib/ui/DitherWipe.svelte';
  import NilMonogram from '$lib/components/ui/NilMonogram.svelte';
  import { workspace } from '$lib/stores/workspace.svelte.ts';

  const cover = $derived(workspace.reportCover);
</script>

{#if cover}
  <section class="cover" aria-label="Report cover">
    <div class="wash" aria-hidden="true">
      <DitherWaterfall />
      <DitherWipe mode="wipe" tone="ember" />
    </div>
    <div class="scrim"></div>
    <div class="hero">
      <NilMonogram state={cover.status === 'ready' ? 'resolved' : 'active'} size={48} />
      <p class="kicker">nil report</p>
      <h1>{cover.title}</h1>
      <p class="lede">
        {#if cover.status === 'writing'}
          Writing the engagement report.
        {:else if cover.status === 'ready'}
          Report written. Opening the markdown.
        {:else}
          {cover.error}
        {/if}
      </p>
      {#if cover.status !== 'writing'}
        <button class="nil-lift nil-halo go" type="button" onclick={() => workspace.dismissReportCover()}>
          Close cover
        </button>
      {/if}
    </div>
  </section>
{/if}

<style>
  .cover {
    position: fixed;
    inset: 0;
    z-index: var(--z-overlay);
    display: grid;
    place-items: center;
  }
  .wash, .scrim { position: absolute; inset: 0; pointer-events: none; }
  /* Zone A: the ember ambient sits up-stage of the hero over the dither wash,
     and the void fade underneath is eased so the cover settles into the well
     instead of banding at a midpoint. Same sigmoid as tokens.css. */
  .scrim {
    background:
      var(--wash-ember),
      linear-gradient(180deg,
        color-mix(in oklab, var(--nil-void) 56%,   transparent) 0%,
        color-mix(in oklab, var(--nil-void) 58.2%, transparent) 14%,
        color-mix(in oklab, var(--nil-void) 63.9%, transparent) 28%,
        color-mix(in oklab, var(--nil-void) 72.7%, transparent) 42%,
        color-mix(in oklab, var(--nil-void) 83.3%, transparent) 57%,
        color-mix(in oklab, var(--nil-void) 92.1%, transparent) 71%,
        color-mix(in oklab, var(--nil-void) 97.8%, transparent) 86%,
        var(--nil-void) 100%);
  }
  .hero {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--s-3);
    padding: var(--s-6);
    max-width: 32rem;
    width: 100%;
  }
  .kicker {
    font: 600 var(--t-micro)/1 var(--font-machine);
    letter-spacing: var(--track-tick);
    color: var(--brand-ember-300);
  }
  h1 {
    font: 500 var(--t-display)/var(--lh-tight) var(--font-ui);
    letter-spacing: var(--track-tight);
    color: var(--nil-ink);
  }
  .lede {
    font: var(--t-body)/var(--lh-body) var(--font-ui);
    color: var(--nil-ink-2);
    max-width: 42ch;
  }
  .go {
    height: 28px;
    padding: 0 var(--s-3);
    border: 1px solid var(--nil-line-hot);
    border-radius: var(--r-field);
    background: var(--nil-raised);
    color: var(--nil-ink);
    font: 500 var(--t-meta)/1 var(--font-ui);
    cursor: pointer;
  }
</style>
