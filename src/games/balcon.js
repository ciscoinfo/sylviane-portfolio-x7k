import confetti from 'canvas-confetti';
import { gsap } from 'gsap';
import { sfx } from '../audio.js';
import { artSVG } from './balcon-art.js';

// [clé du dessin, nom, commentaire de Sylviane quand la paire est trouvée]
const PLANTS = [
  ['piment', 'Piment', 'Son chouchou : le piment d’Espelette, évidemment.'],
  ['menthe', 'Menthe', 'Elle envahit tout le pot, et finit dans le thé à la menthe.'],
  ['basilic', 'Basilic', 'Trop d’eau ? Pas assez ? Elle n’a jamais su, et il n’a pas survécu.'],
  ['ciboulette', 'Ciboulette', 'Le classique du balcon. À force d’attendre qu’elle fleurisse pour la couper, on n’en profite jamais.'],
  ['muguet', 'Muguet', 'Il n’arrive jamais le 1er mai : toujours plus tôt, jamais à l’heure. Elle l’adore quand même.'],
  ['fraise', 'Fraise', 'Elle n’en fait pas pousser, mais elle les mange très bien.'],
  ['cerise', 'Cerise', 'Surtout en griottes, et en confiture maison. Délicieuse.'],
  ['patate', 'Pomme de terre', 'Son légume préféré. Elle ne pourrait pas vivre sans.'],
  ['myrtille', 'Myrtille', 'Pas encore sur le balcon. Mais elle y pense.'],
  ['groseille', 'Groseille', 'Petite, brillante, très acide : la grimace est garantie.'],
  ['carotte', 'Carotte', 'Pas sur le balcon, mais toujours au menu : les carottes râpées dès qu’on passe la voir.'],
  ['erable', 'Érable', 'Son érable, dans un simple pot, année après année. Maladies, feuilles qui tombent : elle tremblait pour lui, et chaque printemps il repartait.'],
];
const PAIRS = 8; // paires par partie : le piment + 7 plantes tirées au hasard
const PEEK = 10; // secondes pour mémoriser les cartes au départ

const STEP_TEXT = [
  'Un pot, de la terre… et beaucoup de patience.',
  'Une première pousse !',
  'Ça monte, ça monte.',
  'Les premières feuilles.',
  'Des boutons de fleurs.',
  'Les fleurs sont là.',
  'Les premiers piments, tout verts.',
  'Ils rougissent…',
  'Magnifique !',
];

const SPROUT = `<svg class="bp__sprout" viewBox="0 0 60 60" aria-hidden="true"><path d="M30,52 C30,40 30,34 30,28" stroke="#1d1712" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M30,52 C30,40 30,34 30,28" stroke="#3f8f3a" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M30,30 C18,32 8,24 8,12 C22,10 30,18 30,30 Z" fill="#7cc84f" stroke="#1d1712" stroke-width="2.5" stroke-linejoin="round"/><path d="M30,30 C42,32 52,24 52,12 C38,10 30,18 30,30 Z" fill="#5aae3c" stroke="#1d1712" stroke-width="2.5" stroke-linejoin="round"/><ellipse cx="30" cy="54" rx="14" ry="4" fill="#6b4a2d" stroke="#1d1712" stroke-width="2"/></svg>`;
const shuffle = (a) => [...a].sort(() => Math.random() - 0.5);

// ---------- Le plant de piment (SVG), piloté par le nombre de paires trouvées ----------
// couleur du piment selon le stade : vert (6), orange (7), rouge (8)
const PEPPER_COLORS = { 6: '#6fae2c', 7: '#f08a24', 8: '#d9291c' };

const LEAVES = [ // [x, y, rotation, longueur, apparaît au stade]
  [100, 192, -30, 44, 2], [100, 186, -150, 44, 2], [100, 160, -42, 40, 3], [100, 150, -138, 40, 3],
  [100, 128, -34, 38, 4], [100, 120, -146, 38, 4], [100, 98, -55, 32, 5], [100, 92, -125, 32, 5],
];
const leafPath = (len) => `M0,0 C ${len * 0.2},${-len * 0.34} ${len * 0.7},${-len * 0.32} ${len},0 C ${len * 0.7},${len * 0.32} ${len * 0.2},${len * 0.34} 0,0 Z`;
const PEPPER = 'M0,0 C 9,0 12,12 8,28 C 6,40 1,50 -2,56 C -5,46 -10,32 -10,16 C -10,6 -6,0 0,0 Z';
const HANGING = [[70, 118], [131, 128], [104, 80]];
const FLOWERS = [[72, 112], [132, 122], [104, 74]];

