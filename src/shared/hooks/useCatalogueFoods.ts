import { useCallback, useState } from "react";
import { Food } from "../../core/domain/types";
import { typedFoodDb } from "../../core/typed-db/typedFoodDb";
import { FoodInput, deleteFood, updateFood } from "../../core/services/catalogueWriteService";
import { syncCatalogueFromApi } from "../../core/services/catalogueSyncService";

export interface UseCatalogueFoodsResult {
  foods: Food[];
  save: (id: string, body: FoodInput) => Promise<boolean>;
  remove: (id: string) => Promise<boolean>;
}

function snapshot(): Food[] {
  return Object.values(typedFoodDb).sort((a, b) => a.name.localeCompare(b.name, "fr"));
}

export function useCatalogueFoods(): UseCatalogueFoodsResult {
  const [foods, setFoods] = useState<Food[]>(snapshot);

  const save = useCallback(async (id: string, body: FoodInput) => {
    try {
      await updateFood(id, body);
      await syncCatalogueFromApi();
      setFoods(snapshot());
      return true;
    } catch {
      return false;
    }
  }, []);

  const remove = useCallback(async (id: string) => {
    try {
      await deleteFood(id);
      await syncCatalogueFromApi();
      setFoods(snapshot());
      return true;
    } catch {
      return false;
    }
  }, []);

  return { foods, save, remove };
}
