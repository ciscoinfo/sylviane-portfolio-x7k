import confetti from 'canvas-confetti';
import { sfx } from '../audio.js';

// Recette de Sylviane pour une cafetière à piston
const RECIPE = { coffee: 30, water: 450, stirMin: 6, stirMax: 10, steep: 240 }; // g, ml, tours, secondes
const POUR_COFFEE = 9; // g/s
const POUR_WATER = 160; // ml/s
const TIME_SCALE = 24; // l'infusion de 4 minutes dure 10 s réelles
const MAX_WATER = 650;
const MAX_COFFEE = 60;

// géométrie du dessin
const BOTTOM = 288;
const PX_PER_ML = 0.19;
const PX_PER_G = 0.55;

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const fmtTime = (s) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`;
const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));

const STEPS = [
  { title: 'Étape 1 : le café', help: `Maintenez le bouton pour verser le café moulu. Visez ${RECIPE.coffee} g.` },
  { title: 'Étape 2 : l’eau', help: `Maintenez le bouton pour verser l’eau chaude. Visez ${RECIPE.water} ml, entre les graduations 400 et 500.` },
  { title: 'Étape 3 : mélanger', help: `Maintenez le bouton pour mélanger avec la cuillère : ${RECIPE.stirMin} à ${RECIPE.stirMax} tours, pas plus.` },
  { title: 'Étape 4 : infuser, puis presser', help: `Laissez infuser ${fmtTime(RECIPE.steep)}. Le temps passe 24 fois plus vite. Pressez le piston au bon moment !` },
];

function scene() {
  const ticks = [100, 200, 300, 400, 500, 600]
    .map((ml) => {
      const y = BOTTOM - ml * PX_PER_ML;
      const good = false; // volontairement : aucun trait à 450 ml
      return `<line x1="100" x2="${good ? 114 : 108}" y1="${y}" y2="${y}" stroke="${good ? '#e2452f' : '#555'}" stroke-width="${good ? 3 : 2}"/>
        <text x="94" y="${y + 4}" text-anchor="end" font-size="11" font-weight="${good ? 800 : 500}" fill="${good ? '#e2452f' : '#555'}">${ml}</text>`;
    })
    .join('');
  return `
  <svg class="cp__svg" viewBox="0 0 300 320" role="img" aria-label="Cafetière à piston">
    <rect x="0" y="296" width="300" height="24" fill="#c9a78a"/>
    <!-- anse et verre -->
    <path d="M200 176 h30 q20 0 20 20 v50 q0 20 -20 20 h-30" fill="none" stroke="#2b2b2b" stroke-width="9" stroke-linecap="round"/>
    <rect x="100" y="164" width="100" height="124" rx="4" fill="rgba(255,255,255,.55)" stroke="#1d1712" stroke-width="3"/>
    <rect class="cp__water" x="102" y="288" width="96" height="0" fill="#cfe3f0"/>
    <rect class="cp__grounds" x="102" y="288" width="96" height="0" fill="#4a2c1a"/>
    ${ticks}
    <!-- piston : tige, plateau-filtre, bouton -->
    <g class="cp__plunger">
      <rect x="146" y="26" width="8" height="140" fill="#9aa3ad" stroke="#1d1712" stroke-width="2"/>
      <circle cx="150" cy="22" r="12" fill="#2b2b2b" stroke="#1d1712" stroke-width="2"/>
      <rect x="102" y="164" width="96" height="6" rx="2" fill="#6b7280" stroke="#1d1712" stroke-width="2"/>
    </g>
    <!-- couvercle -->
    <rect x="96" y="150" width="108" height="14" rx="4" fill="#2b2b2b" stroke="#1d1712" stroke-width="2"/>
    <rect x="100" y="288" width="100" height="10" rx="3" fill="#2b2b2b"/>
    <!-- cuillère -->
    <g class="cp__spoon" style="display:none"><line x1="150" y1="60" x2="150" y2="250" stroke="#c9a769" stroke-width="5" stroke-linecap="round"/><ellipse cx="150" cy="252" rx="9" ry="6" fill="#c9a769"/></g>
    <!-- filets de versement -->
    <line class="cp__stream cp__stream--coffee" x1="150" y1="120" x2="150" y2="280" stroke="#4a2c1a" stroke-width="7" style="display:none"/>
    <line class="cp__stream cp__stream--water" x1="60" y1="120" x2="140" y2="164" stroke="#8fc3ea" stroke-width="7" style="display:none"/>
    <text x="30" y="110" font-size="46">🫖</text>
  </svg>`;
}

// Les répliques de Sylviane : consignes vagues, remarques qui déconcentrent
const REMARKS_COFFEE = ['Un peu plus…', 'Non, moins.', 'Plus. Enfin, pas trop.', 'Là. Non, pas là.', 'Tu en mets beaucoup, quand même.', 'Ce n’est pas assez, je crois.', 'Stop. Continue.', 'C’est une dose normale, ça ?'];
const REMARKS_WATER = ['Pas trop, hein.', 'Arrête… non, continue.', 'C’est bon, là ? Non ?', 'Un petit peu plus, juste un petit peu.', 'Je crois que c’est trop. Ou pas assez.', 'Tu verses comme mon voisin.'];
const SCRIPT = [
  { her: 'Mets une dose.', reply: 'Une dose comment ?', answer: 'Une dose normale.', blocking: true },
  { her: 'Maintenant l’eau. Jusqu’au trait.', reply: 'Il n’y a pas de trait.', answer: 'C’est vrai, on ne le voit pas.', blocking: true },
  { her: 'Mélange. Pas trop.', reply: 'Combien de tours ?', answer: 'Quelques-uns. Tu verras bien.', blocking: false },
  { her: 'Maintenant on attend. Tu presses quand c’est prêt.', reply: 'C’est prêt quand ?', answer: 'Quand c’est prêt.', blocking: false },
];
const WAIT_REMARKS = [[50, 'Ça sent bon.'], [140, 'C’est bientôt ?'], [200, 'Ne presse pas trop tôt. Ni trop tard.']];

function verdict(m) {
  const parts = [];
  if (m.coffee > RECIPE.coffee + 6) parts.push('beaucoup trop fort : elle a l’impression de manger le café');
  else if (m.coffee < RECIPE.coffee - 6) parts.push('trop léger : « C’est du café ou de l’eau sale ? »');
  if (m.water > RECIPE.water + 60) parts.push('trop dilué');
  else if (m.water < RECIPE.water - 60) parts.push('trop serré');
  if (m.steep > RECIPE.steep + 30) parts.push('amer, il a trop infusé');
  else if (m.steep < RECIPE.steep - 30) parts.push('pas assez infusé : ça a un goût de chaussette tiède');
  if (m.stir < RECIPE.stirMin - 2) parts.push('pas assez mélangé');
  else if (m.stir > RECIPE.stirMax + 4) parts.push('trop mélangé, plein de marc');
  return parts;
}

export function startCoffee(container) {
  let raf = 0, last = 0, s, holding = false;

  container.innerHTML = `
    <div class="cp">
      <h3>La cafetière à piston</h3>
      <p class="cp__intro">La recette de Sylviane : <b>${RECIPE.coffee} g</b> de café moulu, <b>${RECIPE.water} ml</b> d’eau chaude, <b>${RECIPE.stirMin} à ${RECIPE.stirMax} tours</b> de cuillère, <b>${fmtTime(RECIPE.steep)}</b> d’infusion, puis on presse. Si c’est raté, elle le sait tout de suite.</p>
      <div class="cp__main">
        ${scene()}
        <div class="cp__panel">
          <div class="cp__head">
            <div class="cp__step"></div>
            <p class="cp__help"></p>
          </div>
          <div class="cp__talk">
            <div class="cp__chat" aria-live="polite"></div>
            <button class="btn cp__reply" type="button" hidden></button>
          </div>
          <div class="cp__read"></div>
          <div class="cp__controls">
            <button class="btn btn--primary cp__hold" type="button"></button>
            <button class="btn cp__next" type="button" hidden>Étape suivante →</button>
          </div>
          <p class="cp__msg" role="status"></p>
        </div>
      </div>
      <div class="cp__result" hidden></div>
    </div>`;
  const $ = (q) => container.querySelector(q);
  const waterEl = $('.cp__water'), groundsEl = $('.cp__grounds'), plungerEl = $('.cp__plunger'), spoonEl = $('.cp__spoon');
  const streamC = $('.cp__stream--coffee'), streamW = $('.cp__stream--water');
  const stepEl = $('.cp__step'), helpEl = $('.cp__help'), readEl = $('.cp__read'), holdBtn = $('.cp__hold'), nextBtn = $('.cp__next'), msgEl = $('.cp__msg');
  const resultEl = $('.cp__result'), mainEl = $('.cp__main');
  const chatEl = $('.cp__chat'), replyBtn = $('.cp__reply');

  // bulles de dialogue ; une réplique « live » (remarque qui déconcentre) remplace la précédente
  function bubble(who, text, live = false) {
    const last = chatEl.lastElementChild;
    if (live && last && last.dataset.live === '1' && last.dataset.who === who) {
      last.querySelector('span').textContent = text;
    } else {
      const el = document.createElement('div');
      el.className = `cp__bubble cp__bubble--${who}`;
      el.dataset.who = who;
      el.dataset.live = live ? '1' : '0';
      el.innerHTML = (who === 'her' ? '<i class="cp__mini"></i>' : '') + '<span></span>';
      el.querySelector('span').textContent = text;
      chatEl.appendChild(el);
      while (chatEl.children.length > 4) chatEl.firstElementChild.remove();
    }
    sfx.tile();
  }

  // Sylviane parle, le joueur peut répondre ; si c'est bloquant, on ne peut pas agir avant d'avoir répondu
  function dialogue(step) {
    const d = SCRIPT[step];
    bubble('her', d.her);
    s.gate = d.blocking;
    holdBtn.disabled = d.blocking;
    replyBtn.textContent = '« ' + d.reply + ' »';
    replyBtn.hidden = false;
    replyBtn.onclick = () => {
      replyBtn.hidden = true;
      bubble('me', d.reply);
      setTimeout(() => {
        bubble('her', d.answer);
        s.gate = false;
        holdBtn.disabled = false;
      }, 700);
    };
  }

  const say = (t, kind = '') => {
    msgEl.textContent = t;
    msgEl.className = `cp__msg ${kind}`;
  };

  function reset() {
    chatEl.innerHTML = '';
    s = { stirT: 0, gate: false, nextRemark: 1.2, waitIdx: 0, step: 0, coffee: 0, water: 0, stir: 0, spoonAngle: 0, t: 0, steepDone: null, plunge: -1, done: false };
    holding = false;
    mainEl.hidden = false;
    resultEl.hidden = true;
    enterStep(0);
  }

  function enterStep(n) {
    s.step = n;
    stepEl.textContent = STEPS[n].title;
    helpEl.textContent = STEPS[n].help;
    say('');
    nextBtn.hidden = true;
    replyBtn.hidden = true;
    spoonEl.style.display = n === 2 ? '' : 'none';
    holdBtn.textContent = ['Maintenir : verser le café', 'Maintenir : verser l’eau', 'Maintenir : mélanger', 'Presser le piston !'][n];
    if (n === 3) s.t = 0;
    renderReadout();
    dialogue(n);
  }

  function renderReadout() {
    const r = [];
    if (s.step === 0) r.push(`Café : <b>${s.coffee.toFixed(0)} g</b>`);
    if (s.step === 1) r.push(`Eau : <b>${Math.round(s.water)} ml</b>`);
    if (s.step === 2) r.push(`Tours de cuillère : <b>${s.stir}</b>`);
    if (s.step >= 3) r.push(`Infusion : <b>${fmtTime(Math.min(s.t * TIME_SCALE, 360))}</b>`);
    readEl.innerHTML = r.join(' · ');
  }

  function draw() {
    const gh = s.coffee * PX_PER_G;
    const wh = s.water * PX_PER_ML;
    groundsEl.setAttribute('height', gh);
    groundsEl.setAttribute('y', BOTTOM - gh);
    waterEl.setAttribute('height', wh);
    waterEl.setAttribute('y', BOTTOM - wh);
    // l'eau brunit au fil de l'infusion
    const f = s.step >= 3 ? clamp((s.t * TIME_SCALE) / RECIPE.steep) * 0.85 + (s.stir > 0 ? 0.15 : 0) : s.stir > 0 ? 0.15 : 0;
    waterEl.setAttribute('fill', `rgb(${mix([207, 227, 240], [92, 54, 31], f).join(',')})`);
    // piston : s'enfonce jusqu'au marc
    const maxDy = BOTTOM - gh - 8 - 170;
    const dy = s.plunge >= 0 ? clamp(s.plunge) * Math.max(0, maxDy) : 0;
    plungerEl.setAttribute('transform', `translate(0 ${dy})`);
    spoonEl.setAttribute('transform', `rotate(${Math.sin(s.spoonAngle) * 14} 150 60)`);
    streamC.style.display = holding && s.step === 0 && s.coffee < MAX_COFFEE ? '' : 'none';
    streamW.style.display = holding && s.step === 1 && s.water < MAX_WATER ? '' : 'none';
  }

  function press() {
    if (s.step !== 3 || s.plunge >= 0) return;
    s.steepDone = s.t * TIME_SCALE;
    s.plunge = 0;
    holdBtn.disabled = true;
    sfx.ding();
  }

  function frame(now) {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    if (holding && s.step <= 1) {
      s.nextRemark -= dt;
      if (s.nextRemark <= 0) {
        const list = s.step === 0 ? REMARKS_COFFEE : REMARKS_WATER;
        bubble('her', list[Math.floor(Math.random() * list.length)], true);
        s.nextRemark = 1.1 + Math.random() * 0.8;
      }
    }
    if (holding && s.step === 2) {
      // chaque tour de cuillère dure 0,6 s : on maintient pour mélanger, on relâche pour s'arrêter
      s.stirT += dt;
      s.spoonAngle += dt * 10.5;
      const tours = Math.floor(s.stirT / 0.6);
      if (tours !== s.stir) { s.stir = tours; sfx.tile(); renderReadout(); nextBtn.hidden = s.stir < 1; }
    }
    if (holding && s.step === 0) {
      s.coffee = Math.min(MAX_COFFEE, s.coffee + POUR_COFFEE * dt);
      renderReadout();
    }
    if (holding && s.step === 1) {
      const before = s.water;
      s.water = Math.min(MAX_WATER, s.water + POUR_WATER * dt);
      if (before < 600 && s.water >= 600) say('Ça déborde presque !', 'bad');
      renderReadout();
    }
    if (s.step === 3 && s.plunge < 0) {
      s.t += dt;
      renderReadout();
      const w = WAIT_REMARKS[s.waitIdx];
      if (w && s.t * TIME_SCALE >= w[0]) { bubble('her', w[1], true); s.waitIdx++; }
      if (s.t * TIME_SCALE >= 360) press(); // infusion de 6 minutes : le piston s'abaisse tout seul
    }
    if (s.plunge >= 0 && !s.done) {
      s.plunge += dt / 2.2; // on presse doucement
      if (s.plunge >= 1) { s.plunge = 1; s.done = true; setTimeout(finish, 500); }
    }
    draw();
    raf = requestAnimationFrame(frame);
  }

  function finish() {
    const m = { coffee: s.coffee, water: s.water, stir: s.stir, steep: s.steepDone };
    const dCoffee = Math.abs(m.coffee - RECIPE.coffee);
    const sCoffee = dCoffee <= 2 ? 1 : clamp(1 - (dCoffee - 2) / 12);
    const dWater = Math.abs(m.water - RECIPE.water);
    const sWater = dWater <= 25 ? 1 : clamp(1 - (dWater - 25) / 150);
    const dStir = m.stir < RECIPE.stirMin ? RECIPE.stirMin - m.stir : m.stir > RECIPE.stirMax ? m.stir - RECIPE.stirMax : 0;
    const sStir = clamp(1 - dStir / 6);
    const dSteep = Math.abs(m.steep - RECIPE.steep);
    const sSteep = dSteep <= 15 ? 1 : clamp(1 - (dSteep - 15) / 90);
    const quality = sCoffee * 0.3 + sWater * 0.25 + sStir * 0.1 + sSteep * 0.35;
    const score = Math.round(quality * 100);
    const good = quality >= 0.8, ok = quality >= 0.5;
    const issues = verdict(m);
    mainEl.hidden = true;
    resultEl.hidden = false;
    const emoji = good ? '😊' : ok ? '🙂' : '😖';
    resultEl.innerHTML = `
      <div class="cp__tasting ${good ? 'is-good' : ok ? 'is-ok' : 'is-bad'}">
        <div class="cp__faceWrap"><div class="cp__face"></div><span class="cp__faceEmoji">${emoji}</span><span class="cp__cup">☕</span></div>
        <div>
          <h4>${good ? 'Un délice !' : ok ? 'Pas mal, sans plus.' : 'Beurk…'} <small>${score}/100</small></h4>
          <p>${
            good
              ? 'Sylviane sourit en reposant la tasse : « Voilà ce que j’appelle un café. » Elle en reprend un deuxième, avec un carré de chocolat.'
              : ok
                ? 'Elle boit sans rien dire, ce qui est mauvais signe. ' + (issues.length ? 'Elle trouve ça ' + issues[0] + '.' : '')
                : 'Elle fait la grimace. ' + (issues.length ? 'C’est ' + issues.slice(0, 2).join(', ') + '.' : '') + ' Elle exige un remboursement.'
          }</p>
          <ul class="cp__recap">
            <li>Café : ${m.coffee.toFixed(0)} g (idéal ${RECIPE.coffee})</li>
            <li>Eau : ${Math.round(m.water)} ml (idéal ${RECIPE.water})</li>
            <li>Mélange : ${m.stir} tour${m.stir > 1 ? 's' : ''} (idéal ${RECIPE.stirMin} à ${RECIPE.stirMax})</li>
            <li>Infusion : ${fmtTime(m.steep)} (idéal ${fmtTime(RECIPE.steep)})</li>
          </ul>
          <button class="btn btn--primary" data-cp="again">Refaire un café</button>
        </div>
      </div>`;
    if (good) {
      sfx.win();
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    } else if (!ok) sfx.buzz();
  }

  // commandes
  const holdStart = () => {
    if (s.gate) return;
    if (s.step === 3) return press();
    if (s.step <= 2 && !s.done) {
      holding = true;
      if (s.step <= 1) nextBtn.hidden = false;
    }
  };
  const holdEnd = () => (holding = false);
  holdBtn.addEventListener('pointerdown', (e) => { e.preventDefault(); holdStart(); });
  ['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) => holdBtn.addEventListener(ev, holdEnd));
  nextBtn.addEventListener('click', () => {
    if (s.gate) return;
    holding = false;
    if (s.step < 3) enterStep(s.step + 1);
  });
  const keyDown = (e) => {
    if (e.code !== 'Space' || e.repeat) return;
    e.preventDefault();
    holdStart();
  };
  const keyUp = (e) => e.code === 'Space' && holdEnd();
  document.addEventListener('keydown', keyDown);
  document.addEventListener('keyup', keyUp);
  container.addEventListener('click', (e) => {
    if (e.target.closest('[data-cp="again"]')) {
      holdBtn.disabled = false;
      reset();
    }
  });
  new MutationObserver(() => {
    if (!container.contains(waterEl)) {
      cancelAnimationFrame(raf);
      document.removeEventListener('keydown', keyDown);
      document.removeEventListener('keyup', keyUp);
    }
  }).observe(container, { childList: true });

  reset();
  last = performance.now();
  raf = requestAnimationFrame(frame);
}
