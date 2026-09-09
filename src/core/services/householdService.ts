import { db } from "./databaseService";
import { apiFetch, apiFetchJson } from "./apiClient";

interface ApiHouseholdShoppingFlag {
  itemId: string;
  createdAt: string;
}

export const getRecords = () => db.household.toArray();

export const toggleItem = async (id: string) => {
  const existing = await db.household.get(id);
  if (existing) {
    await apiFetch(`/household-shopping-flags/${id}`, { method: "DELETE" });
    await db.household.delete(id);
  } else {
    await apiFetch(`/household-shopping-flags/${id}`, { method: "PUT" });
    await db.household.put({ id, lastCheckedAt: new Date().toISOString() });
  }
};

export const clearAll = async () => {
  const records = await db.household.toArray();
  await Promise.all(records.map(r => apiFetch(`/household-shopping-flags/${r.id}`, { method: "DELETE" })));
  await db.household.clear();
};

export async function syncHouseholdFlagsFromApi(): Promise<void> {
  try {
    const flags = await apiFetchJson<ApiHouseholdShoppingFlag[]>("/household-shopping-flags");
    const mapped = flags.map(f => ({ id: f.itemId, lastCheckedAt: f.createdAt }));
    await db.transaction("rw", db.household, async () => {
      await db.household.clear();
      await db.household.bulkPut(mapped);
    });
  } catch {
    /* réseau indisponible ou API injoignable, on garde le cache existant */
  }
}
