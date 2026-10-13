import confetti from 'canvas-confetti';
import { sfx } from '../audio.js';

// [nom, emoji, prix correct min, prix correct max, unité]
const PRODUCTS = [
  ['Concombre', '🥒', 0.69, 0.99, 'pièce'],
  ['Tomates', '🍅', 1.49, 1.99, 'barquette'],
  ['Pommes de terre', '🥔', 1.39, 1.79, '2 kg'],
  ['Carottes', '🥕', 0.89, 1.19, 'kg'],
  ['Bananes', '🍌', 1.19, 1.49, 'kg'],
  ['Pommes', '🍎', 1.89, 2.39, 'kg'],
  ['Citrons', '🍋', 1.29, 1.69, 'filet'],
  ['Oignons', '🧅', 0.99, 1.29, 'kg'],
  ['Salade', '🥬', 0.79, 1.09, 'pièce'],
  ['Aubergine', '🍆', 1.09, 1.59, 'pièce'],
  ['Brocoli', '🥦', 1.29, 1.79, 'pièce'],
  ['Ail', '🧄', 0.79, 1.09, 'filet'],
  ['Champignons', '🍄', 1.59, 1.99, 'barquette'],
  ['Maïs', '🌽', 1.59, 1.99, 'lot de 2'],
  ['Raisin', '🍇', 2.49, 2.99, 'kg'],
];
const NB_SHELF = 9;
const NB_TRAPS = 3;
const MAX_FAULTS = 3;

const rand = (a, b) => a + Math.random() * (b - a);
const roundTo5 = (n) => Math.round(n * 20) / 20;
const eur = (n) => n.toFixed(2).replace('.', ',') + ' €';
const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

function newShelf() {
  const chosen = shuffle(PRODUCTS).slice(0, NB_SHELF);
  const trapIdx = new Set(shuffle([...chosen.keys()]).slice(0, NB_TRAPS));
  return chosen.map(([name, emoji, lo, hi, unit], i) => {
    const trap = trapIdx.has(i);
    const price = trap ? roundTo5(hi * rand(1.9, 3.2)) : roundTo5(rand(lo, hi));
    return { id: i, name, emoji, unit, price, trap };
  });
}

const FAULT_LINES = [
  (p) => `Non ! ${p.name} à ${eur(p.price)}, c’est beaucoup trop cher !`,
  (p) => `${eur(p.price)} pour ${p.name.toLowerCase()} ? Sylviane repose ça immédiatement.`,
  (p) => `Certainement pas à ce prix-là. ${p.name} : ${eur(p.price)}. Scandaleux.`,
];

