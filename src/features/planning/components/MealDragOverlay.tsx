import { plannableDb } from '../../../core/typed-db/plannableDb';

export interface MealDragOverlayProps {
    recipeId: string;
}

export const MealDragOverlay = ({ recipeId }: MealDragOverlayProps) => {
    const recipe = plannableDb[recipeId];

    if (!recipe?.assets?.mealPhoto) return null;

    return (
        <div className="rounded-xl border-2 border-orange-400 shadow-2xl overflow-hidden w-20 h-28 rotate-2 opacity-95 cursor-grabbing relative">
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${recipe.assets.mealPhoto.url}')` }} />
            <div className="absolute inset-0 bg-white/40 dark:bg-black/50 transition-colors" />
            <div className="absolute inset-0 flex items-center justify-center p-2">
                <span className="bg-white/90 dark:bg-black/75 text-slate-900 text-[14px] font-bold px-1.5 py-0.5 rounded-md leading-tight line-clamp-4 text-center">{recipe.name}</span>
            </div>
        </div>
    );
};
