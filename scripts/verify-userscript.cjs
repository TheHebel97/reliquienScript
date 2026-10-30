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
assert.ok(source.includes(fs.readFileSync(path.join(root, 'LICENSE'), 'utf8').trim()));
assert.ok(!/\beval\s*\(|new\s+Function\b|(?:localhost|127\.0\.0\.1):\d+|sourceMappingURL/.test(source));
assert.ok(!/\bfetch\s*\(|\bXMLHttpRequest\b|\.(?:ajax|getScript)\s*\(/.test(source));

function run(register, html = '<!doctype html><html><head></head><body></body></html>') {
  const dom = new JSDOM(html, {
    url: 'https://de258.die-staemme.de/game.php?village=5485&screen=relic_system', runScripts: 'outside-only'
  });
  const { window } = dom;
  Object.defineProperty(window.document, 'readyState', { value: 'complete' });
  window.ResizeObserver = class { observe() {} };
  window.console = { ...console, info() {}, warn() {} };
  if (register) window.ScriptAPI = { register };
  return { dom, window, execute: () => vm.runInContext(source, dom.getInternalVMContext(), { timeout: 2000 }) };
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
const cooldown = run(() => {}, fs.readFileSync(path.join(__dirname, 'fixtures/relic-cooldown.html'), 'utf8'));
try {
  const { window } = cooldown;
  const doc = window.document;
  const timer = doc.getElementById('timer');
  const remove = doc.getElementById('remove_relic_button');
  let actions = 0;
  remove.addEventListener('click', () => { actions++; });
  const frames = [];
  window.requestAnimationFrame = callback => { frames.push(callback); return frames.length; };
  const flush = () => { while (frames.length) frames.shift()(0); };
  window.localStorage.setItem('reliquiensrtipz:onboarding-seen', '1');
  const records = [
    { id: 1, name: 'Schäbige Großaxt', type: 'greataxe', quality: 'shoddy', main_stat: { name: 'Axtkämpfer: +5% Angriffs- und Verteidigungsstärke' }, sub_stats: [{ id: 5, name: 'Leichte Kavallerie: +2% Angriffs- und Verteidigungsstärke' }, { id: 24, name: 'Axtkämpfer: +2% Angriffsstärke' }] },
    { id: 2, name: 'Schäbige Hellebarde', type: 'halberd', quality: 'shoddy', main_stat: { name: 'Speerträger: +5% Angriffs- und Verteidigungsstärke' }, sub_stats: [{ id: 31, name: 'Speerträger: +2% Verteidigungsstärke' }, { id: 31, name: 'Speerträger: +2% Verteidigungsstärke' }] },
    { id: 99, name: 'Erstklassige Hellebarde', type: 'halberd', quality: 'superior', village_id: 5485, main_stat: { name: 'Speerträger: +8% Angriffs- und Verteidigungsstärke' }, sub_stats: [] }
  ];
  const grid = {
    relics: records, page: 0, per_page: 20, filters: { quality: null, type: null, sub_stat_1: null, sub_stat_2: null },
    getIncludedRelics() { return this.relics.filter(r => !r.village_id); },
    matchesFilters() { return true; }, hasFilters() { return false; },
    getFilteredRelics() { return this.getIncludedRelics().filter(this.matchesFilters, this); },
    getStacks() { return this.getFilteredRelics().map(r => ({ representative: r, count: 1, relics: [r] })); },
    getMaxPage() { return Math.max(0, Math.ceil(this.getStacks().length / this.per_page) - 1); },
    setPage(page) { this.page = Math.max(0, Math.min(page, this.getMaxPage())); }
  };
  const inventory = { grid, RelicsGridPanel: { deselectRelic() {} }, updateUI() {
    doc.getElementById('relics').innerHTML = grid.getStacks().slice(grid.page * grid.per_page, (grid.page + 1) * grid.per_page)
      .map(s => `<div><img data-id="${s.representative.id}"></div>`).join('');
  } };
  window.RelicSystem = { Inventory: inventory, getRelicById: id => records.find(r => String(r.id) === String(id)) };
  Object.defineProperty(doc.getElementById('relics'), 'clientWidth', { value: 804 });
  cooldown.execute(); flush();
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
} finally { cooldown.window.close(); }
console.log(`Userscript ${version}: header, MIT, ScriptAPI startup and full cooldown-inventory startup checks passed.`);
