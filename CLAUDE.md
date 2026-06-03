# CLAUDE.md

## Commands

```bash
npm run dev          # serveur de développement
npm run build        # build production
npm run lint         # eslint
npm run preview      # preview du build
npm run gen:json     # régénération des fichiers JSON de référence
```

---

## Product context

PWA offline, production, pas POC.
Priorités : scalabilité et clarté architecturale.
UI en français.

---

## UI constraints

- Responsive obligatoire via les préfixes Tailwind.
- **No-scroll layout** : tout tient dans le viewport sur desktop (`md:` et supérieur). Le scroll est toléré sur mobile.
- Tailwind par défaut. CSS custom autorisé pour les cas que Tailwind ne couvre pas.
- Zéro commentaire dans le code.

---

## Architecture

Trois couches, sans exception :

| Couche      | Rôle                                                           |
| ----------- | -------------------------------------------------------------- |
| `core/`     | Logique métier pure, migrations DB, types fondamentaux         |
| `features/` | Composants et hooks propres à une feature                      |
| `shared/`   | Ce qui est réutilisé entre features (composants, hooks, utils) |

### Règles de placement (invariants)

- Logique métier → `core/logic/<feature>/` — jamais inline dans un composant ou un hook.
- Toute fonction logique est une **fonction nommée pure**, testable isolément.
- Utils transverses → `shared/utils/`
- Hooks → `shared/hooks/` — jamais dans un composant directement.
- Données statiques → fichier dédié dans le dossier de la feature, pas dans le composant.
- Un seul composant par fichier.

---

## Data flow

1. Chargement des données depuis IndexedDB via les stores Zustand.
2. Les stores exposent uniquement les données et les actions — aucune logique de transformation inline.
3. La logique de transformation vit dans `core/logic/<feature>/`.
4. Les composants consomment les stores et appellent des fonctions nommées pures.
5. Les mutations (ajout, modification, suppression) passent systématiquement par les actions du store.
6. Le store notifie les abonnés après mutation — pas d'effet de bord dans les composants.
7. Les données dérivées (agrégations, filtres) sont calculées dans `core/logic/` et non recalculées dans le rendu.

---

## DB — IndexedDB migrations

- Version courante : voir `src/db/` directement.
- **Règle absolue** : ne jamais modifier un bloc `.version(n)` existant. Toute évolution de schéma = nouveau `.version(n+1)`.
- Les types de la DB sont isolés dans `core/typed-db/`.

---

## Routing

- Toutes les routes utilisent `React.lazy` — pas d'import statique de page.
- Le tableau des routes fait référence : voir `src/router/`.

---

## Theming

- **CSS variables uniquement** pour les couleurs `slate-*` et `white`. Ne pas utiliser `dark:text-slate-*` ni `dark:bg-slate-*` : ces valeurs sont gérées par les variables, le dark mode est automatique.
- `dark:text-orange-*` et autres couleurs sémantiques non-slate : usage `dark:` **légitime**, à utiliser normalement.
- Dark mode : class-based via `ThemeProvider`. Ne pas utiliser `prefers-color-scheme` directement.
- Overlays et animations : suivre les tokens définis dans le système de thème.

---

## TypeScript

- `any` interdit partout.
- `as unknown as X` interdit hors `core/typed-db/`.
- Enums en anglais.
- Props interfaces nommées `<ComponentName>Props`.

---

## Code quality

- Pas de logique dans `setState` appelé depuis `useEffect`.
- `exhaustive-deps` respecté — pas de suppression du warning.
- `eslint-disable` interdit.
- `react-refresh` : pas d'export mixte (composant + constante non-composant dans le même fichier).

---

## Domain predicates

Les prédicats recette et slot sont la source de vérité pour toute condition métier.
Ils vivent dans `core/logic/<feature>/` et sont réutilisés partout — jamais réécrits inline.

---

## Git

Format de commit : `type(scope): description courte`

Types valides : `feat`, `fix`, `refactor`, `chore`, `docs`, `style`, `test`.

La version courante est dans `package.json` — c'est la seule source de vérité.

---

## Issues

Les issues sont stockées dans `dev/issues.json`.

**Commandes disponibles :**

- `nouvelle issue` → ajoute une entrée dans `dev/issues.json` avec `id`, `title`, `status: open`, `created_at`.
- `analyse nos issues` → lit `dev/issues.json` et produit un résumé par statut avec recommandations de priorisation.
- `clore issue <id>` → passe `status` à `closed` et ajoute `closed_at`.

**Structure d'une entrée :**

```json
{
  "id": "ISS-001",
  "title": "Description courte du problème",
  "status": "open",
  "priority": "high | medium | low",
  "created_at": "YYYY-MM-DD",
  "closed_at": null,
  "notes": ""
}
```

`dev/issue.json` n'est pas chargé automatiquement dans le contexte — à fournir explicitement quand une commande issue est utilisée.
