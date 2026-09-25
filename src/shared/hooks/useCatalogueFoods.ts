import { useCallback, useMemo } from "react";
import { Food } from "../../core/domain/ingredient";
import { createFood, deleteFood, updateFood } from "../../core/services/catalogueWriteService";
import { FoodInput } from "../../core/domain/catalogueInput";
import { syncCatalogueFromApi } from "../../core/services/catalogueSyncService";
import { useFoodsSnapshot } from "./useCatalogueSnapshot";
import { compareByName } from "../utils/sortUtils";

export interface UseCatalogueFoodsResult {
  foods: Food[];
  create: (body: FoodInput) => Promise<boolean>;
  save: (id: string, body: FoodInput) => Promise<boolean>;
  remove: (id: string) => Promise<boolean>;
}

export function useCatalogueFoods(): UseCatalogueFoodsResult {
  const foodsDb = useFoodsSnapshot();
  const foods = useMemo(
    () => Object.values(foodsDb).sort(compareByName),
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
