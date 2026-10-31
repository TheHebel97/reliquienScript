export function mockUserscriptStorage(): Map<string, unknown> {
  const values = new Map<string, unknown>();
  Object.defineProperty(globalThis, 'GM_getValue', { configurable: true, value: jest.fn((key: string, fallback: unknown) => values.has(key) ? values.get(key) : fallback) });
  Object.defineProperty(globalThis, 'GM_setValue', { configurable: true, value: jest.fn((key: string, value: unknown) => { values.set(key, value); }) });
  return values;
}
