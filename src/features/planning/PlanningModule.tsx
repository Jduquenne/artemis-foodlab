import React, { useState, useMemo, useRef } from 'react';
import { ChevronLeft, ChevronRight, ShoppingCart, Check, X } from 'lucide-react';
import recipesDb from '../../core/data/recipes-db.json';
import { useLiveQuery } from 'dexie-react-hooks';
import { getWeekSlots, saveSlot, deleteSlot, bulkSaveSlots, addDessertToSlot, removeDessertFromSlot } from '../../core/services/planningService';
import { MealSlot } from './components/MealSlot';
import { MultiMealSlot } from './components/MultiMealSlot';
import { RecipePicker } from './components/RecipePicker';
import { DessertPicker } from './components/DessertPicker';
import { MealDragOverlay } from './components/MealDragOverlay';
import { ShoppingSelectionBar } from './components/ShoppingSelectionBar';
import { getWeekNumber, getMonday, getWeekRange } from '../../shared/utils/weekUtils';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
    { id: 'breakfast', label: 'Petit déj.', icon: '☕', multi: true, flex: 2, hasDessert: false },
    { id: 'lunch', label: 'Déjeuner', icon: '🍴', multi: false, flex: 3, hasDessert: true },
    { id: 'snack', label: 'Goûter', icon: '🍎', multi: true, flex: 2, hasDessert: false },
    { id: 'dinner', label: 'Dîner', icon: '🌙', multi: false, flex: 3, hasDessert: true },
] as const;

type SlotId = typeof MEAL_SLOTS[number]['id'];

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

const todayDayName = (() => {
    const d = new Date().getDay();
    return DAYS[d === 0 ? 6 : d - 1];
})();

