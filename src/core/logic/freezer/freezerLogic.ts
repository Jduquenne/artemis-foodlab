import { FreezerBag, FreezerCategory, FreezerItem, Food } from '../../domain/types';
import { isBatchCookable } from '../../domain/recipePredicates';
import { typedRecipesDb } from '../../typed-db/typedRecipesDb';
import { typedFoodDb } from '../../typed-db/typedFoodDb';

export interface BatchRecipeResult {
  id: string;
  name: string;
  isBatch: boolean;
}

export function searchBatchRecipes(query: string): BatchRecipeResult[] {
  const q = query.toLowerCase().trim();
  return Object.entries(typedRecipesDb)
    .filter(([, r]) => r.assets?.mealPhoto && (!q || r.name.toLowerCase().includes(q)))
    .sort(([, a], [, b]) => {
      const aBatch = isBatchCookable(a);
      const bBatch = isBatchCookable(b);
      if (aBatch && !bBatch) return -1;
      if (!aBatch && bBatch) return 1;
      return a.name.localeCompare(b.name);
    })
    .slice(0, 30)
    .map(([id, r]) => ({ id, name: r.name, isBatch: isBatchCookable(r) }));
}

export function searchFreezerFoods(query: string): Food[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return Object.values(typedFoodDb as Record<string, Food>)
    .filter(f => f.name.toLowerCase().includes(q))
    .sort((a, b) => {
      const aStarts = a.name.toLowerCase().startsWith(q);
      const bStarts = b.name.toLowerCase().startsWith(q);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      return a.name.localeCompare(b.name);
    })
    .slice(0, 8);
}

export function getBatchRecipeIdsInFreezer(categories: FreezerCategory[]): Set<string> {
  const set = new Set<string>();
  for (const cat of categories) {
    for (const item of cat.items) {
      if (item.type === 'batch' && item.portions > 0) {
        set.add(item.recipeId);
      }
    }
  }
  return set;
}

export function getFoodIdsInFreezer(categories: FreezerCategory[]): Set<string> {
  const set = new Set<string>();
  for (const cat of categories) {
    for (const item of cat.items) {
      if (item.type === 'food' && item.foodId) {
        const total = item.bags.reduce((sum, b) => sum + (Number(b.quantity) || 0), 0);
        if (total > 0) set.add(item.foodId);
      }
    }
  }
  return set;
}

export function getFoodBagsInFreezer(categories: FreezerCategory[]): Map<string, FreezerBag[]> {
  const map = new Map<string, FreezerBag[]>();
  for (const cat of categories) {
    for (const item of cat.items) {
      if (item.type === 'food' && item.foodId) {
        const existing = map.get(item.foodId) ?? [];
        for (const bag of item.bags) {
          if ((Number(bag.quantity) || 0) > 0) existing.push(bag);
        }
        if (existing.length > 0) map.set(item.foodId, existing);
      }
    }
  }
  return map;
}

function getFreezerItemName(item: FreezerItem): string {
  return item.type === 'batch' ? item.recipeName : item.name;
}

export function sortFreezerItemsAlphabetically(items: FreezerItem[]): FreezerItem[] {
  return [...items].sort((a, b) => getFreezerItemName(a).localeCompare(getFreezerItemName(b), 'fr'));
}

export function distributeFreezerItemsToColumns(items: FreezerItem[], colCount: number): FreezerItem[][] {
  const sorted = sortFreezerItemsAlphabetically(items);
  if (colCount <= 1) return [sorted];
  const perCol = Math.ceil(sorted.length / colCount);
  return Array.from({ length: colCount }, (_, i) => sorted.slice(i * perCol, (i + 1) * perCol));
}

export function computeFreezerBagSelection(
  current: string[],
  bagId: string,
  allBags: FreezerBag[],
): { next: string[]; total: number } {
  const isSelected = current.includes(bagId);
  const next = isSelected ? current.filter(id => id !== bagId) : [...current, bagId];
  const total = next.reduce((sum, id) => {
    const bag = allBags.find(b => b.id === id);
    return sum + (Number(bag?.quantity) || 0);
  }, 0);
  return { next, total };
}

export interface FreezerCategorySummary {
  total: number;
  foodCount: number;
  batchCount: number;
  portions: number;
}

export function summarizeFreezerCategory(category: FreezerCategory): FreezerCategorySummary {
  let foodCount = 0;
  let batchCount = 0;
  let portions = 0;
  for (const item of category.items) {
    if (item.type === 'batch') {
      batchCount++;
      portions += Number(item.portions) || 0;
    } else {
      foodCount++;
    }
  }
  return { total: category.items.length, foodCount, batchCount, portions };
}

export interface FreezerAccent {
  bar: string;
  badge: string;
  swatch: string;
}

export const FREEZER_ACCENTS: Record<string, FreezerAccent> = {
  rose: { bar: 'bg-rose-400', badge: 'bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-300', swatch: 'bg-rose-400' },
  orange: { bar: 'bg-orange-400', badge: 'bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-300', swatch: 'bg-orange-400' },
  amber: { bar: 'bg-amber-400', badge: 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300', swatch: 'bg-amber-400' },
  lime: { bar: 'bg-lime-400', badge: 'bg-lime-100 text-lime-700 dark:bg-lime-900/40 dark:text-lime-300', swatch: 'bg-lime-400' },
  emerald: { bar: 'bg-emerald-400', badge: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300', swatch: 'bg-emerald-400' },
  teal: { bar: 'bg-teal-400', badge: 'bg-teal-100 text-teal-600 dark:bg-teal-900/40 dark:text-teal-300', swatch: 'bg-teal-400' },
  sky: { bar: 'bg-sky-400', badge: 'bg-sky-100 text-sky-600 dark:bg-sky-900/40 dark:text-sky-300', swatch: 'bg-sky-400' },
  blue: { bar: 'bg-blue-400', badge: 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300', swatch: 'bg-blue-400' },
  violet: { bar: 'bg-violet-400', badge: 'bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-300', swatch: 'bg-violet-400' },
  fuchsia: { bar: 'bg-fuchsia-400', badge: 'bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-900/40 dark:text-fuchsia-300', swatch: 'bg-fuchsia-400' },
};

export const FREEZER_COLOR_KEYS = Object.keys(FREEZER_ACCENTS);

export function getFreezerCategoryAccent(category: Pick<FreezerCategory, 'id' | 'color'>): FreezerAccent {
  if (category.color && FREEZER_ACCENTS[category.color]) return FREEZER_ACCENTS[category.color];
  let hash = 0;
  for (let i = 0; i < category.id.length; i++) hash = (hash * 31 + category.id.charCodeAt(i)) | 0;
  return FREEZER_ACCENTS[FREEZER_COLOR_KEYS[Math.abs(hash) % FREEZER_COLOR_KEYS.length]];
}

export function getFoodQuantitiesInFreezer(categories: FreezerCategory[]): Map<string, Map<string, number>> {
  const map = new Map<string, Map<string, number>>();
  for (const cat of categories) {
    for (const item of cat.items) {
      if (item.type === 'food' && item.foodId) {
        const unitMap = map.get(item.foodId) ?? new Map<string, number>();
        for (const bag of item.bags) {
          const qty = Number(bag.quantity) || 0;
          unitMap.set(bag.unit, (unitMap.get(bag.unit) ?? 0) + qty);
        }
        if (unitMap.size > 0) map.set(item.foodId, unitMap);
      }
    }
  }
  return map;
}
