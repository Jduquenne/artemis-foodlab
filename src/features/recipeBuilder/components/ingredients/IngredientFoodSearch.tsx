import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { useFoodsSnapshot } from "../../../../shared/hooks/useCatalogueSnapshot";
import { Food, IngredientCategory } from "../../../../core/domain/ingredient";
import { searchFoods } from "../../../../core/logic/recipeBuilder/ingredientSearchLogic";
import { SuggestionList } from "./SuggestionList";

export interface IngredientFoodSearchProps {
  value: string;
  linked?: boolean;
  onChange: (name: string, foodId?: string, category?: IngredientCategory, unit?: string) => void;
}

export const IngredientFoodSearch = ({ value, linked, onChange }: IngredientFoodSearchProps) => {
  const foodsDb = useFoodsSnapshot();
  const foods = useMemo<Food[]>(() => Object.values(foodsDb), [foodsDb]);
  const isUnlinked = value.trim().length > 0 && !linked;
  const [open, setOpen] = useState(false);

  const suggestions = useMemo(
    () => (open && value.length > 0 ? searchFoods(value, foods) : []),
    [open, value, foods],
  );

  return (
    <div className="relative flex-1 min-w-0">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value, undefined, undefined)}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          placeholder="Aliment…"
          className={`w-full pl-8 pr-3 py-2 bg-surface border rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 ${
            isUnlinked
              ? 'border-orange-300 focus:border-orange-400 focus:ring-orange-400'
              : 'border-slate-200 focus:border-orange-400 focus:ring-orange-400'
          }`}
        />
      </div>
      {open && suggestions.length > 0 && (
        <SuggestionList
          suggestions={suggestions.map((food) => ({ id: food.id, label: food.name, hint: food.category }))}
          onPick={(id) => {
            const food = foodsDb[id];
            if (food) onChange(food.name, food.id, food.category, food.unit ?? undefined);
            setOpen(false);
          }}
        />
      )}
    </div>
  );
};
