# PROMPT DE MIGRATION — Restructurer le contexte d'un projet existant

> **Bloc de configuration — à ajuster AVANT d'envoyer ce prompt.**
>
> | Clé                                   | Valeur                                                                                                  |
> | ------------------------------------- | ------------------------------------------------------------------------------------------------------- |
> | Fichiers de contexte actuels à migrer | `CLAUDE.md`, `memory.md` (+ tout autre `.md` de contexte que tu trouves à la racine ou dans `.claude/`) |
> | Langue des docs du dépôt              | Anglais (comme le code et les commentaires)                                                             |
> | Langue de la conversation avec moi    | Français                                                                                                |
>
> Si une valeur te semble incohérente avec ce que tu trouves dans le projet, **demande-moi avant d'agir**.

---

## 0. Contexte et objectif

Ce projet existe déjà. Son contexte pour les agents IA est aujourd'hui concentré dans un ou plusieurs gros fichiers (`CLAUDE.md`, `memory.md`…) qui mélangent tout : description du projet, architecture, règles, commandes, décisions passées, état d'avancement, historique de sessions, préférences personnelles, notes en vrac.

Je veux le restructurer selon le modèle suivant (inspiré du projet open source PhotoCraft) :

- **`AGENTS.md`** : point d'entrée unique et court, qui **route** vers le reste au lieu de tout contenir. Il porte les contraintes non négociables, le protocole de session, les règles d'or vérifiables et la checklist de fin de tâche.
- **`docs/`** : un fichier par type de question, sans doublon entre eux.
- **`log/devlog.md`** : journal de session (ce qui a été fait, ce qui reste ouvert), pour que n'importe quelle session future reprenne le travail.
- **`CLAUDE.md`** : réduit à une simple importation de `AGENTS.md`, pour que Claude Code le charge automatiquement.

**L'objectif est de réorganiser, pas de réécrire le projet.** Aucune information ne doit être perdue, aucune ligne de code ne doit être modifiée.

Lis ce prompt **en entier** avant d'agir.

---

## 1. Règles absolues

1. **Git est interdit** pour toute action qui modifie le dépôt (`init`, `add`, `commit`, `push`, `pull`, `merge`, `rebase`, `reset`, `checkout`, `switch`, `stash`, `tag`, `branch`, `clean`, `restore`, `remote`). Seules les commandes en lecture (`status`, `diff`, `log`, `show`) sont permises. C'est moi qui commite ; tu proposes le message.
2. **Aucune modification du code source, des configurations de build ni des dépendances.** Tu ne touches qu'aux fichiers de documentation et de contexte listés dans ce prompt (et à `.claude/settings.json`).
3. **Aucune information perdue.** Chaque élément des fichiers d'origine doit se retrouver quelque part, ou être explicitement écarté **avec mon accord**. Une table de traçabilité le prouve (section 5).
4. **Aucune suppression de fichier.** Les fichiers d'origine sont déplacés dans `docs/archive/` (avec leur nom d'origine et la date), jamais effacés. Je les supprimerai moi-même plus tard.
5. **Aucune invention.** Tu ne complètes pas un doc avec des informations que tu supposes. Si une section du modèle n'a pas de matière dans les fichiers d'origine ni dans le code, elle reste avec un marqueur `TODO(owner): ...` et tu me poses la question.
6. **Pas de décision silencieuse.** Contradiction, information qui semble périmée, règle ambiguë : tu me la signales et j'arbitre. Tu ne choisis pas à ma place.
7. **Travail par étapes validées** (section 3) : tu t'arrêtes à la fin de chaque étape et tu attends mon accord.
8. **Langues** : tu me parles en français ; ce qui est écrit dans le dépôt est en anglais. Si le contenu d'origine est en français, tu le traduis fidèlement sans en changer le sens, et tu me signales toute formulation dont la traduction est ambiguë.

---

## 2. Structure cible

```text
AGENTS.md                  # point d'entrée et routeur (≈150-250 lignes max)
CLAUDE.md                  # importe AGENTS.md, rien d'autre
.claude/settings.json      # permissions : commandes Git modifiantes bloquées
docs/
  architecture.md          # structure du code, modules/couches, flux de données, modèle de données
  development.md           # prérequis, installation, build, lancement, tests, débogage
  conventions.md           # style, nommage, gestion d'erreurs, tests, commits, checklists « ajouter un X »
  roadmap.md               # phases, statut réel, « Current focus », « Ideas / later »
  decisions.md             # décisions d'architecture (format ADR léger)
  spec-*.md                # spécification fonctionnelle, si le projet en a la matière (un fichier par domaine)
  archive/                 # fichiers de contexte d'origine, intacts
log/
  devlog.md                # journal de session, plus récent en haut
```

