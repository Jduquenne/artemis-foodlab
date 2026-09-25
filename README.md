# Artemis Foodlab

Application web (PWA) de planification de repas : menu de la semaine, journal nutritionnel, recettes, courses, congélateur et articles ménagers. Interface en français, responsive (mobile, tablette, desktop).

Production : https://jduquenne.github.io/artemis-foodlab/

## Fonctionnalités

- **Journal** : macros du jour par profil, objectifs personnalisés, quantités ajustables par repas et par ingrédient, moyenne de semaine.
- **Menu (planning)** : déjeuners, dîners, petits-déjeuners et goûters par semaine, desserts, glisser-déposer, copie de repas.
- **Recettes** : catalogue par catégorie, recherche, filtres par macros, quantités selon le nombre de parts.
- **Courses** : liste générée depuis le planning, par repas ou par ingrédient, articles ménagers.
- **Congélateur** : catégories, sachets et batch cooking.
- **Profils** : jusqu'à 3 personnes par compte, chacune avec ses objectifs et ses ajustements de journal.
- **Administration** (rôle `admin`) : créateur de recettes et tableau de bord du catalogue.

## Architecture

Le front consomme l'API `meals-planning-api` (projet séparé : Express, PostgreSQL, Prisma), qui est la source de vérité. IndexedDB ne sert que de cache de lecture. Une connexion est requise.

```
src/
  core/      logique métier pure, services API, types, cache IndexedDB
  features/  composants et hooks propres à chaque feature
  shared/    composants, hooks, stores et utilitaires partagés
```

## Stack

React 19, TypeScript, Vite, Tailwind CSS 4, Zustand, Dexie (IndexedDB), React Router, dnd-kit, date-fns, Lucide.

## Développement

Prérequis : Node.js 24 ou plus.

```bash
npm install
npm run dev
```

Créer un fichier `.env` à la racine :

```
VITE_API_URL=<url de l'API, sans slash final>
```

| Commande | Rôle |
| --- | --- |
| `npm run dev` | Serveur de développement (port 5173) |
| `npx tsc -b` | Vérification des types |
| `npm run lint` | ESLint |
| `npm run preview` | Prévisualisation d'un build |

## Déploiement

Un push sur `master` déclenche `.github/workflows/deploy.yml` : lint, build, puis publication sur GitHub Pages. `Dev` est la branche de travail.
