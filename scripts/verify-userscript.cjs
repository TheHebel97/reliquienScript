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
assert.ok(!/\beval\s*\(|new\s+Function\b|localhost:9000|127\.0\.0\.1:9000|sourceMappingURL/.test(source));
assert.ok(!/\bfetch\s*\(|\bXMLHttpRequest\b|\.(?:ajax|getScript)\s*\(/.test(source));

function run(register) {
  const dom = new JSDOM('<!doctype html><html><head></head><body></body></html>', {
    url: 'https://de0.die-staemme.de/game.php?village=1&screen=relic_system', runScripts: 'outside-only'
  });
  const { window } = dom;
  Object.defineProperty(window.document, 'readyState', { value: 'complete' });
  window.ResizeObserver = class { observe() {} };
  window.console = { ...console, info() {}, warn() {} };
  if (register) window.ScriptAPI = { register };
  return { dom, window, execute: () => vm.runInContext(source, dom.getInternalVMContext(), { timeout: 2000 }) };
}

// Exercise the compiled entry point offline: rejection must leave the page untouched.
for (const api of [undefined, () => false]) {
  const test = run(api);
  try { test.execute(); assert.equal(test.window.document.head.childElementCount, 0); }
  finally { test.window.close(); }
}
const denied = run(() => { throw new Error('API rejected'); });
try {
  assert.throws(denied.execute, /API rejected/);
  assert.equal(denied.window.document.head.childElementCount, 0);
} finally { denied.window.close(); }

let calls = 0;
const accepted = run((...args) => {
  calls++;
  assert.equal(accepted.window.document.head.childElementCount, 0);
  assert.deepEqual(args, ['Reliquien-Inventarhelfer', true, 'TheHebel97', 'support-nur-im-forum@die-staemme.de']);
});
try {
  accepted.execute(); assert.equal(calls, 1);
  assert.ok(accepted.window.document.head.childElementCount > 0);
} finally { accepted.window.close(); }
console.log(`Userscript ${version}: Header, MIT notice, standalone build and ScriptAPI startup checks passed.`);
