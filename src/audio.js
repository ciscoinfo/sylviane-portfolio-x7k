// Sons et musique 100 % synthétisés (Web Audio) : aucun fichier à charger.
// Playlist de pièces classiques du domaine public, jouées dans un ordre aléatoire,
// sans jamais répéter deux fois de suite la même.

import { gardeEvents } from './scores/carmen.js';
import { TOREADORS, TOREADORS_BPM, TOREADORS_BEATS } from './scores/toreadors.js';

let ctx = null;
let master = null;
let bus = null;
let enabled = false;
let timer = null;
let lastPiece = -1;

const midi = (n) => 440 * Math.pow(2, (n - 69) / 12);

function ensure() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain();
    master.gain.value = 0.55;
    master.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone(freq, t, dur, { type = 'sine', vol = 0.2, to = null, dest = master } = {}) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(dest);
  o.start(t);
  o.stop(t + dur + 0.05);
}

// Timbre "piano" : attaque nette, longue résonance
function piano(n, t, dur, vol = 0.1, dest = bus, minRing = 0.5) {
  const f = midi(n);
  const ring = Math.max(dur, minRing) * 1.6;
  tone(f, t, ring, { type: 'triangle', vol, dest });
  tone(f * 2, t, ring * 0.5, { type: 'sine', vol: vol * 0.35, dest });
}

function noise(t, dur, { vol = 0.3, type = 'lowpass', f0 = 2000, f1 = 300, dest = master } = {}) {
  const len = Math.ceil(ctx.sampleRate * dur);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const f = ctx.createBiquadFilter();
  f.type = type;
  f.frequency.setValueAtTime(f0, t);
  f.frequency.exponentialRampToValueAtTime(f1, t + dur);
  const g = ctx.createGain();
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  src.connect(f).connect(g).connect(dest);
  src.start(t);
}

/* ---------- Effets ponctuels ---------- */
export const sfx = {
  // tapette électrique : crépitement + claque + écrasement ; 'big' = plus grave (rat, bailleur)
  smack(kind = 'bug') {
    if (!enabled) return;
    ensure();
    const t = ctx.currentTime;
    for (let i = 0; i < 5; i++) tone(700 + Math.random() * 1800, t + i * 0.012, 0.018, { type: 'square', vol: 0.06 });
    noise(t, 0.09, { vol: 0.55, f0: 3600, f1: 500 });
    tone(kind === 'big' ? 90 : 150, t, kind === 'big' ? 0.2 : 0.11, { type: 'sine', vol: 0.4, to: 45 });
    noise(t + 0.05, 0.08, { vol: 0.22, type: 'bandpass', f0: 1300, f1: 600 });
  },
  // coup de tapette dans le vide
  whiff() {
    if (!enabled) return;
    ensure();
    noise(ctx.currentTime, 0.13, { vol: 0.12, type: 'highpass', f0: 700, f1: 3200 });
  },
  tile() {
    if (!enabled) return;
    ensure();
    tone(520, ctx.currentTime, 0.07, { type: 'triangle', vol: 0.12, to: 380 });
  },
  ding() {
    if (!enabled) return;
    ensure();
    const t = ctx.currentTime;
    tone(1318, t, 0.35, { vol: 0.16 });
    tone(1975, t + 0.06, 0.45, { vol: 0.1 });
  },
  buzz() {
    if (!enabled) return;
    ensure();
    tone(150, ctx.currentTime, 0.28, { type: 'sawtooth', vol: 0.14, to: 110 });
  },
  win() {
    if (!enabled) return;
    ensure();
    const t = ctx.currentTime;
    [523, 659, 784, 1047].forEach((f, i) => tone(f, t + i * 0.11, 0.35, { type: 'triangle', vol: 0.16 }));
  },
};

/* ---------- Les pièces ---------- */
// Chaque pièce renvoie une liste [note MIDI, début (s), durée (s), volume] et sa durée totale.

