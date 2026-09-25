import { useCallback, useMemo } from "react";
import { Food } from "../../core/domain/ingredient";
import { FoodInput, createFood, deleteFood, updateFood } from "../../core/services/catalogueWriteService";
import { syncCatalogueFromApi } from "../../core/services/catalogueSyncService";
import { useFoodsSnapshot } from "./useCatalogueSnapshot";

export interface UseCatalogueFoodsResult {
  foods: Food[];
  create: (body: FoodInput) => Promise<boolean>;
  save: (id: string, body: FoodInput) => Promise<boolean>;
  remove: (id: string) => Promise<boolean>;
}

export function useCatalogueFoods(): UseCatalogueFoodsResult {
  const foodsDb = useFoodsSnapshot();
  const foods = useMemo(
    () => Object.values(foodsDb).sort((a, b) => a.name.localeCompare(b.name, "fr")),
    [foodsDb],
  );

  const create = useCallback(async (body: FoodInput) => {
    try {
      await createFood(body);
      await syncCatalogueFromApi();
      return true;
    } catch {
      return false;
    }
  }, []);

  const save = useCallback(async (id: string, body: FoodInput) => {
    try {
      await updateFood(id, body);
      await syncCatalogueFromApi();
      return true;
    } catch {
      return false;
    }
  }, []);

  const remove = useCallback(async (id: string) => {
    try {
      await deleteFood(id);
      await syncCatalogueFromApi();
      return true;
    } catch {
      return false;
    }
  }, []);

  return { foods, create, save, remove };
}
