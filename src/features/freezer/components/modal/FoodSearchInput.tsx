import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { searchFreezerFoods } from "../../../../core/logic/freezer/freezerSearchLogic";
import { isFreezerFoodNameTaken } from "../../../../core/logic/freezer/freezerItemsLogic";
import { useFoodsSnapshot } from "../../../../shared/hooks/useCatalogueSnapshot";

export interface FoodSearchInputProps {
  value: string;
  onChange: (name: string, foodId?: string) => void;
  existingNames?: string[];
}

export const FoodSearchInput = ({ value, onChange, existingNames }: FoodSearchInputProps) => {
  const [open, setOpen] = useState(false);

  const foods = useFoodsSnapshot();
  const suggestions = useMemo(() => searchFreezerFoods(foods, value), [foods, value]);

  const showList = open && suggestions.length > 0;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={value}
          onChange={e => { setOpen(true); onChange(e.target.value, undefined); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          placeholder="Ex: Steak haché, Épinards..."
          className="w-full pl-9 pr-4 py-3 bg-surface border border-slate-200 rounded-2xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
        />
      </div>

      {showList && (
        <div className="flex flex-col rounded-2xl border border-slate-200 overflow-hidden bg-surface shadow-sm">
          {suggestions.map(food => {
            const isDuplicate = isFreezerFoodNameTaken(existingNames ?? [], food.name);
            return (
              <button
                key={food.id}
                onMouseDown={e => e.preventDefault()}
                onClick={() => { if (!isDuplicate) { onChange(food.name, food.id); setOpen(false); } }}
                disabled={isDuplicate}
                className={`flex items-center justify-between px-4 py-2.5 text-left transition-colors border-b border-slate-100 last:border-0 ${isDuplicate ? "opacity-40 cursor-not-allowed" : "hover:bg-subtle"}`}
              >
                <span className="text-sm font-semibold text-slate-800">{food.name}</span>
                <span className="text-xs text-slate-400 ml-3 shrink-0">{isDuplicate ? "Déjà ajouté" : food.category}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
