import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { addDays, subDays } from "date-fns";
import { getWeekNumber, getMonday } from "../../shared/utils/weekUtils";
import { getWeekSlots, syncWeekFromApi } from "../../core/services/planningService";
import { MealSlot } from "../../core/domain/planning";
import { computeDayMacros } from "../../shared/utils/macroUtils";
import { useActiveJournalOverrides } from "../../shared/hooks/useActiveJournalOverrides";
import { useAuthStore } from "../../shared/store/useAuthStore";
import { markScrolling } from "../../shared/utils/scrollGuard";
import { DayNav } from "./components/DayNav";
import { MacroSummary } from "./components/MacroSummary";
import { MealSlotCard } from "./components/slot/MealSlotCard";

const SLOT_ORDER = ["breakfast", "lunch", "snack", "dinner"] as const;
const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

function getDayKey(date: Date): string {
  const d = date.getDay();
  return DAYS[d === 0 ? 6 : d - 1];
}

export const JournalModule = () => {
  const { portionOverrides, gramOverrides, ingredientOverrides } = useActiveJournalOverrides();
  const authStatus = useAuthStore((s) => s.status);
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [weekSlots, setWeekSlots] = useState<MealSlot[] | null>(null);
  const monday = getMonday(selectedDate);
  const week = getWeekNumber(monday);
  const year = monday.getFullYear();
  const dayKey = getDayKey(selectedDate);

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (authStatus === 'authenticated') await syncWeekFromApi(year, week);
      const slots = await getWeekSlots(year, week);
      if (active) setWeekSlots(slots);
    };
    load();
    return () => {
      active = false;
      setWeekSlots(null);
    };
  }, [year, week, authStatus]);

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
    () => computeDayMacros(daySlots, portionOverrides, gramOverrides, ingredientOverrides),
    [daySlots, portionOverrides, gramOverrides, ingredientOverrides]
  );

  const goToPrev = useCallback(() => setSelectedDate((d) => subDays(d, 1)), []);

  const goToNext = useCallback(() => setSelectedDate((d) => addDays(d, 1)), []);

  const carouselRef = useRef<HTMLDivElement>(null);
  const [activeSlot, setActiveSlot] = useState(0);

  const handleCarouselScroll = useCallback(() => {
    markScrolling();
    const el = carouselRef.current;
    if (!el || el.clientWidth === 0) return;
    setActiveSlot(Math.round(el.scrollLeft / el.clientWidth));
  }, []);

  return (
    <div className="h-full flex flex-col gap-3 overflow-hidden">
      <DayNav date={selectedDate} onPrev={goToPrev} onNext={goToNext} />

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-orange-200 border-t-orange-500 animate-spin" />
        </div>
      ) : (
        <>
          <MacroSummary macros={totalMacros} weekSlots={weekSlots} />

          <div className="flex sm:hidden tablet:flex justify-center gap-1.5 shrink-0">
            {SLOT_ORDER.map((slotType, i) => (
              <span
                key={slotType}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${i >= 2 ? "tablet:hidden" : ""} ${i === activeSlot ? "bg-orange-500" : "bg-slate-200"}`}
              />
            ))}
          </div>

          <div
            ref={carouselRef}
            onScroll={handleCarouselScroll}
            className="flex-1 min-h-0 flex overflow-x-auto snap-x snap-mandatory sm:grid sm:grid-cols-4 sm:overflow-visible sm:snap-none tablet:flex tablet:overflow-x-auto tablet:snap-x tablet:snap-mandatory gap-3"
          >
            {SLOT_ORDER.map((slotType, i) => (
              <div
                key={slotType}
                className={`w-full h-full min-h-0 shrink-0 snap-center sm:w-auto sm:h-auto sm:shrink tablet:w-[calc(50%-0.375rem)] tablet:h-full tablet:shrink-0 ${i % 2 === 0 ? "tablet:snap-start" : "tablet:snap-align-none"}`}
              >
                <MealSlotCard slotType={slotType} slot={slotMap[slotType]} />
              </div>
            ))}
          </div>
        </>
      )}

    </div>
  );
};
