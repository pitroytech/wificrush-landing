/* Canvas 2.5D scenery adapted from marketing/video/video.html.
   The landing simulation owns the clock and network state. No global Canvas patches. */
(() => {
'use strict';
const C = {
  bg0: '#0e1211', bg1: '#151b18', card: '#1b2320', text: '#e7ede9', sub: '#97a59d', line: '#2a3430',
  pink: '#cf4f6a', pinkL: '#e36d86', b5: '#3d7db3', b5L: '#6ea6d8', b24: '#b9842a', b24L: '#d7a64d',
  cell: '#2c8a66', cellL: '#4fbf92', bad: '#c94a5c', badL: '#e2687a', gold: '#f5c542', r72: '#5bb0d8', good: '#5fbf8a',
};

const font = (g,w,s) => { g.font = `${w} ${s}px "Be Vietnam Pro", sans-serif`; };
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const eIO = t => { t = clamp(t); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
const eOut = t => 1 - Math.pow(1 - clamp(t), 3);
const eBack = t => { t = clamp(t); const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
const ss = (a, b, t) => { t = clamp((t - a) / (b - a)); return t * t * (3 - 2 * t); };
const win = (t, a, b, fi = .35, fo = .35) => Math.min(ss(a, a + fi, t), 1 - ss(b - fo, b, t));
const frac = x => x - Math.floor(x);
const hash = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
function hexA(hex, a) { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; }
const shadeCache = new Map();
function shade(hex, k) {
  const key = hex + k; if (shadeCache.has(key)) return shadeCache.get(key);
  const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  const tgt = k > 0 ? 255 : 0, a = Math.abs(k);
  r = Math.round(r + (tgt - r) * a); g = Math.round(g + (tgt - g) * a); b = Math.round(b + (tgt - b) * a);
  const out = `rgb(${r},${g},${b})`; shadeCache.set(key, out); return out;
}
// Local rounded path supports Safari on iOS 15 without changing Canvas prototypes.
function roundedPath(g, x, y, w, h, r) {
  r = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
  g.moveTo(x + r, y); g.lineTo(x + w - r, y);
  g.arcTo(x + w, y, x + w, y + r, r);
  g.lineTo(x + w, y + h - r); g.arcTo(x + w, y + h, x + w - r, y + h, r);
  g.lineTo(x + r, y + h); g.arcTo(x, y + h, x, y + h - r, r);
  g.lineTo(x, y + r); g.arcTo(x, y, x + r, y, r); g.closePath();
}
function rr(g, x, y, w, h, r) { g.beginPath(); roundedPath(g, x, y, w, h, r); }
function poly(g, pts, fill, stroke, lw = 1) {
  g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]); g.closePath();
  if (fill) { g.fillStyle = fill; g.fill(); } if (stroke) { g.strokeStyle = stroke; g.lineWidth = lw; g.stroke(); }
}
function heartPath(g, x, y, s) { // centred heart, width ~2s
  g.beginPath(); g.moveTo(x, y + s * 0.95);
  g.bezierCurveTo(x - s * 1.45, y + s * 0.05, x - s * 1.0, y - s * 1.05, x, y - s * 0.38);
  g.bezierCurveTo(x + s * 1.0, y - s * 1.05, x + s * 1.45, y + s * 0.05, x, y + s * 0.95); g.closePath();
}
function boltPath(g, x, y, s) {
  g.beginPath(); g.moveTo(x + .25 * s, y - s); g.lineTo(x - .45 * s, y + .12 * s); g.lineTo(x - .02 * s, y + .12 * s);
  g.lineTo(x - .22 * s, y + s); g.lineTo(x + .48 * s, y - .18 * s); g.lineTo(x + .04 * s, y - .18 * s); g.closePath();
}
function wifiGlyph(g, x, y, s, col, lit = 3, dim = 'rgba(255,255,255,.25)') { // centre bottom at x,y
  g.save(); g.lineCap = 'round';
  for (let i = 0; i < 3; i++) {
    const r = s * (0.38 + i * 0.36);
    g.beginPath(); g.arc(x, y, r, -Math.PI * .75, -Math.PI * .25); g.strokeStyle = i < lit ? col : dim; g.lineWidth = s * 0.2; g.stroke();
  }
  g.beginPath(); g.arc(x, y - s * 0.02, s * 0.11, 0, 7); g.fillStyle = lit > 0 ? col : dim; g.fill(); g.restore();
}
function barsGlyph(g, x, y, s, n, col, dim = 'rgba(255,255,255,.22)', of = 3) { // bottom-left x,y
  for (let i = 0; i < of; i++) { const h = s * (0.35 + 0.65 * (i + 1) / of); rr(g, x + i * s * 0.42, y - h, s * 0.28, h, s * 0.08); g.fillStyle = i < n ? col : dim; g.fill(); }
}
function arrowDown(g, x, y, s, col) { g.save(); g.strokeStyle = col; g.lineWidth = s * .16; g.lineCap = 'round'; g.lineJoin = 'round';
  g.beginPath(); g.moveTo(x, y - s * .5); g.lineTo(x, y + s * .45); g.moveTo(x - s * .35, y + s * .1); g.lineTo(x, y + s * .45); g.lineTo(x + s * .35, y + s * .1); g.stroke(); g.restore(); }
function check(g, x, y, s, col, lw = 2.4) { g.save(); g.strokeStyle = col; g.lineWidth = lw; g.lineCap = 'round'; g.lineJoin = 'round';
  g.beginPath(); g.moveTo(x - s * .5, y); g.lineTo(x - s * .12, y + s * .38); g.lineTo(x + s * .55, y - s * .4); g.stroke(); g.restore(); }
function wrapLines(g, text, maxW) {
  const words = text.split(' '), lines = []; let cur = '';
  for (const w of words) { const tryS = cur ? cur + ' ' + w : w; if (g.measureText(tryS).width > maxW && cur) { lines.push(cur); cur = w; } else cur = tryS; }
  if (cur) lines.push(cur); return lines;
}
function makeCam(cx, cy, s, yaw, sp = 0.55) {
  const c = Math.cos(yaw), sn = Math.sin(yaw), cp = Math.sqrt(1 - sp * sp);
  return {
    s, c, sn, sp, cp, cx, cy,
    P(x, y, z = 0) { return [cx + s * (x * c - y * sn), cy + s * sp * (x * sn + y * c) - s * cp * z]; },
    D(x, y, z = 0) { return x * sn + y * c + z * 0.02; },
    plane(g, z = 0) { g.setTransform(s * c, s * sp * sn, -s * sn, s * sp * c, cx, cy - s * cp * z); },
  };
}
// quad on the front (+y) face of a wall at y, from x0..x1, z0..z1
function frontQuad(cam, y, x0, x1, z0, z1) { const P = cam.P; return [P(x0, y, z0), P(x1, y, z0), P(x1, y, z1), P(x0, y, z1)]; }


// =============================================================================
// Maps (world units; landing page x / 50). Walk line at y = 3.3.
// =============================================================================
const WALK_Y = 3.3;
const MAPS = {
  balcony: {
    zones: [{ x0: 0.8, x1: 9.6, kind: 'indoor', label: 'Living room' }, { x0: 9.6, x1: 15, kind: 'indoor2', label: 'Bedroom' }, { x0: 15, x1: 19.4, kind: 'balcony', label: 'Balcony' }],
    walls: { back: [[0.8, 15]], left: 0.8, parts: [9.6, 15] },
    windows: [[4.6, 7.4], [11.2, 13.6]], frames: [[2.6, 1.5], [8.2, 1.6]],
    props: [['shelf', 1.3], ['rug', 3.8, 7.6], ['sofa', 4.2], ['floorlamp', 8.4], ['bed', 10.5], ['night', 14.2], ['railing', 15, 19.4], ['plant', 18.6], ['chair', 16.4]],
    router: { x: 2.2, y: 0.32, z: 1.07 }, lights: [[8.4, 1.0, 3.2], [12.3, 1.2, 2.6]],
  },
  outside: {
    zones: [{ x0: 0.8, x1: 8.8, kind: 'indoor', label: 'Inside' }, { x0: 8.8, x1: 13.2, kind: 'yard', label: 'Yard' }, { x0: 13.2, x1: 22.5, kind: 'street', label: 'Street' }],
    walls: { back: [[0.8, 8.8]], left: 0.8, parts: [8.8] },
    windows: [[4.2, 7.0]], frames: [[2.6, 1.5]],
    props: [['shelf', 1.3], ['rug', 3.4, 7.2], ['sofa', 3.9], ['floorlamp', 7.8], ['fence', 13.2], ['tree', 10.4, 1.2], ['bush', 12.2, 5.4], ['lamp', 15.4], ['tree', 18.2, 0.9], ['bench', 19.6]],
    router: { x: 2.2, y: 0.32, z: 1.07 }, tower: { x: 21.2, y: 0.9 }, lights: [[7.8, 1.0, 3.0]],
  },
  call: {
    zones: [{ x0: 0.8, x1: 8.8, kind: 'indoor', label: 'Study' }, { x0: 8.8, x1: 13.2, kind: 'yard', label: 'Yard' }, { x0: 13.2, x1: 22.5, kind: 'street', label: 'Street' }],
    walls: { back: [[0.8, 8.8]], left: 0.8, parts: [8.8] },
    windows: [[6.0, 8.2]], frames: [[5.0, 1.6]],
    props: [['shelf', 1.3], ['rug', 3.2, 6.6], ['desk', 3.7], ['chair', 4.9], ['plant', 7.9], ['fence', 13.2], ['tree', 10.4, 1.2], ['bush', 12.2, 5.4], ['lamp', 15.4], ['tree', 18.2, 0.9], ['bench', 19.6]],
    router: { x: 2.2, y: 0.32, z: 1.07 }, tower: { x: 21.2, y: 0.9 }, lights: [[4.9, 1.1, 2.6]],
  },
  office: {
    zones: [{ x0: 0.8, x1: 8.8, kind: 'office', label: 'Sales' }, { x0: 8.8, x1: 12, kind: 'office2', label: 'Lobby' }, { x0: 12, x1: 19.4, kind: 'office', label: 'Meeting room' }],
    walls: { back: [[0.8, 19.4]], left: 0.8, parts: [8.8, 12] },
    windows: [], frames: [[10.4, 1.5]],
    props: [['desk', 2.1], ['chair', 3.3], ['desk', 5.6], ['chair', 6.8], ['plant', 10.9], ['sofa2', 9.2], ['table', 13.4], ['tv', 17.2], ['plant', 18.9]],
    aps: { kd: { x: 4.6 }, kh: { x: 10.4 }, ph: { x: 16.2 } }, lights: [[4.4, 1.4, 3.6], [15.4, 1.4, 3.6]],
  },
};
const ZONE_COL = { indoor: '#2d2822', indoor2: '#2b2529', balcony: '#27322e', yard: '#203024', street: '#1b1f21', office: '#252c2b', office2: '#272d2a' };

function box(g, cam, x, y, z, w, d, h, col, opt = {}) {
  const P = cam.P;
  const top = [P(x, y, z + h), P(x + w, y, z + h), P(x + w, y + d, z + h), P(x, y + d, z + h)];
  const fr = [P(x, y + d, z), P(x + w, y + d, z), P(x + w, y + d, z + h), P(x, y + d, z + h)];
  const rt = [P(x + w, y, z), P(x + w, y + d, z), P(x + w, y + d, z + h), P(x + w, y, z + h)];
  if (h * cam.s > 6) {
    let lg = g.createLinearGradient(fr[3][0], fr[3][1], fr[0][0], fr[0][1]);
    lg.addColorStop(0, shade(col, -0.12)); lg.addColorStop(1, shade(col, -0.34)); poly(g, fr, lg);
    lg = g.createLinearGradient(rt[3][0], rt[3][1], rt[0][0], rt[0][1]);
    lg.addColorStop(0, shade(col, -0.30)); lg.addColorStop(1, shade(col, -0.50)); poly(g, rt, lg);
  } else { poly(g, fr, shade(col, -0.22)); poly(g, rt, shade(col, -0.38)); }
  poly(g, top, opt.top || shade(col, 0.08));
  if (opt.edge !== false) { g.beginPath(); g.moveTo(...top[3]); g.lineTo(...top[2]); g.lineTo(...top[1]); g.strokeStyle = 'rgba(255,255,255,.09)'; g.lineWidth = 1; g.stroke(); }
}
function ball(g, c, r, c0, c1) {
  const rg = g.createRadialGradient(c[0] - r * .35, c[1] - r * .4, r * .1, c[0], c[1], r); rg.addColorStop(0, c0); rg.addColorStop(1, c1);
  g.fillStyle = rg; g.beginPath(); g.arc(c[0], c[1], r, 0, 7); g.fill();
}

// =============================================================================
// Diorama
// =============================================================================
function apPos(S, M, id) {
  if (M.router) return { x: M.router.x, y: M.router.y + 0.1, z: M.router.z + 0.25 };
  return { x: M.aps[id].x, y: 0.2, z: 2.15 };
}
function bandCol(b, light = true) { return b === 5 ? (light ? C.b5L : C.b5) : (light ? C.b24L : C.b24); }
function netCol(S, st) { if (!st.net) return st.cell ? C.cellL : C.badL; return S.aps[st.net].crush ? C.pinkL : bandCol(S.aps[st.net].band); }

const DIO = { x0: 30, x1: 970, y0: 100, y1: 460 };
function drawDiorama(g, S, t, wc, ios) {
  const M = MAPS[S.map];
  const w = walkerX(S, t);
  const prog = clamp(t / S.dur);
  const yaw = 0.30;
  const xmax = M.zones[M.zones.length - 1].x1;
  const base = makeCam(0, 0, 1, yaw);
  const pts = [[0.4, 0, 2.6], [xmax, 0, 2.6], [xmax, 6.2, 0], [0.4, 6.2, 0], [0.4, 0, 0]].map(p => base.P(...p));
  if (M.tower) pts.push(base.P(M.tower.x, M.tower.y, 7.8));
  const bx0 = Math.min(...pts.map(p => p[0])), bx1 = Math.max(...pts.map(p => p[0]));
  const by0 = Math.min(...pts.map(p => p[1])), by1 = Math.max(...pts.map(p => p[1]));
  const A = DIO;
  let s = Math.min((A.x1 - A.x0) / (bx1 - bx0), (A.y1 - A.y0) / (by1 - by0));
  // Fixed camera keeps position comparisons readable.
  let cx = (A.x0 + A.x1) / 2 - s * (bx0 + bx1) / 2, cy = (A.y0 + A.y1) / 2 - s * (by0 + by1) / 2;
  const wp = makeCam(cx, cy, s, yaw).P(w.x, WALK_Y, 0);
  
  const cam = makeCam(cx, cy, s, yaw);
  const P = cam.P;

  // collect objects first (props also report floor shadows)
  const objs = [], shadows = [], rugs = [];
  const add = (d, fn) => objs.push({ d, fn });
  const fp = (x, y, w2, d2, a = 0.5) => shadows.push([x, y, w2, d2, a]);
  for (const p of M.props) addProp(add, fp, rugs, g, cam, p, t, S, wc);

  // ground
  g.save(); cam.plane(g, -0.26);
  const gr = g.createRadialGradient(xmax / 2, 3, 1, xmax / 2, 3, xmax * 0.85);
  gr.addColorStop(0, 'rgba(40,52,47,.55)'); gr.addColorStop(1, 'rgba(14,18,17,0)');
  g.fillStyle = gr; g.fillRect(-12, -10, xmax + 24, 26);
  g.strokeStyle = 'rgba(151,165,157,.05)'; g.lineWidth = 0.02;
  for (let gx = -8; gx <= xmax + 8; gx += 1) { g.beginPath(); g.moveTo(gx, -6); g.lineTo(gx, 13); g.stroke(); }
  for (let gy = -6; gy <= 13; gy += 1) { g.beginPath(); g.moveTo(-8, gy); g.lineTo(xmax + 8, gy); g.stroke(); }
  // soft shadow of the whole lot
  for (let i = 0; i < 6; i++) { const e = i * 0.12; g.fillStyle = 'rgba(0,0,0,.09)'; rr(g, 0.9 - e, 0.5 - e, xmax - 0.2 + 2 * e, 6.3 + 2 * e, 0.3 + e); g.fill(); }
  g.restore(); g.setTransform(1, 0, 0, 1, 0, 0);

  // floor slabs
  for (const z of M.zones) box(g, cam, z.x0, 0, -0.26, z.x1 - z.x0, 6.2, 0.26, ZONE_COL[z.kind], { edge: true });
  g.save(); cam.plane(g, 0.001);
  for (const z of M.zones) {
    g.save(); g.beginPath(); g.rect(z.x0, 0, z.x1 - z.x0, 6.2); g.clip();
    if (z.kind === 'indoor' || z.kind === 'indoor2') { g.strokeStyle = 'rgba(255,240,220,.04)'; g.lineWidth = 0.025; for (let yy = 0.4; yy < 6.2; yy += 0.4) { g.beginPath(); g.moveTo(z.x0, yy); g.lineTo(z.x1, yy); g.stroke(); }
      for (let i = 0; i < 40; i++) { const yy = Math.floor(hash(i * 1.7 + z.x0) * 15) * 0.4, xx = z.x0 + hash(i * 3.3 + z.x0) * (z.x1 - z.x0); g.fillStyle = 'rgba(0,0,0,.08)'; g.fillRect(xx, yy, 0.03, 0.4); } }
    if (z.kind === 'balcony' || z.kind === 'office' || z.kind === 'office2') { g.strokeStyle = 'rgba(255,255,255,.04)'; g.lineWidth = 0.02; for (let xx = z.x0; xx < z.x1; xx += 0.8) { g.beginPath(); g.moveTo(xx, 0); g.lineTo(xx, 6.2); g.stroke(); } for (let yy = 0; yy < 6.2; yy += 0.8) { g.beginPath(); g.moveTo(z.x0, yy); g.lineTo(z.x1, yy); g.stroke(); } }
    if (z.kind === 'yard') { for (let i = 0; i < 160; i++) { const xx = z.x0 + hash(i * 3.1) * (z.x1 - z.x0), yy = hash(i * 7.7) * 6.2; g.fillStyle = `rgba(${110 + hash(i) * 40},190,130,${0.06 + hash(i * 2.2) * 0.07})`; g.fillRect(xx, yy, 0.05, 0.12); }
      g.fillStyle = 'rgba(200,190,170,.08)'; for (let i = 0; i < 6; i++) { g.beginPath(); g.ellipse(z.x0 + 0.5 + i * 0.75, WALK_Y + (i % 2 ? .12 : -.1), 0.3, 0.22, 0, 0, 7); g.fill(); } }
    if (z.kind === 'street') { g.fillStyle = '#23292b'; g.fillRect(z.x0, 0, z.x1 - z.x0, 1.4); g.fillStyle = 'rgba(255,255,255,.05)'; for (let xx = z.x0; xx < z.x1; xx += 0.7) g.fillRect(xx, 0, 0.02, 1.4);
      g.fillStyle = 'rgba(255,255,255,.07)'; g.fillRect(z.x0, 1.4, z.x1 - z.x0, 0.07);
      g.fillStyle = 'rgba(230,220,190,.2)'; for (let xx = z.x0 + 0.6; xx < z.x1; xx += 1.6) g.fillRect(xx, 4.7, 0.8, 0.09); }
    g.restore();
  }
  for (const [x0, x1, y0, y1, col] of rugs) {
    rr(g, x0, y0, x1 - x0, y1 - y0, 0.25); g.fillStyle = col; g.fill();
    g.strokeStyle = 'rgba(255,255,255,.08)'; g.lineWidth = 0.04; rr(g, x0 + 0.15, y0 + 0.15, x1 - x0 - 0.3, y1 - y0 - 0.3, 0.18); g.stroke();
  }
  // window light and lamp pools
  for (const [a, b] of M.windows) { const lg = g.createLinearGradient(0, 0, 0, 2.6); lg.addColorStop(0, 'rgba(150,190,220,.10)'); lg.addColorStop(1, 'rgba(150,190,220,0)');
    g.fillStyle = lg; g.beginPath(); g.moveTo(a, 0); g.lineTo(b, 0); g.lineTo(b + 0.9, 2.6); g.lineTo(a + 0.9, 2.6); g.closePath(); g.fill(); }
  for (const [lx, ly, lr] of M.lights || []) { const rg = g.createRadialGradient(lx, ly, 0.1, lx, ly, lr); rg.addColorStop(0, 'rgba(255,205,140,.16)'); rg.addColorStop(1, 'rgba(255,205,140,0)'); g.fillStyle = rg; g.beginPath(); g.arc(lx, ly, lr, 0, 7); g.fill(); }
  // contact shadows
  g.filter = `blur(${Math.max(2, cam.s * 0.08)}px)`; g.beginPath();
  for (const [x, y, w2, d2] of shadows) roundedPath(g, x + 0.05, y + 0.05, w2 + 0.1, d2 + 0.1, 0.1);
  g.fillStyle = 'rgba(0,0,0,.42)'; g.fill(); g.filter = 'none';
  // coverage, clipped to the lot
  g.beginPath(); g.rect(-2.5, -2.2, xmax + 5, 10.5); g.clip();
  const apIds = Object.keys(S.aps);
  for (const id of apIds) {
    const ap = S.aps[id], pos = apPos(S, M, id), col = bandCol(ap.band, false);
    const R = id === 'n24' ? 12.5 : (M.router ? 8.2 : 5.6);
    const gr2 = g.createRadialGradient(pos.x, pos.y, 0.2, pos.x, pos.y, R);
    gr2.addColorStop(0, hexA(col, 0.26)); gr2.addColorStop(0.55, hexA(col, 0.08)); gr2.addColorStop(1, hexA(col, 0));
    g.fillStyle = gr2; g.beginPath(); g.arc(pos.x, pos.y, R, 0, 7); g.fill();
    for (let k = 0; k < 3; k++) { const ph = frac(t * 0.38 + k / 3 + (ap.band === 2 ? 0.17 : 0)); g.strokeStyle = hexA(bandCol(ap.band), 0.22 * (1 - ph)); g.lineWidth = 0.05; g.beginPath(); g.arc(pos.x, pos.y, 0.4 + ph * R * 0.9, 0, 7); g.stroke(); }
  }
  for (const ring of S.rings) {
    const pos = apPos(S, M, ring.ap), xr = xAtLevel(S, ring.ap, ring.level);
    const R = Math.hypot(xr - pos.x, WALK_Y - pos.y);
    g.setLineDash([0.22, 0.16]); g.strokeStyle = hexA(ring.col, 0.8); g.lineWidth = 0.055; g.beginPath(); g.arc(pos.x, pos.y, R, 0, 7); g.stroke(); g.setLineDash([]);
    ring._R = R; ring._pos = pos;
  }
  g.restore(); g.setTransform(1, 0, 0, 1, 0, 0);

  // walls
  const WH = 2.5, WT = 0.14, WALL = '#3a4843';
  for (const [x0, x1] of M.walls.back) add(-1, () => {
    box(g, cam, x0 - WT, -WT, 0, x1 - x0 + WT, WT, WH, WALL);
    poly(g, frontQuad(cam, 0.002, x0, x1, 0, 0.09), 'rgba(0,0,0,.25)');
    for (const [a, b] of M.windows) { const q = frontQuad(cam, 0.003, a, b, 0.95, 2.05); const [p0, , , p3] = q;
      const lg = g.createLinearGradient(p3[0], p3[1], p0[0], p0[1]); lg.addColorStop(0, '#44606f'); lg.addColorStop(1, '#22323a');
      poly(g, q, lg, 'rgba(255,255,255,.16)', 2); poly(g, frontQuad(cam, 0.004, (a + b) / 2 - 0.03, (a + b) / 2 + 0.03, 0.95, 2.05), 'rgba(255,255,255,.14)');
      poly(g, frontQuad(cam, 0.004, a + 0.1, a + 0.5, 1.5, 2.0), 'rgba(255,255,255,.05)'); }
    for (const [fx, fw] of M.frames || []) { const q = frontQuad(cam, 0.004, fx, fx + fw, 1.3, 1.95); const lg = g.createLinearGradient(q[3][0], q[3][1], q[1][0], q[1][1]);
      lg.addColorStop(0, '#7d4558'); lg.addColorStop(0.5, '#3d7db3'); lg.addColorStop(1, '#b9842a'); poly(g, q, '#d9d2c4'); poly(g, frontQuad(cam, 0.005, fx + 0.07, fx + fw - 0.07, 1.36, 1.89), lg); }
  });
  add(-2, () => { box(g, cam, M.walls.left - WT, -WT, 0, WT, 6.2 + WT, WH, WALL); });
  for (const xp of M.walls.parts) add(cam.D(xp, 1.1) - 0.5, () => box(g, cam, xp - WT / 2, 0, 0, WT, 2.15, WH, WALL));
  if (M.router) { const r = M.router; add(cam.D(r.x, r.y, r.z), () => drawRouter(g, cam, r.x, r.y, r.z, t)); }
  if (M.aps) for (const id in M.aps) { const a = M.aps[id]; add(cam.D(a.x, 0.1, 2.1), () => drawWallAP(g, cam, a.x, S.aps[id], t)); }
  if (M.tower) add(cam.D(M.tower.x, M.tower.y), () => drawTower(g, cam, M.tower.x, M.tower.y, t));
  add(cam.D(w.x, WALK_Y) + 0.2, () => drawWalker(g, cam, w.x, WALK_Y, t, w.moving, w.dir, S.map === 'office', wc, S));
  objs.sort((a, b) => a.d - b.d); for (const o of objs) o.fn();

  // signal beams to the phone in the walker's hand
  const hand = P(w.x + 0.24 * w.dir, WALK_Y + 0.05, 1.42);
  drawBeam(g, cam, S, M, wc, hand, t, true);
  // Only the WifiCrush connection is drawn in the shared location scene.

  // labels
  for (const z of M.zones) { const q = P((z.x0 + z.x1) / 2, 6.0, 0); font(g, 600, 15); g.letterSpacing = '2px'; g.textAlign = 'center'; g.fillStyle = '#becbc4'; g.fillText(z.label.toUpperCase(), q[0], q[1] + 22); g.letterSpacing = '0px'; }
  if (M.router) { const r = M.router, q = P(r.x, r.y, r.z + 1.35); apTags(g, q[0], q[1], apIds.map(id => S.aps[id]), wc, S); }
  if (M.aps) for (const id in M.aps) { const q = P(M.aps[id].x, 0.1, 2.95); apTags(g, q[0], q[1], [S.aps[id]], wc, S); }
  if (M.tower) { const q = P(M.tower.x, M.tower.y, 7.3); pill(g, q[0], q[1], '5G', C.cellL, 'rgba(44,138,102,.22)'); }
  for (const ring of S.rings) {
    const a = 0.25; const p = P(ring._pos.x + Math.cos(a) * ring._R, ring._pos.y + Math.sin(a) * ring._R, 0);
    font(g, 600, 15); g.textAlign = 'left'; const tw = g.measureText(ring.label).width;
    rr(g, p[0] + 8, p[1] - 15, tw + 20, 28, 14); g.fillStyle = 'rgba(14,18,17,.85)'; g.fill(); g.strokeStyle = hexA(ring.col, .6); g.lineWidth = 1.2; g.stroke();
    g.fillStyle = ring.col; g.fillText(ring.label, p[0] + 18, p[1] + 5);
  }
  return cam;
}

function pill(g, x, y, text, col, bg, dot) {
  font(g, 600, 16); const tw = g.measureText(text).width, pw = tw + 26 + (dot ? 16 : 0);
  rr(g, x - pw / 2, y - 16, pw, 32, 16); g.fillStyle = bg; g.fill(); g.strokeStyle = hexA('#ffffff', .08); g.lineWidth = 1; g.stroke();
  g.textAlign = 'left'; g.fillStyle = col; g.fillText(text, x - pw / 2 + 13 + (dot ? 16 : 0), y + 6);
  if (dot) dot(x - pw / 2 + 18, y);
  return pw;
}
function apTags(g, x, y, aps, wc, S) {
  aps.forEach((ap, i) => {
    const yy = y - (aps.length - 1 - i) * 38;
    const col = ap.crush ? C.pinkL : bandCol(ap.band);
    pill(g, x, yy, ap.name, C.text, 'rgba(20,26,24,.9)', (dx, dy) => {
      if (ap.crush) { heartPath(g, dx, dy, 6.5); g.fillStyle = C.pinkL; g.fill(); }
      else { g.beginPath(); g.arc(dx, dy, 5, 0, 7); g.fillStyle = col; g.fill(); }
    });
    if (ap.crush) { font(g, 600, 16); const tw = g.measureText(ap.name).width; g.beginPath(); g.arc(x + (tw + 42) / 2 + 12, yy, 4.5, 0, 7); g.fillStyle = bandCol(ap.band); g.fill(); }
  });
}
function drawRouter(g, cam, x, y, z, t) {
  box(g, cam, x - 0.42, y - 0.18, z, 0.84, 0.36, 0.13, '#d8dfdb');
  const P = cam.P; g.strokeStyle = '#c9d1cd'; g.lineWidth = 3; g.lineCap = 'round';
  for (const dx of [-0.3, 0.3]) { const a = P(x + dx, y, z + 0.13), b = P(x + dx * 1.25, y - 0.05, z + 0.62); g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.stroke(); }
  for (let i = 0; i < 4; i++) { const p = P(x - 0.25 + i * 0.14, y + 0.18, z + 0.065); g.beginPath(); g.arc(p[0], p[1], 2.2, 0, 7); g.fillStyle = (i === 1 && Math.sin(t * 9) > 0) ? '#6fe3a6' : '#4fbf92'; g.fill(); }
}
function drawWallAP(g, cam, x, ap, t) {
  const P = cam.P; const c = P(x, 0.06, 2.1);
  g.save(); g.translate(c[0], c[1]); g.scale(1, 0.92);
  const rg = g.createRadialGradient(-6, -6, 2, 0, 0, 24); rg.addColorStop(0, '#f1f4f2'); rg.addColorStop(1, '#b9c2be');
  g.beginPath(); g.ellipse(0, 0, 24, 24, 0, 0, 7); g.fillStyle = rg; g.fill();
  g.beginPath(); g.ellipse(0, 0, 18, 18, 0, 0, 7); g.strokeStyle = 'rgba(0,0,0,.12)'; g.lineWidth = 2; g.stroke();
  g.beginPath(); g.arc(0, 0, 5, 0, 7); g.fillStyle = ap.crush ? C.pinkL : bandCol(ap.band); g.fill(); g.restore();
}
function drawTower(g, cam, x, y, t) {
  const P = cam.P, h = 6.6; const top = P(x, y, h);
  const legs = [[-0.6, -0.6], [0.6, -0.6], [0.6, 0.6], [-0.6, 0.6]].map(([dx, dy]) => P(x + dx, y + dy, 0));
  g.strokeStyle = '#6a7873'; g.lineWidth = 2.5; for (const l of legs) { g.beginPath(); g.moveTo(...l); g.lineTo(...top); g.stroke(); }
  for (let k = 1; k < 6; k++) { const f = k / 6; const ring = [[-0.6, -0.6], [0.6, -0.6], [0.6, 0.6], [-0.6, 0.6]].map(([dx, dy]) => P(x + dx * (1 - f), y + dy * (1 - f), h * f)); poly(g, ring, null, 'rgba(106,120,115,.6)', 1.2);
    g.beginPath(); g.moveTo(...ring[0]); g.lineTo(...P(x + 0.6 * (1 - f + 1 / 6), y + 0.6 * (1 - f + 1 / 6), h * (f - 1 / 6))); g.stroke(); }
  for (const dx of [-0.25, 0.25]) { const p = P(x + dx, y + 0.2, h - 0.9); rr(g, p[0] - 4, p[1] - 14, 8, 22, 3); g.fillStyle = '#8d9c96'; g.fill(); }
  for (let k = 0; k < 3; k++) { const ph = frac(t * 0.6 + k / 3), r = 18 + ph * 70; g.strokeStyle = hexA(C.cellL, 0.5 * (1 - ph)); g.lineWidth = 3;
    g.beginPath(); g.arc(top[0], top[1], r, -Math.PI * 0.85, -Math.PI * 0.15); g.stroke(); }
  g.beginPath(); g.arc(top[0], top[1], 5, 0, 7); g.fillStyle = C.cellL; g.fill();
  if (Math.sin(t * 3) > 0.6) { g.beginPath(); g.arc(top[0], top[1] - 8, 3, 0, 7); g.fillStyle = '#ff6b6b'; g.fill(); }
}
function addProp(add, fp, rugs, g, cam, p, t, S, wc) {
  const [k, x, extra] = p, P = cam.P;
  if (k === 'rug') { rugs.push([x, extra, 1.85, 3.05, 'rgba(120,70,85,.28)']); return; }
  if (k === 'shelf') { fp(x, 0.04, 1.8, 0.5); add(cam.D(x, 0.3) - 0.3, () => { box(g, cam, x, 0.04, 0, 1.8, 0.5, 1.05, '#4f4134'); box(g, cam, x + 0.1, 0.1, 0.55, 0.3, 0.3, 0.32, '#6b5847'); for (let i = 0; i < 5; i++) box(g, cam, x + 1.0 + i * 0.12, 0.12, 1.05, 0.08, 0.28, 0.3 + hash(i) * 0.15, ['#cf4f6a', '#3d7db3', '#b9842a', '#5fbf8a', '#97a59d'][i], { edge: false }); }); }
  else if (k === 'sofa') { fp(x, 0.45, 3.4, 1.25); add(cam.D(x + 1.6, 1.2), () => { box(g, cam, x, 0.45, 0, 3.4, 1.25, 0.45, '#3f5571'); box(g, cam, x, 0.45, 0.45, 3.4, 0.32, 0.5, '#46607f'); box(g, cam, x - 0.05, 0.45, 0.45, 0.32, 1.25, 0.25, '#405877'); box(g, cam, x + 3.13, 0.45, 0.45, 0.32, 1.25, 0.25, '#405877');
    box(g, cam, x + 0.4, 0.8, 0.45, 1.25, 0.8, 0.1, '#4a6688'); box(g, cam, x + 1.75, 0.8, 0.45, 1.25, 0.8, 0.1, '#4a6688'); box(g, cam, x + 0.55, 0.82, 0.55, 0.6, 0.2, 0.35, '#cf4f6a'); }); }
  else if (k === 'sofa2') { fp(x, 0.45, 2.2, 1.0); add(cam.D(x + 1, 1.0), () => { box(g, cam, x, 0.45, 0, 2.2, 1.0, 0.42, '#5a5048'); box(g, cam, x, 0.45, 0.42, 2.2, 0.28, 0.42, '#655a51'); }); }
  else if (k === 'bed') { fp(x, 0.3, 3.6, 2.0); add(cam.D(x + 1.7, 1.2), () => { box(g, cam, x, 0.3, 0, 3.6, 2.0, 0.42, '#3b3442'); box(g, cam, x, 0.3, 0, 0.18, 2.0, 1.05, '#4a4152'); box(g, cam, x + 0.25, 0.45, 0.42, 0.7, 1.7, 0.16, '#d6dcd8'); box(g, cam, x + 1.1, 0.32, 0.42, 2.45, 1.96, 0.14, '#8a4a60'); }); }
  else if (k === 'night') { fp(x, 0.3, 0.6, 0.6); add(cam.D(x + 0.3, 0.6), () => { box(g, cam, x, 0.3, 0, 0.6, 0.6, 0.55, '#4f4134'); box(g, cam, x + 0.2, 0.45, 0.55, 0.2, 0.2, 0.25, '#d9d2c4'); const c = P(x + 0.3, 0.55, 0.95);
    const lg = g.createRadialGradient(c[0], c[1], 1, c[0], c[1], cam.s * 1.2); lg.addColorStop(0, 'rgba(255,214,150,.35)'); lg.addColorStop(1, 'rgba(255,214,150,0)'); g.fillStyle = lg; g.beginPath(); g.arc(c[0], c[1], cam.s * 1.2, 0, 7); g.fill(); }); }
  else if (k === 'floorlamp') { fp(x - 0.2, 0.6, 0.4, 0.4, 0.35); add(cam.D(x, 0.8), () => { box(g, cam, x - 0.2, 0.6, 0, 0.4, 0.4, 0.05, '#2b2b2b'); box(g, cam, x - 0.03, 0.77, 0.05, 0.06, 0.06, 1.6, '#2b2b2b', { edge: false });
    box(g, cam, x - 0.25, 0.55, 1.6, 0.5, 0.5, 0.4, '#e9dcc3'); const c = P(x, 0.8, 1.7); const lg = g.createRadialGradient(c[0], c[1], 1, c[0], c[1], cam.s * 1.8); lg.addColorStop(0, 'rgba(255,214,150,.38)'); lg.addColorStop(1, 'rgba(255,214,150,0)'); g.fillStyle = lg; g.beginPath(); g.arc(c[0], c[1], cam.s * 1.8, 0, 7); g.fill(); }); }
  else if (k === 'chair') { fp(x, 1.75, 0.6, 0.6, 0.35); add(cam.D(x + 0.3, 2.0), () => { for (const [dx, dy] of [[0.05, 1.8], [0.5, 1.8], [0.05, 2.25], [0.5, 2.25]]) box(g, cam, x + dx, dy, 0, 0.05, 0.05, 0.45, '#222', { edge: false }); box(g, cam, x, 1.75, 0.45, 0.6, 0.6, 0.08, '#41535c'); box(g, cam, x, 1.75, 0.53, 0.6, 0.08, 0.5, '#41535c'); }); }
  else if (k === 'desk') { fp(x, 0.55, 2.5, 1.15, 0.35); add(cam.D(x + 1.2, 1.2), () => {
    for (const [dx, dy] of [[0.08, 0.6], [2.3, 0.6], [0.08, 1.6], [2.3, 1.6]]) box(g, cam, x + dx, dy, 0, 0.09, 0.09, 0.74, '#2e2924', { edge: false });
    box(g, cam, x, 0.55, 0.74, 2.5, 1.15, 0.07, '#6a5642');
    box(g, cam, x + 0.8, 0.7, 0.81, 0.9, 0.08, 0.62, '#1a1d1c'); const q = frontQuad(cam, 0.79, x + 0.85, x + 1.65, 0.87, 1.38);
    const sg = g.createLinearGradient(q[3][0], q[3][1], q[1][0], q[1][1]); sg.addColorStop(0, '#2c5c7a'); sg.addColorStop(1, '#1d2f3a'); poly(g, q, sg); box(g, cam, x + 0.9, 1.2, 0.81, 0.7, 0.25, 0.03, '#2a2e2d'); }); }
  else if (k === 'table') { fp(x, 0.7, 3.8, 1.45, 0.35); add(cam.D(x + 1.8, 1.4), () => { box(g, cam, x + 1.6, 1.05, 0, 0.25, 0.25, 0.72, '#2e2924', { edge: false }); box(g, cam, x, 0.7, 0.72, 3.8, 1.45, 0.08, '#6a5642');
    for (const dx of [0.4, 1.5, 2.6]) box(g, cam, x + dx, 0.2, 0, 0.55, 0.45, 0.48, '#3a4542'); }); }
  else if (k === 'tv') add(-0.5, () => { box(g, cam, x, 0.02, 0.9, 2.0, 0.08, 1.15, '#121514'); const on = wc.net === 'ph';
    const q = frontQuad(cam, 0.105, x + 0.07, x + 1.93, 0.96, 1.99); const sg = g.createLinearGradient(q[3][0], q[3][1], q[1][0], q[1][1]);
    sg.addColorStop(0, on ? '#2f5f86' : '#1b2226'); sg.addColorStop(1, on ? '#1f3b55' : '#151a1d'); poly(g, q, sg);
    if (on) { const c = cam.P(x + 1.0, 0.11, 1.48); g.save(); g.globalAlpha = 0.9; g.strokeStyle = '#cfe3f3'; g.lineWidth = 2.5; rr(g, c[0] - 16, c[1] - 12, 32, 22, 3); g.stroke(); g.beginPath(); g.moveTo(c[0] - 8, c[1] + 16); g.lineTo(c[0], c[1] + 6); g.lineTo(c[0] + 8, c[1] + 16); g.closePath(); g.fillStyle = '#cfe3f3'; g.fill(); g.restore(); } });
  else if (k === 'plant') { fp(x - 0.25, 0.65, 0.5, 0.5); add(cam.D(x, 0.9), () => { box(g, cam, x - 0.25, 0.65, 0, 0.5, 0.5, 0.5, '#7a6450'); const c = P(x, 0.9, 1.05), r = cam.s * 0.5;
    ball(g, [c[0] - r * .35, c[1] + r * .1], r * .75, '#4f9a6c', '#245239'); ball(g, [c[0] + r * .35, c[1] + r * .05], r * .7, '#57a675', '#245239'); ball(g, [c[0], c[1] - r * .35], r * .8, '#5fb07e', '#2a5c40'); }); }
  else if (k === 'railing') { const x1 = extra; add(cam.D((x + x1) / 2, 6.1), () => { for (let xx = x + 0.3; xx < x1; xx += 0.42) box(g, cam, xx, 6.0, 0, 0.06, 0.06, 1.0, '#8a9893', { edge: false }); box(g, cam, x, 5.98, 1.0, x1 - x, 0.12, 0.08, '#a8b5af'); });
    add(cam.D(x1, 3), () => { for (let yy = 0.2; yy < 6.1; yy += 0.42) box(g, cam, x1 - 0.06, yy, 0, 0.06, 0.06, 1.0, '#8a9893', { edge: false }); box(g, cam, x1 - 0.1, 0, 1.0, 0.12, 6.1, 0.08, '#a8b5af'); }); }
  else if (k === 'fence') { add(cam.D(x, 1.2), () => { for (let yy = 0.1; yy < 2.5; yy += 0.36) box(g, cam, x - 0.04, yy, 0, 0.08, 0.08, 1.05, '#7a6a58', { edge: false }); box(g, cam, x - 0.05, 0.05, 0.8, 0.1, 2.5, 0.07, '#8b7a66'); box(g, cam, x - 0.12, 2.45, 0, 0.24, 0.24, 1.5, '#9aa49f'); });
    add(cam.D(x, 5.2), () => { box(g, cam, x - 0.12, 4.1, 0, 0.24, 0.24, 1.5, '#9aa49f'); for (let yy = 4.45; yy < 6.2; yy += 0.36) box(g, cam, x - 0.04, yy, 0, 0.08, 0.08, 1.05, '#7a6a58', { edge: false }); box(g, cam, x - 0.05, 4.3, 0.8, 0.1, 1.9, 0.07, '#8b7a66');
      box(g, cam, x - 0.04, 4.15, 0.12, 1.1, 0.06, 0.9, '#665848'); }); }
  else if (k === 'tree') { const ty = extra; fp(x - 1.0, ty - 0.6, 2.0, 1.4, 0.35); add(cam.D(x, ty), () => { box(g, cam, x - 0.13, ty - 0.13, 0, 0.26, 0.26, 1.7, '#5a4634'); const c = P(x, ty, 2.55); const r = cam.s * 1.1;
    ball(g, [c[0] - r * .45, c[1] + r * .2], r * .75, '#3f7a52', '#1c3d2b'); ball(g, [c[0] + r * .45, c[1] + r * .15], r * .7, '#448357', '#1c3d2b'); ball(g, [c[0], c[1] - r * .25], r * .85, '#529866', '#22472f'); }); }
  else if (k === 'bush') { const by = extra; add(cam.D(x, by), () => { const c = P(x, by, 0.35), r = cam.s * 0.45; ball(g, [c[0] - r * .6, c[1]], r * .8, '#3f7a52', '#1c3d2b'); ball(g, [c[0] + r * .5, c[1] + 2], r * .75, '#448357', '#1c3d2b'); ball(g, [c[0], c[1] - r * .3], r * .85, '#4d915f', '#22472f'); }); }
  else if (k === 'bench') { fp(x, 0.3, 1.6, 0.5, 0.35); add(cam.D(x, 0.5), () => { box(g, cam, x + 0.1, 0.35, 0, 0.08, 0.4, 0.42, '#333', { edge: false }); box(g, cam, x + 1.4, 0.35, 0, 0.08, 0.4, 0.42, '#333', { edge: false }); box(g, cam, x, 0.3, 0.42, 1.6, 0.5, 0.06, '#7b6a58'); box(g, cam, x, 0.3, 0.48, 1.6, 0.06, 0.4, '#7b6a58'); }); }
  else if (k === 'lamp') { fp(x - 0.1, 0.5, 0.2, 0.2); add(cam.D(x, 0.6), () => { box(g, cam, x - 0.07, 0.55, 0, 0.14, 0.14, 4.2, '#59645f'); box(g, cam, x - 0.07, 0.55, 4.2, 0.9, 0.12, 0.08, '#59645f');
    const c = cam.P(x + 0.75, 0.6, 4.1); const lg = g.createRadialGradient(c[0], c[1], 1, c[0], c[1], 70); lg.addColorStop(0, 'rgba(255,226,160,.55)'); lg.addColorStop(1, 'rgba(255,226,160,0)'); g.fillStyle = lg; g.beginPath(); g.arc(c[0], c[1], 70, 0, 7); g.fill();
    const f = cam.P(x + 0.75, 1.2, 0); g.save(); g.scale(1, 0.5); const fg = g.createRadialGradient(f[0], f[1] * 2, 1, f[0], f[1] * 2, cam.s * 2.2); fg.addColorStop(0, 'rgba(255,226,160,.18)'); fg.addColorStop(1, 'rgba(255,226,160,0)'); g.fillStyle = fg; g.beginPath(); g.arc(f[0], f[1] * 2, cam.s * 2.2, 0, 7); g.fill(); g.restore();
    g.beginPath(); g.arc(c[0], c[1], 6, 0, 7); g.fillStyle = '#ffe6a8'; g.fill(); }); }
}

// A person in a pink shirt, seen from the side, holding the iPhone in front.
function drawWalker(g, cam, x, y, t, moving, dir, office, wc, S) {
  const P = cam.P; const [X, Y] = P(x, y, 0);
  g.save(); cam.plane(g, 0.01); g.filter = 'blur(3px)'; g.fillStyle = 'rgba(0,0,0,.42)'; g.beginPath(); g.ellipse(x, y, 0.5, 0.42, 0, 0, 7); g.fill(); g.filter = 'none'; g.restore(); g.setTransform(1, 0, 0, 1, 0, 0);
  const sc = cam.s * cam.cp / 100 * 1.3;
  const ph = t * 8.2, sw = Math.sin(ph) * moving, bob = -Math.abs(Math.cos(ph)) * 4 * moving;
  g.save(); g.translate(X, Y); g.scale(sc * dir, sc); g.translate(0, bob);
  g.lineCap = 'round'; g.lineJoin = 'round';
  const skin = '#e6b892', skinD = '#c9966f', pants = office ? '#2f3a4a' : '#34465a', pantsD = office ? '#232c38' : '#283646', shirt = C.pinkL, shirtD = '#b8475f';
  const leg = (a, front) => { // thigh angle a; knee bends when the leg is behind
    const knee = Math.max(0, -a) * 0.9 + 0.08 * moving;
    g.save(); g.translate(front ? 4 : -3, -92); g.rotate(a);
    g.strokeStyle = front ? pants : pantsD; g.lineWidth = 15; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, 44); g.stroke();
    g.translate(0, 44); g.rotate(knee);
    if (!office) { g.strokeStyle = front ? skin : skinD; g.lineWidth = 11; } g.beginPath(); g.moveTo(0, 0); g.lineTo(0, 42); g.stroke();
    g.translate(0, 44); g.rotate(-knee - a * 0.6); rr(g, -6, -5, 22, 9, 4); g.fillStyle = front ? '#f2f2f2' : '#cfcfcf'; g.fill(); g.restore();
  };
  leg(-sw * 0.5, false);
  // back arm
  g.save(); g.translate(-4, -150); g.rotate(sw * 0.5); g.strokeStyle = shirtD; g.lineWidth = 13; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, 24); g.stroke();
  g.strokeStyle = skinD; g.lineWidth = 10; g.beginPath(); g.moveTo(0, 22); g.lineTo(2, 54); g.stroke(); g.restore();
  // torso
  const tg = g.createLinearGradient(-26, 0, 26, 0); tg.addColorStop(0, shirtD); tg.addColorStop(0.55, shirt); tg.addColorStop(1, '#f19aac');
  rr(g, -25, -164, 48, 82, 20); g.fillStyle = tg; g.fill();
  rr(g, -25, -98, 48, 16, 7); g.fillStyle = pants; g.fill();
  leg(sw * 0.5, true);
  // neck + head
  rr(g, -6, -176, 13, 16, 5); g.fillStyle = skinD; g.fill();
  const hg = g.createRadialGradient(8, -196, 3, 2, -190, 24); hg.addColorStop(0, '#f3c9a6'); hg.addColorStop(1, skinD);
  g.beginPath(); g.ellipse(3, -190, 19, 21, 0, 0, 7); g.fillStyle = hg; g.fill();
  g.beginPath(); g.ellipse(0, -200, 21, 15, -0.2, Math.PI * 0.95, Math.PI * 2.15); g.fillStyle = '#2b2220'; g.fill();
  g.beginPath(); g.ellipse(-12, -192, 9, 13, 0, 0, 7); g.fillStyle = '#2b2220'; g.fill();
  g.beginPath(); g.ellipse(-3, -189, 4, 5.5, 0, 0, 7); g.fillStyle = skinD; g.fill();
  g.beginPath(); g.arc(14, -192, 1.8, 0, 7); g.fillStyle = '#2b2220'; g.fill();
  // front arm holding the phone up
  g.strokeStyle = shirt; g.lineWidth = 14; g.beginPath(); g.moveTo(8, -150); g.lineTo(18, -128); g.stroke();
  g.strokeStyle = skin; g.lineWidth = 10; g.beginPath(); g.moveTo(18, -128); g.lineTo(26, -116); g.lineTo(40, -140); g.stroke();
  const glow = netCol(S, wc);
  const lg = g.createRadialGradient(44, -150, 2, 44, -150, 40); lg.addColorStop(0, hexA(glow, 0.35)); lg.addColorStop(1, hexA(glow, 0)); g.fillStyle = lg; g.beginPath(); g.arc(44, -150, 40, 0, 7); g.fill();
  g.save(); g.translate(43, -152); g.rotate(-0.25); rr(g, -8, -16, 16, 30, 4); g.fillStyle = '#0b0d0c'; g.fill(); rr(g, -6, -14, 12, 26, 3); g.fillStyle = hexA(glow, 0.95); g.fill(); g.restore();
  g.restore();
}
function bez(p0, p1, p2, u) { const a = (1 - u) * (1 - u), b = 2 * (1 - u) * u, c = u * u; return [a * p0[0] + b * p1[0] + c * p2[0], a * p0[1] + b * p1[1] + c * p2[1]]; }
function drawBeam(g, cam, S, M, st, hand, t, isWC) {
  let src;
  if (st.net) { const p = apPos(S, M, st.net); src = cam.P(p.x, p.y, p.z + (M.router ? 0.3 : 0)); }
  else if (st.cell && M.tower) src = cam.P(M.tower.x, M.tower.y, 6.6);
  else if (st.cell) src = [hand[0] + 260, hand[1] - 420];
  else return;
  const mid = [(src[0] + hand[0]) / 2, (src[1] + hand[1]) / 2];
  const dx = hand[0] - src[0], dy = hand[1] - src[1], L = Math.hypot(dx, dy) || 1;
  const off = (isWC ? -1 : 1) * Math.min(90, L * 0.18);
  const ctrl = [mid[0] - dy / L * off, mid[1] + dx / L * off - L * 0.12];
  const col = isWC ? netCol(S, st) : '#a6b3ac';
  const q = st.tone === 'bad' ? 0.35 : st.tone === 'slow' ? 0.6 : 1;
  const fl = st.tone === 'bad' ? (0.55 + 0.45 * Math.sin(t * 23)) : 1;
  g.save();
  if (isWC) {
    g.globalAlpha = 0.18 * fl; g.strokeStyle = col; g.lineWidth = 12; g.beginPath(); g.moveTo(...src); g.quadraticCurveTo(...ctrl, ...hand); g.stroke();
    g.globalAlpha = 0.95 * fl; g.lineWidth = 3.2; g.stroke();
    const rate = 0.25 + st.mid / 70; const n = 7;
    for (let i = 0; i < n; i++) { const u = frac(t * rate * 0.9 + i / n); const p = bez(src, ctrl, hand, u);
      g.globalAlpha = 0.9 * Math.sin(Math.PI * u) * q; g.fillStyle = '#ffffff'; g.beginPath(); g.arc(p[0], p[1], 3.6, 0, 7); g.fill(); }
  } else {
    g.globalAlpha = 0.6 * fl; g.strokeStyle = col; g.lineWidth = 2.2; g.setLineDash([7, 8]); g.lineDashOffset = -t * (8 + st.mid * 0.8);
    g.beginPath(); g.moveTo(...src); g.quadraticCurveTo(...ctrl, ...hand); g.stroke(); g.setLineDash([]);
  }
  g.restore();
}

