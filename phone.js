'use strict';
// WifiCrush landing: an iPhone 15 Pro in HTML/CSS. Inside the screen 1em = 10 pt of the real
// 393 x 852 pt display, so the Dynamic Island, status bar, Settings rows and Control Center keep
// iOS 17 proportions at any width. Rendered from the simulation every frame. The plain iPhone:
// lock screen with Now Playing, and the route by hand (unlock, Home, Settings, Wi-Fi, a row or
// the switch). The WifiCrush iPhone: the app itself (orbit, status, network card), plus Control
// Center and the WifiCrush action sheet laid out like the real one (owner's screenshot).

// Stock apps only (owner, 2026-10-24): the home screen is the iPhone without the tweak.
const HOME_APPS = [
  ['mail', 'envelope-simple', '#1a8cff'], ['calendar', 'calendar-blank', '#ff453a'], ['photos', 'flower-lotus', '#ff9f0a'], ['camera', 'camera', '#48484a'],
  ['maps', 'map-trifold', '#30b06b'], ['weather', 'cloud-sun', '#2f80ed'], ['clock', 'clock', '#1c1c1e'], ['notes', 'note-pencil', '#f5b800'],
  ['files', 'folder-simple', '#1a8cff'], ['video', 'play', '#5e5ce6'], ['appstore', 'app-store-logo', '#1a8cff'], ['settings', 'gear-six', 'linear-gradient(#a3a5aa, #6b6d72)'],
];
const DOCK_APPS = [['phone', 'phone', '#30d158'], ['messages', 'chat-circle', '#30d158'], ['browser', 'compass', '#1a8cff'], ['music', 'music-notes', '#fa2d48']];
const WIFI_GLYPH = ['none', 'low', 'medium', 'high'];
const SONG_LENGTH = 192;
const HEART = 'M12 21S2 15 2 8.5C2 2 9 1 12 6c3-5 10-4 10 2.5C22 15 12 21 12 21Z';
const BOLT = 'M14 1 3 14h8l-1 9L22 9h-9Z';
const shortName = s => [...s].length > 13 ? [...s].slice(0, 12).join('') + '…' : s;

const icon = (name, fill = true) => `<i class="ph${fill ? '-fill' : ''} ph-${name}"></i>`;
const wifiBars = r => r >= -60 ? 3 : r >= -70 ? 2 : r >= -88 ? 1 : 0;
const clock = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

function appIcon([key, glyph, bg], dock) {
  const art = icon(glyph);
  return `<span class="app" data-app="${key}"><span class="ico" style="background:${bg}">${art}</span>${dock ? '' : `<span class="lbl">${t(`app.${key}`)}</span>`}</span>`;
}

function settingsRow(key, glyph, bg, value = '', tail = '<i class="ph ph-caret-right chev"></i>') {
  return `<div class="row" data-row="${key}"><span class="sq" style="background:${bg}">${icon(glyph)}</span><span class="name">${t(`ph.${key}`)}</span><span class="val">${value}</span>${tail}</div>`;
}