Fichiers **optionnels**, à créer seulement si la matière existe : `docs/testing.md`, `docs/ui-design.md`, `docs/api.md`, `docs/glossary.md`, `docs/learning/notes.md`, `ATTRIBUTION.md` (si le projet embarque des ressources tierces : polices, icônes, images, données). **Ne crée pas de fichier vide « pour la forme ».**

### Rôle de chaque fichier (une information n'a qu'une seule maison)

| Type d'information trouvée                                                                                         | Destination                                                                                                                       |
| ------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| Ce qu'est le projet, contraintes non négociables, interdits                                                        | `AGENTS.md` (préambule)                                                                                                           |
| Comment l'agent doit travailler (protocole de session, règles de comportement)                                     | `AGENTS.md`                                                                                                                       |
| Règles de code vérifiables (style, erreurs, tests obligatoires)                                                    | Résumé dans `AGENTS.md`, détail dans `docs/conventions.md`                                                                        |
| Structure du code, modules, dépendances internes, modèle de données                                                | `docs/architecture.md`                                                                                                            |
| Commandes d'installation, build, lancement, tests, outils                                                          | `docs/development.md` (et la checklist de fin de tâche dans `AGENTS.md`)                                                          |
| Fonctionnalités attendues, comportements, règles métier                                                            | `docs/spec-*.md`                                                                                                                  |
| Choix techniques passés et leurs raisons                                                                           | `docs/decisions.md`                                                                                                               |
| État d'avancement, prochaines étapes, idées futures                                                                | `docs/roadmap.md`                                                                                                                 |
| Historique de sessions, journal, « ce qui a été fait le … »                                                        | `log/devlog.md`                                                                                                                   |
| Préférences **personnelles** qui ne concernent pas ce projet (ton, langue, façon de répondre, habitudes générales) | **Hors dépôt** : à me proposer pour mon fichier utilisateur `~/.claude/CLAUDE.md`. Ne les copie pas dans le dépôt sans mon accord |
| Informations sensibles (clés, mots de passe, chemins personnels, données privées)                                  | **Nulle part dans le dépôt.** Tu me les signales immédiatement                                                                    |
| Doublons                                                                                                           | Une seule occurrence, dans la destination la plus logique                                                                         |
| Information manifestement périmée ou contredite par le code                                                        | Signalée à l'étape 1, décision par moi                                                                                            |

---

## 3. Déroulé en quatre étapes (arrêt et validation à la fin de chacune)

### Étape 1 — Audit (lecture seule, aucun fichier créé ni modifié)

