import { GENERATED_SLOT_LABELS, GeneratedMeal, GeneratedSlotType } from "../../../../core/domain/menuGenerator";
import { mealKey } from "../../../../core/logic/menuGenerator/menuEngineLogic";
import { DayKcalSummary, PreviewWeek } from "../../../../core/logic/menuGenerator/menuPreviewLogic";
import { DayKcalBadge } from "./DayKcalBadge";
import { GeneratedMealCell } from "./GeneratedMealCell";

export interface GeneratorWeekGridProps {
  week: PreviewWeek;
  slots: readonly GeneratedSlotType[];
  meals: Record<string, GeneratedMeal>;
  recipeNameOf: (code: string | null) => string | null;
  kcalOf: (date: string) => DayKcalSummary;
  selectedKey: string | null;
  onSelect: (key: string) => void;
  onToggleLock: (key: string) => void;
  onRegenerate: (key: string) => void;
}

export const GeneratorWeekGrid = ({ week, slots, meals, recipeNameOf, kcalOf, selectedKey, onSelect, onToggleLock, onRegenerate }: GeneratorWeekGridProps) => (
  <div
    className={`h-full grid grid-cols-[3.5rem_repeat(7,minmax(0,1fr))] gap-1.5 ${
      slots.length > 1 ? "grid-rows-[auto_repeat(2,minmax(5rem,1fr))_auto]" : "grid-rows-[auto_minmax(5rem,1fr)_auto]"
    }`}
  >
    <span />
    {week.columns.map((column) => (
      <span
        key={column.date}
        className={`text-center text-[11px] font-black uppercase tracking-wide ${column.inPeriod ? "text-slate-600" : "text-slate-300"}`}
      >
        {column.label}
      </span>
    ))}
    {slots.map((slot) => (
      <div key={slot} className="contents">
        <span className="self-center text-[11px] font-bold text-orange-600">{GENERATED_SLOT_LABELS[slot]}</span>
        {week.columns.map((column) => {
          const meal = meals[mealKey(column.date, slot)];
          return meal ? (
            <GeneratedMealCell
              key={column.date}
              meal={meal}
              recipeName={recipeNameOf(meal.recipeCode)}
              selected={selectedKey === meal.key}
              onSelect={onSelect}
              onToggleLock={onToggleLock}
              onRegenerate={onRegenerate}
            />
          ) : (
            <div key={column.date} className="min-h-20 rounded-xl bg-muted opacity-40" />
          );
        })}
      </div>
    ))}
    <span className="self-center text-[11px] font-bold text-slate-500">kcal</span>
    {week.columns.map((column) => (
      <div key={column.date} className="text-center">
        {column.inPeriod && <DayKcalBadge summary={kcalOf(column.date)} />}
      </div>
    ))}
  </div>
);
