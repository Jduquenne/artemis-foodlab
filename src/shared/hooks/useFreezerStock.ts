import { useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { getCategories } from '../../core/services/freezerService';
import { getBatchRecipeIdsInFreezer, getFoodIdsInFreezer, getFoodBagsInFreezer } from '../../core/logic/freezer/freezerStockLogic';

export function useFreezerStock() {
  const categoriesRaw = useLiveQuery(() => getCategories(), []);
  const categories = useMemo(() => categoriesRaw ?? [], [categoriesRaw]);

  const batchRecipeIds = useMemo(() => getBatchRecipeIdsInFreezer(categories), [categories]);
  const foodIds = useMemo(() => getFoodIdsInFreezer(categories), [categories]);
  const foodBags = useMemo(() => getFoodBagsInFreezer(categories), [categories]);

  return { batchRecipeIds, foodIds, foodBags };
}
