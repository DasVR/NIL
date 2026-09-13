<script lang="ts">
  import NilIcon from '$lib/ui/NilIcon.svelte';

  interface Props {
    value: string;
    label?: string;
  }

  let { value, label = 'Copied' }: Props = $props();
  let confirmed = $state(false);
  let timer: ReturnType<typeof setTimeout> | null = null;

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      return;
    }
    confirmed = true;
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      confirmed = false;
      timer = null;
    }, 1200);
  }
</script>

<button
  class="nil-morph nil-halo copy"
  type="button"
  data-confirmed={confirmed ? 'true' : undefined}
  aria-label={confirmed ? label : `Copy ${value}`}
  onclick={copy}
>
  <NilIcon name={confirmed ? 'check' : 'copy'} size={16} />
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
  }
  .copy:hover { color: var(--nil-ink); transform: scale(1.08); }
  .copy :global(svg) { display: block; }
</style>