function plantSVG() {
  return `
  <svg class="bp__svg" viewBox="0 0 200 270" aria-hidden="true">
    <defs>
      <linearGradient id="bp-pot" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#e58a5a"/><stop offset=".45" stop-color="#d9693a"/><stop offset="1" stop-color="#a84a25"/></linearGradient>
      <linearGradient id="bp-leaf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7cc84f"/><stop offset="1" stop-color="#2f7a2a"/></linearGradient>
      <linearGradient id="bp-stem" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#4f9a34"/><stop offset="1" stop-color="#2f6a1f"/></linearGradient>
      <radialGradient id="bp-pep" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".28"/></radialGradient>
    </defs>
    <g opacity=".28" stroke="#1d1712" stroke-width="3" stroke-linecap="round"><path d="M6,150 H194"/>${[16, 44, 72, 100, 128, 156, 184].map((x) => `<path d="M${x},150 V262"/>`).join('')}</g>
    <rect x="0" y="262" width="200" height="8" fill="#b9b2a2"/>
    <ellipse cx="100" cy="262" rx="62" ry="6" fill="rgba(0,0,0,.18)"/>
    <g class="bp__stem" style="transform-origin:100px 205px">
      <path d="M100,205 C98,170 103,140 100,92" stroke="#1d1712" stroke-width="10" stroke-linecap="round" fill="none"/>
      <path d="M100,205 C98,170 103,140 100,92" stroke="url(#bp-stem)" stroke-width="6" stroke-linecap="round" fill="none"/>
      ${[
        ['M100,150 C90,140 80,130 72,120', 0], ['M100,160 C112,150 124,140 131,130', 1], ['M100,110 C101,100 103,90 104,82', 2],
      ].map(([d, i]) => `<path class="bp__branch" data-b="${i}" d="${d}" stroke="#2f6a1f" stroke-width="4.5" stroke-linecap="round" fill="none"/>`).join('')}
    </g>
    ${LEAVES.map(([x, y, r, len, s], i) => `
      <g transform="translate(${x},${y}) rotate(${r})"><g class="bp__leaf" data-s="${s}" style="--d:${i * 50}ms">
        <path d="${leafPath(len)}" fill="url(#bp-leaf)" stroke="#1d1712" stroke-width="2.2" stroke-linejoin="round"/>
        <path d="M${len * 0.06},0 L${len * 0.9},0 M${len * 0.3},0 L${len * 0.48},${-len * 0.14} M${len * 0.3},0 L${len * 0.48},${len * 0.14} M${len * 0.55},0 L${len * 0.7},${-len * 0.11} M${len * 0.55},0 L${len * 0.7},${len * 0.11}" stroke="#2f6a1f" stroke-width="1.2" stroke-linecap="round" fill="none" opacity=".8"/>
        <path d="M${len * 0.15},${-len * 0.12} C ${len * 0.35},${-len * 0.24} ${len * 0.55},${-len * 0.24} ${len * 0.7},${-len * 0.16}" stroke="#fff" stroke-width="2" stroke-linecap="round" fill="none" opacity=".35"/>
      </g></g>`).join('')}
    ${FLOWERS.map(([x, y], i) => `<g transform="translate(${x},${y})"><g class="bp__flower" data-i="${i}">${[0, 72, 144, 216, 288].map((a) => `<ellipse cx="0" cy="-7" rx="4.2" ry="7.5" fill="#fff" stroke="#8d8672" stroke-width="1.2" transform="rotate(${a})"/>`).join('')}<circle r="3.4" fill="#ffd400" stroke="#b58f00" stroke-width="1"/></g></g>`).join('')}
    ${HANGING.map(([x, y], i) => `<g transform="translate(${x},${y})"><g class="bp__pepper" data-i="${i}">
      <path d="${PEPPER}" class="bp__pepper-body"/>
      <path d="${PEPPER}" fill="url(#bp-pep)" stroke="#1d1712" stroke-width="2.2" stroke-linejoin="round"/>
      <path d="M-6,0 C -4,-6 4,-6 6,0 C 3,4 -3,4 -6,0 Z" fill="#3d8a2a" stroke="#1d1712" stroke-width="1.6" stroke-linejoin="round"/>
      <path d="M0,-2 L 1,-10" stroke="#1d1712" stroke-width="4" stroke-linecap="round"/><path d="M0,-2 L 1,-10" stroke="#4f9a34" stroke-width="2" stroke-linecap="round"/>
    </g></g>`).join('')}
    <path d="M50,208 H150 L137,258 Q136,264 129,264 H71 Q64,264 63,258 Z" fill="url(#bp-pot)" stroke="#1d1712" stroke-width="3" stroke-linejoin="round"/>
    <path d="M60,222 H140" stroke="#fff" stroke-opacity=".18" stroke-width="3"/>
    <ellipse cx="100" cy="203" rx="52" ry="9" fill="#4a3220" stroke="#1d1712" stroke-width="3"/>
    <path d="M46,198 Q46,194 51,194 H149 Q154,194 154,198 V212 Q154,216 149,216 H51 Q46,216 46,212 Z" fill="url(#bp-pot)" stroke="#1d1712" stroke-width="3" stroke-linejoin="round"/>
    <path d="M54,202 H146" stroke="#fff" stroke-opacity=".3" stroke-width="3" stroke-linecap="round"/>
    <ellipse cx="100" cy="196" rx="48" ry="7" fill="#5a3d27" stroke="#1d1712" stroke-width="2.5"/>
    <circle cx="82" cy="195" r="2" fill="#7a5a3c"/><circle cx="112" cy="197" r="2.4" fill="#7a5a3c"/><circle cx="96" cy="194" r="1.6" fill="#3a2616"/>
  </svg>`;
}

