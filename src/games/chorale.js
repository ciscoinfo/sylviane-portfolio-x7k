import confetti from 'canvas-confetti';
import { gameAudio, HABANERA } from '../audio.js';

const BEAT = 1.2; // secondes par temps (plus lent que l’original, pour rester jouable)
const LEAD_IN = 4; // 4 temps de décompte avant la première note
const FALL = 2.2; // durée de chute d'une note (s) : on la voit arriver de loin
const PERFECT = 0.11;
const GOOD = 0.24;
const WIN_RATIO = 0.5;
const VISUAL_LAG = 0.04; // compense le retard d'affichage de l'écran

const LANES = [
  { key: 'd', name: 'Soprano' },
  { key: 'f', name: 'Mezzo' },
  { key: 'j', name: 'Ténor' },
  { key: 'k', name: 'Basse' },
];
// Vraie mélodie de l'Habanera. Les ornements rapides (3 notes en triple croche) deviennent une seule note à jouer.
const laneOf = (m) => (m >= 73 ? 0 : m >= 71 ? 1 : m >= 68 ? 2 : 3);

function buildChart() {
  const notes = [];
  let t = 0;
  for (let i = 0; i < HABANERA.length; i++) {
    const [midi, d] = HABANERA[i];
    const fast = midi !== null && d < 0.2;
    if (midi !== null) notes.push({ midi, lane: laneOf(midi), time: (LEAD_IN + t) * BEAT, state: 'wait', el: null });
    if (fast) {
      t += d * 3;
      i += 2;
    } else t += d;
  }
  return notes;
}

