import React, { useState, useMemo, useEffect } from 'react';
import { addDays } from 'date-fns';
import { useFreezerStock } from '../../shared/hooks/useFreezerStock';
import { X } from 'lucide-react';
import { CopyModeBar } from './components/bars/CopyModeBar';
import { useLiveQuery } from 'dexie-react-hooks';
import { getWeekSlots, saveSlot, deleteSlot, addDessertToSlot, removeDessertFromSlot, setRecipePersonsOnSlot, syncWeekFromApi } from '../../core/services/planningService';
import { useAuthStore } from '../../shared/store/useAuthStore';
import { MealDragOverlay } from './components/MealDragOverlay';
import { WeekNavZone } from './components/WeekNavZone';
import { RecipePicker } from './components/pickers/RecipePicker';
import { DessertPicker } from './components/pickers/DessertPicker';
import { ShoppingSelectionBar } from './components/bars/ShoppingSelectionBar';
import { PlanningHeader } from './components/PlanningHeader';
import { PlanningSlot } from './components/slot/PlanningSlot';
import { DayTabsBar } from './components/bars/DayTabsBar';
import { getWeekNumber, getMonday, getWeekRange, dayNameOf } from '../../shared/utils/weekUtils';
import { toIsoDate } from '../../shared/utils/dateUtils';
import { computeDayMacros } from '../../shared/utils/macroUtils';
import { useMacroCatalogue } from '../../shared/hooks/useMacroCatalogue';
import { useRefreshStore } from '../../shared/store/useRefreshStore';
import { useSearchParams } from 'react-router-dom';
import { SlotType, MealSlot } from '../../core/domain/planning';
import { isDessert, canAddDessert } from '../../core/domain/recipePredicates';
import { MEAL_SLOTS, DAYS } from '../../core/domain/planningConfig';
import { SLOT_DISPLAY } from './slotDisplay';
import { useRecipesSnapshot } from '../../shared/hooks/useCatalogueSnapshot';
import { computeSlotCopyProps } from '../../core/logic/planning/planningCopyLogic';
import { useShoppingDaysSelection } from '../../shared/hooks/useShoppingDaysSelection';
import { usePlanningCopy } from '../../shared/hooks/usePlanningCopy';
import { shiftDay } from '../../core/logic/planning/planningDayNavLogic';
import { useHorizontalSwipe, SwipeDirection } from '../../shared/hooks/useHorizontalSwipe';
import { useDragEdgeWeekNav } from '../../shared/hooks/useDragEdgeWeekNav';
import { ShoppingDaysPicker } from './components/ShoppingDaysPicker';
import { DayColumnHeader } from './components/DayColumnHeader';
import { computeDragMoveSlots, incomingDessertChoice } from '../../core/logic/planning/planningDragLogic';
import { ParsedSlot, buildSlotId, parseFullSlotId } from '../../core/logic/planning/planningSlotIdLogic';
import { buildEmptySlot, placeRecipeInSlot } from '../../core/logic/planning/planningSlotEditLogic';
import { withPending } from '../../shared/utils/withPending';
import { MoveDessertsPrompt } from './components/MoveDessertsPrompt';
import { DessertChoiceModal } from './components/DessertChoiceModal';
import { TABLET_WEEK_GRID_COLS } from './planningLayout';
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

