'use strict';
// WifiCrush landing: the scene, a side view cut through the place. One person in a pink shirt
// walks the route (owner); both phones on the right go where they go. Home stories dress them in
// a T-shirt and shorts, the office in long sleeves and trousers.

const SVGNS = 'http://www.w3.org/2000/svg';
const FLOOR = 380, CEIL = 96, PERSON = 1.3;
const SCENES = {
  balcony: {
    zones: [{ x: 40, w: 440, label: 'room.living', kind: 'indoor' }, { x: 480, w: 270, label: 'room.bedroom', kind: 'indoor' },
            { x: 750, w: 210, label: 'room.balcony', kind: 'balcony' }],
    props: [['shelf', 70], ['sofa', 250], ['bed', 560], ['railing', 750, 210], ['plant', 900]],
    routers: [{ x: 110, y: 214, ids: ['crush', 'n24'] }],
  },
  outside: {
    zones: [{ x: 40, w: 400, label: 'room.inside', kind: 'indoor' }, { x: 440, w: 230, label: 'room.yard', kind: 'yard' },
            { x: 670, w: 310, label: 'room.street', kind: 'street' }],
    props: [['shelf', 70], ['sofa', 240], ['gate', 440], ['tree', 560], ['lamp', 760], ['tree', 860]],
    routers: [{ x: 110, y: 214, ids: ['crush', 'n24'] }], tower: { x: 940 },
  },
  // Owner (2026-10-24): an important call that cannot stop, and you have to head out.
  call: {
    zones: [{ x: 40, w: 400, label: 'room.study', kind: 'indoor' }, { x: 440, w: 230, label: 'room.yard', kind: 'yard' },
            { x: 670, w: 310, label: 'room.street', kind: 'street' }],
    props: [['shelf', 70], ['desk', 250], ['gate', 440], ['tree', 560], ['lamp', 760], ['tree', 860]],
    routers: [{ x: 110, y: 214, ids: ['crush', 'n24'] }], tower: { x: 940 },
  },
  office: {
    zones: [{ x: 40, w: 400, label: 'room.sales', kind: 'indoor' }, { x: 440, w: 160, label: 'room.lobby', kind: 'indoor' },
            { x: 600, w: 360, label: 'room.meeting', kind: 'indoor' }],
    props: [['desk', 160], ['desk', 330], ['plant', 560], ['table', 720], ['tvwall', 930]],
    routers: [{ x: 210, y: CEIL + 10, ids: ['kd'], ceiling: true }, { x: 520, y: CEIL + 10, ids: ['kh'], ceiling: true },
              { x: 820, y: CEIL + 10, ids: ['ph'], ceiling: true }],
  },
};

function el(tag, attrs = {}, parent) {
  const node = document.createElementNS(SVGNS, tag);
  for (const k in attrs) node.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(node);
  return node;
}
const css = name => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
const bandVar = band => band === 5 ? '--b5' : '--b24';

