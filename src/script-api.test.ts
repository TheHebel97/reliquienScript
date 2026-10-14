/** @jest-environment jsdom */
import { registerScript } from './script-api';

afterEach(() => {
  delete (window as Window & { ScriptAPI?: unknown }).ScriptAPI;
  delete (globalThis as typeof globalThis & { unsafeWindow?: unknown }).unsafeWindow;
  jest.restoreAllMocks();
});

test('registers descriptive metadata on the game API before allowing initialization', () => {
  const register = jest.fn(); Object.assign(window, { ScriptAPI: { register } });
  expect(registerScript()).toBe(true);
  expect(register).toHaveBeenCalledWith('reliquienUI', true, 'TheHebel97', 'support-nur-im-forum@die-staemme.de');
});

test('supports unsafeWindow without falling back around its rejection', () => {
  const fallback = jest.fn(); Object.assign(window, { ScriptAPI: { register: fallback } });
  Object.assign(globalThis, { unsafeWindow: { ScriptAPI: { register: () => false } } });
  expect(registerScript()).toBe(false); expect(fallback).not.toHaveBeenCalled();
});

test('missing API blocks initialization and a native API exception propagates', () => {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  expect(registerScript()).toBe(false);
  const error = new Error('incompatible'); Object.assign(window, { ScriptAPI: { register: () => { throw error; } } });
  expect(registerScript).toThrow(error);
});
