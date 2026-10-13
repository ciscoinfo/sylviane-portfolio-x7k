# Site de Sylviane — notes pour Claude

Faux portfolio ultra sérieux, en réalité un hommage drôle et tendre à la mère de l'utilisateur (Cisco). Ton : tendre et absurde, jamais méchant. Pas d'infos perso réelles (adresse, nom du bailleur…). Langue du site et des échanges : français. Notes privées (non versionnées, dans `local_dev/`) : `IDEES.md` (contexte détaillé, décisions, avancement) et `DEPLOIEMENT.md` (mise en ligne). Le dépôt GitHub est public : n'y mettre aucun document personnel.

## Stack
Vite (JS vanilla, modules ES) + GSAP (animations) + canvas-confetti. Pas de framework. Hébergement GitHub Pages (`base: './'` dans `vite.config.js`), site en `noindex`.

Commandes : `npm install`, `npm run dev` (port 5173, config `.claude/launch.json`, nom « site »), `npm run build` (sortie dans `dist/`). Ajouter `?skip` à l'URL saute l'entrée Scrabble.

## Structure
- `index.html` : tout le contenu du portfolio (hero, compétences, expériences, projets, avis, contact, salle de jeux) et la fenêtre modale des jeux.
- `src/main.js` : animations du site, verrouillage des sections, `GAME_LIST` (liste des jeux), ouverture/fermeture de la modale, formulaire.
- `src/style.css` : tout le style (variables `--tomato`, `--ink`, `--paper`…, polices Fraunces/Inter/Caveat). Les styles de chaque jeu sont à la suite, préfixés par jeu (`.yg`, `.bp`…).
- `src/audio.js` : sons synthétisés (`sfx`), musique de fond et boutons son/piste suivante. `src/scores/` : partitions (Carmen, Toréador).
- `src/games/*.js` : un fichier par jeu, voir ci-dessous.
- `public/` : `mots.txt` (dictionnaire Scrabble, généré), photos retouchées. `local_dev/` (ignoré par git) : photos originales et partitions. `scripts/` : outils de génération (dico, photos, MIDI, partitions).

## Jeux
Chaque jeu exporte `startXxx(container, onWin)` et s'enregistre dans `GAME_LIST` de `main.js`.
- Avec `section` : débloque la section verrouillée (`class="lockable"` + `data-game` dans `index.html`) : `courses` → Compétences, `hlm` → Expériences, `chorale` → Avis, `yiddish` → Contact. Rejouables dans la salle de jeux.
- Avec `bonus: true` : libres, indépendants du site : `chicken`, `walk`, `multi`, `coffee`, `series`, `balcon`.
- `scrabble.js` : porte d'entrée du site.
- `sylviane.js` : dessine le personnage (vraie tête `face.jpg` sur corps dessiné) pour les jeux canvas.
- `balcon.js` : memory de plantes de balcon avec aperçu de 10 s ; chaque partie tire le piment + 7 plantes au hasard parmi 12 (`PLANTS`, avec le texte de Sylviane de chaque plante) ; à chaque paire le piment (SVG) grandit, finale où Sylviane le croque. Hommage au balcon et aux piments de sa mère.

## Conventions
- Les jeux ne doivent pas laisser d'écouteurs ni de timers actifs après fermeture de la modale (tester `document.getElementById('modal').hidden` ou `root.isConnected`).
- Illustrations des plantes du jeu balcon : `src/games/balcon-art.js` (SVG contourés). Le lien « Passer ce jeu » est affiché pour tous les jeux.
- Ne pas commiter `local_dev/`, `dist/`, `node_modules/`.

## Vérification
Le navigateur intégré à l'app Claude ne déclenche pas `requestAnimationFrame` : les animations GSAP/CSS n'y avancent pas. Pour contrôler un rendu, injecter `*{transition:none!important;animation:none!important}`. Les animations se jugent dans un vrai navigateur.
