import { X, Copy } from 'lucide-react';
import { plannableDb } from '../../../../core/typed-db/plannableDb';
import { IS_TOUCH } from '../../../../shared/utils/deviceUtils';

export interface DessertCellProps {
    recipeId: string;
    onRemove: () => void;
    isAddMode?: boolean;
    onCopy?: () => void;
    isCopySource?: boolean;
    hideActions?: boolean;
}

export const DessertCell = ({ recipeId, onRemove, isAddMode, onCopy, isCopySource, hideActions }: DessertCellProps) => {
    const recipe = plannableDb[recipeId];
    const photoUrl = recipe?.assets?.photo?.url;

    if (!photoUrl) return null;

    return (
        <div className={`relative flex-1 min-h-0 rounded-lg overflow-hidden group ${isCopySource ? 'ring-2 ring-violet-500' : ''}`}>
            <img
                src={photoUrl}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover"
                alt={recipe?.name ?? ''}
            />
            {!isAddMode && !hideActions && (
                <button
                    aria-label="Retirer le dessert"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => { e.stopPropagation(); onRemove(); }}
                    className={`absolute top-0.5 right-0.5 p-0.5 bg-black/50 text-white rounded-md z-10 transition-opacity ${IS_TOUCH ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                >
                    <X size={10} />
                </button>
            )}
            {!isAddMode && !hideActions && onCopy && (
                <button
                    aria-label="Copier ce dessert"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => { e.stopPropagation(); onCopy(); }}
                    className={`absolute bottom-0.5 right-0.5 p-0.5 bg-black/50 text-violet-200 rounded-md z-10 transition-opacity ${IS_TOUCH ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                >
                    <Copy size={10} />
                </button>
            )}
        </div>
    );
};
