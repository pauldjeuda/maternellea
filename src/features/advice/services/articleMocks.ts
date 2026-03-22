/**
 * features/advice/services/articleMocks.ts
 *
 * 18 articles réalistes avec contenu structuré complet.
 * Chaque article utilise un format markdown-like avec sections,
 * listes et paragraphes. Les dates sont relatives à aujourd'hui.
 */

import { subDays, format } from 'date-fns';
import type { Article, ArticleCategory } from '@types/models';

const today = new Date();
const ago = (n: number) => format(subDays(today, n), 'yyyy-MM-dd');

const a = (
  id: string, category: ArticleCategory, readMin: number,
  title: string, summary: string, content: string,
  tags: string[], featured = false, isFavorite = false,
  publishedAgo = 0,
): Article & { featured?: boolean } => ({
  id, title, summary, content, category,
  readTimeMinutes: readMin,
  author:          'Équipe Maternellea',
  isFavorite,
  isBookmarked:    isFavorite,
  publishedAt:     ago(publishedAgo),
  tags,
  relatedArticleIds: [],
  featured,
});

// ─────────────────────────────────────────────────────────────
//  CYCLE
// ─────────────────────────────────────────────────────────────

const ART_CYCLE_1 = a(
  'art-c01', 'cycle', 5,
  'Les 4 phases de votre cycle menstruel',
  'Comprendre les phases folliculaire, ovulatoire, lutéale et menstruelle transforme votre rapport à votre corps.',
  `## Comprendre votre cycle

Votre cycle menstruel est bien plus qu'une simple période de règles. Il se divise en 4 phases distinctes, chacune avec ses propres caractéristiques hormonales, physiques et émotionnelles.

## Phase menstruelle (jours 1–5)

C'est le début officiel de votre cycle. Les hormones œstrogène et progestérone chutent, déclenchant les menstruations. Vous pouvez ressentir :

- Des crampes abdominales
- De la fatigue
- Des sautes d'humeur

**Conseil :** C'est le moment de ralentir, d'écouter votre corps et de vous reposer davantage.

## Phase folliculaire (jours 1–13)

Simultanément aux règles, l'hypophyse libère la FSH (hormone folliculo-stimulante). Les follicules ovariens commencent à se développer. L'œstrogène monte progressivement, entraînant :

- Un regain d'énergie
- Une meilleure humeur
- Une peau plus lumineuse

C'est souvent la phase où vous vous sentez le plus en forme.

## Phase ovulatoire (autour du jour 14)

Un pic de LH (hormone lutéinisante) déclenche l'ovulation : un ovule est libéré. Cette phase dure environ 24 heures, mais la fenêtre fertile est plus large (5–7 jours) car les spermatozoïdes peuvent survivre plusieurs jours.

**Signes d'ovulation :**
- Pertes blanchâtres filantes (comme du blanc d'œuf)
- Légère hausse de température basale (+0,2–0,5°C)
- Douleur légère d'un côté du bassin (mittelschmerz)

## Phase lutéale (jours 15–28)

Après l'ovulation, le follicule vide (corps jaune) produit de la progestérone. Cette hormone prépare l'utérus à une éventuelle implantation. Si aucune fécondation n'a lieu, les niveaux hormonaux chutent et les règles débutent.

Le syndrome prémenstruel (SPM) apparaît souvent en fin de cette phase :
- Ballonnements
- Sensibilité des seins
- Fatigue, irritabilité

## Conclusion

En apprenant à reconnaître les signaux de chaque phase, vous pouvez adapter votre alimentation, vos exercices et vos activités pour vous sentir mieux tout au long du mois.`,
  ['cycle', 'hormones', 'ovulation', 'phases'], true, false, 12,
);

