import { useCallback, useMemo } from "react";
import { OutdoorEntry } from "../../core/domain/recipe";
import { createOutdoorActivity, deleteOutdoorActivity, updateOutdoorActivity } from "../../core/services/catalogueWriteService";
import { OutdoorActivityInput } from "../../core/domain/catalogueInput";
import { syncCatalogueFromApi } from "../../core/services/catalogueSyncService";
import { useOutdoorSnapshot } from "./useCatalogueSnapshot";
import { compareByName } from "../utils/sortUtils";

export interface UseCatalogueOutdoorResult {
  activities: OutdoorEntry[];
  create: (body: OutdoorActivityInput) => Promise<boolean>;
  save: (uuid: string, body: OutdoorActivityInput) => Promise<boolean>;
  remove: (code: string) => Promise<boolean>;
}

export function useCatalogueOutdoor(): UseCatalogueOutdoorResult {
  const outdoorDb = useOutdoorSnapshot();
  const activities = useMemo(
    () => Object.values(outdoorDb).sort(compareByName),
    [outdoorDb],
  );

  const create = useCallback(async (body: OutdoorActivityInput) => {
    try {
      await createOutdoorActivity(body);
      await syncCatalogueFromApi();
      return true;
    } catch {
      return false;
    }
  }, []);

  const save = useCallback(async (uuid: string, body: OutdoorActivityInput) => {
    try {
      await updateOutdoorActivity(uuid, body);
      await syncCatalogueFromApi();
      return true;
    } catch {
      return false;
    }
  }, []);

  const remove = useCallback(async (code: string) => {
    const target = outdoorDb[code];
    if (!target?.apiId) return false;
    try {
      await deleteOutdoorActivity(target.apiId);
      await syncCatalogueFromApi();
      return true;
    } catch {
      return false;
    }
  }, [outdoorDb]);

  return { activities, create, save, remove };
}
