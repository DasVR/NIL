<script lang="ts">
  import Icon from '@iconify/svelte';

  /**
   * Lucide-only icon wrapper. NIL does not mix icon families.
   * Default 16px. Rail icons (the control itself) may pass 20.
   */
  interface Props {
    name: string;
    size?: 16 | 20;
    class?: string;
  }

  let { name, size = 16, class: className }: Props = $props();
</script>

<Icon icon={`lucide:${name}`} width={size} height={size} class={className} />
