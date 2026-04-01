import React, { useState, useMemo, useRef } from 'react';
import { useFreezerStock } from '../../shared/hooks/useFreezerStock';
import { Check, X, ShoppingCart } from 'lucide-react';
import { typedRecipesDb as recipesDb } from '../../core/typed-db/typedRecipesDb';
import { plannableDb } from '../../core/typed-db/plannableDb';
import { CopyModeBar } from './components/bars/CopyModeBar';
import { useLiveQuery } from 'dexie-react-hooks';
import { getWeekSlots, saveSlot, deleteSlot, bulkSaveSlots, addDessertToSlot, removeDessertFromSlot, setRecipePersonsOnSlot } from '../../core/services/planningService';
import { MealDragOverlay } from './components/MealDragOverlay';
import { RecipePicker } from './components/pickers/RecipePicker';
import { DessertPicker } from './components/pickers/DessertPicker';
import { ShoppingSelectionBar } from './components/bars/ShoppingSelectionBar';
import { PlanningHeader } from './components/PlanningHeader';
import { PlanningSlot } from './components/slot/PlanningSlot';
import { DayTabsBar } from './components/bars/DayTabsBar';
import { getWeekNumber, getMonday, getWeekRange } from '../../shared/utils/weekUtils';
import { useSearchParams } from 'react-router-dom';
import { useMenuStore } from '../../shared/store/useMenuStore';
import { SlotType, ShoppingDay } from '../../core/domain/types';
import { isDessert, canAddDessert, isSlotFull } from '../../core/domain/recipePredicates';
import { MEAL_SLOTS, DAYS, CopyState } from '../../core/domain/planningConfig';
import { computeSlotCopyProps } from '../../core/utils/planningUtils';
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

const todayDayName = (() => {
    const d = new Date().getDay();
    return DAYS[d === 0 ? 6 : d - 1];
})();