1. Lis intégralement tous les fichiers de contexte (ceux du bloc de configuration, plus tout `.md` de contexte trouvé à la racine, dans `.claude/`, et les `CLAUDE.md` éventuels dans des sous-dossiers). Liste-les avec leur taille.
2. Parcours le projet pour **confronter les documents au code réel** : arborescence, fichiers de build (`package.json`, `Cargo.toml`, `*.csproj`, `pom.xml`, `build.gradle`, `docker-compose.yml`…), scripts, structure des modules, tests existants.
3. Découpe les fichiers d'origine en **blocs d'information** numérotés (`B-001`, `B-002`…), un bloc = une information cohérente (une règle, une commande, une décision, une étape d'historique…).
4. Rends-moi un **rapport d'audit** :
   - inventaire des fichiers de contexte ;
   - nombre de blocs trouvés par catégorie (tableau de la section 2) ;
   - **contradictions** entre fichiers, ou entre les docs et le code (ex. une commande documentée qui n'existe pas dans les scripts, une architecture décrite qui ne correspond plus aux dossiers) ;
   - **informations probablement périmées**, avec la raison ;
   - **doublons** ;
   - **préférences personnelles** repérées (candidates pour `~/.claude/CLAUDE.md`) ;
   - **informations sensibles** repérées ;
   - **trous** : ce que le modèle cible attend et qui n'existe nulle part (ex. aucune décision documentée, pas de commande de test).
5. **Arrête-toi** et attends mes arbitrages.

### Étape 2 — Plan de migration (aucun fichier encore créé)

1. Propose la **liste finale des fichiers** à créer (obligatoires + optionnels justifiés).
2. Propose le **plan de chaque fichier** (titres de sections).
3. Produis la **table de traçabilité provisoire** : chaque bloc `B-xxx` → fichier et section de destination, ou « écarté » (avec la raison, en attente de mon accord), ou « hors dépôt ».
4. Propose les **règles d'or** à mettre dans `AGENTS.md`, extraites des fichiers d'origine, reformulées pour être **vérifiables** (« never X », « always Y before finishing a task », avec la commande ou l'outil qui le vérifie quand il existe). Distingue celles qui existaient déjà de celles que tu suggères d'ajouter (les ajouts sont des propositions, pas des faits).
5. Propose la **checklist de fin de tâche** à partir des commandes réelles du projet (lint, format, tests, build), en indiquant si tu as vérifié qu'elles fonctionnent.
6. **Arrête-toi** et attends ma validation du plan.

### Étape 3 — Exécution

1. Crée `docs/archive/` et **déplace** (sans les modifier) les fichiers d'origine en les renommant `<nom>-<AAAA-MM-JJ>.md`. Ne les supprime pas.
2. Crée les fichiers selon le plan validé, en respectant le contenu attendu (section 4).
3. Remplace `CLAUDE.md` par la version d'importation (section 4.2).
4. Crée ou complète `.claude/settings.json` (section 4.9). S'il existe déjà, **fusionne** sans retirer les permissions existantes, et montre-moi le diff.
5. Exécute les commandes de la checklist de fin de tâche pour vérifier que la documentation de `docs/development.md` est exacte. Si une commande échoue, **ne corrige pas le code** : note l'échec dans le rapport et dans le devlog.

### Étape 4 — Vérification et rapport

1. **Contrôle de couverture** : relis les fichiers archivés bloc par bloc et vérifie que chaque bloc a bien sa place selon la table de traçabilité. Tout bloc orphelin est soit ajouté, soit signalé.
2. **Contrôle de non-duplication** : aucune information n'est écrite à deux endroits (les renvois entre fichiers sont des liens, pas des copies).
3. **Contrôle de taille** : `AGENTS.md` reste un routeur ; s'il dépasse environ 250 lignes, propose ce qui doit descendre dans `docs/`.
4. **Contrôle des liens** : chaque chemin cité dans `AGENTS.md` et dans `docs/` existe.
5. Rends le rapport final (section 6) et **arrête-toi**.

---

## 4. Contenu attendu des fichiers

### 4.1 `AGENTS.md` (anglais, court, il route)

Sections dans cet ordre :

1. **Preamble** : ce qu'est le projet en 4–5 lignes, sa stack, ses contraintes non négociables, la règle des langues, « read this file first, then `docs/` ».
2. **Session protocol** : au début de chaque session, lire `AGENTS.md`, « Current focus » dans `docs/roadmap.md` et les dernières entrées de `log/devlog.md` ; proposer un plan ; attendre la validation pour toute tâche non triviale ; implémenter ; vérifier ; écrire le devlog ; proposer un message de commit.
3. **Absolute rules** : Git réservé au propriétaire (lecture seule permise) ; décisions d'architecture proposées puis validées et consignées dans `docs/decisions.md` ; pas de passage de phase sans accord ; pas de version de dépendance inventée ; pas de travail hors périmètre ; honnêteté sur l'état d'avancement. Plus les règles spécifiques au projet issues des fichiers d'origine.
4. **Orientation** : tableau « Read / Why » vers chaque fichier de `docs/`.
5. **Project map** : arborescence commentée des dossiers principaux (issue du code réel, pas des anciens docs).
6. **Golden rules** : les règles de code vérifiables, condensées, avec renvoi à `docs/conventions.md`.
7. **Picking work** : roadmap « Current focus », puis « Still open » du devlog.
8. **Before you finish a task** : la checklist de commandes réelles, puis devlog, puis mise à jour de la roadmap, puis message de commit proposé.
9. **Where things are tracked** : roadmap, decisions, devlog, archive.

### 4.2 `CLAUDE.md`

```markdown
# CLAUDE.md

This project's agent instructions live in AGENTS.md (single source of truth).

@AGENTS.md
```

### 4.3 `docs/architecture.md`

Structure **telle qu'elle est dans le code aujourd'hui** (vérifiée), modules et responsabilités, dépendances autorisées entre modules si des règles existent, flux de données principaux (schéma texte ou Mermaid), modèle de données. Toute divergence entre ce que disaient les anciens docs et ce que montre le code est signalée par un encadré `> Note (migration): ...` en attendant mon arbitrage.

### 4.4 `docs/development.md`

Prérequis, installation, variables d'environnement (noms seulement, jamais de valeurs secrètes), build, lancement, tests, outils, débogage, problèmes connus. Chaque commande indique si elle a été vérifiée pendant la migration.

### 4.5 `docs/conventions.md`

Style, nommage, organisation des fichiers, gestion d'erreurs, tests (où, comment, nommage), format des messages de commit (Conventional Commits par défaut si rien n'existe, à me confirmer), et des checklists « ajouter un X » numérotées quand le projet a des tâches récurrentes (un écran, une route d'API, une entité, une commande…).

### 4.6 `docs/roadmap.md`

- Légende : ✅ terminé · 🟡 en cours · ⬜ non commencé · ⏸ en attente de décision.
- **« Current focus »** en haut.
- **« Honest status »** daté : ce qui fonctionne réellement aujourd'hui.
- Phases ou jalons tirés des fichiers d'origine, chacun avec une **définition de terminé vérifiable**. S'il n'en existe pas, propose-les et marque-les « proposed ».
- **« Ideas / later »**.

### 4.7 `docs/decisions.md`

Format par entrée : `## D-xxx — Title`, `Date` (ou `unknown, before migration`), `Status` (accepted / proposed / superseded / rejected), `Context`, `Decision`, `Alternatives considered` (si connues, sinon `not documented`), `Consequences`. Les décisions trouvées dans les fichiers d'origine et visibles dans le code sont `accepted` ; celles qui sont seulement évoquées sont `proposed` et je trancherai.

### 4.8 `log/devlog.md`

En tête, le format d'une entrée : date, ce qui a été fait, chiffres éventuels, problèmes, **« Still open »**. Plus récente en haut. Convertis l'historique trouvé dans les fichiers d'origine en entrées datées (date inconnue → `Before YYYY-MM-DD (migrated)`). **Première entrée réelle : cette migration.**

### 4.9 `.claude/settings.json`

Permissions `deny` pour les commandes Git modifiantes (liste de la règle 1), `allow` pour `git status`, `git diff`, `git log`, `git show`. Vérifie la syntaxe exacte attendue par Claude Code ; si tu as un doute, dis-le dans le rapport au lieu de deviner.

---

## 5. Table de traçabilité

Fichier livré avec la migration : `docs/archive/migration-map-<AAAA-MM-JJ>.md`. Format :

| Bloc  | Source (fichier, section ou lignes) | Résumé (une ligne)                    | Destination (fichier § section) | Statut                                   |
| ----- | ----------------------------------- | ------------------------------------- | ------------------------------- | ---------------------------------------- |
| B-001 | `CLAUDE.md` l. 12–18                | Rule: never use X in Y                | `AGENTS.md` § Golden rules      | migrated                                 |
| B-002 | `memory.md` l. 40                   | Session of 2026-09-12: feature Z done | `log/devlog.md`                 | migrated                                 |
| B-003 | `memory.md` l. 77                   | Prefers short answers                 | —                               | moved out of repo (user-level), approved |
| B-004 | `CLAUDE.md` l. 90                   | Old build command `npm run old`       | —                               | dropped (obsolete), approved             |

Statuts possibles : `migrated`, `merged with B-xxx` (doublon), `moved out of repo` (approuvé), `dropped` (approuvé), `pending decision`. **À la fin, plus aucun bloc ne doit être `pending decision`.**

---

## 6. Rapport final (en français, dans la conversation)

1. Fichiers créés, déplacés, modifiés (arborescence).
2. Statistiques de la table de traçabilité (blocs par statut).
3. Résultat du contrôle de couverture, de non-duplication, de taille et des liens.
4. Résultat de l'exécution des commandes de la checklist (succès/échecs, sans correction du code).
5. Préférences personnelles proposées pour `~/.claude/CLAUDE.md` (texte prêt à copier, je le ferai moi-même).
6. Points restés en `TODO(owner)` et questions qui m'attendent.
7. Message de commit proposé, par exemple : `docs: restructure agent context into AGENTS.md, docs/ and devlog`.

Ensuite tu **t'arrêtes**.

---

## 7. Auto-vérification avant de rendre la main

- [ ] Aucune commande Git modifiante exécutée.
- [ ] Aucun fichier de code, de build ou de dépendance modifié.
- [ ] Aucun fichier supprimé ; les originaux sont intacts dans `docs/archive/`.
- [ ] Chaque bloc de la table de traçabilité a un statut final, approuvé par moi quand il n'est pas `migrated`.
- [ ] Aucune information inventée ; les trous sont marqués `TODO(owner)`.
- [ ] Aucune information sensible dans le dépôt.
- [ ] `CLAUDE.md` ne contient que l'importation de `AGENTS.md`.
- [ ] `AGENTS.md` route au lieu de dupliquer, et reste sous ~250 lignes.
- [ ] Tous les chemins cités existent.
- [ ] Docs en anglais, rapport en français.
