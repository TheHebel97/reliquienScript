/** @jest-environment jsdom
 * @jest-environment-options {"url":"https://de259.die-staemme.de/game.php?village=1&screen=relic_system"}
 */
import { relicStorage } from './relic-storage';
import { mockUserscriptStorage } from './test-helpers/userscript-storage';

const key = 'reliquiensrtipz:relic-presets';
const scoped = `de259.die-staemme.de:${key}`;
let values: Map<string, unknown>;
beforeEach(() => { localStorage.clear(); values = mockUserscriptStorage(); delete window.reliquienUIStorage; });
afterEach(() => jest.restoreAllMocks());

test('migrates a legacy setting once, preserves the legacy copy and writes only to Tampermonkey', () => {
  localStorage.setItem(key, 'legacy');
  expect(relicStorage.getItem(key)).toBe('legacy');
  expect(values.get(scoped)).toBe('legacy');
  relicStorage.setItem(key, 'updated');
  expect(values.get(scoped)).toBe('updated');
  expect(localStorage.getItem(key)).toBe('legacy');
  values.delete(scoped); localStorage.setItem(key, 'stale');
  expect(relicStorage.getItem(key)).toBeNull();
});

test('keeps worlds separate and never overwrites an existing GM value with legacy data', () => {
  localStorage.setItem(key, 'legacy');
  values.set(`de258.die-staemme.de:${key}`, 'other world'); values.set(scoped, 'this world');
  expect(relicStorage.getItem(key)).toBe('this world');
  relicStorage.setItem(key, 'new');
  expect(values.get(`de258.die-staemme.de:${key}`)).toBe('other world');
});

test('existing GM settings work with blocked localStorage and storage failures propagate to UI fallbacks', () => {
  values.set(scoped, 'stored');
  jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked'); });
  expect(relicStorage.getItem(key)).toBe('stored');
  (GM_setValue as jest.Mock).mockImplementation(() => { throw new Error('unavailable'); });
  expect(() => relicStorage.setItem(key, 'new')).toThrow('unavailable');
  expect(values.get(scoped)).toBe('stored');
});

test('team-hosted page code uses the loader bridge and rejects unrelated storage keys', () => {
  const getValue = GM_getValue; const setValue = GM_setValue;
  window.reliquienUIStorage = { getValue, setValue };
  Object.defineProperty(globalThis, 'GM_getValue', { configurable: true, value: undefined });
  Object.defineProperty(globalThis, 'GM_setValue', { configurable: true, value: undefined });
  relicStorage.setItem(key, 'bridge'); expect(relicStorage.getItem(key)).toBe('bridge');
  expect(values.get(scoped)).toBe('bridge');
  expect(() => relicStorage.getItem('game-session')).toThrow('Unbekannte');
  expect(() => relicStorage.setItem('game-session', 'x')).toThrow('Unbekannte');
});

test('a stale loader without grants can retain session settings without writing localStorage', () => {
  Object.defineProperty(globalThis, 'GM_getValue', { configurable: true, value: undefined });
  Object.defineProperty(globalThis, 'GM_setValue', { configurable: true, value: undefined });
  localStorage.setItem(key, 'legacy');
  expect(relicStorage.getItem(key)).toBe('legacy');
  expect(() => relicStorage.setItem(key, 'session')).toThrow('Grants');
  expect(relicStorage.getItem(key)).toBe('session');
  expect(localStorage.getItem(key)).toBe('legacy');
});
