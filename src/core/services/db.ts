import Dexie, { Table } from "dexie";
import { getWeekNumber } from "../../shared/utils/weekUtils";

export interface RecipeEntry {
  id?: string;
  recipeId: string;
  name: string;
  type: string;
  url: string;
  categoryId: string;
  ingredients: string[];
}

export interface MealSlot {
  id: string;
  day: string;
  slot: "breakfast" | "lunch" | "snack" | "dinner";
  recipeIds: string[];
  year: number;
  week: number;
}

export class MyDatabase extends Dexie {
  recipes!: Table<RecipeEntry>;
  planning!: Table<MealSlot>;

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
  }
}

export const db = new MyDatabase();
