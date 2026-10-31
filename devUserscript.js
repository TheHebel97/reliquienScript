// ==UserScript==
// @name         reliquienUI - Development
// @version      0.2.0
// @description  Laedt das lokale Webpack-Bundle zur Entwicklung.
// @match        https://*.die-staemme.de/game.php?village=*&screen=relic_*
// @sandbox      raw
// @grant        unsafeWindow
// @grant        GM_getValue
// @grant        GM_setValue
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
    // Direct eval retains Tampermonkey's GM API bindings for the dev bundle.
    eval(script);
    console.info('[reliquienUI] Dev-Loader 0.2.0 gestartet; Tampermonkey-Speicher:',
      typeof GM_getValue === 'function' && typeof GM_setValue === 'function');
  } catch (error) {
    console.error('[reliquiensrtipz] Dev-Loader fehlgeschlagen. Laeuft npm start?', error);
  }
})();
