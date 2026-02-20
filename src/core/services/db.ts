import Dexie, { Table } from "dexie";

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
  id: string; // Format: "2024-W08-monday-lunch" (Année-Semaine-Jour-Créneau)
  day: string; // monday, tuesday...
  slot: "breakfast" | "lunch" | "snack" | "dinner";
  recipeId: string; // Lien vers la recette sélectionnée
  date: string; // Pour filtrer par semaine plus tard
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
  }
}

export const db = new MyDatabase();