let activeWalker = {x:5, moving:0, dir:1};
function walkerX() { return activeWalker; }
const labels = {
 balcony:['room.living','room.bedroom','room.balcony'],
 outside:['room.inside','room.yard','room.street'],
 call:['room.study','room.yard','room.street'],
 office:['room.sales','room.lobby','room.meeting']
};
window.WCDiorama = {
 build(svg, fx, story) {
   svg.hidden=true; svg.style.display='none'; fx.replaceChildren();
   let canvas=svg.parentElement.querySelector('.diorama-canvas');
   if(!canvas) {
     canvas=document.createElement('canvas'); canvas.className='diorama-canvas'; svg.after(canvas);
     const repaint = () => requestAnimationFrame(() => {
       const refs = canvas._dioramaRefs;
       if (refs?.sim) WCDiorama.update(refs, refs.sim, refs.story, true);
     });
     // Repaint even when the simulation is paused or was initially outside the viewport.
     new ResizeObserver(repaint).observe(canvas);
     new IntersectionObserver(entries => { if (entries.some(e => e.isIntersecting)) repaint(); }).observe(canvas);
     document.fonts?.ready.then(repaint);
   }
   canvas.setAttribute('role','img'); canvas.setAttribute('aria-label',t('sceneLabel'));
   const refs = {canvas, dir:1, lastX:null, lastTime:-Infinity};
   canvas._dioramaRefs = refs;
   return refs;
 },
 update(refs, sim, story, force = false) {
   refs.sim=sim; refs.story=story;
   const canvas=refs.canvas, rect=canvas.getBoundingClientRect();
   if(!rect.width || rect.bottom<0 || rect.top>innerHeight) return;
   const time=sim.realT;
   // offsetWidth is in local CSS pixels, unlike the rotated mobile bounding box.
   const ratio=Math.min(devicePixelRatio||1,2)*canvas.offsetWidth/1000;
   const width=Math.round(1000*ratio), height=Math.round(520*ratio);
   const changed=refs.net!==sim.connected || refs.cell!==sim.cell || refs.lang!==LANG || refs.moving!==sim.moving || canvas.width!==width || canvas.height!==height;
   if(!force && !changed && time-refs.lastTime<1/30 && time>=refs.lastTime) return;
   if(refs.lastX!=null && Math.abs(sim.x-refs.lastX)>.01) refs.dir=sim.x>refs.lastX?1:-1;
   if(canvas.width!==width || canvas.height!==height) {canvas.width=width;canvas.height=height;}
   const raw=canvas.getContext('2d');
   const g=new Proxy(raw,{get(target,key){
     if(key==='setTransform') return (a,b,c,d,e,f)=>target.setTransform(a*ratio,b*ratio,c*ratio,d*ratio,e*ratio,f*ratio);
     const value=target[key];return typeof value==='function'?value.bind(target):value;
   },set(target,key,value){target[key]=value;return true;}});
   g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,1000,520);
   activeWalker={x:sim.x/50,moving:sim.moving && !reduceMotion?1:0,dir:refs.dir};
   MAPS[story.id].zones.forEach((z,i)=>z.label=t(labels[story.id][i]));
   const aps=Object.fromEntries(story.aps.map(a=>[a.id,{...a,name:apName(a)}]));
   const S={map:story.id,aps,rings:[],dur:1};
   const wc={net:sim.connected,cell:sim.cell,tone:tone(sim)||'good',mid:40};
   drawDiorama(g,S,reduceMotion?0:time,wc,wc);
   refs.lastX=sim.x;refs.net=sim.connected;refs.cell=sim.cell;refs.lang=LANG;refs.moving=sim.moving;refs.lastTime=time;
 }
};
})();
