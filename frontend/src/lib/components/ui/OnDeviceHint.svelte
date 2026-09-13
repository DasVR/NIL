<script lang="ts">
  import NilIcon from '$lib/ui/NilIcon.svelte';
  import DictationWave from '$lib/components/ui/DictationWave.svelte';

  interface Props {
    active?: boolean;
    available?: boolean;
    level?: number;
  }

  let { active = false, available = true, level = 0 }: Props = $props();
</script>

<p class="hint">
  <NilIcon name="lock" size={16} />
  <span>
    {#if available}
      Dictation runs on-device. Audio never leaves this machine.
    {:else}
      Voice capture is not available here. Type in the composer.
    {/if}
  </span>
  {#if available}
    <DictationWave {active} {level} />
  {/if}
</p>

<style>
  .hint {
    display: flex;
    align-items: center;
    gap: var(--s-2);
    margin: 0;
    font: var(--t-micro)/1.4 var(--font-ui);
    color: var(--nil-ink-3);
  }
</style>
