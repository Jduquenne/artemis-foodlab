export type AccompanimentOptionKind = "recipe" | "food";

export interface AccompanimentOption {
  id: string;
  kind: AccompanimentOptionKind;
  recipeCode: string | null;
  portionsPerPerson: number | null;
  foodId: string | null;
  quantityPerPerson: number | null;
  unit: string | null;
}

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

export interface AccompanimentChoice {
  accompanimentId: string;
  profileId: string;
  optionId: string | null;
}

export interface AccompanimentOptionInput {
  id?: string;
  kind: AccompanimentOptionKind;
  recipeCode: string | null;
  portionsPerPerson: number | null;
  foodId: string | null;
  quantityPerPerson: number | null;
  unit: string | null;
  isDefault: boolean;
}

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
