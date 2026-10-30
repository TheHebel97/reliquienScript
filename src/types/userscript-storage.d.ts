interface RelicUserscriptStorage {
  getValue(key: string, fallback?: unknown): unknown;
  setValue(key: string, value: unknown): void;
}
interface Window { reliquienUIStorage?: RelicUserscriptStorage; }
declare function GM_getValue(key: string, fallback?: unknown): unknown;
declare function GM_setValue(key: string, value: unknown): void;
