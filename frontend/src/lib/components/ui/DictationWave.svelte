<script lang="ts">
  import { workspace } from '$lib/stores/workspace.svelte.ts';

  interface Props {
    active?: boolean;
  }

  let { active = false }: Props = $props();
  const bars = [4, 10, 16, 10, 6, 14, 8, 18, 7, 12];
</script>

<div class="wave" class:live={active && workspace.dictationActive} aria-hidden="true">
  {#each bars as h, i}
    <i style:--h={`${h}px`} style:--d={`${i * 40}ms`}></i>
  {/each}
</div>

<style>
  .wave {
    display: inline-flex;
    align-items: flex-end;
    gap: 2px;
    height: 18px;
  }
  i {
    display: block;
    width: 2px;
    height: 4px;
    background: var(--nil-ink-3);
    border-radius: 1px;
  }
  .live i {
    height: var(--h);
    background: var(--nil-ink);
    animation: nil-wave 900ms var(--ease-mono) infinite;
    animation-delay: var(--d);
  }
  .wave:not(.live) i { height: 4px; }
  @keyframes nil-wave {
    0%, 100% { transform: scaleY(0.35); }
    50% { transform: scaleY(1); }
  }
  @media (prefers-reduced-motion: reduce) {
    .live i { animation: none; }
  }
</style>
