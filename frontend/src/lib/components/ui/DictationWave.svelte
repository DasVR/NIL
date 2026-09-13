<script lang="ts">
  interface Props {
    active?: boolean;
  }

  let { active = false }: Props = $props();
  const bars = [4, 10, 16, 10, 6, 14, 8, 18, 7, 12];
</script>

<div class="nil-wave" data-live={active ? 'true' : undefined} aria-hidden="true">
  {#each bars as h, i}
    <i style:--h={`${h}px`} style:--d={`${i * 40}ms`}></i>
  {/each}
</div>
