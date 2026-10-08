import { MealPhoto } from './slot/MealPhoto';
import { usePlannableSnapshot } from '../../../shared/hooks/useCatalogueSnapshot';

export interface MealDragOverlayProps {
    recipeId: string;
}

export const MealDragOverlay = ({ recipeId }: MealDragOverlayProps) => {
    const plannable = usePlannableSnapshot();
    const recipe = plannable[recipeId];

    if (!recipe?.assets?.mealPhoto) return null;

    return (
        <div className="rounded-xl border-2 border-orange-400 shadow-2xl overflow-hidden w-20 h-28 rotate-2 opacity-95 cursor-grabbing relative">
            <MealPhoto asset={recipe.assets.mealPhoto} name={recipe.name} eager />
        </div>
    );
};