const ART_CYCLE_2 = a(
  'art-c02', 'cycle', 4,
  'Identifier votre fenêtre fertile avec précision',
  'La fenêtre fertile dure environ 6 jours. Voici les méthodes les plus fiables pour la repérer.',
  `## La fenêtre fertile : ce que vous devez savoir

La conception n'est possible que pendant une courte fenêtre chaque cycle. Comprendre quand vous êtes fertile vous aide à planifier — ou à éviter — une grossesse.

## Durée de la fenêtre fertile

Un ovule survit **12 à 24 heures** après l'ovulation. Les spermatozoïdes, eux, peuvent survivre jusqu'à **5 jours** dans les voies génitales féminines. La fenêtre fertile s'étend donc de 5 jours avant l'ovulation à 1 jour après, soit environ 6 jours au total.

## Méthode 1 : Observation des pertes cervicales

Vos pertes changent de texture au fil du cycle :

- **Post-règles :** sèches, peu de pertes
- **Avant l'ovulation :** pertes crémeuses, blanches
- **Pendant la fertilité :** pertes transparentes, filantes, semblables au blanc d'œuf cru — c'est le signe le plus fiable
- **Après l'ovulation :** retour aux pertes épaisses ou sèches

## Méthode 2 : Température basale

La progestérone post-ovulatoire élève légèrement la température du corps (0,2 à 0,5°C). Prenez votre température chaque matin, avant de vous lever, avec un thermomètre à deux décimales. Une hausse soutenue sur 3 jours confirme l'ovulation passée.

## Méthode 3 : Calcul par la règle des 14 jours

L'ovulation survient généralement 14 jours **avant** la fin du cycle (pas 14 jours après le début). Si votre cycle est de 28 jours → ovulation vers le jour 14. Cycle de 30 jours → ovulation vers le jour 16.

Cette méthode est moins précise si vos cycles sont irréguliers.

## Méthode 4 : Tests d'ovulation (LH)

Ces bandelettes urinaires détectent le pic de LH qui précède l'ovulation de 24 à 48 heures. Efficaces et abordables, ils sont particulièrement utiles si vos cycles varient.

## En résumé

Combiner observation des pertes + température + (éventuellement) tests d'ovulation vous donne une image très précise de votre fertilité. L'application Maternellea suit ces données pour vous.`,
  ['fertilité', 'ovulation', 'cycle', 'conception'], false, false, 8,
);

const ART_CYCLE_3 = a(
  'art-c03', 'cycle', 3,
  'Gérer les crampes menstruelles naturellement',
  'Chaleur, mouvement, alimentation : les approches naturelles qui réduisent vraiment les douleurs de règles.',
  `## Dysménorrhée : pourquoi ça fait mal ?

Les crampes menstruelles (dysménorrhée) sont causées par les prostaglandines, des substances qui déclenchent les contractions utérines pour expulser la muqueuse. Plus leur taux est élevé, plus les douleurs sont intenses.

## Approches naturelles efficaces

**La chaleur**
Une bouillotte ou un patch chauffant sur le bas-ventre détend les muscles utérins et réduit les spasmes. Des études montrent que la chaleur peut être aussi efficace que l'ibuprofène pour les douleurs légères à modérées.

**L'activité physique légère**
Contre-intuitif mais réel : une marche douce ou du yoga libère des endorphines qui atténuent la douleur. Les étirements du bassin sont particulièrement utiles.

**L'alimentation anti-inflammatoire**
- Réduisez : sel (réduit les ballonnements), sucre raffiné, alcool, caféine
- Augmentez : oméga-3 (poissons gras, noix), magnésium (amandes, épinards), gingembre

**Le magnésium**
Une supplémentation en magnésium (300–400 mg/j) dans les jours précédant les règles peut réduire leur intensité. Consultez votre médecin avant toute supplémentation.

**La tisane au gingembre**
Anti-inflammatoire naturel, le gingembre frais infusé dans de l'eau chaude peut réduire l'intensité des crampes et des nausées associées.

## Quand consulter ?

Si les douleurs sont très intenses, perturbent votre quotidien ou s'aggravent d'un cycle à l'autre, consultez un médecin. L'endométriose ou les fibromes peuvent être en cause et nécessitent un diagnostic.`,
  ['crampes', 'règles', 'douleur', 'naturel'], false, false, 5,
);

// ─────────────────────────────────────────────────────────────
//  GROSSESSE
// ─────────────────────────────────────────────────────────────

const ART_PREG_1 = a(
  'art-p01', 'pregnancy', 7,
  'Le premier trimestre : ce qui se passe vraiment',
  'Nausées, fatigue intense, transformations invisibles : le 1er trimestre est le plus mystérieux de la grossesse.',
  `## Le premier trimestre : 12 semaines de bouleversements

Le premier trimestre est souvent le plus difficile à vivre, car les transformations sont intenses mais la grossesse n'est pas encore visible. Voici ce qui se passe vraiment.

## Semaines 4–6 : l'implantation et les premières semaines

Après la fécondation, l'embryon s'implante dans la muqueuse utérine. Le placenta commence à se former et produit la HCG (hormone chorionique gonadotrope) — l'hormone détectée par les tests de grossesse. C'est elle qui est responsable des nausées.

## Les nausées : pourquoi et comment les gérer

Environ 70 à 80% des femmes enceintes connaissent des nausées au 1er trimestre. Elles sont causées par la montée rapide de la HCG et de l'œstrogène.

**Stratégies efficaces :**
- Fractionner les repas (6 petits repas plutôt que 3 grands)
- Manger une biscotte avant de se lever le matin
- Éviter les aliments gras, épicés ou odorants
- Le gingembre (tisane, gélules) a prouvé son efficacité
- Rester hydratée

Si les nausées sont sévères (hyperémèse gravidique), consultez votre médecin.

## La fatigue : normale et intense

La progestérone provoque une fatigue profonde en début de grossesse. Votre corps travaille énormément pour construire le placenta. Accordez-vous des siestes, adaptez votre rythme.

## Ce qui se forme semaine par semaine

- **SA 6 :** cœur qui bat (110 bpm)
- **SA 8 :** tous les organes principaux sont en place
- **SA 10 :** c'est maintenant un fœtus (plus un embryon)
- **SA 12 :** le risque de fausse couche chute significativement

## Les émotions

Joie, inquiétude, ambivalence : tout est normal. L'annonce reste souvent privée jusqu'à 12 SA, ce qui peut isoler. N'hésitez pas à en parler à votre médecin si vous vous sentez dépassée.`,
  ['grossesse', 'T1', 'nausées', 'fatigue'], true, false, 15,
);