export const PlanningModule = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { shoppingDays, setShoppingDays } = useMenuStore();
    const dateInputRef = useRef<HTMLInputElement>(null);

    const [pickerSlot, setPickerSlot] = useState<{ day: string; slot: SlotId } | null>(null);
    const [dessertPickerSlot, setDessertPickerSlot] = useState<{ day: string; slot: SlotId } | null>(null);
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
    const addRecipeName = addRecipeId
        ? (recipesDb as Record<string, { name: string }>)[addRecipeId]?.name ?? ''
        : null;
    const clearAddMode = () =>
        setSearchParams(p => { p.delete('addRecipe'); return p; }, { replace: true });

    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [draftDays, setDraftDays] = useState<ShoppingDay[]>([]);
    const [editingPersonsSlotId, setEditingPersonsSlotId] = useState<string | null>(null);

    const isAnyEditing = editingPersonsSlotId !== null;

    const monday = useMemo(() => getMonday(selectedDate), [selectedDate]);
    const weekNumber = useMemo(() => getWeekNumber(monday), [monday]);
    const year = monday.getFullYear();
    const weekRange = useMemo(() => getWeekRange(monday), [monday]);

    const sensors = useSensors(
        useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
    );

    const planningData = useLiveQuery(
        () => getWeekSlots(year, weekNumber),
        [year, weekNumber]
    ) || [];

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
        const currentIndex = DAYS.indexOf(selectedDay);
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

    const handleDeleteMeal = async (day: string, slot: SlotId) => {
        await deleteSlot(`${year}-W${weekNumber}-${day}-${slot}`);
    };

    const handleAddDessert = async (day: string, slot: SlotId, recipeId: string) => {
        const savedSlot = planningData.find(p => p.day === day && p.slot === slot);
        if (!savedSlot) return;
        await addDessertToSlot(savedSlot, recipeId);
    };

    const handleRemoveDessert = async (day: string, slot: SlotId, recipeId: string) => {
        const savedSlot = planningData.find(p => p.day === day && p.slot === slot);
        if (!savedSlot) return;
        await removeDessertFromSlot(savedSlot, recipeId);
    };

    const handleRemoveRecipe = async (day: string, slot: SlotId, recipeIdToRemove: string) => {
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
        const parseSlot = (fullId: string): { day: string; slot: SlotId } | null => {
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
                { ...fromMeal, recipeIds: toMeal.recipeIds, persons: undefined },
                { ...toMeal, recipeIds: fromMeal.recipeIds, persons: undefined },
            ]);
        } else {
            await deleteSlot(fromMeal.id);
            await saveSlot({ id: over.id as string, day: to.day, slot: to.slot, recipeIds: fromMeal.recipeIds, year, week: weekNumber });
        }
    };

    const handleConfirmPersons = async (slotId: string, persons: number) => {
        const existing = planningData.find(p => `${year}-W${weekNumber}-${p.day}-${p.slot}` === slotId);
        if (existing) await saveSlot({ ...existing, persons });
        setEditingPersonsSlotId(null);
    };

    const handleAddToSlot = async (day: string, slot: SlotId) => {
        if (!addRecipeId) return;
        const slotId = `${year}-W${weekNumber}-${day}-${slot}`;
        const mealDef = MEAL_SLOTS.find(m => m.id === slot)!;
        const existing = planningData.find(p => p.day === day && p.slot === slot);
        const recipeKind = (recipesDb as Record<string, { kind: string }>)[addRecipeId]?.kind;
        if (mealDef.hasDessert && existing?.recipeIds.length && recipeKind === 'ingredient') {
            if ((existing.dessertIds ?? []).length < 3) {
                await addDessertToSlot(existing, addRecipeId);
                clearAddMode();
            }
            return;
        }
        if (mealDef.multi) {
            const ids = existing?.recipeIds ?? [];
            if (ids.length >= 4) return;
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
        const recipeIds = savedMeal?.recipeIds ?? [];
        const isEditingThis = editingPersonsSlotId === slotId;
        const isDimmed = isAnyEditing && !isEditingThis;

        return (
            <div key={`${day}-${mealType.id}`} className={`relative h-full w-full min-h-0 min-w-0 transition-opacity ${isDimmed ? 'pointer-events-none opacity-30' : ''}`}>
                {mealType.multi ? (
                    <MultiMealSlot
                        label={mealType.label} icon={mealType.icon} slotId={slotId} recipeIds={recipeIds}
                        onAdd={isSelectionMode || isAddMode ? () => { } : () => setPickerSlot({ day, slot: mealType.id })}
                        onRemoveRecipe={isSelectionMode || isAddMode ? () => { } : (rid) => handleRemoveRecipe(day, mealType.id, rid)}
                        onNavigateToRecipe={isAddMode ? () => { } : (rid) => navigate(`/recipes/detail/${rid}`)}
                        isAddMode={isAddMode}
                        onAddToSlot={isAddMode ? () => handleAddToSlot(day, mealType.id) : undefined}
                    />
                ) : (
                    <MealSlot
                        label={mealType.label} icon={mealType.icon} slotId={slotId} recipeIds={recipeIds}
                        persons={savedMeal?.persons} isEditingPersons={isEditingThis} isAnyEditing={isAnyEditing}
                        onNavigate={() => navigate(`/recipes/detail/${savedMeal!.recipeIds[0]}`)}
                        onOpenPicker={isSelectionMode || isAddMode ? () => { } : () => setPickerSlot({ day, slot: mealType.id })}
                        onModify={isSelectionMode || isAddMode ? () => { } : () => setPickerSlot({ day, slot: mealType.id })}
                        onDelete={isSelectionMode || isAddMode ? () => { } : () => handleDeleteMeal(day, mealType.id)}
                        onOpenPersonsEditor={isAddMode ? () => { } : () => setEditingPersonsSlotId(slotId)}
                        onConfirmPersons={(n) => handleConfirmPersons(slotId, n)}
                        onCancelPersons={() => setEditingPersonsSlotId(null)}
                        isAddMode={isAddMode}
                        onAddToSlot={isAddMode ? () => handleAddToSlot(day, mealType.id) : undefined}
                        hasDessert={mealType.hasDessert}
                        dessertIds={savedMeal?.dessertIds ?? []}
                        onAddDessert={isSelectionMode || isAddMode ? undefined : () => setDessertPickerSlot({ day, slot: mealType.id })}
                        onRemoveDessert={(rid) => handleRemoveDessert(day, mealType.id, rid)}
                    />
                )}
            </div>
        );
    };

    return (
        <DndContext
            sensors={isSelectionMode || isAnyEditing || isAddMode ? [] : sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="w-full h-[calc(100vh-2rem)] tablet:h-[calc(100vh-4rem)] flex flex-col gap-2 overflow-hidden">

                {/* ── HEADER ── */}
                <div className="flex items-center justify-between gap-3 shrink-0">
                    <div className="flex flex-col leading-tight">
                        <h1 className="text-xl sm:text-2xl tablet:text-3xl font-black text-slate-900">Ma Semaine</h1>
                        <span className="text-xs sm:text-sm font-bold text-slate-400">Sem. {weekNumber} · {weekRange}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <input ref={dateInputRef} type="date" tabIndex={-1}
                            className="absolute opacity-0 w-px h-px pointer-events-none"
                            onChange={(e) => e.target.value && setSelectedDate(new Date(e.target.value))}
                        />
                        <div className={`flex items-center gap-1 bg-white dark:bg-slate-100 px-2 py-1 rounded-2xl shadow-sm border border-slate-200 ${isAnyEditing ? 'opacity-40 pointer-events-none' : ''}`}>
                            <button aria-label="Semaine précédente" onClick={() => changeWeek(-1)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-200 rounded-xl transition-colors">
                                <ChevronLeft size={18} className="text-slate-600" />
                            </button>
                            <button onClick={() => dateInputRef.current?.showPicker?.()}
                                className="sm:hidden px-2 py-1 text-xs font-bold text-slate-500 hover:bg-orange-50 hover:text-orange-500 rounded-xl transition-colors">
                                Sem. {weekNumber}
                            </button>
                            <input type="date"
                                className="hidden sm:block h-8 px-2 bg-slate-100 dark:bg-slate-200 rounded-xl text-xs font-semibold text-slate-500 border-0 outline-none cursor-pointer hover:bg-orange-50 focus:ring-2 focus:ring-orange-400 scheme-light dark:scheme-dark transition-colors"
                                onChange={(e) => e.target.value && setSelectedDate(new Date(e.target.value))}
                            />
                            <button aria-label="Semaine suivante" onClick={() => changeWeek(1)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-200 rounded-xl transition-colors">
                                <ChevronRight size={18} className="text-slate-600" />
                            </button>
                        </div>

                        {!isSelectionMode && !isAddMode && (
                            <button
                                onClick={isAnyEditing ? undefined : enterSelectionMode}
                                className={[
                                    'flex items-center gap-1.5 px-3 py-2 rounded-2xl shadow-sm border font-bold text-sm transition-colors',
                                    isAnyEditing ? 'opacity-40 pointer-events-none bg-white dark:bg-slate-100 border-slate-200 text-slate-600'
                                        : shoppingDays.length > 0 ? 'bg-orange-500 border-orange-400 text-white hover:bg-orange-600'
                                            : 'bg-white dark:bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-200',
                                ].join(' ')}
                            >
                                <ShoppingCart size={15} />
                                <span className="hidden sm:inline">Courses</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* ── ADD MODE BANNER ── */}
                {isAddMode && addRecipeName && (
                    <div className="shrink-0 flex items-center justify-between gap-3 px-3 py-2 bg-orange-500 text-white rounded-xl">
                        <span className="text-sm font-bold truncate">📌 {addRecipeName}</span>
                        <button onClick={clearAddMode} className="shrink-0 p-1 hover:bg-orange-600 rounded-lg transition-colors">
                            <X size={16} />
                        </button>
                    </div>
                )}

                {/* ── MOBILE: BARRE DE JOURS ── */}
                <div className="sm:hidden grid grid-cols-7 gap-0.5 shrink-0 bg-white dark:bg-slate-100 border border-slate-200 rounded-2xl p-1 shadow-sm">
                    {DAYS.map(day => {
                        const isActive = !isSelectionMode && selectedDay === day;
                        const isDraft = isDayDraft(day);
                        const isConfirmed = !isSelectionMode && isDayConfirmed(day);
                        const hasMeals = planningData.some(p => p.day === day && p.recipeIds.length > 0);
                        const blocked = isSelectionMode && !isDraft && atMax;

                        return (
                            <button
                                key={day}
                                onClick={() => isSelectionMode
                                    ? (!blocked ? toggleDraftDay(year, weekNumber, day) : undefined)
                                    : setSelectedDay(day)
                                }
                                className={[
                                    'flex flex-col items-center py-1.5 rounded-xl transition-all select-none',
                                    isActive ? 'bg-orange-500 text-white shadow-sm' : '',
                                    isDraft ? 'bg-orange-500 text-white shadow-sm' : '',
                                    !isActive && !isDraft ? 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-200' : '',
                                    blocked ? 'opacity-30' : '',
                                ].join(' ')}
                            >
                                <span className="text-[9px] font-black uppercase tracking-tight leading-none">
                                    {day.slice(0, 3)}
                                </span>
                                <span className={[
                                    'w-1 h-1 rounded-full mt-1',
                                    !hasMeals ? 'bg-transparent' : '',
                                    hasMeals && (isActive || isDraft) ? 'bg-white/60' : '',
                                    hasMeals && !isActive && !isDraft && isConfirmed ? 'bg-orange-400' : '',
                                    hasMeals && !isActive && !isDraft && !isConfirmed ? 'bg-slate-300' : '',
                                ].join(' ')} />
                            </button>
                        );
                    })}
                </div>

                {/* ── CONTENU PRINCIPAL ── */}
                <div className="flex-1 min-h-0 overflow-hidden">

                    {/* MOBILE — mode sélection courses */}
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

                    {/* MOBILE — vue par jour */}
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

                    {/* TABLET+ — grille 7 jours */}
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
                    <ShoppingSelectionBar count={draftDays.length} onConfirm={confirmSelection} onCancel={cancelSelection} />
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
                                await saveSlot({ id: slotId, day: pickerSlot.day, slot: pickerSlot.slot, recipeIds: [recipe.recipeId], year, week: weekNumber });
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
