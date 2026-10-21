import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { searchFoods } from "../../../core/logic/recipeBuilder/ingredientSearchLogic";
import { useFoodsSnapshot } from "../../hooks/useCatalogueSnapshot";

export interface FoodSearchInputProps {
  hiddenIds: readonly string[];
  disabled: boolean;
  placeholder: string;
  onPick: (foodId: string) => void;
}

export const FoodSearchInput = ({ hiddenIds, disabled, placeholder, onPick }: FoodSearchInputProps) => {
  const foods = useFoodsSnapshot();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const allFoods = useMemo(() => Object.values(foods), [foods]);
  const suggestions = useMemo(
    () => (query.trim() ? searchFoods(query, allFoods).filter((food) => !hiddenIds.includes(food.id)) : []),
    [query, allFoods, hiddenIds],
  );

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
      <input
        value={query}
        disabled={disabled}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        placeholder={placeholder}
        className="w-full pl-9 pr-3 py-2 bg-surface border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 disabled:opacity-50"
      />
      {open && suggestions.length > 0 && (
        <div className="absolute z-10 left-0 right-0 mt-1 flex flex-col rounded-xl border border-slate-200 overflow-hidden bg-surface shadow-lg">
          {suggestions.map((food) => (
            <button
              key={food.id}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => { onPick(food.id); setQuery(""); }}
              className="flex items-center justify-between px-3 py-2 text-left hover:bg-subtle border-b border-slate-100 last:border-0"
            >
              <span className="text-sm font-semibold text-slate-800">{food.name}</span>
              <span className="text-xs text-slate-400 ml-3 shrink-0">{food.category}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