function buildPhone(host) {
  host.innerHTML = `
  <span class="hw hw-action"></span><span class="hw hw-up"></span><span class="hw hw-down"></span><span class="hw hw-power"></span>
  <div class="bezel"><div class="screen" data-view="lock">
    <div class="v home">
      <div class="home-grid">${HOME_APPS.map(a => appIcon(a)).join('')}</div>
      <div class="home-search">${icon('magnifying-glass', false)}${t('ph.search')}</div>
      <div class="dock">${DOCK_APPS.map(a => appIcon(a, true)).join('')}</div>
    </div>
    <div class="v settings"><div class="pg">
      <div class="lg-title">${t('ph.settings')}</div>
      <div class="search">${icon('magnifying-glass', false)}${t('ph.search')}</div>
      <div class="grp"><div class="row profile"><span class="avatar">${icon('user')}</span><span class="name"><b>${t('ph.name')}</b><small>${t('ph.account')}</small></span><i class="ph ph-caret-right chev"></i></div></div>
      <div class="grp">
        ${settingsRow('airplane', 'airplane', '#ff9f0a', '', '<span class="sw"></span>')}
        ${settingsRow('wifi', 'wifi-high', '#0a84ff', '<span class="wifi-val"></span>')}
        ${settingsRow('bluetooth', 'bluetooth', '#0a84ff', t('ph.on'))}
        ${settingsRow('cellular', 'cell-signal-full', '#30d158')}
        ${settingsRow('hotspot', 'link', '#30d158', t('ph.off'))}
      </div>
      <div class="grp">${settingsRow('notifications', 'bell-simple', '#ff453a')}${settingsRow('sounds', 'speaker-high', '#ff375f')}${settingsRow('focus', 'moon', '#5e5ce6')}</div>
    </div></div>
    <div class="v wifi">
      <div class="navbar"><span class="back">${icon('caret-left', false)}${t('ph.settings')}</span><b>Wi-Fi</b><span class="edit">${t('ph.edit')}</span></div>
      <div class="pg">
        <div class="grp"><div class="row toggle-row"><span class="name">Wi-Fi</span><span class="sw on"></span></div><div class="cur"></div></div>
        <div class="lists"><div class="hdr">${t('ph.myNetworks')}</div><div class="grp nets"></div><div class="hdr">${t('ph.otherNetworks')}<span class="spin"></span></div></div>
      </div>
    </div>
    <div class="v call">
      <div class="call-top"><span class="call-status"></span><b>${t('ph.caller')}</b></div>
      <div class="call-grid">${['speaker-high', 'video-camera', 'microphone-slash', 'user-plus', 'phone-x', 'dots-nine'].map(g => `<span class="cbtn${g === 'phone-x' ? ' end' : ''}">${icon(g)}</span>`).join('')}</div>
    </div>
    <div class="v wc"><div class="wc-in">
      <div class="app-head"><span class="app-brand">Wifi<b>Crush</b></span><span class="app-mode"></span></div>
      <svg class="orbit-svg" viewBox="0 0 300 296"></svg>
      <div class="status"><strong></strong><span></span></div>
      <div class="net-card"><b class="net-name"></b><div class="net-chips"></div><div class="net-meter"><i></i><i></i><i></i><span></span></div></div>
    </div><div class="call-bar">${icon('phone')}<span class="call-text"></span><span class="wave"><i></i><i></i><i></i><i></i></span></div></div>
    <div class="v lock">
      <div class="lk-icon">${icon('lock-simple')}</div>
      <div class="lk-date">${t('ph.date')}</div><div class="lk-time">9:41</div>
      <div class="lk-stack"></div>
      <div class="np">
        <div class="np-top"><span class="np-art">${icon('music-notes')}</span><span class="np-meta"><b>${t('ph.song')}</b><small>${t('ph.artist')}</small></span>${icon('broadcast', false)}</div>
        <div class="np-bar"><i></i></div><div class="np-times"><span class="np-el"></span><span class="np-rem"></span></div>
        <div class="np-ctl">${icon('rewind')}<span class="np-play"></span>${icon('fast-forward')}</div>
      </div>
      <span class="lk-btn l">${icon('flashlight')}</span><span class="lk-btn r">${icon('camera')}</span>
    </div>
    <div class="sb"><span class="sb-time">9:41</span><span class="sb-r"><span class="sb-cell">${icon('cell-signal-full')}</span><span class="sb-5g">5G</span><span class="sb-wifi"></span><span class="sb-batt">${icon('battery-full')}</span></span></div>
    <div class="island"></div>
    <div class="cc"><div class="cc-grid">
      <div class="cc-mod conn"><span class="cb air">${icon('airplane')}</span><span class="cb cell on">${icon('cell-signal-full')}</span><span class="cb wifi">${icon('wifi-high')}</span><span class="cb bt on">${icon('bluetooth')}</span></div>
      <div class="cc-mod media"><span class="media-art">${icon('music-notes')}</span><b>${t('ph.song')}</b><span class="media-ctl">${icon('skip-back')}${icon('pause')}${icon('skip-forward')}</span></div>
      <span class="cc-t rot">${icon('lock-key')}</span><span class="cc-t mir">${icon('screencast', false)}</span>
      <span class="cc-sl bright"><i class="lvl"></i>${icon('sun')}</span><span class="cc-sl vol"><i class="lvl"></i>${icon('speaker-high')}</span>
      <span class="cc-focus">${icon('moon')}<b>${t('ph.focus')}</b></span>
      <span class="cc-t fl">${icon('flashlight')}</span><span class="cc-t tm">${icon('timer')}</span><span class="cc-t ca">${icon('calculator')}</span><span class="cc-t crush">${icon('heart')}</span>
    </div></div>
    <div class="sheet-dim"></div>
    <div class="sheet"><div class="sheet-card"><div class="sheet-head"><b>WifiCrush</b><span class="sheet-msg"></span></div><div class="sheet-items"></div></div><div class="sheet-cancel">${t('ph.cancel')}</div></div>
    <div class="banner"></div>
    <div class="finger"></div>
    <div class="hbar"></div>
    <div class="dimmer"></div>
  </div></div>`;
  const q = s => host.querySelector(s);
  const orbit = q('.orbit-svg'), c = { x: 150, y: 150 };
  for (const [level, cls, label] of [[-50, '', '-50'], [CRUSH, 'crush', String(CRUSH)], [LTE, 'lte', `${LTE} LTE`]]) {
    el('circle', { cx: c.x, cy: c.y, r: orbitDistance(level), class: `ring ${cls}` }, orbit);
    el('text', { x: c.x, y: c.y - orbitDistance(level) - 4, class: 'ring-label' }, orbit).textContent = label;
  }
  const link = el('line', { class: 'link', x1: c.x, y1: c.y, x2: c.x, y2: c.y }, orbit);
  el('rect', { x: c.x - 11, y: c.y - 19, width: 22, height: 38, rx: 6, class: 'phone-glyph' }, orbit);
  const cellChip = el('text', { x: c.x, y: c.y + 36, class: 'sat-sub', fill: css('--cell') }, orbit);
  return { host, q, screen: q('.screen'), finger: q('.finger'), sig: {}, lastNotice: 0, lit: null, orbit, link, cellChip, c, sats: {}, story: null };
}

