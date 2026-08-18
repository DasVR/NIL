/** Weighted subsequence fuzzy match. Higher is better. -1 means no match. */
export function fuzzyScore(query: string, text: string): number {
  const q = query.trim().toLowerCase();
  if (!q) return 0;
  const t = text.toLowerCase();
  if (t === q) return 10_000;
  const idx = t.indexOf(q);
  if (idx === 0) return 5_000 - Math.min(t.length, 200);
  if (idx > 0) return 2_000 - idx;

  let ti = 0;
  let score = 0;
  let consecutive = 0;
  for (let qi = 0; qi < q.length; qi += 1) {
    const ch = q[qi];
    const found = t.indexOf(ch, ti);
    if (found === -1) return -1;
    if (found === ti) {
      consecutive += 1;
      score += 12 * consecutive;
    } else {
      consecutive = 0;
      score += 2;
    }
    if (found === 0 || /[\s./:_-]/.test(t[found - 1] || '')) score += 18;
    ti = found + 1;
  }
  return score - Math.min(t.length, 80);
}

export function fuzzyFilter<T>(
  items: T[],
  query: string,
  text: (item: T) => string
): T[] {
  if (!query.trim()) return items;
  return items
    .map((item) => ({ item, score: fuzzyScore(query, text(item)) }))
    .filter((row) => row.score >= 0)
    .sort((a, b) => b.score - a.score)
    .map((row) => row.item);
}

export function highlightMatch(text: string, query: string): { ch: string; hit: boolean }[] {
  const q = query.trim().toLowerCase();
  const chars = [...text];
  if (!q) return chars.map((ch) => ({ ch, hit: false }));
  const lower = text.toLowerCase();
  const hits = new Set<number>();
  let ti = 0;
  for (const ch of q) {
    const found = lower.indexOf(ch, ti);
    if (found === -1) break;
    hits.add(found);
    ti = found + 1;
  }
  return chars.map((ch, i) => ({ ch, hit: hits.has(i) }));
}