// Bach — Prélude en do majeur (BWV 846), accords en arpèges
function bach() {
  const bars = [
    [48, 52, 55, 60, 64], [48, 50, 57, 62, 65], [47, 50, 55, 62, 65], [48, 52, 55, 60, 64],
    [48, 52, 57, 64, 69], [48, 50, 54, 57, 62], [47, 50, 55, 62, 67], [47, 48, 52, 55, 60],
    [45, 48, 52, 55, 60], [38, 45, 50, 54, 60], [43, 47, 50, 55, 59], [43, 46, 52, 55, 61],
    [41, 45, 50, 57, 62], [42, 48, 50, 57, 62], [43, 47, 50, 55, 62], [43, 47, 50, 53, 62],
    [36, 48, 52, 55, 64],
  ];
  const step = 0.21;
  const ev = [];
  bars.forEach((c, b) => {
    const last = b === bars.length - 1;
    const base = b * 16 * step;
    if (last) {
      c.forEach((n, i) => ev.push([n, base + i * 0.05, 4, 0.1]));
      return;
    }
    for (let half = 0; half < 2; half++) {
      [0, 1, 2, 3, 4, 2, 3, 4].forEach((idx, i) => {
        ev.push([c[idx], base + (half * 8 + i) * step, 0.8, idx === 0 ? 0.11 : 0.085]);
      });
    }
  });
  return { ev, len: bars.length * 16 * step + 4 };
}

// Beethoven — Pour Élise (thème)
function elise() {
  const melody = [
    ...[76, 75, 76, 75, 76, 71, 74, 72].map((n) => [n, 1]), [69, 3],
    [60, 1], [64, 1], [69, 1], [71, 3],
    [64, 1], [68, 1], [71, 1], [72, 3],
    [64, 1], [76, 1], [75, 1], [76, 1], [75, 1], [76, 1], [71, 1], [74, 1], [72, 1], [69, 3],
    [60, 1], [64, 1], [69, 1], [71, 3],
    [64, 1], [72, 1], [71, 1], [69, 4],
  ];
  const q = 0.17;
  const ev = [];
  let t = 0;
  melody.forEach(([n, d]) => {
    ev.push([n, t, d * q * 1.4, 0.11]);
    t += d * q;
  });
  // basse en arpèges de la mineur / mi majeur
  const bass = [[45, 52, 57], [40, 52, 56], [45, 52, 57]];
  for (let b = 0; b < Math.floor(t / (6 * q)); b++) {
    bass[b % 3].forEach((n, i) => ev.push([n, b * 6 * q + i * 2 * q, 0.7, 0.07]));
  }
  return { ev, len: t + 3 };
}

// Beethoven — Ode à la joie
function ode() {
  const E = 76, F = 77, G = 79, D = 74, C = 72;
  const seq = [
    [E, 1], [E, 1], [F, 1], [G, 1], [G, 1], [F, 1], [E, 1], [D, 1],
    [C, 1], [C, 1], [D, 1], [E, 1], [E, 1.5], [D, 0.5], [D, 2],
    [E, 1], [E, 1], [F, 1], [G, 1], [G, 1], [F, 1], [E, 1], [D, 1],
    [C, 1], [C, 1], [D, 1], [E, 1], [D, 1.5], [C, 0.5], [C, 2],
    [D, 1], [D, 1], [E, 1], [C, 1], [D, 1], [E, 0.5], [F, 0.5], [E, 1], [C, 1],
    [D, 1], [E, 0.5], [F, 0.5], [E, 1], [D, 1], [C, 1], [D, 1], [67, 2],
    [E, 1], [E, 1], [F, 1], [G, 1], [G, 1], [F, 1], [E, 1], [D, 1],
    [C, 1], [C, 1], [D, 1], [E, 1], [D, 1.5], [C, 0.5], [C, 2],
  ];
  const beat = 0.5;
  const ev = [];
  let t = 0;
  seq.forEach(([n, d]) => {
    ev.push([n, t, d * beat * 1.3, 0.11]);
    t += d * beat;
  });
  const roots = [48, 48, 43, 48]; // do / do / sol / do, une mesure = 4 temps
  for (let b = 0; b < t / (4 * beat); b++) {
    ev.push([roots[b % 4], b * 4 * beat, 1.2, 0.09]);
    ev.push([roots[b % 4] + 7, b * 4 * beat + 2 * beat, 1.2, 0.07]);
  }
  return { ev, len: t + 3 };
}

// Bizet — Habanera de Carmen. Mélodie transcrite note par note [hauteur MIDI | null = silence, durée en temps].
const T = 1 / 3, S = 1 / 6;
export const HABANERA = [
  [null, 1], [74, 0.5], [73, 0.5], [72, T], [72, T], [72, T], [71, 0.5], [70, 0.5], [69, 0.5], [69, 0.25], [69, 0.25],
  [68, 0.5], [67, 0.5], [65, S], [67, S], [65, S], [64, 0.25], [65, 0.25], [67, 0.5], [65, 0.5], [64, 0.5], [null, 0.5],
  [74, 0.5], [73, 0.5], [72, T], [72, T], [72, T], [71, 0.5], [70, 0.5], [69, 0.25], [69, 0.25], [null, 0.25], [69, 0.25],
  [67, 0.5], [65, 0.5], [64, S], [65, S], [64, S], [62, 0.25], [64, 0.25], [65, 0.5], [64, 0.5], [62, 1],
];
export const HABANERA_BEATS = HABANERA.reduce((s, [, d]) => s + d, 0);

