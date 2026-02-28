import { useRef, useEffect, useState } from 'react';
import { Plus, RefreshCw, Trash2, GripVertical, Users, Check, X, RotateCcw } from 'lucide-react';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { RecipeDetails } from '../../../core/domain/types';
import recipesDb from '../../../core/data/recipes-db.json';

const IS_TOUCH = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);

interface MealSlotProps {
    label: string;
    icon: string;
    slotId: string;
    recipeIds: string[];
    persons?: number;
    isEditingPersons: boolean;
    isAnyEditing: boolean;
    onNavigate: () => void;
    onOpenPicker: () => void;
    onModify?: () => void;
    onDelete?: () => void;
    onOpenPersonsEditor: () => void;
    onConfirmPersons: (n: number) => void;
    onCancelPersons: () => void;
}

export const MealSlot = ({
    label, icon, slotId, recipeIds, persons,
    isEditingPersons, isAnyEditing,
    onNavigate, onOpenPicker, onModify, onDelete,
    onOpenPersonsEditor, onConfirmPersons, onCancelPersons,
}: MealSlotProps) => {
    const data = recipesDb as unknown as Record<string, RecipeDetails>;
    const firstId = recipeIds[0];
    const recipe = firstId ? data[firstId] : undefined;
    const photoUrl = recipe?.assets?.photo?.url;
    const hasRecipesPage = Boolean(recipe?.assets?.recipes?.url);
    const defaultPortion = recipe?.portion;

    const [draft, setDraft] = useState<number>(persons ?? defaultPortion ?? 2);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isEditingPersons) {
            setDraft(persons ?? defaultPortion ?? 2);
            inputRef.current?.focus();
            inputRef.current?.select();
        }
    }, [isEditingPersons]);

    const { setNodeRef: setDropRef, isOver } = useDroppable({ id: slotId });
    const { setNodeRef: setDragRef, listeners, attributes, isDragging } = useDraggable({
        id: slotId,
        disabled: recipeIds.length === 0 || isAnyEditing || IS_TOUCH,
    });

    const setRef = (el: HTMLDivElement | null) => {
        setDropRef(el);
        setDragRef(el);
    };

    const handleMainClick = () => {
        if (isAnyEditing) return;
        if (photoUrl) {
            if (hasRecipesPage) onNavigate();
        } else {
            onOpenPicker();
        }
    };

    const borderClass = isDragging
        ? 'opacity-30 border-slate-200'
        : isOver
            ? 'border-orange-400 bg-orange-50/40'
            : photoUrl
                ? 'border-slate-200 shadow-sm hover:border-orange-200'
                : 'border-dashed border-slate-200 hover:bg-orange-50/30';

    const displayPersons = persons ?? defaultPortion;
    const isCustom = persons !== undefined;

    return (
        <div ref={setRef} className="relative w-full h-full group">
            <button
                onClick={handleMainClick}
                className={`relative w-full h-full rounded-xl border-2 transition-all overflow-hidden bg-white dark:bg-slate-100 ${borderClass} ${photoUrl && !hasRecipesPage ? 'cursor-default' : ''}`}
            >
                {photoUrl ? (
                    <img src={photoUrl} className="w-full h-full object-contain" alt={recipe!.name} />
                ) : (
                    <div className="flex flex-col items-center justify-center gap-1 h-full w-full opacity-40">
                        <span className="text-2xl">{icon}</span>
                        <span className="text-[12px] font-black uppercase tracking-tighter">{label}</span>
                        <Plus size={20} className="absolute bottom-1 right-1" />
                    </div>
                )}
            </button>

            {photoUrl && !isEditingPersons && !isDragging && displayPersons !== undefined && (
                <div className="absolute top-1 right-1 z-10 pointer-events-none">
                    <span className={`flex items-center gap-0.5 text-[10px] font-black px-1.5 py-0.5 rounded-lg shadow ${isCustom ? 'bg-orange-500 text-white' : 'bg-black/30 text-white'}`}>
                        <Users size={9} />
                        {displayPersons}
                    </span>
                </div>
            )}

            {photoUrl && !isDragging && !isEditingPersons && (
                <>
                    {!IS_TOUCH && (
                        <div
                            {...listeners}
                            {...attributes}
                            className="absolute top-1 left-4 -translate-x-1/2 p-0.5 bg-white/90 dark:bg-slate-200/90 rounded-md cursor-grab active:cursor-grabbing z-20 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm border border-slate-200"
                        >
                            <GripVertical size={14} className="text-slate-400" />
                        </div>
                    )}

                    <button
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => { e.stopPropagation(); if (!isAnyEditing) onOpenPersonsEditor(); }}
                        className="absolute top-1 right-1 p-1.5 bg-white/90 dark:bg-slate-200/90 text-slate-500 rounded-lg shadow-md border border-slate-200 hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-orange-950/40 z-20 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <Users size={14} />
                    </button>

                    <button
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => { e.stopPropagation(); onModify?.(); }}
                        className="absolute bottom-1 left-1 p-1.5 bg-white/90 dark:bg-slate-200/90 text-blue-600 rounded-lg shadow-md border border-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950/40 z-20 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <RefreshCw size={14} />
                    </button>

                    <button
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
                        className="absolute bottom-1 right-1 p-1.5 bg-white/90 dark:bg-slate-200/90 text-red-500 rounded-lg shadow-md border border-slate-200 hover:bg-red-50 dark:hover:bg-red-950/40 z-20 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <Trash2 size={14} />
                    </button>
                </>
            )}

            {isEditingPersons && (
                <div className="absolute inset-0 z-30 bg-white/97 dark:bg-slate-100/97 rounded-xl flex flex-col items-center justify-center gap-3 px-3">
                    <span className="text-[11px] font-black uppercase tracking-widest text-slate-500">Personnes ?</span>
                    <input
                        ref={inputRef}
                        type="number"
                        min="1"
                        value={draft}
                        onChange={(e) => setDraft(Math.max(1, parseInt(e.target.value) || 1))}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') onConfirmPersons(draft);
                            if (e.key === 'Escape') onCancelPersons();
                        }}
                        className="w-16 text-center text-2xl font-black text-slate-900 bg-slate-100 dark:bg-slate-200 rounded-xl py-1.5 border-0 outline-none focus:ring-2 focus:ring-orange-400"
                    />
                    <div className="flex gap-2">
                        <button
                            onPointerDown={(e) => e.stopPropagation()}
                            onClick={() => onConfirmPersons(draft)}
                            className="p-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors"
                        >
                            <Check size={15} />
                        </button>
                        <button
                            onPointerDown={(e) => e.stopPropagation()}
                            onClick={() => setDraft(defaultPortion ?? 2)}
                            title="Remettre par défaut"
                            className="p-2 bg-slate-200 dark:bg-slate-300 text-slate-500 rounded-xl hover:bg-slate-300 transition-colors"
                        >
                            <RotateCcw size={15} />
                        </button>
                        <button
                            onPointerDown={(e) => e.stopPropagation()}
                            onClick={onCancelPersons}
                            className="p-2 bg-slate-200 dark:bg-slate-300 text-slate-600 rounded-xl hover:bg-slate-300 transition-colors"
                        >
                            <X size={15} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
