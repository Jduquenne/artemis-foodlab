import { X } from "lucide-react";
import { useFoodsSnapshot } from "../../../../shared/hooks/useCatalogueSnapshot";
import { FoodSearchInput } from "./FoodSearchInput";

export interface ExcludedFoodsFieldProps {
  foodIds: string[];
  disabled: boolean;
  onToggle: (foodId: string) => void;
}

export const ExcludedFoodsField = ({ foodIds, disabled, onToggle }: ExcludedFoodsFieldProps) => {
  const foods = useFoodsSnapshot();

  return (
    <div className="flex flex-col gap-2">
      {foodIds.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {foodIds.map((id) => (
            <span key={id} className="flex items-center gap-1 pl-2.5 pr-1 py-1 rounded-lg bg-red-50 dark:bg-red-900/20 text-xs font-semibold text-red-600">
              {foods[id]?.name ?? id}
              <button
                type="button"
                disabled={disabled}
                aria-label={`Ne plus exclure ${foods[id]?.name ?? id}`}
                onClick={() => onToggle(id)}
                className="p-0.5 rounded hover:bg-red-100 dark:hover:bg-red-900/40 disabled:opacity-50"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
      <FoodSearchInput hiddenIds={foodIds} disabled={disabled} placeholder="Ex : champignons, poivrons…" onPick={onToggle} />
    </div>
  );
};
