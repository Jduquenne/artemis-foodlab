import { create } from "zustand";
import { FoodCooking, FoodCookingInput } from "../../core/domain/cooking";
import { saveFoodCookings } from "../../core/services/cookingService";

interface FoodCookingState {
  cookings: FoodCooking[];
  replaceCookings: (cookings: FoodCooking[]) => void;
  saveFoodCookings: (foodId: string, cookings: FoodCookingInput[]) => Promise<FoodCooking[]>;
}

export const useFoodCookingStore = create<FoodCookingState>((set, get) => ({
  cookings: [],
  replaceCookings: (cookings) => set({ cookings }),
  saveFoodCookings: async (foodId, cookings) => {
    const saved = await saveFoodCookings(foodId, cookings);
    set({ cookings: [...get().cookings.filter((c) => c.foodId !== foodId), ...saved] });
    return saved;
  },
}));
