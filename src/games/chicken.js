import confetti from 'canvas-confetti';
import { sfx } from '../audio.js';
import { drawSylviane } from './sylviane.js';

// Sylviane court après le poulet du dimanche à travers la ferme, en sautant par-dessus des obstacles
// (agricoles ou carrément insolites). Plus elle enchaîne les sauts, plus elle accélère.
const W = 760, H = 300;
const GROUND = 238;
const PPM = 38; // pixels par mètre
const RX = 150; // position de Sylviane à l'écran
const TIME = 60;
const START_GAP = 8; // mètres d'avance du poulet
const CATCH_GAP = 0.9;
const LOSE_GAP = 30; // on ne perd plus d'un coup : le poulet doit vraiment avoir disparu au loin
const G = 1500;
const JUMP_V = 560;

// h : hauteur de l'obstacle (px), w : largeur ; odd : objet qui n'a rien à faire dans une ferme
const OBSTACLES = [
  { k: 'hay', w: 66, h: 66, name: 'botte de foin' },
  { k: '🐑', w: 58, h: 60, name: 'mouton' },
  { k: '🐖', w: 60, h: 56, name: 'cochon' },
  { k: '🪣', w: 44, h: 46, name: 'seau' },
  { k: '🛋️', w: 72, h: 60, odd: true, name: 'canapé' },
  { k: '🛒', w: 60, h: 64, odd: true, name: 'caddie' },
  { k: '🚽', w: 50, h: 62, odd: true, name: 'WC' },
  { k: '🌵', w: 48, h: 70, odd: true, name: 'cactus' },
  { k: '📺', w: 60, h: 56, odd: true, name: 'télévision' },
  { k: '🧳', w: 52, h: 54, odd: true, name: 'valise' },
];
const CLUCKS = ['Cot !', 'Cot cot !', 'Au secours !', 'Pas moi !', 'Je suis bio !', 'Cot… dé… cot !'];

const rand = (a, b) => a + Math.random() * (b - a);

// Le four, avec le poulet du dimanche qui dore
function ovenSVG() {
  return `
  <svg class="ck__oven" viewBox="0 0 320 260" role="img" aria-label="Le poulet rôtit dans le four">
    <rect x="20" y="14" width="280" height="236" rx="14" fill="#dfe3e8" stroke="#1d1712" stroke-width="4"/>
    <rect x="20" y="14" width="280" height="52" rx="14" fill="#c7ccd3" stroke="#1d1712" stroke-width="4"/>
    ${[52, 92, 132].map((x) => `<circle cx="${x}" cy="40" r="12" fill="#2b2b2b" stroke="#1d1712" stroke-width="2"/><line x1="${x}" y1="40" x2="${x + 6}" y2="31" stroke="#fff" stroke-width="3" stroke-linecap="round"/>`).join('')}
    <rect x="190" y="26" width="92" height="28" rx="5" fill="#111" stroke="#1d1712" stroke-width="2"/>
    <text x="236" y="47" text-anchor="middle" font-size="19" font-weight="800" fill="#ff6a3d" font-family="Inter, sans-serif">200°C</text>
    <rect x="42" y="82" width="236" height="150" rx="10" fill="#1b1b1b" stroke="#1d1712" stroke-width="4"/>
    <rect class="ck__glow" x="52" y="92" width="216" height="130" rx="6" fill="#ff8a2a"/>
    <line x1="60" y1="190" x2="260" y2="190" stroke="#555" stroke-width="3"/>
    <rect x="86" y="184" width="148" height="12" rx="4" fill="#8a8f98" stroke="#1d1712" stroke-width="2"/>
    <circle cx="104" cy="178" r="11" fill="#e9b84a" stroke="#9a6d12" stroke-width="2"/>
    <circle cx="218" cy="179" r="11" fill="#e9b84a" stroke="#9a6d12" stroke-width="2"/>
    <circle cx="124" cy="182" r="9" fill="#e9b84a" stroke="#9a6d12" stroke-width="2"/>
    <g class="ck__roast">
      <ellipse cx="160" cy="160" rx="50" ry="29" stroke="#7a3f12" stroke-width="3"/>
      <ellipse cx="116" cy="172" rx="15" ry="8" transform="rotate(-25 116 172)" stroke="#7a3f12" stroke-width="3"/>
      <ellipse cx="204" cy="172" rx="15" ry="8" transform="rotate(25 204 172)" stroke="#7a3f12" stroke-width="3"/>
      <ellipse cx="140" cy="148" rx="20" ry="9" fill="rgba(255,255,255,.28)" stroke="none"/>
    </g>
    <path d="M60 94 L130 94 L96 222 L60 222 Z" fill="rgba(255,255,255,.12)"/>
    <rect x="66" y="66" width="188" height="9" rx="4" fill="#9aa3ad" stroke="#1d1712" stroke-width="2"/>
    <g class="ck__steam" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".7">
      <path d="M130 130 q-8 -10 0 -20 q8 -10 0 -20"/><path d="M165 126 q-8 -10 0 -20 q8 -10 0 -20"/><path d="M200 130 q-8 -10 0 -20 q8 -10 0 -20"/>
    </g>
  </svg>`;
}

