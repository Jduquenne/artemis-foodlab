import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../core/services/db';
import { MealSlot } from './components/MealSlot';
import { RecipePicker } from './components/RecipePicker';
// import { SearchRecipeResult } from '../../shared/hooks/useSearch';

const MEAL_SLOTS = [
    { id: 'breakfast', label: 'Petit Déjeuner', icon: '☕' },
    { id: 'lunch', label: 'Déjeuner', icon: '🍴' },
    { id: 'snack', label: 'Goûter', icon: '🍎' },
    { id: 'dinner', label: 'Dîner', icon: '🌙' }
] as const;

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

export const PlanningModule = () => {
    const [activeSlot, setActiveSlot] = useState<{ day: string, slot: string } | null>(null);
    const planningData = useLiveQuery(() => db.planning.toArray()) || [];

    const handleDeleteMeal = async (day: string, slot: string) => {
        // On supprime l'entrée par son ID (ex: "Lun-lunch")
        await db.planning.delete(`${day}-${slot}`);
    };

    // const handleSelectRecipe = async (recipe: SearchRecipeResult) => {
    //     if (!activeSlot) return;

    //     // 1. On prépare l'ID unique (ex: "lundi-lunch")
    //     const slotId = `${activeSlot.day}-${activeSlot.slot}`;

    //     // 2. On enregistre dans IndexedDB
    //     await db.planning.put({
    //         id: slotId,
    //         day: activeSlot.day,
    //         slot: activeSlot.slot as any,
    //         recipeId: recipe.recipeId,
    //         date: new Date().toISOString() // À affiner selon ta gestion des semaines
    //     });

    //     // 3. On ferme le sélecteur
    //     setActiveSlot(null);
    // };

    return (
        <div className="w-full h-[calc(100vh-100px)] flex flex-col p-2 gap-2 overflow-hidden">

            <div className="flex justify-between items-center px-4">
                <h1 className="text-2xl font-black text-slate-900">Ma Semaine</h1>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full">
                    Vue d'ensemble
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
                            const savedMeal = planningData.find(p => p.day === day && p.slot === mealType.id);
                            return (
                                <div key={`${day}-${mealType.id}`} className="min-h-0 w-full">
                                    <MealSlot
                                        label={mealType.label}
                                        icon={mealType.icon}
                                        recipeId={savedMeal?.recipeId}
                                        onClick={() => setActiveSlot({ day, slot: mealType.id })}
                                        onDelete={() => handleDeleteMeal(day, mealType.id)} // AJOUT ICI
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