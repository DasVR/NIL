<script lang="ts">
  type IconName = 'term' | 'artifact' | 'split' | 'finn';

  let { name, on = false }: { name: IconName; on?: boolean } = $props();

  function iconKind(value: IconName): IconName {
    switch (value) {
      case 'term':
      case 'artifact':
      case 'split':
      case 'finn':
        return value;
      default: {
        const _never: never = value;
        return _never;
      }
    }
  }

  const kind = $derived(iconKind(name));
</script>

<span class="morph" class:on aria-hidden="true">
  {#if kind === 'term'}
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path class="a" d="m6 8 4 4-4 4" />
      <path class="b" d="M13 16h6" />
    </svg>
  {:else if kind === 'artifact'}
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path class="a" d="M7 3h8l4 4v14H7z" />
      <path class="b" d="M14 3v5h5" />
    </svg>
  {:else if kind === 'split'}
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect class="a" x="4" y="5" width="16" height="14" rx="1.5" />
      <path class="b" d="M12 5v14" />
    </svg>
  {:else}
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle class="a" cx="12" cy="12" r="3" />
      <path class="b" d="M12 5v2M12 17v2M5 12h2M17 12h2" />
    </svg>
  {/if}
</span>

<style>
  .morph {
    width: 14px;
    height: 14px;
    display: grid;
    place-items: center;
    flex-shrink: 0;
    color: inherit;
  }
  svg {
    width: 14px;
    height: 14px;
    overflow: visible;
  }
  .a, .b {
    transform-origin: 12px 12px;
    transition: transform 280ms var(--spring-bouncy), opacity 180ms var(--spring-smooth);
  }
  .morph:not(.on) .a { transform: scale(0.86) rotate(-8deg); opacity: 0.55; }
  .morph:not(.on) .b { transform: scale(0.86) rotate(8deg); opacity: 0.45; }
  .morph.on .a, .morph.on .b { transform: none; opacity: 1; }

  @media (prefers-reduced-motion: reduce) {
    .a, .b { transition: none; }
  }
  :global(html.reduce-motion) .a,
  :global(html.reduce-motion) .b {
    transition: none;
  }
</style>
