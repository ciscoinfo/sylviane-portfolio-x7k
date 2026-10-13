// Convertit le MIDI Mutopia du Prélude de Carmen en notes JS (usage : node scripts/build-toreadors.mjs prelude.mid)
import fs from 'node:fs';
import { parseMidi } from './midi.mjs';

const m = parseMidi(process.argv[2]);
const END = 100; // temps : la marche des Toréadors, le thème du Toréador, puis le retour de la marche
const q = (x) => Math.round(x * 96) / 96;
const notes = m.tracks
  .flatMap((t) => t.notes)
  .filter((n) => n.start < END)
  .sort((a, b) => a.start - b.start || a.n - b.n)
  .map((n) => [n.n, +q(n.start).toFixed(3), +Math.min(q(n.dur), END - n.start).toFixed(3)]);

const out = `// Georges Bizet, Carmen, Prélude (« Les Toréadors »), 1875. Composition du domaine public.
// Notes extraites de l'édition pour piano de Mutopia Project (Schirmer 1895, mise en page par Alex O'S),
// licence Creative Commons Attribution-ShareAlike 2.5 : https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=635
// Format : [hauteur MIDI, début en temps, durée en temps]. Tempo d'origine : environ 116 à la noire.
export const TOREADORS_BPM = 116;
export const TOREADORS_BEATS = ${END};
export const TOREADORS = ${JSON.stringify(notes)};
`;
fs.writeFileSync('src/scores/toreadors.js', out);
console.log(notes.length, 'notes,', (out.length / 1024).toFixed(1), 'Ko');
