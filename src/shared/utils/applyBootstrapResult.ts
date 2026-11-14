import { BootstrapResult } from "../../core/services/bootstrapService";
import { useJournalStore } from "../store/useJournalStore";
import { useMenuStore } from "../store/useMenuStore";
import { useProfileStore } from "../store/useProfileStore";
import { useCustomShoppingCategoryStore } from "../store/useCustomShoppingCategoryStore";
import { useAccompanimentStore } from "../store/useAccompanimentStore";
import { usePriceStore } from "../store/usePriceStore";

interface AppliedSignatures {
  profiles: string;
  overrides: string;
  period: string;
  customCategories: string;
  accompaniments: string;
  prices: string;
}

let applied: AppliedSignatures | null = null;

export function applyBootstrapResult(result: BootstrapResult): void {
  const period = { id: result.shoppingPeriod?.id ?? null, days: result.shoppingPeriod?.days ?? [] };
  const next: AppliedSignatures = {
    profiles: JSON.stringify(result.profiles),
    overrides: JSON.stringify(result.journalOverrides),
    period: JSON.stringify(period),
    customCategories: JSON.stringify(result.customShoppingCategories),
    accompaniments: JSON.stringify(result.accompaniments),
    prices: JSON.stringify([result.priceStores, result.foodPrices]),
  };
  if (applied === null || applied.profiles !== next.profiles) {
    useProfileStore.getState().replaceProfiles(result.profiles);
  }
  if (applied === null || applied.overrides !== next.overrides) {
    useJournalStore.getState().replaceOverrides(result.journalOverrides);
  }
  if (applied === null || applied.period !== next.period) {
    useMenuStore.getState().replaceShoppingPeriod(period);
  }
  if (applied === null || applied.customCategories !== next.customCategories) {
    useCustomShoppingCategoryStore.getState().replaceCategories(result.customShoppingCategories);
  }
  if (applied === null || applied.accompaniments !== next.accompaniments) {
    useAccompanimentStore.getState().replaceAccompaniments(result.accompaniments);
  }
  if (applied === null || applied.prices !== next.prices) {
    usePriceStore.getState().replacePrices(result.priceStores, result.foodPrices);
  }
  applied = next;
}
