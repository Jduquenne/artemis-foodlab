import { X } from "lucide-react";
import { toggleInList } from "../../../../core/utils/collectionUtils";
import { useFoodsSnapshot } from "../../../../shared/hooks/useCatalogueSnapshot";
import { FoodSearchInput } from "../../../../shared/components/ui/FoodSearchInput";

export interface FoodChipsFieldProps {
  foodIds: string[];
  separator?: string;
  placeholder: string;
  disabled: boolean;
  onChange: (foodIds: string[]) => void;
}

export const FoodChipsField = ({ foodIds, separator, placeholder, disabled, onChange }: FoodChipsFieldProps) => {
  const foods = useFoodsSnapshot();

  return (
    <div className="flex flex-col gap-1.5">
      {foodIds.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {foodIds.map((foodId, index) => (
            <span key={foodId} className="flex items-center gap-1.5">
              {separator && index > 0 && <span className="text-[11px] font-semibold text-slate-400">{separator}</span>}
              <span className="flex items-center gap-1 pl-2.5 pr-1 py-1 rounded-lg bg-muted text-xs font-semibold text-slate-700">
                {foods[foodId]?.name ?? foodId}
                <button
                  type="button"
                  disabled={disabled}
                  aria-label={`Retirer ${foods[foodId]?.name ?? foodId}`}
                  onClick={() => onChange(toggleInList(foodIds, foodId))}
                  className="p-0.5 rounded hover:bg-black/5 disabled:opacity-50"
                >
                  <X size={12} />
                </button>
              </span>
            </span>
          ))}
        </div>
      )}
      <FoodSearchInput hiddenIds={foodIds} disabled={disabled} placeholder={placeholder} onPick={(foodId) => onChange(toggleInList(foodIds, foodId))} />
    </div>
  );
};
