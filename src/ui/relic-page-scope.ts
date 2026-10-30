const cleanups: Array<() => void> = [];

export function onRelicPageDispose(cleanup: () => void): void {
  cleanups.push(cleanup);
}

export function ownRelicNode<T extends Node>(node: T): T {
  onRelicPageDispose(() => node.parentNode?.removeChild(node));
  return node;
}

export function relicPageSignal(): AbortSignal {
  const controller = new AbortController();
  onRelicPageDispose(() => controller.abort());
  return controller.signal;
}

export function disposeRelicPage(): void {
  const previous = cleanups.splice(0);
  previous.reverse().forEach(cleanup => cleanup());
}

// partialReload replaces #content_value and reinitializes Inventory.grid. Watch
// root identity, not individual tiles or countdown ticks, and mount after the
// native synchronous initialization has finished.
export function watchRelicPage(install: () => void): () => void {
  let root: Element | undefined;
  const refresh = (): void => {
    if (typeof document === 'undefined' || !document.body) return;
    const current = document.getElementById('page_inventory') ||
      document.getElementById('content_value')?.firstElementChild || document.body;
    if (current === root) return;
    disposeRelicPage();
    root = current;
    install();
  };
  const observer = new MutationObserver(refresh);
  observer.observe(document.body, { childList: true, subtree: true });
  refresh();
  return () => { observer.disconnect(); disposeRelicPage(); };
}
