import { useMemo, useState } from 'react';
import { Loader2, Shuffle } from 'lucide-react';
import { FoodChoice } from '../../../core/domain/foodGroup';
import { AccompanimentChoice } from '../../../core/domain/accompaniment';
import { findMealChoice, foodsOfGroupSorted, reachableQuantityPerPortion, resolveIngredientFood, setMealFoodChoice, setMealFoodQuantity } from '../../../core/logic/foodGroup/foodChoiceLogic';
import { accompanimentsFor, findAccompanimentChoice, mealChoiceIngredients, resolveAccompaniment, setAccompanimentChoice } from '../../../core/logic/accompaniment/accompanimentLogic';
import { ACCOMPANIMENT_NONE_VALUE, accompanimentOptionLabel } from '../../../core/logic/accompaniment/accompanimentFormLogic';
import { formatQty } from '../../../core/logic/unit/unitFormatLogic';
import { DecimalInput } from '../../../shared/components/ui/DecimalInput';
import { getProfileColorHex } from '../../../core/logic/profile/profileLogic';
import { foodGroupLabel } from '../../../core/logic/dashboard/foodGroupFormLogic';
import { useFoodGroupsSnapshot, useFoodsSnapshot, useRecipesSnapshot } from '../../../shared/hooks/useCatalogueSnapshot';
import { usePendingKey } from '../../../shared/hooks/usePendingKey';
import { useProfileStore } from '../../../shared/store/useProfileStore';
import { useAccompanimentStore } from '../../../shared/store/useAccompanimentStore';

export interface FoodChoiceModalProps {
    recipeId: string;
    pendingKey: string;
    initialChoices: FoodChoice[];
    initialAccompanimentChoices: AccompanimentChoice[];
    onSave: (choices: FoodChoice[], accompanimentChoices: AccompanimentChoice[]) => Promise<boolean>;
    onClose: () => void;
}

const SOURCE_LABELS = {
    profile: 'préférence du profil',
    recipe: 'défaut de la recette',
    accompaniment: 'défaut',
};

const SELECT_CLASS = 'flex-1 min-w-0 px-2 py-2 bg-surface border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 disabled:opacity-50';

