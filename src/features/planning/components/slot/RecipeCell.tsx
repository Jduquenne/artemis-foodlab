import { X, Copy } from 'lucide-react';
import { plannableDb } from '../../../../core/utils/plannableDb';
import { IS_TOUCH } from '../../../../shared/utils/deviceUtils';

interface RecipeCellProps {
    recipeId: string;
    onNavigate: () => void;
    onRemove: () => void;
    onCopy?: () => void;
    hideRemove?: boolean;
}

const data = plannableDb;

export const RecipeCell = ({ recipeId, onNavigate, onRemove, onCopy, hideRemove }: RecipeCellProps) => {
    const recipe = data[recipeId];
    const photoUrl = recipe?.assets?.photo?.url;
    const hasRecipesPage = Boolean(recipe?.assets?.instructionsPhoto?.url);

    return (
        <div className="relative group/cell w-full h-full min-h-0 flex-1 min-w-0">
            <button
                onClick={hasRecipesPage && !hideRemove ? onNavigate : undefined}
                className={`w-full h-full rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-200 ${!hasRecipesPage || hideRemove ? 'cursor-default' : ''}`}
            >
                {photoUrl && <img src={photoUrl} loading="lazy" decoding="async" className="w-full h-full object-cover sm:object-contain" alt={recipe.name} />}
            </button>
            {!hideRemove && (
                <button
                    aria-label="Retirer ce repas"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => { e.stopPropagation(); onRemove(); }}
                    className={`absolute top-0.5 right-0.5 p-0.5 bg-white/90 dark:bg-slate-100/90 text-red-400 rounded transition-opacity z-10 shadow-sm ${IS_TOUCH ? 'opacity-100' : 'opacity-0 group-hover/cell:opacity-100'}`}
                >
                    <X size={9} />
                </button>
            )}
            {!hideRemove && onCopy && (
                <button
                    aria-label="Copier ce repas"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => { e.stopPropagation(); onCopy(); }}
                    className={`absolute bottom-0.5 right-0.5 p-0.5 bg-white/90 dark:bg-slate-100/90 text-violet-400 rounded transition-opacity z-10 shadow-sm ${IS_TOUCH ? 'opacity-100' : 'opacity-0 group-hover/cell:opacity-100'}`}
                >
                    <Copy size={9} />
                </button>
            )}
        </div>
    );
};
