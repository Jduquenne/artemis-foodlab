import { Apple, CookingPot, X } from "lucide-react";
import { SELECTABLE_UNITS, Unit } from "../../../core/domain/ingredient";
import { AccompanimentOptionDraft, searchOptionRecipes } from "../../../core/logic/accompaniment/accompanimentFormLogic";
import { DecimalInput } from "../../../shared/components/ui/DecimalInput";
import { FoodSearchInput } from "../../../shared/components/ui/FoodSearchInput";
import { RecipeSearchInput } from "../../../shared/components/ui/RecipeSearchInput";
import { useFoodsSnapshot, useRecipesSnapshot } from "../../../shared/hooks/useCatalogueSnapshot";
import { parseUnit } from "../../../core/logic/unit/unitLogic";

export interface AccompanimentOptionRowProps {
  option: AccompanimentOptionDraft;
  index: number;
  disabled: boolean;
  onChange: (option: AccompanimentOptionDraft) => void;
  onRemove: () => void;
}

const FIELD = "px-2 py-1.5 bg-surface border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 disabled:opacity-50";

export const AccompanimentOptionRow = ({ option, index, disabled, onChange, onRemove }: AccompanimentOptionRowProps) => {
  const recipes = useRecipesSnapshot();
  const foods = useFoodsSnapshot();
  const isRecipe = option.kind === "recipe";
  const pickedName = isRecipe
    ? (option.recipeCode ? (recipes[option.recipeCode]?.name ?? "Recette supprimée") : null)
    : (option.foodId ? (foods[option.foodId]?.name ?? "Aliment supprimé") : null);

  return (
    <div className="flex flex-col gap-2 p-3 rounded-xl border border-slate-200 bg-surface">
      <div className="flex items-center gap-2">
        {isRecipe ? <CookingPot className="w-4 h-4 text-orange-500 shrink-0" /> : <Apple className="w-4 h-4 text-emerald-500 shrink-0" />}
        <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
          Option {index + 1} · {isRecipe ? "Recette" : "Aliment"}
        </span>
        <button
          type="button"
          onClick={onRemove}
          disabled={disabled}
          aria-label={`Retirer l'option ${index + 1}`}
          className="ml-auto p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-muted transition-colors disabled:opacity-50"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {pickedName ? (
        <div className="flex items-center gap-2">
          <span className="flex-1 min-w-0 text-sm font-semibold text-slate-800 truncate">{pickedName}</span>
          <button
            type="button"
            disabled={disabled}
            onClick={() => onChange(isRecipe ? { ...option, recipeCode: null } : { ...option, foodId: null })}
            className="text-xs font-bold text-slate-400 hover:text-orange-600 transition-colors disabled:opacity-50"
          >
            Changer
          </button>
        </div>
      ) : isRecipe ? (
        <RecipeSearchInput
          disabled={disabled}
          search={searchOptionRecipes}
          placeholder="Ex : tartine, croûtons…"
          onPick={(recipeCode) => onChange({ ...option, recipeCode })}
        />
      ) : (
        <FoodSearchInput
          hiddenIds={[]}
          disabled={disabled}
          placeholder="Ex : croûtons, pain…"
          onPick={(foodId) => onChange({ ...option, foodId, unit: parseUnit(foods[foodId]?.unit) === Unit.NONE ? Unit.G : parseUnit(foods[foodId]?.unit) })}
        />
      )}

      <div className="flex items-center gap-2">
        {isRecipe ? (
          <>
            <DecimalInput
              value={option.portionsPerPerson}
              disabled={disabled}
              onValueChange={(portionsPerPerson) => onChange({ ...option, portionsPerPerson })}
              placeholder="1"
              aria-label="Portions par personne"
              className={`w-20 text-center ${FIELD}`}
            />
            <span className="text-xs text-slate-500">portion(s) par personne</span>
          </>
        ) : (
          <>
            <DecimalInput
              value={option.quantityPerPerson}
              disabled={disabled}
              onValueChange={(quantityPerPerson) => onChange({ ...option, quantityPerPerson })}
              placeholder="20"
              aria-label="Quantité par personne"
              className={`w-20 text-center ${FIELD}`}
            />
            <select
              value={option.unit}
              disabled={disabled}
              onChange={(e) => onChange({ ...option, unit: parseUnit(e.target.value) })}
              aria-label="Unité"
              className={`w-24 ${FIELD}`}
            >
              {SELECTABLE_UNITS.map((unit) => (
                <option key={unit} value={unit}>{unit}</option>
              ))}
            </select>
            <span className="text-xs text-slate-500">par personne</span>
          </>
        )}
      </div>
    </div>
  );
};
