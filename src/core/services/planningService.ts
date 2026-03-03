import { db } from "./databaseService";
import { MealSlot } from "../domain/types";

export type { MealSlot };

export const getWeekSlots = (year: number, week: number) =>
  db.planning.where("[year+week]").equals([year, week]).toArray();

export const getAllSlots = () => db.planning.toArray();

export const saveSlot = (slot: MealSlot) => db.planning.put(slot);

export const bulkSaveSlots = (slots: MealSlot[]) => db.planning.bulkPut(slots);

export const deleteSlot = (id: string) => db.planning.delete(id);
