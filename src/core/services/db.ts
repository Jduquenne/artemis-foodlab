import Dexie, { Table } from "dexie";
import { getWeekNumber } from "../../shared/utils/weekUtils";

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
  }
}

export const db = new MyDatabase();
