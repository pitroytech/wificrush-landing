'use strict';
// WifiCrush landing: page wiring. One person walks each story with two phones; each phone shows
// what it would show, notes rise from it while music plays, the speed above it is illustrative,
// and the panel under the scene tells the story beat by beat. English by default, Vietnamese one
// tap away.

const state = { story: STORIES[0], sims: null, refs: null, playing: false, last: 0, shown: {}, beat: -1, afterHand: 0 };
const mapSvg = document.getElementById('map');
const sceneFx = document.getElementById('scene-fx');
const hosts = { ios: document.getElementById('phone-ios'), tweak: document.getElementById('phone-tweak') };
const captions = { ios: document.getElementById('caption-ios'), tweak: document.getElementById('caption-tweak') };
const speeds = { ios: document.getElementById('speed-ios'), tweak: document.getElementById('speed-tweak') };
const playButton = document.getElementById('play');
const explainBox = document.getElementById('explain');
const tabs = document.getElementById('story-tabs');
const heroHost = document.getElementById('hero-phone');
let phones = {};
const hero = { phone: null, sim: null };

// Illustrative download speed (owner, 2026-10-23): it belongs to the network and its level, so
// two phones on the same network at the same spot show the same narrow range, and the gap
// appears only when one of them moves (crush 5G close: 100-110; weak 5G on the balcony: ~10;
// the 2.4G there: 40-50). Redrawn every ~0.6 s within the range. Not a measurement.
const SPEED_TABLE = {
  5: [[-55, 100, 110], [-63, 70, 80], [-70, 40, 50], [-76, 18, 24], [-84, 8, 12], [-88, 1, 3], [-200, 0, .5]],
  2: [[-55, 50, 60], [-65, 40, 50], [-72, 25, 32], [-78, 10, 15], [-84, 3, 6], [-200, .5, 1.5]],
};
const CELL_SPEED = [35, 45];

function speedRange(sim) {
  if (sim.inCall && sim.dropped) return [0, 0];
  if (!sim.connected) return sim.cell ? CELL_SPEED : [0, 0];
  const r = sim.rssi[sim.connected], band = apById(sim.story, sim.connected).band === 5 ? 5 : 2;
  const row = SPEED_TABLE[band].find(([level]) => r >= level);
  return [row[1], row[2]];
}

function renderSpeed(node, sim, force) {
  const now = performance.now();
  if (!force && now - (node._at || 0) < 600) return;
  node._at = now;
  const [lo, hi] = speedRange(sim);
  const v = lo + Math.random() * (hi - lo);
  node.querySelector('b').textContent = v >= 10 ? Math.round(v) : v >= 1 ? v.toFixed(1) : v.toFixed(2);
  node.dataset.tone = v >= 30 ? 'good' : v >= 5 ? 'slow' : 'bad';
}

// The phone on the clearly faster network glows gold (owner). Same range on both: no winner.
function markWinner() {
  const mid = sim => { const [lo, hi] = speedRange(sim); return (lo + hi) / 2; };
  const ios = mid(state.sims.ios), tweak = mid(state.sims.tweak);
  speeds.ios.classList.toggle('winner', ios > tweak * 1.5 + 1);
  speeds.tweak.classList.toggle('winner', tweak > ios * 1.5 + 1);
}

// Owner (2026-10-24): after a hand on the phone, stay at that spot so the change can be seen:
// at least SETTLE real seconds, and on until both phones show the same speed (SETTLE_MAX at most).
const SETTLE = 3, SETTLE_MAX = 10;
function holdAtStop(sims, dtReal) {
  const { ios, tweak } = sims;
  const stop = tweak.story.route[tweak.wp];
  if (!stop.action || ios.moving || tweak.moving || ios.wp !== tweak.wp) { state.afterHand = 0; return false; }
  const pending = MODES.some(m => stop.action[m] && !sims[m].actionFired);
  if (pending || ios.overlay || tweak.overlay) { state.afterHand = 0; return true; }
  state.afterHand += dtReal;
  const a = speedRange(ios), b = speedRange(tweak);
  const same = a[0] === b[0] && a[1] === b[1];
  return state.afterHand < SETTLE || (!same && state.afterHand < SETTLE_MAX);
}

