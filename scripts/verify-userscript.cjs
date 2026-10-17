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
console.log(`Userscript ${version}: Header, MIT notice, standalone build and ScriptAPI startup checks passed.`);
