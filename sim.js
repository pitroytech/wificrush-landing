'use strict';
// WifiCrush landing: the simulation behind every story. One person walks the route carrying
// two phones in step: an iPhone as it comes, and one with WifiCrush. Tweak rules follow the engine (0.2.3-beta7:
// crush -65, weak -67, 4G/5G level -70, +10 dB margin, 1 minute before Wi-Fi auto-join pauses) at demo pace. iOS keeps the
// joined network until it is lost, so its owner fixes things by hand: unlock, Settings, Wi-Fi.
// Story 3: on a call, Wi-Fi under the data level goes to 4G/5G at once (0.2.3-beta2, tested by the owner 2026-10-24).

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const MODES = ['ios', 'tweak'];
const CRUSH = -65, WEAK = -67, LTE = -70, MARGIN = 10;
const SPEED = 8;      // simulated seconds per real second
const WALK = 9;       // scene units per simulated second
const STEP = 0.25;    // simulation step, simulated seconds
// Demo pacing: quicker than the engine's 15 s / 5 s / 10 s so the page shows the move sooner.
const WEAK_DWELL = 8, CRUSH_DWELL = 3, CALL_DWELL = 1;   // a call: one level sample under CALL_LEVEL
const CALL_LEVEL = -70;
// A hand on the phone runs in real seconds: when the change lands, and when the hand is done.
// Owner (2026-10-24): the by-hand steps on the iPhone without the tweak run HAND_PACE times slower,
// so the viewer sees how long they take. Control Center (the WifiCrush side) keeps its pace.
const HAND_PACE = 1.6;
const FLOWS = { settings: { apply: 5.6 * HAND_PACE, end: 7.2 * HAND_PACE }, toggle: { apply: 4.4 * HAND_PACE, end: 6.2 * HAND_PACE },
  cc: { apply: 3.4, end: 4.6 } };

const HOME_APS = [{ id: 'crush', name: 'ap.home5', band: 5, crush: true, range: 300 }, { id: 'n24', name: 'ap.home24', band: 2, range: 470 }];

const STORIES = [
  {
    id: 'balcony', activity: 'music', outfit: 'home', start: 'crush', beats: [0, 2, 4], aps: HOME_APS,
    route: [
      { x: 250, pause: 20, rssi: { crush: -46, n24: -42 }, say: { ios: 'start', tweak: 'start' } },
      { x: 610, rssi: { crush: -64, n24: -54 } },
      { x: 860, pause: 80, rssi: { crush: -82, n24: -61 }, say: { ios: 'stuck' }, action: { ios: { after: 1.6, run: 'pick:n24' } } },
      { x: 610, rssi: { crush: -64, n24: -54 } },
      { x: 250, pause: 60, rssi: { crush: -46, n24: -42 }, say: { ios: 'slowNet' }, action: { ios: { after: 1.6, run: 'pick:crush' } } }],
  },
  {
    id: 'outside', activity: 'music', outfit: 'home', start: 'crush', beats: [0, 2, 4], aps: HOME_APS,
    route: [
      { x: 230, pause: 20, rssi: { crush: -47, n24: -43 }, say: { ios: 'start', tweak: 'start' } },
      { x: 555, rssi: { crush: -73, n24: -66 } },
      { x: 830, pause: 130, rssi: { crush: -86, n24: -81 }, say: { ios: 'stuck' }, action: { ios: { after: 2.2, run: 'wifi:off' } } },
      { x: 555, rssi: { crush: -73, n24: -66 } },
      { x: 230, pause: 60, rssi: { crush: -47, n24: -43 }, say: { ios: 'wifiStillOff' }, action: { ios: { after: 1.6, run: 'wifi:on' } } }],
  },
  {
    id: 'call', activity: 'call', outfit: 'home', start: 'crush', beats: [0, 1, 2], aps: HOME_APS,
    route: [
      { x: 250, pause: 20, rssi: { crush: -49, n24: -45 }, say: { ios: 'startCall', tweak: 'startCall' } },
      { x: 555, rssi: { crush: -75, n24: -68 } },
      { x: 860, pause: 170, rssi: { crush: -88, n24: -85 }, say: { ios: 'stuckCall', tweak: 'stillTalking' } }],
  },
  {
    id: 'office', activity: 'office', outfit: 'office', start: 'kd', beats: [0, 2, 4],
    aps: [{ id: 'kd', name: 'ap.sales', band: 5, crush: true, range: 300 }, { id: 'ph', name: 'ap.meeting', band: 5, range: 280 },
      { id: 'kh', name: 'ap.guest', band: 2, range: 360 }],
    route: [
      { x: 250, pause: 20, need: 'kd', rssi: { kd: -46, ph: -80, kh: -66 }, say: { ios: 'startOffice', tweak: 'startOffice' } },
      { x: 520, need: 'kd', rssi: { kd: -58, ph: -70, kh: -55 } },
      { x: 780, pause: 60, need: 'ph', rssi: { kd: -64, ph: -43, kh: -67 }, say: { ios: 'wrongNet', tweak: 'wrongNet' },
        action: { tweak: { after: .4, run: 'cc:on' }, ios: { after: 1.4, run: 'pick:ph' } } },
      { x: 520, need: 'kd', rssi: { kd: -58, ph: -70, kh: -55 } },
      { x: 250, pause: 60, need: 'kd', rssi: { kd: -46, ph: -80, kh: -66 }, say: { ios: 'wrongDesk', tweak: 'wrongDesk' },
        action: { tweak: { after: .4, run: 'cc:off' }, ios: { after: 1.4, run: 'pick:kd' } } }],
  },
];