function renderTabs() {
  tabs.innerHTML = STORIES.map(s => `<button class="story-tab" role="tab" data-story="${s.id}" aria-selected="${s === state.story}"><strong>${t(`story.${s.id}.title`)}</strong><span>${t(`story.${s.id}.blurb`)}</span>${s.soon ? `<span class="soon">${t('soon')}</span>` : ''}</button>`).join('');
}

function renderExplain() {
  const { id, beats } = state.story;
  explainBox.innerHTML = `<p class="explain-lead">${t(`ex.${id}.lead`)}</p><ol class="beats">${beats.map((wp, i) => `<li>${t(`ex.${id}.b${i}`)}</li>`).join('')}</ol>`;
  state.beat = -1;
}

// The beat follows the WifiCrush walker: the room they have reached.
function updateBeat() {
  const wp = state.sims.tweak.wp;
  const i = state.story.beats.reduce((at, b, n) => (wp >= b ? n : at), 0);
  if (i === state.beat) return;
  state.beat = i;
  explainBox.querySelectorAll('.beats li').forEach((li, n) => li.classList.toggle('on', n === i));
}

// Notes rising from each phone (owner): smooth = many, quick, fading high; slow = fewer, halting
// and shaking midway; almost no network = a rare grey note that barely moves. Sound waves on a
// call, nothing in the office or while the hand is busy with the phone.
const NOTE_MOTION = {
  good: { every: .32, duration: 1200, frames: dx => [
    { transform: 'translate(0, 0) scale(.6)', opacity: 0 }, { offset: .15, opacity: 1 },
    { transform: `translate(${dx}px, -150px) scale(1.1)`, opacity: 0 }] },
  slow: { every: .9, duration: 2600, frames: dx => [
    { transform: 'translate(0, 0) scale(.7)', opacity: 0 }, { offset: .15, transform: `translate(${dx * .25}px, -26px)`, opacity: 1 },
    { offset: .35, transform: `translate(${dx * .3 + 3}px, -34px)` }, { offset: .45, transform: `translate(${dx * .3 - 3}px, -33px)` },
    { offset: .55, transform: `translate(${dx * .3 + 2}px, -34px)` }, { offset: .8, transform: `translate(${dx * .45}px, -58px)`, opacity: .8 },
    { transform: `translate(${dx * .5}px, -62px)`, opacity: 0 }] },
  bad: { every: 1.8, duration: 1800, frames: dx => [
    { transform: 'translate(0, 0) scale(.7)', opacity: 0 }, { offset: .2, transform: `translate(${dx * .1}px, -10px)`, opacity: .9 },
    { offset: .45, transform: `translate(${dx * .1 + 3}px, -14px)` }, { offset: .6, transform: `translate(${dx * .1 - 3}px, -12px)` },
    { transform: `translate(${dx * .1}px, -16px)`, opacity: 0 }] },
};

function spawnNotes(mode, sim, dtReal) {
  if (reduceMotion || sim.overlay) return;
  const tn = tone(sim);
  if (!tn) return;
  const motion = NOTE_MOTION[tn];
  sim.noteClock += dtReal;
  if (sim.noteClock < motion.every) return;
  sim.noteClock = 0;
  const note = document.createElement('i');
  const glyph = sim.inCall ? 'ph-fill ph-waveform' : ['ph-fill ph-music-note', 'ph-fill ph-music-notes', 'ph-fill ph-music-note-simple'][Math.floor(Math.random() * 3)];
  note.className = `note ${tn} ${glyph}`;
  note.style.left = `${30 + Math.random() * 40}%`;
  document.getElementById(`notes-${mode}`).appendChild(note);
  const run = note.animate(motion.frames((Math.random() - .5) * 70), { duration: motion.duration, easing: tn === 'good' ? 'cubic-bezier(.2,.7,.3,1)' : 'linear', fill: 'forwards' });
  run.onfinish = () => note.remove();
}

