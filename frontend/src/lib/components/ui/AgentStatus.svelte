<script lang="ts">
  import NilIcon from '$lib/ui/NilIcon.svelte';

  interface Props {
    summary: string;
    duration: string;
    tokens: number;
    hint?: string;
    open?: boolean;
    items?: string[];
  }

  let { summary, duration, tokens, hint = '', open = $bindable(false), items = [] }: Props = $props();
</script>

<div class="status">
  <button class="line nil-halo" type="button" aria-expanded={open} onclick={() => (open = !open)}>
    <span class="sum">{summary}</span>
    <span class="chev" class:open><NilIcon name="chevron-right" size={16} /></span>
  </button>
  <p class="meta">{duration} · {tokens} tokens{#if hint} · {hint}{/if}</p>
  {#if open && items.length}
    <ul class="items">
      {#each items as item, i (`${i}:${item}`)}
        <li>{item}</li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .status { display: flex; flex-direction: column; gap: 4px; padding: var(--s-2) 0; }
  .line {
    display: flex;
    align-items: center;
    gap: var(--s-2);
    width: 100%;
    border: 0;
    background: transparent;
    color: var(--nil-ink);
    font: 500 var(--t-body)/1.3 var(--font-ui);
    cursor: pointer;
    text-align: left;
    padding: 0;
  }
  .sum { flex: 1; }
  .chev { color: var(--nil-ink-3); display: grid; place-items: center; transition: transform var(--dur-flip) var(--ease-out); }
  .chev.open { transform: rotate(90deg); }
  .meta { margin: 0; font: var(--t-micro)/1.4 var(--font-machine); color: var(--nil-ink-3); }
  .items {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .items li {
    font: var(--t-micro)/1.4 var(--font-machine);
    color: var(--nil-ink-3);
  }
</style>
