import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../core/services/db';

interface MealSlotProps {
    label: string;
    icon: string;
    recipeId?: string;
    onClick: () => void;
}

export const MealSlot = ({ label, icon, recipeId, onClick }: MealSlotProps) => {
    const recipe = useLiveQuery(
        async () => {
            if (!recipeId) return undefined; // On remplace null par undefined
            return await db.recipes.where({ recipeId, type: 'photo' }).first();
        },
        [recipeId]
    );

    return (
        <button
            onClick={onClick}
            className={`relative h-full w-full rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-1 overflow-hidden
        ${recipe
                    ? 'border-transparent'
                    : 'border-slate-900 hover:border-orange-300 hover:bg-orange-50/50'
                }`}
        >
            {recipe ? (
                <>
                    <img src={recipe.url} className="absolute inset-0 w-full h-full object-contain " alt={recipe.name} />
                </>
            ) : (
                <div className="flex flex-col items-center justify-center gap-1 h-full w-full opacity-60">
                    <span className="text-xl">{icon}</span>
                    <span className="text-[12px] font-black uppercase tracking-tighter">{label}</span>
                </div>
            )}
        </button>
    );
};