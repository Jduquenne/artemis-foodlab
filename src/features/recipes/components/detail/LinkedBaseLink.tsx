import { RecipeDetails } from '../../../../core/domain/recipe';
import { buildRecipeDetailUrl } from '../../../../core/logic/recipe/recipeScalingLogic';
import { RecipePhotoCard } from '../../../../shared/components/ui/RecipePhotoCard';

export interface LinkedBaseLinkProps {
  id: string;
  name: string;
  recipe: RecipeDetails;
  compact?: boolean;
}

export const LinkedBaseLink = ({ id, name, recipe, compact = false }: LinkedBaseLinkProps) => (
  <a
    href={`#${buildRecipeDetailUrl(id, undefined)}`}
    target="_blank"
    rel="noopener noreferrer"
    className={`flex flex-col items-center group ${compact ? 'gap-1' : 'gap-2'}`}
  >
    <div className={`${compact ? 'h-14 rounded-xl' : 'h-28 md:h-32 rounded-2xl'} aspect-[189/208] overflow-hidden shadow-md ring-1 ring-slate-200 dark:ring-slate-300 group-hover:opacity-75 group-hover:ring-orange-300 transition-all`}>
      <RecipePhotoCard recipeId={id} recipe={recipe} fill />
    </div>
    <span className={`${compact ? 'text-[10px] w-14' : 'text-xs w-20'} font-semibold text-slate-500 text-center leading-tight line-clamp-2`}>{name}</span>
  </a>
);
