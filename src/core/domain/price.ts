export interface PriceStore {
  id: string;
  name: string;
  city: string;
  createdAt: string;
}

export interface PriceStoreInput {
  name: string;
  city: string;
}

export interface FoodPrice {
  id: string;
  foodId: string;
  storeId: string;
  pricePerKg: number;
  recordedAt: string;
}

export interface FoodPriceEntry extends FoodPrice {
  paidTotal: number | null;
  purchasedGrams: number | null;
  recordedByUserId: string | null;
}

export interface FoodPriceInput {
  foodId: string;
  storeId: string;
  pricePerKg: number;
  paidTotal?: number;
  purchasedGrams?: number;
}

export const MAX_PRICE_STORE_TEXT = 80;
