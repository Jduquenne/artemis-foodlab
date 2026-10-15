import { useCallback, useMemo } from "react";
import { FoodGroup } from "../../core/domain/foodGroup";
import { FoodGroupInput } from "../../core/domain/catalogueInput";
import { createFoodGroup, deleteFoodGroup, updateFoodGroup } from "../../core/services/catalogueWriteService";
import { syncCatalogueFromApi } from "../../core/services/catalogueSyncService";
import { useFoodGroupsSnapshot } from "./useCatalogueSnapshot";
import { compareByName } from "../../core/utils/sortUtils";

export interface UseCatalogueFoodGroupsResult {
  groups: FoodGroup[];
  create: (body: FoodGroupInput) => Promise<boolean>;
  rename: (id: string, name: string) => Promise<boolean>;
  remove: (id: string) => Promise<boolean>;
}

export function useCatalogueFoodGroups(): UseCatalogueFoodGroupsResult {
  const snapshot = useFoodGroupsSnapshot();
  const groups = useMemo(() => [...snapshot].sort(compareByName), [snapshot]);

  const create = useCallback(async (body: FoodGroupInput) => {
    try {
      await createFoodGroup(body);
      await syncCatalogueFromApi().catch(() => undefined);
      return true;
    } catch {
      return false;
    }
  }, []);

  const rename = useCallback(async (id: string, name: string) => {
    try {
      await updateFoodGroup(id, name);
      await syncCatalogueFromApi().catch(() => undefined);
      return true;
    } catch {
      return false;
    }
  }, []);

  const remove = useCallback(async (id: string) => {
    try {
      await deleteFoodGroup(id);
      await syncCatalogueFromApi().catch(() => undefined);
      return true;
    } catch {
      return false;
    }
  }, []);

  return { groups, create, rename, remove };
}
