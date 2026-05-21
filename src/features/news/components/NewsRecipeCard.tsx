import { ChevronRight } from "lucide-react";
import { RecipeDetails } from "../../../core/domain/types";
import { getCategoryById } from "../../../core/domain/categories";

export interface NewsRecipeCardProps {
  recipe: RecipeDetails;
  onClick: () => void;
}

export const NewsRecipeCard = ({ recipe, onClick }: NewsRecipeCardProps) => {
  const category = getCategoryById(recipe.categoryId);
  const photoUrl = recipe.assets.photo?.url;

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-200 transition-colors text-left"
    >
      {photoUrl ? (
        <img
          src={photoUrl}
          alt={recipe.name}
          className="w-12 h-12 rounded-lg object-cover shrink-0"
        />
      ) : (
        <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-200 shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-800 truncate">{recipe.name}</p>
        {category && (
          <span className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-xs text-white font-medium ${category.color}`}>
            {category.name}
          </span>
        )}
      </div>
      <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
    </button>
  );
};
