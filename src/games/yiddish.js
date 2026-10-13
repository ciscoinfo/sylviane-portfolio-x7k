import confetti from 'canvas-confetti';
import { sfx } from '../audio.js';

// [translittération, écriture hébraïque (ou ''), sens, commentaire de Sylviane]
const WORDS = [
  ['chutzpah', 'חוצפּה', 'Le culot, l’audace', 'Indispensable pour demander un remboursement sans ticket de caisse.'],
  ['kvetch', 'קוועטש', 'Se plaindre sans arrêt', 'Sylviane en a fait un art.'],
  ['nachès', 'נחת', 'La fierté tirée de ses enfants', 'À consommer sans modération en regardant son site.'],
  ['mentsh', 'מענטש', 'Une personne bien, intègre', 'Le plus beau compliment possible.'],
  ['bobe', 'בובע', 'La grand-mère', 'Plus redoutable que le bailleur.'],
  ['mame-loshn', 'מאַמע־לשון', 'La langue maternelle', 'Littéralement « la langue de maman ». Ça tombe bien.'],
  ['tsures', 'צרות', 'Les ennuis, les soucis', 'Le bailleur, les cafards, les voisins. Au choix.'],
  ['oy vey', 'אוי װיי', 'Aïe, mon Dieu, hélas', 'La réaction standard devant une facture.'],
  ['gevalt', 'גוואַלד', 'Au secours ! Quelle horreur !', 'À crier devant un concombre à 2,10 €.'],
  ['nu', 'נו', 'Alors ? Eh bien ?', 'Deux lettres, un point d’interrogation, et toute l’impatience du monde.'],
  ['shlof', 'שלאָף', 'Dors, le sommeil', 'Comme dans « Shlof, mayn kind ».'],
  ['shlep', '', 'Traîner péniblement', 'Les courses jusqu’au quatrième étage, par exemple.'],
  ['kvell', '', 'Rayonner de fierté', 'Ce que fait Sylviane quand son équipe de cafards chante juste.'],
];
const ROUNDS = 5;
const NEEDED = 4;

const shuffle = (a) => [...a].sort(() => Math.random() - 0.5);

export function startYiddish(container, onWin) {
  let deck, round, good, locked;

  function newGame() {
    deck = shuffle(WORDS).slice(0, ROUNDS);
    round = 0;
    good = 0;
    next();
  }

  function next() {
    if (document.getElementById('modal')?.hidden) return; // fenêtre fermée entre-temps
    locked = false;
    if (round >= ROUNDS) return end();
    const [tr, heb, meaning] = deck[round];
    const wrong = shuffle(WORDS.filter((w) => w[0] !== tr)).slice(0, 2).map((w) => w[2]);
    const options = shuffle([meaning, ...wrong]);
    container.innerHTML = `
      <div class="yg">
        <h3>Le cours de yiddish de Sylviane</h3>
        <p class="yg__meta">Mot ${round + 1} sur ${ROUNDS} · il en faut ${NEEDED} pour passer l’examen</p>
        <div class="yg__word">
          ${heb ? `<div class="yg__heb" lang="yi" dir="rtl">${heb}</div>` : ''}
          <div class="yg__tr">${tr}</div>
        </div>
        <div class="yg__opts">
          ${options.map((o) => `<button class="yg__opt" data-v="${o}">${o}</button>`).join('')}
        </div>
        <p class="yg__fb" role="status"></p>
      </div>`;
  }

  function answer(btn) {
    if (locked) return;
    locked = true;
    const [, , meaning, comment] = deck[round];
    const ok = btn.dataset.v === meaning;
    container.querySelectorAll('.yg__opt').forEach((b) => {
      if (b.dataset.v === meaning) b.classList.add('yg__opt--ok');
    });
    if (ok) {
      good++;
      sfx.ding();
    } else {
      btn.classList.add('yg__opt--bad');
      sfx.buzz();
    }
    const fb = container.querySelector('.yg__fb');
    fb.className = `yg__fb ${ok ? 'good' : 'bad'}`;
    fb.textContent = (ok ? 'Richtig ! ' : `Non : « ${meaning} ». `) + comment;
    round++;
    setTimeout(next, 2300);
  }

  function end() {
    const pass = good >= NEEDED;
    if (pass) {
      sfx.win();
      confetti({ particleCount: 140, spread: 90, origin: { y: 0.6 } });
    }
    container.innerHTML = `
      <div class="yg yg--end">
        <h3>${pass ? 'Mazel tov !' : 'Pas encore…'}</h3>
        <p>${good} bonne${good > 1 ? 's' : ''} réponse${good > 1 ? 's' : ''} sur ${ROUNDS}. ${
          pass
            ? 'Sylviane est fière : c’est du <em>nachès</em>. Vous pouvez déposer votre réclamation.'
            : 'Sylviane soupire, mais lui laisse une deuxième chance. Le professeur aussi.'
        }</p>
        <button class="btn btn--primary" data-yg="${pass ? 'win' : 'retry'}">${pass ? 'Accéder au formulaire' : 'Repasser l’examen'}</button>
      </div>`;
  }

  container.addEventListener('click', (e) => {
    const opt = e.target.closest('.yg__opt');
    if (opt) return answer(opt);
    const act = e.target.closest('[data-yg]')?.dataset.yg;
    if (act === 'retry') newGame();
    if (act === 'win') onWin();
  });

  newGame();
}
