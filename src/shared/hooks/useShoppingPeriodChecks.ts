import { useEffect, useMemo, useState } from "react";
import { FreezerBag } from "../../core/domain/freezer";
import { HouseholdItem } from "../../core/domain/household";
import { ConsolidatedIngredient, IngredientSource } from "../../core/domain/shopping";
import { getCodeById, getIdByCode } from "../../core/catalogue/recipeIdMap";
import { computeFreezerBagSelection } from "../../core/logic/freezer/freezerStockLogic";
import { ApiItemCheck, ApiShoppingExtra, ApiSourceCheck } from "../../core/logic/shopping/shoppingApiMapper";
import {
  SourceToggle,
  buildShoppingCheckState,
  collectSourceCheckRequests,
} from "../../core/logic/shopping/shoppingCheckState";
import {
  ExtraInput,
  createExtra,
  deleteExtra,
  fetchExtras,
  fetchItemChecks,
  fetchSourceChecks,
  updateExtra,
  upsertItemCheck,
  upsertSourceChecks,
} from "../../core/services/shoppingPeriodService";
import { useRefreshStore } from "../store/useRefreshStore";
import { withPending } from "../utils/withPending";

interface PeriodChecks {
  periodId: string;
  itemChecks: ApiItemCheck[];
  sourceChecks: ApiSourceCheck[];
  extras: ApiShoppingExtra[];
}

const NO_ITEM_CHECKS: ApiItemCheck[] = [];
const NO_SOURCE_CHECKS: ApiSourceCheck[] = [];
const NO_EXTRAS: ApiShoppingExtra[] = [];

const recipeCodeOf = (recipeApiId: string) => getCodeById(recipeApiId) ?? recipeApiId;
const recipeApiIdOf = (recipeCode: string) => getIdByCode(recipeCode) ?? recipeCode;

function upsertById<T extends { id: string }>(list: T[], item: T): T[] {
  return list.some((e) => e.id === item.id) ? list.map((e) => (e.id === item.id ? item : e)) : [...list, item];
}

function upsertAllById<T extends { id: string }>(list: T[], items: T[]): T[] {
  return items.reduce(upsertById, list);
}

