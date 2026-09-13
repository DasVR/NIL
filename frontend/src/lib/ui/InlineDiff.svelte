<script lang="ts">
  interface Hunk {
    type: 'add' | 'del' | 'ctx';
    text: string;
  }

  interface Props {
    diff: string;
  }

  let { diff }: Props = $props();

  const hunks = $derived(parseDiff(diff));

  function parseDiff(raw: string): Hunk[] {
    const lines = raw.replace(/\r\n/g, '\n').split('\n');
    const out: Hunk[] = [];
    for (const line of lines) {
      if (line.startsWith('+++') || line.startsWith('---') || line.startsWith('diff ') || line.startsWith('index ')) {
        out.push({ type: 'ctx', text: line });
        continue;
      }
      if (line.startsWith('+')) out.push({ type: 'add', text: line.slice(1) });
      else if (line.startsWith('-')) out.push({ type: 'del', text: line.slice(1) });
      else out.push({ type: 'ctx', text: line.startsWith(' ') ? line.slice(1) : line });
    }
    return out;
  }
</script>

<pre class="diff" aria-label="File diff"><code>
{#each hunks as h}
<span class={h.type}>{h.text}</span>
{/each}
</code></pre>

<style>
  .diff {
    margin: 0;
    max-block-size: 240px;
    overflow: auto;
    padding: var(--s-2);
    background: var(--nil-void);
    border: 1px solid var(--nil-line);
    border-radius: var(--r-field);
    font: var(--t-meta)/var(--lh-body) var(--font-machine);
    color: var(--nil-ink-2);
  }
  .add {
    display: block;
    color: var(--brand-ember-300);
    background: color-mix(in oklab, var(--brand-ember-500) 12%, transparent);
  }
  .del {
    display: block;
    color: var(--nil-ink-3);
    text-decoration: line-through;
  }
  .ctx { display: block; }
</style>
