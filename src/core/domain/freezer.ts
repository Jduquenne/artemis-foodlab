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

export type BatchUnit = "portion" | "g";

export interface BatchFreezerItem {
  id: string;
  type: "batch";
  recipeId: string;
  recipeName: string;
  unit: BatchUnit;
  quantity: number;
  linkedQuantity: number;
  addedDate: string;
}

export type NewBatchFreezerItem = Omit<BatchFreezerItem, "id" | "addedDate" | "linkedQuantity">;

export type FreezerItem = FoodFreezerItem | BatchFreezerItem;

export interface FreezerCategory {
  id: string;
  name: string;
  color: string | null;
  position: number;
  items: FreezerItem[];
}
