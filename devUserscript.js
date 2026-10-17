// ==UserScript==
// @name         reliquienUI - Development
// @version      0.1.1
// @description  Laedt das lokale Webpack-Bundle zur Entwicklung.
// @match        https://*.die-staemme.de/game.php?village=*&screen=relic_*
// @grant        none
// ==/UserScript==

(async function () {
  try {
    const response = await fetch('http://127.0.0.1:9001/bundle.js', {
      cache: 'no-store'
    });
    if (!response.ok) {
      throw new Error(`Bundle konnte nicht geladen werden: HTTP ${response.status}`);
    }
    const script = await response.text();
    (0, eval)(script);
    console.info('[reliquiensrtipz] Lokales Bundle gestartet.');
  } catch (error) {
    console.error('[reliquiensrtipz] Dev-Loader fehlgeschlagen. Laeuft npm start?', error);
  }
})();
