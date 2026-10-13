import confetti from 'canvas-confetti';
import { sfx } from '../audio.js';
import { drawSylviane } from './sylviane.js';

const W = 760, H = 300;
const GROUND = 238;
const PPU = 8; // pixels par unité de distance
const RX = 170;
const TIME = 90; // secondes
const SPACING = 100; // distance entre deux panneaux de ville
const MAX_V = 10;
const DECAY = 1.5; // la vitesse retombe doucement
const STEP_ALT = 1.0; // gain en alternant gauche / droite
const STEP_SAME = 0.6; // gain si on répète la même touche : toléré, un peu moins efficace

const CITIES = [
  { name: 'PARIS', sky: ['#a8d8ff', '#fff3d6'], icon: '🗼', note: 'Sa ville préférée. Elle en connaît chaque boulangerie.' },
  { name: 'SÉVILLE', sky: ['#ffd29a', '#fff0d0'], icon: '💃', note: 'Près des remparts, évidemment. Elle fredonne la Habanera.' },
  { name: 'VIENNE', sky: ['#b7c7ff', '#f4f0ff'], icon: '🎻', note: 'Capitale de la musique. Elle réclame une meilleure acoustique.' },
  { name: 'BRUXELLES', sky: ['#ffe39a', '#fff7d8'], icon: '🍫', note: 'Ville du chocolat. Elle s’autorise un carré. Un seul. Enfin, deux.' },
  { name: 'VENISE', sky: ['#9fe3e0', '#eefcfb'], icon: '🛶', note: 'Arrivée. Elle trouve le gondolier trop cher.' },
];

