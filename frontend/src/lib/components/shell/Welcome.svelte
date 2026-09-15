<script lang="ts">
  import { droplet } from '$lib/motion/droplet';
  import { appState } from '$lib/stores/appState.svelte.ts';
  import { workspace } from '$lib/stores/workspace.svelte.ts';
  import NilIcon, { type NilIconName } from '$lib/ui/NilIcon.svelte';
  import StreamComposer from '$lib/components/shell/StreamComposer.svelte';

  interface RecentRow {
    id: string;
    label: string;
    mode: 'build' | 'pentest';
    meta: string;
  }

  interface Starter {
    id: 'review' | 'draft' | 'debug';
    icon: NilIconName;
    label: string;
    desc: string;
    prompt: string;
  }

  // Design lock (v2.1): empty-state starters are invitations — review /
  // draft / debug. Each seeds the composer; the user finishes the sentence.
  const starters: Starter[] = [
    {
      id: 'review',
      icon: 'search',
      label: 'Review',
      desc: 'Read a change or a file and say what matters.',
      prompt: 'Review this and tell me what would block shipping it: ',
    },
    {
      id: 'draft',
      icon: 'file-text',
      label: 'Draft',
      desc: 'Write a first version to react to.',
      prompt: 'Draft a first version of: ',
    },
    {
      id: 'debug',
      icon: 'terminal',
      label: 'Debug',
      desc: 'Trace a failure back to its cause.',
      prompt: 'Debug this failure and trace it to the cause: ',
    },
  ];

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
        meta: r.mode === 'pentest' ? 'Session' : 'Build',
      });
    }
    return out;
  });

  // The session composer mounts fresh once the session starts and reads its
  // initial value from composerDraft, so seeding the draft first is enough
  // to land the starter prompt in the field. Mode follows the segment below.
  function startWith(starter: Starter) {
    workspace.composerDraft = starter.prompt;
    workspace.beginSession(workspace.workstationMode);
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

<section class="welcome" aria-label="Start a session">
  <div class="hero">
    <div class="actions">
      {#each starters as starter (starter.id)}
        <button class="nil-lift nil-halo row" type="button" onclick={() => startWith(starter)}>
          <span class="glyph"><NilIcon name={starter.icon} size={16} /></span>
          <span class="copy">
            <span class="label">{starter.label}</span>
            <span class="desc">{starter.desc}</span>
          </span>
        </button>
      {/each}
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
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    position: relative;
    isolation: isolate;
  }
  /* Zone A stage: a soft ink ambient lifts the empty cluster off the void so
     it reads as a staged moment, not a flat panel. Contained and faded — an
     ambient, not a wall wash, and no B/C glass. Ink only (this is not one of
     the four ember identity moments). */
  .welcome::before {
    content: "";
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    background: radial-gradient(120% 68% at 50% 40%,
      color-mix(in oklab, var(--nil-ink) 5%, transparent) 0%,
      color-mix(in oklab, var(--nil-ink) 2%, transparent) 34%,
      transparent 66%);
  }
  @media (prefers-reduced-transparency: reduce) {
    .welcome::before { display: none; }
  }
  .hero {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    text-align: left;
    gap: var(--s-3);
    padding: var(--s-6);
    max-width: 36rem;
    width: 100%;
  }
  .actions { display: flex; flex-direction: column; gap: 6px; width: 100%; }
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
    /* Resting elevation so the starter blocks read as lifted cards on the
       stage, not flat bars. Hover deepens to --lift-2 below. */
    box-shadow: var(--lift-1);
  }
  /* LIFT + PRESS from motion.css carry the base feel. The starter rows sit 6px
     apart, so the pull toward the cursor that MAGNETIC adds made them ride
     over each other; instead the hover stays in place and gets its energy
     from a deeper lift, a hotter surface, and the glyph waking up. The scale
     is small enough (≈0.4px of height) never to close the gap. Anchored under
     .actions so it outranks the .app-shell button:hover rule in motion.css. */
  .actions .row:hover:not(:active) {
    transform: translateY(-1px) scale(1.008);
    background: color-mix(in oklab, var(--nil-raised) 94%, var(--nil-ink));
    box-shadow: var(--lift-2);
    color: var(--nil-ink);
  }
  .glyph {
    display: inline-flex;
    flex: none;
    color: var(--nil-ink-3);
    transition: color var(--dur-flip) var(--ease-out),
                transform var(--dur-panel) var(--ease-spring);
  }
  .row:hover .glyph { color: var(--nil-ink); transform: scale(1.12); }
  .copy { display: flex; flex-direction: column; gap: 2px; }
  .label { font: 500 var(--t-body)/1.3 var(--font-ui); color: var(--nil-ink); }
  .desc {
    font: var(--t-meta)/1.3 var(--font-ui);
    color: var(--nil-ink-3);
    transition: color var(--dur-flip) var(--ease-out);
  }
  .row:hover .desc { color: var(--nil-ink-2); }
  @media (prefers-reduced-motion: reduce) {
    .actions .row:hover:not(:active), .row:hover .glyph { transform: none; }
  }
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
    align-items: center;
    justify-content: space-between;
    gap: var(--s-3);
    width: 100%;
    min-height: var(--row-h);
    padding: 0 var(--s-2);
    border: 0;
    background: transparent;
    cursor: pointer;
    border-radius: var(--r-field);
    text-align: left;
    line-height: var(--lh-tight);
  }
  .s-name {
    flex: 1 1 auto;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font: 500 var(--t-meta)/var(--lh-tight) var(--font-machine);
    color: var(--nil-ink-2);
  }
  .s-meta {
    flex: 0 0 auto;
    white-space: nowrap;
    font: var(--t-micro)/var(--lh-tight) var(--font-ui);
    color: var(--nil-ink-3);
  }
</style>
