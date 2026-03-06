import { Plus } from "lucide-react";
import { Unit, IngredientCategory } from "../../../core/domain/types";
import { IngredientBuilderRow } from "./IngredientBuilderRow";
import { DraftIngredient } from "../types";
import { markScrolling } from "../../../shared/utils/scrollGuard";

interface IngredientBuilderListProps {
  ingredients: DraftIngredient[];
  onChange: (ingredients: DraftIngredient[]) => void;
}

const emptyIngredient = (): DraftIngredient => ({
  id: crypto.randomUUID(),
  ingredientType: "food",
  name: "",
  quantity: null,
  unit: Unit.NONE,
  preparation: "",
  category: IngredientCategory.FRUIT_VEGETABLE,
});

export const IngredientBuilderList = ({ ingredients, onChange }: IngredientBuilderListProps) => {
  const update = (id: string, updated: DraftIngredient) =>
    onChange(ingredients.map(i => (i.id === id ? updated : i)));

  const remove = (id: string) => onChange(ingredients.filter(i => i.id !== id));

  const add = () => onChange([...ingredients, emptyIngredient()]);

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex items-center justify-between mb-2 shrink-0">
        <h2 className="text-sm font-black text-slate-700 uppercase tracking-wide">
          Ingrédients
          <span className="ml-2 text-orange-500 font-bold">{ingredients.length}</span>
        </h2>
        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 font-medium">
          <span className="w-16 text-center">Type</span>
          <span className="flex-1 min-w-0">Nom</span>
          <span className="w-14 text-center">Qté</span>
          <span className="w-8" />
        </div>
      </div>

      <div
        className="flex-1 min-h-0 overflow-y-auto divide-y divide-slate-100"
        onScroll={markScrolling}
      >
        {ingredients.length === 0 && (
          <div className="flex flex-col items-center justify-center h-32 text-slate-400">
            <p className="text-sm">Aucun ingrédient ajouté</p>
          </div>
        )}
        {ingredients.map(ing => (
          <IngredientBuilderRow
            key={ing.id}
            ingredient={ing}
            onChange={updated => update(ing.id, updated)}
            onRemove={() => remove(ing.id)}
          />
        ))}
      </div>

      <div className="shrink-0 pt-2 border-t border-slate-100">
        <button
          type="button"
          onClick={add}
          className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" />
          Ajouter un ingrédient
        </button>
      </div>
    </div>
  );
};
