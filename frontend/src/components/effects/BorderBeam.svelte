<script lang="ts">
  let { className = '', color = '#00d992', duration = 6 }: {
    className?: string;
    color?: string;
    duration?: number;
  } = $props();
</script>

<div class="border-beam {className}" style="--beam-color: {color}; --beam-duration: {duration}s">
  <div class="beam-spin"></div>
</div>

<style>
  .border-beam {
    position: absolute;
    inset: 0;
    border-radius: inherit;
    overflow: hidden;
    pointer-events: none;
  }

  .beam-spin {
    position: absolute;
    inset: -100%;
    background: conic-gradient(
      from 0deg,
      transparent 0deg,
      var(--beam-color) 60deg,
      transparent 120deg,
      transparent 180deg,
      var(--beam-color) 240deg,
      transparent 300deg,
      transparent 360deg
    );
    animation: border-beam-spin var(--beam-duration) linear infinite;
  }

  @keyframes border-beam-spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
</style>