export const FoodChoiceModal = ({ recipeId, pendingKey, initialChoices, initialAccompanimentChoices, onSave, onClose }: FoodChoiceModalProps) => {
    const recipes = useRecipesSnapshot();
    const foods = useFoodsSnapshot();
    const groups = useFoodGroupsSnapshot();
    const profiles = useProfileStore((s) => s.profiles);
    const allAccompaniments = useAccompanimentStore((s) => s.accompaniments);
    const pending = usePendingKey(pendingKey);
    const [choices, setChoices] = useState<FoodChoice[]>(initialChoices);
    const [accompanimentChoices, setAccompanimentChoices] = useState<AccompanimentChoice[]>(initialAccompanimentChoices);

    const recipe = recipes[recipeId];
    const accompaniments = useMemo(() => accompanimentsFor(recipeId, allAccompaniments), [recipeId, allAccompaniments]);
    const ingredients = useMemo(
        () => (recipe ? mealChoiceIngredients(recipe, recipes, allAccompaniments, profiles, accompanimentChoices) : []),
        [recipe, recipes, allAccompaniments, profiles, accompanimentChoices],
    );

    const save = async () => {
        if (await onSave(choices, accompanimentChoices)) onClose();
    };

    const profileDot = (color: string) => (
        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: getProfileColorHex(color) }} />
    );

    return (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-md p-5 flex flex-col max-h-[90dvh]">
                <p className="text-xs font-black text-orange-600 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                    <Shuffle size={12} /> Choix du repas
                </p>
                <p className="text-sm font-bold text-slate-800 mb-4 truncate">{recipe?.name ?? recipeId}</p>

                <div className="flex flex-col gap-4 overflow-y-auto min-h-0 mb-4">
                    {accompaniments.map((accompaniment) => (
                        <section key={accompaniment.id} className="flex flex-col gap-2">
                            <p className="text-xs font-bold text-slate-500">
                                {accompaniment.name}
                                <span className="font-normal text-slate-400"> · accompagnement</span>
                            </p>
                            {profiles.map((profile) => {
                                const mealChoice = findAccompanimentChoice(accompanimentChoices, accompaniment.id, profile.id);
                                const fallback = resolveAccompaniment(accompaniment, profile, []);
                                const fallbackName = fallback.option ? accompanimentOptionLabel(fallback.option, recipes, foods) : 'Sans';
                                const value = mealChoice ? (mealChoice.optionId ?? ACCOMPANIMENT_NONE_VALUE) : '';
                                return (
                                    <label key={profile.id} className="flex items-center gap-2">
                                        {profileDot(profile.color)}
                                        <span className="w-20 shrink-0 text-sm text-slate-700 truncate">{profile.name}</span>
                                        <select
                                            value={value}
                                            disabled={pending}
                                            onChange={(e) => {
                                                const next = e.target.value;
                                                const optionId = next === '' ? undefined : next === ACCOMPANIMENT_NONE_VALUE ? null : next;
                                                setAccompanimentChoices((prev) => setAccompanimentChoice(prev, accompaniment.id, profile.id, optionId));
                                            }}
                                            className={SELECT_CLASS}
                                        >
                                            <option value="">{`${fallbackName} (${SOURCE_LABELS[fallback.source === 'profile' ? 'profile' : 'accompaniment']})`}</option>
                                            <option value={ACCOMPANIMENT_NONE_VALUE}>Sans accompagnement</option>
                                            {accompaniment.options.map((option) => (
                                                <option key={option.id} value={option.id}>{accompanimentOptionLabel(option, recipes, foods)}</option>
                                            ))}
                                        </select>
                                    </label>
                                );
                            })}
                        </section>
                    ))}

                    {ingredients.map(({ entry, ownerName, profileIds }) => {
                        const { ingredient } = entry;
                        const options = ingredient.foodGroupId ? foodsOfGroupSorted(foods, ingredient.foodGroupId) : [];
                        const perPortion = reachableQuantityPerPortion(entry);
                        const unit = ingredient.unit || '';
                        return (
                            <section key={ingredient.id} className="flex flex-col gap-2">
                                <p className="text-xs font-bold text-slate-500">
                                    {ownerName && <span className="font-semibold text-slate-400">{ownerName} › </span>}
                                    {ingredient.name}
                                    <span className="font-normal text-slate-400"> · {foodGroupLabel(groups, ingredient.foodGroupId)}</span>
                                </p>
                                {profiles.filter((profile) => profileIds.includes(profile.id)).map((profile) => {
                                    const mealChoice = findMealChoice(choices, ingredient.id, profile.id);
                                    const fallback = resolveIngredientFood(ingredient, profile.id, profile.foodGroupDefaults, []);
                                    const fallbackName = fallback ? (foods[fallback.foodId]?.name ?? fallback.foodId) : '—';
                                    const fallbackSource = fallback && fallback.source !== 'meal' ? SOURCE_LABELS[fallback.source] : '';
                                    return (
                                        <label key={profile.id} className="flex items-center gap-2">
                                            {profileDot(profile.color)}
                                            <span className="w-20 shrink-0 text-sm text-slate-700 truncate">{profile.name}</span>
                                            <select
                                                value={mealChoice?.foodId ?? ''}
                                                disabled={pending}
                                                onChange={(e) => setChoices((prev) => setMealFoodChoice(prev, ingredient.id, profile.id, e.target.value || null))}
                                                className={SELECT_CLASS}
                                            >
                                                <option value="">{`${fallbackName} (${fallbackSource})`}</option>
                                                {options.map((food) => (
                                                    <option key={food.id} value={food.id}>{food.name}</option>
                                                ))}
                                            </select>
                                            <DecimalInput
                                                value={mealChoice?.quantity ?? null}
                                                disabled={pending || !mealChoice}
                                                onValueChange={(quantity) => setChoices((prev) => setMealFoodQuantity(prev, ingredient.id, profile.id, quantity))}
                                                placeholder={perPortion !== null ? formatQty(perPortion) : '—'}
                                                aria-label={`Quantité par personne pour ${profile.name}`}
                                                className="w-16 shrink-0 px-2 py-2 bg-surface border border-slate-200 rounded-xl text-sm text-slate-800 text-center placeholder-slate-400 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 disabled:opacity-40"
                                            />
                                            <span className="w-10 shrink-0 text-[10px] text-slate-400 leading-tight">{unit} / pers.</span>
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
