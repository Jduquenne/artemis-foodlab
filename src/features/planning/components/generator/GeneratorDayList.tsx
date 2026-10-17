import { useState } from "react";
import { GENERATED_SLOT_LABELS, GeneratedMeal, GeneratedSlotType } from "../../../../core/domain/menuGenerator";
import { mealKey } from "../../../../core/logic/menuGenerator/menuEngineLogic";
import { DayKcalSummary, PreviewWeek } from "../../../../core/logic/menuGenerator/menuPreviewLogic";
import { ChoicePills } from "./ChoicePills";
import { DayKcalBadge } from "./DayKcalBadge";
import { GeneratedMealCell } from "./GeneratedMealCell";

export interface GeneratorDayListProps {
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

export const GeneratorDayList = ({ week, slots, meals, recipeNameOf, kcalOf, selectedKey, onSelect, onToggleLock, onRegenerate }: GeneratorDayListProps) => {
  const days = week.columns.filter((column) => column.inPeriod);
  const [chosenDate, setChosenDate] = useState(days[0]?.date ?? "");
  const date = days.some((day) => day.date === chosenDate) ? chosenDate : (days[0]?.date ?? "");

  return (
    <div className="flex flex-col gap-2">
      <ChoicePills
        options={days.map((day) => ({ id: day.date, label: day.label }))}
        isActive={(id) => id === date}
        onToggle={setChosenDate}
      />
      {slots.map((slot) => {
        const meal = meals[mealKey(date, slot)];
        return meal ? (
          <div key={slot} className="flex flex-col gap-1">
            <span className="text-[11px] font-bold text-orange-600">{GENERATED_SLOT_LABELS[slot]}</span>
            <GeneratedMealCell
              meal={meal}
              recipeName={recipeNameOf(meal.recipeCode)}
              selected={selectedKey === meal.key}
              onSelect={onSelect}
              onToggleLock={onToggleLock}
              onRegenerate={onRegenerate}
            />
          </div>
        ) : null;
      })}
      {date && (
        <p className="text-right">
          <DayKcalBadge summary={kcalOf(date)} />
        </p>
      )}
    </div>
  );
};
