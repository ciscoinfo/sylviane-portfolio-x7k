import confetti from 'canvas-confetti';
import { sfx } from '../audio.js';

const GOAL = 18; // points à atteindre
const TIME = 50; // secondes
const LIVES = 3;

// Chaque cible a ses propres messages : ce qui s'affiche correspond toujours à ce qu'on vient de taper.
// group : bug = nuisible à écraser, boss = bonus, avoid = innocent à épargner
const KINDS = {
  roach: { emoji: '🪳', size: 46, points: 1, group: 'bug', weight: 4, msgs: ['Cafard écrasé !', 'Un cafard de moins !', 'Splat, cafard !'] },
  spider: { emoji: '🕷️', size: 48, points: 1, group: 'bug', weight: 3, msgs: ['Araignée écrasée !', 'Araignée expulsée !', 'Plus d’araignée !'] },
  fly: { emoji: '🪰', size: 36, points: 1, group: 'bug', weight: 2, msgs: ['Mouche swattée !', 'Mouche K.O. !'] },
  rat: { emoji: '🐀', size: 58, points: 2, group: 'bug', weight: 1.5, flip: true, msgs: ['Rat éliminé !', 'Le rat a compris !'] },
  landlord: { emoji: '🤵', size: 60, points: 5, group: 'boss', msgs: ['Réclamation remise en main propre ! Sans réponse.'] },
  frog: { emoji: '🐸', size: 46, group: 'avoid', msgs: ['Pas la grenouille : ce n’est pas un nuisible !'], react: 'COAC !' },
  cat: { emoji: '🐈', size: 60, group: 'avoid', flip: true, msgs: ['Pas le chat de la voisine !'], react: 'MIAOU !' },
  pigeon: { emoji: '🐦', size: 50, group: 'avoid', flip: true, gray: true, msgs: ['Pas le pigeon : il passait par là !'], react: 'ROUCOU-COU !' },
  hedgehog: { emoji: '🦔', size: 52, group: 'avoid', flip: true, msgs: ['Pas le hérisson : ça pique !'], react: 'AÏE ! ÇA PIQUE !' },
  neighbor: { emoji: '👵', size: 60, group: 'avoid', msgs: ['Pas la voisine !'], react: 'Oh !' },
};
const BUGS = ['roach', 'spider', 'fly', 'rat'];
const INNOCENTS = ['frog', 'cat', 'pigeon', 'hedgehog', 'neighbor'];

// Curseur : tapette électrique (SVG), le point chaud est au centre de la raquette
const SWATTER = encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><g transform="rotate(-35 32 32)">' +
    '<rect x="28.5" y="34" width="7" height="27" rx="3" fill="#2b2b2b"/>' +
    '<ellipse cx="32" cy="20" rx="14" ry="17" fill="#ffe94d" stroke="#222" stroke-width="3"/>' +
    '<path d="M22 12h20M20 20h24M22 28h20M28 4v32M36 4v32" stroke="#222" stroke-width="1.5" fill="none"/>' +
    '</g><path d="M50 4l-7 10h6l-5 9 11-13h-6z" fill="#ff7b00" stroke="#fff" stroke-width="1"/></svg>'
);
const CURSOR = `url("data:image/svg+xml,${SWATTER}") 25 22, crosshair`;

const rand = (a, b) => a + Math.random() * (b - a);
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const lerp = (a, b, t) => a + (b - a) * t;
const ease = (t) => 1 - Math.pow(1 - t, 3);
const shuffle = (a) => [...a].sort(() => Math.random() - 0.5);
function pickBug() {
  const total = BUGS.reduce((s, k) => s + KINDS[k].weight, 0);
  let r = Math.random() * total;
  for (const k of BUGS) { r -= KINDS[k].weight; if (r <= 0) return k; }
  return BUGS[0];
}

