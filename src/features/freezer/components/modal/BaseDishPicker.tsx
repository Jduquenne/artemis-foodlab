import { useMemo, useState } from "react";
import { ChefHat, ChevronRight, Info } from "lucide-react";
import { RecipeDetails } from "../../../../core/domain/recipe";
import { filterDishesByName } from "../../../../core/logic/freezer/frozenBaseLogic";
import { SearchBar } from "../../../../shared/components/ui/SearchBar";

export interface BaseDishPickerProps {
  baseName: string;
  dishes: readonly RecipeDetails[];
  onSelect: (dish: RecipeDetails) => void;
}

export const BaseDishPicker = ({ baseName, dishes, onSelect }: BaseDishPickerProps) => {
  const [query, setQuery] = useState("");
  const visible = useMemo(() => filterDishesByName(dishes, query), [dishes, query]);

  if (dishes.length === 0) {
    return (
      <div className="flex gap-2 rounded-xl bg-muted p-4 text-sm text-slate-600">
        <Info className="w-4 h-4 shrink-0 mt-0.5 text-slate-400" />
        <span>
          Aucune recette n'utilise « {baseName} ». Une base ne se mange pas seule : ajoute-la à une recette pour pouvoir la prévoir au menu.
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-slate-500">Une base se prévoit dans une recette. Choisis le plat qui utilisera « {baseName} ».</p>
      {dishes.length > 6 && (
        <SearchBar value={query} onChange={setQuery} onClear={() => setQuery("")} placeholder="Rechercher une recette..." />
      )}
      <div className="flex flex-col rounded-2xl border border-slate-200 overflow-hidden bg-surface">
        {visible.map((dish) => (
          <button
            key={dish.code}
            type="button"
            onClick={() => onSelect(dish)}
            className="flex items-center gap-3 px-4 py-3 text-left border-b border-slate-100 last:border-0 hover:bg-subtle transition-colors"
          >
            <ChefHat className="w-4 h-4 shrink-0 text-orange-500" />
            <span className="flex-1 min-w-0 text-sm font-semibold text-slate-800 truncate">{dish.name}</span>
            <ChevronRight className="w-4 h-4 shrink-0 text-slate-300" />
          </button>
        ))}
        {visible.length === 0 && <p className="px-4 py-3 text-sm text-slate-400">Aucune recette ne correspond.</p>}
      </div>
    </div>
  );
};
