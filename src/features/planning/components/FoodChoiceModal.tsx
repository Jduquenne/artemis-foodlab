import { useMemo, useState } from 'react';
import { Loader2, Shuffle } from 'lucide-react';
import { FoodChoice } from '../../../core/domain/foodGroup';
import { foodsOfGroupSorted, groupIngredientsOf, resolveIngredientFood, setMealFoodChoice } from '../../../core/logic/foodGroup/foodChoiceLogic';
import { getProfileColorHex } from '../../../core/logic/profile/profileLogic';
import { foodGroupLabel } from '../../../core/logic/dashboard/foodGroupFormLogic';
import { useFoodGroupsSnapshot, useFoodsSnapshot, useRecipesSnapshot } from '../../../shared/hooks/useCatalogueSnapshot';
import { usePendingKey } from '../../../shared/hooks/usePendingKey';
import { useProfileStore } from '../../../shared/store/useProfileStore';

export interface FoodChoiceModalProps {
    recipeId: string;
    pendingKey: string;
    initialChoices: FoodChoice[];
    onSave: (choices: FoodChoice[]) => Promise<boolean>;
    onClose: () => void;
}

const SOURCE_LABELS = {
    profile: 'préférence du profil',
    recipe: 'défaut de la recette',
};

export const FoodChoiceModal = ({ recipeId, pendingKey, initialChoices, onSave, onClose }: FoodChoiceModalProps) => {
    const recipes = useRecipesSnapshot();
    const foods = useFoodsSnapshot();
    const groups = useFoodGroupsSnapshot();
    const profiles = useProfileStore((s) => s.profiles);
    const pending = usePendingKey(pendingKey);
    const [choices, setChoices] = useState<FoodChoice[]>(initialChoices);

    const recipe = recipes[recipeId];
    const ingredients = useMemo(() => groupIngredientsOf(recipe), [recipe]);

    const save = async () => {
        if (await onSave(choices)) onClose();
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-sm p-5 flex flex-col max-h-[90dvh]">
                <p className="text-xs font-black text-orange-600 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                    <Shuffle size={12} /> Ingrédients au choix
                </p>
                <p className="text-sm font-bold text-slate-800 mb-4 truncate">{recipe?.name ?? recipeId}</p>

                <div className="flex flex-col gap-4 overflow-y-auto min-h-0 mb-4">
                    {ingredients.map((ingredient) => {
                        const options = ingredient.foodGroupId ? foodsOfGroupSorted(foods, ingredient.foodGroupId) : [];
                        return (
                            <section key={ingredient.id} className="flex flex-col gap-2">
                                <p className="text-xs font-bold text-slate-500">
                                    {ingredient.name}
                                    <span className="font-normal text-slate-400"> · {foodGroupLabel(groups, ingredient.foodGroupId)}</span>
                                </p>
                                {profiles.map((profile) => {
                                    const mealChoice = choices.find((c) => c.recipeIngredientId === ingredient.id && c.profileId === profile.id);
                                    const fallback = resolveIngredientFood(ingredient, profile.id, profile.foodGroupDefaults, []);
                                    const fallbackName = fallback ? (foods[fallback.foodId]?.name ?? fallback.foodId) : '—';
                                    const fallbackSource = fallback && fallback.source !== 'meal' ? SOURCE_LABELS[fallback.source] : '';
                                    return (
                                        <label key={profile.id} className="flex items-center gap-2">
                                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: getProfileColorHex(profile.color) }} />
                                            <span className="w-20 shrink-0 text-sm text-slate-700 truncate">{profile.name}</span>
                                            <select
                                                value={mealChoice?.foodId ?? ''}
                                                disabled={pending}
                                                onChange={(e) => setChoices((prev) => setMealFoodChoice(prev, ingredient.id, profile.id, e.target.value || null))}
                                                className="flex-1 min-w-0 px-2 py-2 bg-surface border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 disabled:opacity-50"
                                            >
                                                <option value="">{`${fallbackName} (${fallbackSource})`}</option>
                                                {options.map((food) => (
                                                    <option key={food.id} value={food.id}>{food.name}</option>
                                                ))}
                                            </select>
                                        </label>
                                    );
                                })}
                            </section>
                        );
                    })}
                </div>

                <div className="flex flex-col gap-2">
                    <button
                        onClick={save}
                        disabled={pending}
                        className="w-full py-2.5 rounded-xl bg-orange-500 text-white text-sm font-bold hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {pending && <Loader2 className="w-4 h-4 animate-spin" />}
                        Enregistrer
                    </button>
                    <button
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
