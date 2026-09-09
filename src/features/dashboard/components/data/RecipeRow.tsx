import { Image, ImageOff, Pencil, Trash2, Utensils } from "lucide-react";
import { RecipeDetails } from "../../../../core/domain/types";
import { getCategoryById } from "../../../../core/domain/categories";
import { RECIPE_KIND_LABELS } from "../../../../core/logic/dashboard/recipeTableLogic";

export interface RecipeRowProps {
  recipe: RecipeDetails;
  onEdit: (recipe: RecipeDetails) => void;
  onAskDelete: (recipe: RecipeDetails) => void;
}

export const RecipeRow = ({ recipe, onEdit, onAskDelete }: RecipeRowProps) => {
  const category = getCategoryById(recipe.categoryId);
  const hasPhoto = Boolean(recipe.assets?.mealPhoto?.url);

  return (
    <div className="flex items-center gap-3 px-4 py-2.5">
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-800 truncate">{recipe.name}</p>
        <p className="text-xs text-slate-400 truncate flex items-center gap-1.5">
          <span
            className="inline-block w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: category?.color ?? "#cbd5e1" }}
          />
          {category?.name ?? recipe.categoryId}
          <span className="text-slate-300">·</span>
          {RECIPE_KIND_LABELS[recipe.kind]}
        </p>
      </div>

      <span className="shrink-0 flex items-center gap-2 text-xs tabular-nums text-slate-500">
        {hasPhoto ? (
          <Image size={13} className="text-emerald-500" aria-label="Avec photo" />
        ) : (
          <ImageOff size={13} className="text-slate-300" aria-label="Sans photo" />
        )}
        <span className="flex items-center gap-0.5 w-9 justify-end" title="Ingrédients">
          <Utensils size={12} className="text-slate-400" />
          {recipe.ingredients.length}
        </span>
      </span>

      <button
        type="button"
        aria-label={`Modifier ${recipe.name}`}
        onClick={() => onEdit(recipe)}
        className="p-1.5 rounded-lg text-slate-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/30 transition-colors"
      >
        <Pencil size={15} />
      </button>
      <button
        type="button"
        aria-label={`Supprimer ${recipe.name}`}
        onClick={() => onAskDelete(recipe)}
        className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
};
