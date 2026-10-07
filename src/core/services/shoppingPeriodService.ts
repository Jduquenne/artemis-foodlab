import { apiFetch, apiFetchJson } from "./apiClient";
import { ShoppingDay } from "../domain/planning";
import {
  ApiItemCheck,
  ApiShoppingDay,
  ApiShoppingExtra,
  ApiShoppingPeriod,
  ApiSourceCheck,
} from "../logic/shopping/shoppingApiMapper";

export interface CurrentPeriod {
  id: string;
  days: ShoppingDay[];
}

export const fetchDays = (periodId: string) =>
  apiFetchJson<ApiShoppingDay[]>(`/shopping-periods/${periodId}/days`);

export async function mapApiPeriod(period: ApiShoppingPeriod | null): Promise<CurrentPeriod | null> {
  if (!period) return null;
  const apiDays = period.days ?? (await fetchDays(period.id));
  const days = apiDays.map(d => ({ year: d.year, week: d.week, day: d.day }));
  return { id: period.id, days };
}

export async function replacePeriod(days: ShoppingDay[]): Promise<string | null> {
  const period = await apiFetchJson<ApiShoppingPeriod | null>("/shopping-periods/current", {
    method: "PUT",
    body: { days: days.map(d => ({ year: d.year, week: d.week, day: d.day })) },
  });
  return period?.id ?? null;
}

export interface ExtraInput {
  name?: string;
  quantity?: number | null;
  unit?: string | null;
  categoryId?: string | null;
  foodId?: string | null;
  recipeId?: string | null;
  isChecked?: boolean;
}

export const fetchExtras = (periodId: string) =>
  apiFetchJson<ApiShoppingExtra[]>(`/shopping-periods/${periodId}/extras`);

export const createExtra = (periodId: string, body: ExtraInput) =>
  apiFetchJson<ApiShoppingExtra>(`/shopping-periods/${periodId}/extras`, { method: "POST", body });

export const updateExtra = (periodId: string, id: string, body: ExtraInput) =>
  apiFetchJson<ApiShoppingExtra>(`/shopping-periods/${periodId}/extras/${id}`, { method: "PUT", body });

export async function deleteExtra(periodId: string, id: string): Promise<void> {
  await apiFetch(`/shopping-periods/${periodId}/extras/${id}`, { method: "DELETE" });
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

export interface SourceCheckUpsert {
  foodId: string;
  recipeId: string;
  day: string;
  slot: string;
  isChecked: boolean;
}

export const upsertSourceChecks = (periodId: string, checks: SourceCheckUpsert[]) =>
  apiFetchJson<ApiSourceCheck[]>(`/shopping-periods/${periodId}/source-checks`, {
    method: "PUT",
    body: { checks },
  });
