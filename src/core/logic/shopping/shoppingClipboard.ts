import { HouseholdItem } from "../../domain/household";
import { IngredientGroup } from "../../domain/shopping";
import { formatQty, pluralizeUnit } from "../../../shared/utils/unitUtils";
import { isIngredientNeeded, remainingToBuy } from "./shoppingChecks";

export function buildShoppingClipboardText(
  allGroupedItems: IngredientGroup[],
  checked: Set<string>,
  stocks: Record<string, number>,
  sourceChecked: Set<string>,
  uncheckedHouseholdItems: HouseholdItem[],
): string {
  const fmtUnit = (unit: string, qty: number): string => {
    if (unit === 'pièce') return '';
    if (unit === 'tranche') return 'tr';
    return pluralizeUnit(unit, qty);
  };

  const lines: string[] = [];

  for (const group of allGroupedItems) {
    const items = group.list.filter((i) => isIngredientNeeded(i, checked, stocks, sourceChecked));

    if (items.length === 0) continue;

    const itemParts = items.map((item) => {
      const needed = remainingToBuy(item, stocks, sourceChecked);

      let part = item.name;
      if (item.preparation) part += ` (${item.preparation})`;
      if (item.totalQuantity > 0) part += ` ${formatQty(needed)}${fmtUnit(item.unit, needed)}`;
      return part;
    });

    lines.push(group.label);
    lines.push(itemParts.join(" - "));
    lines.push("");
  }

  if (uncheckedHouseholdItems.length > 0) {
    lines.push(uncheckedHouseholdItems.map((item) => item.name).join(" - "));
    lines.push("");
  }

  return lines.join("\n").trim();
}
