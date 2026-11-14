import { RecipeDetails } from '../../../../core/domain/recipe';
import { Macronutrients } from '../../../../core/domain/nutrition';
import { cookedWeightPerPortion, kcalPer100CookedGrams } from '../../../../core/logic/recipe/cookedWeightLogic';

export interface CookedWeightInfoProps {
  recipe: RecipeDetails;
  macros: Macronutrients | null;
  compact?: boolean;
}

export const CookedWeightInfo = ({ recipe, macros, compact = false }: CookedWeightInfoProps) => {
  const perPortion = cookedWeightPerPortion(recipe);
  if (perPortion === null) return null;
  const kcal100 = macros ? kcalPer100CookedGrams(recipe, macros.kcal) : null;
  return (
    <div className={`${compact ? 'text-left' : 'text-center'} text-[11px] leading-snug text-slate-400`}>
      <p className="font-semibold text-slate-500">1 part ≈ {Math.round(perPortion)} g cuits</p>
      {kcal100 !== null && <p>{Math.round(kcal100)} kcal / 100 g cuits</p>}
    </div>
  );
};