const apById = (story, id) => story.aps.find(a => a.id === id);
const crushOf = story => story.aps.find(a => a.crush);
const apName = ap => t(ap.name);
const plain = html => html.replace(/<[^>]+>/g, '');

// A caption or notice, written in the current language: { key, ap, level } from the log.
function captionText(story, entry) {
  const ap = entry.ap ? apById(story, entry.ap) : null;
  return t(entry.key, { net: ap ? apName(ap) : '', level: entry.level });
}

let noticeSeq = 0;

function createSim(story, mode) {
  const first = story.route[0];
  return {
    story, mode, t: 0, realT: 0, wp: 0, leg: 0, pauseLeft: first.pause || 0, standReal: 0, moving: false,
    x: first.x, rssi: { ...first.rssi }, need: first.need,
    connected: story.start, cell: false, gate: false, strongest: false, wifiOff: false, verifyFor: 0, verifying: false, verifyAp: null,
    probeFor: 0, probeDone: false, checkFailed: false, internetAvailable: true,
    weakFor: 0, lteFor: 0, crushFor: 0, callWeak: 0, cooldown: 0,
    inCall: story.activity === 'call', reconnect: 0, badCall: 0, dropped: false,
    quality: 'good', play: 37, noteClock: 0, log: [], notices: [], overlay: null, actionFired: false, done: false,
  };
}

function say(sim, key) {
  const ap = sim.connected;
  sim.log.push({ key, ap, level: ap ? Math.round(sim.rssi[ap]) : null });
}

// Lock-screen notice from WifiCrush: the event just logged.
function notify(sim) {
  sim.notices = [{ ...sim.log[sim.log.length - 1], id: ++noticeSeq, at: sim.realT }, ...sim.notices].slice(0, 3);
}

function join(sim, id, why) {
  if (!id || sim.connected === id) return;
  const returningFromCell = sim.mode === 'tweak' && sim.cell;
  sim.connected = id;
  // Illustrative return check: retain cellular until Wi-Fi has stayed stable for 30 sim seconds.
  sim.verifying = returningFromCell;
  sim.verifyFor = 0;
  sim.verifyAp = returningFromCell ? id : null;
  sim.probeFor = 0; sim.probeDone = false; sim.checkFailed = false;
  if (!returningFromCell) sim.cell = false;
  sim.gate = false;
  sim.weakFor = sim.lteFor = sim.crushFor = 0;
  sim.cooldown = 10;
  say(sim, returningFromCell ? 'join.verifying' : `join.${why}`);
  if (sim.mode === 'tweak' && (returningFromCell || ['best', 'crush', 'recover'].includes(why))) notify(sim);
}

function goCellular(sim, why) {
  sim.connected = null;
  sim.cell = true;
  sim.verifying = false; sim.verifyFor = 0; sim.verifyAp = null; sim.probeFor = 0; sim.probeDone = false;
  sim.gate = sim.mode === 'tweak';
  sim.weakFor = sim.lteFor = sim.callWeak = 0;
  if (sim.inCall && !sim.dropped) sim.reconnect = 2;
  say(sim, `cell.${why}`);
  if (sim.mode === 'tweak') notify(sim);
}

// Strongest of `ids` (5 GHz +6 when it matters), or null.
function strongest(sim, ids) {
  let best = null, score = -999;
  for (const id of ids) {
    const r = sim.rssi[id];
    if (r < -90) continue;
    const s = r + (apById(sim.story, id).band === 5 ? 6 : 0);
    if (s > score) { score = s; best = id; }
  }
  return best;
}

