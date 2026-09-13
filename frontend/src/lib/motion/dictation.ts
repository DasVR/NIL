/** Dictation engine — backspace to common prefix, then type forward. */

export function sharedPrefix(a: string, b: string): number {
  const n = Math.min(a.length, b.length);
  let i = 0;
  while (i < n && a[i] === b[i]) i += 1;
  return i;
}

export type DictationOpts = {
  typeMs?: number;
  deleteMs?: number;
  reduced?: boolean;
};

export async function playDictation(
  from: string,
  to: string,
  write: (next: string) => void,
  opts: DictationOpts = {},
): Promise<void> {
  const typeMs = opts.typeMs ?? 28;
  const deleteMs = opts.deleteMs ?? 18;
  const reduced = opts.reduced ?? matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) {
    write(to);
    return;
  }
  const cut = sharedPrefix(from, to);
  let cur = from;
  while (cur.length > cut) {
    cur = cur.slice(0, -1);
    write(cur);
    await wait(deleteMs);
  }
  while (cur.length < to.length) {
    cur = to.slice(0, cur.length + 1);
    write(cur);
    await wait(typeMs);
  }
}

function wait(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
