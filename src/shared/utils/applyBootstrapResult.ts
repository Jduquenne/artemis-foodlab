import { BootstrapResult } from "../../core/services/bootstrapService";
import { useJournalStore } from "../store/useJournalStore";
import { useMenuStore } from "../store/useMenuStore";
import { useProfileStore } from "../store/useProfileStore";

interface AppliedSignatures {
  profiles: string;
  overrides: string;
  period: string;
}

let applied: AppliedSignatures | null = null;

export function applyBootstrapResult(result: BootstrapResult): void {
  const period = { id: result.shoppingPeriod?.id ?? null, days: result.shoppingPeriod?.days ?? [] };
  const next: AppliedSignatures = {
    profiles: JSON.stringify(result.profiles),
    overrides: JSON.stringify(result.journalOverrides),
    period: JSON.stringify(period),
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
  applied = next;
}
