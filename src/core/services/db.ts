import Dexie, { Table } from "dexie";
import { getWeekNumber } from "../../shared/utils/dateUtils";

export interface RecipeEntry {
  id?: string;
  recipeId: string;
  name: string;
  type: string; // 'photo' | 'ingredients' | 'recipes'
  url: string;
  categoryId: string;
  ingredients: string[];
}

export interface MealSlot {
  id: string;
  day: string;
  slot: "breakfast" | "lunch" | "snack" | "dinner";
  recipeId: string;
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
    // Update the DB version to 4 and add any new stores or indexes if needed
    this.version(4)
      .stores({
        recipes: "id, recipeId, type, categoryId, [recipeId+type]",
        planning: "id, [year+week], year, week",
      })
      .upgrade(async (tx) => {
        // Migration des anciennes données (v3 -> v4)
        // On part du principe que les anciens repas appartiennent à la semaine actuelle
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentWeek = getWeekNumber(now); // On va créer cette fonction

        return await tx
          .table("planning")
          .toCollection()
          .modify((item) => {
            if (!item.id.includes("-W")) {
              const oldId = item.id; // ex: "Lun-lunch"
              item.year = currentYear;
              item.week = currentWeek;
              item.id = `${currentYear}-W${currentWeek}-${oldId}`;
            }
          });
      });
  }
}

export const db = new MyDatabase();