export function startCourses(container, onWin) {
  let shelf = newShelf();
  let cart = [];
  let faults = 0;
  let over = false;
  let lineIdx = 0;
  const goal = () => shelf.filter((p) => !p.trap).length;

  container.innerHTML = `
    <div class="cg">
      <div class="cg__head">
        <h3>Les courses au Lidl du coin</h3>
        <p>Mettez dans le caddie uniquement les produits <b>à un prix correct</b>. Faites glisser, ou cliquez.</p>
        <div class="cg__status">
          <span class="cg__patience" aria-label="Patience de Sylviane"></span>
          <span class="cg__count"></span>
        </div>
      </div>
      <div class="cg__board">
        <div class="cg__shelf" aria-label="Rayon fruits et légumes"></div>
        <div class="cg__cart" aria-label="Caddie">
          <div class="cg__cartIcon">🛒</div>
          <ul class="cg__items"></ul>
          <div class="cg__total"></div>
        </div>
      </div>
      <p class="cg__msg" role="status"></p>
    </div>`;

  const shelfEl = container.querySelector('.cg__shelf');
  const cartEl = container.querySelector('.cg__cart');
  const itemsEl = container.querySelector('.cg__items');
  const totalEl = container.querySelector('.cg__total');
  const msgEl = container.querySelector('.cg__msg');
  const patienceEl = container.querySelector('.cg__patience');
  const countEl = container.querySelector('.cg__count');

  const say = (t, kind = '') => {
    msgEl.textContent = t;
    msgEl.className = `cg__msg ${kind}`;
  };

  function render() {
    shelfEl.innerHTML = shelf
      .filter((p) => !cart.includes(p))
      .map(
        (p) => `
        <div class="prod" data-id="${p.id}">
          <div class="prod__emoji">${p.emoji}</div>
          <div class="prod__name">${p.name}</div>
          <div class="prod__tag"><b>${eur(p.price)}</b><small>${p.unit}</small></div>
        </div>`
      )
      .join('');
    itemsEl.innerHTML = cart.map((p) => `<li>${p.emoji} ${p.name} <b>${eur(p.price)}</b></li>`).join('');
    const total = cart.reduce((s, p) => s + p.price, 0);
    totalEl.textContent = cart.length ? `Total : ${eur(total)}` : 'Caddie vide';
    patienceEl.textContent = 'Patience de Sylviane : ' + '❤️'.repeat(MAX_FAULTS - faults) + '🖤'.repeat(faults);
    countEl.textContent = `${cart.length} / ${goal()} bons produits`;
  }

  function tryAdd(p, el) {
    if (over) return;
    if (p.trap) {
      faults++;
      sfx.buzz();
      say(FAULT_LINES[lineIdx++ % FAULT_LINES.length](p), 'bad');
      el?.classList.remove('prod--shake');
      void el?.offsetWidth;
      el?.classList.add('prod--shake');
      if (faults >= MAX_FAULTS) {
        say('Trop d’arnaques. Sylviane demande à voir le responsable. Nouveau rayon !', 'bad');
        over = true;
        setTimeout(reset, 1800);
      }
      // on ne re-render pas le rayon, pour laisser l'animation de secousse
      patienceEl.textContent = 'Patience de Sylviane : ' + '❤️'.repeat(MAX_FAULTS - faults) + '🖤'.repeat(faults);
      return;
    }
    cart.push(p);
    sfx.ding();
    say(`${p.name} à ${eur(p.price)} : bonne affaire.`, 'good');
    if (cart.length === goal()) return win();
    render();
  }

  function reset() {
    shelf = newShelf();
    cart = [];
    faults = 0;
    over = false;
    say('');
    render();
  }

  function win() {
    over = true;
    render();
    sfx.win();
    confetti({ particleCount: 140, spread: 90, origin: { y: 0.7 } });
    const total = cart.reduce((s, p) => s + p.price, 0);
    const traps = shelf.filter((p) => p.trap).reduce((s, p) => s + p.price, 0);
    say(`Caddie rempli pour ${eur(total)}. Sylviane a évité ${eur(traps)} d’arnaques. Accès accordé.`, 'good');
    const btn = document.createElement('button');
    btn.className = 'btn btn--primary';
    btn.textContent = 'Passer en caisse';
    btn.onclick = onWin;
    msgEl.after(btn);
  }

  // Glisser-déposer (pointer events) ; un simple clic ajoute aussi au caddie.
  shelfEl.addEventListener('pointerdown', (e) => {
    const el = e.target.closest('.prod');
    if (!el || over) return;
    const p = shelf.find((x) => x.id === Number(el.dataset.id));
    const startX = e.clientX, startY = e.clientY;
    let ghost = null;

    const move = (ev) => {
      if (!ghost && Math.hypot(ev.clientX - startX, ev.clientY - startY) > 6) {
        ghost = el.cloneNode(true);
        ghost.classList.add('prod--ghost');
        document.body.appendChild(ghost);
        el.classList.add('prod--lifted');
      }
      if (ghost) {
        ghost.style.left = ev.clientX + 'px';
        ghost.style.top = ev.clientY + 'px';
        const r = cartEl.getBoundingClientRect();
        const over = ev.clientX > r.left && ev.clientX < r.right && ev.clientY > r.top && ev.clientY < r.bottom;
        cartEl.classList.toggle('cg__cart--hot', over);
      }
    };
    const up = (ev) => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      cartEl.classList.remove('cg__cart--hot');
      el.classList.remove('prod--lifted');
      if (!ghost) return tryAdd(p, el); // clic simple
      ghost.remove();
      const r = cartEl.getBoundingClientRect();
      if (ev.clientX > r.left && ev.clientX < r.right && ev.clientY > r.top && ev.clientY < r.bottom) tryAdd(p, el);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  });

  render();
  say('Astuce : un concombre ne vaut pas 2,10 €.');
}
