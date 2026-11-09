import { BatchMenuDay, BATCH_MENU_SLOTS, plannedDishAt } from "../../../../core/logic/planning/batchToMenuLogic";
import { MealSlot, SlotType } from "../../../../core/domain/planning";
import { SLOT_LABELS } from "../../../../core/domain/slotLabels";
import { BatchMenuCell } from "./BatchMenuCell";

export interface BatchMenuSelection {
  date: string;
  slot: SlotType;
}

export interface BatchMenuWeekGridProps {
  days: readonly BatchMenuDay[];
  slots: readonly MealSlot[];
  batchRecipeId: string;
  recipeNameOf: (code: string) => string;
  todayIso: string;
  selection: BatchMenuSelection | null;
  onSelect: (selection: BatchMenuSelection) => void;
}

export const BatchMenuWeekGrid = ({ days, slots, batchRecipeId, recipeNameOf, todayIso, selection, onSelect }: BatchMenuWeekGridProps) => (
  <div className="grid grid-cols-[3.5rem_repeat(2,minmax(0,1fr))] gap-1.5 sm:grid-flow-col sm:grid-cols-[4.5rem_repeat(7,minmax(0,1fr))] sm:grid-rows-[auto_repeat(2,minmax(4.5rem,1fr))]">
    <div className="contents">
      <span />
      {BATCH_MENU_SLOTS.map((slot) => (
        <span key={slot} className="self-center text-[11px] font-bold text-orange-600 dark:text-orange-300 sm:text-left">
          {SLOT_LABELS[slot]}
        </span>
      ))}
    </div>
    {days.map((day) => {
      const isToday = day.date === todayIso;
      const past = day.date < todayIso;
      return (
        <div key={day.date} className="contents">
          <span
            className={`self-center flex flex-col items-start sm:items-center rounded-lg px-1 py-0.5 text-[11px] font-black uppercase tracking-wide ${
              isToday ? "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-300" : "text-slate-500"
            }`}
          >
            {day.shortLabel}
            <span className="font-semibold normal-case tracking-normal opacity-70 text-[10px]">{day.dateLabel}</span>
          </span>
          {BATCH_MENU_SLOTS.map((slot) => {
            const code = plannedDishAt(slots, day.day, slot);
            return (
              <BatchMenuCell
                key={slot}
                dishName={code ? recipeNameOf(code) : null}
                isSameBatch={code === batchRecipeId}
                selected={selection?.date === day.date && selection.slot === slot}
                past={past}
                label={`${day.day} ${day.dateLabel}, ${SLOT_LABELS[slot].toLowerCase()}`}
                onSelect={() => onSelect({ date: day.date, slot })}
              />
            );
          })}
        </div>
      );
    })}
  </div>
);
