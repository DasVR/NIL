import type { SoundName } from 'cuelume';

type CuelumeModule = typeof import('cuelume');

let engine: CuelumeModule | null = null;
let soundsOn = false;

function reducedMotion(): boolean {
  if (typeof document === 'undefined') return false;
  return document.documentElement.classList.contains('reduce-motion');
}

export function setSoundsEnabled(on: boolean): void {
  soundsOn = on;
  if (typeof window === 'undefined') return;
  if (on && !engine) {
    void import('cuelume').then((mod) => {
      engine = mod;
      engine.setEnabled(true);
    });
    return;
  }
  engine?.setEnabled(on);
}

export function playCue(name: SoundName): void {
  if (!soundsOn || typeof window === 'undefined' || reducedMotion()) return;
  engine?.play(name);
}
