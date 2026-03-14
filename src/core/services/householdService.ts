import { db } from "./databaseService";

export const getRecords = () => db.household.toArray();

export const checkItem = (id: string) =>
  db.household.put({ id, lastCheckedAt: new Date().toISOString() });

export const uncheckItem = (id: string) => db.household.delete(id);

export const clearAll = () => db.household.clear();