export const PlanningModule = () => {
    const recipesDb = useRecipesSnapshot();
    const [searchParams, setSearchParams] = useSearchParams();
    const { batchRecipeIds } = useFreezerStock();

    const [pickerSlot, setPickerSlot] = useState<{ day: string; slot: SlotType } | null>(null);
    const [dessertPickerSlot, setDessertPickerSlot] = useState<{ day: string; slot: SlotType } | null>(null);
    const [activeDragId, setActiveDragId] = useState<string | null>(null);
    const [dragSourceSlot, setDragSourceSlot] = useState<MealSlot | null>(null);
    const [slideKey, setSlideKey] = useState(0);
    const [slideDir, setSlideDir] = useState<SwipeDirection>('left');

    const selectedDay = searchParams.get('day') ?? dayNameOf(new Date());
    const selectedDate = useMemo(() => {
        const d = searchParams.get('d');
        return d ? new Date(d + 'T12:00:00') : new Date();
    }, [searchParams]);

    const setSelectedDay = (day: string) =>
        setSearchParams(p => { p.set('day', day); return p; }, { replace: true });
    const setSelectedDate = (date: Date) =>
        setSearchParams(p => { p.set('d', toIsoDate(date)); return p; }, { replace: true });

    const addRecipeId = searchParams.get('addRecipe');
    const isAddMode = !!addRecipeId;
    const addRecipeName = addRecipeId ? recipesDb[addRecipeId]?.name ?? '' : null;
    const clearAddMode = () =>
        setSearchParams(p => { p.delete('addRecipe'); return p; }, { replace: true });

    const [editingPersonsSlotId, setEditingPersonsSlotId] = useState<string | null>(null);
    const [pendingDragMove, setPendingDragMove] = useState<{
        fromMeal: MealSlot; toMeal: MealSlot | undefined; fromId: string; toId: string; from: ParsedSlot; to: ParsedSlot;
    } | null>(null);
    const [dragMoveChoice, setDragMoveChoice] = useState<'move' | 'keep' | null>(null);
    const [dessertChoiceIds, setDessertChoiceIds] = useState<string[] | null>(null);

    const isAnyEditing = editingPersonsSlotId !== null;

    const monday = useMemo(() => getMonday(selectedDate), [selectedDate]);
    const weekNumber = useMemo(() => getWeekNumber(monday), [monday]);
    const year = monday.getFullYear();
    const weekRange = useMemo(() => getWeekRange(monday), [monday]);
    const selectedDayDate = useMemo(
        () => toIsoDate(addDays(monday, (DAYS as readonly string[]).indexOf(selectedDay))),
        [monday, selectedDay]
    );

    const sensors = useSensors(
        useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
    );

    const liveData = useLiveQuery(
        () => getWeekSlots(year, weekNumber),
        [year, weekNumber]
    );
    const planningData = useMemo(() => liveData ?? [], [liveData]);

    const shopping = useShoppingDaysSelection(year, weekNumber);
    const isSelectionMode = shopping.isSelectionMode;
    const copy = usePlanningCopy(planningData, year, weekNumber);
    const isCopyMode = !!copy.copyState;

    const authStatus = useAuthStore((s) => s.status);
    const refreshTick = useRefreshStore((s) => s.tick);
    useEffect(() => {
        if (authStatus === 'authenticated') syncWeekFromApi(year, weekNumber);
    }, [authStatus, year, weekNumber, refreshTick]);

    const macroCatalogue = useMacroCatalogue();
    const dayKcal = useMemo(() =>
        Object.fromEntries(DAYS.map(day => {
            const slots = planningData.filter(p => p.day === day);
            return [day, slots.length ? Math.round(computeDayMacros(macroCatalogue, slots, {}, {}).kcal) : 0];
        })),
        [macroCatalogue, planningData]
    );

    const activeMeal = useMemo(
        () => {
            if (!activeDragId) return null;
            return planningData.find(p => buildSlotId(year, weekNumber, p.day, p.slot) === activeDragId) ?? dragSourceSlot;
        },
        [activeDragId, planningData, year, weekNumber, dragSourceSlot]
    );

    const changeWeek = (offset: number) => {
        if (isAnyEditing) return;
        setSelectedDate(addDays(selectedDate, offset * 7));
    };

    const weekNavZone = useDragEdgeWeekNav(!!activeDragId, changeWeek);

    const handleSwipe = (direction: SwipeDirection) => {
        if (isAnyEditing || isSelectionMode) return;
        setSlideDir(direction);
        setSlideKey(k => k + 1);
        const { day, weekOffset } = shiftDay(selectedDay, direction === 'left' ? 1 : -1);
        setSearchParams(p => {
            p.set('day', day);
            if (weekOffset !== 0) p.set('d', toIsoDate(addDays(selectedDate, weekOffset * 7)));
            return p;
        }, { replace: true });
    };

    const swipeHandlers = useHorizontalSwipe(handleSwipe);

    const handleDeleteMeal = async (day: string, slot: SlotType) => {
        const slotId = buildSlotId(year, weekNumber, day, slot);
        await withPending(`planning-slot-delete:${slotId}`, () => deleteSlot(slotId)).catch(() => undefined);
    };

    const handleAddDessert = async (day: string, slot: SlotType, recipeId: string): Promise<boolean> => {
        const savedSlot = planningData.find(p => p.day === day && p.slot === slot)
            ?? buildEmptySlot({ year, week: weekNumber, day, slot });
        const ok = await withPending(`planning-dessert-add:${savedSlot.id}`, async () => {
            await addDessertToSlot(savedSlot, recipeId);
            return true;
        }).catch(() => false);
        return ok === true;
    };

    const handleRemoveDessert = async (day: string, slot: SlotType, recipeId: string) => {
        const savedSlot = planningData.find(p => p.day === day && p.slot === slot);
        if (!savedSlot) return;
        const slotId = buildSlotId(year, weekNumber, day, slot);
        await withPending(`planning-dessert-remove:${slotId}:${recipeId}`, () => removeDessertFromSlot(savedSlot, recipeId)).catch(() => undefined);
    };

    const handleRemoveRecipe = async (day: string, slot: SlotType, recipeIdToRemove: string) => {
        const existing = planningData.find(p => p.day === day && p.slot === slot);
        if (!existing) return;
        const slotId = buildSlotId(year, weekNumber, day, slot);
        await withPending(`planning-recipe-remove:${slotId}:${recipeIdToRemove}`, async () => {
            const ids = existing.recipeIds.filter(id => id !== recipeIdToRemove);
            if (ids.length === 0) await deleteSlot(existing.id);
            else await saveSlot({ ...existing, recipeIds: ids });
        }).catch(() => undefined);
    };

    const handleDragStart = ({ active }: DragStartEvent) => {
        setActiveDragId(active.id as string);
        const meal = planningData.find(p => buildSlotId(year, weekNumber, p.day, p.slot) === (active.id as string));
        setDragSourceSlot(meal ?? null);
    };

    const handleDragEnd = async ({ active, over }: DragEndEvent) => {
        setActiveDragId(null);
        const sourceMeal = dragSourceSlot;
        setDragSourceSlot(null);

        if (!over || active.id === over.id) return;

        const from = parseFullSlotId(active.id as string);
        const to = parseFullSlotId(over.id as string);
        if (!from || !to) return;

        const fromDef = MEAL_SLOTS.find(m => m.id === from.slot);
        const toDef = MEAL_SLOTS.find(m => m.id === to.slot);
        if (!fromDef || !toDef || fromDef.multi !== toDef.multi) return;

        const isCrossWeek = from.year !== to.year || from.week !== to.week;
        const fromMeal = isCrossWeek
            ? sourceMeal
            : planningData.find(p => p.day === from.day && p.slot === from.slot);
        const toMeal = planningData.find(p => p.day === to.day && p.slot === to.slot);

        if (!fromMeal) return;

        const fromId = buildSlotId(from.year, from.week, from.day, from.slot);
        const toId = buildSlotId(to.year, to.week, to.day, to.slot);

        if ((fromMeal.dessertIds?.length ?? 0) > 0) {
            setPendingDragMove({ fromMeal, toMeal, fromId, toId, from, to });
            return;
        }

        await executeDragMove(fromMeal, toMeal, fromId, toId, from, to, true);
    };

    const executeDragMove = async (
        fromMeal: MealSlot, toMeal: MealSlot | undefined, fromId: string, toId: string,
        from: ParsedSlot, to: ParsedSlot, moveDesserts: boolean, keptDessertIds?: string[],
    ): Promise<boolean> => {
        const { toSave, toDelete } = computeDragMoveSlots(fromMeal, toMeal, fromId, toId, from, to, moveDesserts, keptDessertIds);
        const ok = await withPending([`planning-move:${fromId}`, `planning-move:${toId}`], async () => {
            await Promise.all([
                ...(toDelete ? [deleteSlot(toDelete)] : []),
                ...toSave.map(saveSlot),
            ]);
            return true;
        }).catch(() => false);
        return ok === true;
    };

    const resolveDragMove = async (moveDesserts: boolean, keptDessertIds?: string[]) => {
        if (!pendingDragMove) return;
        const { fromMeal, toMeal, fromId, toId, from, to } = pendingDragMove;
        if (moveDesserts && !keptDessertIds) {
            const choice = incomingDessertChoice(fromMeal, toMeal);
            if (choice) {
                setDessertChoiceIds(choice);
                return;
            }
        }
        setDragMoveChoice(moveDesserts ? 'move' : 'keep');
        const ok = await executeDragMove(fromMeal, toMeal, fromId, toId, from, to, moveDesserts, keptDessertIds);
        setDragMoveChoice(null);
        if (ok) cancelDragMove();
    };

    const cancelDragMove = () => {
        setPendingDragMove(null);
        setDessertChoiceIds(null);
    };

    const handleSetDessertPersons = async (day: string, slot: SlotType, dessertId: string, persons: number): Promise<boolean> => {
        const existing = planningData.find(p => p.day === day && p.slot === slot);
        if (!existing) return false;
        const slotId = buildSlotId(year, weekNumber, day, slot);
        const ok = await withPending(`planning-dessert-persons:${slotId}:${dessertId}`, async () => {
            await setRecipePersonsOnSlot(existing, dessertId, persons);
            return true;
        }).catch(() => false);
        return ok === true;
    };

    const handleConfirmPersons = async (slotId: string, persons: number) => {
        const existing = planningData.find(p => buildSlotId(year, weekNumber, p.day, p.slot) === slotId);
        if (!existing) {
            setEditingPersonsSlotId(null);
            return;
        }
        const ok = await withPending(`planning-persons:${slotId}`, async () => {
            await saveSlot({ ...existing, persons });
            return true;
        }).catch(() => false);
        if (ok) setEditingPersonsSlotId(null);
    };

    const handleSaveRecipeMeta = async (day: string, slot: SlotType, recipeId: string, persons: number, grams: number): Promise<boolean> => {
        const existing = planningData.find(p => p.day === day && p.slot === slot);
        if (!existing) return false;
        const slotId = buildSlotId(year, weekNumber, day, slot);
        const ok = await withPending(`planning-recipe-meta:${slotId}:${recipeId}`, async () => {
            await saveSlot({
                ...existing,
                recipePersons: { ...existing.recipePersons, [recipeId]: persons },
                recipeQuantities: { ...existing.recipeQuantities, [recipeId]: grams },
            });
            return true;
        }).catch(() => false);
        return ok === true;
    };

    const handleAddToSlot = async (day: string, slot: SlotType) => {
        if (!addRecipeId) return;
        const mealDef = MEAL_SLOTS.find(m => m.id === slot);
        if (!mealDef) return;
        const existing = planningData.find(p => p.day === day && p.slot === slot);
        const at = { year, week: weekNumber, day, slot };
        const base = existing ?? buildEmptySlot(at);
        const isDessertAdd = mealDef.hasDessert && isDessert(recipesDb[addRecipeId]);
        if (isDessertAdd && !canAddDessert(base)) return;
        const next = isDessertAdd ? null : placeRecipeInSlot(existing, at, mealDef, addRecipeId);
        if (!isDessertAdd && !next) return;
        const ok = await withPending(`planning-add-to-slot:${base.id}`, async () => {
            if (next) await saveSlot(next);
            else await addDessertToSlot(base, addRecipeId);
            return true;
        }).catch(() => false);
        if (ok) clearAddMode();
    };

    const enterSelectionMode = () => { shopping.enter(); setPickerSlot(null); };

    const handlePickRecipe = async (recipeId: string) => {
        if (!pickerSlot) return;
        const mealDef = MEAL_SLOTS.find(m => m.id === pickerSlot.slot);
        if (!mealDef) return;
        const existing = planningData.find(p => p.day === pickerSlot.day && p.slot === pickerSlot.slot);
        const next = placeRecipeInSlot(existing, { year, week: weekNumber, ...pickerSlot }, mealDef, recipeId);
        const ok = next ? await saveSlot(next).then(() => true).catch(() => false) : true;
        if (ok) setPickerSlot(null);
    };

    const handlePickDessert = async (recipeId: string) => {
        if (!dessertPickerSlot) return;
        const ok = await handleAddDessert(dessertPickerSlot.day, dessertPickerSlot.slot, recipeId);
        if (ok) setDessertPickerSlot(null);
    };

    const mealCount = (day: string) => planningData.filter(p => p.day === day && p.recipeIds.length > 0).length;

    const renderSlot = (day: string, mealType: typeof MEAL_SLOTS[number]) => {
        const slotId = buildSlotId(year, weekNumber, day, mealType.id);
        const savedMeal = planningData.find(p => p.day === day && p.slot === mealType.id);
        const isEditingThis = editingPersonsSlotId === slotId;
        const copyProps = computeSlotCopyProps(copy.copyState, copy.copyTargets, day, mealType, savedMeal);
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
                onCopyRecipe={(rid) => copy.start(rid, mealType.id, day, false)}
                onCopyDessert={(rid) => copy.start(rid, mealType.id, day, true)}
                onRemoveDessert={(rid) => handleRemoveDessert(day, mealType.id, rid)}
                onSetDessertPersons={(rid, n) => handleSetDessertPersons(day, mealType.id, rid, n)}
                onSelectAsTarget={() => copy.toggleTarget(day, mealType.id)}
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
            <div className="w-full h-[calc(100dvh-2rem)] tablet:h-[calc(100dvh-4rem)] flex flex-col gap-2 overflow-hidden tablet:overflow-visible">

                <PlanningHeader
                    weekNumber={weekNumber}
                    weekRange={weekRange}
                    selectedDayDate={selectedDayDate}
                    isAnyEditing={isAnyEditing}
                    isSelectionMode={isSelectionMode}
                    isAddMode={isAddMode}
                    hasShoppingDays={shopping.hasShoppingDays}
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
                    monday={monday}
                    dayKcal={dayKcal}
                    isSelectionMode={isSelectionMode}
                    isDraft={shopping.isDraft}
                    isConfirmed={shopping.isConfirmed}
                    hasMeals={(day) => mealCount(day) > 0}
                    atMax={shopping.atMax}
                    onSelectDay={setSelectedDay}
                    onToggleDraft={shopping.toggle}
                />

                <div className="flex-1 min-h-0 overflow-hidden tablet:overflow-visible tablet:flex tablet:flex-col tablet:gap-2">

                    {isSelectionMode && (
                        <ShoppingDaysPicker
                            days={DAYS}
                            isDraft={shopping.isDraft}
                            mealCount={mealCount}
                            atMax={shopping.atMax}
                            onToggle={shopping.toggle}
                        />
                    )}

                    {!isSelectionMode && (
                        <div key={slideKey} className={`sm:hidden flex flex-col gap-1.5 h-full ${slideKey > 0 ? (slideDir === 'left' ? 'animate-slide-from-right' : 'animate-slide-from-left') : ''}`} {...swipeHandlers}>
                            {MEAL_SLOTS.map(mealType => (
                                <div key={mealType.id} className="flex flex-col gap-0.5 min-h-0" style={{ flex: SLOT_DISPLAY[mealType.id].flex }}>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-1 shrink-0">
                                        {SLOT_DISPLAY[mealType.id].icon} {SLOT_DISPLAY[mealType.id].label}
                                    </span>
                                    <div className="flex-1 min-h-0">
                                        {renderSlot(selectedDay, mealType)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className={`hidden tablet:grid ${TABLET_WEEK_GRID_COLS} px-2 gap-2 shrink-0 tablet:-mx-8`}>
                        <span />
                        {MEAL_SLOTS.map(mealType => (
                            <span key={mealType.id} className="text-center text-xs font-black uppercase tracking-widest text-slate-400 truncate">
                                {SLOT_DISPLAY[mealType.id].icon} {SLOT_DISPLAY[mealType.id].label}
                            </span>
                        ))}
                    </div>

                    <div className={`hidden sm:grid grid-cols-[repeat(7,1fr)] grid-rows-[44px_repeat(4,1fr)] gap-3 h-full min-h-0 px-2 pb-2 tablet:h-auto tablet:flex-1 tablet:-mx-8 tablet:gap-2 tablet:grid-flow-col tablet:grid-rows-7 ${TABLET_WEEK_GRID_COLS}`}>
                        {DAYS.map((day, i) => {
                            const selected = isSelectionMode && shopping.isDraft(day);
                            return (
                                <DayColumnHeader
                                    key={day}
                                    day={day}
                                    dayIndex={i}
                                    monday={monday}
                                    kcal={dayKcal[day]}
                                    isSelectionMode={isSelectionMode}
                                    selected={selected}
                                    confirmed={!isSelectionMode && shopping.isConfirmed(day)}
                                    blocked={isSelectionMode && !selected && shopping.atMax}
                                    onToggle={() => shopping.toggle(day)}
                                />
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
                    <ShoppingSelectionBar count={shopping.draftCount} pending={shopping.isPending} onConfirm={shopping.confirm} onCancel={shopping.cancel} onReset={shopping.reset} />
                )}

                {copy.copyState && (
                    <CopyModeBar
                        recipeName={copy.copyState.recipeName}
                        selectedCount={copy.copyTargets.size}
                        pending={copy.isCopying}
                        onConfirm={copy.confirm}
                        onCancel={copy.cancel}
                    />
                )}

                {!isSelectionMode && pickerSlot && (
                    <RecipePicker
                        slotName={`${pickerSlot.day} · ${SLOT_DISPLAY[pickerSlot.slot].label}`}
                        existingRecipeIds={
                            MEAL_SLOTS.find(m => m.id === pickerSlot.slot)?.multi
                                ? (planningData.find(p => p.day === pickerSlot.day && p.slot === pickerSlot.slot)?.recipeIds ?? [])
                                : []
                        }
                        onSelect={(recipe) => handlePickRecipe(recipe.recipeId)}
                        onClose={() => setPickerSlot(null)}
                    />
                )}

                {dessertPickerSlot && !isSelectionMode && (
                    <DessertPicker
                        existingIds={planningData.find(p => p.day === dessertPickerSlot.day && p.slot === dessertPickerSlot.slot)?.dessertIds ?? []}
                        onSelect={handlePickDessert}
                        onClose={() => setDessertPickerSlot(null)}
                    />
                )}

                {pendingDragMove && dessertChoiceIds && (
                    <DessertChoiceModal
                        dessertIds={dessertChoiceIds}
                        pending={dragMoveChoice !== null}
                        onConfirm={(kept) => resolveDragMove(true, kept)}
                        onCancel={cancelDragMove}
                    />
                )}

                {pendingDragMove && !dessertChoiceIds && (
                    <MoveDessertsPrompt
                        dessertCount={pendingDragMove.fromMeal.dessertIds?.length ?? 0}
                        pendingChoice={dragMoveChoice}
                        onMove={() => resolveDragMove(true)}
                        onKeep={() => resolveDragMove(false)}
                        onCancel={cancelDragMove}
                    />
                )}
            </div>

            <WeekNavZone direction="prev" visible={!!activeDragId} isActive={weekNavZone === 'prev'} />
            <WeekNavZone direction="next" visible={!!activeDragId} isActive={weekNavZone === 'next'} />

            <DragOverlay dropAnimation={null}>
                {activeMeal && activeMeal.recipeIds.length > 0 && (
                    <MealDragOverlay recipeId={activeMeal.recipeIds[0]} />
                )}
            </DragOverlay>
        </DndContext>
    );
};
