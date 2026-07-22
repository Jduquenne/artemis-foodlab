import { OutdoorEntry } from "../domain/types";
import { db } from "./databaseService";

export const getAll = () => db.outdoorActivities.toArray();

export const getAllAsRecord = async (): Promise<Record<string, OutdoorEntry>> => {
  const rows = await db.outdoorActivities.toArray();
  return Object.fromEntries(rows.map((row) => [row.code, row]));
};

export const bulkPut = async (records: Record<string, OutdoorEntry>) => {
  const rows = Object.entries(records).map(([code, entry]) => ({ ...entry, id: code }));
  await db.transaction("rw", db.outdoorActivities, async () => {
    await db.outdoorActivities.clear();
    await db.outdoorActivities.bulkPut(rows);
  });
};