export const PlanningModule = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const { shoppingDays, setShoppingDays } = useMenuStore();
    const { batchRecipeIds } = useFreezerStock();

    const [pickerSlot, setPickerSlot] = useState<{ day: string; slot: SlotType } | null>(null);
    const [dessertPickerSlot, setDessertPickerSlot] = useState<{ day: string; slot: SlotType } | null>(null);
    const [activeDragId, setActiveDragId] = useState<string | null>(null);
    const [slideKey, setSlideKey] = useState(0);
    const [slideDir, setSlideDir] = useState<'left' | 'right'>('left');
    const swipeStartX = useRef<number | null>(null);
    const swipeStartY = useRef<number | null>(null);

    const selectedDay = searchParams.get('day') ?? todayDayName;
    const selectedDate = useMemo(() => {
        const d = searchParams.get('d');
        return d ? new Date(d + 'T12:00:00') : new Date();
    }, [searchParams]);

    const setSelectedDay = (day: string) =>
        setSearchParams(p => { p.set('day', day); return p; }, { replace: true });
    const setSelectedDate = (date: Date) =>
        setSearchParams(p => { p.set('d', date.toISOString().slice(0, 10)); return p; }, { replace: true });

    const addRecipeId = searchParams.get('addRecipe');
    const isAddMode = !!addRecipeId;
    const addRecipeName = addRecipeId ? recipesDb[addRecipeId]?.name ?? '' : null;
    const clearAddMode = () =>
        setSearchParams(p => { p.delete('addRecipe'); return p; }, { replace: true });

    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [draftDays, setDraftDays] = useState<ShoppingDay[]>([]);
    const [editingPersonsSlotId, setEditingPersonsSlotId] = useState<string | null>(null);
    const [copyState, setCopyState] = useState<CopyState | null>(null);
    const [copyTargets, setCopyTargets] = useState<Set<string>>(new Set());

    const isAnyEditing = editingPersonsSlotId !== null;
    const isCopyMode = !!copyState;

    const monday = useMemo(() => getMonday(selectedDate), [selectedDate]);
    const weekNumber = useMemo(() => getWeekNumber(monday), [monday]);
    const year = monday.getFullYear();
    const weekRange = useMemo(() => getWeekRange(monday), [monday]);
    const selectedDayDate = useMemo(() => {
        const d = new Date(monday);
        d.setDate(d.getDate() + (DAYS as readonly string[]).indexOf(selectedDay));
        return d.toISOString().slice(0, 10);
    }, [monday, selectedDay]);

    const sensors = useSensors(
        useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
    );

    const liveData = useLiveQuery(
        () => getWeekSlots(year, weekNumber),
        [year, weekNumber]
    );
    const planningData = useMemo(() => liveData ?? [], [liveData]);

    const activeMeal = useMemo(
        () => activeDragId ? planningData.find(p => `${year}-W${weekNumber}-${p.day}-${p.slot}` === activeDragId) : null,
        [activeDragId, planningData, year, weekNumber]
    );

    const changeWeek = (offset: number) => {
        if (isAnyEditing) return;
        const d = new Date(selectedDate);
        d.setDate(d.getDate() + offset * 7);
        setSelectedDate(d);
    };

    const handleSwipe = (direction: 'left' | 'right') => {
        if (isAnyEditing || isSelectionMode) return;
        setSlideDir(direction);
        setSlideKey(k => k + 1);
        const currentIndex = (DAYS as readonly string[]).indexOf(selectedDay);
        if (direction === 'left') {
            if (currentIndex < 6) {
                setSelectedDay(DAYS[currentIndex + 1]);
            } else {
                const next = new Date(selectedDate);
                next.setDate(next.getDate() + 7);
                setSearchParams(p => { p.set('day', DAYS[0]); p.set('d', next.toISOString().slice(0, 10)); return p; }, { replace: true });
            }
        } else {
            if (currentIndex > 0) {
                setSelectedDay(DAYS[currentIndex - 1]);
            } else {
                const prev = new Date(selectedDate);
                prev.setDate(prev.getDate() - 7);
                setSearchParams(p => { p.set('day', DAYS[6]); p.set('d', prev.toISOString().slice(0, 10)); return p; }, { replace: true });
            }
        }
    };

    const onSwipeTouchStart = (e: React.TouchEvent) => {
        swipeStartX.current = e.touches[0].clientX;
        swipeStartY.current = e.touches[0].clientY;
    };

    const onSwipeTouchEnd = (e: React.TouchEvent) => {
        if (swipeStartX.current === null || swipeStartY.current === null) return;
        const dx = e.changedTouches[0].clientX - swipeStartX.current;
        const dy = e.changedTouches[0].clientY - swipeStartY.current;
        swipeStartX.current = null;
        swipeStartY.current = null;
        if (Math.abs(dx) < 50 || Math.abs(dy) > Math.abs(dx)) return;
        handleSwipe(dx < 0 ? 'left' : 'right');
    };

    const handleDeleteMeal = async (day: string, slot: SlotType) => {
        await deleteSlot(`${year}-W${weekNumber}-${day}-${slot}`);
    };

    const handleAddDessert = async (day: string, slot: SlotType, recipeId: string) => {
        const savedSlot = planningData.find(p => p.day === day && p.slot === slot);
        if (!savedSlot) return;
        await addDessertToSlot(savedSlot, recipeId);
    };

    const handleRemoveDessert = async (day: string, slot: SlotType, recipeId: string) => {
        const savedSlot = planningData.find(p => p.day === day && p.slot === slot);
        if (!savedSlot) return;
        await removeDessertFromSlot(savedSlot, recipeId);
    };

    const handleRemoveRecipe = async (day: string, slot: SlotType, recipeIdToRemove: string) => {
        const existing = planningData.find(p => p.day === day && p.slot === slot);
        if (!existing) return;
        const ids = existing.recipeIds.filter(id => id !== recipeIdToRemove);
        if (ids.length === 0) await deleteSlot(existing.id);
        else await saveSlot({ ...existing, recipeIds: ids });
    };

    const handleDragStart = ({ active }: DragStartEvent) => setActiveDragId(active.id as string);

    const handleDragEnd = async ({ active, over }: DragEndEvent) => {
        setActiveDragId(null);
        if (!over || active.id === over.id) return;

        const prefix = `${year}-W${weekNumber}-`;
        const parseSlot = (fullId: string): { day: string; slot: SlotType } | null => {
            const rest = fullId.slice(prefix.length);
            for (const m of MEAL_SLOTS) {
                if (rest.endsWith(`-${m.id}`)) return { day: rest.slice(0, rest.length - m.id.length - 1), slot: m.id };
            }
            return null;
        };

        const from = parseSlot(active.id as string);
        const to = parseSlot(over.id as string);
        if (!from || !to) return;

        const fromDef = MEAL_SLOTS.find(m => m.id === from.slot);
        const toDef = MEAL_SLOTS.find(m => m.id === to.slot);
        if (!fromDef || !toDef || fromDef.multi !== toDef.multi) return;

        const fromMeal = planningData.find(p => p.day === from.day && p.slot === from.slot);
        const toMeal = planningData.find(p => p.day === to.day && p.slot === to.slot);
        if (!fromMeal) return;

        if (toMeal) {
            await bulkSaveSlots([
                { ...fromMeal, recipeIds: toMeal.recipeIds, persons: undefined, recipePersons: undefined, recipeQuantities: undefined },
                { ...toMeal, recipeIds: fromMeal.recipeIds, persons: undefined, recipePersons: undefined, recipeQuantities: undefined },
            ]);
        } else {
            await deleteSlot(fromMeal.id);
            await saveSlot({ id: over.id as string, day: to.day, slot: to.slot, recipeIds: fromMeal.recipeIds, year, week: weekNumber });
        }
    };

    const handleStartCopy = (recipeId: string, slotType: SlotType, sourceDay: string, isDessertCopy: boolean) => {
        const recipeName = plannableDb[recipeId]?.name ?? '';
        const sourceSlot = planningData.find(p => p.day === sourceDay && p.slot === slotType);
        const sourcePersons = sourceSlot?.recipePersons?.[recipeId];
        setCopyState({ recipeId, slotType, sourceDay, isDessert: isDessertCopy, recipeName, sourcePersons });
        setCopyTargets(new Set());
    };

    const handleSetDessertPersons = async (day: string, slot: SlotType, dessertId: string, persons: number) => {
        const existing = planningData.find(p => p.day === day && p.slot === slot);
        if (!existing) return;
        await setRecipePersonsOnSlot(existing, dessertId, persons);
    };

    const toggleCopyTarget = (day: string, slotType: SlotType) => {
        const key = `${day}|${slotType}`;
        setCopyTargets(prev => {
            const next = new Set(prev);
            if (next.has(key)) { next.delete(key); } else { next.add(key); }
            return next;
        });
    };

    const confirmCopy = async () => {
        if (!copyState) return;
        const { recipeId, sourcePersons } = copyState;
        for (const target of copyTargets) {
            const sep = target.indexOf('|');
            const targetDay = target.slice(0, sep);
            const targetSlot = target.slice(sep + 1) as SlotType;
            const slotId = `${year}-W${weekNumber}-${targetDay}-${targetSlot}`;
            const existing = planningData.find(p => p.day === targetDay && p.slot === targetSlot);
            const personsUpdate = sourcePersons !== undefined
                ? { recipePersons: { ...existing?.recipePersons, [recipeId]: sourcePersons } }
                : {};
            if (copyState.isDessert) {
                if (existing && canAddDessert(existing) && !existing.dessertIds?.includes(recipeId)) {
                    await saveSlot({ ...existing, dessertIds: [...(existing.dessertIds ?? []), recipeId], ...personsUpdate });
                }
            } else {
                if (!existing) {
                    await saveSlot({ id: slotId, day: targetDay, slot: targetSlot, recipeIds: [recipeId], year, week: weekNumber, ...personsUpdate });
                } else if (!isSlotFull(existing) && !existing.recipeIds.includes(recipeId)) {
                    await saveSlot({ ...existing, recipeIds: [...existing.recipeIds, recipeId], ...personsUpdate });
                }
            }
        }
        setCopyState(null);
        setCopyTargets(new Set());
    };

    const cancelCopy = () => {
        setCopyState(null);
        setCopyTargets(new Set());
    };

    const handleConfirmPersons = async (slotId: string, persons: number) => {
        const existing = planningData.find(p => `${year}-W${weekNumber}-${p.day}-${p.slot}` === slotId);
        if (existing) await saveSlot({ ...existing, persons });
        setEditingPersonsSlotId(null);
    };

    const handleSaveRecipeMeta = async (day: string, slot: SlotType, recipeId: string, persons: number, grams: number) => {
        const existing = planningData.find(p => p.day === day && p.slot === slot);
        if (!existing) return;
        await saveSlot({
            ...existing,
            recipePersons: { ...existing.recipePersons, [recipeId]: persons },
            recipeQuantities: { ...existing.recipeQuantities, [recipeId]: grams },
        });
    };

    const handleAddToSlot = async (day: string, slot: SlotType) => {
        if (!addRecipeId) return;
        const slotId = `${year}-W${weekNumber}-${day}-${slot}`;
        const mealDef = MEAL_SLOTS.find(m => m.id === slot)!;
        const existing = planningData.find(p => p.day === day && p.slot === slot);
        const recipe = recipesDb[addRecipeId];
        if (mealDef.hasDessert && existing?.recipeIds.length && isDessert(recipe)) {
            if (existing && canAddDessert(existing)) {
                await addDessertToSlot(existing, addRecipeId);
                clearAddMode();
            }
            return;
        }
        if (mealDef.multi) {
            const ids = existing?.recipeIds ?? [];
            if (isSlotFull({ recipeIds: ids })) return;
            await saveSlot({ id: slotId, day, slot, recipeIds: [...ids, addRecipeId], year, week: weekNumber });
        } else {
            await saveSlot({ id: slotId, day, slot, recipeIds: [addRecipeId], year, week: weekNumber });
        }
        clearAddMode();
    };

    const enterSelectionMode = () => { setDraftDays([...shoppingDays]); setIsSelectionMode(true); setPickerSlot(null); };
    const cancelSelection = () => setIsSelectionMode(false);
    const confirmSelection = () => { setShoppingDays(draftDays); setIsSelectionMode(false); };

    const toggleDraftDay = (y: number, w: number, day: string) => {
        setDraftDays(prev => {
            const exists = prev.some(d => d.year === y && d.week === w && d.day === day);
            if (exists) return prev.filter(d => !(d.year === y && d.week === w && d.day === day));
            if (prev.length >= 10) return prev;
            return [...prev, { year: y, week: w, day }];
        });
    };

    const isDayDraft = (day: string) => draftDays.some(d => d.year === year && d.week === weekNumber && d.day === day);
    const isDayConfirmed = (day: string) => shoppingDays.some(d => d.year === year && d.week === weekNumber && d.day === day);
    const atMax = draftDays.length >= 10;

    const renderSlot = (day: string, mealType: typeof MEAL_SLOTS[number]) => {
        const slotId = `${year}-W${weekNumber}-${day}-${mealType.id}`;
        const savedMeal = planningData.find(p => p.day === day && p.slot === mealType.id);
        const isEditingThis = editingPersonsSlotId === slotId;
        const copyProps = computeSlotCopyProps(copyState, copyTargets, day, mealType, savedMeal);
        const isDimmed = (isAnyEditing && !isEditingThis) || (isCopyMode && !copyProps.isCopyRelevant);

        return (
            <PlanningSlot
                key={`${day}-${mealType.id}`}
                mealType={mealType}
                slotId={slotId}
                savedMeal={savedMeal}
                isEditingPersons={isEditingThis}
                isDimmed={isDimmed}
                isAnyEditing={isAnyEditing}
                isSelectionMode={isSelectionMode}
                isAddMode={isAddMode}
                isCopyMode={isCopyMode}
                copyProps={copyProps}
                onOpenPicker={() => setPickerSlot({ day, slot: mealType.id })}
                onOpenDessertPicker={() => setDessertPickerSlot({ day, slot: mealType.id })}
                onDelete={() => handleDeleteMeal(day, mealType.id)}
                onAddToSlot={() => handleAddToSlot(day, mealType.id)}
                onEditPersons={() => setEditingPersonsSlotId(slotId)}
                onConfirmPersons={(n) => handleConfirmPersons(slotId, n)}
                onCancelPersons={() => setEditingPersonsSlotId(null)}
                onRemoveRecipe={(rid) => handleRemoveRecipe(day, mealType.id, rid)}
                onSaveRecipeMeta={(rid, p, g) => handleSaveRecipeMeta(day, mealType.id, rid, p, g)}
                onCopyRecipe={(rid) => handleStartCopy(rid, mealType.id, day, false)}
                onCopyDessert={(rid) => handleStartCopy(rid, mealType.id, day, true)}
                onRemoveDessert={(rid) => handleRemoveDessert(day, mealType.id, rid)}
                onSetDessertPersons={(rid, n) => handleSetDessertPersons(day, mealType.id, rid, n)}
                onSelectAsTarget={() => toggleCopyTarget(day, mealType.id)}
                batchRecipeIds={batchRecipeIds}
            />
        );
    };

    return (
        <DndContext
            sensors={isSelectionMode || isAnyEditing || isAddMode || isCopyMode ? [] : sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="w-full h-[calc(100vh-2rem)] tablet:h-[calc(100vh-4rem)] flex flex-col gap-2 overflow-hidden">

                <PlanningHeader
                    weekNumber={weekNumber}
                    weekRange={weekRange}
                    selectedDayDate={selectedDayDate}
                    isAnyEditing={isAnyEditing}
                    isSelectionMode={isSelectionMode}
                    isAddMode={isAddMode}
                    hasShoppingDays={shoppingDays.length > 0}
                    onPrevWeek={() => changeWeek(-1)}
                    onNextWeek={() => changeWeek(1)}
                    onDateChange={(dateStr, dayIndex) => setSearchParams(p => { p.set('d', dateStr); p.set('day', DAYS[dayIndex]); return p; }, { replace: true })}
                    onEnterSelectionMode={enterSelectionMode}
                />

                {isAddMode && addRecipeName && (
                    <div className="shrink-0 flex items-center justify-between gap-3 px-3 py-2 bg-orange-500 text-white rounded-xl">
                        <span className="text-sm font-bold truncate">📌 {addRecipeName}</span>
                        <button onClick={clearAddMode} className="shrink-0 p-1 hover:bg-orange-600 rounded-lg transition-colors">
                            <X size={16} />
                        </button>
                    </div>
                )}

                <DayTabsBar
                    days={DAYS}
                    selectedDay={selectedDay}
                    isSelectionMode={isSelectionMode}
                    isDraft={isDayDraft}
                    isConfirmed={isDayConfirmed}
                    hasMeals={(day) => planningData.some(p => p.day === day && p.recipeIds.length > 0)}
                    atMax={atMax}
                    onSelectDay={setSelectedDay}
                    onToggleDraft={(day) => toggleDraftDay(year, weekNumber, day)}
                />

                <div className="flex-1 min-h-0 overflow-hidden">

                    {isSelectionMode && (
                        <div className="sm:hidden h-full flex flex-col justify-center gap-5 px-1">
                            <p className="text-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                                Jours de courses
                            </p>
                            <div className="grid grid-cols-7 gap-1.5">
                                {DAYS.map(day => {
                                    const isDraft = isDayDraft(day);
                                    const blocked = !isDraft && atMax;
                                    const mealCount = planningData.filter(p => p.day === day && p.recipeIds.length > 0).length;
                                    return (
                                        <button
                                            key={day}
                                            onClick={() => !blocked && toggleDraftDay(year, weekNumber, day)}
                                            className={[
                                                'flex flex-col items-center gap-1 py-3 rounded-2xl transition-all',
                                                isDraft ? 'bg-orange-500 text-white shadow-lg shadow-orange-200 dark:shadow-orange-900/30' : 'bg-white dark:bg-slate-100 border border-slate-200 text-slate-500',
                                                blocked ? 'opacity-25 pointer-events-none' : '',
                                            ].join(' ')}
                                        >
                                            <span className="text-[10px] font-black uppercase tracking-tight">{day.slice(0, 3)}</span>
                                            {isDraft
                                                ? <Check className="w-3 h-3" />
                                                : <span className={`text-[9px] font-bold ${mealCount > 0 ? 'text-orange-400' : 'text-slate-300'}`}>
                                                    {mealCount > 0 ? mealCount : '—'}
                                                </span>
                                            }
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {!isSelectionMode && (
                        <div key={slideKey} className={`sm:hidden flex flex-col gap-1.5 h-full ${slideKey > 0 ? (slideDir === 'left' ? 'animate-slide-from-right' : 'animate-slide-from-left') : ''}`} onTouchStart={onSwipeTouchStart} onTouchEnd={onSwipeTouchEnd}>
                            {MEAL_SLOTS.map(mealType => (
                                <div key={mealType.id} className="flex flex-col gap-0.5 min-h-0" style={{ flex: mealType.flex }}>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-1 shrink-0">
                                        {mealType.icon} {mealType.label}
                                    </span>
                                    <div className="flex-1 min-h-0">
                                        {renderSlot(selectedDay, mealType)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="hidden sm:grid grid-cols-[repeat(7,1fr)] grid-rows-[30px_repeat(4,1fr)] gap-3 h-full min-h-0 px-2 pb-2">
                        {DAYS.map(day => {
                            const selected = isSelectionMode && isDayDraft(day);
                            const confirmed = !isSelectionMode && isDayConfirmed(day);
                            const blocked = isSelectionMode && !selected && atMax;
                            return (
                                <div key={day}
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
                        {MEAL_SLOTS.map(mealType => (
                            <React.Fragment key={mealType.id}>
                                {DAYS.map(day => renderSlot(day, mealType))}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {isSelectionMode && (
                    <ShoppingSelectionBar count={draftDays.length} onConfirm={confirmSelection} onCancel={cancelSelection} onReset={() => setDraftDays([])} />
                )}

                {isCopyMode && copyState && (
                    <CopyModeBar
                        recipeName={copyState.recipeName}
                        selectedCount={copyTargets.size}
                        onConfirm={confirmCopy}
                        onCancel={cancelCopy}
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
                                await saveSlot({ ...existing, recipeIds: [...existing.recipeIds, recipe.recipeId] });
                            } else {
                                await saveSlot({
                                    id: slotId, day: pickerSlot.day, slot: pickerSlot.slot,
                                    recipeIds: [recipe.recipeId], year, week: weekNumber,
                                    ...(existing && { dessertIds: existing.dessertIds, persons: existing.persons }),
                                });
                            }
                            setPickerSlot(null);
                        }}
                        onClose={() => setPickerSlot(null)}
                    />
                )}

                {dessertPickerSlot && !isSelectionMode && (
                    <DessertPicker
                        existingIds={planningData.find(p => p.day === dessertPickerSlot.day && p.slot === dessertPickerSlot.slot)?.dessertIds ?? []}
                        onSelect={async (recipeId) => {
                            await handleAddDessert(dessertPickerSlot.day, dessertPickerSlot.slot, recipeId);
                            setDessertPickerSlot(null);
                        }}
                        onClose={() => setDessertPickerSlot(null)}
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
