export type AccompanimentOptionKind = "recipe" | "food";

export interface AccompanimentRecipeOption {
  id: string;
  kind: "recipe";
  recipeCode: string;
  portionsPerPerson: number;
}

export interface AccompanimentFoodOption {
  id: string;
  kind: "food";
  foodId: string;
  quantityPerPerson: number;
  unit: string;
}

export type AccompanimentOption = AccompanimentRecipeOption | AccompanimentFoodOption;

export interface Accompaniment {
  id: string;
  name: string;
  recipeCodes: string[];
  options: AccompanimentOption[];
  defaultOptionId: string | null;
}

export interface AccompanimentDefault {
  accompanimentId: string;
  optionId: string | null;
}

export type AccompanimentSelection = { kind: "default" } | { kind: "none" } | { kind: "option"; optionId: string };

export interface AccompanimentChoice {
  accompanimentId: string;
  profileId: string;
  optionId: string | null;
}

export type AccompanimentOptionInput = { id?: string; isDefault: boolean } & (
  | Omit<AccompanimentRecipeOption, "id">
  | Omit<AccompanimentFoodOption, "id">
);

export interface AccompanimentInput {
  name: string;
  recipeCodes: string[];
  options: AccompanimentOptionInput[];
}

export type AccompanimentSource = "meal" | "profile" | "accompaniment";

export interface ResolvedAccompaniment {
  option: AccompanimentOption | null;
  source: AccompanimentSource;
}
