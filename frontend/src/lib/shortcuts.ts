// Platform-aware display labels for keyboard shortcuts.
//
// Chords are authored once in a neutral "Mod+Key" spelling and rendered with
// the modifier the visitor actually presses: ⌘ / "Cmd" on macOS, "Ctrl"
// everywhere else. `keymap.svelte.ts` shares `isMac` so the label and the
// handler can never disagree about which key is bound.

interface NavigatorWithUAData extends Navigator {
  userAgentData?: { platform?: string };
}

function detectMac(): boolean {
  if (typeof navigator === 'undefined') return false;
  const nav = navigator as NavigatorWithUAData;
  const platform = nav.userAgentData?.platform ?? nav.platform ?? '';
  return /mac|iphone|ipad|ipod/i.test(platform);
}

export const isMac: boolean = detectMac();

/** Word form of the primary modifier: "Cmd" on macOS, "Ctrl" elsewhere. */
export const modLabel: 'Cmd' | 'Ctrl' = isMac ? 'Cmd' : 'Ctrl';

/**
 * Word-form label for a chord written as `Mod+Key` (e.g. `Mod+Shift+Enter`).
 * Returns `Cmd+Shift+Enter` on macOS and `Ctrl+Shift+Enter` elsewhere.
 */
export function shortcutLabel(chord: string): string {
  return chord.replace(/\bMod\b/g, modLabel);
}

const MAC_GLYPHS: Record<string, string> = {
  Mod: '⌘',
  Shift: '⇧',
  Alt: '⌥',
  Enter: '↵',
};

const OTHER_GLYPHS: Record<string, string> = {
  Mod: 'Ctrl',
  Enter: '↵',
};

/**
 * Compact keycap form for inline `<kbd>` hints beside a button label.
 * macOS joins the Apple glyphs with no separator (`⌘⇧↵`); other platforms
 * have no modifier glyphs, so they read as `Ctrl+Shift+↵`.
 */
export function shortcutGlyphs(chord: string): string {
  const parts = chord.split('+');
  if (isMac) return parts.map((p) => MAC_GLYPHS[p] ?? p).join('');
  return parts.map((p) => OTHER_GLYPHS[p] ?? p).join('+');
}