// Distance from the phone in the orbit: closer = stronger (same curve as the app).
function orbitDistance(rssi) {
  const x = (-45 - Math.min(-45, Math.max(-90, rssi))) / 45;
  return 76 + 60 * Math.log(1 + 2 * x) / Math.log(3);
}

function ensureSatellites(phone, story) {
  if (phone.story === story) return;
  phone.story = story;
  for (const id in phone.sats) phone.sats[id].g.remove();
  phone.sats = {};
  let right = 0, left = 0;
  for (const ap of story.aps) {
    const angle = ap.crush ? [-35, 32][right++ % 2] : [-145, 148][left++ % 2];
    const g = el('g', { class: 'sat' }, phone.orbit);
    const halo = el('circle', { r: 17, class: 'sat-halo' }, g);
    el('path', { d: ap.crush ? HEART : BOLT, fill: css(ap.crush ? '--pink' : bandVar(ap.band)), transform: 'translate(-8.4 -8.4) scale(.7)' }, g);
    el('text', { y: 32, class: 'sat-name' }, g).textContent = shortName(apName(ap));
    const sub = el('text', { y: 44, class: 'sat-sub', fill: css(bandVar(ap.band)) }, g);
    phone.sats[ap.id] = { g, halo, sub, angle: angle * Math.PI / 180, ap };
  }
}