function tweakPolicy(sim, dt) {
  const story = sim.story, ids = story.aps.map(a => a.id);
  const cur = sim.connected ? sim.rssi[sim.connected] : null;
  sim.cooldown = Math.max(0, sim.cooldown - dt);
  if (sim.verifyAp) {
    if (!sim.connected || sim.connected !== sim.verifyAp || sim.wifiOff) {
      sim.verifying = false; sim.verifyFor = 0; sim.verifyAp = null;
    } else if (sim.rssi[sim.connected] < LTE + 3) {
      sim.verifying = false; sim.verifyFor = 0;
    } else {
      sim.verifying = true;
      if (sim.verifyFor < 30) {
        sim.verifyFor += dt;
        if (sim.verifyFor >= 30 - 1e-9) { sim.verifyFor = 30; say(sim, 'join.probing'); }
      } else if (!sim.probeDone) {
        sim.probeFor += dt;
        if (sim.probeFor >= 1 - 1e-9) {
          sim.probeDone = true;
          sim.checkFailed = !sim.internetAvailable;
          if (sim.checkFailed) say(sim, 'join.checkFailed');
        }
      } else if (sim.checkFailed && sim.internetAvailable) {
        // Mock input recovery retries the illustrative probe; no network request is made.
        sim.checkFailed = false; sim.probeDone = false; sim.probeFor = 0;
      }
      if (sim.probeDone && !sim.checkFailed && !sim.inCall) {
        sim.verifying = false; sim.cell = false; sim.verifyAp = null; say(sim, 'join.verified');
      }
    }
  }
  // Story 3 (beta2): on a call, Wi-Fi under the data level goes to 4G/5G at once.
  if (story.activity === 'call' && sim.inCall && !sim.dropped && sim.connected) {
    sim.callWeak = cur < CALL_LEVEL ? sim.callWeak + dt : 0;
    if (sim.callWeak >= CALL_DWELL) { goCellular(sim, 'call'); return; }
    return;                                   // "During calls": no Wi-Fi-to-Wi-Fi move mid-call
  }
  if (sim.gate) {
    if (sim.inCall && !sim.dropped) return;   // beta2: back to Wi-Fi after the call, not in the middle of it
    const crush = crushOf(story);
    if (sim.rssi[crush.id] >= Math.max(CRUSH, LTE + 3)) { join(sim, crush.id, 'recover'); return; }
    const other = strongest(sim, ids.filter(id => sim.rssi[id] >= LTE + 3));
    if (other) join(sim, other, 'recover');
    return;
  }
  if (sim.strongest || sim.cooldown > 0) return;      // strongest mode joins once, then stays
  const crush = crushOf(story);
  if (sim.connected !== crush.id && sim.rssi[crush.id] >= CRUSH) {
    sim.crushFor += dt;
    if (sim.crushFor >= CRUSH_DWELL) { join(sim, crush.id, 'crush'); return; }
  } else sim.crushFor = 0;
  if (sim.connected && cur <= WEAK) {
    sim.weakFor += dt;
    const alt = strongest(sim, ids.filter(id => id !== sim.connected && sim.rssi[id] >= cur + MARGIN && sim.rssi[id] >= WEAK + 5));
    if (sim.weakFor >= WEAK_DWELL && alt) { join(sim, alt, 'best'); return; }
    sim.lteFor = cur <= LTE ? sim.lteFor + dt : 0;
    if (sim.lteFor >= 60 && !alt) goCellular(sim, 'weak');
  } else { sim.weakFor = 0; sim.lteFor = 0; }
}

function iosPolicy(sim) {
  if (sim.wifiOff) return;
  if (sim.connected && sim.rssi[sim.connected] < -88) {
    sim.connected = null;
    sim.cell = true;
    if (sim.inCall && !sim.dropped) dropCall(sim);
    say(sim, 'cell.lost');
  }
  if (!sim.connected) {
    const pick = strongest(sim, sim.story.aps.map(a => a.id).filter(id => sim.rssi[id] >= -80));
    if (pick) join(sim, pick, 'auto');
  }
}

function dropCall(sim) {
  sim.dropped = true;
  say(sim, 'call.dropped');
}

function startOverlay(sim, action) {
  const kind = action.startsWith('cc') ? 'cc' : action.startsWith('wifi') ? 'toggle' : 'settings';
  sim.overlay = { kind, action, e: 0, applied: false };
  say(sim, `hand.${kind}`);
}

function applyAction(sim, action) {
  const [verb, arg] = action.split(':');
  if (verb === 'pick') join(sim, arg, 'manual');
  else if (verb === 'wifi' && arg === 'off') {
    sim.wifiOff = true;
    sim.verifying = false; sim.verifyFor = 0; sim.verifyAp = null; sim.probeFor = 0; sim.probeDone = false;
    sim.connected = null;
    sim.cell = true;
    say(sim, 'cell.manual');
  } else if (verb === 'wifi') {
    sim.wifiOff = false;
    sim.verifying = false; sim.verifyFor = 0; sim.verifyAp = null; sim.probeFor = 0; sim.probeDone = false;
    sim.cell = false;
    iosPolicy(sim);
  } else if (arg === 'on') {
    sim.strongest = true;
    join(sim, strongest(sim, sim.story.aps.map(a => a.id)), 'strongest');
  } else {
    sim.strongest = false;
    sim.cooldown = 0;
    join(sim, crushOf(sim.story).id, 'back');
  }
}

