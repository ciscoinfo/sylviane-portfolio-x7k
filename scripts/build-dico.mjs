import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
const require = createRequire(import.meta.url);
const base = require('an-array-of-french-words');
// Mots typiques du Scrabble, absents d'un dictionnaire courant
const extras = ['wu','xu','ka','qi','ki','zek','wok','kyat','yuan','jazz','yin','yang','ouf','zen','kif','kiwi','fez','zut','jeu','ski','yak','yeti','ahi','aa','ca','da','ex','fi','gu','ha','hi','ho','hm','ie','ja','ne','nu','ou','ox','pi','ra','re','te','uu','ui','xi','za','zi','wus','xus','kas','qis','zeks','woks'];
const set = new Set();
for (const w of [...base, ...extras]) {
  const n = w.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase();
  if (/^[A-Z]{2,7}$/.test(n)) set.add(n);
}
const list = [...set].sort();
writeFileSync('public/mots.txt', list.join('\n'));
console.log(list.length, 'mots');
