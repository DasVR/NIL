<script lang="ts">
  import { durToken } from '$lib/motion/tokens';

  interface Props {
    label: string;
    confirmLabel?: string;
    ariaLabel?: string;
    /** Transparent surface with a quiet border, for sitting beside other ghost actions. */
    ghost?: boolean;
    disabled?: boolean;
    onConfirm: () => void;
  }

  let { label, confirmLabel = label, ariaLabel, ghost = false, disabled = false, onConfirm }: Props = $props();
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

  function begin() {
    if (disabled || filling) return;
    filling = true;
    start = performance.now();
    if (fillEl) {
      fillEl.style.transition = 'none';
      setFill(0);
    }
    raf = requestAnimationFrame(tick);
  }

  function down(e: PointerEvent) {
    if (e.button !== 0) return;
    e.preventDefault();
    begin();
  }

  // Keyboard gets the same hold: Space/Enter held fills, releasing early
  // cancels. Repeat keydowns while held are ignored so the fill isn't restarted.
  function keyDown(e: KeyboardEvent) {
    if (e.key !== ' ' && e.key !== 'Enter') return;
    e.preventDefault();
    if (e.repeat) return;
    begin();
  }

  function keyUp(e: KeyboardEvent) {
    if (e.key !== ' ' && e.key !== 'Enter') return;
    e.preventDefault();
    cancel();
  }
</script>

<button
  class="nil-hold nil-lift nil-halo hold"
  class:ghost
  type="button"
  aria-label={ariaLabel ?? `Hold to ${label}`}
  {disabled}
  onpointerdown={down}
  onpointerup={cancel}
  onpointerleave={cancel}
  onpointercancel={cancel}
  onkeydown={keyDown}
  onkeyup={keyUp}
  onblur={cancel}
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
  .hold.ghost {
    background: transparent;
    color: var(--nil-ink-2);
  }
  .hold:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
  .txt { pointer-events: none; }
</style>
