import { X } from 'lucide-react';
import { plannableDb } from '../../../core/utils/plannableDb';
import { IS_TOUCH } from '../../../shared/utils/deviceUtils';

interface DessertCellProps {
    recipeId: string;
    onRemove: () => void;
    isAddMode?: boolean;
}

export const DessertCell = ({ recipeId, onRemove, isAddMode }: DessertCellProps) => {
    const recipe = plannableDb[recipeId];
    const photoUrl = recipe?.assets?.photo?.url;

    if (!photoUrl) return null;

    return (
        <div className="relative flex-1 min-h-0 rounded-lg overflow-hidden group">
            <img
                src={photoUrl}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover"
                alt={recipe?.name ?? ''}
            />
            {!isAddMode && (
                <button
                    aria-label="Retirer le dessert"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => { e.stopPropagation(); onRemove(); }}
                    className={`absolute top-0.5 right-0.5 p-0.5 bg-black/50 text-white rounded-md z-10 transition-opacity ${IS_TOUCH ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                >
                    <X size={10} />
                </button>
            )}
        </div>
    );
};
