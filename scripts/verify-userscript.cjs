const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { JSDOM } = require('jsdom');
const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'reliquiensrtipz.user.js'), 'utf8');
const { version } = require('../package.json');

assert.ok(source.startsWith('// ==UserScript=='));
assert.ok(source.includes(`// @version      ${version}`));
assert.ok(source.includes('// @license      MIT'));
for (const grant of ['GM_getValue', 'GM_setValue', 'unsafeWindow']) {
  assert.ok(source.includes(`// @grant        ${grant}`));
  assert.ok(fs.readFileSync(path.join(root, 'devUserscript.js'), 'utf8').includes(`// @grant        ${grant}`));
}
assert.ok(source.includes('// @sandbox      raw'));
assert.ok(source.includes(fs.readFileSync(path.join(root, 'LICENSE'), 'utf8').trim()));
assert.ok(!/\beval\s*\(|new\s+Function\b|(?:localhost|127\.0\.0\.1):\d+|sourceMappingURL/.test(source));
assert.ok(!/\bfetch\s*\(|\bXMLHttpRequest\b|\.(?:ajax|getScript)\s*\(/.test(source));

function run(register, html = '<!doctype html><html><head></head><body></body></html>') {
  const dom = new JSDOM(html, {
    url: 'https://de258.die-staemme.de/game.php?village=5485&screen=relic_system', runScripts: 'outside-only'
  });
  const { window } = dom;
  const errors = [];
  dom.virtualConsole.on('jsdomError', error => errors.push(error));
  Object.defineProperty(window.document, 'readyState', { value: 'complete' });
  window.ResizeObserver = class { observe() {} disconnect() {} };
  window.console = { ...console, info() {}, warn() {} };
  const values = new Map();
  window.GM_getValue = (key, fallback) => values.has(key) ? values.get(key) : fallback;
  window.GM_setValue = (key, value) => { values.set(key, value); };
  if (register) window.ScriptAPI = { register };
  return { dom, window, values, errors, execute: () => vm.runInContext(source, dom.getInternalVMContext(), { timeout: 2000 }) };
}

// Exercise the official registration in the actual compiled entry point offline.
const missing = run();
try {
  assert.throws(missing.execute, /register/);
  assert.equal(missing.window.document.head.childElementCount, 0);
} finally { missing.window.close(); }
const denied = run(() => { throw new Error('API rejected'); });
try {
  assert.throws(denied.execute, /API rejected/);
  assert.equal(denied.window.document.head.childElementCount, 0);
} finally { denied.window.close(); }

for (const useUnsafeWindow of [false, true]) {
  let calls = 0;
  const register = (...args) => {
    calls++;
    assert.equal(accepted.window.document.head.childElementCount, 0);
    assert.deepEqual(args, ['reliquienUI', true, 'TheHebel97', 'support-nur-im-forum@die-staemme.de']);
  };
  const accepted = run(register);
  if (useUnsafeWindow) {
    accepted.window.unsafeWindow = { ScriptAPI: { register } };
    accepted.window.ScriptAPI.register = () => { throw new Error('wrong API scope'); };
  }
  try {
    accepted.execute(); assert.equal(calls, 1);
    assert.ok(accepted.window.document.head.childElementCount > 0);
  } finally { accepted.window.close(); }
}

// Run the complete compiled entry against the reported cooldown variant. A
// hidden removal button must not prevent the other installers from running.
async function verifyCooldownAndReload(teamLoader = false) {
  const fixture = fs.readFileSync(path.join(__dirname, 'fixtures/relic-cooldown.html'), 'utf8');
  const cooldown = run(() => {}, fixture);
  try {
    const { window } = cooldown;
    const doc = window.document;
    const timer = doc.getElementById('timer');
    const remove = doc.getElementById('remove_relic_button');
    let actions = 0;
    remove.addEventListener('click', () => { actions++; });
    const frames = [];
    window.requestAnimationFrame = callback => { frames.push(callback); return frames.length; };
    window.cancelAnimationFrame = () => {};
    const flush = () => { while (frames.length) frames.shift()(0); };
    window.localStorage.setItem('reliquiensrtipz:onboarding-seen', '1');
    const records = [
      { id: 1, name: 'Schäbige Großaxt', type: 'greataxe', quality: 'shoddy', main_stat: { name: 'Axtkämpfer: +5% Angriffs- und Verteidigungsstärke' }, sub_stats: [{ id: 5, name: 'Leichte Kavallerie: +2% Angriffs- und Verteidigungsstärke' }, { id: 24, name: 'Axtkämpfer: +2% Angriffsstärke' }] },
      { id: 2, name: 'Schäbige Hellebarde', type: 'halberd', quality: 'shoddy', main_stat: { name: 'Speerträger: +5% Angriffs- und Verteidigungsstärke' }, sub_stats: [{ id: 31, name: 'Speerträger: +2% Verteidigungsstärke' }, { id: 31, name: 'Speerträger: +2% Verteidigungsstärke' }] },
      { id: 99, name: 'Erstklassige Hellebarde', type: 'halberd', quality: 'superior', village_id: 5485, main_stat: { name: 'Speerträger: +8% Angriffs- und Verteidigungsstärke' }, sub_stats: [] }
    ];
    const makeGrid = (relics = records) => ({
      relics, page: 0, per_page: 20, filters: { quality: null, type: null, sub_stat_1: null, sub_stat_2: null },
      getIncludedRelics() { return this.relics.filter(r => !r.village_id); },
      matchesFilters() { return true; }, hasFilters() { return false; },
      getFilteredRelics() { return this.getIncludedRelics().filter(this.matchesFilters, this); },
      getStacks() { return this.getFilteredRelics().map(r => ({ representative: r, count: 1, relics: [r] })); },
      getMaxPage() { return Math.max(0, Math.ceil(this.getStacks().length / this.per_page) - 1); },
      setPage(page) { this.page = Math.max(0, Math.min(page, this.getMaxPage())); }
    });
    const grid = makeGrid();
    const nativeStacks = grid.getStacks;
    const inventory = { grid, RelicsGridPanel: { deselectRelic() {} }, updateUI() {
      const grid = this.grid;
      doc.getElementById('relics').innerHTML = grid.getStacks().slice(grid.page * grid.per_page, (grid.page + 1) * grid.per_page)
        .map(s => `<div><img data-id="${s.representative.id}"></div>`).join('');
    } };
    window.__nativeRelicSystem = { Inventory: inventory, getRelicById: id => records.find(r => String(r.id) === String(id)) };
    vm.runInContext('const RelicSystem = window.__nativeRelicSystem;', cooldown.dom.getInternalVMContext());
    delete window.__nativeRelicSystem;
    Object.defineProperty(doc.getElementById('relics'), 'clientWidth', { value: 804 });
    if (teamLoader) {
      const initializer = fs.readFileSync(path.join(root, 'docs/forum-einreichung.txt'), 'utf8')
        .match(/\[CODE=javascript\]([\s\S]*?)\[\/CODE\]/)[1];
      window.__gmGet = window.GM_getValue; window.__gmSet = window.GM_setValue;
      delete window.GM_getValue; delete window.GM_setValue;
      window.$ = { getScript(url) { assert.equal(url, 'HIER_DIE_SERVER_URL_DES_STAEMME_TEAMS_EINTRAGEN'); cooldown.execute(); } };
      vm.runInContext(`(function(GM_getValue, GM_setValue, unsafeWindow) { ${initializer}\n })(window.__gmGet, window.__gmSet, window);`, cooldown.dom.getInternalVMContext());
      delete window.__gmGet; delete window.__gmSet;
      const size = cooldown.values.size;
      window.reliquienUIStorage.setValue('unrelated-setting', 'forbidden');
      assert.equal(cooldown.values.size, size);
      assert.equal(window.reliquienUIStorage.getValue('unrelated-setting', 'fallback'), 'fallback');
    } else cooldown.execute();
    flush();
    assert.ok(doc.getElementById('village_relic').classList.contains('relic-dock'));
    assert.ok(doc.getElementById('upgrade_panel').classList.contains('relic-dock'));
    assert.ok(doc.getElementById('relic-search-input'));
    assert.ok(doc.getElementById('relic-onboarding-help'));
    assert.equal(doc.querySelectorAll('.preset-card').length, 3);
    assert.ok(grid.per_page > 20);
    const input = doc.getElementById('relic-search-input');
    input.value = 'großaxt'; input.dispatchEvent(new window.Event('input')); flush();
    assert.equal(doc.querySelectorAll('#relics img[data-id]').length, 1);
    assert.match(doc.querySelector('.search-status').textContent, /1 von 2 Reliquien/);
    assert.equal(doc.getElementById('timer'), timer);
    assert.equal(timer.textContent, '11:54:00');
    assert.equal(doc.getElementById('remove_relic_button'), remove);
    assert.ok(remove.classList.contains('display-none'));
    assert.equal(window.getComputedStyle(remove).display, 'none');
    assert.equal(actions, 0);
    const settingKey = `${window.location.hostname}:reliquiensrtipz:relic-presets`;
    const stored = cooldown.values.get(settingKey);
    assert.ok(stored);
    assert.equal(window.localStorage.getItem('reliquiensrtipz:relic-presets'), null);
    assert.equal(cooldown.values.get(`${window.location.hostname}:reliquiensrtipz:onboarding-seen`), '1');
    const initialStyleCount = doc.head.querySelectorAll('style').length;
    for (let reload = 0; reload < 2; reload++) {
      // Native partialReload replaces content and creates a fresh Grid before
      // returning to the event loop. No new DOMContentLoaded event is fired.
      const template = doc.createElement('template'); template.innerHTML = fixture;
      doc.getElementById('page_inventory').replaceWith(template.content.querySelector('#page_inventory'));
      Object.defineProperty(doc.getElementById('relics'), 'clientWidth', { value: 804 });
      inventory.grid = makeGrid(records.filter(r => r.id !== 2));
      inventory.updateUI();
      await Promise.resolve(); flush(); await Promise.resolve();
      assert.ok(doc.getElementById('village_relic').classList.contains('relic-dock'));
      assert.ok(doc.getElementById('upgrade_panel').classList.contains('relic-dock'));
      for (const id of ['relic-search', 'relic-filter-window', 'relic-preset-window', 'relic-equip-window', 'relic-hover-details', 'relic-onboarding', 'relic-upgrade-preview', 'reliquien-shiny-rainbow-defs']) {
        assert.equal(doc.querySelectorAll(`#${id}`).length, 1, `one active ${id} after reload`);
      }
      assert.equal(doc.head.querySelectorAll('style').length, initialStyleCount);
      assert.ok(Number.isFinite(inventory.grid.page));
      assert.ok(Number.isFinite(inventory.grid.per_page));
      assert.ok(inventory.grid.per_page > 20);
      assert.equal(doc.querySelectorAll('#relics img[data-id]').length, 1);
      const input = doc.getElementById('relic-search-input');
      input.value = 'großaxt'; input.dispatchEvent(new window.Event('input')); flush();
      assert.match(doc.querySelector('.search-status').textContent, /1 von 1 Reliquien/);
      assert.equal(doc.getElementById('timer').textContent, '11:54:00');
      assert.ok(doc.getElementById('remove_relic_button').classList.contains('display-none'));
      assert.deepEqual(JSON.parse(cooldown.values.get(settingKey)), JSON.parse(stored));
      assert.equal(grid.getStacks, nativeStacks, 'old grid hooks disposed');
    }
  } finally { cooldown.window.close(); }
  await Promise.resolve();
  assert.deepEqual(cooldown.errors, []);
}
verifyCooldownAndReload().then(() => verifyCooldownAndReload(true)).then(() => {
  console.log(`Userscript ${version}: ScriptAPI, GM storage, team loader, cooldown startup and repeated partial reloads passed.`);
}).catch(error => { console.error(error); process.exitCode = 1; });
