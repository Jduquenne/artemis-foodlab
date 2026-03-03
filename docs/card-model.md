# Modèle Card — Décisions d'architecture

> Document de référence issu de la session du 2026-03-03.
> À relire avant toute refonte du type system ou des données.

---

## Concept fondateur

La brique de base de l'application n'est pas "Recette" mais **Card**.
Une Card est toute entité qui peut être **affichée** et/ou **planifiée**.
Tous les types de cartes partagent une base commune : `id`, `name`, `categoryId`, `assets`.

---

## Les quatre types de cartes

### RecipeCard
- Recette complète avec ingrédients, macros, instructions
- **Affichée** dans la liste des recettes ✓
- **Plaçable** dans le planning ✓
- Peut référencer des BaseCards dans ses ingrédients (via `baseId`)

### BaseCard
- Préparation de base réutilisable (béchamel, pesto, ratatouille…)
- **Affichée** dans la liste des recettes ✓ (c'est une recette à part entière, avec assets)
- **Non plaçable** dans le planning ✗
- Peut apparaître comme ingrédient d'une RecipeCard → fournit ses propres ingrédients à la liste de courses (expansion transitive)

### FoodCard
- Fiche d'un aliment simple (avocat, abricots secs…) — macros uniquement
- **Non affichée** dans la liste des recettes ✗ (futur module "Food" prévu)
- **Plaçable** dans le planning ✓ (compositions petit-déjeuner, goûter)
- Quand le module Food existera : deviendra Browsable

### OutdoorCard
- Marqueur d'événement extérieur (restaurant, repas chez des proches, pique-nique…)
- **Non affichée** dans la liste des recettes ✗
- **Plaçable** dans le planning ✓
- Pas d'ingrédients, pas de macros — juste un label
- **Statique** : données dans `outdoor-db.json`. Pour ajouter un label, on édite le JSON.

---

## Matrice des capacités

|               | Browsable (liste recettes) | Plannable (planning) |
|---------------|:--------------------------:|:--------------------:|
| RecipeCard    | ✓                          | ✓                    |
| BaseCard      | ✓                          | ✗                    |
| FoodCard      | ✗ (futur ✓)                | ✓                    |
| OutdoorCard   | ✗                          | ✓                    |

En OO : deux interfaces indépendantes `Browsable` et `Plannable` plutôt qu'une hiérarchie rigide.

---

## Implications sur le type system

### 1. MealSlot.recipeIds → cardIds
Un MealSlot peut contenir n'importe quelle Plannable card (RecipeCard, FoodCard, OutdoorCard).
Le champ doit être renommé `cardIds: CardId[]` pour refléter cette réalité.

### 2. RecipeIngredient — deux liens distincts
`foodId?` et `baseId?` sont mutuellement exclusifs :
```
ingredient.foodId?  → FoodCard   (aliment simple, ex: "Parmesan râpé")
ingredient.baseId?  → BaseCard   (préparation de base, ex: "Sauce béchamel")
```
L'actuel `foodId?: string` qui essaie de tout couvrir est insuffisant.

### 3. Liste de courses — expansion transitive des BaseCards
Quand un ingrédient d'une RecipeCard a un `baseId` :
→ ne pas ajouter la base elle-même à la liste de courses
→ aller chercher les ingrédients de la BaseCard et les ajouter à la place
Ce mécanisme est à implémenter dans `shoppingLogic.ts`.

### 4. Sources de données par type

| Card type    | Source actuelle              | Source cible            |
|--------------|------------------------------|-------------------------|
| RecipeCard   | `recipes-db.json` (kind=dish)| `recipes-db.json`       |
| BaseCard     | `recipes-db.json` (kind=base)| `recipes-db.json`       |
| FoodCard     | `recipes-db.json` (kind=ingredient) | `recipes-db.json` |
| OutdoorCard  | `recipes-db.json` (kind=outdoor — ✗ mauvais) | `outdoor-db.json` (nouveau) |

---

## Macronutriments — Architecture cible (décidé 2026-03-03)

### Principe fondateur

Les macronutriments ne sont **plus stockés dans `recipes-db.json`**. Ils sont portés par `food-db.json` à raison de **100g de référence**, et l'application les calcule dynamiquement à partir des ingrédients d'une recette.

```
RecipeCard.macros = Σ pour chaque ingrédient :
  food.macros × (quantité_en_grammes / 100)
```

L'interface `RecipeDetails.macronutriment` est **conservée** — elle sera renseignée au runtime (calculée à la volée ou mise en cache), pas persistée dans le JSON.

---

### Champ `unitWeights` sur food-db

Les macros étant basées sur 100g, la conversion d'une quantité en grammes est triviale pour `g`, `kg`, `ml`, `cl`. Elle est **impossible sans information supplémentaire** pour les unités relatives à l'aliment (`pièce`, `tranche`, `feuille`, `moyenne`, `petite`, `louche`, `tranche`…).

Ces poids sont stockés **sur l'entrée food-db** via le champ `unitWeights` :

```json
{
  "fv-carotte": {
    "name": "Carotte",
    "category": "Fruits et légumes",
    "macros": { "kcal": 41, "proteins": 0.9, "carbs": 9.6, "fat": 0.2, "fiber": 2.8 },
    "unitWeights": {
      "pièce": 80,
      "moyenne": 100,
      "petite": 50
    },
    "isFreezable": false
  }
}
```

**Pourquoi sur food-db et pas sur l'ingrédient dans la recette ?**
Le poids d'une unité est une propriété de l'aliment, pas de la recette. Centralisé ici, il s'applique automatiquement à toutes les recettes qui l'utilisent.

---

### Table de conversion par unité

| Unité | Conversion | Source |
|---|---|---|
| `g` | 1:1 | — |
| `kg` | × 1000 | — |
| `ml` | 1:1 (eau) | Code global (approximation densité = 1) |
| `cl` | × 10 | Code global |
| `c` (cuillère à soupe) | × 15ml | Code global |
| `cc` (cuillère à café) | × 5ml | Code global |
| `louche` | × 100ml | Code global |
| `pièce`, `tranche`, `feuille`, `moyenne`, `petite` | → `food.unitWeight` | food-db |
| `part`, `portion` | **ignorées** (0g) | Non calculable sans poids total |

---

### Interface Food cible

```typescript
export interface Food {
  id: string;
  name: string;
  category: IngredientCategory;
  macros: Macronutrients;  // par 100g — toujours
  unitWeight?: number;     // grammes pour 1 unité naturelle de cet aliment (pièce, tranche, etc.)
  isFreezable?: boolean;
}
```

Chaque aliment a **au plus une unité naturelle** — pas de mapping multi-unités. La conversion est toujours : `quantité × unitWeight → grammes → / 100 × macros`.

---

## Ce qui n'est PAS encore décidé

- Structure exacte de `outdoor-db.json` (au minimum `id` + `name`, peut-être une icône ?)
- Migration concrète de `recipes-db.json` vers les nouveaux noms de champs
- Timing de la mise en place du module "Food"
- Comment `cardIds` est résolu au runtime (lookup dans plusieurs sources)
- Peuplement de `food-db.json` avec les macros (actuellement seule la catégorie est renseignée)
- Algorithme de calcul des macros au runtime (à la volée vs. mise en cache locale)

---

## Liens avec les autres fichiers de référence

- `docs/data-model.puml` — à mettre à jour pour intégrer Card comme racine et OutdoorCard
- `docs/recipes-db.ref.json` — à mettre à jour : `kind: "outdoor"` → à retirer
- `docs/idb.ref.json` — `recipeIds` → `cardIds` dans MealSlot
- `docs/food-db.ref.json` — à mettre à jour : ajouter `macros` et `unitWeights` sur les entrées
