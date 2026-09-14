import { describe, expect, it } from 'vitest';
import { MONOGRAM_GRID, monogramCells } from './monogramGrid';

// The N in the middle occupies these columns (see monogramGrid.ts). Everything
// outside them is a signal-wave bracket, computed on the left and mirrored with
// mark(grid - 1 - x, y). That mirror call is the fix for a one-sided-gap bug
// that was hit twice; these tests make a third time a red build instead of a
// visual review catch.
const N_LEFT = 7;
const N_RIGHT = 14;

function key(x: number, y: number): string {
  return `${x},${y}`;
}

describe('monogramCells', () => {
  it('produces a non-empty, in-bounds grid at the default size', () => {
    const cells = monogramCells();
    expect(cells.length).toBeGreaterThan(0);
    for (const { x, y } of cells) {
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThan(MONOGRAM_GRID);
      expect(y).toBeGreaterThanOrEqual(0);
      expect(y).toBeLessThan(MONOGRAM_GRID);
    }
  });

  it('has no duplicate cells', () => {
    const cells = monogramCells();
    const seen = new Set(cells.map((c) => key(c.x, c.y)));
    expect(seen.size).toBe(cells.length);
  });

  it('mirrors every bracket cell left <-> right', () => {
    const grid = MONOGRAM_GRID;
    const cells = monogramCells(grid);
    const on = new Set(cells.map((c) => key(c.x, c.y)));
    const brackets = cells.filter((c) => c.x < N_LEFT || c.x > N_RIGHT);
    expect(brackets.length).toBeGreaterThan(0);
    for (const { x, y } of brackets) {
      expect(on.has(key(grid - 1 - x, y))).toBe(true);
    }
  });

  it('draws the same number of bracket cells on each side', () => {
    const cells = monogramCells();
    const left = cells.filter((c) => c.x < N_LEFT).length;
    const right = cells.filter((c) => c.x > N_RIGHT).length;
    expect(left).toBeGreaterThan(0);
    expect(left).toBe(right);
  });

  it('draws both bracket radii on both sides', () => {
    // Two nested waves (rad 6 and 11); each must reach the outermost columns
    // on both edges, otherwise one side lost an arc.
    const cells = monogramCells();
    const leftMin = Math.min(...cells.map((c) => c.x));
    const rightMax = Math.max(...cells.map((c) => c.x));
    expect(leftMin).toBe(MONOGRAM_GRID - 1 - rightMax);
  });

  it('keeps the N itself intact: two full-height bars', () => {
    const cells = monogramCells();
    const on = new Set(cells.map((c) => key(c.x, c.y)));
    for (let r = 4; r <= 17; r++) {
      expect(on.has(key(7, r))).toBe(true);
      expect(on.has(key(8, r))).toBe(true);
      expect(on.has(key(13, r))).toBe(true);
      expect(on.has(key(14, r))).toBe(true);
    }
  });

  it('is deterministic', () => {
    expect(monogramCells()).toEqual(monogramCells());
  });
});
