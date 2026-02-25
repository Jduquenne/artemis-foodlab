import { RecipeDetails } from '../../../core/domain/types';
import recipesDb from '../../../core/domain/recipes-db.json';

export interface MealDragOverlayProps {
    recipeId: string;
}

export const MealDragOverlay = ({ recipeId }: MealDragOverlayProps) => {
    const data = recipesDb as unknown as Record<string, RecipeDetails>;
    const recipe = data[recipeId];
    const photoUrl = recipe?.assets?.photo?.url;

    if (!photoUrl) return null;

    return (
        <div className="rounded-xl border-2 border-orange-400 shadow-2xl overflow-hidden bg-white dark:bg-slate-100 w-20 h-28 rotate-2 opacity-95 cursor-grabbing">
            <img src={photoUrl} className="w-full h-full object-contain" alt={recipe.name} />
        </div>
    );
};
