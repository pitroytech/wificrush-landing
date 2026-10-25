'use strict';
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const source = fs.readFileSync(require.resolve('../sim.js'), 'utf8') +
  '\n;globalThis.testApi = { createSim, join, step, STORIES, applyAction };';
const context = { matchMedia: () => ({ matches: false }), t: key => key };
vm.createContext(context);
vm.runInContext(source, context);
const { createSim, join, step, STORIES, applyAction } = context.testApi;
const ticks = (sim, seconds) => { for (let left = seconds; left > 0; left -= .25) step(sim, Math.min(.25, left)); };
const freshReturn = () => {
  const sim = createSim(STORIES[0], 'tweak');
  sim.pauseLeft = 1000;
  sim.cell = true;
  sim.gate = true;
  sim.connected = null;
  sim.rssi.crush = -55;
  join(sim, 'crush', 'recover');
  return sim;
};

// Cellular stays active until exactly 30 stable simulated seconds.
const stable = freshReturn();
assert.equal(stable.log.at(-1).key, 'join.verifying');
step(stable, 29.75);
assert.equal(stable.cell, true, 'cellular turned off before 30s');
step(stable, .25);
assert.equal(stable.cell, true, 'cellular turned off before illustrative probe');
step(stable, 1);
assert.equal(stable.cell, false, 'cellular did not turn off at 30s');
assert.equal(stable.log.at(-1).key, 'join.verified');

// A weak interval pauses the timer, then same-SSID recovery resumes it.
const fluctuating = freshReturn();
step(fluctuating, 10);
fluctuating.rssi.crush = -69;
step(fluctuating, 1);
assert.equal(fluctuating.verifying, false);
assert.equal(fluctuating.cell, true);
assert.equal(fluctuating.verifyFor, 0);
fluctuating.rssi.crush = -66;
step(fluctuating, 29.75);
assert.equal(fluctuating.cell, true, 'cellular turned off before resumed 30s');
step(fluctuating, .25);
assert.equal(fluctuating.cell, true, 'cellular turned off before resumed probe');
step(fluctuating, 1);
assert.equal(fluctuating.cell, false, 'same-SSID recovery did not resume verification');

// Probe failure preserves cellular; changing the mock availability retries successfully.
const unavailable = freshReturn();
unavailable.internetAvailable = false;
ticks(unavailable, 31);
assert.equal(unavailable.cell, true, 'failed illustrative probe dropped cellular');
assert.equal(unavailable.checkFailed, true);
unavailable.internetAvailable = true;
ticks(unavailable, 1.25);
assert.equal(unavailable.cell, false, 'probe did not recover after mock availability changed');

// Probe success during a call is deferred until the call ends.
const onCall = freshReturn();
onCall.inCall = true;
ticks(onCall, 31);
assert.equal(onCall.probeDone, true);
assert.equal(onCall.cell, true, 'cellular returned to Wi-Fi during a call');
onCall.inCall = false;
step(onCall, .25);
assert.equal(onCall.cell, false, 'deferred return did not complete after call');

// A disconnect cancels the pending same-SSID attempt until a new join.
const disconnected = freshReturn();
step(disconnected, 10);
applyAction(disconnected, 'wifi:off');
assert.equal(disconnected.verifyAp, null);
assert.equal(disconnected.verifying, false);
assert.equal(disconnected.cell, true);

// Unrelated iOS join behavior is unchanged.
const ios = createSim(STORIES[0], 'ios');
join(ios, 'n24', 'manual');
assert.equal(ios.cell, false);
assert.equal(ios.verifying, false);
console.log('PASS sim-return: 30s stable check, weak/recover same SSID, disconnect reset, iOS join unchanged');

