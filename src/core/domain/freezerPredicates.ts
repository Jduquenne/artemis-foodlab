import { BatchFreezerItem, FoodFreezerItem, FreezerItem } from "./freezer";

export function isBatchItem(item: FreezerItem): item is BatchFreezerItem {
  return item.type === "batch";
}

export function isFoodItem(item: FreezerItem): item is FoodFreezerItem {
  return item.type === "food";
}

export function isPlannedBatch(item: FreezerItem): item is BatchFreezerItem {
  return isBatchItem(item) && item.linkedQuantity > 0;
}

export function isExhaustedBatch(item: FreezerItem): item is BatchFreezerItem {
  return isBatchItem(item) && item.quantity === 0 && item.linkedQuantity === 0;
}
