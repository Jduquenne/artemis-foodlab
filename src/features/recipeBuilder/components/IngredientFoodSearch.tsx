import { useState } from "react";
import { Search } from "lucide-react";
import foodDbRaw from "../../../core/data/food-db.json";
import { Food, IngredientCategory } from "../../../core/domain/types";

interface IngredientFoodSearchProps {
  value: string;
  onChange: (name: string, foodId?: string, category?: IngredientCategory) => void;
}

const foods = Object.values(foodDbRaw) as Food[];

export const IngredientFoodSearch = ({ value, onChange }: IngredientFoodSearchProps) => {
  const [open, setOpen] = useState(false);

  const suggestions =
    open && value.length > 0
      ? (() => {
          const q = value.toLowerCase();
          const startsWith = foods.filter(f => f.name.toLowerCase().startsWith(q));
          const contains = foods.filter(
            f => !f.name.toLowerCase().startsWith(q) && f.name.toLowerCase().includes(q)
          );
          return [...startsWith, ...contains].slice(0, 8);
        })()
      : [];

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
          className="w-full pl-8 pr-3 py-2 bg-white dark:bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
        />
      </div>
      {open && suggestions.length > 0 && (
        <div className="absolute z-30 top-full left-0 right-0 mt-1 bg-white dark:bg-slate-100 border border-slate-200 rounded-xl shadow-lg overflow-hidden">
          {suggestions.map(food => (
            <button
              key={food.id}
              type="button"
              onMouseDown={e => e.preventDefault()}
              onClick={() => {
                onChange(food.name, food.id, food.category as IngredientCategory);
                setOpen(false);
              }}
              className="flex items-center justify-between w-full px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-200 transition-colors border-b border-slate-100 last:border-0"
            >
              <span className="text-sm font-semibold text-slate-800">{food.name}</span>
              <span className="text-xs text-slate-400 ml-2 shrink-0">{food.category}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
