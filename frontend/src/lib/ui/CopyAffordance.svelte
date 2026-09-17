<script lang="ts">
  import NilIcon from '$lib/ui/NilIcon.svelte';

  interface Props {
    value: string;
    label?: string;
  }

  let { value, label = 'Copied' }: Props = $props();
  let confirmed = $state(false);
  // CHECK-DRAW (motion.css #21) needs a painted "before" frame at
  // stroke-dashoffset 1 to transition from, so the mark mounts undrawn and
  // flips one frame later — same trick as ToolBlock's ok glyph.
  let drawn = $state(false);
  let timer: ReturnType<typeof setTimeout> | null = null;
  let raf = 0;

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      return;
    }
    confirmed = true;
    drawn = false;
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => { drawn = true; });
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      confirmed = false;
      drawn = false;
      timer = null;
    }, 1200);
  }
</script>

<!-- MORPH (#14): the control pops on --ease-pop, the copy glyph gives way to
     a checkmark that draws itself in, and the label unrolls beside it. All
     three revert together; nothing else on screen has to confirm the copy. -->
<button
  class="nil-morph nil-halo nil-quiet copy"
  type="button"
  data-confirmed={confirmed ? 'true' : undefined}
  aria-label={confirmed ? label : `Copy ${value}`}
  onclick={copy}
>
  {#if confirmed}
    <svg class="nil-check-draw mark" data-drawn={drawn} width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <polyline points="4,13 9,18 20,6" pathLength="1" />
    </svg>
  {:else}
    <NilIcon name="copy" size={16} />
  {/if}
  <span class="nil-morph-label">{label}</span>
</button>

<style>
  .copy {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    height: 22px;
    padding: 0 4px;
    border: 0;
    background: transparent;
    color: var(--nil-ink-3);
    cursor: pointer;
    transition: color var(--dur-flip) var(--ease-out);
  }
  .copy:hover { color: var(--nil-ink); }
  .copy :global(svg) { display: block; }
  /* Match the lucide copy glyph's weight so the swap doesn't read as a
     different icon set. */
  .mark polyline { stroke-width: 2; }
</style>
