import { BootstrapResult } from "../../core/services/bootstrapService";
import { useJournalStore } from "../store/useJournalStore";
import { useMenuStore } from "../store/useMenuStore";
import { useProfileStore } from "../store/useProfileStore";
import { useCustomShoppingCategoryStore } from "../store/useCustomShoppingCategoryStore";
import { useAccompanimentStore } from "../store/useAccompanimentStore";

interface AppliedSignatures {
  profiles: string;
  overrides: string;
  period: string;
  customCategories: string;
  accompaniments: string;
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
  applied = next;
}
