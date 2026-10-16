import { useState } from 'react';
import { DndContext, DragEndEvent, KeyboardSensor, PointerSensor, TouchSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { ListOrdered, Loader2, RotateCcw } from 'lucide-react';
import { ShoppingAisle } from '../../../../core/domain/shopping';
import {
    defaultShoppingAisles,
    moveShoppingAisle,
    shoppingAisleOrderPayload,
} from '../../../../core/logic/shopping/shoppingCategoryOrderLogic';
import { useCustomShoppingCategoryStore } from '../../../../shared/store/useCustomShoppingCategoryStore';
import { updateMe } from '../../../../core/services/authService';
import { usePendingKey } from '../../../../shared/hooks/usePendingKey';
import { useAuthStore } from '../../../../shared/store/useAuthStore';
import { withPending } from '../../../../shared/utils/withPending';
import { SortableCategoryRow } from './SortableCategoryRow';

export interface CategoryOrderModalProps {
    initialOrder: ShoppingAisle[];
    onClose: () => void;
}

const PENDING_KEY = 'shopping-category-order';

export const CategoryOrderModal = ({ initialOrder, onClose }: CategoryOrderModalProps) => {
    const setUser = useAuthStore((s) => s.setUser);
    const pending = usePendingKey(PENDING_KEY);
    const customCategories = useCustomShoppingCategoryStore((s) => s.categories);
    const [order, setOrder] = useState<ShoppingAisle[]>(initialOrder);
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    );

    const handleDragEnd = ({ active, over }: DragEndEvent) => {
        if (!over || active.id === over.id) return;
        setOrder((prev) => moveShoppingAisle(
            prev,
            prev.findIndex((a) => a.id === active.id),
            prev.findIndex((a) => a.id === over.id),
        ));
    };

    const save = async () => {
        const ok = await withPending(PENDING_KEY, async () => {
            setUser(await updateMe({ shoppingCategoryOrder: shoppingAisleOrderPayload(order, customCategories) }));
            return true;
        }).catch(() => false);
        if (ok) onClose();
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-surface-raised rounded-2xl shadow-2xl w-full max-w-sm flex flex-col max-h-[90dvh]">
                <div className="px-5 pt-5 pb-3 shrink-0">
                    <p className="text-xs font-black text-orange-600 uppercase tracking-widest flex items-center gap-1.5">
                        <ListOrdered className="w-3.5 h-3.5" />
                        Ordre des rayons
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                        Range les rayons dans l'ordre de ton parcours en magasin. « Autres » et « Articles du quotidien » restent à la fin.
                    </p>
                </div>

                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={order.map((a) => a.id)} strategy={verticalListSortingStrategy}>
                        <ul className="flex-1 min-h-0 overflow-y-auto px-5 flex flex-col gap-1.5">
                            {order.map((aisle, index) => (
                                <SortableCategoryRow
                                    key={aisle.id}
                                    aisle={aisle}
                                    position={index + 1}
                                    isFirst={index === 0}
                                    isLast={index === order.length - 1}
                                    disabled={pending}
                                    onMove={(delta) => setOrder((prev) => moveShoppingAisle(prev, index, index + delta))}
                                />
                            ))}
                        </ul>
                    </SortableContext>
                </DndContext>

                <div className="px-5 pt-3 pb-5 flex flex-col gap-2 shrink-0">
                    <button
                        type="button"
                        onClick={() => setOrder(defaultShoppingAisles(customCategories))}
                        disabled={pending}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-slate-200 text-slate-500 text-sm font-semibold hover:text-orange-600 hover:border-orange-300 transition-colors disabled:opacity-50"
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Ordre par défaut
                    </button>
                    <button
                        type="button"
                        onClick={save}
                        disabled={pending}
                        className="w-full py-2.5 rounded-xl bg-orange-500 text-white text-sm font-bold hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {pending && <Loader2 className="w-4 h-4 animate-spin" />}
                        Enregistrer
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={pending}
                        className="w-full py-2 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"
                    >
                        Annuler
                    </button>
                </div>
            </div>
        </div>
    );
};