export function startChorale(container, onWin) {
  let raf = 0;
  let notes = [];
  let t0 = 0;
  let stats;
  let running = false;

  container.innerHTML = `
    <div class="ch">
      <h3>La Chorale des cafards</h3>
      <p class="ch__intro">Écoutez : la mélodie de l’<em>Habanera</em> de <em>Carmen</em> est jouée doucement. Appuyez sur <b>D F J K</b> (ou touchez le cafard) <b>exactement quand la note touche le cercle</b>. Battez la mesure, une note par temps.</p>
      <div class="ch__stage">
        <div class="ch__lanes">
          ${LANES.map(
            (l, i) => `
            <div class="ch__lane" data-lane="${i}">
              <div class="ch__fall"></div>
              <div class="ch__target"></div>
              <div class="ch__roach"><span>🪳</span><small>${l.name}<br /><kbd>${l.key.toUpperCase()}</kbd></small></div>
            </div>`
          ).join('')}
        </div>
        <div class="ch__line"></div>
        <div class="ch__count"></div>
        <div class="ch__judge" aria-live="polite"></div>
        <div class="ch__hud"><span class="ch__score">0 pt</span><span class="ch__combo"></span></div>
        <div class="ch__overlay"></div>
      </div>
    </div>`;

  const stage = container.querySelector('.ch__stage');
  const overlay = container.querySelector('.ch__overlay');
  const countEl = container.querySelector('.ch__count');
  const lineEl = container.querySelector('.ch__line');
  let lastBeat = -1;
  const judge = container.querySelector('.ch__judge');
  const scoreEl = container.querySelector('.ch__score');
  const comboEl = container.querySelector('.ch__combo');
  const lanesEl = [...container.querySelectorAll('.ch__lane')];

  const showOverlay = (html) => {
    overlay.innerHTML = html;
    overlay.hidden = false;
  };

  function say(text, kind) {
    judge.textContent = text;
    judge.className = `ch__judge ch__judge--${kind}`;
    judge.style.animation = 'none';
    void judge.offsetWidth;
    judge.style.animation = '';
  }

  function hud() {
    scoreEl.textContent = `${stats.score} pt`;
    comboEl.textContent = stats.combo > 2 ? `Combo ×${stats.combo}` : '';
  }

  function start() {
    cleanup();
    stats = { score: 0, combo: 0, hits: 0, miss: 0 };
    notes = buildChart();
    lanesEl.forEach((l) => (l.querySelector('.ch__fall').innerHTML = ''));
    notes.forEach((n) => {
      const el = document.createElement('div');
      el.className = 'ch__note';
      el.textContent = '♪';
      el.hidden = true;
      lanesEl[n.lane].querySelector('.ch__fall').appendChild(el);
      n.el = el;
    });
    overlay.hidden = true;
    hud();
    t0 = gameAudio.begin() + 0.2;
    gameAudio.backing(t0 + LEAD_IN * BEAT, BEAT);
    for (let i = 0; i < LEAD_IN; i++) gameAudio.tick(t0 + i * BEAT, i === 0);
    // mélodie guide : toutes les notes de l'Habanera, y compris les ornements
    let g = 0;
    HABANERA.forEach(([m, d]) => {
      if (m !== null) gameAudio.note(m, t0 + (LEAD_IN + g) * BEAT, Math.max(d, 0.4) * BEAT, 0.09);
      g += d;
    });
    running = true;
    raf = requestAnimationFrame(frame);
  }

  function frame() {
    if (!running) return;
    const now = gameAudio.now() - t0 - VISUAL_LAG;
    const beat = Math.floor(now / BEAT);
    if (beat !== lastBeat) {
      lastBeat = beat;
      lineEl.classList.remove('ch__line--beat');
      void lineEl.offsetWidth;
      lineEl.classList.add('ch__line--beat');
    }
    countEl.textContent = now < LEAD_IN * BEAT - 0.1 ? String(Math.max(1, Math.ceil(LEAD_IN - now / BEAT))) : '';
    const h = lanesEl[0].querySelector('.ch__fall').clientHeight;
    for (const n of notes) {
      if (n.state === 'wait') {
        const dt = n.time - now;
        if (dt < -GOOD) {
          n.state = 'miss';
          n.el.classList.add('ch__note--miss');
          stats.miss++;
          stats.combo = 0;
          say('Faux !', 'bad');
          hud();
        } else if (dt < FALL) {
          n.el.hidden = false;
          n.el.style.transform = `translateY(${(1 - dt / FALL) * h - 50}px)`;
        }
      } else if (n.state === 'miss' && now - n.time > 0.5) {
        n.el.hidden = true;
      }
    }
    if (now > notes[notes.length - 1].time + 1.2) return finish();
    raf = requestAnimationFrame(frame);
  }

  function press(lane) {
    if (!running) return;
    const roach = lanesEl[lane].querySelector('.ch__roach');
    roach.classList.remove('ch__roach--sing');
    void roach.offsetWidth;
    roach.classList.add('ch__roach--sing');
    const now = gameAudio.now() - t0 - VISUAL_LAG;
    let best = null;
    for (const n of notes) {
      if (n.lane === lane && n.state === 'wait' && Math.abs(n.time - now) <= GOOD) {
        if (!best || Math.abs(n.time - now) < Math.abs(best.time - now)) best = n;
      }
    }
    if (!best) {
      gameAudio.squeak();
      stats.combo = 0;
      hud();
      return;
    }
    const err = Math.abs(best.time - now);
    best.state = 'hit';
    best.el.hidden = true;
    stats.hits++;
    stats.combo++;
    stats.score += (err <= PERFECT ? 100 : 50) * Math.min(1 + Math.floor(stats.combo / 5) * 0.5, 3);
    const early = best.time - now > 0;
    say(err <= PERFECT ? 'Parfait !' : early ? 'Un peu tôt' : 'Un peu tard', err <= PERFECT ? 'perfect' : 'good');
    gameAudio.voice(best.midi);
    hud();
  }

  function finish() {
    running = false;
    gameAudio.end();
    const ratio = stats.hits / notes.length;
    const pct = Math.round(ratio * 100);
    if (ratio >= WIN_RATIO) {
      confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });
      showOverlay(`
        <h4>Bravo, la chorale est juste !</h4>
        <p>${pct} % de notes réussies, ${stats.score} points. Les cafards acceptent de témoigner.</p>
        <button class="btn btn--primary" data-ch="win">Lire leurs témoignages</button>`);
    } else {
      showOverlay(`
        <h4>Les cafards ont chanté faux…</h4>
        <p>${pct} % de notes réussies. Il en faut au moins ${Math.round(WIN_RATIO * 100)} %. Sylviane est déçue, mais elle n’abandonne pas.</p>
        <button class="btn btn--primary" data-ch="retry">Réessayer</button>`);
    }
  }

  function cleanup() {
    running = false;
    cancelAnimationFrame(raf);
  }

  const onKey = (e) => {
    const i = LANES.findIndex((l) => l.key === e.key.toLowerCase());
    if (i >= 0 && !e.repeat) press(i);
  };
  document.addEventListener('keydown', onKey);

  container.addEventListener('pointerdown', (e) => {
    const lane = e.target.closest('.ch__lane');
    if (lane) press(Number(lane.dataset.lane));
  });
  container.addEventListener('click', (e) => {
    const act = e.target.closest('[data-ch]')?.dataset.ch;
    if (act === 'start' || act === 'retry') start();
    if (act === 'win') {
      document.removeEventListener('keydown', onKey);
      onWin();
    }
  });

  // quand la modale est vidée ou fermée, on arrête tout
  new MutationObserver(() => {
    if (!container.contains(stage)) {
      cleanup();
      gameAudio.end();
      document.removeEventListener('keydown', onKey);
    }
  }).observe(container, { childList: true });

  showOverlay(`
    <h4>Prêts pour la répétition ?</h4>
    <p>Mettez le son. Quatre cafards, quatre touches : D, F, J, K.</p>
    <button class="btn btn--primary" data-ch="start">Lever la baguette</button>`);
}
