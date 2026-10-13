// Tous les textes du jeu « Tout en même temps ».
// POUR AJOUTER UN MESSAGE : ajoutez simplement une ligne dans la liste voulue (n'oubliez pas la virgule).
// Pendant une partie, chaque liste est mélangée puis épuisée avant de recommencer :
// un même message ne revient donc jamais tant que les autres n'ont pas été vus.

/* ---------- Au téléphone (WhatsApp) : [ce que dit son enfant, ce que répond Sylviane] ---------- */
export const CALL = [
  ['Maman, t’es toujours là ?', 'Oui oui, je suis là ! Je fais dix choses à la fois.'],
  ['Qu’est-ce que tu es en train de faire ?', 'Le poulet, le café, le Scrabble et la vaisselle.'],
  ['Comment tu vas ?', 'Très bien. Et toi, tu manges ?'],
  ['Il fait quel temps chez toi ?', 'Gris. Comme d’habitude.'],
  ['Tu n’as pas froid ?', 'Non non, j’ai mon gilet.'],
  ['Qu’est-ce que tu vas manger ?', 'Du poulet. Je l’ai attrapé moi-même.'],
  ['Tu fais la sieste ?', 'Pas encore ! Il est beaucoup trop tôt.'],
  ['C’est plus l’heure de faire la sieste.', 'Si, si, justement ! Laisse-moi finir le poulet.'],
  ['Tu chantes quoi, à la chorale ?', 'Carmen, La Traviata… et je tiens la note, moi.'],
  ['C’est à quelle heure, ton cours de yiddish ?', 'Attends, je regarde… Je te dis ça plus tard.'],
  // --- ajoutés pour varier : à remplacer par de vraies phrases ---
  ['Tu as bien dormi ?', 'Oui, comme une souche. Enfin, jusqu’à la voisine.'],
  ['Tu fais quoi ce week-end ?', 'Du Scrabble, de la chorale, et on verra pour le reste.'],
  ['Tu as mangé quelque chose ?', 'Un carré de chocolat. Deux. Peut-être trois.'],
  ['Tu as vu des gens aujourd’hui ?', 'Le caissier du Lidl. Il m’a donné raison.'],
  ['Tu as des nouvelles du bailleur ?', 'Toujours pas. J’ai écrit une quarante-huitième lettre.'],
  ['Tu es sûre que tu n’as pas oublié quelque chose ?', 'Le poulet ! Non, non, il est là.'],
  ['Tu as pris des nouvelles de la famille ?', 'Oui, je viens de t’appeler. Enfin, tu m’appelles.'],
  ['Tu as regardé ta série hier ?', 'Évidemment. Je me suis endormie à la vingtième minute.'],
  ['Tu as pensé à mettre un manteau ?', 'Je suis à la maison ! Mais j’ai mon gilet.'],
  ['Il y a du monde à la chorale en ce moment ?', 'Assez pour couvrir les sopranos. Moi, je tiens bon.'],
  ['Tu as fini ta vaisselle ?', 'J’y vais. Tu m’as appelée pendant. Comme d’habitude.'],
  ['Allô ? Tu m’entends ?', 'Oui, oui ! C’est toi qui coupes.'],
];

/* ---------- Scrabble : mots tordus (les points sont calculés automatiquement) ---------- */
// À vérifier au besoin dans l'ODS : ce sont des mots rares du Scrabble français.
export const SCRABBLE_WORDS = [
  'QI', 'KA', 'KI', 'XU', 'ZEN', 'YAK', 'YIN', 'YEN', 'WOK', 'ZEK', 'ZUT', 'ZOO', 'KHI',
  'KYAT', 'YUAN', 'JAZZ', 'KIWI', 'ZEBU', 'YETI', 'KUDU', 'GNOU', 'ZOUK', 'ZOZO',
  'OKAPI', 'FJORD', 'WHIST', 'QUARK', 'KRILL', 'XYSTE', 'KYSTE', 'QUIZ', 'ZAZOU', 'DJINN', 'BANJO', 'YACK',
  'WIGWAM', 'WAPITI', 'ZYGOTE', 'ZYGOMA', 'JUJUBE', 'YOUYOU', 'ZINZIN', 'XYLENE', 'YPREAU',
  'KUMQUAT', 'TZIGANE', 'ZIZANIE', 'WHISKY', 'SCHNAPS', 'KEFFIEH', 'KHEDIVE',
  'EXEQUATUR',
];
const VALUES = { A: 1, E: 1, I: 1, L: 1, N: 1, O: 1, R: 1, S: 1, T: 1, U: 1, D: 2, G: 2, M: 2, B: 3, C: 3, P: 3, F: 4, H: 4, V: 4, J: 8, Q: 8, K: 10, W: 10, X: 10, Y: 10, Z: 10 };
export const scrabblePoints = (w) => [...w].reduce((s, l) => s + (VALUES[l] || 0), 0);

// réactions de l'entourage quand Sylviane pose un de ces mots
export const SCRABBLE_REACTIONS = [
  'L’adversaire demande la définition. Elle n’en a pas.',
  'Elle ne sait pas ce que ça veut dire, mais c’est valide.',
  'L’adversaire pâlit.',
  'Elle l’a lu quelque part. Elle ne sait plus où.',
  'L’adversaire sort le dictionnaire. Il perd.',
  'Elle sourit : « C’est un mot, je vous assure. »',
  'Le mot existe. Personne ne sait pourquoi.',
  'Elle l’a posé sur une case compte triple, évidemment.',
  'L’adversaire conteste. Le dictionnaire donne raison à Sylviane.',
  'Elle ne le prononce pas, mais elle le joue.',
];
export const SCRABBLE_MISS = [
  'Elle a raté son tour. L’adversaire est ravi.',
  'Son tour est passé. L’adversaire prend la case compte triple.',
  'Le chrono du Scrabble a sonné sans elle.',
];

