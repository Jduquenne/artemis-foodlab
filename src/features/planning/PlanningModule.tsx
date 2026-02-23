import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../core/services/db';
import { MealSlot } from './components/MealSlot';
import { MultiMealSlot } from './components/MultiMealSlot';
import { RecipePicker } from './components/RecipePicker';
import { getWeekNumber, getMonday, getWeekRange } from '../../shared/utils/weekUtils';
import { useNavigate } from 'react-router-dom';
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
    { id: 'lunch',     label: 'Déjeuner',       icon: '🍴', multi: false },
    { id: 'snack',     label: 'Goûter',          icon: '🍎', multi: true },
    { id: 'dinner',    label: 'Dîner',           icon: '🌙', multi: false },
] as const;

type SlotId = typeof MEAL_SLOTS[number]['id'];

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

const MealDragOverlay = ({ recipeId }: { recipeId: string }) => {
    const recipe = useLiveQuery(
        () => db.recipes.where({ recipeId, type: 'photo' }).first(),
        [recipeId]
    );
    if (!recipe) return null;
    return (
        <div className="rounded-xl border-2 border-orange-400 shadow-2xl overflow-hidden bg-white w-20 h-28 rotate-2 opacity-95 cursor-grabbing">
            <img src={recipe.url} className="w-full h-full object-contain" alt={recipe.name} />
        </div>
    );
};

export const PlanningModule = () => {
    const navigate = useNavigate();
    const [pickerSlot, setPickerSlot] = useState<{ day: string; slot: SlotId } | null>(null);
    const [activeDragId, setActiveDragId] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState(new Date());

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

        const fromMeal = planningData.find(p => p.day === from.day && p.slot === from.slot);
        const toMeal = planningData.find(p => p.day === to.day && p.slot === to.slot);

        if (!fromMeal) return;

        if (toMeal) {
            await db.planning.bulkPut([
                { ...fromMeal, recipeIds: toMeal.recipeIds },
                { ...toMeal, recipeIds: fromMeal.recipeIds },
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

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="w-full h-[calc(100vh-100px)] flex flex-col p-2 gap-2 overflow-hidden">

                <div className="flex items-baseline justify-between gap-6 shrink-0 mb-2">
                    <div className="flex items-baseline gap-3">
                        <h1 className="text-3xl font-black text-slate-900">Ma Semaine</h1>
                        <span className="text-sm font-bold text-slate-400">
                            Sem. {weekNumber} · {weekRange}
                        </span>
                    </div>

                    <div className="flex items-center gap-1 self-center bg-white px-2 py-1 rounded-2xl shadow-sm border border-slate-100 shrink-0">
                        <button onClick={() => changeWeek(-1)} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                            <ChevronLeft size={18} className="text-slate-600" />
                        </button>
                        <input
                            type="date"
                            className="h-8 px-2 bg-slate-100 rounded-xl text-xs font-semibold text-slate-500 border-0 outline-none cursor-pointer hover:bg-orange-50 focus:ring-2 focus:ring-orange-400 [color-scheme:light] transition-colors"
                            onChange={(e) => e.target.value && setSelectedDate(new Date(e.target.value))}
                        />
                        <button onClick={() => changeWeek(1)} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                            <ChevronRight size={18} className="text-slate-600" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 grid grid-cols-[repeat(7,1fr)] grid-rows-[30px_repeat(4,1fr)] gap-3 min-h-0 px-2 pb-2">
                    {DAYS.map(day => (
                        <div key={day} className="flex items-center justify-center font-black text-slate-400 uppercase text-xs tracking-widest">
                            {day}
                        </div>
                    ))}

                    {MEAL_SLOTS.map((mealType) => (
                        <React.Fragment key={mealType.id}>
                            {DAYS.map(day => {
                                const slotId = `${year}-W${weekNumber}-${day}-${mealType.id}`;
                                const savedMeal = planningData.find(p => p.day === day && p.slot === mealType.id);
                                const recipeIds = savedMeal?.recipeIds ?? [];

                                return (
                                    <div key={`${day}-${mealType.id}`} className="relative h-full w-full min-h-0 min-w-0">
                                        {mealType.multi ? (
                                            <MultiMealSlot
                                                label={mealType.label}
                                                icon={mealType.icon}
                                                slotId={slotId}
                                                recipeIds={recipeIds}
                                                onAdd={() => setPickerSlot({ day, slot: mealType.id })}
                                                onRemoveRecipe={(rid) => handleRemoveRecipe(day, mealType.id, rid)}
                                                onNavigateToRecipe={(rid) => navigate(`/recipes/detail/${rid}`)}
                                            />
                                        ) : (
                                            <MealSlot
                                                label={mealType.label}
                                                icon={mealType.icon}
                                                slotId={slotId}
                                                recipeIds={recipeIds}
                                                onClick={() => {
                                                    if (savedMeal) {
                                                        navigate(`/recipes/detail/${savedMeal.recipeIds[0]}`);
                                                    } else {
                                                        setPickerSlot({ day, slot: mealType.id });
                                                    }
                                                }}
                                                onModify={() => setPickerSlot({ day, slot: mealType.id })}
                                                onDelete={() => handleDeleteMeal(day, mealType.id)}
                                            />
                                        )}
                                    </div>
                                );
                            })}
                        </React.Fragment>
                    ))}
                </div>

                {pickerSlot && (
                    <RecipePicker
                        slotName={`${pickerSlot.day} - ${pickerSlot.slot}`}
                        onSelect={async (recipe) => {
                            const slotId = `${year}-W${weekNumber}-${pickerSlot.day}-${pickerSlot.slot}`;
                            const isMulti = MEAL_SLOTS.find(m => m.id === pickerSlot.slot)?.multi ?? false;
                            const existing = planningData.find(p => p.day === pickerSlot.day && p.slot === pickerSlot.slot);

                            if (isMulti && existing && existing.recipeIds.length < 4) {
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
