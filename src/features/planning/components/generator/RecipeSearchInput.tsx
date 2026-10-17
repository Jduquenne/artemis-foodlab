import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { RecipeDetails } from "../../../../core/domain/recipe";
import { searchHabitRecipes } from "../../../../core/logic/menuGenerator/habitLogic";
import { useRecipesSnapshot } from "../../../../shared/hooks/useCatalogueSnapshot";

export interface RecipeSearchInputProps {
  disabled: boolean;
  onPick: (recipeCode: string) => void;
  search?: (query: string, recipes: Record<string, RecipeDetails>) => RecipeDetails[];
  placeholder?: string;
}

export const RecipeSearchInput = ({ disabled, onPick, search = searchHabitRecipes, placeholder = "Ex : pizza, lasagnes…" }: RecipeSearchInputProps) => {
  const recipes = useRecipesSnapshot();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const suggestions = useMemo(() => (query.trim() ? search(query, recipes) : []), [query, recipes, search]);

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
          {suggestions.map((recipe) => (
            <button
              key={recipe.code}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => { onPick(recipe.code); setQuery(""); }}
              className="px-3 py-2 text-left text-sm font-semibold text-slate-800 hover:bg-subtle border-b border-slate-100 last:border-0"
            >
              {recipe.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
