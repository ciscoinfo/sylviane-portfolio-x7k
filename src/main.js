import './style.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { startScrabble } from './games/scrabble.js';
import { startCourses } from './games/courses.js';
import { startChorale } from './games/chorale.js';
import { startYiddish } from './games/yiddish.js';
import { startHLM } from './games/hlm.js';
import { startChicken } from './games/chicken.js';
import { startWalk } from './games/walk.js';
import { startSeries } from './games/series.js';
import { startCoffee } from './games/coffee.js';
import { startMulti } from './games/multi.js';
import { startBalcon } from './games/balcon.js';
import { setSound, isSoundOn, sfx, onTrack, nextTrack } from './audio.js';

gsap.registerPlugin(ScrollTrigger);

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* ---------- Son ---------- */
onTrack((title) => {
  $('#nowplaying').textContent = title ? '♪ ' + title : '';
  $('#player').hidden = !title;
});
$('#next-track').addEventListener('click', nextTrack);
const soundBtn = $('#sound');
soundBtn.addEventListener('click', () => {
  const on = setSound(!isSoundOn());
  soundBtn.setAttribute('aria-pressed', on);
  $('.sound__icon', soundBtn).textContent = on ? '🔊' : '🔇';
  if (on) sfx.ding();
});

/* ---------- Animations du site ---------- */
function animateBars(scope = document) {
  $$('.bar', scope).forEach((bar) => {
    const v = Number(bar.dataset.v);
    gsap.fromTo($('i', bar), { width: '0%' }, { width: v + '%', duration: 1.4, ease: 'power3.out' });
  });
}

function setupSite() {
  gsap.from('.hero__name', { y: 80, opacity: 0, duration: 1.1, ease: 'power4.out' });
  gsap.from('.hero__role, .hero__lead, .hero__cta, .eyebrow', {
    y: 24, opacity: 0, duration: 0.9, stagger: 0.12, delay: 0.25, ease: 'power3.out',
  });
  gsap.from('.photo', { scale: 0.88, opacity: 0, rotate: -4, duration: 1.2, delay: 0.2, ease: 'back.out(1.4)' });

  $$('.reveal').forEach((el) => {
    gsap.from(el, {
      y: 50, opacity: 0, duration: 0.9, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 85%' },
    });
  });

  $$('[data-count]').forEach((el) => {
    const end = Number(el.dataset.count);
    const o = { v: 0 };
    gsap.to(o, {
      v: end, duration: 2, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 90%' },
      onUpdate: () => (el.textContent = Math.round(o.v)),
    });
  });

  gsap.to('.marquee__track', { xPercent: -50, duration: 28, ease: 'none', repeat: -1 });
  ScrollTrigger.refresh();
}

/* ---------- Jeux : sections verrouillées + salle de jeux ---------- */
// section : la section que le jeu déverrouille ; bonus : jeu libre, indépendant du site
const GAME_LIST = [
  { id: 'courses', section: 'competences', emoji: '🛒', title: 'Les courses au Lidl du coin', desc: 'Remplir le caddie sans se faire avoir par les prix.', start: startCourses },
  { id: 'hlm', section: 'experiences', emoji: '🪳', title: 'La chasse aux nuisibles', desc: 'Tapette électrique contre cafards, araignées, rats et promesses du bailleur.', start: startHLM },
  { id: 'chorale', section: 'avis', emoji: '🎶', title: 'La Chorale des cafards', desc: 'Un jeu de rythme sur l’Habanera de Carmen.', start: startChorale },
  { id: 'yiddish', section: 'contact', emoji: '📜', title: 'L’examen de yiddish', desc: 'Cinq mots, un diplôme de nachès.', start: startYiddish },
  { id: 'chicken', bonus: true, emoji: '🐔', title: 'Le poulet du dimanche', desc: 'Sylviane court après le poulet, saute les obstacles… et le four l’attend.', start: startChicken },
  { id: 'walk', bonus: true, emoji: '🧳', title: 'Le tour du monde à pied', desc: 'Sylviane sillonne l’Europe, sac au dos. Où ira-t-elle ? Surprise.', start: startWalk },
  { id: 'multi', bonus: true, emoji: '🤹', title: 'Tout en même temps', desc: 'Four, micro-ondes, Scrabble, WhatsApp, vaisselle : tout gérer d’un coup.', start: startMulti },
  { id: 'coffee', bonus: true, emoji: '☕', title: 'La cafetière à piston', desc: 'Doser, mélanger, infuser, presser. Sylviane goûte, et elle juge.', start: startCoffee },
  { id: 'balcon', bonus: true, emoji: '🌶️', title: 'Le balcon de Sylviane', desc: 'Un memory de plantes de balcon : à chaque paire, le piment pousse un peu plus.', start: startBalcon },
  { id: 'series', bonus: true, emoji: '📺', title: 'Ne pas s’endormir', desc: 'Café, chocolat et série française de l’après-midi.', start: startSeries },
];
const GAMES = Object.fromEntries(GAME_LIST.map((g) => [g.id, g.start]));
const modal = $('#modal');
const modalContent = $('#modal-content');
let currentSection = null;

