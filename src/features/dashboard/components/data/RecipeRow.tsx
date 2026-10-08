import { Image, ImageOff, Utensils } from "lucide-react";
import { RecipeDetails } from "../../../../core/domain/recipe";
import { useCategoriesSnapshot } from "../../../../shared/hooks/useCatalogueSnapshot";
import { getCardColors } from "../../../../shared/utils/cards/cardColors";
import { RECIPE_KIND_LABELS } from "../../../../core/domain/recipeLabels";
import { categoryLabel } from "../../../../core/logic/recipe/categoryLogic";
import { RowActions } from "../common/RowActions";

export interface RecipeRowProps {
  recipe: RecipeDetails;
  onEdit: (recipe: RecipeDetails) => void;
  onAskDelete: (recipe: RecipeDetails) => void;
}

export const RecipeRow = ({ recipe, onEdit, onAskDelete }: RecipeRowProps) => {
  const categories = useCategoriesSnapshot();
  const hasPhoto = Boolean(recipe.assets?.mealPhoto?.url);

  return (
    <div className="flex items-center gap-3 px-4 py-2.5">
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-800 truncate">{recipe.name}</p>
        <p className="text-xs text-slate-400 truncate flex items-center gap-1.5">
          <span
            className="inline-block w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: getCardColors(recipe.categoryId).band }}
          />
          {categoryLabel(categories, recipe.categoryId)}
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

      <RowActions name={recipe.name} onEdit={() => onEdit(recipe)} onDelete={() => onAskDelete(recipe)} />
    </div>
  );
};
