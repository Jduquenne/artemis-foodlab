export interface OutdoorActivityInput {
  code: string;
  name: string;
  categoryId: string;
}

export interface FoodGroupInput {
  id: string;
  name: string;
}

export interface FoodInput {
  id: string;
  name: string;
  categoryId: string;
  unit: string | null;
  unitWeight: number | null;
  isFreezable: boolean;
  groupId: string | null;
  macros: { kcal: number; proteins: number; lipids: number; carbohydrates: number; fibers: number };
}