export function startWalk(container) {
  let raf = 0, running = false, last = 0, s;

  container.innerHTML = `
    <div class="wk">
      <h3>Le tour du monde à pied</h3>
      <p class="wk__intro">Sylviane sillonne l’Europe à pied, sac au dos, bâton à la main, et elle marche vite. Appuyez sur <b>←</b> et <b>→</b>, de préférence en alternance (ou touchez l’écran, à gauche et à droite), pour la faire avancer. Cinq étapes à franchir en ${TIME} secondes. Où la mènera sa route ? C’est la surprise.</p>
      <div class="wk__hud"><span class="wk__time"></span><span class="wk__city"></span><span class="wk__speed"></span></div>
      <div class="wk__wrap">
        <canvas class="wk__canvas" width="${W}" height="${H}"></canvas>
        <div class="wk__overlay"></div>
      </div>
    </div>`;
  const cv = container.querySelector('canvas');
  const ctx = cv.getContext('2d');
  cv.width = W * 2; // rendu en double résolution : image nette sur écran moderne
  cv.height = H * 2;
  ctx.scale(2, 2);
  const overlay = container.querySelector('.wk__overlay');
  const timeEl = container.querySelector('.wk__time');
  const cityEl = container.querySelector('.wk__city');
  const speedEl = container.querySelector('.wk__speed');

  const reset = () => {
    s = { parisBye: false, x: 0, v: 0, t: TIME, lastKey: '', phase: 0, city: 0, toast: `${CITIES[0].name} : ${CITIES[0].note}`, toastT: 4.5, clouds: Array.from({ length: 5 }, (_, i) => i * 190) };
  };
  const show = (html) => {
    overlay.innerHTML = html;
    overlay.hidden = false;
  };

  function step(dir) {
    if (!running) return;
    // alterner est récompensé, mais répéter la même touche marche aussi
    s.v = Math.min(MAX_V, s.v + (dir === s.lastKey ? STEP_SAME : STEP_ALT));
    s.lastKey = dir;
  }

  const skyline = (seed, base, col, parallax, h) => {
    ctx.fillStyle = col;
    const off = (s.x * PPU * parallax) % 400;
    for (let k = -1; k < 6; k++) {
      for (let i = 0; i < 6; i++) {
        const bw = 36 + ((seed * 7 + i * 13) % 30), bh = h * (0.4 + (((seed + i * 17) % 10) / 10) * 0.6);
        ctx.fillRect(k * 400 - off + i * 66, base - bh, bw, bh);
      }
    }
  };

  function draw() {
    const idx = Math.min(CITIES.length - 1, Math.floor((s.x + 20) / SPACING));
    const c = CITIES[idx];
    const sky = ctx.createLinearGradient(0, 0, 0, GROUND);
    sky.addColorStop(0, c.sky[0]);
    sky.addColorStop(1, c.sky[1]);
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);
    // soleil et nuages
    ctx.fillStyle = 'rgba(255,255,255,.8)';
    s.clouds.forEach((cx, i) => {
      const x = (((cx - s.x * PPU * 0.05) % (W + 200)) + W + 200) % (W + 200) - 100;
      ctx.beginPath();
      ctx.ellipse(x, 40 + (i % 3) * 22, 46, 15, 0, 0, Math.PI * 2);
      ctx.fill();
    });
    // paysage lointain : silhouette + monument de la ville
    skyline(idx + 1, GROUND - 20, 'rgba(60,70,90,.18)', 0.12, 150);
    skyline(idx + 3, GROUND - 6, 'rgba(60,70,90,.32)', 0.3, 100);
    ctx.fillStyle = '#000'; // opaque : sinon les émojis deviennent transparents
    ctx.font = '120px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    // les monuments défilent avec leur ville
    CITIES.forEach((city, i) => {
      const x = RX + (i * SPACING - s.x) * PPU * 0.5 + 330;
      if (x > -150 && x < W + 150) ctx.fillText(city.icon, x, GROUND - 40);
    });
    // route
    ctx.fillStyle = '#6b6f78';
    ctx.fillRect(0, GROUND, W, H - GROUND);
    ctx.fillStyle = '#c9c3b6';
    ctx.fillRect(0, GROUND - 4, W, 8);
    ctx.fillStyle = '#f4efe3';
    for (let x = -((s.x * PPU) % 80); x < W; x += 80) ctx.fillRect(x, GROUND + 38, 40, 5);
    // panneaux de ville
    CITIES.forEach((city, i) => {
      const x = RX + (i * SPACING - s.x) * PPU + 200;
      if (x < -120 || x > W + 120) return;
      ctx.fillStyle = '#555';
      ctx.fillRect(x - 3, GROUND - 100, 6, 100);
      ctx.fillStyle = '#fff';
      ctx.strokeStyle = '#c0261f';
      ctx.lineWidth = 5;
      const w = 22 + city.name.length * 13;
      ctx.beginPath();
      ctx.roundRect(x - w / 2, GROUND - 130, w, 34, 5);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#1d1712';
      ctx.font = '700 17px Inter, sans-serif';
      ctx.fillText(city.name, x, GROUND - 107);
    });
    drawSylviane(ctx, RX, GROUND + 20, { phase: s.phase, amp: Math.min(1, 0.25 + s.v / 8), backpack: true, stick: true, hat: true });
    if (s.toastT > 0) {
      ctx.fillStyle = 'rgba(29,23,18,.86)';
      ctx.beginPath();
      ctx.roundRect(60, 14, W - 120, 36, 10);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = '600 15px Inter, sans-serif';
      ctx.fillText(s.toast, W / 2, 38);
    }
  }

  function frame(now) {
    if (!running) return;
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    s.t -= dt;
    s.v = Math.max(0, s.v - dt * DECAY); // la vitesse retombe vite si on arrête de marcher
    s.x += s.v * dt;
    s.phase += s.v * dt * 1.4;
    s.toastT = Math.max(0, s.toastT - dt);
    // elle quitte Paris : un dernier mot
    if (!s.parisBye && s.x >= 25) {
      s.parisBye = true;
      s.toast = 'Au revoir, Paris ! Elle y reviendra, comme chaque fois.';
      s.toastT = 3.2;
    }
    // panneau franchi ?
    const reached = Math.floor((s.x - 25) / SPACING); // le panneau est à 25 unités devant le départ de la zone
    if (reached > s.city && reached < CITIES.length) {
      s.city = reached;
      s.toast = `${CITIES[reached].name} : ${CITIES[reached].note}`;
      s.toastT = 3.2;
      sfx.ding();
    }
    const idx = Math.min(CITIES.length - 1, Math.floor((s.x + 20) / SPACING));
    timeEl.textContent = `⏱ ${Math.max(0, Math.ceil(s.t))} s`;
    cityEl.textContent = `Étape ${Math.min(s.city + 1, CITIES.length)} / ${CITIES.length}`; // les noms des villes restent une surprise
    speedEl.textContent = `${Math.round(s.v * 0.9 + (s.v > 0 ? 2 : 0))} km/h`;
    draw();
    if (s.city >= CITIES.length - 1 && s.x >= (CITIES.length - 1) * SPACING + 40) return end(true);
    if (s.t <= 0) return end(false);
    raf = requestAnimationFrame(frame);
  }

  function end(win) {
    running = false;
    if (win) {
      sfx.win();
      confetti({ particleCount: 140, spread: 90, origin: { y: 0.6 } });
      show(`<h4>Tour d’Europe bouclé en ${Math.round(TIME - s.t)} secondes !</h4>
        <p>Cinq étapes, sac au dos, sans une goutte de sueur. Sylviane demande une pause, un banc au soleil et une réduction pour retraités.</p>
        <button class="btn btn--primary" data-wk="go">Repartir</button>`);
    } else {
      show(`<h4>Le temps est écoulé.</h4>
        <p>Sylviane n’est pas arrivée. Elle précise que c’est la faute du train, des chaussures et du prix du billet.</p>
        <button class="btn btn--primary" data-wk="go">Réessayer</button>`);
    }
  }

  function start() {
    cancelAnimationFrame(raf);
    reset();
    overlay.hidden = true;
    running = true;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }

  const onKey = (e) => {
    if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'q' || e.key.toLowerCase() === 'a') step('L');
    if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') step('R');
    if (['ArrowLeft', 'ArrowRight'].includes(e.key)) e.preventDefault();
  };
  document.addEventListener('keydown', onKey);
  container.addEventListener('pointerdown', (e) => {
    const wrap = e.target.closest('.wk__wrap');
    if (!wrap || e.target.closest('button')) return;
    const r = wrap.getBoundingClientRect();
    step(e.clientX - r.left < r.width / 2 ? 'L' : 'R');
  });
  container.addEventListener('click', (e) => {
    if (e.target.closest('[data-wk]')) start();
  });
  new MutationObserver(() => {
    if (!container.contains(cv)) {
      running = false;
      cancelAnimationFrame(raf);
      document.removeEventListener('keydown', onKey);
    }
  }).observe(container, { childList: true });

  reset();
  draw();
  show(`<h4>Sac sur le dos, chaussures aux pieds !</h4>
    <p>Appuyez sur ← et → le plus vite possible, en alternance c’est mieux. Si vous arrêtez, Sylviane ralentit et commence à commenter.</p>
    <button class="btn btn--primary" data-wk="go">C’est parti</button>`);
}
