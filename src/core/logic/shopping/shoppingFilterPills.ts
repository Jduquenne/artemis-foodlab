import { ShoppingLayout } from "../../domain/shopping";
import { PlaceFilter } from "./shoppingPlaceLogic";

export type ShoppingFilterKind = "place" | "layout";

export interface ShoppingFilterPillInfo {
  kind: ShoppingFilterKind;
  label: string;
  clearLabel: string;
}

export function shoppingFilterPills(
  placeFilter: PlaceFilter,
  placeName: string | null,
  layout: ShoppingLayout,
): ShoppingFilterPillInfo[] {
  const pills: ShoppingFilterPillInfo[] = [];
  if (placeFilter !== "all" && placeName) {
    pills.push({
      kind: "place",
      label: placeFilter === "place" ? `Seulement ${placeName}` : `Hors ${placeName}`,
      clearLabel: "Retirer le filtre de lieu",
    });
  }
  if (layout === "meals") {
    pills.push({ kind: "layout", label: "Par repas", clearLabel: "Revenir à l'affichage par rayon" });
  }
  return pills;
}