function statusLines(sim) {
  const ap = sim.connected ? apById(sim.story, sim.connected) : null;
  const vars = { net: ap ? apName(ap) : '', level: ap ? Math.round(sim.rssi[ap.id]) : 0, lte: LTE + 3 };
  const pick = key => [t(`wc.${key}T`, vars), t(`wc.${key}S`, vars)];
  if (sim.checkFailed) return pick('checkFailed');
  if (sim.verifying) return pick(sim.probeFor > 0 || sim.verifyFor >= 30 ? 'probing' : 'verify');
  if (sim.gate) return pick('gate');
  if (!ap) return pick(sim.cell ? 'cell' : 'none');
  if (sim.strongest) return pick('strong');
  if (sim.weakFor > 0 && vars.level <= WEAK) return pick('weak');
  return pick(ap.crush ? 'crush' : 'other');
}

function renderApp(phone, sim) {
  if (sim.mode !== 'tweak') return;
  ensureSatellites(phone, sim.story);
  let linkTo = null;
  for (const id in phone.sats) {
    const s = phone.sats[id], r = sim.rssi[id], d = orbitDistance(r);
    const x = phone.c.x + Math.cos(s.angle) * d, y = phone.c.y + Math.sin(s.angle) * d;
    s.g.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
    s.g.style.opacity = r < -90 ? 0 : 1;
    const on = sim.connected === id, color = css(s.ap.crush ? '--pink' : bandVar(s.ap.band));
    s.halo.setAttribute('stroke', on ? color : '#34403a');
    s.sub.textContent = `${s.ap.band === 5 ? '5 GHz' : '2.4 GHz'} · ${Math.round(r)}`;
    if (on) linkTo = { x, y, color };
  }
  phone.link.style.display = linkTo ? '' : 'none';
  if (linkTo) { phone.link.setAttribute('x2', linkTo.x); phone.link.setAttribute('y2', linkTo.y); phone.link.setAttribute('stroke', linkTo.color); }
  phone.cellChip.textContent = !sim.connected && sim.cell ? '4G/5G' : '';
  const [title, sub] = statusLines(sim);
  setHtml(phone, 'stT', phone.q('.status strong'), title);
  setHtml(phone, 'stS', phone.q('.status span'), sub);
  setHtml(phone, 'mode', phone.q('.app-mode'), t(sim.strongest ? 'wc.strongest' : 'wc.auto'));
  // Network card
  const ap = sim.connected ? apById(sim.story, sim.connected) : null;
  const r = ap ? Math.round(sim.rssi[ap.id]) : null;
  setHtml(phone, 'card', phone.q('.net-name'), ap ? apName(ap) : t(sim.cell ? 'wc.cellData' : 'wc.notConnected'));
  const chips = ap
    ? [[ap.band === 5 ? '5 GHz' : '2.4 GHz', ap.band === 5 ? 'b5' : 'b24'], [t('wc.connected'), 'live']].concat(ap.crush ? [[t('wc.crushChip'), 'crush']] : [])
    : sim.cell ? [['4G/5G', 'live']].concat(sim.gate ? [[t('wc.paused'), 'crush']] : []) : [];
  setHtml(phone, 'chips', phone.q('.net-chips'), chips.map(([text, cls]) => `<span class="${cls}">${text}</span>`).join(''));
  const bars = r == null ? (sim.cell ? 3 : 0) : r >= -60 ? 3 : r >= -70 ? 2 : 1;
  phone.q('.net-meter').querySelectorAll('i').forEach((i, n) => { i.className = n < bars ? `on${n + 1}` : ''; });
  setHtml(phone, 'meter', phone.q('.net-meter span'), r == null ? (sim.cell ? '4G/5G' : '')
    : `${r} dBm · ${t(r >= -60 ? 'wc.excellent' : r >= -70 ? 'wc.good' : 'wc.weak')}`);
  // On a call: the green bar at the bottom, as before.
  const bar = phone.q('.call-bar'), tn = tone(sim);
  bar.className = `call-bar${sim.story.activity === 'call' ? ' on' : ''} ${sim.dropped ? 'bad' : tn === 'good' ? '' : tn || ''}`;
  if (sim.story.activity === 'call') setHtml(phone, 'callBar', phone.q('.call-text'), sim.dropped ? t('ph.callEnded') : `${t('ph.caller')} · ${clock(83 + sim.realT)}`);
}