function drawProp(svg, [kind, x, w]) {
  const g = el('g', { class: 'prop-art' }, svg), f = FLOOR;
  const r = (px, py, pw, ph, rx = 6) => el('rect', { x: px, y: py, width: pw, height: ph, rx }, g);
  if (kind === 'sofa') { r(x - 80, f - 46, 160, 46, 12); r(x - 80, f - 80, 160, 40, 14); r(x - 92, f - 58, 24, 58, 10); r(x + 68, f - 58, 24, 58, 10); }
  else if (kind === 'bed') { r(x - 90, f - 34, 190, 34, 8); r(x - 96, f - 74, 14, 74, 5); r(x - 78, f - 50, 52, 18, 9); }
  else if (kind === 'shelf') { r(x - 8, f - 150, 90, 8, 3); r(x + 40, f - 130, 30, 130, 4); }
  else if (kind === 'desk') { r(x - 60, f - 66, 120, 10, 4); r(x - 54, f - 56, 8, 56, 3); r(x + 46, f - 56, 8, 56, 3); r(x - 20, f - 100, 48, 32, 5); }
  else if (kind === 'table') { r(x - 90, f - 62, 180, 10, 5); r(x - 10, f - 52, 20, 52, 4); }
  else if (kind === 'tvwall') { r(x - 6, CEIL + 70, 12, 120, 4); }
  else if (kind === 'window') { r(x - 50, CEIL + 50, 100, 90, 8).setAttribute('class', 'window'); }
  else if (kind === 'plant') { r(x - 18, f - 40, 36, 40, 8); el('circle', { cx: x, cy: f - 64, r: 28 }, g); }
  else if (kind === 'railing') {
    r(x + 6, f - 98, w - 12, 8, 4);
    for (let i = x + 24; i < x + w - 10; i += 26) r(i, f - 92, 5, 92, 2);
  }
  else if (kind === 'gate') { r(x - 8, f - 120, 16, 120, 4); }
  else if (kind === 'tree') { r(x - 6, f - 80, 12, 80, 4); el('circle', { cx: x, cy: f - 118, r: 46 }, g); }
  else if (kind === 'lamp') { r(x - 4, f - 210, 8, 210, 3); r(x - 4, f - 214, 46, 8, 4); el('circle', { cx: x + 38, cy: f - 200, r: 9, class: 'lamp-light' }, g); }
  else if (kind === 'stairs') {
    const steps = 6, sw = w / steps, sh = 34;
    let d = `M${x} ${f}`;
    for (let i = 0; i < steps; i++) d += ` V${f - (i + 1) * sh} H${x + (i + 1) * sw}`;
    el('path', { d: d + ` V${f} Z` }, g);
  }
  return g;
}

// A person seen from the side, facing right (flipped when walking left). Skin first, clothes on
// top: short sleeves and shorts at home, long sleeves and trousers at the office.
function drawPerson(svg, outfit) {
  const long = outfit === 'office';
  const g = el('g', { class: `person outfit-${outfit}` }, svg);
  const flip = el('g', {}, g);
  const body = el('g', { class: 'person-bob' }, flip);
  const limb = (cls, y, len, skinW, cover, clothW, clothCls) => {
    const pivot = el('g', { transform: `translate(0 ${y})` }, body);
    const swing = el('g', { class: cls }, pivot);
    el('line', { x1: 0, y1: 0, x2: 0, y2: len, 'stroke-width': skinW, class: 'skin' }, swing);
    el('line', { x1: 0, y1: 0, x2: 0, y2: cover, 'stroke-width': clothW, class: clothCls }, swing);
    return swing;
  };
  const leg = cls => {
    const swing = limb(`leg ${cls}`, -58, 54, 10, long ? 54 : 24, 13, 'pants');
    el('rect', { x: -6, y: 50, width: 18, height: 9, rx: 4, class: 'shoe' }, swing);
  };
  const arm = cls => {
    const swing = limb(`arm ${cls}`, -104, 42, 9, long ? 38 : 14, 12, 'sleeve');
    el('circle', { cx: 0, cy: 44, r: 5, class: 'skin-fill' }, swing);
  };
  leg('back');
  arm('back');
  el('rect', { x: -4, y: -122, width: 8, height: 12, class: 'skin-fill' }, body);
  el('rect', { x: -12, y: -112, width: 24, height: long ? 58 : 54, rx: 9, class: 'shirt' }, body);
  if (long) el('path', { d: 'M-2 -111 L2 -111 L3 -86 L0 -82 L-3 -86 Z', class: 'tie' }, body);
  el('circle', { cx: 2, cy: -130, r: 14, class: 'skin-fill' }, body);
  el('path', { d: 'M-12 -128 A14 14 0 0 1 16 -132 L16 -137 A15 15 0 0 0 -13 -134 Z', class: 'hair' }, body);
  leg('front');
  // Front arm bent: phone up to look at it, or at the ear during a call.
  const bent = (cls, d, sleeve, phone) => {
    const pose = el('g', { class: cls }, body);
    el('path', { d, 'stroke-width': 9, class: 'skin', fill: 'none' }, pose);
    el('path', { d: sleeve, 'stroke-width': 12, class: 'sleeve', fill: 'none' }, pose);
    el('rect', { ...phone, rx: 3, class: 'person-phone' }, pose);
    return pose;
  };
  const look = bent('pose-look', 'M0 -104 L12 -80 L26 -94', long ? 'M0 -104 L12 -80 L22 -90' : 'M0 -104 L6 -92', { x: 22, y: -112, width: 11, height: 19 });
  const ear = bent('pose-ear', 'M0 -104 L16 -92 L12 -122', long ? 'M0 -104 L16 -92 L13 -116' : 'M0 -104 L8 -98', { x: 8, y: -146, width: 10, height: 20 });
  return { g, flip, look, ear, x: 0, dir: 1, lastX: null, bubble: null };
}

