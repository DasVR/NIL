<script lang="ts">
  import { attachAsh } from '$lib/motion/ashText.ts';

  interface Props {
    text: string;
  }

  let { text }: Props = $props();
  let host: HTMLElement | undefined = $state();

  $effect(() => {
    if (!host) return;
    const ash = attachAsh(host);
    $effect(() => {
      void ash.sync(text);
    });
    return () => ash.stop();
  });
</script>

<span class="ash" bind:this={host}></span>

<style>
  .ash { font: inherit; color: inherit; }
</style>
