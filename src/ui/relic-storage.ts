export const RELIC_SETTING_KEYS = [
  'reliquiensrtipz:docked-panels', 'reliquiensrtipz:show-discovered-by',
  'reliquiensrtipz:relic-presets', 'reliquiensrtipz:onboarding-seen'
];
const sessionValues = new Map<string, string>();

function backend(): RelicUserscriptStorage | undefined {
  if (typeof GM_getValue === 'function' && typeof GM_setValue === 'function') {
    return { getValue: GM_getValue, setValue: GM_setValue };
  }
  // A team-hosted getScript loader runs its payload outside the GM closure.
  // Its restricted bridge exposes only this script's four world-scoped keys.
  const page = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;
  return page.reliquienUIStorage;
}

export const relicStorage = {
  getItem(key: string): string | null {
    if (!RELIC_SETTING_KEYS.includes(key)) throw new Error('Unbekannte Reliquien-Einstellung');
    const store = backend();
    if (!store) {
      if (sessionValues.has(key)) return sessionValues.get(key)!;
      try { return localStorage.getItem(key); } catch { return null; }
    }
    const scoped = `${location.hostname}:${key}`;
    const stored = store.getValue(scoped, null);
    if (stored !== null && stored !== undefined) return typeof stored === 'string' ? stored : null;
    if (store.getValue(`${scoped}:migrated`, false)) return null;
    let legacy: string | null;
    try { legacy = localStorage.getItem(key); } catch { return null; }
    if (legacy !== null) store.setValue(scoped, legacy);
    store.setValue(`${scoped}:migrated`, true);
    return legacy;
  },
  setItem(key: string, value: string): void {
    if (!RELIC_SETTING_KEYS.includes(key)) throw new Error('Unbekannte Reliquien-Einstellung');
    const store = backend();
    if (!store) {
      sessionValues.set(key, value);
      throw new Error('Tampermonkey-Speicher fehlt; Development-Loader/Grants aktualisieren');
    }
    store.setValue(`${location.hostname}:${key}`, value);
  }
};