// Only touch the DOM when the content changes.
function setHtml(phone, key, node, html) {
  if (phone.sig[key] === html) return;
  phone.sig[key] = html;
  node.innerHTML = html;
}

// What the screen shows at this moment of a hand on the phone (real seconds since it began).
function flowUi(sim) {
  const ui = { view: sim.mode === 'tweak' ? 'wc' : sim.story.activity === 'call' ? 'call' : 'lock', finger: null, cc: false, sheet: false, tilePress: false, joining: null, dim: false };
  const o = sim.overlay;
  if (!o) return ui;
  const e = o.kind === 'cc' ? o.e : o.e / HAND_PACE;   // by hand: the same steps, slower (sim.js)
  if (o.kind === 'cc') {
    ui.cc = e >= .35 && e < 3.75;
    ui.sheet = e >= 2.4 && e < 3.45;
    ui.tilePress = e >= 1.6 && e < 2.4;
    if (e >= .12 && e < .35) ui.finger = { pt: [86, 2.5] };
    else if (e >= .35 && e < 1.15) ui.finger = { pt: [80, 40], dur: .8 };
    else if (e >= 1.35 && e < 2.45) ui.finger = { sel: '.cc-t.crush', press: e >= 1.6 };
    else if (e >= 2.75 && e < 3.4) ui.finger = { sel: '.sheet-items .si', press: e >= 3.05 && e < 3.3 };
    return ui;
  }
  // By hand: wake, swipe up, Settings, Wi-Fi, then a network row or the switch; lock again.
  const lockAt = FLOWS[o.kind].end / HAND_PACE - .8, target = o.action.slice(5);
  ui.dim = e < .25 || (e >= lockAt && e < lockAt + .35);
  ui.view = e < 1 ? 'lock' : e < 1.85 ? 'home' : e < 2.95 ? 'settings' : e < lockAt + .15 ? 'wifi' : 'lock';
  if (e >= .3 && e < .55) ui.finger = { pt: [50, 95] };
  else if (e >= .55 && e < 1) ui.finger = { pt: [50, 52], dur: .45 };
  else if (e >= 1.25 && e < 1.85) ui.finger = { sel: '.app[data-app="settings"] .ico', press: e >= 1.55 };
  else if (e >= 2.35 && e < 2.95) ui.finger = { sel: '.row[data-row="wifi"]', press: e >= 2.65, ax: .3 };
  else if (o.kind === 'toggle' && e >= 3.5 && e < 4.3) ui.finger = { sel: '.toggle-row .sw', press: e >= 3.95 };
  else if (o.kind === 'settings' && e >= 3.7 && e < 4.6) ui.finger = { sel: `.row.net[data-ap="${target}"]`, press: e >= 4.25, ax: .35 };
  if (o.kind === 'settings' && e >= 4.5 && !o.applied) ui.joining = target;
  return ui;
}

function placeFinger(phone, f) {
  const finger = phone.finger;
  const target = f && f.sel ? phone.screen.querySelector(f.sel) : null;
  const lit = f && f.press && target ? target.closest('.row, .ico, .si') : null;
  if (phone.lit !== lit) {
    if (phone.lit) phone.lit.classList.remove('lit');
    if (lit) lit.classList.add('lit');
    phone.lit = lit;
  }
  if (!f) { finger.classList.remove('on', 'press'); return; }
  const wasOn = finger.classList.contains('on');
  if (!wasOn) finger.style.transitionProperty = 'opacity, transform';     // appear in place
  finger.style.transitionDuration = f.dur ? `${f.dur}s` : '';
  if (f.pt) { finger.style.left = `${f.pt[0]}%`; finger.style.top = `${f.pt[1]}%`; }
  else if (target) {
    const point = elementPoint(target, f.ax ?? .5, .5);
    const local = pointInElement(phone.screen, point);
    finger.style.left = `${local.x * 100}%`;
    finger.style.top = `${local.y * 100}%`;
  }
  finger.classList.add('on');
  finger.classList.toggle('press', Boolean(f.press));
  if (!wasOn) requestAnimationFrame(() => { finger.style.transitionProperty = ''; });
}

