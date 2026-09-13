/** Streaming ash text — one letter at a time, a small burst of ember particles. */

const BURST = 7;

export function commonPrefix(a: string, b: string): number {
  const n = Math.min(a.length, b.length);
  let i = 0;
  while (i < n && a[i] === b[i]) i += 1;
  return i;
}

export type AshHandle = {
  play: (text: string) => Promise<void>;
  sync: (text: string) => Promise<void>;
  stop: () => void;
};

export function attachAsh(host: HTMLElement): AshHandle {
  let cancelled = false;
  let frame = 0;
  let shown = '';
  let queue: Promise<void> = Promise.resolve();

  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

  function ember(): string {
    return getComputedStyle(document.documentElement).getPropertyValue('--brand-ember-300').trim()
      || getComputedStyle(document.documentElement).getPropertyValue('--nil-ink').trim();
  }

  function appendLetter(ch: string, animate: boolean, color: string): Promise<void> {
    const span = document.createElement('span');
    span.className = 'nil-ash-letter';
    span.textContent = ch === ' ' ? '\u00a0' : ch;
    host.appendChild(span);
    shown += ch;
    if (!animate) {
      span.style.opacity = '1';
      return Promise.resolve();
    }
    span.style.opacity = '0';
    return burst(span, color).then(() => {
      if (cancelled) return;
      span.style.opacity = '1';
      span.style.color = '';
    });
  }

  async function reveal(text: string, animate: boolean): Promise<void> {
    cancelled = false;
    const cut = commonPrefix(shown, text);
    if (cut < shown.length) {
      while (host.childNodes.length > cut) {
        host.removeChild(host.lastChild as ChildNode);
      }
      shown = shown.slice(0, cut);
    }
    const remaining = text.length - shown.length;
    if (reduced() || !animate) {
      host.textContent = text;
      shown = text;
      return;
    }
    if (remaining > 32) {
      const cut = text.length - 24;
      host.textContent = text.slice(0, cut);
      shown = text.slice(0, cut);
    }
    const color = ember();
    for (let i = shown.length; i < text.length; i++) {
      if (cancelled) return;
      await appendLetter(text[i], true, color);
    }
  }

  async function play(text: string): Promise<void> {
    host.replaceChildren();
    shown = '';
    await reveal(text, true);
  }

  function sync(text: string): Promise<void> {
    queue = queue.then(() => reveal(text, true));
    return queue;
  }

  function burst(letter: HTMLElement, color: string): Promise<void> {
    return new Promise((resolve) => {
      const bits: HTMLElement[] = [];
      for (let i = 0; i < BURST; i++) {
        const p = document.createElement('i');
        p.className = 'nil-ash-bit';
        p.style.background = color;
        const ang = (Math.PI * 2 * i) / BURST + Math.random() * 0.4;
        const dist = 8 + Math.random() * 10;
        p.style.setProperty('--dx', `${Math.cos(ang) * dist}px`);
        p.style.setProperty('--dy', `${Math.sin(ang) * dist}px`);
        letter.appendChild(p);
        bits.push(p);
      }
      letter.style.color = color;
      const t0 = performance.now();
      const D = 90;
      const tick = (now: number) => {
        if (cancelled) {
          bits.forEach((b) => b.remove());
          resolve();
          return;
        }
        const t = Math.min(1, (now - t0) / D);
        const u = 1 - t;
        for (const b of bits) {
          const dx = parseFloat(b.style.getPropertyValue('--dx'));
          const dy = parseFloat(b.style.getPropertyValue('--dy'));
          b.style.transform = `translate(${dx * u}px, ${dy * u}px) scale(${0.4 + t * 0.6})`;
          b.style.opacity = String(1 - t);
        }
        if (t < 1) frame = requestAnimationFrame(tick);
        else {
          bits.forEach((b) => b.remove());
          resolve();
        }
      };
      frame = requestAnimationFrame(tick);
    });
  }

  function stop() {
    cancelled = true;
    cancelAnimationFrame(frame);
  }

  return { play, sync, stop };
}