/* ---------- Le four ---------- */
export const OVEN_GOOD = [
  'Poulet retourné. Il dore à merveille.',
  'Un côté doré, l’autre aussi bientôt.',
  'Le poulet est retourné. Il lui dit merci.',
  'Elle arrose le poulet. Le jus, c’est sacré.',
  'Poulet retourné, pommes de terre arrosées. Elle gère.',
];
export const OVEN_BAD = [
  'Le poulet a un peu brûlé de ce côté.',
  'Le minuteur sonnait. Le poulet aussi, à sa façon.',
  'Odeur de brûlé. Elle ouvre la fenêtre.',
];

/* ---------- Le micro-ondes ---------- */
export const MICRO_GOOD = [
  'Ding ! Elle sort l’assiette : chaud, mais pas trop.',
  'Le café est chaud. Elle est fière.',
  'Elle sort le plat avec un torchon. Elle a l’habitude.',
  'Dégivrage terminé. Le poulet de demain est sauvé.',
  'Assiette sortie à temps. Rien n’a explosé.',
];
export const MICRO_BAD = [
  'Le café a refroidi. Elle le remet une minute.',
  'Le micro-ondes a sonné dans le vide. Elle remet une minute.',
  'Ça a refroidi. Elle fait semblant que c’était prévu.',
];

/* ---------- Le téléphone ---------- */
export const PHONE_GOOD = [
  'Elle répond sans quitter le poulet des yeux.',
  'Elle répond en remuant la sauce.',
  'Elle répond tout en vérifiant le minuteur.',
  'Elle répond. Le Scrabble attendra.',
  'Elle répond avec le téléphone coincé sous l’épaule.',
];
export const PHONE_MISS_LINE = [
  'Silence au bout du fil… « Maman, t’es toujours là ? »',
  '« Allô ? Allô ? Maman ? » Elle cherchait ses lunettes.',
  'Elle ne répond pas. Son enfant rappelle dans sa tête.',
  'Un blanc. « Maman ? Tu es en train de faire autre chose ? »',
];
export const PHONE_MISS_RING = [
  'Appel manqué. « Maman ? Allô ? Maman ? »',
  'Le téléphone a arrêté de sonner. Elle l’a vu juste après.',
  'Appel manqué. Elle rappelle dès que le poulet est sorti.',
];
export const PHONE_BYE = [
  'Bisous, je te rappelle ! 💋',
  'Allez, je te laisse. Bisous ! 💋',
  'Je t’embrasse, à bientôt ! 💋',
];

/* ---------- L'assistant IA ---------- */
export const AI_READY = [
  'Votre réclamation est prête !',
  'J’ai trois conseils pour votre bailleur.',
  'Voici une version plus ferme de votre lettre.',
  'J’ai trouvé une recette de poulet rôti.',
  'Votre mise en demeure est rédigée.',
  'Voulez-vous que je rédige une relance ?',
];
export const AI_GOOD = [
  'Réclamation générée. Elle l’envoie en recommandé.',
  'L’IA lui conseille de rester ferme. Elle l’était déjà.',
  'Elle demande trois versions. Elle prend la quatrième.',
  'L’IA propose une recette. Sylviane la corrige.',
  'Elle remercie l’IA. Elle lui dit « bonne journée » aussi.',
  'L’IA s’excuse. Sylviane exige un remboursement quand même.',
];
export const AI_BAD = [
  'L’IA attend. Elle aussi s’impatiente.',
  'La réponse de l’IA reste affichée. Personne ne la lit.',
  'L’IA redemande : « Puis-je vous aider ? »',
];

/* ---------- La tablette : [objet du mail, ce qu'elle en fait] ---------- */
export const MAILS = [
  ['Bailleur : « Absent »', 'Réponse automatique du bailleur : absent jusqu’en 2031.'],
  ['Lidl du coin : promos', 'Newsletter du Lidl du coin : concombres à 0,99 €. Elle approuve.'],
  ['Un inconnu : « Héritage »', 'Un spam. Elle le signale avec fermeté.'],
  ['Syndic : « Rappel »', 'Le syndic rappelle qu’il faut payer. Elle rappelle qu’il faut réparer.'],
  ['Chorale : « Répétition »', 'Répétition de chorale confirmée. Elle chauffe déjà ses soprani.'],
  ['Une enseigne : « -50 % »', 'Soldes. Elle compare les prix en trois onglets.'],
  ['Cours de yiddish', 'Devoir de yiddish reçu. Elle l’ouvrira ce soir. Ou demain.'],
  ['Un livreur : « Colis »', 'Le colis est chez la voisine. Évidemment.'],
];

/* ---------- La vaisselle ---------- */
export const DISH_GOOD = [
  'Vaisselle faite : l’évier respire.',
  'Les assiettes brillent. Elle en est fière.',
  'La pile est lavée. Elle vient de recommencer.',
  'Évier vide. Dix minutes de répit.',
];
export const DISH_BAD = [
  'La pile s’écroule ! Fracas de vaisselle.',
  'Une assiette glisse. Puis les autres.',
  'Trop de vaisselle. L’évier a gagné.',
];

/* ---------- La plante ---------- */
export const PLANT = [
  'Une plante. Elle sera arrosée plus tard.',
  'La plante attend. Elle a l’habitude.',
  'Elle regarde la plante. La plante la regarde.',
];
