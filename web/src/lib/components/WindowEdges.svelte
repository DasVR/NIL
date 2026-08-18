<script lang="ts">
  import { isTauriRuntime, startWindowResize, type ResizeEdge } from '$lib/tauri';

  const edges: { edge: ResizeEdge; className: string }[] = [
    { edge: 'North', className: 'n' },
    { edge: 'South', className: 's' },
    { edge: 'East', className: 'e' },
    { edge: 'West', className: 'w' },
    { edge: 'NorthEast', className: 'ne' },
    { edge: 'NorthWest', className: 'nw' },
    { edge: 'SouthEast', className: 'se' },
    { edge: 'SouthWest', className: 'sw' }
  ];

  function down(edge: ResizeEdge) {
    return (ev: MouseEvent) => {
      if (ev.button !== 0) return;
      ev.preventDefault();
      ev.stopPropagation();
      void startWindowResize(edge);
    };
  }
</script>

{#if isTauriRuntime()}
  <div class="edges" aria-hidden="true">
    {#each edges as item}
      <div
        class="edge {item.className}"
        role="presentation"
        onmousedown={down(item.edge)}
      ></div>
    {/each}
  </div>
{/if}

<style>
  .edges { pointer-events: none; }
  .edge {
    position: fixed;
    z-index: 200;
    pointer-events: auto;
  }
  .n, .s { left: 8px; right: 8px; height: 6px; }
  .e, .w { top: 8px; bottom: 8px; width: 6px; }
  .n { top: 0; cursor: ns-resize; }
  .s { bottom: 0; cursor: ns-resize; }
  .e { right: 0; cursor: ew-resize; }
  .w { left: 0; cursor: ew-resize; }
  .ne, .nw, .se, .sw { width: 10px; height: 10px; }
  .ne { top: 0; right: 0; cursor: nesw-resize; }
  .nw { top: 0; left: 0; cursor: nwse-resize; }
  .se { bottom: 0; right: 0; cursor: nwse-resize; }
  .sw { bottom: 0; left: 0; cursor: nesw-resize; }
</style>