const ART_PREG_2 = a(
  'art-p02', 'pregnancy', 6,
  'Bien préparer l\'accouchement : le projet de naissance',
  'Un projet de naissance clair vous aide à communiquer vos souhaits à l\'équipe médicale. Guide pratique.',
  `## Qu'est-ce qu'un projet de naissance ?

Le projet de naissance est un document écrit qui exprime vos préférences pour le travail et l'accouchement. Ce n'est pas un contrat — les circonstances médicales peuvent nécessiter des adaptations — mais c'est un outil précieux pour dialoguer avec l'équipe soignante.

## Ce que vous pouvez y inclure

### L'environnement
- Lumière tamisée, musique
- Personnes que vous souhaitez présentes
- Liberté de mouvement pendant le travail

### La gestion de la douleur
- Souhaitez-vous une péridurale d'emblée, ou préférez-vous tenter d'autres méthodes d'abord ?
- Alternatives : bain chaud, ballon de naissance, TENS, sophrologie
- Ou au contraire : péridurale dès l'entrée en salle de naissance

### La naissance elle-même
- Position souhaitée : allongée, semi-assise, accroupie, à quatre pattes
- Expulsion physiologique ou aide à l'expulsion
- Épisiotomie : préférence pour éviter si possible, ou pas d'avis
- Qui coupe le cordon ?

### Après la naissance
- Peau à peau immédiat
- Allaitement à la demande dès la naissance
- Retarder les soins du bébé pour le peau à peau

### En cas de césarienne
Si une césarienne programmée ou d'urgence est nécessaire, vous pouvez préciser :
- Présence de votre partenaire
- Peau à peau en salle d'opération si possible

## Conseils pour rédiger votre projet

1. Commencez par y réfléchir entre 24 et 32 SA
2. Discutez-en avec votre médecin ou sage-femme
3. Restez flexible — l'objectif reste la sécurité de vous et de bébé
4. Gardez-le court (1–2 pages maximum) et factuel`,
  ['accouchement', 'projet de naissance', 'préparation', 'grossesse'], false, true, 20,
);

// ─────────────────────────────────────────────────────────────
//  POST-PARTUM
// ─────────────────────────────────────────────────────────────

const ART_PP_1 = a(
  'art-pp01', 'postpartum', 6,
  'Baby blues vs dépression post-partum : comprendre la différence',
  'Baby blues et dépression post-partum sont deux réalités très différentes. Savoir les distinguer peut changer une vie.',
  `## Baby blues : normal et transitoire

Le baby blues touche **50 à 80%** des nouvelles mamans. Il apparaît généralement entre le 3ème et le 5ème jour après l'accouchement, coïncidant avec la chute brutale des hormones de grossesse.

**Symptômes caractéristiques :**
- Pleurs sans raison apparente
- Irritabilité, sensibilité émotionnelle
- Fatigue intense
- Sentiment de doute sur ses capacités

Le baby blues se résorbe spontanément **en 2 à 3 semaines** maximum. Il ne nécessite pas de traitement, mais du soutien, du repos et une écoute bienveillante.

## Dépression post-partum : sérieuse et traitable

La dépression post-partum (DPP) est différente. Elle touche environ **10 à 15%** des mères et peut apparaître à tout moment dans l'année suivant l'accouchement, pas seulement dans les premiers jours.

**Signaux d'alerte :**
- Tristesse persistante (plus de 2 semaines)
- Incapacité à éprouver du plaisir ou de l'affection pour le bébé
- Pensées intrusives ou sentiments d'inadéquation intense
- Troubles du sommeil non liés aux réveils du bébé
- Anxiété excessive ou crises de panique
- Pensées sombres

**Important :** La DPP n'est pas une faiblesse. C'est une maladie qui nécessite un accompagnement professionnel. Elle est très bien traitée avec une psychothérapie et/ou un traitement médicamenteux compatible avec l'allaitement.

## Que faire si vous vous reconnaissez ?

1. En parlez à votre médecin, sage-femme ou gynécologue dès que possible
2. Ne restez pas seule avec ces émotions
3. L'application Maternellea vous permet de noter votre humeur quotidiennement — ces données peuvent aider votre médecin

## Pour l'entourage

Évitez les phrases comme "tu devrais être heureuse". Offrez une présence concrète : préparer un repas, garder le bébé quelques heures.`,
  ['baby blues', 'dépression', 'post-partum', 'santé mentale'], true, false, 3,
);

