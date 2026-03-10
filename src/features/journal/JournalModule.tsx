import { useState, useEffect, useMemo, useCallback } from "react";
import { addDays, subDays, isSameDay } from "date-fns";
import { getWeekNumber, getMonday } from "../../shared/utils/weekUtils";
import { getWeekSlots } from "../../core/services/planningService";
import { MealSlot, Macronutrients } from "../../core/domain/types";
import { RECIPE_MACROS } from "../../core/utils/macroUtils";
import { useJournalStore } from "../../shared/store/useJournalStore";
import { DayNav } from "./components/DayNav";
import { MacroSummary } from "./components/MacroSummary";
import { MealSlotCard } from "./components/MealSlotCard";

const SLOT_ORDER = ["breakfast", "lunch", "dinner", "snack"] as const;
const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

function getDayKey(date: Date): string {
  const d = date.getDay();
  return DAYS[d === 0 ? 6 : d - 1];
}

const ZERO: Macronutrients = { kcal: 0, proteins: 0, lipids: 0, carbohydrates: 0, fibers: 0 };

export const JournalModule = () => {
  const { portionOverrides } = useJournalStore();
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [weekSlots, setWeekSlots] = useState<MealSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const monday = getMonday(selectedDate);
  const week = getWeekNumber(monday);
  const year = monday.getFullYear();
  const dayKey = getDayKey(selectedDate);

  useEffect(() => {
    setIsLoading(true);
    getWeekSlots(year, week).then((slots) => {
      setWeekSlots(slots);
      setIsLoading(false);
    });
  }, [year, week]);

  const daySlots = useMemo(
    () => weekSlots.filter((s) => s.day === dayKey),
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
        return [...slot.recipeIds, ...(slot.dessertIds ?? [])].reduce((sum, id) => {
          const m = RECIPE_MACROS[id];
          if (!m) return sum;
          const portions = portionOverrides[`${slot.id}-${id}`] ?? 1;
          return {
            kcal: sum.kcal + m.kcal * portions,
            proteins: sum.proteins + m.proteins * portions,
            lipids: sum.lipids + m.lipids * portions,
            carbohydrates: sum.carbohydrates + m.carbohydrates * portions,
            fibers: sum.fibers + m.fibers * portions,
          };
        }, total);
      }, { ...ZERO }),
    [daySlots, portionOverrides]
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
