import Dexie, { Table } from "dexie";
import { getWeekNumber } from "../../shared/utils/weekUtils";
import { FreezerCategory } from "../domain/types";

export interface MealSlot {
  id: string;
  day: string;
  slot: "breakfast" | "lunch" | "snack" | "dinner";
  recipeIds: string[];
  year: number;
  week: number;
  persons?: number;
}

export interface HouseholdRecord {
  id: string;
  lastCheckedAt: string;
}

export class MyDatabase extends Dexie {
  planning!: Table<MealSlot>;
  household!: Table<HouseholdRecord>;
  freezerCategories!: Table<FreezerCategory>;

  constructor() {
    super("CipeDatabase");
    this.version(3).stores({
      recipes: "id, recipeId, type, categoryId, [recipeId+type]",
      planning: "id, day, slot, recipeId",
    });
    this.version(4)
      .stores({
        recipes: "id, recipeId, type, categoryId, [recipeId+type]",
        planning: "id, [year+week], year, week",
      })
      .upgrade(async (tx) => {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentWeek = getWeekNumber(now);
        return await tx
          .table("planning")
          .toCollection()
          .modify((item) => {
            if (!item.id.includes("-W")) {
              item.year = currentYear;
              item.week = currentWeek;
              item.id = `${currentYear}-W${currentWeek}-${item.id}`;
            }
          });
      });
    this.version(5)
      .stores({
        recipes: "id, recipeId, type, categoryId, [recipeId+type]",
        planning: "id, [year+week], year, week",
      })
      .upgrade(async (tx) => {
        return await tx
          .table("planning")
          .toCollection()
          .modify((item) => {
            if (item.recipeId !== undefined && !item.recipeIds) {
              item.recipeIds = [item.recipeId];
              delete item.recipeId;
            }
          });
      });
    this.version(6).stores({
      recipes: null,
      planning: "id, [year+week], year, week",
    });
    this.version(7).stores({
      planning: "id, [year+week], year, week",
      household: "id",
    });
    this.version(8).stores({
      planning: "id, [year+week], year, week",
      household: "id",
      freezerDrawers: "id, position",
    });
    this.version(9)
      .stores({
        planning: "id, [year+week], year, week",
        household: "id",
        freezerDrawers: null,
        freezerCategories: "id, position",
      })
      .upgrade(async (tx) => {
        const old = await tx.table("freezerDrawers").toArray();
        if (old.length > 0) {
          await tx.table("freezerCategories").bulkAdd(old);
        }
      });
    this.version(10)
      .stores({
        planning: "id, [year+week], year, week",
        household: "id",
        freezerCategories: "id, position",
      })
      .upgrade(async (tx) => {
        const categories = await tx.table("freezerCategories").toArray();
        const fallbackDate = new Date().toISOString().slice(0, 10);
        for (const cat of categories) {
          const updatedItems = (cat.items ?? []).map((item: Record<string, unknown>) => {
            if (item.type === "food" && !item.bags) {
              const { quantity, unit, addedDate, ...rest } = item;
              return {
                ...rest,
                bags: [{
                  id: crypto.randomUUID(),
                  quantity: quantity ?? "",
                  unit: unit ?? "",
                  addedDate: addedDate ?? fallbackDate,
                }],
              };
            }
            return item;
          });
          await tx.table("freezerCategories").update(cat.id, { items: updatedItems });
        }
      });
  }
}

export const db = new MyDatabase();
