import confetti from 'canvas-confetti';
import { sfx } from '../audio.js';

const DURATION = 60; // secondes d'épisode
const START = 75;
const COFFEE = { gain: 28, cooldown: 0.9, sips: 4, refill: 4, jitterAbove: 85 };
const CHOC = { gain: 12, cooldown: 0.35, squares: 12 };

const TITLES = [
  'Les Secrets de Plouescat',
  'Amours au Château',
  'Dîner chez les Dupont',
  'Docteur Mirabelle',
  'La Boulangère de Saint-Tropez',
];
const LINES = [
  '— Tu ne m’as jamais dit que tu avais un frère jumeau.\n— Je ne le savais pas non plus.',
  '— Le château est à vendre.\n— Mais c’est notre maison !',
  '— Je dois t’avouer quelque chose.\n— Pas devant toute la famille !',
  '— Le notaire est arrivé.\n— Il est toujours en retard, celui-là.',
  '— J’ai gardé ce secret trente ans.\n— Et tu comptes le garder jusqu’à quand ?',
  '— Elle n’est pas ma fille.\n— Elle ressemble pourtant à la voisine.',
  '— On ne dit pas du mal des morts.\n— Alors parlons des vivants.',
  '— Ce n’est pas ce que tu crois.\n— Je ne crois plus rien depuis l’épisode trois.',
];

const INK = '#1d1712';
const SQ_COLS = 6;

// Scène vue de profil : Sylviane assise dans son lit, plateau sur les genoux (café, chocolat).
function sceneSVG() {
  const base = import.meta.env.BASE_URL;
  const squares = Array.from({ length: CHOC.squares }, (_, i) =>
    `<rect class="sg__sq" x="${i % SQ_COLS * 15}" y="${Math.floor(i / SQ_COLS) * 12}" width="14" height="11" rx="2" fill="#5b3a29" stroke="#2f1d13" stroke-width="1.5"/>`
  ).join('');
  return `
  <svg class="sg__svg" viewBox="0 0 480 300" role="img" aria-label="Sylviane dans son lit, avec son plateau">
    <defs><clipPath id="sgclip"><circle cx="112" cy="84" r="34"/></clipPath></defs>
    <!-- lit -->
    <rect x="8" y="50" width="26" height="215" rx="8" fill="#8a5a3b" stroke="${INK}" stroke-width="3"/>
    <rect x="8" y="226" width="464" height="38" rx="6" fill="#8a5a3b" stroke="${INK}" stroke-width="3"/>
    <rect x="22" y="262" width="14" height="30" fill="#6b4329" stroke="${INK}" stroke-width="2"/>
    <rect x="444" y="262" width="14" height="30" fill="#6b4329" stroke="${INK}" stroke-width="2"/>
    <rect x="34" y="200" width="438" height="30" rx="8" fill="#fff" stroke="${INK}" stroke-width="3"/>
    <ellipse cx="78" cy="160" rx="32" ry="58" transform="rotate(-8 78 160)" fill="#fff" stroke="${INK}" stroke-width="3"/>
    <!-- Sylviane : buste, bras, tête -->
    <path d="M72 122 C 104 106, 142 118, 152 152 L 162 202 L 64 202 Z" fill="#f08a7b" stroke="${INK}" stroke-width="3"/>
    <g class="sg__head">
      <image href="${base}face.jpg" x="78" y="50" width="68" height="68" clip-path="url(#sgclip)" preserveAspectRatio="xMidYMid slice"/>
      <circle cx="112" cy="84" r="34" fill="none" stroke="${INK}" stroke-width="3"/>
      <text class="sg__emoji" x="112" y="98" text-anchor="middle" font-size="34"></text>
    </g>
    <text class="sg__zzz" x="150" y="44" font-size="22" font-weight="900" fill="#2b6cb0"></text>
    <!-- couette -->
    <path d="M152 192 Q 260 170 470 198 L 470 232 L 152 232 Z" fill="#7aa7e6" stroke="${INK}" stroke-width="3"/>
    <circle cx="210" cy="215" r="5" fill="#c9dcf7"/><circle cx="300" cy="212" r="5" fill="#c9dcf7"/><circle cx="390" cy="216" r="5" fill="#c9dcf7"/>
    <!-- plateau -->
    <rect x="186" y="187" width="8" height="30" fill="${INK}"/>
    <rect x="352" y="187" width="8" height="30" fill="${INK}"/>
    <rect x="170" y="176" width="204" height="11" rx="3" fill="#c9a769" stroke="${INK}" stroke-width="3"/>
    <!-- tasse -->
    <g transform="translate(196,142)">
      <path d="M34 8 q16 2 12 16 q-4 8 -14 6" fill="none" stroke="${INK}" stroke-width="4"/>
      <path d="M0 0 h34 v22 a12 12 0 0 1 -12 12 h-10 a12 12 0 0 1 -12 -12 z" fill="#fff" stroke="${INK}" stroke-width="3"/>
      <rect class="sg__coffee-level" x="3" y="4" width="28" height="22" rx="3" fill="#6b3e26"/>
      <path class="sg__steam" d="M10 -6 q-6 -8 0 -14 M22 -6 q-6 -8 0 -14" fill="none" stroke="#9aa3ad" stroke-width="3" stroke-linecap="round"/>
    </g>
    <!-- tablette de chocolat -->
    <g class="sg__bar-choc" transform="translate(268,152)">${squares}</g>
    <!-- bras et main vers la tasse -->
    <path d="M128 140 Q 168 160 214 158" fill="none" stroke="#f08a7b" stroke-width="15" stroke-linecap="round"/>
    <circle cx="216" cy="157" r="9" fill="#f2c9a5" stroke="${INK}" stroke-width="2.5"/>
  </svg>`;
}

