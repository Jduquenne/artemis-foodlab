import { useCallback, useState } from "react";
import { OutdoorEntry } from "../../core/domain/types";
import { typedOutdoorDb } from "../../core/typed-db/typedOutdoorDb";
import {
  OutdoorActivityInput,
  createOutdoorActivity,
  deleteOutdoorActivity,
  updateOutdoorActivity,
} from "../../core/services/catalogueWriteService";
import { syncCatalogueFromApi } from "../../core/services/catalogueSyncService";

export interface UseCatalogueOutdoorResult {
  activities: OutdoorEntry[];
  create: (body: OutdoorActivityInput) => Promise<boolean>;
  save: (uuid: string, body: OutdoorActivityInput) => Promise<boolean>;
  remove: (code: string) => Promise<boolean>;
}

function snapshot(): OutdoorEntry[] {
  return Object.values(typedOutdoorDb).sort((a, b) => a.name.localeCompare(b.name, "fr"));
}

export function useCatalogueOutdoor(): UseCatalogueOutdoorResult {
  const [activities, setActivities] = useState<OutdoorEntry[]>(snapshot);

  const create = useCallback(async (body: OutdoorActivityInput) => {
    try {
      await createOutdoorActivity(body);
      await syncCatalogueFromApi();
      setActivities(snapshot());
      return true;
    } catch {
      return false;
    }
  }, []);

  const save = useCallback(async (uuid: string, body: OutdoorActivityInput) => {
    try {
      await updateOutdoorActivity(uuid, body);
      await syncCatalogueFromApi();
      setActivities(snapshot());
      return true;
    } catch {
      return false;
    }
  }, []);

  const remove = useCallback(async (code: string) => {
    const target = typedOutdoorDb[code];
    if (!target?.apiId) return false;
    try {
      await deleteOutdoorActivity(target.apiId);
      await syncCatalogueFromApi();
      setActivities(snapshot());
      return true;
    } catch {
      return false;
    }
  }, []);

  return { activities, create, save, remove };
}