// Rythme de habanera à la basse : croche pointée, double, croche, croche
const HAB_RHYTHM = [[0, 0.75], [0.75, 0.25], [1, 0.5], [1.5, 0.5]];
const HAB_ROOTS = [50, 50, 50, 45]; // ré, ré, ré, la

function habaneraBass(beat, vol = 0.12) {
  const ev = [];
  const bars = Math.ceil(HABANERA_BEATS / 2);
  for (let b = 0; b < bars; b++) {
    HAB_RHYTHM.forEach(([s, d]) => ev.push([HAB_ROOTS[b % 4], (b * 2 + s) * beat, d * beat * 0.9, vol]));
  }
  return ev;
}

function habanera() {
  const beat = 0.7;
  const ev = [];
  for (let l = 0; l < 2; l++) {
    const base = l * (HABANERA_BEATS + 1);
    let t = 0;
    HABANERA.forEach(([n, d]) => {
      if (n !== null) ev.push([n, (base + t) * beat, Math.max(d, 0.4) * beat, 0.11]);
      t += d;
    });
    habaneraBass(beat).forEach(([n, s, d, v]) => ev.push([n, s + base * beat, d, v]));
  }
  return { ev, len: 2 * (HABANERA_BEATS + 1) * beat + 3 };
}

// Bizet, Prélude de Carmen : marche des Toréadors (notes de l'édition Mutopia, CC BY-SA 2.5)
function toreadors() {
  const beat = 60 / TOREADORS_BPM;
  const ev = TOREADORS.map(([n, s, d]) => [n, s * beat, Math.max(d * beat * 0.95, 0.12), n < 60 ? 0.08 : 0.07, 0.2]);
  return { ev, len: TOREADORS_BEATS * beat + 3 };
}

const PIECES = [
  { title: 'Bach, Prélude en do majeur', make: bach },
  { title: 'Beethoven, Pour Élise', make: elise },
  { title: 'Beethoven, Ode à la joie', make: ode },
  { title: 'Bizet, Habanera (Carmen)', make: habanera },
  { title: 'Bizet, Les Toréadors (Carmen)', make: toreadors },
  { title: 'Bizet, La Garde montante (Carmen)', make: gardeEvents },
];

// Permet à la page d'afficher le titre en cours de lecture
let trackListener = () => {};
export const onTrack = (fn) => (trackListener = fn);

function playNext(forced) {
  if (!enabled) return;
  let i = forced;
  if (i === undefined) {
    do i = Math.floor(Math.random() * PIECES.length);
    while (i === lastPiece);
  }
  lastPiece = i;
  const { ev, len } = PIECES[i].make();
  trackListener(PIECES[i].title);
  const t0 = ctx.currentTime + 0.3;
  ev.forEach(([n, s, d, v, ring]) => piano(n, t0 + s, d, v, bus, ring));
  timer = setTimeout(playNext, (len + 1.5) * 1000);
}

function startMusic(forced) {
  ensure();
  bus = ctx.createGain();
  bus.gain.value = 0.9;
  bus.connect(master);
  playNext(forced);
}

// Passe à la pièce suivante, dans l'ordre : pratique pour les écouter une par une
export function nextTrack() {
  if (!enabled) return;
  const next = (lastPiece + 1) % PIECES.length;
  stopMusic();
  startMusic(next);
}

function stopMusic() {
  clearTimeout(timer);
  trackListener('');
  if (bus) {
    bus.gain.setTargetAtTime(0, ctx.currentTime, 0.05);
    const old = bus;
    setTimeout(() => old.disconnect(), 400);
    bus = null;
  }
}

export function setSound(on) {
  enabled = on;
  if (on) startMusic();
  else stopMusic();
  return enabled;
}

export const isSoundOn = () => enabled;

