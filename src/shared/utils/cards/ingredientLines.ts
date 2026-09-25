import { IngredientCategory, Unit } from "../../../core/domain/ingredient";
import { DraftIngredient } from "../../../core/domain/recipeBuilderTypes";
import { groupBy } from "../collectionUtils";
import { IngredientLineItem } from "./cardTypes";
import { wrapLineAtMaxChars } from "./cardUtils";

const CARD_CATEGORY_ORDER: IngredientCategory[] = [
  IngredientCategory.RECIPE,
  IngredientCategory.MEAT,
  IngredientCategory.FISH,
  IngredientCategory.DELI,
  IngredientCategory.STARCH,
  IngredientCategory.FRUIT_VEGETABLE,
  IngredientCategory.DRIED_FRUIT,
  IngredientCategory.DAIRY,
  IngredientCategory.FARM,
  IngredientCategory.CANNED,
  IngredientCategory.SWEET_GROCERY,
  IngredientCategory.CONDIMENT,
  IngredientCategory.SPICE,
  IngredientCategory.AROMATIC_HERB,
  IngredientCategory.BAKERY,
  IngredientCategory.NON_PURCHASE,
  IngredientCategory.FROZEN,
  IngredientCategory.INTERNET,
  IngredientCategory.UNKNOWN,
];

const EPICERIE_CATEGORIES = new Set<IngredientCategory>([
  IngredientCategory.CANNED,
  IngredientCategory.SWEET_GROCERY,
  IngredientCategory.BAKERY,
]);

const COMMA_JOIN_CATEGORIES = new Set<IngredientCategory>([
  IngredientCategory.CONDIMENT,
  IngredientCategory.SPICE,
  IngredientCategory.AROMATIC_HERB,
]);

const CARD_LINE_MAX_CHARS = 45;

const WORD_UNITS = new Set<Unit>([
  Unit.FEUILLE,
  Unit.PORTION,
  Unit.TRANCHE,
  Unit.SACHET,
]);

function formatUnitSuffix(quantity: number, unit: Unit): string {
  if (unit === Unit.NONE || unit === Unit.PIECE) return "";
  if (WORD_UNITS.has(unit)) return ` ${unit}${quantity > 1 ? "s" : ""}`;
  return unit;
}

function formatIngredientText(ing: DraftIngredient): string {
  const prep = ing.preparation ? ` (${ing.preparation})` : "";
  const name = `${ing.name}${prep}`;
  if (ing.quantity == null) return name;
  return `${name} - ${ing.quantity}${formatUnitSuffix(ing.quantity, ing.unit)}`;
}

function extractBaseLabel(baseId: string | undefined): string | undefined {
  if (!baseId) return undefined;
  const num = parseInt(baseId.replace(/^base-0*/, ""), 10);
  return Number.isNaN(num) ? undefined : `B${num}`;
}

function wrapJoined(items: string[], maxChars: number, sep: string): string[] {
  const lines: string[] = [];
  let current = "";
  for (const item of items) {
    if (!current) {
      current = item;
    } else {
      const candidate = `${current}${sep}${item}`;
      if (candidate.length > maxChars) {
        lines.push(current);
        current = item;
      } else {
        current = candidate;
      }
    }
  }
  if (current) lines.push(current);
  return lines;
}

function formatPlainName(ing: DraftIngredient): string {
  const prep = ing.preparation ? ` (${ing.preparation})` : "";
  return `${ing.name}${prep}`;
}

function buildCategoryLines(withQuantity: DraftIngredient[], withoutQuantity: string[]): IngredientLineItem[] {
  const lines: IngredientLineItem[] = [];
  for (const ing of withQuantity) {
    wrapLineAtMaxChars(formatIngredientText(ing), CARD_LINE_MAX_CHARS).forEach((text, index) => {
      lines.push({
        text,
        isNewCategory: false,
        baseLabel: index === 0 ? extractBaseLabel(ing.baseId) : undefined,
      });
    });
  }
  for (const text of withoutQuantity) {
    lines.push({ text, isNewCategory: false });
  }
  return lines;
}

function layoutCategory(
  category: IngredientCategory,
  items: DraftIngredient[],
): IngredientLineItem[] {
  if (EPICERIE_CATEGORIES.has(category)) {
    const withQuantity = items.filter((i) => i.quantity != null);
    const names = items.filter((i) => i.quantity == null).map(formatPlainName);
    return buildCategoryLines(withQuantity, wrapJoined(names, CARD_LINE_MAX_CHARS, ", "));
  }
  if (COMMA_JOIN_CATEGORIES.has(category)) {
    const withQuantity = items.filter((i) => i.quantity != null);
    const names = items.filter((i) => i.quantity == null).map(formatPlainName);
    return buildCategoryLines(withQuantity, wrapJoined(names, CARD_LINE_MAX_CHARS, " - "));
  }
  return buildCategoryLines(items, []);
}

export function formatIngredientsForIngredientCard(ingredients: DraftIngredient[]): IngredientLineItem[] {
  const groups = groupBy(
    ingredients.filter((ing) => ing.name.trim()),
    (ing) => ing.category,
  );
  const epicerieItems = [...EPICERIE_CATEGORIES].flatMap((cat) => groups.get(cat) ?? []);

  const result: IngredientLineItem[] = [];
  let epicerieDone = false;

  for (const category of CARD_CATEGORY_ORDER) {
    let items: DraftIngredient[] | undefined;
    if (EPICERIE_CATEGORIES.has(category)) {
      if (epicerieDone) continue;
      epicerieDone = true;
      items = epicerieItems;
    } else {
      items = groups.get(category);
    }
    if (!items || items.length === 0) continue;

    layoutCategory(category, items).forEach((line, index) => {
      result.push({ ...line, isNewCategory: result.length > 0 && index === 0 });
    });
  }

  return result;
}
