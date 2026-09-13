<script lang="ts">
  import NilIcon from '$lib/ui/NilIcon.svelte';

  export interface ClarifyOption {
    id: string;
    label: string;
  }

  interface Props {
    title: string;
    index?: number;
    total?: number;
    options: ClarifyOption[];
    onSelect?: (id: string, other?: string) => void;
    onPrev?: () => void;
    onNext?: () => void;
  }

  let { title, index = 1, total = 1, options, onSelect, onPrev, onNext }: Props = $props();
  let selected = $state(0);
  let otherOpen = $state(false);
  let otherText = $state('');
  let reply = $state('');

  function choose(i: number) {
    selected = i;
    otherOpen = false;
  }

  function submit() {
    if (otherOpen) onSelect?.('other', otherText.trim() || reply.trim());
    else if (reply.trim()) onSelect?.('reply', reply.trim());
    else onSelect?.(options[selected]?.id ?? 'other');
  }

  function onKey(e: KeyboardEvent) {
    if (otherOpen) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selected = Math.min(selected + 1, options.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selected = Math.max(selected - 1, 0);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selected === options.length) otherOpen = true;
      else submit();
    }
  }
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div class="card" role="group" aria-label={title} tabindex="-1" onkeydown={onKey}>
  <header class="head">
    <h2>{title}</h2>
    <div class="pager">
      <button class="icon nil-halo" type="button" aria-label="Previous question" disabled={index <= 1} onclick={onPrev}>
        <NilIcon name="chevron-left" size={16} />
      </button>
      <span class="idx">{index} of {total}</span>
      <button class="icon nil-halo" type="button" aria-label="Next question" disabled={index >= total} onclick={onNext}>
        <NilIcon name="chevron-right" size={16} />
      </button>
    </div>
  </header>

  <ol class="opts">
    {#each options as opt, i (opt.id)}
      <li>
        <button class="opt nil-row-host nil-halo" class:on={selected === i && !otherOpen} type="button" onclick={() => choose(i)}>
          <span class="n">{i + 1}</span>
          <span>{opt.label}</span>
        </button>
      </li>
    {/each}
    <li>
      {#if otherOpen}
        <input class="other" bind:value={otherText} placeholder="Something else" aria-label="Something else" />
      {:else}
        <button class="opt nil-row-host nil-halo" class:on={selected === options.length} type="button" onclick={() => { otherOpen = true; selected = options.length; }}>
          <span class="n">{options.length + 1}</span>
          <span>Something else</span>
        </button>
      {/if}
    </li>
  </ol>

  <textarea class="reply" bind:value={reply} rows="2" placeholder="Reply directly" aria-label="Reply directly"></textarea>
  <button class="nil-lift nil-halo send" type="button" onclick={submit}>Send</button>
  <p class="hint">↑↓ to navigate · ↵ to select</p>
</div>

<style>
  .card {
    display: flex;
    flex-direction: column;
    gap: var(--s-3);
    padding: var(--s-4);
    background: var(--nil-raised);
    border: 1px solid var(--nil-line);
    border-radius: var(--r-card);
    box-shadow: var(--lift-1);
  }
  .head { display: flex; justify-content: space-between; gap: var(--s-3); align-items: flex-start; }
  h2 { margin: 0; font: 500 var(--t-lead)/var(--lh-tight) var(--font-ui); color: var(--nil-ink); }
  .pager { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
  .idx { font: var(--t-micro)/1 var(--font-machine); color: var(--nil-ink-3); }
  .icon {
    display: grid;
    place-items: center;
    width: 22px;
    height: 22px;
    border: 0;
    background: transparent;
    color: var(--nil-ink-2);
    cursor: pointer;
  }
  .icon:disabled { opacity: 0.35; cursor: not-allowed; }
  .opts { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 4px; }
  .opt {
    display: flex;
    align-items: center;
    gap: var(--s-2);
    width: 100%;
    height: 32px;
    padding: 0 var(--s-2);
    border: 1px solid transparent;
    border-radius: var(--r-field);
    background: transparent;
    color: var(--nil-ink);
    font: var(--t-body)/1 var(--font-ui);
    cursor: pointer;
    text-align: left;
  }
  .opt.on { border-color: var(--nil-line-hot); background: var(--nil-panel); }
  .n { width: 1.5ch; font: 500 var(--t-meta)/1 var(--font-machine); color: var(--nil-ink-3); }
  .other, .reply {
    width: 100%;
    border: 1px solid var(--nil-line);
    border-radius: var(--r-field);
    background: var(--nil-void);
    color: var(--nil-ink);
    font: var(--t-body)/1.4 var(--font-ui);
    padding: 8px;
    outline: none;
  }
  .other:focus, .reply:focus { border-color: var(--nil-line-hot); }
  .send {
    align-self: flex-end;
    height: 28px;
    padding: 0 var(--s-3);
    border: 1px solid var(--nil-line);
    border-radius: var(--r-field);
    background: var(--nil-raised);
    color: var(--nil-ink);
    font: 500 var(--t-meta)/1 var(--font-ui);
    cursor: pointer;
  }
  .hint { margin: 0; font: var(--t-micro)/1 var(--font-ui); color: var(--nil-ink-3); }
</style>
