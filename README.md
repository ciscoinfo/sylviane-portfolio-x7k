# Le site de Sylviane

Faux portfolio ultra sérieux, vrai hommage à Maman : une page de CV parodique dont les sections se débloquent en jouant (Scrabble à l'entrée, courses au Lidl, chasse aux cafards, chorale, examen de yiddish) et une salle de jeux bonus (poulet, tour du monde, café, séries, balcon et piments…).

## Tester en local

Il faut [Node.js](https://nodejs.org) (version LTS) installé.

```powershell
cd site-maman
npm install
npm run dev
```

Ouvre ensuite **http://localhost:5173/** dans le navigateur. Pour sauter l'épreuve du Scrabble d'entrée : **http://localhost:5173/?skip**

`npm install` n'est nécessaire qu'une fois (ou si `package.json` change). Pour arrêter le serveur : `Ctrl + C` dans le terminal. Les modifications du code s'affichent tout de suite, sans relancer.

Pour tester la version finale telle qu'elle sera en ligne :

```powershell
npm run build
npm run preview
```

Dans la fenêtre d'un jeu, le lien discret « Passer ce jeu → » débloque la section sans jouer.

## Mettre en ligne

Le site est publié sur GitHub Pages par le workflow `.github/workflows/deploy.yml` : chaque `git push` sur `main` reconstruit et publie le site.

## Organisation

| Dossier / fichier | Contenu |
|---|---|
| `index.html` | Tout le texte du portfolio |
| `src/main.js` | Animations, sections verrouillées, liste des jeux |
| `src/games/` | Un fichier par jeu |
| `src/style.css` | Le style |
| `src/audio.js`, `src/scores/` | Sons et musique synthétisés |
| `public/` | Photos et dictionnaire de Scrabble |
| `scripts/` | Outils de génération (dictionnaire, photos…) |

Les photos originales et les partitions sont dans `local_dev/` (non publié).
