const GLYPHS = '01·/\\<>[]{}#$%&*+=-_abcdef';

export function scramble(value: () => string) {
  return (node: HTMLElement) => {
    if (typeof matchMedia === 'undefined' || matchMedia('(prefers-reduced-motion: reduce)').matches) {
      $effect(() => { node.textContent = value(); });
      return;
    }

    $effect(() => {
      const target = value();
      const chars = [...target];
      node.dataset.settling = 'true';
      node.setAttribute('aria-label', target);
      node.style.minInlineSize = `${node.offsetWidth || chars.length}ch`;

      const start = performance.now();
      const DURATION = 520;
      let frame = 0;

      const tick = (now: number) => {
        const t = Math.min((now - start) / DURATION, 1);
        const settled = Math.floor(t * chars.length * 1.35);
        node.textContent = chars
          .map((c, i) => (i < settled || c === ' ' ? c : GLYPHS[(Math.random() * GLYPHS.length) | 0]))
          .join('');
        if (t < 1) frame = requestAnimationFrame(tick);
        else {
          node.textContent = target;
          node.dataset.settling = 'false';
        }
      };
      frame = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(frame);
    });
  };
}
