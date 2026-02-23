import React, { useState, useMemo, useRef } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../core/services/db';
import { MealSlot } from './components/MealSlot';
import { RecipePicker } from './components/RecipePicker';
import { getWeekNumber, getMonday, getWeekRange } from '../../shared/utils/dateUtils';
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
    { id: 'breakfast', label: 'Petit Déjeuner', icon: '☕' },
    { id: 'lunch', label: 'Déjeuner', icon: '🍴' },
    { id: 'snack', label: 'Goûter', icon: '🍎' },
    { id: 'dinner', label: 'Dîner', icon: '🌙' }
] as const;

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

const MealDragOverlay = ({ recipeId }: { recipeId: string }) => {
    const recipe = useLiveQuery(
        () => db.recipes.where({ recipeId, type: 'photo' }).first(),
        [recipeId]
    );
    if (!recipe) return null;
    return (
        <div className="rounded-xl border-2 border-orange-400 shadow-2xl overflow-hidden bg-white w-20 h-28 rotate-2 opacity-95 cursor-grabbing">
            <div className="w-full p-0.5 bg-slate-50 h-[calc(100%-20px)]">
                <img src={recipe.url} className="w-full h-full object-contain" alt={recipe.name} />
            </div>
            <div className="h-5 bg-white flex items-center px-1.5">
                <span className="text-[8px] font-black text-slate-500 uppercase truncate">
                    {recipe.name}
                </span>
            </div>
        </div>
    );
};

export const PlanningModule = () => {
    const navigate = useNavigate();
    const [pickerSlot, setPickerSlot] = useState<{ day: string; slot: string } | null>(null);
    const [activeDragId, setActiveDragId] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState(new Date());

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
        () => db.planning
            .where('[year+week]')
            .equals([year, weekNumber])
            .toArray(),
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

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.value) setSelectedDate(new Date(e.target.value));
    };

    const handleDeleteMeal = async (day: string, slot: string) => {
        await db.planning.delete(`${year}-W${weekNumber}-${day}-${slot}`);
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

        const parseSlot = (fullId: string) => {
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
                { ...fromMeal, recipeId: toMeal.recipeId },
                { ...toMeal, recipeId: fromMeal.recipeId },
            ]);
        } else {
            await db.planning.delete(fromMeal.id);
            await db.planning.put({
                id: toId,
                day: to.day,
                slot: to.slot as any,
                recipeId: fromMeal.recipeId,
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

                {/* HEADER AVEC NAVIGATION */}
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h1 className="text-3xl font-black mb-0.5 text-slate-900 tracking-tight leading-none">
                            Ma Semaine
                        </h1>
                        <div className="flex items-center gap-2">
                            <span className="bg-orange-500 text-white px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest">
                                Semaine {weekNumber}
                            </span>
                            <p className="text-sm font-bold text-slate-500 italic">
                                du {weekRange} — {year}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100">
                        <button onClick={() => changeWeek(-1)} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                            <ChevronLeft size={20} className="text-slate-600" />
                        </button>

                        <div className="relative group">
                            <input
                                type="date"
                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                onChange={handleDateChange}
                            />
                            <div
                                onClick={() => dateInputRef.current?.showPicker()}
                                className="h-10 w-10 flex items-center justify-center bg-slate-100 rounded-xl cursor-pointer hover:bg-orange-100 hover:text-orange-600 transition-all"
                            >
                                <CalendarIcon size={20} />
                                <input
                                    ref={dateInputRef}
                                    type="date"
                                    className="absolute w-0 h-0 opacity-0"
                                    onChange={(e) => e.target.value && setSelectedDate(new Date(e.target.value))}
                                />
                            </div>
                        </div>

                        <button onClick={() => changeWeek(1)} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                            <ChevronRight size={20} className="text-slate-600" />
                        </button>
                    </div>
                </div>

                {/* LA GRILLE DYNAMIQUE */}
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

                                return (
                                    <div key={`${day}-${mealType.id}`} className="relative h-full w-full min-h-0">
                                        <MealSlot
                                            label={mealType.label}
                                            icon={mealType.icon}
                                            slotId={slotId}
                                            recipeId={savedMeal?.recipeId}
                                            onClick={() => {
                                                if (savedMeal) {
                                                    navigate(`/recipes/detail/${savedMeal.recipeId}`);
                                                } else {
                                                    setPickerSlot({ day, slot: mealType.id });
                                                }
                                            }}
                                            onModify={() => setPickerSlot({ day, slot: mealType.id })}
                                            onDelete={() => handleDeleteMeal(day, mealType.id)}
                                        />
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
                            await db.planning.put({
                                id: `${year}-W${weekNumber}-${pickerSlot.day}-${pickerSlot.slot}`,
                                day: pickerSlot.day,
                                slot: pickerSlot.slot as any,
                                recipeId: recipe.recipeId,
                                year,
                                week: weekNumber,
                            });
                            setPickerSlot(null);
                        }}
                        onClose={() => setPickerSlot(null)}
                    />
                )}
            </div>

            <DragOverlay dropAnimation={null}>
                {activeMeal && <MealDragOverlay recipeId={activeMeal.recipeId} />}
            </DragOverlay>
        </DndContext>
    );
};
