<script lang="ts">
  export type DataRow = {
    id: string;
    title: string;
    meta?: string;
    accent?: string;
    selected?: boolean;
    monoTitle?: boolean;
  };

  let {
    rows,
    empty,
    label,
    onSelect
  }: {
    rows: DataRow[];
    empty: string;
    label: string;
    onSelect?: (id: string) => void;
  } = $props();
</script>

<div class="list" role="listbox" aria-label={label}>
  {#if rows.length === 0}
    <p class="empty">{empty}</p>
  {:else}
    {#each rows as row (row.id)}
      <button
        type="button"
        class="row"
        class:on={row.selected}
        role="option"
        aria-selected={row.selected}
        onclick={() => onSelect?.(row.id)}
      >
        {#if row.accent}
          <span class="bar" style="background:{row.accent}"></span>
        {/if}
        <span class="title" class:mono={row.monoTitle}>{row.title}</span>
        {#if row.meta}<span class="meta mono">{row.meta}</span>{/if}
      </button>
    {/each}
  {/if}
</div>

<style>
  .list {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }
  .empty {
    font-size: 12px;
    color: var(--text-faint);
    padding: 12px 8px;
    margin: 0;
    line-height: 1.4;
  }
  .row {
    display: flex;
    align-items: center;
    gap: 8px;
    height: var(--row-h);
    min-height: unset;
    padding: 0 8px;
    border: 0;
    border-radius: 5px;
    background: transparent;
    color: var(--text-dim);
    text-align: left;
    width: 100%;
    font-size: 12px;
  }
  .row:hover { background: rgba(255, 255, 255, 0.04); color: var(--text); }
  .row.on {
    background: rgba(255, 255, 255, 0.05);
    color: var(--text);
    box-shadow: inset 2px 0 0 var(--green);
  }
  .bar {
    width: 3px;
    height: 14px;
    border-radius: 2px;
    flex-shrink: 0;
  }
  .title {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .meta {
    font-size: 10px;
    color: var(--text-faint);
    flex-shrink: 0;
  }
</style>
