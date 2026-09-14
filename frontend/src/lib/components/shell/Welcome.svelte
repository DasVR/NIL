<script lang="ts">
  import { magnetic } from '$lib/motion/magnetic.svelte.ts';
  import { droplet } from '$lib/motion/droplet';
  import { appState } from '$lib/stores/appState.svelte.ts';
  import { workspace } from '$lib/stores/workspace.svelte.ts';
  import DitherWaterfall from '$lib/ui/DitherWaterfall.svelte';
  import NilIcon from '$lib/ui/NilIcon.svelte';
  import NilMonogram from '$lib/components/ui/NilMonogram.svelte';
  import StreamComposer from '$lib/components/shell/StreamComposer.svelte';

  interface RecentRow {
    id: string;
    label: string;
    mode: 'build' | 'pentest';
    meta: string;
  }

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const recent = $derived.by(() => {
    const seen = new Set<string>();
    const out: RecentRow[] = [];
    for (const eng of appState.engagements.slice(0, 5)) {
      seen.add(eng.name);
      out.push({
        id: `eng:${eng.name}`,
        label: eng.name,
        mode: 'pentest',
        meta: `${eng.findings_count} findings`,
      });
    }
    for (const r of workspace.recents) {
      if (seen.has(r.label) || out.length >= 5) continue;
      seen.add(r.label);
      out.push({
        id: r.id,
        label: r.label,
        mode: r.mode,
        meta: r.mode === 'pentest' ? 'Hunt' : 'Build',
      });
    }
    return out;
  });

  function start(mode: 'build' | 'pentest') {
    workspace.beginSession(mode);
    workspace.showStream();
    appState.focusComposer();
  }

  function openRecent(item: RecentRow) {
    if (item.id.startsWith('eng:')) {
      appState.activeEngagementId = item.label;
      appState.activeTargetId = item.label;
    }
    workspace.resumeSession(item.mode, item.label);
    workspace.showStream();
    appState.focusComposer();
  }
</script>

<section class="welcome">
  <div class="wash" aria-hidden="true">
    <DitherWaterfall />
    <div class="scrim"></div>
  </div>

  <div class="hero">
    <div class="mark" aria-hidden="true"><NilMonogram state="idle" size={56} /></div>
    <p class="kicker">nil</p>
    <h1 class="title">{greeting}.</h1>
    <p class="lede">Build software, or hunt a target. Same workstation, two modes.</p>

    <div class="actions">
      <button class="nil-lift nil-halo nil-magnetic row" type="button" {@attach magnetic} onclick={() => start('build')}>
        <NilIcon name="hammer" size={16} />
        <span class="copy">
          <span class="label">Start building</span>
          <span class="desc">Code, diffs, and the agent at the composer.</span>
        </span>
      </button>
      <button class="nil-lift nil-halo nil-magnetic row" type="button" {@attach magnetic} onclick={() => start('pentest')}>
        <NilIcon name="shield" size={16} />
        <span class="copy">
          <span class="label">Start a hunt</span>
          <span class="desc">Load a target and collect evidence.</span>
        </span>
      </button>
    </div>

    <div class="welcome-composer">
      <StreamComposer />
    </div>

    {#if recent.length > 0}
      <div class="recent">
        <p class="eyebrow">Recent sessions</p>
        {#each recent as item (item.id)}
          <button class="session nil-halo" type="button" {@attach droplet} onclick={() => openRecent(item)}>
            <span class="s-name">{item.label}</span>
            <span class="s-meta">{item.meta}</span>
          </button>
        {/each}
      </div>
    {/if}
  </div>
</section>

<style>
  .welcome {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    overflow: hidden;
  }
  .wash { position: absolute; inset: 0; pointer-events: none; }
  .scrim {
    position: absolute;
    inset: 0;
    background: linear-gradient(to bottom,
      color-mix(in oklab, var(--nil-void) 55%, transparent) 0%,
      color-mix(in oklab, var(--nil-void) 88%, transparent) 42%,
      var(--nil-void) 100%);
  }
  .hero {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    text-align: left;
    gap: var(--s-3);
    padding: var(--s-6);
    max-width: 36rem;
    width: 100%;
  }
  .mark { margin-block-end: var(--s-1); }
  .kicker {
    font: 600 var(--t-micro)/1 var(--font-machine);
    letter-spacing: var(--track-tick);
    color: var(--brand-ember-300);
  }
  .title {
    font: 500 var(--t-display)/var(--lh-tight) var(--font-ui);
    letter-spacing: var(--track-tight);
    color: var(--nil-ink);
  }
  .lede {
    font: var(--t-body)/var(--lh-body) var(--font-ui);
    color: var(--nil-ink-2);
    max-width: 42ch;
  }
  .actions { display: flex; flex-direction: column; gap: 6px; width: 100%; margin-block-start: var(--s-2); }
  .welcome-composer { width: 100%; margin-block-start: var(--s-3); }
  .row {
    display: flex;
    align-items: center;
    gap: var(--s-3);
    padding: 10px var(--s-3);
    text-align: left;
    background: var(--nil-raised);
    border: 1px solid var(--nil-line);
    border-radius: var(--r-field);
    cursor: pointer;
    color: var(--nil-ink-2);
    width: 100%;
  }
  .copy { display: flex; flex-direction: column; gap: 2px; }
  .label { font: 500 var(--t-body)/1.3 var(--font-ui); color: var(--nil-ink); }
  .desc { font: var(--t-meta)/1.3 var(--font-ui); color: var(--nil-ink-3); }
  .recent { width: 100%; display: flex; flex-direction: column; gap: 4px; margin-block-start: var(--s-4); }
  .eyebrow {
    font: 600 var(--t-micro)/1 var(--font-ui);
    letter-spacing: var(--track-tick);
    text-transform: uppercase;
    color: var(--nil-ink-3);
    margin: 0 0 6px;
  }
  .session {
    display: flex;
    justify-content: space-between;
    gap: var(--s-3);
    width: 100%;
    height: var(--row-h);
    padding: 0 var(--s-2);
    border: 0;
    background: transparent;
    cursor: pointer;
    border-radius: var(--r-field);
  }
  .s-name { font: 500 var(--t-meta)/1 var(--font-machine); color: var(--nil-ink-2); }
  .s-meta { font: var(--t-micro)/1 var(--font-ui); color: var(--nil-ink-3); }
</style>
