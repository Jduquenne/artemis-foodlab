export interface ApiShoppingDay {
  id: string;
  year: number;
  week: number;
  day: string;
}

export interface ApiShoppingPeriod {
  id: string;
  days?: ApiShoppingDay[];
}

export interface ApiItemCheck {
  id: string;
  foodId: string | null;
  householdItemId: string | null;
  isChecked: boolean;
  stockOverride: number | null;
  freezerBagIds: string[];
  stock: number;
}

export interface ApiSourceCheck {
  id: string;
  foodId: string;
  recipeId: string;
  day: string;
  slot: string;
  isChecked: boolean;
}

export interface ApiShoppingExtra {
  id: string;
  name: string;
  quantity: number | null;
  unit: string | null;
  categoryId: string | null;
  foodId: string | null;
  recipeId: string | null;
  isChecked: boolean;
  createdAt: string;
}