function lockSections() {
  $$('.lockable').forEach((sec) => {
    sec.classList.add('is-locked');
    $('.lock', sec).hidden = false;
  });
}

function unlock(sec) {
  const lock = $('.lock', sec);
  gsap.to(lock, {
    opacity: 0, duration: 0.7, onComplete: () => {
      lock.hidden = true;
      sec.classList.remove('is-locked');
      animateBars(sec);
      renderArcade();
    },
  });
}

function closeModal() {
  modal.hidden = true;
  modalContent.innerHTML = '';
  $('.modal__box').scrollTop = 0; // le prochain jeu s'ouvre toujours en haut
}

// Raccourci discret : passer le jeu en cours (pour tester, ou si l'envie de jouer n'y est pas)
$('#skip-game').addEventListener('click', () => {
  const sec = currentSection;
  closeModal();
  if (sec) unlock(sec);
});

// sec : section à déverrouiller à la victoire (null pour un rejeu ou un jeu bonus)
function launchGame(id, sec = null) {
  currentSection = sec;
  modal.hidden = false;
  $('.modal__box').scrollTop = 0;
  GAMES[id](modalContent, () => {
    closeModal();
    if (sec) {
      unlock(sec);
      sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
}

// Échap ferme aussi la fenêtre de jeu
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !modal.hidden) closeModal();
});

function renderArcade() {
  $('#arcade').innerHTML = GAME_LIST.map((g) => {
    const locked = g.section && $('#' + g.section).classList.contains('is-locked');
    return `
      <article class="arcade__card${locked ? ' is-locked' : ''}${g.bonus ? ' is-bonus' : ''}">
        ${g.bonus ? '<span class="arcade__tag">Bonus</span>' : ''}
        <div class="arcade__emoji">${locked ? '🔒' : g.emoji}</div>
        <h3>${g.title}</h3>
        <p>${g.desc}</p>
        <button class="btn ${locked ? '' : 'btn--primary'}" data-arcade="${g.id}">${locked ? 'À débloquer' : 'Jouer'}</button>
      </article>`;
  }).join('');
}

document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-open-game]');
  if (btn) {
    const sec = btn.closest('.lockable');
    launchGame(sec.dataset.game, sec);
  }
  const card = e.target.closest('[data-arcade]');
  if (card) {
    const g = GAME_LIST.find((x) => x.id === card.dataset.arcade);
    const sec = g.section ? $('#' + g.section) : null;
    if (sec && sec.classList.contains('is-locked')) sec.scrollIntoView({ behavior: 'smooth', block: 'center' });
    else launchGame(g.id);
  }
  if (e.target.closest('.modal__close') || e.target === modal) closeModal();
});

/* ---------- Formulaire de réclamation ---------- */
$('#claim').addEventListener('submit', (e) => {
  e.preventDefault();
  const out = $('.form__result', e.currentTarget);
  out.hidden = false;
  out.textContent =
    'Votre réclamation a bien été reçue. Délai de réponse : 6 à 8 mois. Sylviane ne vous oubliera pas.';
  sfx.win();
});

/* ---------- Entrée : le Scrabble ---------- */
function enterSite() {
  const gate = $('#gate');
  document.body.classList.remove('is-gated');
  gsap.to(gate, {
    yPercent: -100, duration: 1.1, ease: 'power4.inOut',
    onComplete: () => {
      gate.remove();
      setupSite();
    },
  });
}

async function boot() {
  lockSections();
  renderArcade();
  if (new URLSearchParams(location.search).has('skip')) { // raccourci de développement
    $('#gate').remove();
    document.body.classList.remove('is-gated');
    return setupSite();
  }
  const res = await fetch(`${import.meta.env.BASE_URL}mots.txt`);
  const words = (await res.text()).split('\n');
  startScrabble($('#scrabble'), words, enterSite);
  $('#skip-gate').addEventListener('click', enterSite, { once: true });
}
boot();
