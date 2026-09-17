<script lang="ts">
  import { workspace } from '$lib/stores/workspace.svelte.ts';
  import NilIcon from '$lib/ui/NilIcon.svelte';
  import CopyAffordance from '$lib/ui/CopyAffordance.svelte';
  import InlineDiff from '$lib/ui/InlineDiff.svelte';
  import TerminalTab from '$lib/components/shell/TerminalTab.svelte';
  import { reveal } from '$lib/motion/reveal';

  const job = $derived(workspace.dock);
  const isPty = $derived(job?.kind === 'terminal');
  const isDiff = $derived(Boolean(job?.output && /^(diff --git |@@ |\+\+\+ |--- )/m.test(job.output)));
</script>

{#if job}
  <!-- job.status is hardcoded to 'running' for the whole lifetime of a PTY
       dock (an interactive shell has no "done" signal the way a build/lint/
       test command does), so the SCANLINE working-bar would stay lit the
       entire time a terminal happened to be open — not "busy," just open.
       Excluded here; non-PTY docks keep the accurate treatment.

       The dock is an in-flow region, not a top layer: it unfolds on REVEAL
       (height + opacity) so the stream above shrinks with it, and folds back
       on close instead of leaving a 180px hole in one frame. -->
  <section
    class="dock nil-scan"
    class:pty={isPty}
    data-state={!isPty && job.status === 'running' ? 'working' : undefined}
    aria-label={job.title}
    transition:reveal
  >
    <header class="head">
      <span class="title">{job.title}</span>
      {#if !isPty}
        <span class="kind">{job.kind}</span>
        <span class="status">{job.status}</span>
      {/if}
      {#if job.path}
        <button class="path nil-halo nil-quiet" type="button" onclick={() => workspace.openFile(job.path ?? '')}>{job.path}</button>
      {/if}
      {#if job.output}
        <CopyAffordance value={job.output} />
      {/if}
      <button class="nil-halo nil-quiet close" type="button" aria-label="Hide tool output" onclick={() => workspace.closeDock()}>
        <NilIcon name="chevron-down" size={16} />
      </button>
    </header>
    {#if isPty}
      <div class="pty-host">
        <TerminalTab
          tab={{ id: 'dock-term', type: 'terminal', label: 'Terminal', dirty: false }}
          focusOnMount
        />
      </div>
    {:else if isDiff && job.output}
      <div class="diff"><InlineDiff diff={job.output} /></div>
    {:else}
      <pre class="out"><code>{job.output || 'Waiting for output…'}</code></pre>
    {/if}
  </section>
{/if}

<style>
  .dock {
    flex-shrink: 0;
    max-height: 180px;
    display: flex;
    flex-direction: column;
    background: var(--nil-panel);
    border: 1px solid var(--nil-line);
    border-radius: var(--r-panel);
    box-shadow: var(--lift-1);
    overflow: hidden;
  }
  .dock.pty { max-height: 240px; }
  .head {
    display: flex;
    align-items: center;
    gap: var(--s-2);
    height: 28px;
    padding: 0 var(--s-3);
    border-bottom: 1px solid var(--nil-line);
  }
  .title { font: 500 var(--t-meta)/1 var(--font-ui); color: var(--nil-ink); }
  .kind, .status { font: var(--t-micro)/1 var(--font-machine); color: var(--nil-ink-3); }
  .path {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    border: 0;
    background: transparent;
    color: var(--nil-ink-2);
    font: var(--t-micro)/1 var(--font-machine);
    cursor: pointer;
  }
  .path:hover { color: var(--nil-ink); }
  .close {
    margin-inline-start: auto;
    display: grid;
    place-items: center;
    width: 22px;
    height: 22px;
    border: 0;
    background: transparent;
    color: var(--nil-ink-3);
    cursor: pointer;
  }
  .out, .diff {
    margin: 0;
    flex: 1;
    overflow: auto;
    padding: var(--s-2) var(--s-3);
    font: var(--t-meta)/var(--lh-body) var(--font-machine);
    color: var(--nil-ink-2);
  }
  .pty-host {
    flex: 1;
    min-height: 160px;
    background: var(--nil-void);
  }
</style>