// Cuisine : mur carrelé, fenêtre, placards, évier, cuisinière, frigo. Étirée pour remplir la scène.
function kitchenSVG() {
  const INK = '#1d1712';
  return `
  <svg class="hg__kitchen" viewBox="0 0 1000 500" preserveAspectRatio="none" aria-hidden="true">
    <defs>
      <pattern id="hgTile" width="38" height="38" patternUnits="userSpaceOnUse"><rect width="38" height="38" fill="#fff"/><rect x=".8" y=".8" width="36.4" height="36.4" fill="none" stroke="#9cc3e6" stroke-width="1.6"/></pattern>
      <pattern id="hgFloor" width="60" height="36" patternUnits="userSpaceOnUse"><rect width="60" height="36" fill="#e6dac3"/><rect width="30" height="18" fill="#cdbf9f"/><rect x="30" y="18" width="30" height="18" fill="#cdbf9f"/></pattern>
      <linearGradient id="hgSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9fd2ff"/><stop offset="1" stop-color="#e8f6ff"/></linearGradient>
    </defs>
    <rect width="1000" height="500" fill="#f4ecdb"/>
    <rect x="0" y="195" width="860" height="115" fill="url(#hgTile)"/>
    <!-- fenêtre -->
    <rect x="265" y="38" width="215" height="160" rx="6" fill="#8a5a3b" stroke="${INK}" stroke-width="4"/>
    <rect x="278" y="50" width="189" height="136" fill="url(#hgSky)"/>
    <line x1="372" y1="50" x2="372" y2="186" stroke="#8a5a3b" stroke-width="6"/><line x1="278" y1="118" x2="467" y2="118" stroke="#8a5a3b" stroke-width="6"/>
    <path d="M278 50 q30 50 0 136 h-18 v-136 z" fill="#f7c5c0" opacity=".9"/><path d="M467 50 q-30 50 0 136 h18 v-136 z" fill="#f7c5c0" opacity=".9"/>
    <rect x="258" y="196" width="229" height="10" rx="3" fill="#a8774f" stroke="${INK}" stroke-width="3"/>
    <!-- placards hauts -->
    <rect x="8" y="0" width="240" height="150" fill="#b98c5b" stroke="${INK}" stroke-width="4"/><line x1="128" y1="0" x2="128" y2="150" stroke="${INK}" stroke-width="3"/>
    <rect x="112" y="116" width="10" height="26" rx="4" fill="#e9d6ae"/><rect x="134" y="116" width="10" height="26" rx="4" fill="#e9d6ae"/>
    <rect x="500" y="0" width="190" height="120" fill="#b98c5b" stroke="${INK}" stroke-width="4"/><line x1="595" y1="0" x2="595" y2="120" stroke="${INK}" stroke-width="3"/>
    <rect x="580" y="90" width="10" height="22" rx="4" fill="#e9d6ae"/><rect x="602" y="90" width="10" height="22" rx="4" fill="#e9d6ae"/>
    <!-- hotte, barre d'ustensiles, horloge -->
    <path d="M630 120 h170 l-24 -36 h-122 z" fill="#c9ced6" stroke="${INK}" stroke-width="3"/>
    <line x1="640" y1="160" x2="800" y2="160" stroke="#555" stroke-width="4"/>
    ${[650, 680, 710, 745, 775].map((x, i) => `<path d="M${x} 160 v${24 + (i % 2) * 14}" stroke="#777" stroke-width="3"/><ellipse cx="${x}" cy="${190 + (i % 2) * 14}" rx="7" ry="9" fill="#9aa3ad" stroke="${INK}" stroke-width="2"/>`).join('')}
    <circle cx="560" cy="165" r="22" fill="#fff" stroke="${INK}" stroke-width="3.5"/><line x1="560" y1="165" x2="560" y2="150" stroke="${INK}" stroke-width="3"/><line x1="560" y1="165" x2="572" y2="170" stroke="${INK}" stroke-width="3"/>
    <!-- plan de travail et placards bas -->
    <rect x="0" y="424" width="1000" height="76" fill="url(#hgFloor)"/><rect x="0" y="424" width="1000" height="10" fill="#8a6a4e"/>
    <rect x="0" y="318" width="860" height="108" fill="#b98c5b" stroke="${INK}" stroke-width="4"/>
    ${[0, 1, 2, 3].map((i) => `<rect x="${12 + i * 205}" y="330" width="190" height="86" fill="none" stroke="#7a5230" stroke-width="3"/><rect x="${92 + i * 205}" y="338" width="10" height="26" rx="4" fill="#e9d6ae"/>`).join('')}
    <rect x="0" y="302" width="860" height="18" rx="3" fill="#d6b88a" stroke="${INK}" stroke-width="4"/>
    <!-- évier -->
    <rect x="410" y="294" width="150" height="12" rx="4" fill="#c9d1d8" stroke="${INK}" stroke-width="3"/>
    <path d="M488 296 V250 q0 -24 -26 -24 h-18" fill="none" stroke="#9aa3ad" stroke-width="9" stroke-linecap="round"/><rect x="432" y="224" width="16" height="10" rx="3" fill="#9aa3ad"/>
    <!-- cuisinière -->
    <rect x="630" y="296" width="168" height="12" rx="3" fill="#2b2b2b" stroke="${INK}" stroke-width="3"/>
    <ellipse cx="680" cy="290" rx="26" ry="6" fill="#444"/><ellipse cx="750" cy="290" rx="26" ry="6" fill="#444"/>
    <ellipse cx="750" cy="276" rx="27" ry="9" fill="#8a8f98" stroke="${INK}" stroke-width="2.5"/><rect x="772" y="272" width="30" height="7" rx="3" fill="#555"/>
    <path d="M740 262 q-6 -10 0 -18 M752 262 q-6 -10 0 -18" fill="none" stroke="#fff" stroke-width="3" opacity=".8"/>
    <rect x="636" y="322" width="156" height="98" rx="6" fill="#d7dbe0" stroke="${INK}" stroke-width="4"/><rect x="650" y="336" width="128" height="62" rx="5" fill="#222"/><rect x="660" y="344" width="108" height="46" rx="4" fill="#ff9a3c" opacity=".55"/><rect x="654" y="326" width="120" height="6" rx="3" fill="#9aa3ad"/>
    <!-- frigo -->
    <rect x="866" y="60" width="128" height="368" rx="8" fill="#f1f4f7" stroke="${INK}" stroke-width="4"/><line x1="866" y1="195" x2="994" y2="195" stroke="${INK}" stroke-width="3"/>
    <rect x="876" y="100" width="8" height="70" rx="4" fill="#9aa3ad"/><rect x="876" y="215" width="8" height="90" rx="4" fill="#9aa3ad"/>
  </svg>`;
}

