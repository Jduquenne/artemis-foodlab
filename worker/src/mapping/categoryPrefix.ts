export const FOOD_CATEGORY_PREFIX: Record<string, string> = {
  "Boulangerie": "bo",
  "Charcuterie": "ch",
  "Conserve": "cn",
  "Conserves": "cn",
  "Fruit ou légume": "fv",
  "Fruits et légumes": "fv",
  "Fruit sec": "fs",
  "Viande": "vm",
  "Poisson": "po",
  "Produit laitier": "pl",
  "Produits laitiers": "pl",
  "Ferme": "fm",
  "Féculent": "fc",
  "Féculents": "fc",
  "Epicerie sucrée": "es",
  "Epices": "ep",
  "Epice": "ep",
  "Condiment": "cd",
  "Condiments": "cd",
  "Herbe aromatique": "ha",
  "Herbes aromatiques": "ha",
  "Surgelé": "su",
  "Surgelés": "su",
  "Hors achat": "ha",
  "Internet": "web",
};

export const FOOD_CATEGORY_CANONICAL: Record<string, string> = {
  "Conserve": "Conserves",
  "Fruit ou légume": "Fruits et légumes",
  "Fruit sec": "Fruits secs",
  "Produit laitier": "Produits laitiers",
  "Féculent": "Féculents",
  "Epice": "Epices",
  "Condiment": "Condiments",
  "Surgelé": "Surgelés",
};

export function canonicalFoodCategory(raw: string): string {
  const trimmed = raw.trim();
  return FOOD_CATEGORY_CANONICAL[trimmed] ?? trimmed;
}

export function foodCategoryPrefix(raw: string): string {
  const trimmed = raw.trim();
  return FOOD_CATEGORY_PREFIX[trimmed] ?? "xx";
}

export const RECIPE_ID_PREFIX_TO_CATEGORY: Record<string, string> = {
  as: "dry-food",
  base: "bases",
  char: "charcuterie",
  es: "sweet-grocery",
  fr: "fruits",
  pat: "pastries",
  pc: "cereal-products",
  pl: "dairy-products",
  poi: "fish",
  pv: "plant-proteins",
  vb: "white-meat",
  veg: "veggies",
  vr: "red-meat",
};

export const CATEGORY_TO_RECIPE_ID_PREFIX: Record<string, string> = Object.fromEntries(
  Object.entries(RECIPE_ID_PREFIX_TO_CATEGORY).map(([prefix, categoryId]) => [categoryId, prefix]),
);

export function categoryIdFromRecipeId(id: string): string {
  const prefix = id.split("-")[0] ?? "";
  return RECIPE_ID_PREFIX_TO_CATEGORY[prefix] ?? prefix;
}

export function canonicalizeRecipeId(displayId: string): { id: string; categoryId: string } {
  const [prefixRaw, numRaw] = displayId.split("_");
  const prefix = (prefixRaw ?? "").toLowerCase();
  const categoryId = RECIPE_ID_PREFIX_TO_CATEGORY[prefix] ?? prefix;
  const num = parseInt(numRaw ?? "", 10);
  const id = isNaN(num) ? displayId.toLowerCase() : `${prefix}-${String(num).padStart(3, "0")}`;
  return { id, categoryId };
}

export function displayRecipeId(canonicalId: string): string {
  const [prefix, num] = canonicalId.split("-");
  const parsed = parseInt(num ?? "", 10);
  return `${(prefix ?? "").toUpperCase()}_${isNaN(parsed) ? num ?? "" : String(parsed).padStart(2, "0")}`;
}
