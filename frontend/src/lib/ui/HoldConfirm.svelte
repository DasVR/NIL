<script lang="ts">
  import { durToken } from '$lib/motion/tokens';

  interface Props {
    label: string;
    confirmLabel?: string;
    ariaLabel?: string;
    onConfirm: () => void;
  }

  let { label, confirmLabel = label, ariaLabel, onConfirm }: Props = $props();
  let filling = $state(false);
  let raf = 0;
  let start = 0;
  let fillEl: HTMLSpanElement | undefined = $state();

  // HOLD (motion.css #13): the fill is a full-width box scaled from its
  // leading edge, so every frame is a compositor transform rather than a
  // relayout of the button.
  function setFill(t: number) {
    if (fillEl) fillEl.style.transform = `scaleX(${t})`;
  }

  function cancel() {
    filling = false;
    cancelAnimationFrame(raf);
    if (fillEl) {
      fillEl.style.transition = 'transform var(--dur-enter) var(--ease-out)';
      setFill(0);
    }
  }

  function tick(now: number) {
    const t = Math.min(1, (now - start) / durToken('--dur-hold', 850));
    setFill(t);
    if (!filling) return;
    if (t >= 1) {
      filling = false;
      onConfirm();
      setFill(0);
      return;
    }
    raf = requestAnimationFrame(tick);
  }

  function down(e: PointerEvent) {
    if (e.button !== 0) return;
    e.preventDefault();
    filling = true;
    start = performance.now();
    if (fillEl) {
      fillEl.style.transition = 'none';
      setFill(0);
    }
    raf = requestAnimationFrame(tick);
  }
</script>

<button
  class="nil-hold nil-lift nil-halo hold"
  type="button"
  aria-label={ariaLabel ?? `Hold to ${label}`}
  onpointerdown={down}
  onpointerup={cancel}
  onpointerleave={cancel}
  onpointercancel={cancel}
>
  <span class="nil-hold-fill" bind:this={fillEl}></span>
  <span class="txt">{filling ? confirmLabel : label}</span>
</button>

<style>
  .hold {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 28px;
    padding: 0 var(--s-3);
    border: 1px solid var(--nil-line);
    border-radius: var(--r-field);
    background: var(--nil-raised);
    color: var(--nil-ink);
    font: 500 var(--t-meta)/1 var(--font-ui);
    cursor: pointer;
    user-select: none;
  }
  .txt { pointer-events: none; }
</style>
