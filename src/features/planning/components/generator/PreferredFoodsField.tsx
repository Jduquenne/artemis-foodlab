import { X } from "lucide-react";
import { PreferredFood, PreferredFoodMode } from "../../../../core/domain/menuGenerator";
import { PREFERRED_FOOD_MODE_OPTIONS } from "../../../../core/logic/menuGenerator/generatorSettingsLogic";
import { useFoodsSnapshot } from "../../../../shared/hooks/useCatalogueSnapshot";
import { FoodSearchInput } from "../../../../shared/components/ui/FoodSearchInput";

export interface PreferredFoodsFieldProps {
  foods: PreferredFood[];
  disabled: boolean;
  onToggle: (foodId: string) => void;
  onModeChange: (foodId: string, mode: PreferredFoodMode) => void;
}

export const PreferredFoodsField = ({ foods, disabled, onToggle, onModeChange }: PreferredFoodsFieldProps) => {
  const catalogueFoods = useFoodsSnapshot();

  return (
    <div className="flex flex-col gap-2">
      {foods.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {foods.map(({ foodId, mode }) => {
            const name = catalogueFoods[foodId]?.name ?? foodId;
            return (
              <div key={foodId} className="flex items-center gap-2 pl-2.5 pr-1 py-1 rounded-lg bg-green-50 dark:bg-green-900/20">
                <span className="flex-1 min-w-0 truncate text-xs font-semibold text-green-700 dark:text-green-400">{name}</span>
                <div className="flex shrink-0 rounded-lg bg-surface p-0.5">
                  {PREFERRED_FOOD_MODE_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      disabled={disabled}
                      aria-pressed={mode === option.id}
                      onClick={() => onModeChange(foodId, option.id)}
                      className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition-colors disabled:opacity-50 ${
                        mode === option.id ? "bg-green-600 text-white" : "text-slate-500 hover:text-green-700"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  disabled={disabled}
                  aria-label={`Retirer ${name}`}
                  onClick={() => onToggle(foodId)}
                  className="p-0.5 rounded text-green-700 hover:bg-green-100 dark:hover:bg-green-900/40 disabled:opacity-50"
                >
                  <X size={12} />
                </button>
              </div>
            );
          })}
        </div>
      )}
      <FoodSearchInput
        hiddenIds={foods.map((item) => item.foodId)}
        disabled={disabled}
        placeholder="Ex : courgettes, poulet…"
        onPick={onToggle}
      />
    </div>
  );
};
