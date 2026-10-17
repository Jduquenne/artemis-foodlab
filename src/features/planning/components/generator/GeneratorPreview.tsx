import { useMemo, useState } from "react";
import { GeneratedMeal, GeneratedSlotType, PeriodDay } from "../../../../core/domain/menuGenerator";
import { dayKcalSummary, mealsByKey, previewWeeks } from "../../../../core/logic/menuGenerator/menuPreviewLogic";
import { useActiveProfile } from "../../../../shared/hooks/useActiveProfile";
import { useRecipeMetricsSnapshot, useRecipesSnapshot } from "../../../../shared/hooks/useCatalogueSnapshot";
import { ChoicePills } from "./ChoicePills";
import { GeneratedMealDetail } from "./GeneratedMealDetail";
import { GeneratorDayList } from "./GeneratorDayList";
import { GeneratorWeekGrid } from "./GeneratorWeekGrid";

export interface GeneratorPreviewProps {
  days: PeriodDay[];
  slots: GeneratedSlotType[];
  meals: GeneratedMeal[];
  existing: Record<string, string[]>;
  onToggleLock: (key: string) => void;
  onRegenerate: (key: string) => void;
}

export const GeneratorPreview = ({ days, slots, meals, existing, onToggleLock, onRegenerate }: GeneratorPreviewProps) => {
  const recipes = useRecipesSnapshot();
  const { macros } = useRecipeMetricsSnapshot();
  const kcalTarget = useActiveProfile()?.kcalTarget ?? null;
  const weeks = useMemo(() => previewWeeks(days), [days]);
  const byKey = useMemo(() => mealsByKey(meals), [meals]);
  const [chosenWeek, setChosenWeek] = useState(weeks[0]?.key ?? "");
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const week = weeks.find((w) => w.key === chosenWeek) ?? weeks[0];
  const recipeNameOf = (code: string | null) => (code ? (recipes[code]?.name ?? code) : null);
  const selected = selectedKey ? (byKey[selectedKey] ?? null) : null;
  const kcalOf = (date: string) => dayKcalSummary(date, slots, byKey, existing, macros, kcalTarget);

  if (!week) return null;

  const gridProps = {
    week,
    slots,
    meals: byKey,
    recipeNameOf,
    kcalOf,
    selectedKey,
    onSelect: setSelectedKey,
    onToggleLock,
    onRegenerate,
  };

  return (
    <div className="flex flex-col gap-3">
      {weeks.length > 1 && (
        <ChoicePills
          options={weeks.map((w) => ({ id: w.key, label: w.label }))}
          isActive={(id) => id === week.key}
          onToggle={setChosenWeek}
        />
      )}
      <div className="hidden sm:block">
        <GeneratorWeekGrid {...gridProps} />
      </div>
      <div className="sm:hidden">
        <GeneratorDayList key={week.key} {...gridProps} />
      </div>
      <div className="min-h-16 rounded-xl bg-muted px-3 py-2">
        <GeneratedMealDetail meal={selected} recipeName={recipeNameOf(selected?.recipeCode ?? null)} />
      </div>
    </div>
  );
};
