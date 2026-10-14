interface GameScriptAPI {
  register(name: string, compatible: boolean, author: string, email: string): void;
}
interface Window { ScriptAPI: GameScriptAPI; }
declare const unsafeWindow: Window;
