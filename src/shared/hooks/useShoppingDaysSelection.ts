import { useState } from "react";
import { ShoppingDay } from "../../core/domain/planning";
import { MAX_SHOPPING_DAYS } from "../../core/domain/planningConfig";
import { useMenuStore } from "../store/useMenuStore";
import { withPending } from "../utils/withPending";
import { usePendingKey } from "./usePendingKey";

const PENDING_KEY = "planning-shopping-days";

const isSameDay = (d: ShoppingDay, year: number, week: number, day: string) =>
  d.year === year && d.week === week && d.day === day;

export function useShoppingDaysSelection(year: number, week: number) {
  const { shoppingDays, setShoppingDays } = useMenuStore();
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [draftDays, setDraftDays] = useState<ShoppingDay[]>([]);
  const isPending = usePendingKey(PENDING_KEY);

  const enter = () => {
    setDraftDays([...shoppingDays]);
    setIsSelectionMode(true);
  };

  const cancel = () => setIsSelectionMode(false);

  const confirm = async () => {
    const ok = await withPending(PENDING_KEY, async () => {
      await setShoppingDays(draftDays);
      return true;
    }).catch(() => false);
    if (ok) setIsSelectionMode(false);
  };

  const toggle = (day: string) => {
    setDraftDays((prev) => {
      if (prev.some((d) => isSameDay(d, year, week, day))) return prev.filter((d) => !isSameDay(d, year, week, day));
      if (prev.length >= MAX_SHOPPING_DAYS) return prev;
      return [...prev, { year, week, day }];
    });
  };

  return {
    isSelectionMode,
    isPending,
    draftCount: draftDays.length,
    atMax: draftDays.length >= MAX_SHOPPING_DAYS,
    hasShoppingDays: shoppingDays.length > 0,
    isDraft: (day: string) => draftDays.some((d) => isSameDay(d, year, week, day)),
    isConfirmed: (day: string) => shoppingDays.some((d) => isSameDay(d, year, week, day)),
    enter,
    cancel,
    confirm,
    toggle,
    reset: () => setDraftDays([]),
  };
}