const ART_PP_2 = a(
  'art-pp02', 'postpartum', 5,
  'La récupération périnéale : ce qu\'on ne vous dit pas toujours',
  'Rééducation, hygiène, délais : tout ce que vous devez savoir pour récupérer sereinement après l\'accouchement.',
  `## Le périnée après l'accouchement

Que vous ayez accouché par voie basse ou par césarienne, votre périnée a été sollicité pendant la grossesse. Comprendre sa récupération est essentiel.

## Pourquoi la rééducation périnéale est-elle prescrite ?

En France, la Sécurité Sociale prend en charge **10 séances de rééducation périnéale** après un accouchement. Elle vise à :

- Renforcer les muscles du plancher pelvien
- Prévenir l'incontinence urinaire
- Améliorer la vie sexuelle
- Réduire les douleurs pelviennes chroniques

Elle peut être réalisée par une sage-femme ou un kinésithérapeute formé. Commencez-la **6 à 8 semaines** après l'accouchement.

## La récupération naturelle

Dans les premières semaines, vous pouvez déjà aider votre périnée :

- **Évitez les efforts de poussée** (portez, soulevez légèrement)
- **Protégez votre périnée** lors des éternuements et de la toux (contractez avant)
- **Ne reprenez pas le sport** (surtout running, abdominaux) avant le feu vert de votre rééducateur

## Les exercices de Kegel

Les contractions de Kegel peuvent être commencées dès les premiers jours si elles ne sont pas douloureuses. Contractez le périnée (comme pour retenir les urines) pendant 5 secondes, relâchez, répétez 10 fois.

## Les signes qui doivent vous alerter

- Douleurs persistantes à l'insertion après 3 mois
- Fuites urinaires importantes qui ne s'améliorent pas
- Sensations de pesanteur pelvienne

Dans ces cas, consultez un médecin — une prolapsus ou d'autres complications peuvent être en cause.`,
  ['périnée', 'rééducation', 'post-partum', 'récupération'], false, false, 7,
);

// ─────────────────────────────────────────────────────────────
//  BÉBÉ
// ─────────────────────────────────────────────────────────────

const ART_BABY_1 = a(
  'art-b01', 'baby', 7,
  'Le sommeil de bébé de 0 à 12 mois',
  'Cycles courts, réveils fréquents, siestes : tout comprendre du sommeil de votre nourrisson pour mieux vivre les nuits.',
  `## Le sommeil du nourrisson : une biologie différente

Le sommeil de bébé n'est pas miniaturisé comme celui de l'adulte. Il fonctionne selon des mécanismes différents qu'il est crucial de comprendre pour éviter les attentes irréalistes.

## Les cycles du sommeil de bébé

Un adulte a des cycles de 90 minutes. Un nourrisson a des cycles de **45 à 50 minutes** seulement. À la fin de chaque cycle, bébé remonte en surface — c'est là qu'il peut se réveiller.

**Composition d'un cycle bébé :**
- Sommeil agité (léger, comme notre REM) : 50%
- Sommeil calme (profond) : 50%

Cette proportion élevée de sommeil agité est essentielle : elle favorise le développement cérébral et la mémorisation.

## Évolution par tranches d'âge

**0–2 mois**
- 16 à 20 heures de sommeil par 24h
- Réveils toutes les 2 à 3 heures (pour l'alimentation)
- Pas encore de rythme circadien établi — confusion jour/nuit fréquente

**2–4 mois**
- Le rythme circadien commence à se mettre en place
- Premières "nuits" plus longues possibles (4–6h)
- La régression des 4 mois peut perturber un rythme qui commençait à s'établir

**4–6 mois**
- Consolidation progressive du sommeil nocturne
- 2 à 3 siestes par jour

**6–9 mois**
- Possible régression liée aux acquisitions motrices
- 2 siestes par jour

**9–12 mois**
- Certains bébés dorment 10–12h la nuit
- Transition vers 1–2 siestes

## Les associations d'endormissement

Si bébé s'endort toujours au sein ou dans les bras, il aura besoin des mêmes conditions pour se rendormir entre deux cycles. Ce n'est pas un "mauvais pli" — c'est de la biologie. L'accompagnement vers l'autonomie peut venir progressivement.

## Un mot sur l'épuisement parental

Les nuits fragmentées sont biologiquement normales pour un bébé mais épuisantes pour ses parents. Partagez les nuits si possible, dormez quand bébé dort, et n'hésitez pas à demander de l'aide.`,
  ['bébé', 'sommeil', 'nuits', 'développement'], true, false, 4,
);

