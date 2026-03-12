import { useState, useEffect, useMemo, useCallback } from "react";
import { addDays, subDays } from "date-fns";
import { getWeekNumber, getMonday } from "../../shared/utils/weekUtils";
import { getWeekSlots } from "../../core/services/planningService";
import { MealSlot, Macronutrients } from "../../core/domain/types";
import { getAllRecipeIds, isDish, isBase } from "../../core/domain/recipePredicates";
import { RECIPE_MACROS, RECIPE_BASE_GRAMS } from "../../core/utils/macroUtils";
import { plannableDb } from "../../core/utils/plannableDb";
import { useJournalStore } from "../../shared/store/useJournalStore";
import { DayNav } from "./components/DayNav";
import { MacroSummary } from "./components/MacroSummary";
import { MealSlotCard } from "./components/MealSlotCard";

const SLOT_ORDER = ["breakfast", "lunch", "snack", "dinner"] as const;
const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

function getDayKey(date: Date): string {
  const d = date.getDay();
  return DAYS[d === 0 ? 6 : d - 1];
}

const ZERO: Macronutrients = { kcal: 0, proteins: 0, lipids: 0, carbohydrates: 0, fibers: 0 };

export const JournalModule = () => {
  const { portionOverrides, gramOverrides } = useJournalStore();
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [weekSlots, setWeekSlots] = useState<MealSlot[] | null>(null);
  const monday = getMonday(selectedDate);
  const week = getWeekNumber(monday);
  const year = monday.getFullYear();
  const dayKey = getDayKey(selectedDate);

  useEffect(() => {
    let active = true;
    getWeekSlots(year, week).then((slots) => {
      if (active) setWeekSlots(slots);
    });
    return () => {
      active = false;
      setWeekSlots(null);
    };
  }, [year, week]);

  const isLoading = weekSlots === null;

  const daySlots = useMemo(
    () => (weekSlots ?? []).filter((s) => s.day === dayKey),
    [weekSlots, dayKey]
  );

  const slotMap = useMemo(() => {
    const map: Record<string, MealSlot> = {};
    for (const slot of daySlots) map[slot.slot] = slot;
    return map;
  }, [daySlots]);

  const totalMacros = useMemo(
    () =>
      daySlots.reduce((total, slot) => {
        return getAllRecipeIds(slot).reduce((sum, id) => {
          const m = RECIPE_MACROS[id];
          if (!m) return sum;
          const key = `${slot.id}-${id}`;
          const portionMult = portionOverrides[key] ?? 1;
          const recipe = plannableDb[id];
          const recipeIsDish = isDish(recipe) || isBase(recipe);
          let factor: number;
          if (recipeIsDish) {
            const plannedPortions = slot.recipePersons?.[id];
            factor = (plannedPortions ?? 1) * portionMult;
          } else {
            const baseGrams = RECIPE_BASE_GRAMS[id];
            const journalGrams = gramOverrides[key];
            if (journalGrams !== undefined && baseGrams) {
              factor = journalGrams / baseGrams;
            } else {
              const recipeGrams = slot.recipeQuantities?.[id];
              const gramsFactor = recipeGrams !== undefined && baseGrams ? recipeGrams / baseGrams : 1;
              factor = portionMult * gramsFactor;
            }
          }
          return {
            kcal: sum.kcal + m.kcal * factor,
            proteins: sum.proteins + m.proteins * factor,
            lipids: sum.lipids + m.lipids * factor,
            carbohydrates: sum.carbohydrates + m.carbohydrates * factor,
            fibers: sum.fibers + m.fibers * factor,
          };
        }, total);
      }, { ...ZERO }),
    [daySlots, portionOverrides, gramOverrides]
  );

  const goToPrev = useCallback(() => setSelectedDate((d) => subDays(d, 1)), []);

  const goToNext = useCallback(() => setSelectedDate((d) => addDays(d, 1)), []);

  return (
    <div className="h-full flex flex-col gap-3 overflow-hidden">
      <DayNav date={selectedDate} onPrev={goToPrev} onNext={goToNext} />

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-orange-200 border-t-orange-500 animate-spin" />
        </div>
      ) : (
        <>
          <MacroSummary macros={totalMacros} />

          <div className="flex-1 min-h-0 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {SLOT_ORDER.map((slotType) => (
              <MealSlotCard key={slotType} slotType={slotType} slot={slotMap[slotType]} />
            ))}
          </div>
        </>
      )}

    </div>
  );
};
