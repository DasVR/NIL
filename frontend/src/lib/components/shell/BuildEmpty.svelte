<script lang="ts">
  import { appState } from '$lib/stores/appState.svelte.ts';

  function focusComposer() {
    appState.focusComposer();
  }
</script>

<section class="empty" aria-label="Build">
  <div class="copy">
    <p class="kicker">Build</p>
    <h1>Idle.</h1>
    <button class="nil-lift nil-halo go" type="button" onclick={focusComposer}>
      Describe a task
    </button>
  </div>
</section>

<style>
  .empty {
    position: relative;
    isolation: isolate;
    width: 100%;
    height: 100%;
    display: grid;
    place-items: center;
  }
  /* Same stage ambient as Welcome: the idle field is lit, not flat. Ink only. */
  .empty::before {
    content: "";
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    background: var(--wash-stage);
  }
  @media (prefers-reduced-transparency: reduce) {
    .empty::before { display: none; }
  }
  .copy {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    gap: var(--s-3);
    max-width: 36ch;
    padding: var(--s-6);
  }
  .kicker {
    font: 600 var(--t-micro)/1 var(--font-ui);
    letter-spacing: var(--track-tick);
    text-transform: uppercase;
    color: var(--nil-ink-3);
    margin: 0;
  }
  h1 {
    font: 500 var(--t-head)/var(--lh-tight) var(--font-ui);
    color: var(--nil-ink);
    margin: 0;
  }
  .go {
    align-self: flex-start;
    height: 28px;
    padding: 0 var(--s-3);
    border: 1px solid var(--nil-line);
    border-radius: var(--r-field);
    background: var(--nil-raised);
    color: var(--nil-ink);
    font: 500 var(--t-meta)/1 var(--font-ui);
    cursor: pointer;
  }
</style>
