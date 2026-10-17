import { GeneratedMeal, GeneratedSlotType } from "../../../../core/domain/menuGenerator";
import { GENERATED_SLOT_LABELS } from "../../../../core/logic/menuGenerator/generatorSettingsLogic";
import { mealKey } from "../../../../core/logic/menuGenerator/menuEngineLogic";
import { PreviewWeek } from "../../../../core/logic/menuGenerator/menuPreviewLogic";
import { GeneratedMealCell } from "./GeneratedMealCell";

export interface GeneratorWeekGridProps {
  week: PreviewWeek;
  slots: readonly GeneratedSlotType[];
  meals: Record<string, GeneratedMeal>;
  recipeNameOf: (code: string | null) => string | null;
  selectedKey: string | null;
  onSelect: (key: string) => void;
  onToggleLock: (key: string) => void;
  onRegenerate: (key: string) => void;
}

export const GeneratorWeekGrid = ({ week, slots, meals, recipeNameOf, selectedKey, onSelect, onToggleLock, onRegenerate }: GeneratorWeekGridProps) => (
  <div className="grid grid-cols-[3.5rem_repeat(7,minmax(0,1fr))] gap-1.5">
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
  </div>
);