// Convert the target's on-screen point through the screen's quad. Unlike bounding rectangles,
// quads preserve the axes when the stage is rotated 90 degrees on a portrait phone.
function elementPoint(element, x, y) {
  if (document.documentElement.classList.contains('phone-rot')) {
    const r = element.getBoundingClientRect();
    return { x: r.right - r.width * y, y: r.top + r.height * x };
  }
  if (element.getBoxQuads) {
    const q = element.getBoxQuads()[0];
    if (q) return { x: q.p1.x + (q.p2.x - q.p1.x) * x + (q.p4.x - q.p1.x) * y,
      y: q.p1.y + (q.p2.y - q.p1.y) * x + (q.p4.y - q.p1.y) * y };
  }
  const r = element.getBoundingClientRect();
  return { x: r.left + r.width * x, y: r.top + r.height * y };
}

function pointInElement(element, point) {
  if (document.documentElement.classList.contains('phone-rot')) {
    const r = element.getBoundingClientRect();
    return { x: (point.y - r.top) / r.height, y: 1 - (point.x - r.left) / r.width };
  }
  if (element.getBoxQuads) {
    const q = element.getBoxQuads()[0];
    if (q) {
      const ux = q.p2.x - q.p1.x, uy = q.p2.y - q.p1.y;
      const vx = q.p4.x - q.p1.x, vy = q.p4.y - q.p1.y;
      const px = point.x - q.p1.x, py = point.y - q.p1.y;
      const det = ux * vy - uy * vx;
      if (Math.abs(det) > 1e-8) return { x: (px * vy - py * vx) / det, y: (ux * py - uy * px) / det };
    }
  }
  const r = element.getBoundingClientRect();
  return { x: (point.x - r.left) / r.width, y: (point.y - r.top) / r.height };
}

function renderLock(phone, sim) {
  const notices = sim.notices.slice(0, 2);
  const key = `${notices.map(n => n.id).join(',')}|${LANG}`;
  if (phone.sig.stack !== key) {
    phone.sig.stack = key;
    phone.q('.lk-stack').innerHTML = notices.map(n => `<div class="ntf${n.id > phone.lastNotice ? ' in' : ''}"><img src="assets/app-icon.png" alt=""><div class="ntf-text"><p><b>WifiCrush</b><span>${t('ph.now')}</span></p><span>${plain(captionText(sim.story, n))}</span></div></div>`).join('');
    if (notices.length) phone.lastNotice = Math.max(phone.lastNotice, notices[0].id);
  }
  const played = sim.play % SONG_LENGTH;
  phone.q('.np-bar i').style.width = `${played / SONG_LENGTH * 100}%`;
  setHtml(phone, 'npEl', phone.q('.np-el'), clock(played));
  setHtml(phone, 'npRem', phone.q('.np-rem'), `-${clock(SONG_LENGTH - played)}`);
  setHtml(phone, 'npPlay', phone.q('.np-play'), tone(sim) === 'good' ? icon('pause') : '<span class="spin"></span>');
}

function renderSettings(phone, sim, ui) {
  const story = sim.story;
  const cur = sim.connected && !sim.wifiOff ? apById(story, sim.connected) : null;
  setHtml(phone, 'wval', phone.q('.wifi-val'), sim.wifiOff ? t('ph.off') : cur ? apName(cur) : t('ph.notConnected'));
  phone.q('.toggle-row .sw').classList.toggle('on', !sim.wifiOff);
  phone.q('.v.wifi').classList.toggle('off', sim.wifiOff);
  const row = (ap, mark) => `<div class="row net" data-ap="${ap.id}"><span class="ck">${mark}</span><span class="name">${apName(ap)}</span>${icon('lock-simple')}${icon(`wifi-${WIFI_GLYPH[wifiBars(sim.rssi[ap.id])]}`)}<i class="ph ph-info info"></i></div>`;
  setHtml(phone, 'cur', phone.q('.cur'), cur ? row(cur, '<i class="ph ph-check"></i>') : '');
  const others = story.aps.filter(a => a !== cur && sim.rssi[a.id] >= -90);
  setHtml(phone, 'nets', phone.q('.nets'), others.map(a => row(a, ui.joining === a.id ? '<span class="spin"></span>' : '')).join(''));
}

