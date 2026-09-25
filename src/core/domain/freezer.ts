import { Unit } from "./ingredient";

export interface FreezerBag {
  id: string;
  quantity: number;
  unit: Unit;
  preparation?: string;
  addedDate: string;
}

export interface FoodFreezerItem {
  id: string;
  type: "food";
  name: string;
  foodId?: string;
  bags: FreezerBag[];
}

export interface BatchFreezerItem {
  id: string;
  type: "batch";
  recipeId: string;
  recipeName: string;
  portions: number;
  addedDate: string;
}

export type FreezerItem = FoodFreezerItem | BatchFreezerItem;

export interface FreezerCategory {
  id: string;
  name: string;
  color: string | null;
  position: number;
  items: FreezerItem[];
}
