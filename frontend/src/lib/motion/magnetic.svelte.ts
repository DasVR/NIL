type Opts = { radius?: number; pull?: number };

export function magnetic(node: HTMLElement, opts: Opts = {}) {
  const { radius = 90, pull = 0.28 } = opts;
  if (typeof matchMedia === 'undefined') return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let frame = 0;

  const reset = () => {
    node.dataset.engaged = 'false';
    node.style.setProperty('--mx', '0px');
    node.style.setProperty('--my', '0px');
  };

  const onMove = (e: PointerEvent) => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      const r = node.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const dist = Math.hypot(dx, dy);
      if (dist > radius) {
        reset();
        return;
      }
      node.dataset.engaged = 'true';
      node.style.setProperty('--mx', `${dx * pull}px`);
      node.style.setProperty('--my', `${dy * pull}px`);
    });
  };

  window.addEventListener('pointermove', onMove, { passive: true });
  node.addEventListener('pointerleave', reset);

  return () => {
    cancelAnimationFrame(frame);
    window.removeEventListener('pointermove', onMove);
    node.removeEventListener('pointerleave', reset);
  };
}