export function startHLM(container, onWin) {
  let raf = 0;
  let running = false;
  let ents = [];
  let score, lives, left, last, nextBug, nextInnocent, nextBoss, innocentBag;

  container.innerHTML = `
    <div class="hg">
      <h3>La chasse aux nuisibles</h3>
      <p class="hg__intro">Dans la cuisine, armée de votre <b>tapette électrique</b>, écrasez les <b>nuisibles</b> (araignées qui descendent du plafond, cafards et rats sous les meubles, mouches par la fenêtre). <b>Épargnez les innocents</b> : le chat, la grenouille, le pigeon, le hérisson, la voisine. Le bailleur en personne vaut 5 points.</p>
      <div class="hg__hud">
        <span class="hg__score"></span><span class="hg__time"></span><span class="hg__lives"></span>
      </div>
      <div class="hg__stage">
        ${kitchenSVG()}
        <div class="hg__overlay"></div>
      </div>
    </div>`;
  const stage = container.querySelector('.hg__stage');
  const overlay = container.querySelector('.hg__overlay');
  const scoreEl = container.querySelector('.hg__score');
  const timeEl = container.querySelector('.hg__time');
  const livesEl = container.querySelector('.hg__lives');
  stage.style.cursor = CURSOR;

  const show = (html) => {
    overlay.innerHTML = html;
    overlay.hidden = false;
  };
  const W = () => stage.clientWidth;
  const H = () => stage.clientHeight;

  function hud() {
    scoreEl.textContent = `Nuisibles : ${score} / ${GOAL}`;
    timeEl.textContent = `⏱ ${Math.max(0, Math.ceil(left))} s`;
    livesEl.textContent = 'Innocents : ' + '❤️'.repeat(lives) + '🖤'.repeat(LIVES - lives);
  }

  /* ---------- création des cibles : chacune arrive à sa manière ---------- */
  function base(kind, cx, cy) {
    const k = KINDS[kind];
    const el = document.createElement('div');
    el.className = `hg__ent hg__ent--${kind} hg__ent--in`;
    el.textContent = k.emoji;
    el.style.fontSize = k.size * 0.8 + 'px';
    if (k.gray) el.style.filter = 'grayscale(1) brightness(.85)';
    stage.appendChild(el);
    const e = { kind, el, cx, cy, size: k.size, age: 0, vx: 1, vy: 0, update: () => false, cleanup: null };
    ents.push(e);
    return e;
  }

  // suit un chemin de points [x, y, pause?] à vitesse constante (px/s)
  function follow(e, dt) {
    const p = e.path[e.i];
    if (!p) return false;
    if (e.hold > 0) { e.hold -= dt; return true; }
    const dx = p[0] - e.cx, dy = p[1] - e.cy, d = Math.hypot(dx, dy), step = e.speed * dt;
    if (d <= step) {
      e.cx = p[0]; e.cy = p[1];
      if (p[2]) e.hold = p[2];
      e.i++;
      return e.i < e.path.length;
    }
    e.cx += (dx / d) * step; e.cy += (dy / d) * step; e.vx = dx / d; e.vy = dy / d;
    return true;
  }

  // les cachettes au ras du sol : sous le frigo, sous la cuisinière, sous l'évier, aux coins
  const SPOTS = [[0.93, 0.93], [0.7, 0.93], [0.48, 0.93], [0.04, 0.93]];
  function floorPath(kind) {
    const w = W(), h = H();
    const [a, b] = shuffle(SPOTS).slice(0, 2);
    const pts = [[a[0] * w, a[1] * h]];
    const n = kind === 'rat' ? 2 : 3 + Math.floor(Math.random() * 2);
    for (let i = 1; i <= n; i++) pts.push([lerp(a[0], b[0], i / (n + 1)) * w + rand(-20, 20), rand(0.9, 0.97) * h]);
    pts.push([b[0] * w, b[1] * h]);
    return pts;
  }
  const speedUp = () => 1 + ((TIME - left) / TIME) * 0.35;

  function makeRoach() {
    const path = floorPath('roach');
    const e = base('roach', path[0][0], path[0][1]);
    e.path = path; e.i = 1; e.speed = rand(130, 190) * speedUp();
    e.update = (dt) => follow(e, dt);
  }
  function makeRat() {
    const path = floorPath('rat');
    const e = base('rat', path[0][0], path[0][1]);
    e.path = path; e.i = 1; e.speed = rand(230, 290) * speedUp();
    e.update = (dt) => follow(e, dt);
  }
  // l'araignée descend du plafond au bout de son fil, se balance, puis remonte
  function makeSpider() {
    const w = W(), h = H();
    const x0 = rand(0.1, 0.9) * w, ty = rand(0.2, 0.5) * h;
    const e = base('spider', x0, -30);
    const thread = document.createElement('div');
    thread.className = 'hg__thread';
    stage.appendChild(thread);
    e.cleanup = () => thread.remove();
    const down = 1.0, hang = rand(2.2, 3.0) / speedUp(), up = 0.9;
    e.t = 0;
    e.update = (dt) => {
      e.t += dt;
      if (e.t < down) e.cy = lerp(-30, ty, ease(e.t / down));
      else if (e.t < down + hang) { e.cy = ty + Math.sin(e.t * 3) * 7; e.cx = x0 + Math.sin(e.t * 2) * 12; }
      else if (e.t < down + hang + up) e.cy = lerp(ty, -40, (e.t - down - hang) / up);
      else return false;
      thread.style.left = e.cx + 'px';
      thread.style.height = Math.max(0, e.cy - 14) + 'px';
      return true;
    };
  }
  // la mouche entre par la fenêtre et zigzague jusqu'à l'autre bout de la pièce
  function makeFly() {
    const w = W(), h = H();
    const y0 = rand(0.15, 0.4) * h, v = rand(150, 200) * speedUp();
    const e = base('fly', 0.3 * w, y0);
    e.t = 0;
    e.update = (dt) => {
      e.t += dt;
      e.cx += v * dt;
      e.cy = y0 + Math.sin(e.t * 5) * 28 + Math.sin(e.t * 2.1) * 22;
      e.vx = 1;
      return e.cx < w + 40;
    };
  }

  /* ---------- les innocents ---------- */
  // la grenouille sort de l'évier et traverse le plan de travail en sautant
  function makeFrog() {
    const w = W(), h = H(), base0 = 0.6 * h;
    const dir = Math.random() < 0.5 ? 1 : -1;
    const e = base('frog', 0.47 * w, base0);
    e.vx = dir; e.t = 0; e.hopT = 0.6; e.pause = 0.5; e.startX = e.cx; e.hops = 4;
    e.update = (dt) => {
      e.t += dt;
      const cycle = e.hopT + e.pause, n = Math.floor(e.t / cycle), u = (e.t - n * cycle) / e.hopT;
      if (n >= e.hops) return false;
      const dx = dir * 0.08 * w;
      if (u < 1) { e.cx = e.startX + dx * (n + u); e.cy = base0 - Math.sin(u * Math.PI) * 46; }
      else { e.cx = e.startX + dx * (n + 1); e.cy = base0; }
      return true;
    };
  }
  // le chat se promène sur le plan de travail ; s'il est touché, il se hérisse et file
  function makeCat() {
    const w = W(), h = H(), y = 0.6 * h;
    const fromLeft = Math.random() < 0.5;
    const e = base('cat', fromLeft ? -40 : w + 40, y);
    e.path = [[fromLeft ? w * 0.4 : w * 0.6, y, 1.0], [fromLeft ? w + 60 : -60, y]];
    e.i = 0; e.speed = 85;
    e.update = (dt) => {
      if (e.angry) e.speed = 380;
      e.cy = y + (e.angry ? 0 : Math.sin(e.age * 4) * 2);
      return follow(e, dt);
    };
  }
  // le pigeon entre par la fenêtre, plonge, puis repart
  function makePigeon() {
    const w = W(), h = H();
    const P0 = [-0.05 * w, 0.12 * h], P1 = [0.4 * w, 0.78 * h], P2 = [1.06 * w, 0.14 * h];
    const e = base('pigeon', P0[0], P0[1]);
    e.t = 0; const T = 4.2;
    e.update = (dt) => {
      e.t += dt;
      const u = e.t / T;
      if (u >= 1) return false;
      const a = (1 - u) * (1 - u), b = 2 * (1 - u) * u, c = u * u;
      const nx = a * P0[0] + b * P1[0] + c * P2[0], ny = a * P0[1] + b * P1[1] + c * P2[1] + Math.sin(e.t * 14) * 5;
      e.vx = nx - e.cx; e.cx = nx; e.cy = ny;
      return true;
    };
  }
  // la voisine entre par la porte, regarde un instant, ressort
  function makeNeighbor() {
    const w = W(), h = H(), y = 0.8 * h;
    const e = base('neighbor', -50, y);
    e.path = [[0.3 * w, y, 1.2], [-70, y]];
    e.i = 0; e.speed = 85;
    e.update = (dt) => follow(e, dt);
  }
  // le bailleur passe la tête à la porte du frigo… enfin à droite de la scène
  function makeLandlord() {
    const w = W(), h = H(), y = 0.7 * h;
    const e = base('landlord', w + 50, y);
    e.path = [[0.8 * w, y, 2.2], [w + 70, y]];
    e.i = 0; e.speed = 220;
    e.update = (dt) => follow(e, dt);
  }
  // le hérisson trottine au ras du sol ; s'il est touché, il se met en boule et roule plus loin
  function makeHedgehog() {
    const w = W(), h = H(), y = 0.915 * h;
    const fromLeft = Math.random() < 0.5;
    const e = base('hedgehog', fromLeft ? -40 : w + 40, y);
    e.path = [[fromLeft ? w * 0.45 : w * 0.55, y, 1.2], [fromLeft ? w + 70 : -70, y]];
    e.i = 0; e.speed = 70; e.roll = 0;
    e.update = (dt) => {
      if (e.ball) { e.speed = 320; e.roll += dt * 14; }
      return follow(e, dt);
    };
  }
  const MAKERS = { hedgehog: makeHedgehog, roach: makeRoach, rat: makeRat, spider: makeSpider, fly: makeFly, frog: makeFrog, cat: makeCat, pigeon: makePigeon, neighbor: makeNeighbor, landlord: makeLandlord };

  function floatText(x, y, text, cls) {
    const t = document.createElement('div');
    t.className = `hg__float ${cls}`;
    t.textContent = text;
    t.style.left = Math.min(Math.max(x - 30, 10), W() - 200) + 'px';
    t.style.top = Math.max(y - 20, 4) + 'px';
    stage.appendChild(t);
    setTimeout(() => t.remove(), 1100);
  }
  function splat(x, y, emoji = '💥') {
    const s = document.createElement('div');
    s.className = 'hg__splat';
    s.textContent = emoji;
    s.style.left = x + 'px';
    s.style.top = y + 'px';
    stage.appendChild(s);
    setTimeout(() => s.remove(), 600);
  }

  function remove(e) {
    e.el.remove();
    e.cleanup && e.cleanup();
    ents = ents.filter((x) => x !== e);
  }

  function hit(e) {
    if (!running) return;
    const k = KINDS[e.kind];
    const msg = pick(k.msgs);
    if (k.group === 'avoid') {
      lives--;
      sfx.buzz();
      floatText(e.cx, e.cy - 36, k.react, 'hg__float--sfx');
      floatText(e.cx, e.cy, msg, 'hg__float--bad');
      if (e.kind === 'cat') { e.angry = true; e.el.classList.add('hg__ent--angry'); splat(e.cx, e.cy, '💢'); }
      else if (e.kind === 'hedgehog') { e.ball = true; e.el.classList.add('hg__ent--ball'); splat(e.cx, e.cy, '✨'); }
      else if (e.kind === 'pigeon') { splat(e.cx, e.cy, '🪶'); e.t += 1.5; }
      else if (e.kind === 'frog') { splat(e.cx, e.cy, '💢'); e.t += 1.5; }
      else { splat(e.cx, e.cy, '💢'); }
      if (e.kind === 'neighbor' || e.kind === 'frog') remove(e);
      if (lives <= 0) return end(false);
    } else {
      score += k.points;
      sfx.smack(e.kind === 'rat' || k.group === 'boss' ? 'big' : 'bug');
      if (k.group === 'boss') setTimeout(() => sfx.ding(), 120);
      splat(e.cx, e.cy);
      floatText(e.cx, e.cy, `${msg} +${k.points}`, 'hg__float--good');
      remove(e);
      if (score >= GOAL) return end(true);
    }
    hud();
  }

  // La tapette frappe une zone généreuse autour du curseur : on prend la cible la plus proche.
  stage.addEventListener('pointerdown', (ev) => {
    if (!running) return;
    const r = stage.getBoundingClientRect();
    const px = ev.clientX - r.left, py = ev.clientY - r.top;
    let best = null, bestD = Infinity;
    for (const e of ents) {
      const reach = e.size / 2 + (KINDS[e.kind].group === 'avoid' ? 6 : 30);
      const d = Math.hypot(px - e.cx, py - e.cy);
      if (d < reach && d < bestD) { best = e; bestD = d; }
    }
    const zap = document.createElement('div');
    zap.className = 'hg__zap';
    zap.textContent = '⚡';
    zap.style.left = px + 'px';
    zap.style.top = py + 'px';
    stage.appendChild(zap);
    setTimeout(() => zap.remove(), 350);
    if (best) hit(best);
    else sfx.whiff();
  });

  function start() {
    cancelAnimationFrame(raf);
    ents.forEach((e) => { e.el.remove(); e.cleanup && e.cleanup(); });
    ents = [];
    score = 0;
    lives = LIVES;
    left = TIME;
    nextBug = 0.6;
    nextInnocent = 6;
    nextBoss = 15;
    innocentBag = [];
    overlay.hidden = true;
    hud();
    running = true;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }

  function frame(now) {
    if (!running) return;
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    left -= dt;

    for (const e of [...ents]) {
      e.age += dt;
      if (!e.update(dt)) { remove(e); continue; }
      const k = KINDS[e.kind];
      const rot = e.kind === 'roach' ? Math.atan2(e.vy, e.vx) + Math.PI / 2 : 0;
      const flip = k.flip && e.vx > 0 ? ' scaleX(-1)' : '';
      const angry = e.angry ? ' scale(1.25)' : e.ball ? ` scale(.85) rotate(${e.roll}rad)` : '';
      e.el.style.transform = `translate(${e.cx - e.size / 2}px, ${e.cy - e.size / 2}px) rotate(${rot}rad)${flip}${angry}`;
    }

    // moins de nuisibles à la fois : 2 au début, 3 à partir de la mi-partie
    const maxBugs = left < TIME / 2 || score >= 9 ? 3 : 2;
    const bugs = ents.filter((e) => KINDS[e.kind].group === 'bug').length;
    nextBug -= dt;
    if (nextBug <= 0 && bugs < maxBugs) { MAKERS[pickBug()](); nextBug = rand(0.9, 1.7); }

    // un innocent à la fois, dans un ordre qui change (grenouille, chat, pigeon, voisine)
    nextInnocent -= dt;
    if (nextInnocent <= 0 && !ents.some((e) => KINDS[e.kind].group === 'avoid')) {
      if (!innocentBag.length) innocentBag = shuffle(INNOCENTS);
      MAKERS[innocentBag.pop()]();
      nextInnocent = rand(6, 9);
    }
    nextBoss -= dt;
    if (nextBoss <= 0) { makeLandlord(); nextBoss = rand(16, 22); }

    hud();
    if (left <= 0) return end(score >= GOAL);
    raf = requestAnimationFrame(frame);
  }

  function end(win) {
    running = false;
    cancelAnimationFrame(raf);
    if (win) {
      sfx.win();
      confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });
      show(`
        <h4>Cuisine nettoyée !</h4>
        <p>${score} points de nuisibles écrasés. Le bailleur a changé de numéro. Les nuisibles, de cuisine.</p>
        <button class="btn btn--primary" data-hg="win">Consulter l’expérience de Sylviane</button>`);
    } else {
      show(`
        <h4>${lives <= 0 ? 'Vous avez touché trop d’innocents…' : 'Le temps est écoulé.'}</h4>
        <p>${score} sur ${GOAL}. ${lives <= 0 ? 'La voisine, le chat, la grenouille, le pigeon et le hérisson portent plainte.' : 'Les nuisibles ont gagné cette fois. Sylviane, elle, n’abandonne jamais.'}</p>
        <button class="btn btn--primary" data-hg="retry">Réessayer</button>`);
    }
  }

  container.addEventListener('click', (e) => {
    const act = e.target.closest('[data-hg]')?.dataset.hg;
    if (act === 'start' || act === 'retry') start();
    if (act === 'win') onWin();
  });

  // arrêt propre si la fenêtre est fermée
  new MutationObserver(() => {
    if (!container.contains(stage)) {
      running = false;
      cancelAnimationFrame(raf);
    }
  }).observe(container, { childList: true });

  score = 0; lives = LIVES; left = TIME;
  hud();
  show(`
    <h4>Branle-bas de combat !</h4>
    <p>${GOAL} points de nuisibles en ${TIME} secondes, sans toucher le chat, la grenouille, le pigeon, le hérisson ni la voisine.</p>
    <button class="btn btn--primary" data-hg="start">C’est parti</button>`);
}
