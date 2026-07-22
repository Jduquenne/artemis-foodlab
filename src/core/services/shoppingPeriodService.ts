import { apiFetch, apiFetchJson } from "./apiClient";
import { ShoppingDay } from "../domain/types";
import { ApiItemCheck, ApiShoppingDay, ApiShoppingPeriod, ApiSourceCheck } from "../logic/shopping/shoppingApiMapper";

export interface CurrentPeriod {
  id: string;
  days: ShoppingDay[];
}

export const fetchDays = (periodId: string) =>
  apiFetchJson<ApiShoppingDay[]>(`/shopping-periods/${periodId}/days`);

export async function fetchCurrentPeriod(): Promise<CurrentPeriod | null> {
  const period = await apiFetchJson<ApiShoppingPeriod | null>("/shopping-periods/current");
  if (!period) return null;
  const apiDays = period.days ?? (await fetchDays(period.id));
  const days = apiDays.map(d => ({ year: d.year, week: d.week, day: d.day }));
  return { id: period.id, days };
}

export async function replacePeriod(currentPeriodId: string | null, days: ShoppingDay[]): Promise<string | null> {
  if (currentPeriodId) {
    await apiFetch(`/shopping-periods/${currentPeriodId}`, { method: "DELETE" });
  }
  if (days.length === 0) return null;
  const created = await apiFetchJson<ApiShoppingPeriod>("/shopping-periods", { method: "POST" });
  for (const day of days) {
    await apiFetchJson(`/shopping-periods/${created.id}/days`, {
      method: "POST",
      body: { year: day.year, week: day.week, day: day.day },
    });
  }
  return created.id;
}

export const fetchItemChecks = (periodId: string) =>
  apiFetchJson<ApiItemCheck[]>(`/shopping-periods/${periodId}/item-checks`);

export const fetchSourceChecks = (periodId: string) =>
  apiFetchJson<ApiSourceCheck[]>(`/shopping-periods/${periodId}/source-checks`);

type ItemCheckTarget = { foodId: string } | { householdItemId: string };
type ItemCheckUpdates = Partial<{ isChecked: boolean; stockOverride: number | null; freezerBagIds: string[] }>;

export async function upsertItemCheck(
  periodId: string,
  existingId: string | undefined,
  target: ItemCheckTarget,
  updates: ItemCheckUpdates,
): Promise<ApiItemCheck> {
  if (existingId) {
    return apiFetchJson<ApiItemCheck>(`/shopping-periods/${periodId}/item-checks/${existingId}`, {
      method: "PUT",
      body: updates,
    });
  }
  return apiFetchJson<ApiItemCheck>(`/shopping-periods/${periodId}/item-checks`, {
    method: "POST",
    body: { ...target, ...updates },
  });
}

export interface SourceCheckTarget {
  foodId: string;
  recipeId: string;
  day: string;
  slot: string;
}

export async function upsertSourceCheck(
  periodId: string,
  existingId: string | undefined,
  target: SourceCheckTarget,
  isChecked: boolean,
): Promise<ApiSourceCheck> {
  if (existingId) {
    return apiFetchJson<ApiSourceCheck>(`/shopping-periods/${periodId}/source-checks/${existingId}`, {
      method: "PUT",
      body: { isChecked },
    });
  }
  return apiFetchJson<ApiSourceCheck>(`/shopping-periods/${periodId}/source-checks`, {
    method: "POST",
    body: { ...target, isChecked },
  });
}
