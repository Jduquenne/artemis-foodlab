import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../core/services/db';
import { MealSlot } from './components/MealSlot';
import { RecipePicker } from './components/RecipePicker';
import { getWeekNumber, getMonday, getWeekRange } from '../../shared/utils/dateUtils';
import { useNavigate } from 'react-router-dom';
// import { SearchRecipeResult } from '../../shared/hooks/useSearch';

const MEAL_SLOTS = [
    { id: 'breakfast', label: 'Petit Déjeuner', icon: '☕' },
    { id: 'lunch', label: 'Déjeuner', icon: '🍴' },
    { id: 'snack', label: 'Goûter', icon: '🍎' },
    { id: 'dinner', label: 'Dîner', icon: '🌙' }
] as const;

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

export const PlanningModule = () => {
    const navigate = useNavigate();
    const [activeSlot, setActiveSlot] = useState<{ day: string, slot: string } | null>(null);
    const [selectedDate, setSelectedDate] = useState(new Date());

    const monday = useMemo(() => getMonday(selectedDate), [selectedDate]);
    const weekNumber = useMemo(() => getWeekNumber(monday), [monday]);
    const year = monday.getFullYear();
    const weekRange = useMemo(() => getWeekRange(monday), [monday]);

    const planningData = useLiveQuery(
        () => db.planning
            .where('[year+week]')
            .equals([year, weekNumber])
            .toArray(),
        [year, weekNumber]
    ) || [];

    const changeWeek = (offset: number) => {
        const newDate = new Date(selectedDate);
        newDate.setDate(selectedDate.getDate() + (offset * 7));
        setSelectedDate(newDate);
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.value) setSelectedDate(new Date(e.target.value));
    };

    const handleDeleteMeal = async (day: string, slot: string) => {
        // On supprime l'entrée par son ID (ex: "Lun-lunch")
        await db.planning.delete(`${day}-${slot}`);
    };

    return (
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

                    {/* Input Date caché sous une icône pour l'esthétique */}
                    <div className="relative group">
                        <input
                            type="date"
                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                            onChange={handleDateChange}
                        />
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg text-slate-700 font-bold text-sm">
                            <CalendarIcon size={16} />
                            <span className="hidden md:inline">Aller au...</span>
                        </div>
                    </div>

                    <button onClick={() => changeWeek(1)} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                        <ChevronRight size={20} className="text-slate-600" />
                    </button>
                </div>
            </div>

            {/* LA GRILLE DYNAMIQUE */}
            <div className="flex-1 grid grid-cols-[repeat(7,1fr)] grid-rows-[30px_repeat(4,1fr)] gap-3 min-h-0 px-2 pb-2">
                {/* 1. COIN VIDE */}
                {/* <div className="bg-slate-50/50 rounded-xl"></div> */}

                {/* 2. EN-TÊTE DES JOURS (Colonnes) */}
                {DAYS.map(day => (
                    <div key={day} className="flex items-center justify-center font-black text-slate-400 uppercase text-xs tracking-widest">
                        {day}
                    </div>
                ))}

                {/* 3. LIGNES DE REPAS */}
                {MEAL_SLOTS.map((mealType) => (
                    <React.Fragment key={mealType.id}>
                        {/* Les cases du jour */}
                        {DAYS.map(day => {
                            const slotId = `${year}-W${weekNumber}-${day}-${mealType.id}`;
                            const savedMeal = planningData.find(p => p.day === day && p.slot === mealType.id);

                            return (
                                <div key={`${day}-${mealType.id}`} className="relative h-full w-full min-h-0">
                                    <MealSlot
                                        key={slotId}
                                        label={mealType.label}
                                        icon={mealType.icon}
                                        recipeId={savedMeal?.recipeId}

                                        // CLIC PRINCIPAL
                                        onClick={() => {
                                            if (savedMeal) {
                                                // Si une recette existe, on va sur sa fiche detail
                                                navigate(`/recipes/detail/${savedMeal.recipeId}`);
                                            } else {
                                                // Si c'est vide, on ouvre le sélecteur
                                                setActiveSlot({ day, slot: mealType.id });
                                            }
                                        }}

                                        // CLIC MODIFIER (sur l'icône bleue)
                                        onModify={() => setActiveSlot({ day, slot: mealType.id })}

                                        onDelete={() => handleDeleteMeal(day, mealType.id)}
                                    />
                                </div>
                            );
                        })}
                    </React.Fragment>
                ))}
            </div>

            {/* RecipePicker (Overlay) */}
            {activeSlot && (
                <RecipePicker
                    slotName={`${activeSlot.day} - ${activeSlot.slot}`}
                    onSelect={async (recipe) => {
                        await db.planning.put({
                            id: `${activeSlot.day}-${activeSlot.slot}`,
                            day: activeSlot.day,
                            slot: activeSlot.slot as any,
                            recipeId: recipe.recipeId,
                            date: '2024-W08'
                        });
                        setActiveSlot(null);
                    }}
                    onClose={() => setActiveSlot(null)}
                />
            )}
        </div>
    );
};