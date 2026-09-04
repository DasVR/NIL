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

  const observer = new MutationObserver(() => {
    if (isPinned) node.scrollTo({ top: node.scrollHeight, behavior: 'instant' });
  });

  node.addEventListener('scroll', onScroll, { passive: true });
  observer.observe(node, { childList: true, subtree: true, characterData: true });

  return () => {
    node.removeEventListener('scroll', onScroll);
    observer.disconnect();
  };
}