export function startChicken(container) {
  let raf = 0, running = false, last = 0, s;

  container.innerHTML = `
    <div class="ck">
      <h3>Le poulet du dimanche</h3>
      <p class="ck__intro">Sylviane est la pro du poulet rôti, mais encore faut-il l’attraper. Appuyez sur <b>Espace</b> (ou touchez l’écran) pour sauter par-dessus les obstacles. Chaque saut réussi la fait accélérer, chaque obstacle renversé la ralentit. Rattrapez le poulet en ${TIME} secondes : un obstacle ne vous arrête pas, il vous ralentit seulement !</p>
      <div class="ck__hud"><span class="ck__time"></span><span class="ck__gap"></span><span class="ck__streak"></span></div>
      <div class="ck__wrap">
        <canvas class="ck__canvas" width="${W}" height="${H}"></canvas>
        <div class="ck__overlay"></div>
      </div>
    </div>`;
  const cv = container.querySelector('canvas');
  const ctx = cv.getContext('2d');
  cv.width = W * 2; // double résolution : image nette
  cv.height = H * 2;
  ctx.scale(2, 2);
  const overlay = container.querySelector('.ck__overlay');
  const wrap = container.querySelector('.ck__wrap');
  const timeEl = container.querySelector('.ck__time');
  const gapEl = container.querySelector('.ck__gap');
  const streakEl = container.querySelector('.ck__streak');

  function reset() {
    s = { dist: 0, t: 0, y: 0, vy: 0, vS: 0, gap: START_GAP, streak: 0, best: 0, slow: 0, clear: 0, obs: [], next: 16, panic: 0, cluck: '', cluckT: 0, hitT: 0, nextCluck: 2, over: false };
  }

  function spawn() {
    while (s.next < s.dist + 30) {
      const t = OBSTACLES[Math.floor(Math.random() * OBSTACLES.length)];
      s.obs.push({ m: s.next, t, hit: false, done: false });
      s.next += rand(12, 20);
    }
  }

  function jump() {
    if (!running) return;
    if (s.y <= 0) {
      s.vy = JUMP_V;
      sfx.tile();
    }
  }

  function drawObstacle(o) {
    const x = RX + (o.m - s.dist) * PPM;
    if (x < -60 || x > W + 60) return;
    ctx.save();
    ctx.translate(x, GROUND);
    if (o.hit) { ctx.rotate(-0.9); ctx.translate(18, -6); }
    const t = o.t;
    ctx.fillStyle = 'rgba(0,0,0,.22)';
    ctx.beginPath();
    ctx.ellipse(0, 2, t.w * 0.55, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    if (t.k === 'hay') {
      const r = t.h / 2;
      ctx.fillStyle = '#e6c15a';
      ctx.strokeStyle = '#7a5a12';
      ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(0, -r, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.lineWidth = 3;
      for (const k of [0.3, 0.55, 0.8]) { ctx.beginPath(); ctx.arc(0, -r, r * k, 0, Math.PI * 1.6); ctx.stroke(); }
    } else {
      ctx.font = `${Math.round(t.h * 1.15)}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = '#000';
      ctx.fillText(t.k, 0, -2);
    }
    ctx.restore();
    // avertissement : un point d'exclamation au-dessus du prochain obstacle
    const ahead = (o.m - s.dist);
    if (!o.hit && !o.done && ahead > 0.5 && ahead < 8) {
      const bounce = Math.sin(s.t * 10) * 3;
      ctx.fillStyle = '#e2452f';
      ctx.beginPath();
      ctx.moveTo(x, GROUND - t.h - 22 + bounce);
      ctx.lineTo(x - 13, GROUND - t.h - 46 + bounce);
      ctx.lineTo(x + 13, GROUND - t.h - 46 + bounce);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = '900 15px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('!', x, GROUND - t.h - 32 + bounce);
    }
  }

  // un vrai poulet de dos à quatre pattes : corps, queue, aile, tête, crête, bec, pattes qui courent
  function drawChicken(x, groundY, phase, panic) {
    const INK = '#1d1712';
    ctx.save();
    ctx.translate(x, groundY);
    ctx.scale(1.25, 1.25);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    // pattes
    [0, Math.PI].forEach((off) => {
      const a = Math.sin(phase + off) * 0.9;
      const lift = Math.max(0, Math.cos(phase + off)) * 5;
      const hx = 2, hy = -22;
      const kx = hx + Math.sin(a) * 12, ky = hy + 12 - lift * 0.4;
      const fx = kx + Math.sin(a * 0.6) * 7, fy = Math.min(0, ky + 10 - lift);
      ctx.strokeStyle = '#e0a030';
      ctx.lineWidth = 3.5;
      ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(kx, ky); ctx.lineTo(fx, fy); ctx.stroke();
      ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(fx, fy); ctx.lineTo(fx + 7, fy); ctx.moveTo(fx, fy); ctx.lineTo(fx + 5, fy - 3); ctx.stroke();
    });
    // queue : trois plumes en éventail
    [['#c9873a', -64], ['#e0b062', -42], ['#a8662a', -22]].forEach(([col, ang]) => {
      ctx.save();
      ctx.translate(-20, -38);
      ctx.rotate((ang * Math.PI) / 180);
      ctx.fillStyle = col;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(-14, 0, 17, 6, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.restore();
    });
    // corps
    ctx.fillStyle = '#fbf5e9';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.ellipse(0, -34, 24, 18, -0.1, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    // aile (elle bat quand le poulet panique)
    ctx.save();
    ctx.translate(-4, -36);
    ctx.rotate(Math.sin(phase * 2) * (panic ? 0.5 : 0.12) - 0.1);
    ctx.fillStyle = '#e9d6ae';
    ctx.beginPath(); ctx.ellipse(0, 0, 14, 8, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.restore();
    // cou et tête
    ctx.fillStyle = '#fbf5e9';
    ctx.beginPath(); ctx.moveTo(10, -46); ctx.quadraticCurveTo(24, -50, 22, -62); ctx.lineTo(14, -60); ctx.quadraticCurveTo(12, -50, 4, -44); ctx.fill();
    ctx.beginPath(); ctx.arc(22, -64, 11, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    // crête
    ctx.fillStyle = '#e2452f';
    [[15, -75], [21, -78], [27, -75]].forEach(([cx, cy]) => { ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); });
    // barbillon, bec, œil
    ctx.beginPath(); ctx.ellipse(30, -54, 3.5, 6, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#f2a83a';
    ctx.beginPath(); ctx.moveTo(31, -66); ctx.lineTo(44, -62); ctx.lineTo(31, -58); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = INK;
    ctx.beginPath(); ctx.arc(26, -67, 2.4, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  function draw() {
    // ciel, soleil
    const sky = ctx.createLinearGradient(0, 0, 0, GROUND);
    sky.addColorStop(0, '#8ec5ff');
    sky.addColorStop(1, '#e8f6ff');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#ffd400';
    ctx.beginPath(); ctx.arc(660, 60, 28, 0, Math.PI * 2); ctx.fill();
    // grange et collines qui défilent lentement
    const px = (f) => (s.dist * PPM * f) % 900;
    ctx.fillStyle = '#9ccf7a';
    for (let k = -1; k < 3; k++) { ctx.beginPath(); ctx.ellipse(k * 450 - px(0.1) + 200, GROUND - 40, 260, 70, 0, Math.PI, 0); ctx.fill(); }
    for (let k = 0; k < 2; k++) {
      const bx = k * 900 - px(0.25) + 400;
      ctx.fillStyle = '#b3342a'; ctx.fillRect(bx, GROUND - 120, 110, 80);
      ctx.fillStyle = '#7e211b'; ctx.beginPath(); ctx.moveTo(bx - 8, GROUND - 120); ctx.lineTo(bx + 55, GROUND - 160); ctx.lineTo(bx + 118, GROUND - 120); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.fillRect(bx + 38, GROUND - 90, 34, 50);
    }
    // clôture
    ctx.fillStyle = '#c9a769';
    const fo = (s.dist * PPM * 0.6) % 60;
    for (let x = -fo; x < W; x += 60) ctx.fillRect(x, GROUND - 50, 8, 50);
    ctx.fillRect(0, GROUND - 42, W, 6);
    ctx.fillRect(0, GROUND - 24, W, 6);
    // chemin de terre
    ctx.fillStyle = '#a97b4e';
    ctx.fillRect(0, GROUND, W, H - GROUND);
    ctx.fillStyle = '#8f6539';
    for (let x = -((s.dist * PPM) % 70); x < W; x += 70) ctx.fillRect(x, GROUND + 26, 30, 5);
    ctx.fillStyle = '#5fae3f';
    ctx.fillRect(0, GROUND - 4, W, 8);
    s.obs.forEach(drawObstacle);
    // poulet : vrai dessin, qui court ; s'il est très loin, il reste au bord de l'écran avec une flèche
    const cm = s.dist + s.gap;
    const far = s.gap > 14.5;
    const cx = RX + Math.min(s.gap, 14.5) * PPM;
    let hop = Math.abs(Math.sin(s.t * 14)) * 5;
    s.obs.forEach((o) => { const d = Math.abs(o.m - cm); if (d < 1.2) hop = Math.max(hop, Math.cos((d / 1.2) * Math.PI / 2) * 44); });
    drawChicken(cx, GROUND - hop, s.t * 16, s.gap < 3);
    if (far) {
      ctx.fillStyle = '#e2452f';
      ctx.font = '900 20px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('→', W - 6, GROUND - 100);
    }
    if (s.cluckT > 0) {
      ctx.fillStyle = '#fff'; ctx.strokeStyle = '#1d1712'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.roundRect(cx - 40, GROUND - 118, 100, 24, 8); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#1d1712'; ctx.font = '700 13px Inter, sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(s.cluck, cx + 10, GROUND - 101);
    }
    if (s.hitT > 0) {
      ctx.fillStyle = '#e2452f';
      ctx.font = '900 24px Fraunces, serif';
      ctx.textAlign = 'center';
      ctx.fillText('Aïe !', RX + 10, GROUND - 130);
    }
    drawSylviane(ctx, RX, GROUND, { phase: s.dist * 1.9, air: s.y, amp: s.vS > 1 ? 1 : 0, jumping: s.y > 6, stumble: s.slow > 0 });
  }

  function frame(now) {
    if (!running) return;
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    s.t += dt;
    // vitesses : Sylviane accélère avec les sauts réussis, le poulet panique quand elle approche
    const base = 7.6 + Math.min(s.streak, 6) * 0.45;
    const targetS = s.slow > 0 ? base * 0.62 : base;
    s.vS += (targetS - s.vS) * Math.min(1, dt * 4);
    s.slow = Math.max(0, s.slow - dt);
    const vC = 7.5 + Math.sin(s.t * 1.1) * 0.8 + (s.gap < 3 ? 0.9 : 0);
    s.dist += s.vS * dt;
    s.gap += (vC - s.vS) * dt;
    // saut
    if (s.y > 0 || s.vy > 0) {
      s.y += s.vy * dt;
      s.vy -= G * dt;
      if (s.y <= 0) { s.y = 0; s.vy = 0; }
    }
    spawn();
    s.obs = s.obs.filter((o) => o.m > s.dist - 8);
    // collisions et obstacles franchis
    s.obs.forEach((o) => {
      const dx = Math.abs(o.m - s.dist) * PPM;
      if (!o.hit && !o.done && dx < o.t.w / 2 + 10 && s.y < o.t.h - 4) {
        o.hit = true;
        s.slow = 0.4;
        s.streak = Math.floor(s.streak / 2); // on perd la moitié de la série, pas tout
        s.hitT = 0.8;
        sfx.buzz();
      } else if (!o.hit && !o.done && o.m < s.dist - 0.5) {
        o.done = true;
        s.clear++;
        s.streak++;
        s.best = Math.max(s.best, s.streak);
        if (s.streak >= 2) sfx.ding();
      }
    });
    s.hitT = Math.max(0, s.hitT - dt);
    s.cluckT = Math.max(0, s.cluckT - dt);
    s.nextCluck -= dt;
    if (s.nextCluck <= 0) {
      s.cluck = CLUCKS[Math.floor(Math.random() * CLUCKS.length)];
      s.cluckT = 1.6;
      s.nextCluck = rand(3, 5);
    }
    timeEl.textContent = `⏱ ${Math.max(0, Math.ceil(TIME - s.t))} s`;
    gapEl.textContent = `Poulet à ${Math.max(0, s.gap).toFixed(1).replace('.', ',')} m`;
    streakEl.textContent = s.streak >= 2 ? `Série de ${s.streak} sauts` : `Obstacles franchis : ${s.clear}`;
    draw();
    if (s.gap <= CATCH_GAP) return win();
    if (s.gap >= LOSE_GAP || s.t >= TIME) return lose();
    raf = requestAnimationFrame(frame);
  }

  function show(html) {
    overlay.innerHTML = html;
    overlay.hidden = false;
  }

  function win() {
    running = false;
    draw();
    sfx.win();
    confetti({ particleCount: 140, spread: 90, origin: { y: 0.6 } });
    setTimeout(() => {
      overlay.classList.add('ck__overlay--oven');
      wrap.classList.add('is-oven'); // l'écran de jeu laisse la place au four
      show(`
        <div class="ck__ovenWrap">${ovenSVG()}</div>
        <h4>Poulet attrapé !</h4>
        <p>Au four à 200 °C, 1 h 15, comme tous les dimanches. ${s.clear} obstacles franchis, dont ${s.best} d’affilée. Sylviane n’a jamais perdu un poulet. Elle est juste en retard d’une saison de série.</p>
        <button class="btn btn--primary" data-ck="go">Un autre poulet</button>`);
    }, 700);
  }

  function lose() {
    running = false;
    draw();
    sfx.buzz();
    overlay.classList.remove('ck__overlay--oven');
    wrap.classList.remove('is-oven');
    show(`
      <h4>Le poulet s’est échappé !</h4>
      <p>Il court encore. Ce soir, ce sera des pâtes. Sylviane précise que la ferme était mal entretenue et que le canapé n’avait rien à faire là.</p>
      <button class="btn btn--primary" data-ck="go">Réessayer</button>`);
  }

  function start() {
    cancelAnimationFrame(raf);
    reset();
    overlay.hidden = true;
    overlay.classList.remove('ck__overlay--oven');
    wrap.classList.remove('is-oven');
    running = true;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }

  const onKey = (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
      e.preventDefault();
      jump();
    }
  };
  document.addEventListener('keydown', onKey);
  container.addEventListener('pointerdown', (e) => {
    if (e.target.closest('.ck__wrap') && !e.target.closest('button')) jump();
  });
  container.addEventListener('click', (e) => {
    if (e.target.closest('[data-ck]')) start();
  });
  new MutationObserver(() => {
    if (!container.contains(cv)) {
      running = false;
      cancelAnimationFrame(raf);
      document.removeEventListener('keydown', onKey);
    }
  }).observe(container, { childList: true });

  reset();
  spawn();
  draw();
  show(`
    <h4>C’est dimanche. Il faut un poulet.</h4>
    <p>Il y en a un dans la ferme, et il ne veut pas finir au four. Espace pour sauter les obstacles, y compris ceux qui n’ont rien à faire là.</p>
    <button class="btn btn--primary" data-ck="go">Courir après le poulet</button>`);
}
