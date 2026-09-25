import { FreezerItem } from "../../domain/freezer";
import { compareText } from "../../../shared/utils/sortUtils";

function getFreezerItemName(item: FreezerItem): string {
  return item.type === 'batch' ? item.recipeName : item.name;
}

export function sortFreezerItemsAlphabetically(items: FreezerItem[]): FreezerItem[] {
  return [...items].sort((a, b) => compareText(getFreezerItemName(a), getFreezerItemName(b)));
}

export function distributeFreezerItemsToColumns(items: FreezerItem[], colCount: number): FreezerItem[][] {
  const sorted = sortFreezerItemsAlphabetically(items);
  if (colCount <= 1) return [sorted];
  const perCol = Math.ceil(sorted.length / colCount);
  return Array.from({ length: colCount }, (_, i) => sorted.slice(i * perCol, (i + 1) * perCol));
}
