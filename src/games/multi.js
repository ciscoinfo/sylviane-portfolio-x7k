import confetti from 'canvas-confetti';
import { gameAudio } from '../audio.js';
import * as T from '../data/dialogues.js';

// « Tout en même temps » : de 12 h à 15 h, Sylviane gère le four, le micro-ondes, le Scrabble,
// WhatsApp, l'assistant IA, la tablette et la vaisselle. Chaque chose a son propre signal,
// à la fois sonore et visuel (onomatopées « DRING ! », « TIC / TAC », bulles de dialogue sur les images),
// pour que le jeu reste jouable avec le son coupé.
const LEN = 85; // secondes de jeu (= 3 heures dans la journée de Sylviane)
const HEARTS = 5;
const SWAP_EVERY = 7;
const SLOW = 1.2; // facteur de ralentissement des événements

/* ---------------- Dessins ---------------- */
const INK = '#1d1712';
const ICONS = {
  oven: `<svg viewBox="0 0 100 80" aria-hidden="true">
    <rect x="6" y="4" width="88" height="72" rx="8" fill="#e3e7ec" stroke="${INK}" stroke-width="3"/>
    <rect x="6" y="4" width="88" height="19" rx="8" fill="#c9ced6" stroke="${INK}" stroke-width="3"/>
    ${[18, 31, 44].map((x) => `<circle cx="${x}" cy="13.5" r="4.2" fill="#333" stroke="${INK}" stroke-width="1.2"/><line x1="${x}" y1="13.5" x2="${x + 2.4}" y2="10.4" stroke="#fff" stroke-width="1.4" stroke-linecap="round"/>`).join('')}
    <rect x="60" y="8" width="29" height="11" rx="2.5" fill="#111"/>
    <text class="ov-digits" x="74.5" y="16.8" text-anchor="middle" font-size="8" font-family="monospace" font-weight="700" fill="#ff6a3d">0:00</text>
    <rect x="13" y="29" width="74" height="41" rx="6" fill="#1b1b1b" stroke="${INK}" stroke-width="2.5"/>
    <rect class="ov-glow" x="16" y="32" width="68" height="35" rx="4" fill="#ff9a3c"/>
    <line x1="20" y1="60" x2="80" y2="60" stroke="#6b4a1f" stroke-width="2"/>
    <g class="ov-chicken">
      <ellipse cx="50" cy="52" rx="19" ry="9.5" fill="#c9822f" stroke="#7a3f12" stroke-width="1.6"/>
      <ellipse cx="33" cy="57" rx="6" ry="3.6" transform="rotate(-25 33 57)" fill="#c9822f" stroke="#7a3f12" stroke-width="1.4"/>
      <ellipse cx="67" cy="57" rx="6" ry="3.6" transform="rotate(25 67 57)" fill="#c9822f" stroke="#7a3f12" stroke-width="1.4"/>
      <ellipse cx="44" cy="48" rx="8" ry="3" fill="rgba(255,255,255,.3)"/>
    </g>
    <rect x="18" y="24.5" width="64" height="3.2" rx="1.6" fill="#9aa3ad" stroke="${INK}" stroke-width="1"/>
  </svg>`,
  micro: `<svg viewBox="0 0 100 70" aria-hidden="true">
    <rect x="3" y="6" width="94" height="58" rx="7" fill="#d7dbe0" stroke="${INK}" stroke-width="3"/>
    <rect x="10" y="13" width="58" height="44" rx="5" fill="#222" stroke="${INK}" stroke-width="1.5"/>
    <rect class="mw-glass" x="13" y="16" width="52" height="38" rx="4" fill="#ffe3a3"/>
    <ellipse cx="39" cy="48" rx="17" ry="4" fill="#fff" stroke="${INK}" stroke-width="1.6"/>
    <path d="M30 34 h18 v10 a6 6 0 0 1 -6 6 h-6 a6 6 0 0 1 -6 -6 z" fill="#fff" stroke="${INK}" stroke-width="1.6"/>
    <path d="M48 37 q7 0 5 6 q-1 3 -5 3" fill="none" stroke="${INK}" stroke-width="1.6"/>
    <path d="M32 36 h14 v4 h-14 z" fill="#6b3e26"/>
    <rect x="74" y="13" width="17" height="10" rx="2" fill="#111"/>
    <text class="mw-digits" x="82.5" y="21" text-anchor="middle" font-size="7" font-family="monospace" font-weight="700" fill="#7CFC8A">0:00</text>
    <circle cx="82.5" cy="34" r="6" fill="#555" stroke="${INK}" stroke-width="1.4"/>
    <line x1="82.5" y1="34" x2="86" y2="30.6" stroke="#fff" stroke-width="1.4" stroke-linecap="round"/>
    <rect x="75" y="44" width="15" height="6" rx="2" fill="#666"/><rect x="75" y="52" width="15" height="6" rx="2" fill="#666"/>
  </svg>`,
  scrabble: `<svg viewBox="0 0 100 80" aria-hidden="true">
    <rect x="3" y="3" width="94" height="74" rx="6" fill="#2f7d4f" stroke="${INK}" stroke-width="3"/>
    ${[0, 1, 2, 3].map((r) => [0, 1, 2, 3, 4].map((c) => `<rect x="${9 + c * 17}" y="${9 + r * 17}" width="16" height="16" rx="2" fill="${(r + c) % 4 === 1 ? '#d9534f' : '#3c9560'}" stroke="rgba(0,0,0,.25)" stroke-width="1"/>`).join('')).join('')}
    ${[['Z', 26, 26], ['E', 43, 26], ['K', 60, 26], ['W', 43, 9], ['U', 43, 43]].map(([l, x, y]) => `<g class="sb-tile"><rect x="${x}" y="${y}" width="16" height="16" rx="2.5" fill="#ecd29b" stroke="#a57f3d" stroke-width="1.6"/><text x="${x + 8}" y="${y + 12.5}" text-anchor="middle" font-size="11" font-weight="800" font-family="Inter, sans-serif" fill="${INK}">${l}</text></g>`).join('')}
  </svg>`,
  phone: `<svg viewBox="0 0 70 84" aria-hidden="true">
    <g class="ph-waves" fill="none" stroke="#e2452f" stroke-width="3" stroke-linecap="round"><path d="M6 20 q-5 12 0 24"/><path d="M0 14 q-8 18 0 36"/><path d="M64 20 q5 12 0 24"/><path d="M70 14 q8 18 0 36"/></g>
    <rect x="14" y="4" width="42" height="76" rx="8" fill="#222" stroke="${INK}" stroke-width="3"/>
    <rect x="18" y="12" width="34" height="58" rx="3" fill="#25d366"/>
    <path d="M24 28 h22 a4 4 0 0 1 4 4 v10 a4 4 0 0 1 -4 4 h-12 l-6 6 v-6 h-4 a4 4 0 0 1 -4 -4 v-10 a4 4 0 0 1 4 -4 z" fill="#fff"/>
    <circle cx="35" cy="75" r="2.4" fill="#666"/>
  </svg>`,
  ai: `<svg viewBox="0 0 80 84" aria-hidden="true">
    <line x1="40" y1="6" x2="40" y2="16" stroke="${INK}" stroke-width="3"/><circle cx="40" cy="6" r="4" fill="#e2452f" stroke="${INK}" stroke-width="2"/>
    <rect x="10" y="16" width="60" height="46" rx="12" fill="#c9d6ff" stroke="${INK}" stroke-width="3"/>
    <rect x="16" y="24" width="48" height="26" rx="8" fill="#1e2b4f"/>
    <circle class="ai-eye" cx="29" cy="37" r="5" fill="#7cf5ff"/><circle class="ai-eye" cx="51" cy="37" r="5" fill="#7cf5ff"/>
    <g class="ai-dots" fill="#7cf5ff" opacity="0"><circle cx="30" cy="56" r="2.6"/><circle cx="40" cy="56" r="2.6"/><circle cx="50" cy="56" r="2.6"/></g>
    <rect x="22" y="64" width="36" height="14" rx="5" fill="#9fb4f5" stroke="${INK}" stroke-width="2.5"/>
  </svg>`,
  tablet: `<svg viewBox="0 0 100 74" aria-hidden="true">
    <rect x="4" y="4" width="92" height="66" rx="9" fill="#2b2b2b" stroke="${INK}" stroke-width="3"/>
    <rect x="10" y="10" width="80" height="54" rx="3" fill="#eaf3ff"/>
    <rect x="30" y="24" width="40" height="26" rx="3" fill="#fff" stroke="#3a6ea5" stroke-width="2.4"/>
    <path d="M30 26 l20 14 l20 -14" fill="none" stroke="#3a6ea5" stroke-width="2.4" stroke-linejoin="round"/>
    <circle class="tb-dot" cx="70" cy="24" r="6" fill="#e2452f" stroke="#fff" stroke-width="2" opacity="0"/>
  </svg>`,
  dishes: `<svg viewBox="0 0 130 92" aria-hidden="true">
    <rect x="0" y="76" width="130" height="16" fill="#b08968"/><rect x="0" y="76" width="130" height="3" fill="#8a6a4e"/>
    <path d="M58 44 h66 v28 a6 6 0 0 1 -6 6 h-54 a6 6 0 0 1 -6 -6 z" fill="#d5dbe2" stroke="${INK}" stroke-width="2.6"/>
    <rect x="62" y="56" width="58" height="18" rx="3" fill="#9fd3ee"/>
    <circle cx="70" cy="56" r="3.4" fill="#fff"/><circle cx="82" cy="54" r="4.4" fill="#fff"/><circle cx="96" cy="57" r="3" fill="#fff"/><circle cx="108" cy="55" r="4" fill="#fff"/>
    <path d="M96 44 V30 q0 -8 -9 -8 q-7 0 -7 7 v4" fill="none" stroke="#9aa3ad" stroke-width="5" stroke-linecap="round"/>
    <rect x="76" y="31" width="9" height="5" rx="1.5" fill="#9aa3ad"/>
    <g class="dish-plates">${Array.from({ length: 10 }, (_, i) => `<g class="dish-plate"><ellipse cx="30" cy="${73 - i * 4.4}" rx="22" ry="5" fill="#fff" stroke="${INK}" stroke-width="1.6"/><ellipse cx="30" cy="${73 - i * 4.4}" rx="14" ry="2.9" fill="#e4edf6"/></g>`).join('')}</g>
    <g class="dish-x1"><ellipse cx="108" cy="46" rx="16" ry="4" fill="#8a8f98" stroke="${INK}" stroke-width="1.8"/><rect x="122" y="42" width="14" height="4" rx="2" fill="#555"/></g>
    <g class="dish-x2"><path d="M18 22 l2 -17 h12 l2 17 z" transform="translate(0 6)" fill="rgba(180,220,245,.8)" stroke="${INK}" stroke-width="1.6"/><path d="M38 28 h14 v10 a5 5 0 0 1 -5 5 h-4 a5 5 0 0 1 -5 -5 z" transform="translate(-4 0)" fill="#fff" stroke="${INK}" stroke-width="1.6"/></g>
    <g class="dish-x3"><ellipse cx="30" cy="3" rx="20" ry="4.5" transform="rotate(-14 30 3)" fill="#fff" stroke="${INK}" stroke-width="1.6"/><path d="M24 -6 h12 v8 a5 5 0 0 1 -5 5 h-2 a5 5 0 0 1 -5 -5 z" fill="#ffd27a" stroke="${INK}" stroke-width="1.6"/></g>
  </svg>`,
  plant: '<span class="mt__emoji">🪴</span>',
};

