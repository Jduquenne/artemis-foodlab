import { BatchFreezerItem, FoodFreezerItem, FreezerBag, FreezerCategory, FreezerItem, Preparation, Unit } from "../../domain/types";
import { getCodeById } from "../../typed-db/recipeIdMap";

export interface ApiFreezerBag {
  id: string;
  quantity: number;
  unit: string;
  preparation: string | null;
  addedDate: string;
}

export interface ApiFreezerFoodDetail {
  foodId: string | null;
  name: string;
  bags: ApiFreezerBag[];
}

export interface ApiFreezerBatchDetail {
  recipeId: string;
  recipeName: string;
  portions: number;
  addedDate: string;
}

export interface ApiFreezerItem {
  id: string;
  type: "food" | "batch";
  position: number;
  food?: ApiFreezerFoodDetail;
  batch?: ApiFreezerBatchDetail;
}

export interface ApiFreezerCategory {
  id: string;
  name: string;
  position: number;
  items: ApiFreezerItem[];
}

export function mapApiBag(bag: ApiFreezerBag): FreezerBag {
  return {
    id: bag.id,
    quantity: bag.quantity,
    unit: bag.unit as Unit,
    preparation: (bag.preparation ?? undefined) as Preparation | undefined,
    addedDate: bag.addedDate.slice(0, 10),
  };
}

function mapApiItem(item: ApiFreezerItem): FreezerItem {
  if (item.type === "batch" && item.batch) {
    const batch: BatchFreezerItem = {
      id: item.id,
      type: "batch",
      recipeId: getCodeById(item.batch.recipeId) ?? item.batch.recipeId,
      recipeName: item.batch.recipeName,
      portions: item.batch.portions,
      addedDate: item.batch.addedDate.slice(0, 10),
    };
    return batch;
  }
  const food: FoodFreezerItem = {
    id: item.id,
    type: "food",
    name: item.food?.name ?? "",
    foodId: item.food?.foodId ?? undefined,
    bags: (item.food?.bags ?? []).map(mapApiBag),
  };
  return food;
}

export function mapApiFreezerCategory(api: ApiFreezerCategory): FreezerCategory {
  return {
    id: api.id,
    name: api.name,
    position: api.position,
    items: [...api.items].sort((a, b) => a.position - b.position).map(mapApiItem),
  };
}