const ART_BABY_2 = a(
  'art-b02', 'baby', 5,
  'Allaitement : les premières semaines avec sérénité',
  'La montée de lait, la mise au sein, les douleurs : guide concret pour les premières semaines d\'allaitement.',
  `## Les premières 48 heures : le colostrum

Avant la montée de lait, votre corps produit le colostrum — un liquide jaunâtre, épais, en petite quantité. Ne vous inquiétez pas de la quantité, elle est parfaitement adaptée au tout petit estomac de votre bébé (5 à 7 ml à la naissance). Le colostrum est extraordinairement riche en anticorps et en protéines.

## La montée de lait (J2–J5)

La montée de lait survient généralement entre le 2ème et le 5ème jour. Vous ressentirez une augmentation de la tension mammaire, parfois accompagnée de légère fièvre et de douleur.

**Pour faciliter la montée de lait :**
- Tétées fréquentes (8 à 12 fois par 24h)
- Peau à peau maximal
- Bonne hydratation et alimentation suffisante

## La bonne mise au sein

Une mauvaise prise du sein est la cause principale des douleurs et des crevasses. Un bon accrochage doit inclure :
- Mamelon ET une grande partie de l'aréole dans la bouche
- Lèvres retroussées (comme un poisson)
- Menton de bébé touchant le sein, nez dégagé

**Si ça fait mal :** c'est presque toujours un signe d'un mauvais positionnement. Ôtez bébé en insérant votre doigt dans le coin de sa bouche et recommencez.

## Les crevasses : les prévenir et les traiter

- Appliquez du lait maternel sur les mamelons après chaque tétée, laissez sécher
- La lanoline pure (type Lansinoh) est très efficace
- Changez souvent les coussinets d'allaitement
- Si la douleur est intense, consultez une consultante en lactation

## Durée et fréquence des tétées

Il n'y a pas de règle fixe. Offrez le sein à la demande. Une tétée peut durer de 5 à 45 minutes. Une durée courte n'est pas un signe de problème si bébé est satisfait et prend bien du poids.

## Ressources

En cas de doute, contactez une sage-femme ou une consultante en lactation certifiée IBCLC.`,
  ['allaitement', 'bébé', 'post-partum', 'nutrition'], false, true, 9,
);

// ─────────────────────────────────────────────────────────────
//  NUTRITION
// ─────────────────────────────────────────────────────────────

const ART_NUT_1 = a(
  'art-n01', 'nutrition', 8,
  'Nutrition pendant la grossesse : le guide complet',
  'Acide folique, fer, calcium, oméga-3 : les nutriments essentiels et comment les trouver dans votre assiette.',
  `## Manger pour deux... intelligemment

Contrairement à l'idée reçue, "manger pour deux" ne signifie pas doubler les portions. Il s'agit surtout d'augmenter la qualité nutritionnelle de votre alimentation.

**Besoins caloriques supplémentaires :**
- 1er trimestre : +0 kcal (pas de surplus nécessaire)
- 2ème trimestre : +300 kcal/jour
- 3ème trimestre : +500 kcal/jour

## Les nutriments clés

### Acide folique (vitamine B9)
**Pourquoi :** Indispensable à la formation du tube neural du bébé (cerveau et colonne vertébrale). Doit être pris avant et pendant le 1er trimestre.

**Dose :** 400 µg/j en supplément + sources alimentaires
**Sources :** Légumes verts à feuilles (épinards, mâche), légumineuses, foie (avec modération), levure de bière

### Fer
**Pourquoi :** Volume sanguin augmenté de 50%, fabrication du sang du bébé.

**Dose :** Besoins passent de 18 à 27 mg/j
**Sources :** Viandes rouges, légumineuses, lentilles, épinards
**Astuce :** Associez fer et vitamine C (citron, poivron) pour optimiser l'absorption. Évitez le thé et le café avec les repas riches en fer.

### Calcium
**Pourquoi :** Construction du squelette de bébé. Si votre apport est insuffisant, bébé puise dans vos os.

**Dose :** 1000 mg/j
**Sources :** Laitages, sardines avec arêtes, brocoli, tofu ferme, amandes

### Oméga-3 (DHA)
**Pourquoi :** Développement cérébral et visuel du fœtus.

**Sources :** Poissons gras 2x/semaine (sardines, maquereaux, saumon) — évitez les grands poissons (thon blanc, espadon, marlin) à cause du mercure. Noix de Grenoble, huile de colza.

### Iode
**Pourquoi :** Développement cérébral et thyroïde.

**Sources :** Sel iodé, poissons et fruits de mer, laitages

### Vitamine D
**Dose :** 400–1000 UI/j (supplémentation souvent recommandée en France)

## Ce qu'il faut éviter

- Alcool : aucune dose n'est sûre pendant la grossesse
- Caféine : max 200 mg/j (environ 2 tasses de café)
- Listériose : évitez fromages au lait cru, charcuterie crue, graines germées crues, produits fumés
- Toxoplasmose si vous n'êtes pas immunisée : viande bien cuite, légumes bien lavés, évitez le jardinage sans gants`,
  ['nutrition', 'grossesse', 'vitamines', 'alimentation'], true, true, 18,
);

