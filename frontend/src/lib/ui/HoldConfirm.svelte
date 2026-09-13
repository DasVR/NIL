<script lang="ts">
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

  function ms(): number {
    const raw = getComputedStyle(document.documentElement).getPropertyValue('--dur-hold').trim();
    const n = parseFloat(raw);
    return Number.isFinite(n) ? n : 850;
  }

  function cancel() {
    filling = false;
    cancelAnimationFrame(raf);
    if (fillEl) {
      fillEl.style.transition = 'width var(--dur-enter) var(--ease-out)';
      fillEl.style.width = '0%';
    }
  }

  function tick(now: number) {
    const t = Math.min(1, (now - start) / ms());
    if (fillEl) fillEl.style.width = `${t * 100}%`;
    if (!filling) return;
    if (t >= 1) {
      filling = false;
      onConfirm();
      if (fillEl) fillEl.style.width = '0%';
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
      fillEl.style.width = '0%';
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
