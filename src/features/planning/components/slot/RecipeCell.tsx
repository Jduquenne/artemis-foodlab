import { X, Copy, Users, Snowflake } from 'lucide-react';
import { plannableDb } from '../../../../core/typed-db/plannableDb';
import { RECIPE_BASE_GRAMS } from '../../../../core/utils/macroUtils';
import { IS_TOUCH } from '../../../../shared/utils/deviceUtils';
import { isDish, isBase } from '../../../../core/domain/recipePredicates';

export interface RecipeCellProps {
    recipeId: string;
    onNavigate: () => void;
    onRemove: () => void;
    onCopy?: () => void;
    hideRemove?: boolean;
    persons?: number;
    grams?: number;
    onEditMeta?: () => void;
    inFreezer?: boolean;
}

export const RecipeCell = ({ recipeId, onNavigate, onRemove, onCopy, hideRemove, persons, grams, onEditMeta, inFreezer }: RecipeCellProps) => {
    const recipe = plannableDb[recipeId];
    const photoUrl = recipe?.assets?.photo?.url;
    const hasRecipesPage = Boolean(recipe?.assets?.instructionsPhoto?.url);
    const defaultGrams = RECIPE_BASE_GRAMS[recipeId] ?? 0;
    const recipeIsDish = isDish(recipe) || isBase(recipe);
    const isCustom = persons !== undefined || (!recipeIsDish && grams !== undefined);

    return (
        <div className="relative group/cell w-full h-full min-h-0 flex-1 min-w-0">
            <button
                onClick={hasRecipesPage && !hideRemove ? onNavigate : undefined}
                className={`w-full h-full rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-200 ${!hasRecipesPage || hideRemove ? 'cursor-default' : ''}`}
            >
                {photoUrl && <img src={photoUrl} loading="lazy" decoding="async" className="w-full h-full object-cover sm:object-contain" alt={recipe.name} />}
            </button>

            {!hideRemove && onEditMeta && (recipeIsDish || defaultGrams > 0 || persons !== undefined) && (
                <button
                    aria-label="Modifier la quantité"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => { e.stopPropagation(); onEditMeta(); }}
                    className={`absolute bottom-0.5 left-0.5 flex items-center gap-0.5 text-[8px] font-black px-1 py-0.5 rounded z-10 shadow-sm ${isCustom ? 'bg-orange-500 text-white' : 'bg-black/20 text-white'}`}
                >
                    {recipeIsDish ? (
                        <span className="flex items-center gap-0.5"><Users size={7} />{persons !== undefined ? `${persons}p` : ''}</span>
                    ) : (
                        <>
                            {persons !== undefined && <><Users size={7} />{persons} · </>}
                            {defaultGrams > 0 && <span>{grams ?? Math.round(defaultGrams)}g</span>}
                        </>
                    )}
                </button>
            )}

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
            {inFreezer && (
                <div className="absolute top-0.5 left-0.5 p-0.5 bg-cyan-500/80 text-white rounded z-10 shadow-sm pointer-events-none">
                    <Snowflake size={8} />
                </div>
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
