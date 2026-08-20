/** Locked v3 tokens. `web/src/app.css` `:root` is canonical; these are JS fallbacks. */

export const COLOR = {
  abyss: '#050507',
  abyss1: '#0a0a0c',
  abyss2: '#0a0a0e',
  abyss3: '#101016',
  abyss4: '#16161d',
  green: '#00d992',
  greenDim: '#00b377',
  text: '#e8e8e6',
  textDim: '#9a9a94',
  textFaint: '#55554f',
  danger: '#ff5c5c',
  warning: '#ffb454',
  info: '#5cb8ff',
  critical: '#ff2d55'
} as const;

export const ACCENTS = ['green', 'red', 'blue', 'teal', 'amber'] as const;
export type AccentName = (typeof ACCENTS)[number];

export function cssToken(name: string, fallback: string): string {
  if (typeof document === 'undefined') return fallback;
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}
