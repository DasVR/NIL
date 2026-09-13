/** DROPLET — water-fill row hover. See motion.css primitive 12. */

function farthestDiameter(x: number, y: number, width: number, height: number): number {
  const corners: Array<[number, number]> = [
    [0, 0],
    [width, 0],
    [0, height],
    [width, height],
  ];
  let max = 0;
  for (const [cx, cy] of corners) {
    max = Math.max(max, Math.hypot(x - cx, y - cy));
  }
  return max * 2;
}

function localPoint(node: HTMLElement, e: PointerEvent): { x: number; y: number; w: number; h: number } {
  const r = node.getBoundingClientRect();
  return {
    x: e.clientX - r.left,
    y: e.clientY - r.top,
    w: r.width,
    h: r.height,
  };
}

export function droplet(node: HTMLElement) {
  node.classList.add('nil-row-host');
  const fill = document.createElement('span');
  fill.className = 'nil-droplet';
  fill.setAttribute('aria-hidden', 'true');
  node.insertBefore(fill, node.firstChild);

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  function place(e: PointerEvent) {
    const { x, y, w, h } = localPoint(node, e);
    const d = Math.max(8, farthestDiameter(x, y, w, h));
    fill.style.width = `${d}px`;
    fill.style.height = `${d}px`;
    fill.style.left = `${x - d / 2}px`;
    fill.style.top = `${y - d / 2}px`;
  }

  const onEnter = (e: PointerEvent) => {
    place(e);
    fill.style.transform = 'scale(1)';
    if (reduced) fill.style.transitionDuration = '0.01ms';
  };

  const onLeave = (e: PointerEvent) => {
    place(e);
    fill.style.transform = 'scale(0)';
  };

  node.addEventListener('pointerenter', onEnter);
  node.addEventListener('pointerleave', onLeave);

  return () => {
    node.removeEventListener('pointerenter', onEnter);
    node.removeEventListener('pointerleave', onLeave);
    fill.remove();
    node.classList.remove('nil-row-host');
  };
}
