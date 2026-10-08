import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { useRecipesSnapshot } from "../../../../shared/hooks/useCatalogueSnapshot";
import { isBase } from "../../../../core/domain/recipePredicates";
import { searchBases } from "../../../../core/logic/recipeBuilder/ingredientSearchLogic";
import { SuggestionList } from "./SuggestionList";

export interface BaseRecipeSearchProps {
  value: string;
  onChange: (name: string, baseId: string) => void;
}

export const BaseRecipeSearch = ({ value, onChange }: BaseRecipeSearchProps) => {
  const [open, setOpen] = useState(false);
  const recipes = useRecipesSnapshot();

  const suggestions = useMemo(() => {
    if (!open) return [];
    const bases = Object.entries(recipes)
      .filter(([, r]) => isBase(r))
      .map(([id, r]) => ({ id, name: r.name }));
    return searchBases(value, bases);
  }, [open, value, recipes]);

  return (
    <div className="relative flex-1 min-w-0">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value, "")}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          placeholder="Rechercher une base…"
          className="w-full pl-8 pr-3 py-2 bg-white dark:bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
        />
      </div>
      {open && suggestions.length > 0 && (
        <SuggestionList
          suggestions={suggestions.map((base) => ({ id: base.id, label: base.name, hint: "base" }))}
          onPick={(id) => {
            const base = suggestions.find((candidate) => candidate.id === id);
            if (base) onChange(base.name, base.id);
            setOpen(false);
          }}
        />
      )}
    </div>
  );
};
