import { Food } from "../domain/types";
import { db } from "./databaseService";

export const getAll = () => db.foods.toArray();

export const getAllAsRecord = async (): Promise<Record<string, Food>> => {
  const rows = await db.foods.toArray();
  return Object.fromEntries(rows.map((row) => [row.id, row]));
};

export const bulkPut = async (records: Record<string, Food>) => {
  const rows = Object.entries(records).map(([id, food]) => ({ ...food, id }));
  await db.transaction("rw", db.foods, async () => {
    await db.foods.clear();
    await db.foods.bulkPut(rows);
  });
};

export const put = (id: string, food: Food) => db.foods.put({ ...food, id });

export const remove = (id: string) => db.foods.delete(id);
