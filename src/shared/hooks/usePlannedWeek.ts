import { useEffect, useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { MealSlot } from "../../core/domain/planning";
import { getWeekSlots, syncWeekFromApi } from "../../core/services/planningService";

export function usePlannedWeek(year: number, week: number): MealSlot[] {
  useEffect(() => {
    syncWeekFromApi(year, week).catch(() => undefined);
  }, [year, week]);

  const slots = useLiveQuery(() => getWeekSlots(year, week), [year, week]);
  return useMemo(() => slots ?? [], [slots]);
}
