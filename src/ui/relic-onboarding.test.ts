/** @jest-environment jsdom */
import { installRelicOnboarding } from './relic-onboarding';

const key = 'reliquiensrtipz:onboarding-seen';
const dialog = (): HTMLDialogElement => document.getElementById('relic-onboarding') as HTMLDialogElement;
const setup = (): void => {
  document.head.replaceChildren();
  document.body.innerHTML = '<div id="relics"></div><div id="relic-search"><div class="search-line"><input id="relic-search-input"><button>Zurücksetzen</button></div></div>';
};
beforeEach(() => {
  localStorage.clear(); setup();
  Object.defineProperty(HTMLDialogElement.prototype, 'showModal', { configurable: true, value: function () { this.setAttribute('open', ''); } });
  Object.defineProperty(HTMLDialogElement.prototype, 'close', { configurable: true, value: function () { this.removeAttribute('open'); } });
});
afterEach(() => jest.restoreAllMocks());

test.each(['Verstanden', '×', 'Escape'])('%s dismisses first-run onboarding permanently while help can reopen it', action => {
  installRelicOnboarding();
  expect(dialog().open).toBe(true);
  expect(localStorage.getItem(key)).toBeNull();
  expect(dialog().textContent).toContain('Linksklick → Aufwertung');
  expect(dialog().textContent).toContain('Rechtsklick → Ausrüsten');
  expect(dialog().querySelectorAll('.actions button')).toHaveLength(1);
  if (action === 'Escape') dialog().dispatchEvent(new Event('cancel', { cancelable: true }));
  else Array.from(dialog().querySelectorAll('button')).find(b => b.textContent === action)!.click();
  expect(dialog().open).toBe(false); expect(localStorage.getItem(key)).toBe('1');
  expect(document.activeElement?.id).toBe('relic-search-input');
  setup(); installRelicOnboarding();
  expect(dialog().open).toBe(false);
  const help = document.getElementById('relic-onboarding-help')!;
  help.focus(); help.click(); expect(dialog().open).toBe(true);
  dialog().dispatchEvent(new Event('cancel', { cancelable: true }));
  expect(document.activeElement).toBe(help);
});

test('does not install twice or record onboarding on a page without inventory controls', () => {
  document.getElementById('relics')!.remove(); installRelicOnboarding();
  expect(dialog()).toBeNull(); expect(localStorage.getItem(key)).toBeNull();
  setup(); installRelicOnboarding(); installRelicOnboarding();
  expect(document.querySelectorAll('#relic-onboarding')).toHaveLength(1);
  expect(document.querySelectorAll('#relic-onboarding-help')).toHaveLength(1);
});

test('storage failures never prevent dismissing or reopening the introduction', () => {
  jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked'); });
  jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked'); });
  expect(installRelicOnboarding).not.toThrow(); expect(dialog().open).toBe(true);
  const close = dialog().querySelector<HTMLButtonElement>('.close')!;
  expect(() => close.click()).not.toThrow(); expect(dialog().open).toBe(false);
  document.getElementById('relic-onboarding-help')!.click(); expect(dialog().open).toBe(true);
});