const DEF = {
  oven: 'Four',
  micro: 'Micro-ondes',
  scrabble: 'Scrabble',
  phone: 'WhatsApp',
  ai: 'Assistant IA',
  tablet: 'Tablette',
  dishes: 'Vaisselle',
  plant: 'Plante',
};
const IDS = Object.keys(DEF);

// Sac de tirage : tous les éléments sont tirés une fois (dans le désordre) avant qu'un seul ne revienne.
function deck(list) {
  let bag = [], lastItem = null;
  return {
    next() {
      if (!bag.length) {
        bag = [...list].sort(() => Math.random() - 0.5);
        // jamais deux fois de suite le même, même après remélange
        if (bag.length > 1 && bag[bag.length - 1] === lastItem) bag.unshift(bag.pop());
      }
      lastItem = bag.pop();
      return lastItem;
    },
  };
}
function makeDecks() {
  return {
    call: deck(T.CALL), word: deck(T.SCRABBLE_WORDS), react: deck(T.SCRABBLE_REACTIONS), scrMiss: deck(T.SCRABBLE_MISS),
    ovenGood: deck(T.OVEN_GOOD), ovenBad: deck(T.OVEN_BAD), microGood: deck(T.MICRO_GOOD), microBad: deck(T.MICRO_BAD),
    phoneGood: deck(T.PHONE_GOOD), phoneMissLine: deck(T.PHONE_MISS_LINE), phoneMissRing: deck(T.PHONE_MISS_RING), phoneBye: deck(T.PHONE_BYE),
    aiReady: deck(T.AI_READY), aiGood: deck(T.AI_GOOD), aiBad: deck(T.AI_BAD),
    mail: deck(T.MAILS), dishGood: deck(T.DISH_GOOD), dishBad: deck(T.DISH_BAD), plant: deck(T.PLANT),
  };
}
const MULT = [1, 1, 1, 2, 3]; // cases compte double / triple au Scrabble
const multLabel = (m) => (m === 2 ? ' (mot compte double)' : m === 3 ? ' (mot compte triple)' : '');

