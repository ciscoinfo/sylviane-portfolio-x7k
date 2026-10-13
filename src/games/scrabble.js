import confetti from 'canvas-confetti';
import { sfx } from '../audio.js';

const VALUES = {
  A: 1, E: 1, I: 1, L: 1, N: 1, O: 1, R: 1, S: 1, T: 1, U: 1,
  D: 2, G: 2, M: 2, B: 3, C: 3, P: 3, F: 4, H: 4, V: 4, J: 8, Q: 8,
  K: 10, W: 10, X: 10, Y: 10, Z: 10,
};
// Sac de lettres approximatif du Scrabble français
const BAG = 'AAAAAAAAAEEEEEEEEEEEEEEEIIIIIIIINNNNNNOOOOOORRRRRRSSSSSSTTTTTTUUUUULLLLLDDDMMMGGBBCCPPFFHHVVJQKWXYZ';
const VOWELS = new Set('AEIOU');

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
const score = (w) => [...w].reduce((s, l) => s + (VALUES[l] || 0), 0);

function canForm(word, letters) {
  const pool = {};
  for (const l of letters) pool[l] = (pool[l] || 0) + 1;
  for (const l of word) {
    if (!pool[l]) return false;
    pool[l]--;
  }
  return true;
}

function countWords(words, letters) {
  let n = 0;
  for (const w of words) if (w.length >= 3 && canForm(w, letters)) n++;
  return n;
}

// Chevalet : un vrai mot (4-5 lettres) complété au hasard, puis on exige au moins 15 mots possibles
// pour que le joueur trouve facilement quelque chose.
function makeRack(words) {
  const base = words.filter((w) => w.length >= 4 && w.length <= 5);
  let letters;
  for (let tries = 0; tries < 60; tries++) {
    letters = [...pick(base)];
    while (letters.length < 7) letters.push(pick(BAG));
    if (letters.filter((l) => VOWELS.has(l)).length < 2) continue;
    if (countWords(words, letters) >= 15) break;
  }
  return shuffle(letters).map((letter, id) => ({ id, letter }));
}

function bestWord(words, rack) {
  const letters = rack.map((t) => t.letter);
  let best = '';
  for (const w of words) if (w.length > best.length && canForm(w, letters)) best = w;
  return best;
}

const BAD = [
  (w) => `« ${w} » ? Ce mot n’existe pas. Sylviane déposerait une réclamation.`,
  (w) => `« ${w} » n’est pas dans le dictionnaire. Sylviane lève un sourcil.`,
  (w) => `Refusé. « ${w} » : même au Scrabble on ne triche pas.`,
  (w) => `« ${w} » ? Sylviane veut voir le règlement.`,
];

export function startScrabble(container, words, onWin) {
  const dico = new Set(words);
  let rack = makeRack(words);
  let word = []; // ids des tuiles posées, dans l'ordre
  let hints = 0;
  let done = false;
  const best = bestWord(words, rack);

  container.innerHTML = `
    <div class="sb">
      <div class="sb__row sb__row--word" aria-label="Votre mot"></div>
      <div class="sb__row sb__row--rack" aria-label="Votre chevalet"></div>
      <p class="sb__msg" role="status">Cliquez sur les lettres (ou tapez-les au clavier).</p>
      <div class="sb__actions">
        <button class="btn btn--primary" data-act="ok">Valider le mot</button>
        <button class="btn" data-act="shuffle">Mélanger</button>
        <button class="btn" data-act="clear">Effacer</button>
        <button class="btn btn--ghost" data-act="hint">Demander à Sylviane</button>
      </div>
    </div>`;
  const wordRow = container.querySelector('.sb__row--word');
  const rackRow = container.querySelector('.sb__row--rack');
  const msg = container.querySelector('.sb__msg');

  const say = (text, kind = '') => {
    msg.textContent = text;
    msg.className = `sb__msg ${kind}`;
  };
  const tileHTML = (t, cls = '') =>
    `<button class="stile ${cls}" data-id="${t.id}"><span>${t.letter}</span><sup>${VALUES[t.letter]}</sup></button>`;
  const current = () => word.map((id) => rack.find((t) => t.id === id).letter).join('');

  function render() {
    wordRow.innerHTML = Array.from({ length: 7 }, (_, i) => {
      const id = word[i];
      return id === undefined
        ? '<span class="stile stile--slot"></span>'
        : tileHTML(rack.find((t) => t.id === id), 'stile--placed');
    }).join('');
    rackRow.innerHTML = rack
      .map((t) => (word.includes(t.id) ? '<span class="stile stile--slot"></span>' : tileHTML(t)))
      .join('');
  }

  function add(id) {
    if (done || word.includes(id)) return;
    word.push(id);
    sfx.tile();
    render();
  }
  function removeAt(id) {
    if (done) return;
    word = word.filter((x) => x !== id);
    sfx.tile();
    render();
  }

  function submit() {
    if (done) return;
    const w = current();
    if (w.length < 3) {
      sfx.buzz();
      say('Trois lettres minimum. Sylviane n’accepte pas les demi-mesures.', 'bad');
      return;
    }
    if (!dico.has(w)) {
      sfx.buzz();
      say(pick(BAD)(w), 'bad');
      wordRow.classList.remove('shake');
      void wordRow.offsetWidth;
      wordRow.classList.add('shake');
      return;
    }
    done = true;
    sfx.win();
    const pts = score(w);
    say(`${w} : ${pts} point${pts > 1 ? 's' : ''}. Sylviane valide. Bienvenue !`, 'good');
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    setTimeout(onWin, 1700);
  }

  container.addEventListener('click', (e) => {
    const tile = e.target.closest('.stile[data-id]');
    if (tile) {
      const id = Number(tile.dataset.id);
      word.includes(id) ? removeAt(id) : add(id);
      return;
    }
    const act = e.target.closest('[data-act]')?.dataset.act;
    if (act === 'ok') submit();
    if (act === 'clear') { word = []; render(); }
    if (act === 'shuffle') { rack = shuffle(rack); render(); }
    if (act === 'hint') {
      hints++;
      const shown = Math.min(hints, 3);
      say(
        `Sylviane souffle : un mot possible de ${best.length} lettres, qui commence par « ${best.slice(0, shown)} ».`,
        'hint'
      );
    }
  });

  document.addEventListener('keydown', function onKey(e) {
    if (done) return document.removeEventListener('keydown', onKey);
    if (e.key === 'Enter') return submit();
    if (e.key === 'Backspace') { word.pop(); return render(); }
    if (/^[a-zA-Z]$/.test(e.key)) {
      const L = e.key.toUpperCase();
      const t = rack.find((x) => x.letter === L && !word.includes(x.id));
      if (t) add(t.id);
    }
  });

  render();
}
