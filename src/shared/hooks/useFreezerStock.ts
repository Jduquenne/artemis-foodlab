import { useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../core/services/databaseService';
import { getBatchRecipeIdsInFreezer, getFoodIdsInFreezer, getFoodBagsInFreezer } from '../../core/utils/freezerMatchUtils';

export function useFreezerStock() {
  const categoriesRaw = useLiveQuery(() => db.freezerCategories.orderBy('position').toArray());
  const categories = useMemo(() => categoriesRaw ?? [], [categoriesRaw]);

  const batchRecipeIds = useMemo(() => getBatchRecipeIdsInFreezer(categories), [categories]);
  const foodIds = useMemo(() => getFoodIdsInFreezer(categories), [categories]);
  const foodBags = useMemo(() => getFoodBagsInFreezer(categories), [categories]);

  return { batchRecipeIds, foodIds, foodBags };
}