export function startSeries(container) {
  let raf = 0, running = false, last = 0, s;

  container.innerHTML = `
    <div class="sg">
      <h3>Ne pas s’endormir devant la série</h3>
      <p class="sg__intro">Il est 15 h, l’heure de la sieste. Mais la série passe encore ! Sylviane, dans son lit avec son plateau, doit tenir ${DURATION} secondes d’épisode sans s’endormir. <b>C</b> pour une gorgée de café, <b>V</b> pour un carré de chocolat. Mais pas trop de café d’un coup…</p>
      <div class="sg__stage">
        ${sceneSVG()}
        <div class="sg__tvwrap">
          <div class="sg__tv">
            <div class="sg__title"></div>
            <div class="sg__lines"></div>
            <div class="sg__alert" hidden>Rebondissement !</div>
          </div>
          <div class="sg__stand"></div>
        </div>
      </div>
      <div class="sg__meters">
        <label>Attention <div class="sg__bar"><i class="sg__attn"></i></div></label>
        <label>Épisode <div class="sg__bar sg__bar--ep"><i class="sg__ep"></i></div></label>
      </div>
      <div class="sg__actions">
        <button class="btn btn--primary sg__btn" data-act="coffee">☕ Café <kbd>C</kbd><span class="sg__stock sg__coffee"></span></button>
        <button class="btn btn--primary sg__btn" data-act="choc">🍫 Chocolat <kbd>V</kbd><span class="sg__stock sg__choc"></span></button>
      </div>
      <p class="sg__msg" role="status"></p>
      <div class="sg__overlay"></div>
    </div>`;
  const $ = (q) => container.querySelector(q);
  const attnEl = $('.sg__attn'), epEl = $('.sg__ep'), msgEl = $('.sg__msg'), overlay = $('.sg__overlay');
  const emojiEl = $('.sg__emoji'), headEl = $('.sg__head'), linesEl = $('.sg__lines'), alertEl = $('.sg__alert');
  const coffeeEl = $('.sg__coffee'), chocEl = $('.sg__choc'), zzzEl = $('.sg__zzz');
  const levelEl = $('.sg__coffee-level'), steamEl = $('.sg__steam');
  const squares = [...container.querySelectorAll('.sg__sq')];

  const say = (t, kind = '') => {
    msgEl.textContent = t;
    msgEl.className = `sg__msg ${kind}`;
  };
  const show = (html) => {
    overlay.innerHTML = html;
    overlay.hidden = false;
  };

  function reset() {
    s = { a: START, t: 0, coffeeCd: 0, chocCd: 0, sips: COFFEE.sips, refill: 0, squares: CHOC.squares, twist: 0, nextTwist: 10, nextLine: 0, jitter: 0 };
    $('.sg__title').textContent = '📺 ' + TITLES[Math.floor(Math.random() * TITLES.length)];
    say('');
  }

  function render() {
    attnEl.style.width = Math.max(0, Math.min(100, s.a)) + '%';
    attnEl.style.background = s.a > 50 ? 'var(--good)' : s.a > 25 ? '#e0a100' : 'var(--tomato)';
    epEl.style.width = Math.min(100, (s.t / DURATION) * 100) + '%';
    emojiEl.textContent = s.a > 55 ? '' : s.a > 35 ? '😑' : s.a > 15 ? '🥱' : '😴';
    zzzEl.textContent = s.a <= 25 ? 'Z z z' : '';
    // la tête penche quand elle s'endort
    const tilt = s.a > 55 ? 0 : s.a > 35 ? 6 : s.a > 15 ? 14 : 24;
    headEl.setAttribute('transform', `rotate(${tilt} 112 125)`);
    headEl.classList.toggle('sg__head--jitter', s.jitter > 0);
    // tasse et chocolat
    const level = s.refill > 0 ? 0 : (s.sips / COFFEE.sips) * 22;
    levelEl.setAttribute('height', level);
    levelEl.setAttribute('y', 4 + (22 - level));
    steamEl.style.opacity = s.refill > 0 || s.sips === 0 ? 0 : 1;
    squares.forEach((q, i) => (q.style.display = i < CHOC.squares - s.squares ? 'none' : ''));
    coffeeEl.textContent = s.refill > 0 ? ' · la cafetière chauffe…' : ' · ' + '●'.repeat(s.sips) + '○'.repeat(COFFEE.sips - s.sips);
    chocEl.textContent = s.squares > 0 ? ' · ' + s.squares + ' carrés' : ' · plus de chocolat !';
    alertEl.hidden = s.twist <= 0;
  }

  function coffee() {
    if (!running || s.coffeeCd > 0 || s.refill > 0 || s.sips <= 0) return;
    s.coffeeCd = COFFEE.cooldown;
    s.sips--;
    if (s.sips === 0) s.refill = COFFEE.refill;
    if (s.a > COFFEE.jitterAbove) {
      s.a -= 12;
      s.jitter = 1.2;
      sfx.buzz();
      say('Trop de café d’un coup : Sylviane tremble et perd le fil.', 'bad');
    } else {
      s.a = Math.min(100, s.a + COFFEE.gain);
      sfx.ding();
      say('Une gorgée de café : ça réveille.', 'good');
    }
    render();
  }

  function choc() {
    if (!running || s.chocCd > 0 || s.squares <= 0) return;
    s.chocCd = CHOC.cooldown;
    s.squares--;
    s.a = Math.min(100, s.a + CHOC.gain);
    sfx.tile();
    say('Un carré de chocolat. Le deuxième est déjà dans sa main.', 'good');
    render();
  }

  function frame(now) {
    if (!running) return;
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    s.t += dt;
    s.coffeeCd = Math.max(0, s.coffeeCd - dt);
    s.chocCd = Math.max(0, s.chocCd - dt);
    s.jitter = Math.max(0, s.jitter - dt);
    if (s.refill > 0) {
      s.refill -= dt;
      if (s.refill <= 0) { s.refill = 0; s.sips = COFFEE.sips; say('Café prêt. Elle en reprend une tasse.', 'good'); }
    }
    // rebondissement : l'intrigue devient incompréhensible, l'attention s'effondre plus vite
    if (s.t > s.nextTwist) { s.twist = 4; s.nextTwist = s.t + 11 + Math.random() * 4; }
    s.twist = Math.max(0, s.twist - dt);
    const rate = (4 + (s.t / DURATION) * 3) * (s.twist > 0 ? 2 : 1);
    s.a -= rate * dt;
    if (s.t > s.nextLine) {
      linesEl.textContent = LINES[Math.floor(Math.random() * LINES.length)];
      s.nextLine = s.t + 4.5;
    }
    render();
    if (s.a <= 0) return end(false);
    if (s.t >= DURATION) return end(true);
    raf = requestAnimationFrame(frame);
  }

  function end(win) {
    running = false;
    if (win) {
      sfx.win();
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      show(`<h4>Elle a tenu jusqu’au générique !</h4>
        <p>Elle a même deviné la fin avant les personnages. Elle s’est endormie pendant le générique, ce qui compte à peine.</p>
        <button class="btn btn--primary" data-sg="go">Un autre épisode</button>`);
    } else {
      sfx.buzz();
      show(`<h4>ZzzZzz…</h4>
        <p>Sylviane s’est endormie avant la fin. Elle ne saura jamais le secret de famille, et elle le reprochera à la chaîne.</p>
        <button class="btn btn--primary" data-sg="go">Réveiller Sylviane</button>`);
    }
  }

  function start() {
    cancelAnimationFrame(raf);
    reset();
    linesEl.textContent = '';
    overlay.hidden = true;
    render();
    running = true;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }

  const onKey = (e) => {
    const k = e.key.toLowerCase();
    if (k === 'c') coffee();
    if (k === 'v') choc();
  };
  document.addEventListener('keydown', onKey);
  container.addEventListener('click', (e) => {
    const act = e.target.closest('[data-act]')?.dataset.act;
    if (act === 'coffee') coffee();
    if (act === 'choc') choc();
    if (e.target.closest('[data-sg]')) start();
  });
  new MutationObserver(() => {
    if (!container.contains(attnEl)) {
      running = false;
      cancelAnimationFrame(raf);
      document.removeEventListener('keydown', onKey);
    }
  }).observe(container, { childList: true });

  reset();
  render();
  show(`<h4>15 h : l’heure de la sieste…</h4>
    <p>Mais la série de l’après-midi vient de commencer. Gardez l’attention de Sylviane au-dessus de zéro pendant ${DURATION} secondes. Le café réveille vite, le chocolat réconforte, et les rebondissements fatiguent.</p>
    <button class="btn btn--primary" data-sg="go">Lancer l’épisode</button>`);
}
