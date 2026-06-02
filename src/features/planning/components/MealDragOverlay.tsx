import { plannableDb } from '../../../core/typed-db/plannableDb';

export interface MealDragOverlayProps {
    recipeId: string;
}

export const MealDragOverlay = ({ recipeId }: MealDragOverlayProps) => {
    const recipe = plannableDb[recipeId];

    if (!recipe?.assets?.mealPhoto) return null;

    return (
        <div className="rounded-xl border-2 border-orange-400 shadow-2xl overflow-hidden w-20 h-28 rotate-2 opacity-95 cursor-grabbing relative">
            <img src={recipe.assets.mealPhoto.url} className="w-full h-full object-cover" alt={recipe.name} />
            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute inset-0 flex items-center justify-center p-2">
                <span className="bg-black/70 text-white text-[14px] font-bold px-1.5 py-0.5 rounded-md leading-tight line-clamp-4 text-center">{recipe.name}</span>
            </div>
        </div>
    );
};
