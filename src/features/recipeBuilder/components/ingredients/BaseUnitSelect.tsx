import { Unit } from "../../../../core/domain/ingredient";
import { DraftIngredient } from "../../../../core/domain/recipeBuilderTypes";
import { baseAllowsGrams } from "../../../../core/logic/recipeBuilder/baseGramsLogic";
import { useRecipesSnapshot } from "../../../../shared/hooks/useCatalogueSnapshot";

export interface BaseUnitSelectProps {
  ingredient: DraftIngredient;
  onChange: (updated: DraftIngredient) => void;
  className?: string;
}

export const BaseUnitSelect = ({ ingredient, onChange, className = "" }: BaseUnitSelectProps) => {
  const recipes = useRecipesSnapshot();
  const base = ingredient.baseId ? recipes[ingredient.baseId] : undefined;
  const allowsGrams = baseAllowsGrams(base);
  const inGrams = ingredient.unit === Unit.G;

  if (!allowsGrams && !inGrams) {
    return <span className="text-xs text-slate-400 shrink-0">portion</span>;
  }

  return (
    <select
      value={inGrams ? Unit.G : Unit.PORTION}
      onChange={(e) => onChange({ ...ingredient, unit: e.target.value as Unit })}
      aria-label="Unité de la base"
      className={`px-1 py-2 bg-surface border rounded-xl text-sm text-slate-800 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 ${inGrams && !allowsGrams ? "border-orange-400" : "border-slate-200"} ${className}`}
    >
      <option value={Unit.PORTION}>portion</option>
      <option value={Unit.G}>g cuits</option>
    </select>
  );
};
