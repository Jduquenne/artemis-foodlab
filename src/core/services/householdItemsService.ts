import { HouseholdItem } from "../domain/types";
import { db } from "./databaseService";

export const getAll = () => db.householdItems.toArray();

export const getAllAsRecord = async (): Promise<Record<string, HouseholdItem>> => {
  const rows = await db.householdItems.toArray();
  return Object.fromEntries(rows.map((row) => [row.id, row]));
};

export const bulkPut = async (records: Record<string, HouseholdItem>) => {
  const rows = Object.values(records);
  await db.transaction("rw", db.householdItems, async () => {
    await db.householdItems.clear();
    await db.householdItems.bulkPut(rows);
  });
};
