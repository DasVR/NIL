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
  signal?: AbortSignal;
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
  if (opts.signal?.aborted) return;
  if (reduced) {
    write(to);
    return;
  }
  const cut = sharedPrefix(from, to);
  let cur = from;
  while (cur.length > cut) {
    if (opts.signal?.aborted) return;
    cur = cur.slice(0, -1);
    write(cur);
    await wait(deleteMs);
  }
  while (cur.length < to.length) {
    if (opts.signal?.aborted) return;
    cur = to.slice(0, cur.length + 1);
    write(cur);
    await wait(typeMs);
  }
}

interface SpeechRec extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((ev: SpeechRecEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecEvent {
  resultIndex: number;
  results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }>;
}

type SpeechCtor = new () => SpeechRec;

export function speechAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  const w = window as Window & { SpeechRecognition?: SpeechCtor; webkitSpeechRecognition?: SpeechCtor };
  return Boolean(w.SpeechRecognition || w.webkitSpeechRecognition);
}

/** Live on-device speech. Returns a disposer. No-op when the browser has no recognizer. */
export function listenSpeech(onText: (text: string, isFinal: boolean) => void): () => void {
  const w = window as Window & { SpeechRecognition?: SpeechCtor; webkitSpeechRecognition?: SpeechCtor };
  const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
  if (!Ctor) return () => {};
  const rec = new Ctor();
  rec.continuous = true;
  rec.interimResults = true;
  rec.lang = 'en-US';
  rec.onresult = (ev) => {
    let finalText = '';
    let interim = '';
    for (let i = ev.resultIndex; i < ev.results.length; i += 1) {
      const row = ev.results[i];
      if (!row) continue;
      if (row.isFinal) finalText += row[0].transcript;
      else interim += row[0].transcript;
    }
    const text = (finalText || interim).trim();
    if (text) onText(text, Boolean(finalText) && !interim);
  };
  rec.start();
  return () => {
    rec.onresult = null;
    rec.onend = null;
    rec.onerror = null;
    rec.stop();
  };
}

function wait(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