const ART_NUT_2 = a(
  'art-n02', 'nutrition', 5,
  'Les super-aliments post-partum pour récupérer',
  'Fer, zinc, oméga-3, probiotiques : ce que votre corps réclame après l\'accouchement pour récupérer vite.',
  `## Votre corps après l'accouchement

L'accouchement mobilise d'énormes ressources. Votre corps a besoin de se reconstituer, de cicatriser et — si vous allaitez — de produire du lait tout en prenant soin de vous.

## Les priorités nutritionnelles

### Reconstituer les réserves de fer

L'accouchement entraîne une perte de sang significative. Le fer est prioritaire pour lutter contre l'anémie post-partum, source de fatigue intense.

**Super-aliments fer :** lentilles, palourdes, boudin noir (si vous le supportez), viandes rouges, épinards + filet de citron

### Soutenir la cicatrisation

Le zinc et la vitamine C accélèrent la cicatrisation (épisiotomie, cicatrice de césarienne).

**Sources zinc :** viandes, œufs, graines de courge, légumineuses
**Sources vitamine C :** kiwi, poivron cru, agrumes, brocoli

### Oméga-3 pour l'humeur et le cerveau

Les DHA sont cruciaux pour la santé mentale post-partum. Leur carence est liée à un risque accru de dépression post-partum.

**Sources :** sardines en conserve, maquereaux, saumon, graines de chia

### Probiotiques pour l'intestin

L'accouchement et les antibiotiques éventuels affectent le microbiote. Les probiotiques aident à le restaurer.

**Sources :** yaourt nature entier, kéfir, choucroute, kimchi

## Pratiquement, comment manger quand on est épuisée ?

1. **Préparez en avance** (batch cooking) avant l'accouchement
2. **Acceptez l'aide** : lasagnes congelées de la famille, livraisons de repas
3. **Gardez des encas nourrissants** à portée : fruits secs, noix, barres aux céréales maison
4. **Hydratez-vous** : surtout si vous allaitez (buvez à chaque tétée)`,
  ['nutrition', 'post-partum', 'récupération', 'alimentation'], false, false, 6,
);

const ART_NUT_3 = a(
  'art-n03', 'nutrition', 4,
  'Manger sainement avec des nausées de grossesse',
  'Quand tout vous soulève le cœur, manger devient un défi. Stratégies pratiques et aliments tolérants.',
  `## Nausées et alimentation : un équilibre difficile

Environ 70% des femmes enceintes ont des nausées au 1er trimestre. Certaines n'ont que des nausées légères le matin ; d'autres sont malades toute la journée. Voici comment continuer à vous nourrir correctement.

## Le principe de base : le vide aggrave les nausées

Un estomac vide augmente l'acide gastrique, qui aggrave les nausées. La clé est de ne jamais rester à jeun trop longtemps.

**Stratégies :**
- Gardez une biscotte ou quelques crackers de blé complet sur votre table de nuit
- Mangez-les avant de vous lever le matin
- Fractionnez en 5 à 6 petits repas plutôt que 3 grands

## Les aliments souvent bien tolérés

- Pain grillé, crackers, biscottes
- Riz blanc, pâtes nature
- Banane (douce, apporte du potassium)
- Pomme de terre bouillie
- Bouillon clair
- Yaourt nature (si les produits laitiers passent)
- Gingembre sous toutes ses formes : tisane, biscuits au gingembre, gélules

## Ce qui empire souvent les nausées

- Aliments gras (fritures, sauces riches)
- Aliments très sucrés
- Odeurs fortes (café, certaines viandes, parfums)
- Caféine
- Épices fortes

## Le gingembre : soutenu par la science

Plusieurs études cliniques confirment l'efficacité du gingembre pour réduire les nausées de grossesse. Il est sans danger en quantités alimentaires normales (max 1g/j de gingembre sec).

## Quand consulter ?

Si vous vomissez plusieurs fois par jour et ne pouvez rien garder, si vous perdez du poids, si vous urinez très peu : consultez. L'hyperémèse gravidique nécessite une prise en charge médicale.`,
  ['nausées', 'grossesse', 'nutrition', 'T1'], false, false, 11,
);

// ─────────────────────────────────────────────────────────────
//  BIEN-ÊTRE
// ─────────────────────────────────────────────────────────────