const rnd = (a, b) => a + Math.random() * (b - a);
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const shuffle = (a) => [...a].sort(() => Math.random() - 0.5);
const mixRGB = (c1, c2, t) => `rgb(${c1.map((v, i) => Math.round(v + (c2[i] - v) * t)).join(',')})`;
const fmtClock = (t) => {
  const min = 12 * 60 + (t / LEN) * 180;
  return `${Math.floor(min / 60)} h ${String(Math.floor(min % 60)).padStart(2, '0')}`;
};

export function startMulti(container) {
  let raf = 0, running = false, last = 0, s, stopHum = null;

  container.innerHTML = `
    <div class="mt">
      <h3>Tout en même temps</h3>
      <p class="mt__intro">De 12 h à 15 h, avant la sieste, Sylviane gère tout à la fois. <b>Guettez les signaux</b> (sons, « DRING ! », bulles de dialogue) et cliquez sur la bonne case au bon moment. Les cases changent de place !</p>
      <div class="mt__hud"><span class="mt__clock"></span><span class="mt__done"></span><span class="mt__lives"></span></div>
      <div class="mt__stage">
        ${IDS.map((id) => `
          <button class="mt__tile mt__tile--${id}" data-id="${id}" type="button">
            <span class="mt__badge"></span>
            <span class="mt__icon">${ICONS[id]}</span>
            <b>${DEF[id]}</b>
            <small class="mt__status"></small>
            <u class="mt__bar"><em></em></u>
          </button>`).join('')}
      </div>
      <p class="mt__msg" role="status"></p>
      <div class="mt__overlay"></div>
    </div>`;
  const $ = (q) => container.querySelector(q);
  const stageEl = $('.mt__stage');
  const tile = Object.fromEntries(IDS.map((id) => [id, $(`[data-id="${id}"]`)]));
  const clockEl = $('.mt__clock'), doneEl = $('.mt__done'), livesEl = $('.mt__lives');
  const msgEl = $('.mt__msg'), overlay = $('.mt__overlay');

  const say = (t, kind = '') => { msgEl.textContent = t; msgEl.className = `mt__msg ${kind}`; };
  const show = (html) => { overlay.innerHTML = html; overlay.hidden = false; };
  const setStatus = (id, t) => (tile[id].querySelector('.mt__status').textContent = t);
  const setBadge = (id, t) => (tile[id].querySelector('.mt__badge').textContent = t);
  const setAlert = (id, on) => tile[id].classList.toggle('is-alert', on);
  const q = (id, sel) => tile[id].querySelector(sel);

  /* ---- bulles et onomatopées posées directement sur les images ---- */
  function placeSpeech(sp) {
    const t = tile[sp.id];
    const el = sp.el;
    const W = stageEl.clientWidth;
    const w = el.offsetWidth;
    let x, y;
    if (sp.kind === 'child' || sp.kind === 'her') {
      x = t.offsetLeft + t.offsetWidth / 2;
      y = t.offsetTop + 14; // la bulle se pose au-dessus de l'image, sa queue pointe dessus
    } else {
      x = t.offsetLeft + t.offsetWidth * 0.74; // onomatopée : coin de l'image
      y = t.offsetTop + t.offsetHeight * 0.3;
    }
    x = Math.max(w / 2 + 4, Math.min(W - w / 2 - 4, x));
    el.style.left = x + 'px';
    el.style.top = y + 'px';
  }
  function speak(id, kind, html, ms = 0) {
    const key = id + ':' + kind;
    let sp = s.speech[key];
    if (!sp) {
      const el = document.createElement('div');
      stageEl.appendChild(el);
      sp = s.speech[key] = { id, kind, el };
    }
    const cls = `mt__speech mt__speech--${kind}`;
    if (sp.el.className !== cls) sp.el.className = cls; // on évite de relancer l'animation à chaque image
    if (sp.html !== html) { sp.el.innerHTML = html; sp.html = html; }
    sp.until = ms ? s.t + ms / 1000 : Infinity;
    placeSpeech(sp);
    return sp;
  }
  function unspeak(id, kind) {
    const key = id + ':' + kind;
    if (s.speech[key]) { s.speech[key].el.remove(); delete s.speech[key]; }
  }
  const clearSpeech = (id) => Object.keys(s.speech).filter((k) => k.startsWith(id + ':')).forEach((k) => { s.speech[k].el.remove(); delete s.speech[k]; });

  function hud() {
    clockEl.textContent = '🕛 ' + fmtClock(s.t);
    doneEl.textContent = `Réussi : ${s.done}`;
    livesEl.textContent = 'Patience : ' + '❤️'.repeat(s.hearts) + '🖤'.repeat(HEARTS - s.hearts);
  }
  const ease = () => 1 - 0.25 * (s.t / LEN); // les événements s'accélèrent un peu au fil de la journée
  const gap = (a, b) => rnd(a, b) * SLOW * ease();

  function good(msg) { s.done++; say(msg, 'good'); gameAudio.ring('good'); hud(); }
  function bad(msg) {
    s.hearts--;
    say(msg, 'bad');
    gameAudio.ring('bad');
    hud();
    if (s.hearts <= 0) end(false);
  }

  /* ---- les choses à gérer : chacune a un état, un signal et un délai pour réagir ---- */
  const P = {
    oven: {
      init: () => ({ st: 'cook', t: gap(8, 12), due: 0, ring: 0, tt: -1 }),
      tick(p, dt) {
        if (p.st === 'cook') {
          p.t -= dt;
          const sec = Math.max(0, Math.ceil(p.t));
          q('oven', '.ov-digits').textContent = `0:${String(sec).padStart(2, '0')}`;
          setStatus('oven', `⏲ ${sec} s`);
          // dans les 5 dernières secondes : TIC / TAC de plus en plus fort et de plus en plus rouge
          if (p.t <= 5 && p.t > 0) {
            const phase = Math.floor(p.t * 2) % 2;
            const k = (5 - p.t) / 5;
            const sp = speak('oven', 'tic', phase ? 'TIC' : 'TAC');
            sp.el.style.fontSize = 1 + k * 1.4 + 'rem';
            sp.el.style.color = mixRGB([224, 161, 0], [226, 69, 47], k);
            if (phase !== p.tt) { gameAudio.ring(phase ? 'tic' : 'tac'); p.tt = phase; }
            tile.oven.classList.toggle('is-tense', k > 0.5);
          }
          if (p.t <= 0) { unspeak('oven', 'tic'); tile.oven.classList.remove('is-tense'); p.st = 'ring'; p.due = 6.5; p.ring = 0; setBadge('oven', '⏰'); setAlert('oven', true); speak('oven', 'sfx', 'DRING ! DRING !'); }
        } else {
          p.due -= dt;
          p.ring -= dt;
          if (p.ring <= 0) { gameAudio.ring('oven'); p.ring = 1.6; }
          setStatus('oven', 'Le minuteur sonne !');
          if (p.due <= 0) { bad(s.d.ovenBad.next()); this.reset(p); }
        }
        return p.st === 'ring' ? p.due / 6.5 : 0;
      },
      click(p) {
        if (p.st === 'cook') return say('Pas encore : le poulet cuit.');
        good(s.d.ovenGood.next());
        this.reset(p);
      },
      reset(p) { p.st = 'cook'; p.t = gap(9, 14); p.tt = -1; clearSpeech('oven'); tile.oven.classList.remove('is-tense'); setBadge('oven', ''); setAlert('oven', false); },
    },
    micro: {
      init: () => ({ st: 'idle', t: gap(4, 8), run: 0, due: 0 }),
      tick(p, dt) {
        if (p.st === 'idle') {
          p.t -= dt;
          setStatus('micro', 'Libre');
          q('micro', '.mw-digits').textContent = '0:00';
          if (p.t <= 0) { p.st = 'run'; p.run = rnd(4, 6); stopHum = gameAudio.humStart(); tile.micro.classList.add('is-busy'); setBadge('micro', '🌀'); speak('micro', 'soft', 'bzzzzz…'); }
        } else if (p.st === 'run') {
          p.run -= dt;
          const sec = Math.max(0, Math.ceil(p.run));
          q('micro', '.mw-digits').textContent = `0:0${sec}`;
          setStatus('micro', `Ça tourne : ${sec} s`);
          if (p.run <= 0) {
            stopHum && stopHum(); stopHum = null;
            gameAudio.ring('ding');
            unspeak('micro', 'soft');
            p.st = 'done'; p.due = 5.5;
            tile.micro.classList.remove('is-busy');
            setBadge('micro', '🔔'); setAlert('micro', true);
            speak('micro', 'sfx', 'DING !');
          }
        } else {
          p.due -= dt;
          setStatus('micro', 'Ding ! C’est prêt');
          if (p.due <= 0) { bad(s.d.microBad.next()); this.reset(p); }
        }
        return p.st === 'done' ? p.due / 5.5 : 0;
      },
      click(p) {
        if (p.st === 'idle') return say('Il est vide. Elle n’a rien à réchauffer.');
        if (p.st === 'run') return say('Ça tourne encore : il ne faut pas l’ouvrir.');
        good(s.d.microGood.next());
        this.reset(p);
      },
      reset(p) { if (stopHum) { stopHum(); stopHum = null; } p.st = 'idle'; p.t = gap(8, 14); clearSpeech('micro'); setBadge('micro', ''); setAlert('micro', false); tile.micro.classList.remove('is-busy'); },
    },
    scrabble: {
      init: () => ({ st: 'wait', t: gap(7, 12), due: 0, word: '' }),
      tick(p, dt) {
        if (p.st === 'wait') {
          p.t -= dt;
          setStatus('scrabble', 'L’adversaire réfléchit…');
          if (p.t <= 0) { p.st = 'turn'; p.due = 7.5; p.word = s.d.word.next(); p.mult = pick(MULT); p.pts = T.scrabblePoints(p.word) * p.mult; gameAudio.ring('clack'); setBadge('scrabble', '🎲'); setAlert('scrabble', true); speak('scrabble', 'sfx', 'CLAC !'); speak('scrabble', 'child', `<small>L’adversaire joue</small><b>${p.word}</b> ${p.pts} points${multLabel(p.mult)}. À vous !`); }
        } else {
          p.due -= dt;
          setStatus('scrabble', `Il a joué ${p.word} (${p.pts} pts) : à elle !`);
          if (p.due <= 0) { bad(s.d.scrMiss.next()); this.reset(p); }
        }
        return p.st === 'turn' ? p.due / 7.5 : 0;
      },
      click(p) {
        if (p.st === 'wait') return say('Ce n’est pas encore son tour.');
        {
          const w = s.d.word.next(), m = pick(MULT), pts = T.scrabblePoints(w) * m;
          good(`Elle joue ${w} : ${pts} points${multLabel(m)}. ${s.d.react.next()}`);
        }
        this.reset(p);
      },
      reset(p) { p.st = 'wait'; p.t = gap(9, 15); clearSpeech('scrabble'); setBadge('scrabble', ''); setAlert('scrabble', false); },
    },
    phone: {
      init: () => ({ st: 'idle', t: gap(9, 14), due: 0, ring: 0, line: 0, lines: [], pause: 0 }),
      tick(p, dt) {
        if (p.st === 'idle') {
          p.t -= dt;
          setStatus('phone', 'Silence');
          if (p.t <= 0) { p.st = 'ring'; p.due = 7.5; p.ring = 0; setBadge('phone', '📞'); setAlert('phone', true); tile.phone.classList.add('is-ringing'); speak('phone', 'sfx', 'BRRING ! BRRING !'); speak('phone', 'child', '<small>📱 Appel WhatsApp</small>Son enfant vous appelle…'); }
        } else if (p.st === 'ring') {
          p.due -= dt; p.ring -= dt;
          if (p.ring <= 0) { gameAudio.ring('phone'); p.ring = 2.2; }
          setStatus('phone', 'Appel de son enfant !');
          if (p.due <= 0) { bad(s.d.phoneMissRing.next()); this.reset(p); }
        } else if (p.st === 'pause') {
          p.pause -= dt;
          setStatus('phone', 'En ligne');
          if (p.pause <= 0) this.nextLine(p);
        } else if (p.st === 'line') {
          p.due -= dt;
          setStatus('phone', 'Elle doit répondre !');
          if (p.due <= 0) { unspeak('phone', 'child'); bad(s.d.phoneMissLine.next()); this.after(p); }
        }
        return p.st === 'ring' ? p.due / 7.5 : p.st === 'line' ? p.due / 6 : 0;
      },
      nextLine(p) {
        p.st = 'line';
        p.due = 6;
        gameAudio.ring('pop');
        unspeak('phone', 'her');
        speak('phone', 'child', `<small>📱 Son enfant dit :</small>${p.lines[p.line][0]}`);
        setBadge('phone', '💬');
        setAlert('phone', true);
      },
      after(p) {
        p.line++;
        setAlert('phone', false);
        if (p.line >= p.lines.length) { speak('phone', 'child', `<small>📱 Son enfant dit :</small>${s.d.phoneBye.next()}`, 2600); this.reset(p, true); }
        else { p.st = 'pause'; p.pause = rnd(2.8, 4.2); setBadge('phone', '📱'); }
      },
      click(p) {
        if (p.st === 'idle') return say('Le téléphone ne sonne pas.');
        if (p.st === 'pause') return say('Elle écoute son enfant parler.');
        if (p.st === 'ring') {
          p.lines = Array.from({ length: s.t > LEN * 0.5 ? 4 : 3 }, () => s.d.call.next()); // tirées dans un sac commun à tous les appels
          p.line = 0;
          tile.phone.classList.remove('is-ringing');
          unspeak('phone', 'sfx'); unspeak('phone', 'child');
          speak('phone', 'her', '<small>Sylviane</small>Allô ? Oui, je suis là !', 1800);
          setBadge('phone', '📱'); setAlert('phone', false);
          p.st = 'pause';
          p.pause = 2;
          return;
        }
        // elle répond à la phrase en cours
        unspeak('phone', 'child');
        speak('phone', 'her', `<small>Sylviane répond :</small>${p.lines[p.line][1]}`, 3200);
        good(s.d.phoneGood.next());
        this.after(p);
      },
      reset(p, keepSpeech) {
        p.st = 'idle'; p.t = gap(12, 20);
        if (!keepSpeech) clearSpeech('phone'); else unspeak('phone', 'sfx');
        tile.phone.classList.remove('is-ringing');
        setBadge('phone', ''); setAlert('phone', false);
      },
    },
    ai: {
      init: () => ({ st: 'idle', t: gap(10, 16), due: 0, type: 0 }),
      tick(p, dt) {
        const dots = q('ai', '.ai-dots');
        if (p.st === 'idle') { p.t -= dt; setStatus('ai', 'À votre service'); dots.setAttribute('opacity', 0); if (p.t <= 0) { p.st = 'typing'; p.type = 2.2; } }
        else if (p.st === 'typing') {
          p.type -= dt;
          setStatus('ai', 'écrit' + '.'.repeat(1 + (Math.floor(s.t * 3) % 3)));
          dots.setAttribute('opacity', 1);
          setBadge('ai', '…');
          if (p.type <= 0) { p.st = 'ready'; p.due = 8.5; gameAudio.ring('ai'); dots.setAttribute('opacity', 0); setBadge('ai', '✅'); setAlert('ai', true); speak('ai', 'sfx', 'PING !'); speak('ai', 'child', `<small>🤖 Assistant IA</small>${s.d.aiReady.next()}`); }
        } else {
          p.due -= dt;
          setStatus('ai', 'Réponse prête !');
          if (p.due <= 0) { bad(s.d.aiBad.next()); this.reset(p); }
        }
        return p.st === 'ready' ? p.due / 8.5 : 0;
      },
      click(p) {
        if (p.st === 'idle') return say('L’IA n’a rien à dire pour l’instant.');
        if (p.st === 'typing') return say('L’IA réfléchit encore…');
        good(s.d.aiGood.next());
        this.reset(p);
      },
      reset(p) { p.st = 'idle'; p.t = gap(12, 20); q('ai', '.ai-dots').setAttribute('opacity', 0); clearSpeech('ai'); setBadge('ai', ''); setAlert('ai', false); },
    },
    tablet: {
      init: () => ({ st: 'idle', t: gap(11, 17), due: 0 }),
      tick(p, dt) {
        const dot = q('tablet', '.tb-dot');
        if (p.st === 'idle') { p.t -= dt; setStatus('tablet', 'Pas de mail'); dot.setAttribute('opacity', 0); if (p.t <= 0) { p.st = 'mail'; p.due = 8.5; gameAudio.ring('mail'); setBadge('tablet', '✉️'); setAlert('tablet', true); dot.setAttribute('opacity', 1); speak('tablet', 'sfx', 'BIP BIP !'); p.mail = s.d.mail.next(); speak('tablet', 'child', `<small>📧 Nouveau mail</small>${p.mail[0]}`); } }
        else { p.due -= dt; setStatus('tablet', 'Nouveau mail !'); if (p.due <= 0) { bad('Le mail attend. Il attendra.'); this.reset(p); } }
        return p.st === 'mail' ? p.due / 8.5 : 0;
      },
      click(p) {
        if (p.st === 'idle') return say('Aucun nouveau mail.');
        good(p.mail ? p.mail[1] : s.d.mail.next()[1]);
        this.reset(p);
      },
      reset(p) { p.st = 'idle'; p.t = gap(12, 19); q('tablet', '.tb-dot').setAttribute('opacity', 0); clearSpeech('tablet'); setBadge('tablet', ''); setAlert('tablet', false); },
    },
    dishes: {
      init: () => ({ level: 12 }),
      tick(p, dt) {
        p.level += (100 / 26) * dt * (2 - ease());
        const plates = Math.ceil(p.level / 10);
        tile.dishes.querySelectorAll('.dish-plate').forEach((el, i) => (el.style.display = i < plates ? '' : 'none'));
        q('dishes', '.dish-x1').style.display = p.level > 40 ? '' : 'none';
        q('dishes', '.dish-x2').style.display = p.level > 62 ? '' : 'none';
        q('dishes', '.dish-x3').style.display = p.level > 84 ? '' : 'none';
        tile.dishes.classList.toggle('is-warn', p.level > 60 && p.level <= 85);
        const danger = p.level > 85;
        tile.dishes.classList.toggle('is-alert', danger);
        setBadge('dishes', danger ? '⚠️' : '');
        if (danger) speak('dishes', 'sfx', 'ÇA VA TOMBER !'); else unspeak('dishes', 'sfx');
        setStatus('dishes', danger ? 'Il faut la faire !' : p.level > 60 ? 'Ça s’empile…' : 'Pile : ' + Math.round(p.level) + ' %');
        if (p.level >= 100) { gameAudio.ring('clink'); bad(s.d.dishBad.next()); p.level = 0; unspeak('dishes', 'sfx'); }
        return danger ? (100 - p.level) / 15 : 0;
      },
      click(p) {
        if (p.level < 15) return say('Il n’y a presque rien à laver.');
        gameAudio.ring('clink');
        good(s.d.dishGood.next());
        p.level = 0;
        unspeak('dishes', 'sfx');
      },
    },
    plant: {
      init: () => ({}),
      tick() { setStatus('plant', 'Elle arrose parfois'); return 0; },
      click() { say(s.d.plant.next()); },
    },
  };

  // 4 colonnes × 2 lignes sur grand écran, 2 colonnes × 4 lignes sur petit écran
  function layout() {
    const cols = stageEl.clientWidth < 560 ? 2 : 4;
    const rows = IDS.length / cols;
    stageEl.style.height = cols === 2 ? '560px' : '';
    s.order.forEach((id, i) => {
      const col = i % cols, row = Math.floor(i / cols);
      const el = tile[id];
      el.style.width = 100 / cols - 0.8 + '%';
      el.style.height = 100 / rows - 1.6 + '%';
      el.style.left = col * (100 / cols) + '%';
      el.style.top = row * (100 / rows) + '%';
    });
  }

  function frame(now) {
    if (!running) return;
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    s.t += dt;
    IDS.forEach((id) => {
      const frac = P[id].tick(s.p[id], dt);
      tile[id].querySelector('.mt__bar em').style.width = Math.max(0, Math.min(1, frac)) * 100 + '%';
    });
    s.swapIn -= dt;
    if (s.swapIn <= 0) {
      // deux cases échangent leur place : on les cherche sans cesse
      const [a, b] = shuffle([...s.order.keys()]).slice(0, 2);
      [s.order[a], s.order[b]] = [s.order[b], s.order[a]];
      layout();
      s.swapIn = SWAP_EVERY;
    }
    // les bulles suivent leur case (même quand elle change de place) et disparaissent à l'heure
    Object.entries(s.speech).forEach(([key, sp]) => {
      if (s.t > sp.until) { sp.el.remove(); delete s.speech[key]; } else placeSpeech(sp);
    });
    hud();
    if (s.t >= LEN && running) return end(true);
    raf = requestAnimationFrame(frame);
  }

  function end(win) {
    running = false;
    cancelAnimationFrame(raf);
    stopHum && stopHum();
    stopHum = null;
    gameAudio.end();
    IDS.forEach(clearSpeech);
    if (win) {
      confetti({ particleCount: 140, spread: 90, origin: { y: 0.6 } });
      show(`<h4>15 h : l’heure de la sieste !</h4>
        <p>${s.done} choses réussies. Poulet doré, café chaud, Scrabble joué, vaisselle faite, et des nouvelles à toute la famille. Sylviane peut enfin s’allonger… en pensant déjà au dîner.</p>
        <button class="btn btn--primary" data-mt="go">Une autre journée</button>`);
    } else {
      show(`<h4>Trop de choses en même temps…</h4>
        <p>Le poulet a brûlé, la vaisselle a gagné et les enfants n’ont plus de nouvelles. Sylviane demande un deuxième cerveau, et une troisième paire de mains.</p>
        <button class="btn btn--primary" data-mt="go">Réessayer</button>`);
    }
  }

  function start() {
    cancelAnimationFrame(raf);
    stopHum && stopHum();
    stopHum = null;
    gameAudio.begin(); // coupe la playlist et ouvre les sons du jeu
    IDS.forEach(clearSpeech);
    s = { t: 0, done: 0, hearts: HEARTS, order: shuffle(IDS), swapIn: SWAP_EVERY, p: {}, speech: {}, d: makeDecks() };
    IDS.forEach((id) => {
      s.p[id] = P[id].init();
      setBadge(id, '');
      setAlert(id, false);
      tile[id].classList.remove('is-busy', 'is-warn', 'is-ringing', 'is-tense');
    });
    say('');
    layout();
    overlay.hidden = true;
    running = true;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }

  container.addEventListener('click', (e) => {
    const id = e.target.closest('[data-id]')?.dataset.id;
    if (id && running) P[id].click(s.p[id]);
    if (e.target.closest('[data-mt]')) start();
  });
  new MutationObserver(() => {
    if (!container.contains(msgEl)) {
      running = false;
      cancelAnimationFrame(raf);
      stopHum && stopHum();
      stopHum = null;
      gameAudio.end();
    }
  }).observe(container, { childList: true });

  s = { t: 0, done: 0, hearts: HEARTS, order: IDS.slice(), swapIn: SWAP_EVERY, p: {}, speech: {}, d: makeDecks() };
  layout();
  hud();
  show(`<h4>Il est midi. Tout est en route.</h4>
    <p>Le poulet cuit, le café refroidit, l’adversaire réfléchit, et ses enfants vont appeler. Tenez jusqu’à 15 h avec au moins un cœur. Le son aide, mais tout est aussi affiché.</p>
    <button class="btn btn--primary" data-mt="go">Commencer la journée</button>`);
}
