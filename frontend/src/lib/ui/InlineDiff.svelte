<script lang="ts">
  interface Hunk {
    type: 'add' | 'del' | 'ctx';
    text: string;
  }

  interface Props {
    diff: string;
    variant?: 'card' | 'page';
    /** Light up the single most-significant changed line (see focusIndex). */
    focused?: boolean;
  }

  let { diff, variant = 'card', focused = false }: Props = $props();

  const hunks = $derived(parseDiff(diff));

  // Unified diffs carry no "this is the line that matters" signal beyond the
  // hunk itself, so match the wireframe's heuristic: the first added line is
  // the change; if the hunk only deletes, the first deleted line is.
  const focusIndex = $derived.by(() => {
    const add = hunks.findIndex((h) => h.type === 'add');
    if (add !== -1) return add;
    return hunks.findIndex((h) => h.type === 'del');
  });

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

<pre class="diff" class:page={variant === 'page'} aria-label="File diff"><code>
{#each hunks as h, i}
<span class={h.type} class:focus={focused && i === focusIndex}><span class="gutter" aria-hidden="true">{h.type === 'add' ? '+' : h.type === 'del' ? '-' : ' '}</span>{h.text}</span>
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
  .diff.page { max-block-size: none; flex: 1; }
  .gutter {
    display: inline-block;
    inline-size: 1.5ch;
    color: var(--nil-ink-4);
    user-select: none;
  }
  .add {
    display: block;
    color: var(--nil-ink);
    background: color-mix(in oklab, var(--nil-ink) 8%, transparent);
  }
  .add .gutter { color: var(--nil-ink-2); }
  .del {
    display: block;
    color: var(--nil-ink-3);
    text-decoration: line-through;
  }
  .ctx { display: block; }

  /* Focus tint rides on an opacity-only overlay so the reveal stays on the
     compositor (Law 3) instead of transitioning background-color. Ink, not
     ember — diffs are Zone C machine output, not a Zone A identity moment. */
  .add, .del { position: relative; }
  .add::after, .del::after {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: color-mix(in oklab, var(--nil-ink) 12%, transparent);
    opacity: 0;
    transition: opacity var(--dur-flip) var(--ease-out);
  }
  .focus::after { opacity: 1; }
  .del.focus { color: var(--nil-ink-2); }
</style>
