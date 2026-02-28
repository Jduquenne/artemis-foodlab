import React, { useState, useMemo, useRef } from 'react';
import { ChevronLeft, ChevronRight, ShoppingCart, Check } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../core/services/db';
import { MealSlot } from './components/MealSlot';
import { MultiMealSlot } from './components/MultiMealSlot';
import { RecipePicker } from './components/RecipePicker';
import { MealDragOverlay } from './components/MealDragOverlay';
import { ShoppingSelectionBar } from './components/ShoppingSelectionBar';
import { getWeekNumber, getMonday, getWeekRange } from '../../shared/utils/weekUtils';
import { useNavigate } from 'react-router-dom';
import { useMenuStore } from '../../shared/store/useMenuStore';
import { ShoppingDay } from '../../core/domain/types';
import {
    DndContext,
    DragEndEvent,
    DragStartEvent,
    DragOverlay,
    MouseSensor,
    TouchSensor,
    useSensor,
    useSensors,
    closestCenter,
} from '@dnd-kit/core';

const MEAL_SLOTS = [
    { id: 'breakfast', label: 'Petit Déjeuner', icon: '☕', multi: true },
    { id: 'lunch', label: 'Déjeuner', icon: '🍴', multi: false },
    { id: 'snack', label: 'Goûter', icon: '🍎', multi: true },
    { id: 'dinner', label: 'Dîner', icon: '🌙', multi: false },
] as const;

type SlotId = typeof MEAL_SLOTS[number]['id'];

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];


