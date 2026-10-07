import { db } from "./databaseService";
import { apiFetch } from "./apiClient";

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
  const results = await Promise.allSettled(
    records.map(r => apiFetch(`/household-shopping-flags/${r.id}`, { method: "DELETE" })),
  );
  await db.household.bulkDelete(records.filter((_, i) => results[i].status === "fulfilled").map(r => r.id));
  const failure = results.find((r): r is PromiseRejectedResult => r.status === "rejected");
  if (failure) throw failure.reason;
};

export async function applyHouseholdFlags(mapped: { id: string; lastCheckedAt: string }[]): Promise<void> {
  await db.transaction("rw", db.household, async () => {
    await db.household.clear();
    await db.household.bulkPut(mapped);
  });
}