export function useShoppingPeriodChecks(
  periodId: string | null,
  ingredients: ConsolidatedIngredient[],
  householdItems: HouseholdItem[],
) {
  const refreshTick = useRefreshStore((s) => s.tick);
  const [data, setData] = useState<PeriodChecks | null>(null);

  useEffect(() => {
    if (!periodId) return;
    let active = true;
    Promise.all([fetchItemChecks(periodId), fetchSourceChecks(periodId), fetchExtras(periodId)]).then(
      ([itemChecks, sourceChecks, extras]) => {
        if (active) setData({ periodId, itemChecks, sourceChecks, extras });
      },
      () => undefined,
    );
    return () => {
      active = false;
    };
  }, [periodId, refreshTick]);

  const current = data && data.periodId === periodId ? data : null;
  const itemChecks = current?.itemChecks ?? NO_ITEM_CHECKS;
  const sourceChecks = current?.sourceChecks ?? NO_SOURCE_CHECKS;
  const extras = current?.extras ?? NO_EXTRAS;

  const state = useMemo(
    () => buildShoppingCheckState(ingredients, householdItems, itemChecks, sourceChecks, extras, recipeCodeOf),
    [ingredients, householdItems, itemChecks, sourceChecks, extras],
  );

  const patch = (forPeriod: string, update: (prev: PeriodChecks) => PeriodChecks) =>
    setData((prev) => (prev && prev.periodId === forPeriod ? update(prev) : prev));

  const patchItemCheck = (forPeriod: string, updated: ApiItemCheck) =>
    patch(forPeriod, (p) => ({ ...p, itemChecks: upsertById(p.itemChecks, updated) }));

  const toggleItem = async (key: string) => {
    if (!periodId) return;
    const pendingKey = `shopping-check:${key}`;
    if (key.startsWith("extra::")) {
      const id = key.slice("extra::".length);
      const extra = extras.find((e) => e.id === id);
      const updated = await withPending(pendingKey, () => updateExtra(periodId, id, { isChecked: !extra?.isChecked }));
      if (updated) patch(periodId, (p) => ({ ...p, extras: upsertById(p.extras, updated) }));
      return;
    }
    if (key.startsWith("household::")) {
      const householdItemId = key.slice("household::".length);
      const existing = state.itemCheckByHouseholdId.get(householdItemId);
      const updated = await withPending(pendingKey, () =>
        upsertItemCheck(periodId, existing?.id, { householdItemId }, { isChecked: !existing?.isChecked }),
      );
      if (updated) patchItemCheck(periodId, updated);
      return;
    }
    const foodId = state.keyToFoodId.get(key);
    if (!foodId) return;
    const existing = state.itemCheckByFoodId.get(foodId);
    const updated = await withPending(pendingKey, () =>
      upsertItemCheck(periodId, existing?.id, { foodId }, { isChecked: !existing?.isChecked }),
    );
    if (updated) patchItemCheck(periodId, updated);
  };

  const setStock = async (key: string, value: number) => {
    if (!periodId) return;
    const foodId = state.keyToFoodId.get(key);
    if (!foodId) return;
    const existing = state.itemCheckByFoodId.get(foodId);
    const updated = await upsertItemCheck(periodId, existing?.id, { foodId }, { stockOverride: value > 0 ? value : null })
      .catch(() => null);
    if (updated) patchItemCheck(periodId, updated);
  };

  const toggleSourceBatch = async (toggles: SourceToggle[], isChecked: boolean) => {
    if (!periodId) return;
    const requests = collectSourceCheckRequests(toggles, state.keyToFoodId, recipeApiIdOf);
    if (requests.length === 0) return;
    const updated = await withPending(
      requests.map((r) => `shopping-source:${r.localKey}`),
      () => upsertSourceChecks(periodId, requests.map((r) => ({ ...r.target, isChecked }))),
    ).catch(() => undefined);
    if (updated) patch(periodId, (p) => ({ ...p, sourceChecks: upsertAllById(p.sourceChecks, updated) }));
  };

  const toggleSourceCheck = (ingredientKey: string, sources: IngredientSource[], isChecked: boolean) =>
    toggleSourceBatch([{ ingredientKey, sources }], isChecked);

  const toggleFreezerBag = async (ingredientKey: string, bagId: string, freezerBags: FreezerBag[]) => {
    if (!periodId) return;
    const foodId = state.keyToFoodId.get(ingredientKey);
    if (!foodId) return;
    const { next } = computeFreezerBagSelection(state.freezerSelection[ingredientKey] ?? [], bagId, freezerBags);
    const existing = state.itemCheckByFoodId.get(foodId);
    const updated = await withPending(`shopping-bag:${bagId}`, () =>
      upsertItemCheck(periodId, existing?.id, { foodId }, { freezerBagIds: next }),
    );
    if (updated) patchItemCheck(periodId, updated);
  };

  const saveExtra = async (extraId: string | null, body: ExtraInput): Promise<boolean> => {
    if (!periodId) return false;
    try {
      const saved = extraId ? await updateExtra(periodId, extraId, body) : await createExtra(periodId, body);
      patch(periodId, (p) => ({ ...p, extras: upsertById(p.extras, saved) }));
      return true;
    } catch {
      return false;
    }
  };

  const removeExtra = async (extraId: string) => {
    if (!periodId) return;
    await withPending(`shopping-extra-delete:${extraId}`, async () => {
      await deleteExtra(periodId, extraId);
      patch(periodId, (p) => ({ ...p, extras: p.extras.filter((e) => e.id !== extraId) }));
    }).catch(() => undefined);
  };

  return {
    extras,
    checked: state.checked,
    stocks: state.stocks,
    sourceChecked: state.sourceChecked,
    freezerSelection: state.freezerSelection,
    toggleItem,
    setStock,
    toggleSourceCheck,
    toggleSourceBatch,
    toggleFreezerBag,
    saveExtra,
    removeExtra,
  };
}