function buildMap(svg, fx, story) {
  svg.textContent = '';
  fx.textContent = '';
  const scene = SCENES[story.id];
  const defs = el('defs', {}, svg);
  for (const ap of story.aps) {
    const g = el('radialGradient', { id: `cov-${ap.id}` }, defs);
    el('stop', { offset: '0%', 'stop-color': css(bandVar(ap.band)), 'stop-opacity': .38 }, g);
    el('stop', { offset: '100%', 'stop-color': css(bandVar(ap.band)), 'stop-opacity': 0 }, g);
  }
  const clip = el('clipPath', { id: 'scene-clip' }, defs);
  el('rect', { x: 20, y: 40, width: 960, height: FLOOR - 40 }, clip);
  el('rect', { x: 0, y: 0, width: 1000, height: 440, class: 'sky' }, svg);
  for (const z of scene.zones) {
    const indoor = z.kind === 'indoor';
    el('rect', { x: z.x, y: indoor ? CEIL : 40, width: z.w, height: FLOOR - (indoor ? CEIL : 40), class: `zone ${z.kind}` }, svg);
    el('text', { x: z.x + z.w / 2, y: FLOOR + 50, class: 'room-label' }, svg).textContent = t(z.label);
  }
  el('rect', { x: 20, y: FLOOR, width: 960, height: 22, rx: 4, class: 'floor' }, svg);
  // Walls between indoor rooms, with a doorway; outer walls of the building.
  const indoor = scene.zones.filter(z => z.kind === 'indoor');
  if (indoor.length) {
    const left = indoor[0].x, right = indoor[indoor.length - 1].x + indoor[indoor.length - 1].w;
    el('line', { x1: left, y1: CEIL, x2: right, y2: CEIL, class: 'wall' }, svg);
    el('line', { x1: left, y1: CEIL, x2: left, y2: FLOOR, class: 'wall' }, svg);
    el('line', { x1: right, y1: CEIL, x2: right, y2: FLOOR - 150, class: 'wall' }, svg);
    for (const z of indoor.slice(1)) el('line', { x1: z.x, y1: CEIL, x2: z.x, y2: FLOOR - 150, class: 'wall' }, svg);
  }
  for (const p of scene.props) drawProp(svg, p);
  const coverage = el('g', { 'clip-path': 'url(#scene-clip)' }, svg);
  const refs = { coverage: {}, routers: scene.routers, tower: null, onCall: story.activity === 'call' };
  for (const router of scene.routers)
    for (const id of router.ids)
      refs.coverage[id] = el('circle', { cx: router.x, cy: router.y, r: apById(story, id).range * 1.3, fill: `url(#cov-${id})` }, coverage);
  if (scene.tower) {
    const tw = el('g', { transform: `translate(${scene.tower.x} 0)`, class: 'tower' }, svg);
    el('path', { d: `M0 ${FLOOR} L-22 ${FLOOR} L-4 120 L4 120 L22 ${FLOOR} Z`, opacity: .9 }, tw);
    for (const rr of [18, 30]) el('path', { d: `M${-rr} ${120 - rr * .6} A${rr} ${rr} 0 0 1 ${rr} ${120 - rr * .6}`, class: 'tower-wave' }, tw);
    el('text', { y: 84, class: 'ap-band tower-label' }, tw).textContent = '4G/5G';
    refs.tower = { x: scene.tower.x, y: 120 };
  }
  refs.link = el('line', { class: 'map-link' }, svg);
  for (const router of scene.routers) {
    const g = el('g', { transform: `translate(${router.x} ${router.y})` }, svg);
    const ap0 = apById(story, router.ids[0]);
    if (router.ceiling) {
      el('rect', { x: -26, y: -10, width: 52, height: 12, rx: 6, class: 'router' }, g);
      el('circle', { cx: 0, cy: 6, r: 6, fill: css(ap0.crush ? '--pink' : bandVar(ap0.band)) }, g);
    } else {
      el('line', { x1: -14, y1: -10, x2: -18, y2: -34, class: 'antenna' }, g);
      el('line', { x1: 14, y1: -10, x2: 18, y2: -34, class: 'antenna' }, g);
      el('rect', { x: -28, y: -10, width: 56, height: 20, rx: 6, class: 'router' }, g);
      el('circle', { cx: -14, cy: 0, r: 3.5, fill: css('--b5') }, g);
      el('circle', { cx: 0, cy: 0, r: 3.5, fill: css('--b24') }, g);
    }
    router.ids.forEach((id, i) => {
      const ap = apById(story, id), y = router.ceiling ? -52 : 44 + i * 46;
      const name = el('text', { y, class: 'ap-name' }, g);
      name.textContent = (ap.crush ? '♥ ' : '') + apName(ap);
      if (ap.crush) name.setAttribute('fill', css('--pink-ink'));
      el('text', { y: y + 21, class: 'ap-band', fill: css(bandVar(ap.band)) }, g).textContent = ap.band === 5 ? '5 GHz' : '2.4 GHz';
    });
  }
  const p = drawPerson(svg, story.outfit);
  p.look.style.display = refs.onCall ? 'none' : '';
  p.ear.style.display = refs.onCall ? '' : 'none';
  p.bubble = document.createElement('span');
  p.bubble.className = 'fx-bubble';
  fx.appendChild(p.bubble);
  refs.person = p;
  return refs;
}

