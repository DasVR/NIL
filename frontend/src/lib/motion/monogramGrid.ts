/**
 * NIL identity monogram — the pixel grid itself.
 *
 * Ported from the reference wireframe (docs/wireframe.html, "monogram v4"):
 * an "N" (two bars + a diagonal) flanked by nested signal-wave brackets,
 * computed once on the left and mirrored onto the right so the two sides
 * can never drift out of sync or leave a one-sided gap. Pure data — no
 * canvas, no DOM — so callers can render it as SVG rects (crisp at any
 * DPI, animatable via CSS) or rasterize it onto a 2D canvas (the cold-open
 * WebGL mark texture) from the same source of truth.
 */

export const MONOGRAM_GRID = 22;

export interface MonogramCell {
  x: number;
  y: number;
}

export function monogramCells(grid: number = MONOGRAM_GRID): MonogramCell[] {
  const on: boolean[][] = Array.from({ length: grid }, () => new Array<boolean>(grid).fill(false));
  const mark = (col: number, row: number) => {
    if (col >= 0 && col < grid && row >= 0 && row < grid) on[row][col] = true;
  };

  const top = 4;
  const bottom = 17;
  const leftCol = 7;
  const rightCol = 13;

  for (let r = top; r <= bottom; r++) {
    mark(leftCol, r);
    mark(leftCol + 1, r);
    mark(rightCol, r);
    mark(rightCol + 1, r);
  }
  for (let r = top; r <= bottom; r++) {
    const t = (r - top) / (bottom - top);
    const dx = Math.round(leftCol + 1 + t * (rightCol - (leftCol + 1)));
    mark(dx, r);
    mark(dx + 1, r);
  }

  const cy = (top + bottom) / 2;
  for (const rad of [6, 11]) {
    for (let y = 0; y < grid; y++) {
      for (let x = 0; x < grid; x++) {
        const dxL = x - -2.5;
        const dyL = y - cy;
        const distL = Math.hypot(dxL, dyL);
        const angL = Math.atan2(dyL, dxL);
        if (Math.abs(distL - rad) < 0.8 && Math.abs(angL) < 0.85) {
          mark(x, y);
          mark(grid - 1 - x, y);
        }
      }
    }
  }

  const cells: MonogramCell[] = [];
  for (let y = 0; y < grid; y++) {
    for (let x = 0; x < grid; x++) {
      if (on[y][x]) cells.push({ x, y });
    }
  }
  return cells;
}

/** Rasterize the grid onto a 2D canvas context — used by the cold-open mark texture. */
export function paintMonogram(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  color: string,
  grid: number = MONOGRAM_GRID,
  /** Fraction of the smaller canvas dimension the mark's full grid should span. */
  fraction: number = 0.72,
) {
  ctx.clearRect(0, 0, w, h);
  // The cold-open canvas is sized in physical pixels. Keep every cell and the
  // grid origin on that pixel lattice so adjacent fills share an exact edge;
  // fractional rounded cells leave transparent seams in the uploaded texture.
  const cell = Math.max(1, Math.floor((Math.min(w, h) * fraction) / grid));
  const originX = Math.floor((w - cell * grid) / 2);
  const originY = Math.floor((h - cell * grid) / 2);
  ctx.fillStyle = color;
  for (const { x, y } of monogramCells(grid)) {
    const px = originX + x * cell;
    const py = originY + y * cell;
    ctx.fillRect(px, py, cell, cell);
  }
}