function renderCall(phone, sim) {
  if (sim.story.activity !== 'call') return;
  const status = sim.dropped ? t('ph.callEnded') : sim.reconnect > 0 ? t('ph.reconnecting')
    : sim.connected && ['slow', 'bad'].includes(sim.quality) ? t('ph.poor') : `${sim.connected ? 'Wi-Fi' : '5G'} · ${clock(83 + sim.realT)}`;
  setHtml(phone, 'callStatus', phone.q('.call-status'), status);
  phone.q('.v.call').classList.toggle('ended', sim.dropped);
  // During a call a WifiCrush notice drops in as a banner for a few seconds.
  const n = sim.notices[0];
  phone.q('.banner').classList.toggle('on', Boolean(n && sim.realT - n.at < 3.5));
  if (n) setHtml(phone, 'banner', phone.q('.banner'), `<img src="assets/app-icon.png" alt=""><div class="ntf-text"><p><b>WifiCrush</b><span>${t('ph.now')}</span></p><span>${plain(captionText(sim.story, n))}</span></div>`);
}

function renderCc(phone, sim, ui) {
  phone.q('.cc').classList.toggle('on', ui.cc);
  phone.q('.cb.wifi').classList.toggle('on', !sim.gate && !sim.wifiOff);
  const tile = phone.q('.cc-t.crush');
  tile.classList.toggle('on', sim.strongest);
  tile.classList.toggle('press', ui.tilePress);
  phone.q('.sheet').classList.toggle('on', ui.sheet);
  phone.q('.sheet-dim').classList.toggle('on', ui.sheet);
  if (!ui.cc) return;
  const story = sim.story, cur = sim.connected ? apById(story, sim.connected) : null;
  setHtml(phone, 'sheetMsg', phone.q('.sheet-msg'), cur ? t('ph.connectedTo', { net: apName(cur) }) : t('ph.notOnWifi'));
  const nets = story.aps.filter(a => sim.rssi[a.id] >= -90).sort((a, b) => sim.rssi[b.id] - sim.rssi[a.id]);
  setHtml(phone, 'sheetItems', phone.q('.sheet-items'), `<div class="si">${t(sim.strongest ? 'ph.strongOff' : 'ph.strongOn')}</div>`
    + nets.map(a => `<div class="si${a === cur ? ' dis' : ''}">${apName(a)} (${Math.round(sim.rssi[a.id])} dBm · ${a.band === 5 ? '5.0' : '2.4'} GHz)</div>`).join(''));
}

function renderPhone(phone, sim) {
  const ui = flowUi(sim), screen = phone.screen;
  if (screen.dataset.view !== ui.view) screen.dataset.view = ui.view;
  screen.classList.toggle('music', sim.story.activity === 'music');
  phone.q('.dimmer').classList.toggle('on', ui.dim);
  // Status bar: Wi-Fi bars, or the 5G label when on cellular, as iOS does.
  const bars = sim.connected ? wifiBars(sim.rssi[sim.connected]) : 0;
  setHtml(phone, 'sbWifi', phone.q('.sb-wifi'), sim.connected ? icon(`wifi-${WIFI_GLYPH[bars]}`) : '');
  phone.q('.sb-5g').classList.toggle('on', !sim.connected && sim.cell);
  if (sim.mode === 'tweak') renderApp(phone, sim);
  else { renderLock(phone, sim); renderSettings(phone, sim, ui); renderCall(phone, sim); }
  renderCc(phone, sim, ui);
  placeFinger(phone, ui.finger);
}
