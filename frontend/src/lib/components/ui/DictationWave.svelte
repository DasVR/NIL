<script lang="ts">
  interface Props {
    active?: boolean;
    level?: number;
  }

  let { active = false, level = 0 }: Props = $props();
  const bars = [4, 10, 16, 10, 6, 14, 8, 18, 7, 12];
  const hot = $derived(active && level > 0.2);
</script>

<div
  class="nil-wave"
  data-live={active ? 'true' : undefined}
  data-hot={hot ? 'true' : undefined}
  aria-hidden="true"
>
  {#each bars as h, i}
    <i style:--h={`${Math.max(4, Math.round(h * (0.35 + level * 0.65)))}px`} style:--d={`${i * 40}ms`}></i>
  {/each}
</div>
