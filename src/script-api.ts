interface GameScriptAPI {
  register(name: string, compatible: boolean, author: string, email: string): unknown;
}
type GameWindow = Window & { ScriptAPI?: GameScriptAPI };
declare const unsafeWindow: GameWindow | undefined;

// Required by the German script submission rules. Keep this before all UI changes.
export function registerScript(): boolean {
  const gameWindow = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window as GameWindow;
  const api = gameWindow.ScriptAPI;
  if (!api || typeof api.register !== 'function') {
    console.warn('[reliquiensrtipz] ScriptAPI fehlt; das Script wird nicht gestartet.');
    return false;
  }
  // The team can set compatibility to false. Do not catch or bypass API errors.
  return api.register('reliquienUI', true, 'TheHebel97', 'support-nur-im-forum@die-staemme.de') !== false;
}