const ART_WB_1 = a(
  'art-wb01', 'wellbeing', 6,
  'Yoga prénatal : guide complet par trimestre',
  'Postures adaptées, bienfaits prouvés, précautions : tout ce que vous devez savoir sur le yoga pendant la grossesse.',
  `## Pourquoi le yoga prénatal ?

Le yoga prénatal est l'une des pratiques les mieux documentées pour le bien-être des femmes enceintes. Ses bénéfices incluent :

- Réduction du stress et de l'anxiété
- Amélioration de la qualité du sommeil
- Renforcement du périnée et des muscles stabilisateurs
- Soulagement des douleurs lombaires
- Préparation à l'accouchement (gestion de la douleur, respiration)

## 1er trimestre (SA 4–13) : douceur et repos

Pendant les premières semaines, votre corps s'adapte à des changements hormonaux importants. Soyez à l'écoute.

**Postures bénéfiques :**
- Posture de l'enfant (Balasana) : soulage le bas du dos
- Chat-vache (Marjaryasana-Bitilasana) : mobilité vertébrale
- Torsions douces et décroisées

**À éviter :** postures sur le ventre, grandes inversions, exercices intenses

## 2ème trimestre (SA 14–26) : la période idéale

La fatigue diminue, le ventre est encore gérable. C'est souvent la période la plus agréable pour pratiquer.

**Postures phares :**
- Guerrier II (Virabhadrasana II) : renforce les jambes, ouvre le bassin
- Triangle (Trikonasana) : en version adaptée, étire le côté du corps
- Pigeon modifié : ouverture des hanches, soulagement des sciatiques
- Yoga des squats (Malasana) : prépare au travail

**Accessoires utiles :** Coussin, blocs, chaise pour adapter les postures

## 3ème trimestre (SA 27–40) : confort et préparation

Le ventre change le centre de gravité. Privilégiez les postures assises et allongées sur le côté.

**Pratiques clés :**
- Respiration abdominale et intercostale (essentielle pour le travail)
- Visualisation positive de l'accouchement
- Postures d'ouverture du bassin au sol
- Exercices de périnée (Kegel intégrés)

## Précautions importantes

- Consultez votre médecin avant de commencer, surtout si grossesse à risque
- Après le 4ème mois, évitez les postures allongées sur le dos prolongées
- Arrêtez si vous ressentez des douleurs, vertiges, essoufflement
- Préférez un cours avec un professeur certifié prénatal`,
  ['yoga', 'bien-être', 'grossesse', 'exercice'], true, false, 22,
);

const ART_WB_2 = a(
  'art-wb02', 'wellbeing', 5,
  'La pleine conscience pour les jeunes mamans',
  'Méditation en 5 minutes, ancrage, respiration : des outils concrets pour trouver le calme dans le chaos des premières semaines.',
  `## La pleine conscience quand on est épuisée

On vous dit de "méditer", mais comment le faire quand vous dormez 3 heures par nuit et que votre bébé pleure ? La pleine conscience n'est pas de la méditation parfaite assis en silence. Ce sont des petits moments de présence volontaire.

## Pourquoi ça aide vraiment

Des études cliniques montrent que les pratiques de pleine conscience réduisent :
- Les symptômes dépressifs post-partum
- L'anxiété parentale
- Le niveau de cortisol (hormone du stress)
- La réactivité émotionnelle

## Pratique 1 : La respiration 4-7-8 (1 minute)

Inspirez par le nez pendant 4 secondes → retenez pendant 7 secondes → expirez lentement par la bouche pendant 8 secondes. Répétez 3 fois.

Activez le système nerveux parasympathique (mode "repos"). Idéal avant d'aller chez le bébé qui pleure.

## Pratique 2 : L'ancrage des 5 sens (30 secondes)

Posez le bébé en sécurité et faites :
- 5 choses que vous voyez
- 4 que vous pouvez toucher
- 3 que vous entendez
- 2 que vous sentez
- 1 que vous goûtez

## Pratique 3 : La tétée en pleine conscience

Pendant une tétée, au lieu de scroller votre téléphone, observez : le contact peau à peau, la chaleur, le son de la déglutition, le visage de votre bébé. Ces 5 minutes de connexion peuvent transformer votre ressenti.

## Pratique 4 : Le body scan de 5 minutes

Allongée, parcourez mentalement votre corps des pieds à la tête. Sentez chaque partie sans chercher à changer quoi que ce soit. Excellent pour s'endormir.

## L'app et les ressources

Des applications de méditation guidée (Petit Bambou, Calm, Headspace) proposent des programmes spéciaux post-partum. 5 minutes par jour suffisent pour commencer.`,
  ['méditation', 'bien-être', 'post-partum', 'stress'], false, false, 14,
);

