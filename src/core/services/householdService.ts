import { db } from "./databaseService";

export const getRecords = () => db.household.toArray();

export const toggleItem = async (id: string) => {
  const existing = await db.household.get(id);
  if (existing) {
    await db.household.delete(id);
  } else {
    await db.household.put({ id, lastCheckedAt: new Date().toISOString() });
  }
};

export const clearAll = () => db.household.clear();
