'use strict';
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
let draws = 0, resize, intersect;
const gradient = { addColorStop() {} };
const raw = new Proxy({}, { get(target, key) {
  if (key in target) return target[key];
  if (key === 'roundRect') return undefined; // Safari on iOS 15.
  if (key === 'clearRect') return () => draws++;
  if (key === 'measureText') return text => ({ width: text.length * 8 });
  if (String(key).startsWith('create')) return () => gradient;
  return () => {};
}, set(target, key, value) { target[key] = value; return true; } });
let localWidth = 800, onScreen = true;
const canvas = { width: 0, height: 0, className: '', setAttribute() {},
  get offsetWidth() { return localWidth; }, get clientWidth() { return localWidth; },
  getBoundingClientRect() { return { width: localWidth * .52, height: localWidth, top: onScreen ? 0 : 2000, bottom: onScreen ? localWidth : 2400 }; },
  getContext: () => raw };
const svg = { style: {}, parentElement: { querySelector: () => null }, after() {} };
const context = { window: {}, document: { createElement: () => canvas, fonts: { ready: Promise.resolve() } },
  devicePixelRatio: 2, innerHeight: 900, LANG: 'en', reduceMotion: false,
  t: key => key, apName: ap => ap.name, tone: () => 'good', requestAnimationFrame: fn => fn(),
  ResizeObserver: class { constructor(fn) { resize = fn; } observe() {} },
  IntersectionObserver: class { constructor(fn) { intersect = fn; } observe() {} } };
context.window = context;
vm.createContext(context);
vm.runInContext(fs.readFileSync(require.resolve('../diorama.js'), 'utf8'), context);
const api = context.window.WCDiorama;
const story = { id: 'balcony', aps: [{id: 'crush', name: 'Home', band: 5, crush: true}] };
const sim = { x: 110, realT: 2, connected: 'crush', cell: false, moving: false };
const refs = api.build(svg, { replaceChildren() {} }, story);
api.update(refs, sim, story);
assert.equal(canvas.width, 1600, 'use untransformed local width in rotated theater');
assert.equal(canvas.height, 832);
const initialDraws = draws;
api.update(refs, sim, story);
assert.equal(draws, initialDraws, 'unchanged paused state is throttled');
api.update(refs, sim, story, true);
assert.equal(draws, initialDraws + 1, 'explicit restore repaint bypasses same-time throttle');
localWidth = 600;
api.update(refs, sim, story);
assert.equal(canvas.width, 1200, 'paused resize must not be throttled');
assert.ok(draws > initialDraws);
localWidth = 700;
resize();
assert.equal(canvas.width, 1400, 'ResizeObserver repaints while paused');
onScreen = false; sim.x = 200;
api.update(refs, sim, story);
const hiddenDraws = draws;
onScreen = true; intersect([{isIntersecting:true}]);
assert.ok(draws > hiddenDraws, 'intersection repaints a previously hidden paused scene');
sim.realT = 0;
api.update(refs, sim, story);
assert.equal(refs.lastTime, 0, 'replay may move the clock backward');
for (const id of ['outside','call','office']) {
  const aps = id === 'office' ? [{id:'kd',name:'Sales',band:5,crush:true},{id:'kh',name:'Lobby',band:2},{id:'ph',name:'Meeting',band:5}] : story.aps;
  const nextStory = {id, aps};
  const next = api.build(svg, {replaceChildren() {}}, nextStory);
  api.update(next, {...sim, connected:aps[0].id}, nextStory);
}
context.reduceMotion = true;
api.update(refs, {...sim, x:250, moving:true}, story);
assert.ok(draws > 0);
context.reduceMotion = false;
const beforeWalk = draws;
for (let i = 1; i <= 120; i++) api.update(refs, {...sim, x:250+i, realT:i/120, moving:true}, story);
assert.ok(draws - beforeWalk <= 35, `walking should draw near 30fps, got ${draws-beforeWalk}`);
console.log('PASS diorama: four scenes, rotated dimensions, throttle, paused resize, visibility, replay, reduced motion');
