import { RotateCcw } from "lucide-react";
import { Ingredient } from "../../../../core/domain/ingredient";
import { pluralizeUnit } from "../../../../shared/utils/unitUtils";
import { DecimalInput } from "../../../../shared/components/ui/DecimalInput";

export interface IngredientOverrideRowProps {
  ingredient: Ingredient;
  defaultQuantity: number;
  overrideQuantity: number | undefined;
  onChange: (value: number) => void;
  onReset: () => void;
}

export const IngredientOverrideRow = ({
  ingredient,
  defaultQuantity,
  overrideQuantity,
  onChange,
  onReset,
}: IngredientOverrideRowProps) => {
  const value = overrideQuantity ?? defaultQuantity;
  const isModified = Math.abs(value - defaultQuantity) > 0.001;
  const unitLabel = ingredient.unit ? pluralizeUnit(ingredient.unit, value) : "";

  return (
    <div className="flex items-center justify-between gap-1.5 py-0.5 pl-3">
      <span
        className={`text-[11px] leading-tight truncate ${isModified ? "text-orange-600 font-medium" : "text-slate-500"} ${value === 0 ? "line-through text-slate-300" : ""}`}
      >
        {ingredient.name}
      </span>
      <div className="flex items-center gap-1 shrink-0">
        <DecimalInput
          value={value}
          aria-label={`Quantité — ${ingredient.name}`}
          onValueChange={(v) => {
            if (v !== null) onChange(v);
          }}
          className="w-12 text-[11px] font-bold text-center bg-slate-50 dark:bg-slate-200 rounded px-1 py-0.5 outline-none focus:ring-1 focus:ring-orange-400 text-orange-500"
        />
        {unitLabel && <span className="text-[10px] text-slate-400 w-8">{unitLabel}</span>}
        {isModified && (
          <button
            type="button"
            onClick={onReset}
            aria-label={`Réinitialiser — ${ingredient.name}`}
            className="text-slate-300 hover:text-orange-500 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
};