// Hands on the phone follow the clock on the wall, not the fast-forwarded one.
function tickOverlay(sim, dtReal) {
  const o = sim.overlay;
  if (!o) return;
  o.e += dtReal;
  const flow = FLOWS[o.kind];
  if (!o.applied && o.e >= flow.apply) { o.applied = true; applyAction(sim, o.action); }
  if (o.e >= flow.end) sim.overlay = null;
}

function quality(sim) {
  if (sim.story.activity === 'office') {
    if (!sim.connected) return 'bad';
    return sim.connected === sim.need ? 'good' : 'wrong';
  }
  if (!sim.connected) return sim.cell ? 'good' : 'bad';
  const r = sim.rssi[sim.connected];
  return r >= -65 ? 'good' : r >= -70 ? 'ok' : r >= -80 ? 'slow' : 'bad';
}

// How the music (or the call) is going: good, slow or bad; null when there is nothing to hear.
function tone(sim) {
  if (sim.story.activity === 'office' || (sim.inCall && sim.dropped)) return null;
  if (sim.inCall && sim.reconnect > 0) return 'slow';
  if (!sim.connected) return sim.cell ? 'good' : 'bad';
  return sim.quality === 'ok' ? 'good' : sim.quality;
}

function step(sim, dt) {
  if (sim.done) return;
  const route = sim.story.route;
  if (sim.pauseLeft > 0) {
    sim.moving = false;
    sim.pauseLeft -= dt;
  } else if (sim.hold) {
    sim.moving = false;                    // held at the stop after a hand on the phone (app.js)
  } else if (sim.wp < route.length - 1) {
    const a = route[sim.wp], b = route[sim.wp + 1];
    sim.leg = Math.min(1, sim.leg + dt * WALK / Math.abs(b.x - a.x));
    sim.moving = true;
    sim.x = a.x + (b.x - a.x) * sim.leg;
    for (const id in a.rssi) sim.rssi[id] = a.rssi[id] + (b.rssi[id] - a.rssi[id]) * sim.leg;
    sim.need = sim.leg < 0.5 ? a.need : b.need;
    if (sim.leg >= 1) {
      sim.wp++;
      sim.leg = 0;
      sim.pauseLeft = b.pause || 0;
      sim.standReal = 0;
      sim.actionFired = false;
      if (b.say && b.say[sim.mode]) say(sim, `say.${b.say[sim.mode]}`);
    }
  } else {
    sim.moving = false;
    if (!sim.overlay) sim.done = true;     // still busy with the phone: not over yet
  }
  if (sim.mode === 'tweak') tweakPolicy(sim, dt); else iosPolicy(sim);
  // Calls: reconnect after a cut; iOS drops a call that stays bad.
  const q = quality(sim);
  if (sim.inCall && !sim.dropped) {
    if (sim.reconnect > 0) sim.reconnect -= dt;
    sim.badCall = q === 'bad' ? sim.badCall + dt : 0;
    if (sim.mode === 'ios' && sim.badCall >= 25) dropCall(sim);
  }
  sim.quality = q;
  sim.t += dt;
}

// Standing still while nothing happens: fast-forward the wait (the 2-minute count harder).
// Walking and hands on a phone stay at normal pace. Shared, so both phones stay in step.
function warpFor(sims) {
  if (sims.some(s => s.overlay || s.moving || !(s.pauseLeft > 0))) return 1;
  return sims.some(s => s.mode === 'tweak' && s.lteFor > 0 && !s.gate) ? 12 : 3;
}

function advance(sim, dtReal, warp) {
  let left = dtReal * SPEED * warp;
  while (left > 0) { const d = Math.min(STEP, left); step(sim, d); left -= d; }
  // Picking up the phone is timed on the wall clock, from the moment the walker stops.
  const action = (sim.pauseLeft > 0 || sim.hold) && !sim.moving && sim.story.route[sim.wp].action;
  const mine = action && action[sim.mode];
  if (mine && !sim.actionFired) {
    sim.standReal += dtReal;
    if (sim.standReal >= mine.after && !sim.overlay) { sim.actionFired = true; startOverlay(sim, mine.run); }
  }
  tickOverlay(sim, dtReal);
  sim.realT += dtReal;
  if (tone(sim) === 'good') sim.play += dtReal;
}
