/**
 * Modal focus trap as a Svelte 5 attachment.
 *
 *   <div role="dialog" aria-modal="true" {@attach trap}>
 *
 * where `trap = focusTrap({ initial: () => inputRef })` is created once in the
 * component script so the attachment identity is stable across re-renders.
 *
 * On attach it remembers `document.activeElement`, moves focus to `initial()`
 * (falling back to the first tabbable, then the container itself) and keeps
 * Tab / Shift+Tab cycling inside the container. On detach it returns focus to
 * the element that had it before the dialog opened, so closing a palette or
 * sheet lands the user where they were instead of on <body> — unless something
 * (a palette command calling `focusComposer()`, say) has already moved focus
 * elsewhere on purpose, in which case that move wins.
 *
 * Pointer escape is the caller's job (both dialogs sit behind a full-viewport
 * overlay), and `aria-modal="true"` tells assistive tech to stay inside. No
 * `focusin` guard: it would fight exactly those deliberate programmatic moves.
 *
 * Deliberately not using `inert` on the rest of the document: the app shell
 * keeps live regions (status bar, stream) that should still announce while a
 * dialog is open.
 */

const TABBABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]',
].join(',');

export interface FocusTrapOptions {
  /** Element to focus when the trap arms. Defaults to the first tabbable. */
  initial?: () => HTMLElement | null | undefined;
  /** Return focus to the previously focused element on teardown. Default true. */
  restore?: boolean;
}

function tabbable(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(TABBABLE)).filter((el) => {
    if (el.tabIndex < 0) return false;
    if (el.getAttribute('aria-hidden') === 'true') return false;
    // Zero-box elements are still focusable (the ToggleRow checkbox is 0×0 by
    // design); only display:none / detached subtrees report no boxes at all.
    return el.getClientRects().length > 0 || el.offsetParent !== null;
  });
}

export function focusTrap(opts: FocusTrapOptions = {}) {
  return (node: HTMLElement) => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    function focusFirst(): void {
      const target = opts.initial?.() ?? tabbable(node)[0] ?? node;
      if (target === node && node.tabIndex < 0) node.tabIndex = -1;
      target.focus();
    }

    function onKeydown(e: KeyboardEvent): void {
      if (e.key !== 'Tab') return;
      const list = tabbable(node);
      if (list.length === 0) {
        e.preventDefault();
        node.focus();
        return;
      }
      const first = list[0];
      const last = list[list.length - 1];
      const active = document.activeElement;
      const inside = active instanceof Node && node.contains(active);
      if (e.shiftKey) {
        if (!inside || active === first) {
          e.preventDefault();
          last.focus();
        }
      } else if (!inside || active === last) {
        e.preventDefault();
        first.focus();
      }
    }

    node.addEventListener('keydown', onKeydown);
    // Microtask: the dialog's children may not be measured/attached yet on the
    // same tick the container mounts.
    queueMicrotask(focusFirst);

    return () => {
      node.removeEventListener('keydown', onKeydown);
      if (opts.restore === false || !previous?.isConnected) return;
      // Svelte removes the dialog's DOM before running this teardown, so focus
      // that was inside it has already fallen back to <body>. Anything else
      // means a handler moved focus deliberately; leave it there.
      const active = document.activeElement;
      const orphaned = active === null || active === document.body || node.contains(active);
      if (orphaned) previous.focus();
    };
  };
}