export const PlanningModule = () => {
    const navigate = useNavigate();
    const { shoppingDays, setShoppingDays } = useMenuStore();

    const [pickerSlot, setPickerSlot] = useState<{ day: string; slot: SlotId } | null>(null);
    const [activeDragId, setActiveDragId] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [draftDays, setDraftDays] = useState<ShoppingDay[]>([]);
    const [editingPersonsSlotId, setEditingPersonsSlotId] = useState<string | null>(null);

    const isAnyEditing = editingPersonsSlotId !== null;
    const dateInputRef = useRef<HTMLInputElement>(null);

    const monday = useMemo(() => getMonday(selectedDate), [selectedDate]);
    const weekNumber = useMemo(() => getWeekNumber(monday), [monday]);
    const year = monday.getFullYear();
    const weekRange = useMemo(() => getWeekRange(monday), [monday]);

    const sensors = useSensors(
        useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
    );

    const planningData = useLiveQuery(
        () => db.planning.where('[year+week]').equals([year, weekNumber]).toArray(),
        [year, weekNumber]
    ) || [];

    const activeMeal = useMemo(
        () => activeDragId
            ? planningData.find(p => `${year}-W${weekNumber}-${p.day}-${p.slot}` === activeDragId)
            : null,
        [activeDragId, planningData, year, weekNumber]
    );

    const changeWeek = (offset: number) => {
        if (isAnyEditing) return;
        const newDate = new Date(selectedDate);
        newDate.setDate(selectedDate.getDate() + (offset * 7));
        setSelectedDate(newDate);
    };

    const handleDeleteMeal = async (day: string, slot: SlotId) => {
        await db.planning.delete(`${year}-W${weekNumber}-${day}-${slot}`);
    };

    const handleRemoveRecipe = async (day: string, slot: SlotId, recipeIdToRemove: string) => {
        const existing = planningData.find(p => p.day === day && p.slot === slot);
        if (!existing) return;
        const newRecipeIds = existing.recipeIds.filter(id => id !== recipeIdToRemove);
        if (newRecipeIds.length === 0) {
            await db.planning.delete(existing.id);
        } else {
            await db.planning.put({ ...existing, recipeIds: newRecipeIds });
        }
    };

    const handleDragStart = ({ active }: DragStartEvent) => {
        setActiveDragId(active.id as string);
    };

    const handleDragEnd = async ({ active, over }: DragEndEvent) => {
        setActiveDragId(null);
        if (!over || active.id === over.id) return;

        const fromId = active.id as string;
        const toId = over.id as string;
        const prefix = `${year}-W${weekNumber}-`;

        const parseSlot = (fullId: string): { day: string; slot: SlotId } | null => {
            const rest = fullId.slice(prefix.length);
            for (const m of MEAL_SLOTS) {
                if (rest.endsWith(`-${m.id}`)) {
                    return { day: rest.slice(0, rest.length - m.id.length - 1), slot: m.id };
                }
            }
            return null;
        };

        const from = parseSlot(fromId);
        const to = parseSlot(toId);
        if (!from || !to) return;

        const fromDef = MEAL_SLOTS.find(m => m.id === from.slot);
        const toDef = MEAL_SLOTS.find(m => m.id === to.slot);
        if (!fromDef || !toDef || fromDef.multi !== toDef.multi) return;

        const fromMeal = planningData.find(p => p.day === from.day && p.slot === from.slot);
        const toMeal = planningData.find(p => p.day === to.day && p.slot === to.slot);

        if (!fromMeal) return;

        if (toMeal) {
            await db.planning.bulkPut([
                { ...fromMeal, recipeIds: toMeal.recipeIds, persons: undefined },
                { ...toMeal, recipeIds: fromMeal.recipeIds, persons: undefined },
            ]);
        } else {
            await db.planning.delete(fromMeal.id);
            await db.planning.put({
                id: toId,
                day: to.day,
                slot: to.slot,
                recipeIds: fromMeal.recipeIds,
                year,
                week: weekNumber,
            });
        }
    };

    const handleConfirmPersons = async (slotId: string, persons: number) => {
        const existing = planningData.find(p => `${year}-W${weekNumber}-${p.day}-${p.slot}` === slotId);
        if (existing) {
            await db.planning.put({ ...existing, persons });
        }
        setEditingPersonsSlotId(null);
    };

    const enterSelectionMode = () => {
        setDraftDays([...shoppingDays]);
        setIsSelectionMode(true);
        setPickerSlot(null);
    };

    const cancelSelection = () => {
        setIsSelectionMode(false);
    };

    const confirmSelection = () => {
        setShoppingDays(draftDays);
        setIsSelectionMode(false);
    };

    const toggleDraftDay = (y: number, w: number, day: string) => {
        setDraftDays(prev => {
            const exists = prev.some(d => d.year === y && d.week === w && d.day === day);
            if (exists) return prev.filter(d => !(d.year === y && d.week === w && d.day === day));
            if (prev.length >= 10) return prev;
            return [...prev, { year: y, week: w, day }];
        });
    };

    const isDayDraft = (day: string) =>
        draftDays.some(d => d.year === year && d.week === weekNumber && d.day === day);

    const isDayConfirmed = (day: string) =>
        shoppingDays.some(d => d.year === year && d.week === weekNumber && d.day === day);

    const atMax = draftDays.length >= 10;

    return (
        <DndContext
            sensors={isSelectionMode || isAnyEditing ? [] : sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="w-full h-[calc(100vh-100px)] flex flex-col p-2 gap-2 overflow-hidden">

                <div className="flex items-center justify-between gap-3 shrink-0 mb-2">
                    <div className="flex flex-col leading-tight">
                        <h1 className="text-xl sm:text-2xl tablet:text-3xl font-black text-slate-900">Ma Semaine</h1>
                        <span className="text-xs sm:text-sm font-bold text-slate-400">
                            Sem. {weekNumber} · {weekRange}
                        </span>
                    </div>

                    <div className={`flex items-center gap-2 self-center shrink-0 ${isAnyEditing ? 'opacity-40 pointer-events-none' : ''}`}>
                        <input
                            ref={dateInputRef}
                            type="date"
                            tabIndex={-1}
                            className="absolute opacity-0 w-px h-px pointer-events-none"
                            onChange={(e) => e.target.value && setSelectedDate(new Date(e.target.value))}
                        />
                        <div className="flex items-center gap-1 bg-white dark:bg-slate-100 px-2 py-1 rounded-2xl shadow-sm border border-slate-200">
                            <button onClick={() => changeWeek(-1)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-200 rounded-xl transition-colors">
                                <ChevronLeft size={18} className="text-slate-600" />
                            </button>
                            <button
                                onClick={() => dateInputRef.current?.showPicker?.()}
                                className="sm:hidden px-2 py-1 text-xs font-bold text-slate-500 hover:bg-orange-50 hover:text-orange-500 rounded-xl transition-colors"
                            >
                                Sem. {weekNumber}
                            </button>
                            <input
                                type="date"
                                className="hidden sm:block h-8 px-2 bg-slate-100 dark:bg-slate-200 rounded-xl text-xs font-semibold text-slate-500 border-0 outline-none cursor-pointer hover:bg-orange-50 focus:ring-2 focus:ring-orange-400 scheme-light dark:scheme-dark transition-colors"
                                onChange={(e) => e.target.value && setSelectedDate(new Date(e.target.value))}
                            />
                            <button onClick={() => changeWeek(1)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-200 rounded-xl transition-colors">
                                <ChevronRight size={18} className="text-slate-600" />
                            </button>
                        </div>

                        {!isSelectionMode && (
                            <button
                                onClick={isAnyEditing ? undefined : enterSelectionMode}
                                className={[
                                    'flex items-center gap-1.5 px-3 py-2 rounded-2xl shadow-sm border font-bold text-sm transition-colors',
                                    isAnyEditing
                                        ? 'opacity-40 pointer-events-none bg-white dark:bg-slate-100 border-slate-200 text-slate-600'
                                        : shoppingDays.length > 0
                                            ? 'bg-orange-500 border-orange-400 text-white hover:bg-orange-600'
                                            : 'bg-white dark:bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-200',
                                ].join(' ')}
                            >
                                <ShoppingCart size={15} />
                                <span className="hidden sm:inline">Courses</span>
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex-1 grid grid-cols-[repeat(7,1fr)] grid-rows-[30px_repeat(4,1fr)] gap-3 min-h-0 px-2 pb-2">
                    {DAYS.map(day => {
                        const selected = isSelectionMode && isDayDraft(day);
                        const confirmed = !isSelectionMode && isDayConfirmed(day);
                        const blocked = isSelectionMode && !selected && atMax;

                        return (
                            <div
                                key={day}
                                onClick={isSelectionMode && !blocked ? () => toggleDraftDay(year, weekNumber, day) : undefined}
                                className={[
                                    'flex items-center justify-center gap-1 font-black uppercase text-xs tracking-widest rounded-lg transition-colors select-none',
                                    isSelectionMode ? (blocked ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer') : '',
                                    selected ? 'text-orange-500 bg-orange-100 dark:bg-orange-900/30' : '',
                                    confirmed ? 'text-orange-400' : 'text-slate-400',
                                    isSelectionMode && !selected && !blocked ? 'hover:bg-slate-100 dark:hover:bg-slate-700/40' : '',
                                ].join(' ')}
                            >
                                {selected && <Check className="w-3 h-3 shrink-0" />}
                                {confirmed && !isSelectionMode && <ShoppingCart className="w-2.5 h-2.5 shrink-0" />}
                                <span>{day.slice(0, 3)}</span>
                            </div>
                        );
                    })}

                    {MEAL_SLOTS.map((mealType) => (
                        <React.Fragment key={mealType.id}>
                            {DAYS.map(day => {
                                const slotId = `${year}-W${weekNumber}-${day}-${mealType.id}`;
                                const savedMeal = planningData.find(p => p.day === day && p.slot === mealType.id);
                                const recipeIds = savedMeal?.recipeIds ?? [];
                                const isEditingThis = editingPersonsSlotId === slotId;
                                const isDimmed = isAnyEditing && !isEditingThis;

                                return (
                                    <div
                                        key={`${day}-${mealType.id}`}
                                        className={`relative h-full w-full min-h-0 min-w-0 transition-opacity ${isDimmed ? 'pointer-events-none opacity-30' : ''}`}
                                    >
                                        {mealType.multi ? (
                                            <MultiMealSlot
                                                label={mealType.label}
                                                icon={mealType.icon}
                                                slotId={slotId}
                                                recipeIds={recipeIds}
                                                onAdd={isSelectionMode ? () => {} : () => setPickerSlot({ day, slot: mealType.id })}
                                                onRemoveRecipe={isSelectionMode ? () => {} : (rid) => handleRemoveRecipe(day, mealType.id, rid)}
                                                onNavigateToRecipe={(rid) => navigate(`/recipes/detail/${rid}`)}
                                            />
                                        ) : (
                                            <MealSlot
                                                label={mealType.label}
                                                icon={mealType.icon}
                                                slotId={slotId}
                                                recipeIds={recipeIds}
                                                persons={savedMeal?.persons}
                                                isEditingPersons={isEditingThis}
                                                isAnyEditing={isAnyEditing}
                                                onNavigate={() => navigate(`/recipes/detail/${savedMeal!.recipeIds[0]}`)}
                                                onOpenPicker={isSelectionMode ? () => {} : () => setPickerSlot({ day, slot: mealType.id })}
                                                onModify={isSelectionMode ? () => {} : () => setPickerSlot({ day, slot: mealType.id })}
                                                onDelete={isSelectionMode ? () => {} : () => handleDeleteMeal(day, mealType.id)}
                                                onOpenPersonsEditor={() => setEditingPersonsSlotId(slotId)}
                                                onConfirmPersons={(n) => handleConfirmPersons(slotId, n)}
                                                onCancelPersons={() => setEditingPersonsSlotId(null)}
                                            />
                                        )}
                                    </div>
                                );
                            })}
                        </React.Fragment>
                    ))}
                </div>

                {isSelectionMode && (
                    <ShoppingSelectionBar
                        count={draftDays.length}
                        onConfirm={confirmSelection}
                        onCancel={cancelSelection}
                    />
                )}

                {!isSelectionMode && pickerSlot && (
                    <RecipePicker
                        slotName={`${pickerSlot.day} - ${pickerSlot.slot}`}
                        existingRecipeIds={
                            MEAL_SLOTS.find(m => m.id === pickerSlot.slot)?.multi
                                ? (planningData.find(p => p.day === pickerSlot.day && p.slot === pickerSlot.slot)?.recipeIds ?? [])
                                : []
                        }
                        onSelect={async (recipe) => {
                            const slotId = `${year}-W${weekNumber}-${pickerSlot.day}-${pickerSlot.slot}`;
                            const isMulti = MEAL_SLOTS.find(m => m.id === pickerSlot.slot)?.multi ?? false;
                            const existing = planningData.find(p => p.day === pickerSlot.day && p.slot === pickerSlot.slot);

                            if (isMulti && existing && existing.recipeIds.length < 4 && !existing.recipeIds.includes(recipe.recipeId)) {
                                await db.planning.put({
                                    ...existing,
                                    recipeIds: [...existing.recipeIds, recipe.recipeId],
                                });
                            } else {
                                await db.planning.put({
                                    id: slotId,
                                    day: pickerSlot.day,
                                    slot: pickerSlot.slot,
                                    recipeIds: [recipe.recipeId],
                                    year,
                                    week: weekNumber,
                                });
                            }
                            setPickerSlot(null);
                        }}
                        onClose={() => setPickerSlot(null)}
                    />
                )}
            </div>

            <DragOverlay dropAnimation={null}>
                {activeMeal && activeMeal.recipeIds.length > 0 && (
                    <MealDragOverlay recipeId={activeMeal.recipeIds[0]} />
                )}
            </DragOverlay>
        </DndContext>
    );
};