const ART_WB_3 = a(
  'art-wb03', 'wellbeing', 4,
  'Reprendre le sport après l\'accouchement',
  'Quand reprendre, comment progresser, ce qu\'il faut éviter : le guide pour reprendre une activité physique sans se blesser.',
  `## Patience et progressivité : les maîtres-mots

La reprise sportive après l'accouchement est une question qui mérite une réponse personnalisée. Ce qui convient à l'une ne convient pas à l'autre. Voici les repères généraux.

## La règle générale : attendez le feu vert médical

Ne reprenez pas de sport avant votre consultation post-natale (6 à 8 semaines) ET votre bilan de rééducation périnéale. Votre physiothérapeute évaluera si votre périnée est prêt.

**Signes que vous n'êtes pas encore prête :**
- Fuites urinaires pendant l'effort
- Pesanteur pelvienne
- Cicatrice encore douloureuse

## Le protocole progressif

**Semaines 1–6 : repos et récupération**
Uniquement marche douce et exercices de Kegel (si indolores). Votre utérus se remet en place, les ligaments restent relâchés (l'hormone relaxine persiste plusieurs mois).

**Semaines 6–12 : reprise légère**
Après le feu vert médical, vous pouvez reprendre : marche rapide, natation (si cicatrice fermée), vélo stationnaire, yoga postnatal.

**3ème mois et au-delà**
Progressivement : course à pied légère, pilates adapté, renforcement musculaire modéré.

## Ce qu'il ne faut JAMAIS faire trop tôt

- Abdominaux classiques (crunch) : aggrave la diastase des droits
- Course à pied intense avant 3 mois minimum
- Sports avec sauts
- Sports de contact

## La diastase abdominale

C'est l'écartement des muscles grands droits de l'abdomen, fréquent après une grossesse. Les abdominaux classiques peuvent l'aggraver. Faites tester votre diastase par votre kinésithérapeute avant de reprendre tout renforcement abdominal.`,
  ['sport', 'bien-être', 'post-partum', 'récupération'], false, false, 16,
);

// ─────────────────────────────────────────────────────────────
//  SANTÉ MENTALE
// ─────────────────────────────────────────────────────────────

const ART_MH_1 = a(
  'art-mh01', 'mental_health', 5,
  'Anxiété pendant la grossesse : normal ou inquiétant ?',
  'Une certaine anxiété est normale en période périnatale. Mais quand chercher de l\'aide ? Repères et ressources.',
  `## L'anxiété périnatale : une réalité sous-estimée

On parle beaucoup de la dépression post-partum, mais moins de l'anxiété périnatale, qui touche pourtant **15 à 20%** des femmes enceintes et des nouvelles mamans.

## Ce qui est normal

Une certaine préoccupation pour la santé du bébé, l'accouchement, votre rôle de mère : c'est normal, humain et même adaptatif. Ces pensées vous poussent à vous préparer et à prendre soin de vous.

## Ce qui devient préoccupant

L'anxiété devient problématique quand elle :
- Perturbe le sommeil au-delà de la fatigue normale
- Envahit toutes vos pensées (ruminations incessantes)
- Vous empêche de profiter de moments heureux
- Génère des comportements d'évitement (refus de sortir, hypervigilance)
- S'accompagne de symptômes physiques : palpitations, oppression thoracique, vertiges

## Les facteurs de risque

- Antécédents d'anxiété ou de dépression
- Relation compliquée avec votre propre mère
- Fausse couche ou grossesse précédente difficile
- Grossesse non planifiée ou situation de vie stressante
- Manque de soutien social

## Que faire ?

**En prévention :**
- Parlez de vos inquiétudes à votre sage-femme ou médecin
- Pratiquez la respiration et la pleine conscience
- Limitez les recherches anxiogènes sur internet

**En traitement :**
La TCC (thérapie cognitive et comportementale) est le traitement de référence. Elle peut se combiner à un traitement médicamenteux si nécessaire (certains antidépresseurs sont compatibles grossesse/allaitement).

**Ressources :**
- Votre médecin, gynécologue ou sage-femme
- Un psychologue spécialisé périnatal
- 3114 : numéro national de prévention du suicide (disponible 24h/24)`,
  ['anxiété', 'santé mentale', 'grossesse', 'bien-être'], false, false, 25,
);

// ─────────────────────────────────────────────────────────────
//  EXPORT
// ─────────────────────────────────────────────────────────────

export const ALL_ARTICLES: (Article & { featured?: boolean })[] = [
  ART_CYCLE_1, ART_CYCLE_2, ART_CYCLE_3,
  ART_PREG_1,  ART_PREG_2,
  ART_PP_1,    ART_PP_2,
  ART_BABY_1,  ART_BABY_2,
  ART_NUT_1,   ART_NUT_2,   ART_NUT_3,
  ART_WB_1,    ART_WB_2,    ART_WB_3,
  ART_MH_1,
];

export const FEATURED_ARTICLES = ALL_ARTICLES.filter(a => a.featured);

export const ARTICLES_BY_CATEGORY = (category: string) =>
  ALL_ARTICLES.filter(a => a.category === category);