function routerOf(refs, id) { return refs.routers.find(r => r.ids.includes(id)); }

// Where the person's phone is, in scene units: in the hand, or at the ear on a call.
function phonePoint(p, onCall) {
  const c = onCall ? [13, -136] : [27.5, -102.5];
  return { x: p.x + p.dir * c[0] * PERSON, y: FLOOR + c[1] * PERSON };
}

const pct = (x, y) => [`${x / 10}%`, `${y / 4.4}%`];

// The walker follows the WifiCrush phone (both phones walk in step); the link shows its network.
function updateMap(refs, sim, story) {
  const p = refs.person, x = sim.x;
  if (p.lastX != null && Math.abs(x - p.lastX) > .01) p.dir = x > p.lastX ? 1 : -1;
  p.lastX = x;
  p.x = x;
  p.g.setAttribute('transform', `translate(${x.toFixed(1)} ${FLOOR})`);
  p.flip.setAttribute('transform', `scale(${p.dir * PERSON} ${PERSON})`);
  p.g.classList.toggle('walking', sim.moving && !reduceMotion);
  const pt = phonePoint(p, refs.onCall);
  const target = sim.connected ? routerOf(refs, sim.connected) : sim.cell ? refs.tower : null;
  refs.link.style.display = target ? '' : 'none';
  if (target) {
    const ap = sim.connected ? apById(story, sim.connected) : null;
    refs.link.setAttribute('x1', pt.x); refs.link.setAttribute('y1', pt.y);
    refs.link.setAttribute('x2', target.x); refs.link.setAttribute('y2', target.y);
    refs.link.setAttribute('stroke', css(!ap ? '--cell' : ap.crush ? '--pink' : bandVar(ap.band)));
  }
  // Bubble beside the phone: a tapping hand in Control Center, the office check otherwise.
  let html = '', cls = '';
  if (sim.overlay) { html = '<i class="ph-fill ph-hand-tap"></i>'; cls = 'hand'; }
  else if (story.activity === 'office') {
    const ok = sim.connected === sim.need;
    html = `<i class="ph-fill ph-${sim.need === 'ph' ? 'television-simple' : 'hard-drives'}"></i><i class="ph-fill ph-${ok ? 'check' : 'x'}-circle"></i>`;
    cls = ok ? 'ok' : 'bad';
  }
  if (p.bubble.dataset.html !== html) { p.bubble.dataset.html = html; p.bubble.innerHTML = html; }
  p.bubble.className = `fx-bubble ${cls}${html ? ' on' : ''}`;
  [p.bubble.style.left, p.bubble.style.top] = pct(pt.x + p.dir * 34, pt.y);
  for (const ap of story.aps) refs.coverage[ap.id].setAttribute('opacity', sim.connected === ap.id ? 1 : .35);
}
