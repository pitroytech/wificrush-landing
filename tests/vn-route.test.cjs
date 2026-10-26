'use strict';
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const html = fs.readFileSync(require.resolve('../vn/index.html'), 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
for (const hash of ['', '#stories', '#rules']) {
  let destination;
  vm.runInNewContext(script, { location: { hash, replace: url => { destination = url; } } });
  assert.equal(destination, '/wificrush-landing/?lang=vi' + hash);
}
const source = fs.readFileSync(require.resolve('../i18n.js'), 'utf8');
const context = { URLSearchParams, location: { search: '?lang=vi' }, localStorage: { getItem: () => 'en' } };
vm.createContext(context);
vm.runInContext(source + '\n globalThis.language = initialLang();', context);
assert.equal(context.language, 'vi');
assert.match(html, /http-equiv="refresh"/);
console.log('Vietnamese route, anchor preservation and saved-English override: OK');