function loadStory(story) {
  state.story = story;
  state.sims = { ios: createSim(story, 'ios'), tweak: createSim(story, 'tweak') };
  const first = story.route[0].say;
  for (const mode of MODES) if (first && first[mode]) say(state.sims[mode], `say.${first[mode]}`);
  state.refs = buildMap(mapSvg, sceneFx, story);
  state.shown = {};
  for (const mode of MODES) document.getElementById(`notes-${mode}`).textContent = '';
  tabs.querySelectorAll('.story-tab').forEach(b => b.setAttribute('aria-selected', String(b.dataset.story === story.id)));
  renderExplain();
  renderStageTitle();
  render(true);
}

// The story's name over the scene (shown on iPhone, where the tabs are off screen).
function renderStageTitle() {
  const n = STORIES.indexOf(state.story) + 1;
  document.getElementById('stage-title').innerHTML = `${t(`story.${state.story.id}.title`)}<small>${t('storyOf', { n, total: STORIES.length })}</small>`;
}

function render(force = false) {
  const { sims, story } = state;
  updateMap(state.refs, sims.tweak, story);
  for (const mode of MODES) {
    const sim = sims[mode];
    renderPhone(phones[mode], sim);
    renderSpeed(speeds[mode], sim, force);
    const key = `${sim.log.length}|${LANG}`;
    if (state.shown[mode] !== key) {
      state.shown[mode] = key;
      const last = sim.log[sim.log.length - 1];
      captions[mode].innerHTML = last ? captionText(story, last) : '';
    }
  }
  markWinner();
  updateBeat();
  if (sims.ios.done && sims.tweak.done && state.playing) setPlaying(false, true);
}

function setPlaying(on, finished = false) {
  state.playing = on;
  state.finished = finished;
  // Owner (2026-10-24): only play or pause here; replay has its own button. Play at the end starts over.
  playButton.innerHTML = on ? '<i class="ph-fill ph-pause"></i>' : '<i class="ph-fill ph-play"></i>';
  playButton.setAttribute('aria-label', t(on ? 'pause' : 'play'));
}

function frame(now) {
  const dtReal = Math.min(.05, (now - state.last) / 1000 || 0);
  state.last = now;
  const sims = state.sims;
  if (state.playing && sims && !(sims.ios.done && sims.tweak.done)) {
    const hold = holdAtStop(sims, dtReal);
    for (const mode of MODES) sims[mode].hold = hold;
    const warp = warpFor([sims.ios, sims.tweak]);
    for (const mode of MODES) advance(sims[mode], dtReal, warp);
    render();
    for (const mode of MODES) spawnNotes(mode, sims[mode], dtReal);
  }
  if (hero.sim) tickHero(dtReal);
  requestAnimationFrame(frame);
}

// Hero: the balcony story, WifiCrush side, looping quietly on the lock screen.
function startHero() { hero.sim = createSim(STORIES[0], 'tweak'); renderPhone(hero.phone, hero.sim); }
function tickHero(dtReal) {
  if (reduceMotion) return;
  advance(hero.sim, dtReal, warpFor([hero.sim]));
  if (hero.sim.done) startHero();
  renderPhone(hero.phone, hero.sim);
}

function buildPhones() {
  for (const mode of MODES) {
    phones[mode] = buildPhone(hosts[mode]);
    if (state.sims) phones[mode].lastNotice = state.sims[mode].notices.length ? state.sims[mode].notices[0].id : 0;
  }
  hero.phone = buildPhone(heroHost);
  if (hero.sim) hero.phone.lastNotice = noticeSeq;
}