function setStage(root, stage) {
  const svg = root.querySelector('.bp__svg');
  const stemScale = [0.02, 0.35, 0.55, 0.75, 0.9, 1, 1, 1, 1][stage];
  svg.querySelector('.bp__stem').style.transform = `scaleY(${stemScale})`;
  svg.querySelectorAll('.bp__leaf').forEach((l) => l.classList.toggle('is-on', stage >= Number(l.dataset.s)));
  svg.querySelectorAll('.bp__branch').forEach((b) => b.classList.toggle('is-on', stage >= 4));
  svg.querySelectorAll('.bp__flower').forEach((f) => f.classList.toggle('is-on', stage === 4 || stage === 5));
  const size = [0, 0, 0, 0, 0, 0, 0.55, 0.85, 1.15][stage];
  svg.querySelectorAll('.bp__pepper').forEach((p) => {
    const i = Number(p.dataset.i);
    p.style.transform = `scale(${stage >= 6 ? size * (1 - i * 0.1) : 0})`;
    if (PEPPER_COLORS[stage]) p.querySelector('.bp__pepper-body').style.fill = PEPPER_COLORS[stage];
  });
  svg.classList.toggle('is-final', stage === PAIRS);
}

export function startBalcon(container, onWin) {
  const root = document.createElement('div');
  root.className = 'bp';
  container.innerHTML = '';
  container.appendChild(root);

  let cards, open, found, moves, locked;
  const alive = () => root.isConnected && !document.getElementById('modal')?.hidden;

  function newGame() {
    const picked = [PLANTS[0], ...shuffle(PLANTS.slice(1)).slice(0, PAIRS - 1)];
    cards = shuffle([...picked, ...picked]).map((p, i) => ({ id: i, plant: p }));
    open = [];
    found = 0;
    moves = 0;
    locked = true;
    root.innerHTML = `
      <div class="bp__layout">
        <div class="bp__left">
          <h3>Le balcon de Sylviane</h3>
          <p class="bp__meta">Retrouvez les paires : à chaque paire, le piment pousse un peu plus.</p>
          <div class="bp__plantbox">
            ${plantSVG()}
            <p class="bp__step" id="bp-step"></p>
          </div>
          <div class="bp__actions"><button class="btn btn--primary" id="bp-start">Mémoriser les cartes (${PEEK} s)</button></div>
          <p class="bp__fb" id="bp-fb" role="status"></p>
        </div>
        <div class="bp__grid" id="bp-grid">
          ${cards.map((c) => `
            <button class="bp__card" data-id="${c.id}" aria-label="Carte">
              <span class="bp__inner">
                <span class="bp__face bp__face--front">${artSVG(c.plant[0])}<small>${c.plant[1]}</small></span>
                <span class="bp__face bp__face--back">${SPROUT}</span>
              </span>
            </button>`).join('')}
        </div>
      </div>`;
    setStage(root, 0);
    root.querySelector('#bp-step').textContent = STEP_TEXT[0];
  }

  function peek() {
    const btn = root.querySelector('#bp-start');
    const cardsEl = [...root.querySelectorAll('.bp__card')];
    cardsEl.forEach((el) => el.classList.add('is-up'));
    let left = PEEK;
    btn.disabled = true;
    btn.textContent = `Mémorisez… ${left}`;
    const t = setInterval(() => {
      if (!alive()) return clearInterval(t);
      left--;
      if (left > 0) {
        btn.textContent = `Mémorisez… ${left}`;
        return;
      }
      clearInterval(t);
      cardsEl.forEach((el) => el.classList.remove('is-up'));
      root.querySelector('.bp__actions').hidden = true;
      root.querySelector('#bp-fb').textContent = 'À vous de jouer !';
      locked = false;
    }, 1000);
  }

  function flip(el) {
    if (locked || el.classList.contains('is-up') || el.classList.contains('is-found')) return;
    const card = cards[Number(el.dataset.id)];
    el.classList.add('is-up');
    sfx.tile();
    open.push({ el, card });
    if (open.length < 2) return;
    moves++;
    locked = true;
    const [a, b] = open;
    open = [];
    if (a.card.plant[0] === b.card.plant[0]) {
      setTimeout(() => match(a, b), 450);
    } else {
      sfx.buzz();
      root.querySelector('#bp-fb').textContent = 'Raté ! Regardez bien où elles sont.';
      setTimeout(() => {
        if (!alive()) return;
        a.el.classList.remove('is-up');
        b.el.classList.remove('is-up');
        locked = false;
      }, 1000);
    }
  }

  function match(a, b) {
    if (!alive()) return;
    found++;
    [a.el, b.el].forEach((el) => el.classList.add('is-found'));
    sfx.ding();
    root.querySelector('#bp-fb').textContent = `${a.card.plant[1]} : ${a.card.plant[2]}`;
    root.querySelector('#bp-step').textContent = STEP_TEXT[found];
    setStage(root, found);
    const plantBox = root.querySelector('.bp__plantbox');
    gsap.fromTo(plantBox, { scale: 1 }, { scale: 1.06, yoyo: true, repeat: 1, duration: 0.18 });
    if (found === PAIRS) return setTimeout(finale, 1400);
    locked = false;
  }

  function finale() {
    if (!alive()) return;
    sfx.win();
    confetti({ particleCount: 140, spread: 90, origin: { y: 0.6 } });
    const face = `${import.meta.env.BASE_URL}face.jpg`;
    root.innerHTML = `
      <div class="bp__end">
        <h3>Un piment magnifique !</h3>
        <p class="bp__meta">${moves} coups pour ${PAIRS} paires. Sylviane passe à la dégustation.</p>
        <div class="bp__scene" id="bp-scene">
          <div class="bp__head"><img src="${face}" alt="Sylviane" onerror="this.remove()" /><span class="bp__flames" aria-hidden="true">🔥</span></div>
          <div class="bp__bite" aria-hidden="true">${artSVG('piment', 'bp__bite-art')}</div>
          <div class="bp__bubble" id="bp-bubble"></div>
        </div>
        <div class="bp__actions">
          <button class="btn" data-bp="again">Replanter</button>
          <button class="btn btn--primary" data-bp="done">Merci Sylviane !</button>
        </div>
      </div>`;
    const scene = root.querySelector('#bp-scene');
    const bite = scene.querySelector('.bp__bite');
    const head = scene.querySelector('.bp__head');
    const bubble = scene.querySelector('#bp-bubble');
    const say = (t) => { bubble.textContent = t; gsap.fromTo(bubble, { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(2)' }); };
    const tl = gsap.timeline({ delay: 0.4 });
    tl.set(bite, { x: 130, y: 40, opacity: 1, rotate: -20 })
      .call(() => say('Mmh, il est beau, celui-là…'))
      .to(bite, { x: 28, y: 6, rotate: -60, duration: 0.9, ease: 'power2.inOut' })
      .to(bite, { x: 20, y: 6, duration: 0.12, repeat: 3, yoyo: true })
      .call(() => { sfx.buzz(); say('…'); })
      .to(head, { filter: 'saturate(2.5) hue-rotate(-12deg)', duration: 1.2 }, '+=0.2')
      .call(() => { head.classList.add('is-hot'); say('Oh là là ! Il est PLUS fort que le bailleur !'); })
      .to(head, { x: 4, duration: 0.05, repeat: 9, yoyo: true })
      .to(bite, { opacity: 0, duration: 0.3 })
      .call(() => say('Mais je le referai l’an prochain. Sur le balcon.'), null, '+=1.2');
  }

  root.addEventListener('click', (e) => {
    const c = e.target.closest('.bp__card');
    if (c) return flip(c);
    if (e.target.closest('#bp-start')) return peek();
    const act = e.target.closest('[data-bp]')?.dataset.bp;
    if (act === 'again') newGame();
    if (act === 'done') onWin();
  });

  newGame();
}
