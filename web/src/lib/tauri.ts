/** Desktop window helpers. No-ops in the browser. */

export type ResizeEdge =
  | 'North'
  | 'South'
  | 'East'
  | 'West'
  | 'NorthEast'
  | 'NorthWest'
  | 'SouthEast'
  | 'SouthWest';

export function isTauriRuntime(): boolean {
  return Boolean(
    typeof window !== 'undefined' &&
      (window as unknown as { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__
  );
}

async function currentWindow() {
  const { getCurrentWindow } = await import('@tauri-apps/api/window');
  return getCurrentWindow();
}

export async function startWindowDrag(): Promise<void> {
  if (!isTauriRuntime()) return;
  try {
    await (await currentWindow()).startDragging();
  } catch {
    /* permission or non-desktop */
  }
}

export async function startWindowResize(edge: ResizeEdge): Promise<void> {
  if (!isTauriRuntime()) return;
  try {
    await (await currentWindow()).startResizeDragging(edge);
  } catch {
    /* permission or non-desktop */
  }
}

export async function toggleWindowMaximize(): Promise<void> {
  if (!isTauriRuntime()) return;
  try {
    await (await currentWindow()).toggleMaximize();
  } catch {
    /* */
  }
}

export async function minimizeWindow(): Promise<void> {
  if (!isTauriRuntime()) return;
  try {
    await (await currentWindow()).minimize();
  } catch {
    /* */
  }
}

export async function closeWindow(): Promise<void> {
  if (!isTauriRuntime()) return;
  try {
    await (await currentWindow()).close();
  } catch {
    /* */
  }
}