// Switching language keeps the story where it is; only the words are redrawn.
function setLang(lang) {
  if (!(lang in STRINGS) || lang === LANG) return;
  LANG = lang;
  saveLang(lang);
  applyStatic();
  renderTabs();
  setPlaying(state.playing, state.finished);
  buildPhones();
  state.refs = buildMap(mapSvg, sceneFx, state.story);
  state.shown = {};
  renderExplain();
  renderStageTitle();
  render(true);
  if (hero.sim) renderPhone(hero.phone, hero.sim);
}

function drawRings() {
  const svg = document.getElementById('rings');
  const c = 180, scale = 1.12;
  for (const [level, color, label] of [[LTE, '--cell', `${LTE} dBm · 4G/5G`], [CRUSH, '--pink', `${CRUSH} dBm · crush`], [-50, '--wall', '-50 dBm']]) {
    const r = orbitDistance(level) * scale;
    // Colours as var(): iOS Safari can read empty custom properties this early (owner's iPhone, 2026-10-24),
    // and var() also follows the light/dark switch.
    el('circle', { cx: c, cy: c, r, fill: 'none', style: `stroke: var(${color})`, 'stroke-width': 2, 'stroke-dasharray': '3 7' }, svg);
    el('text', { x: c, y: c - r - 8, 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 700, style: `fill: var(${color === '--wall' ? '--label' : color})` }, svg).textContent = label;
  }
  el('rect', { x: c - 14, y: c - 24, width: 28, height: 48, rx: 8, style: 'fill: var(--surface); stroke: var(--ink)', 'stroke-width': 2.5 }, svg);
}

tabs.addEventListener('click', e => {
  const b = e.target.closest('.story-tab');
  if (!b) return;
  loadStory(STORIES.find(s => s.id === b.dataset.story));
  setPlaying(true);
});
playButton.addEventListener('click', () => {
  if (state.sims.ios.done && state.sims.tweak.done) { loadStory(state.story); setPlaying(true); return; }
  setPlaying(!state.playing);
});
document.getElementById('replay').addEventListener('click', () => { loadStory(state.story); setPlaying(true); });
document.querySelectorAll('[data-lang]').forEach(b => b.addEventListener('click', () => setLang(b.dataset.lang)));

LANG = initialLang();
applyStatic();
renderTabs();
buildPhones();
loadStory(STORIES[0]);
setPlaying(false);
startHero();
drawRings();
requestAnimationFrame(frame);

// iPhone (owner, 2026-10-24): the stage is laid out sideways; upright it is drawn turned (style.css).
const phoneUpright = matchMedia('(orientation: portrait) and (max-width: 600px)');
const phoneSideways = matchMedia('(orientation: landscape) and (max-height: 520px)');
function fitPhone() {
  const root = document.documentElement;
  root.classList.toggle('phone-wide', phoneUpright.matches || phoneSideways.matches);
  root.classList.toggle('phone-rot', phoneUpright.matches);
}
fitPhone();
addEventListener('resize', fitPhone);          // some browsers skip the media change event
for (const query of [phoneUpright, phoneSideways]) query.addEventListener('change', e => {
  fitPhone();
  if (!e.matches) return;
  const frame = document.querySelector('.stage-frame'), box = frame.getBoundingClientRect();
  if (box.bottom > 0 && box.top < innerHeight * 2) frame.scrollIntoView({ block: 'start' });   // near the stories: bring it on
});
function stepStory(by) {
  const i = (STORIES.indexOf(state.story) + by + STORIES.length) % STORIES.length;
  loadStory(STORIES[i]);
  setPlaying(true);
}
document.getElementById('prev-story').addEventListener('click', () => stepStory(-1));
document.getElementById('next-story').addEventListener('click', () => stepStory(1));

// Autoplay only when the stage is on screen.
let seen = false;
new IntersectionObserver(entries => {
  for (const entry of entries) {
    if (entry.isIntersecting && !seen && !reduceMotion) { seen = true; loadStory(state.story); setPlaying(true); }
    else if (!entry.isIntersecting && state.playing) setPlaying(false);
  }
}, { threshold: .25 }).observe(document.querySelector('.stage-frame'));
