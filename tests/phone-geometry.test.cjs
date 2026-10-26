'use strict';
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const source = fs.readFileSync(require.resolve('../phone.js'), 'utf8') +
  '\n;globalThis.testApi = { elementPoint, pointInElement };';
let rotated = true;
const context = { document: { documentElement: { classList: { contains: name => rotated && name === 'phone-rot' } } } };
vm.createContext(context);
vm.runInContext(source, context);
const { elementPoint, pointInElement } = context.testApi;
// Simulate 393x852 local portrait screen transformed clockwise into an 852x393 viewport.
const screen = { getBoundingClientRect: () => ({ left: 40, top: 20, width: 852, height: 393 }) };
// Local target box x=.2..6, y=.15..35 mapped through the 90-degree rotation.
const target = { getBoundingClientRect: () => ({ left: 593.8, right: 764.2, top: 98.6, width: 170.4, height: 157.2 }) };
const localTarget = { x: .3, y: .5 };
const viewportPoint = elementPoint(target, ...Object.values(localTarget));
const localScreen = pointInElement(screen, viewportPoint);
assert.ok(Math.abs(localScreen.x - .32) < 1e-9, `wrong local x: ${localScreen.x}`);
assert.ok(Math.abs(localScreen.y - .25) < 1e-9, `wrong local y: ${localScreen.y}`);
// Exercise the real fallback path with getBoxQuads unavailable and an off-center target point.
assert.equal(target.getBoxQuads, undefined);
rotated = false;
const plainScreen = { getBoundingClientRect: () => ({ left: 10, top: 20, width: 400, height: 800 }) };
const plainTarget = { getBoundingClientRect: () => ({ left: 110, top: 220, width: 100, height: 80 }) };
const plainPoint = elementPoint(plainTarget, .3, .5);
const plainLocal = pointInElement(plainScreen, plainPoint);
assert.ok(Math.abs(plainLocal.x - .325) < 1e-9);
assert.ok(Math.abs(plainLocal.y - .3) < 1e-9);
console.log('PASS phone-geometry: rotated fallback and portrait fallback with off-center target');


