/** @jest-environment jsdom */
import { onRelicPageDispose, ownRelicNode, relicPageSignal, watchRelicPage } from './relic-page-scope';

test('rebuilds once per native root replacement and releases old UI nodes and global listeners', async () => {
  document.body.innerHTML = '<div id="content_value"><div id="page_inventory"><span id="timer">24:00:00</span></div></div>';
  const callbacks: string[] = [];
  const resize = jest.fn();
  const stop = watchRelicPage(() => {
    callbacks.push('mount');
    onRelicPageDispose(() => callbacks.push('dispose'));
    const panel = ownRelicNode(document.createElement('aside')); panel.id = 'panel'; document.body.append(panel);
    window.addEventListener('resize', resize, { signal: relicPageSignal() });
  });
  try {
    document.getElementById('timer')!.textContent = '23:59:59';
    await Promise.resolve();
    expect(callbacks).toEqual(['mount']);
    for (let i = 0; i < 2; i++) {
      document.getElementById('content_value')!.innerHTML = '<div id="page_inventory"><span id="timer">23:59:58</span></div>';
      await Promise.resolve();
      expect(document.querySelectorAll('#panel')).toHaveLength(1);
      resize.mockClear(); window.dispatchEvent(new Event('resize'));
      expect(resize).toHaveBeenCalledTimes(1);
    }
    expect(callbacks).toEqual(['mount', 'dispose', 'mount', 'dispose', 'mount']);
  } finally { stop(); }
  expect(document.getElementById('panel')).toBeNull();
  resize.mockClear(); window.dispatchEvent(new Event('resize'));
  expect(resize).not.toHaveBeenCalled();
});
