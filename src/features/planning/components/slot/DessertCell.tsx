import { useState } from 'react';
import { X, Copy, Users, Minus, Plus, Check } from 'lucide-react';
import { plannableDb } from '../../../../core/typed-db/plannableDb';
import { IS_TOUCH } from '../../../../shared/utils/deviceUtils';

export interface DessertCellProps {
    recipeId: string;
    onRemove: () => void;
    isAddMode?: boolean;
    onCopy?: () => void;
    isCopySource?: boolean;
    hideActions?: boolean;
    persons?: number;
    isPersonsCustom?: boolean;
    onSetPersons?: (n: number) => void;
}

export const DessertCell = ({ recipeId, onRemove, isAddMode, onCopy, isCopySource, hideActions, persons, isPersonsCustom, onSetPersons }: DessertCellProps) => {
    const recipe = plannableDb[recipeId];
    const photoUrl = recipe?.assets?.photo?.url;
    const [isEditingPersons, setIsEditingPersons] = useState(false);
    const [draft, setDraft] = useState(persons ?? 1);

    if (!photoUrl) return null;

    const openEditor = (e: React.MouseEvent | React.PointerEvent) => {
        e.stopPropagation();
        setDraft(persons ?? 1);
        setIsEditingPersons(true);
    };

    const confirmPersons = (e: React.MouseEvent) => {
        e.stopPropagation();
        onSetPersons?.(draft);
        setIsEditingPersons(false);
    };

    const cancelPersons = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsEditingPersons(false);
    };

    return (
        <div className={`relative flex-1 min-h-0 rounded-lg overflow-hidden group ${isCopySource ? 'ring-2 ring-violet-500' : ''}`}>
            <img
                src={photoUrl}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover"
                alt={recipe?.name ?? ''}
            />

            {!isAddMode && !hideActions && !isEditingPersons && (
                <button
                    aria-label="Retirer le dessert"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => { e.stopPropagation(); onRemove(); }}
                    className={`absolute top-0.5 right-0.5 p-0.5 bg-black/50 text-white rounded-md z-10 transition-opacity ${IS_TOUCH ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                >
                    <X size={10} />
                </button>
            )}

            {!isAddMode && !hideActions && onCopy && !isEditingPersons && (
                <button
                    aria-label="Copier ce dessert"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => { e.stopPropagation(); onCopy(); }}
                    className={`absolute bottom-0.5 right-0.5 p-0.5 bg-black/50 text-violet-200 rounded-md z-10 transition-opacity ${IS_TOUCH ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                >
                    <Copy size={10} />
                </button>
            )}

            {!isAddMode && !hideActions && onSetPersons && !isEditingPersons && (
                <button
                    aria-label="Modifier le nombre de personnes"
                    onPointerDown={openEditor}
                    onClick={(e) => e.stopPropagation()}
                    className={`absolute bottom-0.5 left-0.5 flex items-center gap-0.5 text-[9px] font-black px-1 py-0.5 rounded-md z-10 shadow transition-opacity ${isPersonsCustom ? 'bg-orange-500 text-white' : 'bg-black/40 text-white'} ${IS_TOUCH ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                >
                    <Users size={8} />
                    {persons ?? 1}
                </button>
            )}

            {isEditingPersons && (
                <div
                    className="absolute inset-0 z-20 bg-white/95 dark:bg-slate-100/95 rounded-lg flex flex-col items-center justify-center gap-1 px-1"
                    onPointerDown={(e) => e.stopPropagation()}
                >
                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">Pers.</span>
                    <div className="flex items-center gap-0.5">
                        <button
                            onClick={(e) => { e.stopPropagation(); setDraft(v => Math.max(1, v - 1)); }}
                            className="w-5 h-5 flex items-center justify-center rounded bg-slate-100 dark:bg-slate-200 text-slate-600 hover:bg-slate-200"
                        >
                            <Minus size={10} />
                        </button>
                        <span className="text-base font-black text-slate-900 w-6 text-center">{draft}</span>
                        <button
                            onClick={(e) => { e.stopPropagation(); setDraft(v => Math.min(10, v + 1)); }}
                            className="w-5 h-5 flex items-center justify-center rounded bg-slate-100 dark:bg-slate-200 text-slate-600 hover:bg-slate-200"
                        >
                            <Plus size={10} />
                        </button>
                    </div>
                    <div className="flex gap-1">
                        <button onClick={confirmPersons} className="p-1 bg-orange-500 text-white rounded-md">
                            <Check size={10} />
                        </button>
                        <button onClick={cancelPersons} className="p-1 bg-slate-200 dark:bg-slate-300 text-slate-600 rounded-md">
                            <X size={10} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
