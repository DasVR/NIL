import { describe, expect, it } from 'vitest';
import { playDictation, sharedPrefix, type DictationOpts } from './dictation';

// The retraction engine: between two transcripts it backspaces to their common
// prefix, then types forward. No timers matter for correctness, so every test
// runs with 0 ms delays and an explicit `reduced: false` (there is no
// matchMedia in node).
const FAST: DictationOpts = { typeMs: 0, deleteMs: 0, reduced: false };

async function record(from: string, to: string, opts: DictationOpts = FAST): Promise<string[]> {
  const frames: string[] = [];
  await playDictation(from, to, (s) => frames.push(s), opts);
  return frames;
}

describe('sharedPrefix', () => {
  it('counts the common leading characters', () => {
    expect(sharedPrefix('hello world', 'hello there')).toBe(6);
    expect(sharedPrefix('abc', 'abc')).toBe(3);
    expect(sharedPrefix('abc', 'abd')).toBe(2);
  });

  it('is zero when the strings diverge immediately or one is empty', () => {
    expect(sharedPrefix('abc', 'xyz')).toBe(0);
    expect(sharedPrefix('', 'abc')).toBe(0);
    expect(sharedPrefix('abc', '')).toBe(0);
  });

  it('never exceeds the shorter string', () => {
    expect(sharedPrefix('abc', 'abcdef')).toBe(3);
    expect(sharedPrefix('abcdef', 'abc')).toBe(3);
  });
});

describe('playDictation', () => {
  it('backspaces to the shared prefix, then types the rest forward', async () => {
    const frames = await record('hello world', 'hello there');
    expect(frames).toEqual([
      'hello worl',
      'hello wor',
      'hello wo',
      'hello w',
      'hello ',
      'hello t',
      'hello th',
      'hello the',
      'hello ther',
      'hello there',
    ]);
  });

  it('only types when the target extends the current text', async () => {
    const frames = await record('run nmap', 'run nmap on the host');
    expect(frames[0]).toBe('run nmap ');
    expect(frames.at(-1)).toBe('run nmap on the host');
    // Every frame is one character longer than the last — no deletes.
    for (let i = 1; i < frames.length; i++) {
      expect(frames[i].length).toBe(frames[i - 1].length + 1);
      expect(frames[i].startsWith(frames[i - 1])).toBe(true);
    }
  });

  it('only deletes when the target is a prefix of the current text', async () => {
    const frames = await record('scan the whole subnet', 'scan the');
    expect(frames.at(-1)).toBe('scan the');
    for (let i = 1; i < frames.length; i++) {
      expect(frames[i].length).toBe(frames[i - 1].length - 1);
    }
  });

  it('erases everything before retyping when nothing is shared', async () => {
    const frames = await record('abc', 'xyz');
    expect(frames).toEqual(['ab', 'a', '', 'x', 'xy', 'xyz']);
  });

  it('writes nothing when from and to are identical', async () => {
    expect(await record('same', 'same')).toEqual([]);
  });

  it('always lands exactly on the target', async () => {
    const pairs: Array<[string, string]> = [
      ['', 'hello'],
      ['hello', ''],
      ['the quick brown fox', 'the quick red fox'],
      ['oh wait never mind', 'oh, actually do it'],
    ];
    for (const [from, to] of pairs) {
      const frames = await record(from, to);
      expect(frames.at(-1) ?? from).toBe(to);
    }
  });

  it('jumps straight to the target under reduced motion', async () => {
    const frames = await record('hello world', 'hello there', { ...FAST, reduced: true });
    expect(frames).toEqual(['hello there']);
  });

  it('stops immediately when the signal is already aborted', async () => {
    const ctrl = new AbortController();
    ctrl.abort();
    const frames = await record('hello', 'help', { ...FAST, signal: ctrl.signal });
    expect(frames).toEqual([]);
  });

  it('stops mid-stream when aborted from a write callback', async () => {
    const ctrl = new AbortController();
    const frames: string[] = [];
    await playDictation('hello world', 'hello there', (s) => {
      frames.push(s);
      if (frames.length === 3) ctrl.abort();
    }, { ...FAST, signal: ctrl.signal });
    expect(frames).toEqual(['hello worl', 'hello wor', 'hello wo']);
  });
});
