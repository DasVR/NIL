export function pinned(node: HTMLElement, onChange: (isPinned: boolean) => void) {
  let isPinned = true;
  const THRESHOLD = 48;

  const atBottom = () =>
    node.scrollHeight - node.scrollTop - node.clientHeight < THRESHOLD;

  const onScroll = () => {
    const next = atBottom();
    if (next !== isPinned) {
      isPinned = next;
      onChange(isPinned);
    }
  };

  // Batch scroll writes to one per frame — a burst of childList/characterData
  // mutations during rapid append must not issue a scrollTo per mutation.
  let scheduled = false;
  const observer = new MutationObserver(() => {
    if (!isPinned || scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      if (isPinned) node.scrollTo({ top: node.scrollHeight, behavior: 'instant' });
    });
  });

  node.addEventListener('scroll', onScroll, { passive: true });
  observer.observe(node, { childList: true, subtree: true, characterData: true });

  return () => {
    node.removeEventListener('scroll', onScroll);
    observer.disconnect();
  };
}
