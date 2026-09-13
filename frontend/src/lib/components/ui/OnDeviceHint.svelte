<script lang="ts">
  import NilIcon from '$lib/ui/NilIcon.svelte';
  import DictationWave from '$lib/components/ui/DictationWave.svelte';

  interface Props {
    active?: boolean;
  }

  let { active = false }: Props = $props();
</script>

<p class="hint">
  <NilIcon name="lock" size={16} />
  <span>Dictation runs on-device. Audio never leaves this machine.</span>
  <DictationWave {active} />
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