/* ---------- Pour le jeu de la chorale ---------- */
// Le jeu joue toujours ses sons (le joueur l'a lancé), et suspend la playlist pendant la partie.
export const gameAudio = {
  begin() {
    ensure();
    if (enabled) stopMusic();
    const out = ctx.createGain();
    out.gain.value = 1;
    out.connect(master);
    this.out = out;
    return ctx.currentTime;
  },
  now: () => ctx.currentTime,
  backing(t0, beat) {
    habaneraBass(beat, 0.14).forEach(([n, s, d, v]) => piano(n, t0 + s, d, v, this.out));
  },
  // voix de "choriste" : deux triangles légèrement désaccordés + vibrato
  voice(n) {
    const t = ctx.currentTime;
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = 5.5;
    lfoGain.gain.value = 5;
    lfo.connect(lfoGain);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.16, t + 0.05);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.7);
    g.connect(this.out);
    [0, 4].forEach((cents) => {
      const o = ctx.createOscillator();
      o.type = 'sawtooth';
      o.frequency.value = midi(n) * Math.pow(2, cents / 1200);
      lfoGain.connect(o.detune);
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 1400;
      o.connect(lp).connect(g);
      o.start(t);
      o.stop(t + 0.8);
    });
    lfo.start(t);
    lfo.stop(t + 0.8);
  },
  note(n, t, dur, vol) {
    piano(n, t, dur, vol, this.out);
  },
  tick(t, strong) {
    tone(strong ? 1500 : 1100, t, 0.06, { type: 'square', vol: 0.06, dest: this.out });
  },
  // signaux sonores du jeu « Tout en même temps »
  ring(kind) {
    const t = ctx.currentTime;
    const o = this.out;
    const T = (f, s, d, opt = {}) => tone(f, t + s, d, { dest: o, ...opt });
    switch (kind) {
      case 'oven': // minuteur mécanique : tring tring tring
        for (let i = 0; i < 14; i++) T(i % 2 ? 2300 : 1900, i * 0.055, 0.05, { type: 'square', vol: 0.07 });
        break;
      case 'phone': // sonnerie en deux salves
        [0, 0.55].forEach((s) => { for (let i = 0; i < 9; i++) T(i % 2 ? 480 : 440, s + i * 0.04, 0.04, { type: 'square', vol: 0.06 }); });
        break;
      case 'ding': // « ding » du micro-ondes
        T(1568, 0, 1.1, { vol: 0.2 });
        T(3136, 0, 0.7, { vol: 0.05 });
        break;
      case 'clack': // tuile de Scrabble posée sur le plateau
        noise(t, 0.06, { vol: 0.4, type: 'bandpass', f0: 1800, f1: 900, dest: o });
        T(180, 0, 0.08, { vol: 0.25, to: 90 });
        break;
      case 'pop': // bulle de message
        T(700, 0, 0.09, { vol: 0.16, to: 1100 });
        break;
      case 'mail':
        T(784, 0, 0.25, { vol: 0.14 });
        T(1047, 0.14, 0.35, { vol: 0.14 });
        break;
      case 'ai': // réponse prête
        [659, 880, 1175].forEach((f, i) => T(f, i * 0.09, 0.3, { type: 'triangle', vol: 0.12 }));
        break;
      case 'clink': // vaisselle
        T(2800, 0, 0.12, { vol: 0.12 });
        T(3400, 0.05, 0.12, { vol: 0.1 });
        break;
      case 'tic': // tic-tac du minuteur
        T(1500, 0, 0.03, { type: 'square', vol: 0.07 });
        break;
      case 'tac':
        T(950, 0, 0.035, { type: 'square', vol: 0.07 });
        break;
      case 'good':
        T(880, 0, 0.12, { vol: 0.12 });
        T(1320, 0.08, 0.2, { vol: 0.12 });
        break;
      case 'bad':
        T(180, 0, 0.3, { type: 'sawtooth', vol: 0.14, to: 110 });
        break;
    }
  },
  // ronronnement du micro-ondes ; renvoie une fonction pour l'arrêter
  humStart() {
    const t = ctx.currentTime;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.1, t + 0.2);
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 700;
    lp.connect(g).connect(this.out);
    const o1 = ctx.createOscillator();
    o1.type = 'sawtooth';
    o1.frequency.value = 100;
    const o2 = ctx.createOscillator();
    o2.type = 'square';
    o2.frequency.value = 50;
    o1.connect(lp);
    o2.connect(lp);
    o1.start(t);
    o2.start(t);
    return () => {
      g.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.05);
      setTimeout(() => { o1.stop(); o2.stop(); g.disconnect(); }, 400);
    };
  },
  squeak() {
    const t = ctx.currentTime;
    tone(1400, t, 0.12, { type: 'square', vol: 0.06, to: 2200, dest: this.out });
  },
  // coupe le jeu (fin de partie ou fermeture) et relance la playlist si le son est activé
  end() {
    if (!this.out) return;
    const out = this.out;
    this.out = null;
    out.gain.setTargetAtTime(0, ctx.currentTime, 0.4);
    setTimeout(() => out.disconnect(), 3000);
    if (enabled) startMusic();
  },
};
