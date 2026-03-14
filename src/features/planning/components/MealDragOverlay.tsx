import { plannableDb } from '../../../core/typed-db/plannableDb';

export interface MealDragOverlayProps {
    recipeId: string;
}

export const MealDragOverlay = ({ recipeId }: MealDragOverlayProps) => {
    const recipe = plannableDb[recipeId];
    const photoUrl = recipe?.assets?.photo?.url;

    if (!photoUrl) return null;

    return (
        <div className="rounded-xl border-2 border-orange-400 shadow-2xl overflow-hidden bg-white dark:bg-slate-100 w-20 h-28 rotate-2 opacity-95 cursor-grabbing">
            <img src={photoUrl} className="w-full h-full object-contain" alt={recipe.name} />
        </div>
    );
};
