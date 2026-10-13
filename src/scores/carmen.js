// Mélodies de Carmen (Bizet, 1875, domaine public) transcrites à la main depuis des partitions :
//  - « Avec la garde montante » (chœur des gamins) : partition chant-piano d'Opéraoké (Opéra Comique, 2016)
// L'accompagnement est simplifié (basse + accords) ; seule la mélodie est fidèle à la partition.

const SEMI = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const midi = (name) => {
  const m = /^([A-G])(#|b)?(\d)$/.exec(name);
  return 12 * (Number(m[3]) + 1) + SEMI[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
};

// accords : basse (grave, quinte) + accord de la main droite
const CH = {
  Dm: { bass: [38, 45], rh: [62, 65, 69] },
  A: { bass: [45, 40], rh: [61, 64, 69] },
  F: { bass: [41, 48], rh: [60, 65, 69] },
  C: { bass: [36, 43], rh: [64, 67, 72] },
  G: { bass: [43, 38], rh: [59, 62, 67] },
  Em: { bass: [40, 47], rh: [64, 67, 71] },
  B: { bass: [47, 42], rh: [63, 66, 71] },
  D: { bass: [38, 45], rh: [62, 66, 69] },
};

/* ================= La Garde montante (2/4, noire = 112) ================= */
const GARDE_BPM = 112;

// [accord, [[note, durée en temps], ...]] ; une mesure = 2 temps. null = silence.
const e = 0.5, s = 0.25;
const Dm1 = ['D5', e], A4e = ['A4', e];
export const GARDE = [
  ['Dm', [[null, 2]]], // mesure 7
  ['Dm', [[null, 2]]], // 8
  ['Dm', [Dm1, A4e, A4e, ['D5', e]]], // 9  « Avec la garde montante »
  ['A', [['C#5', e], ['B4', e], ['A4', 0.75], [null, s]]], // 10 « Nous arrivons »
  ['Dm', [Dm1, A4e, A4e, ['D5', e]]], // 11
  ['A', [['C#5', e], ['B4', e], ['A4', e], ['A4', s], [null, s]]], // 12 « nous voilà »
  ['F', [['C5', 1], ['F5', e], ['C5', e]]], // 13 « Sonne trompette éclatante »
  ['A', [['D5', e], ['C5', s], ['D5', s], ['E5', 0.75], [null, s]]], // 14
  ['Dm', [A4e, ['A4', s], ['A4', s], ['D5', e], ['D5', e]]], // 15 « Ta ra ta ta ta »
  ['Dm', [A4e, A4e, ['D4', e], [null, e]]], // 16
  ['Dm', [Dm1, A4e, A4e, ['D5', e]]], // 17 « Nous marchons la tête haute »
  ['A', [['C#5', e], ['B4', e], ['A4', 0.75], [null, s]]], // 18
  ['Dm', [Dm1, A4e, A4e, ['D5', e]]], // 19 « Comme de petits soldats »
  ['A', [['C#5', e], ['B4', e], ['A4', e], ['A4', s], [null, s]]], // 20
  ['F', [['C5', 1], ['F5', e], ['C5', e]]], // 21 « Marquant sans faire de faute »
  ['A', [['D5', e], ['C5', s], ['D5', s], ['E5', 0.75], [null, s]]], // 22
  ['Dm', [[null, 1.5], ['D5', e]]], // 23 « Une, deux » (parlé, seule la note chantée est jouée)
  ['Dm', [A4e, A4e, ['D4', e], [null, e]]], // 24 « marquant le pas »
  ['A', [A4e, ['E4', e], ['E4', e], A4e]], // 25 « Nous marchons la tête haute »
  ['A', [['G#4', e], ['F#4', e], ['E4', 0.75], [null, s]]], // 26
  ['A', [A4e, ['E4', e], ['E4', e], A4e]], // 27 « Comme de petits soldats »
  ['A', [['G#4', e], ['F#4', e], ['E4', e], ['E4', s], [null, s]]], // 28
  ['C', [['C5', e], ['G4', e], ['G4', e], ['C5', e]]], // 29 « Marquant sans faire de faute »
  ['G', [['B4', e], ['A4', e], ['G4', 0.75], [null, s]]], // 30
  ['G', [[null, 1.5], ['C5', e]]], // 31 « Une, deux » (parlé)
  ['G', [['B4', e], ['A4', e], ['G4', e], [null, e]]], // 32 « marquant le pas »
  ['Em', [['E5', e], ['B4', e], ['B4', e], ['E5', e]]], // 33 « Les épaules en arrière »
  ['Em', [['D5', e], ['C5', e], ['B4', e], ['E5', e]]], // 34 « et la poitrine en dehors »
  ['A', [['D5', e], ['C#5', e], ['B4', e], ['E5', e]]], // 35
  ['B', [['D#5', e], ['C#5', e], ['B4', e], ['C#5', s], [null, s]]], // 36
  // à partir d'ici : ré majeur (fa dièse, do dièse)
  ['D', [['D5', e], ['A4', e], ['A4', e], ['D5', e]]], // 37 « Les bras de cette manière »
  ['A', [['C#5', e], ['B4', e], ['A4', 0.75], [null, s]]], // 38
  ['D', [['D5', e], ['A4', e], ['A4', e], ['D5', e]]], // 39 « Tombant tout le long du corps »
  ['A', [['C#5', e], ['B4', e], ['A4', e], [null, e]]], // 40
  ['D', [['D5', e], ['D5', s], ['D5', s], ['F#5', 0.75], [null, s]]], // 41 « Nous arrivons »
  ['D', [['D5', e], ['D5', e], ['F#5', 0.75], [null, s]]], // 42 « Nous voilà »
  ['D', [['D5', e], ['A4', s], ['A4', s], ['D5', e], ['A4', s], ['A4', s]]], // 43 « Ta ra ta ta ra ta »
  ['A', [['D5', e], ['A4', s], ['A4', s], ['D5', e], ['E5', e]]], // 44
  ['D', [['F#5', 2]]], // 45
  ['D', [['F#5', e], [null, e], ['A5', 1 / 3], ['A5', 1 / 3], ['A5', 1 / 3]]], // 46 triolet final
  ['D', [['D5', e], [null, e]]], // 47
];

export function gardeEvents() {
  const beat = 60 / GARDE_BPM;
  const ev = [];
  GARDE.forEach(([chord, notes], bar) => {
    const t0 = bar * 2 * beat;
    const c = CH[chord];
    const last = bar === GARDE.length - 1;
    if (last) {
      ev.push([c.bass[0], t0, 3, 0.1, 0.5], ...c.rh.map((n) => [n, t0, 3, 0.07, 0.5]));
    } else {
      // accompagnement de marche : basse sur le temps, accords sur les contretemps
      ev.push([c.bass[0], t0, beat * 0.4, 0.09, 0.2], [c.bass[1], t0 + beat * 1.5, beat * 0.4, 0.08, 0.2]);
      [0.5, 1.0].forEach((b) => c.rh.forEach((n) => ev.push([n, t0 + b * beat, beat * 0.3, 0.045, 0.15])));
    }
    let t = 0;
    notes.forEach(([n, d]) => {
      if (n) ev.push([midi(n), t0 + t * beat, Math.max(d * beat * 0.92, 0.1), 0.12, 0.3]);
      t += d;
    });
  });
  return { ev, len: GARDE.length * 2 * beat + 3 };
}
