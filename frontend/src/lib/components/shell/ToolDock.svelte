<script lang="ts">
  import { fly } from 'svelte/transition';
  import { workspace } from '$lib/stores/workspace.svelte.ts';
  import NilIcon from '$lib/ui/NilIcon.svelte';
  import TerminalTab from '$lib/components/shell/TerminalTab.svelte';

  const job = $derived(workspace.dock);
  const isPty = $derived(job?.kind === 'terminal');
</script>

{#if job}
  <section
    class="dock nil-scan"
    class:pty={isPty}
    data-state={job.status === 'running' ? 'working' : undefined}
    aria-label={job.title}
    transition:fly={{ y: 12, duration: 260 }}
  >
    <header class="head">
      <span class="title">{job.title}</span>
      {#if !isPty}
        <span class="kind">{job.kind}</span>
        <span class="status">{job.status}</span>
      {/if}
      <button class="nil-halo close" type="button" aria-label="Hide tool output" onclick={() => workspace.closeDock()}>
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
  .out {
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
