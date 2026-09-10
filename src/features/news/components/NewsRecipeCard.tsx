import { ChevronRight } from "lucide-react";
import { RecipeDetails } from "../../../core/domain/types";
import { getCategoryById } from "../../../core/domain/categories";
import { getCardColors } from "../../../shared/utils/cards/cardColors";
import { AsyncImage } from "../../../shared/components/ui/AsyncImage";

export interface NewsRecipeCardProps {
  recipe: RecipeDetails;
  onClick: () => void;
}

export const NewsRecipeCard = ({ recipe, onClick }: NewsRecipeCardProps) => {
  const category = getCategoryById(recipe.categoryId);

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-200 transition-colors text-left"
    >
      <AsyncImage asset={recipe.assets?.mealPhoto} alt={recipe.name} wrapperClassName="w-12 h-12 rounded-lg shrink-0" className="object-cover" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-800 truncate">{recipe.name}</p>
        {category && (
          <span
            className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-xs text-white font-medium"
            style={{ backgroundColor: getCardColors(recipe.categoryId).band }}
          >
            {category.name}
          </span>
        )}
      </div>
      <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
    </button>
  );
};
