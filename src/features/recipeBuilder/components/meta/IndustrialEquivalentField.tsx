import { X } from "lucide-react";
import { SELECTABLE_UNITS, Unit } from "../../../../core/domain/ingredient";
import { IndustrialEquivalentDraft } from "../../../../core/domain/recipeBuilderTypes";
import { emptyIndustrialDraft, pickIndustrialFood } from "../../../../core/logic/recipeBuilder/industrialEquivalentLogic";
import { DecimalInput } from "../../../../shared/components/ui/DecimalInput";
import { FoodSearchInput } from "../../../../shared/components/ui/FoodSearchInput";
import { useFoodsSnapshot } from "../../../../shared/hooks/useCatalogueSnapshot";

export interface IndustrialEquivalentFieldProps {
  value: IndustrialEquivalentDraft | null | undefined;
  onChange: (value: IndustrialEquivalentDraft | null) => void;
}

const labelClass = "block text-[10px] font-black text-slate-400 uppercase tracking-wide mb-1";
const inputClass =
  "w-full px-3 py-2 bg-surface border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400";

export const IndustrialEquivalentField = ({ value, onChange }: IndustrialEquivalentFieldProps) => {
  const foods = useFoodsSnapshot();
  const food = value?.foodId ? foods[value.foodId] : undefined;

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className={`${labelClass} mb-0`}>Version industrielle</label>
        <button
          type="button"
          onClick={() => onChange(value ? null : emptyIndustrialDraft())}
          className="text-[11px] font-bold text-orange-600 hover:underline"
        >
          {value ? "Retirer" : "Ajouter"}
        </button>
      </div>
      {!value ? (
        <p className="text-[11px] text-slate-400">Aucun équivalent du commerce pour cette base.</p>
      ) : (
        <div className="flex flex-col gap-2 rounded-xl border border-slate-200 p-3">
          {food ? (
            <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-subtle-tint">
              <span className="text-sm font-semibold text-slate-800 truncate">{food.name}</span>
              <button
                type="button"
                aria-label="Changer d'aliment"
                onClick={() => onChange({ ...value, foodId: null })}
                className="shrink-0 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-muted"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <FoodSearchInput
              hiddenIds={[]}
              disabled={false}
              placeholder="Aliment du commerce…"
              onPick={(foodId) => {
                const picked = foods[foodId];
                if (picked) onChange(pickIndustrialFood(value, picked));
              }}
            />
          )}
          <div className="flex gap-2 items-end">
            <div className="flex-1 min-w-0">
              <label className={labelClass}>Quantité par portion de la base</label>
              <DecimalInput
                value={value.quantity}
                onValueChange={(quantity) => onChange({ ...value, quantity })}
                placeholder="ex. 150"
                className={inputClass}
              />
            </div>
            <div className="w-24 shrink-0">
              <label className={labelClass}>Unité</label>
              <select
                value={value.unit === Unit.NONE ? Unit.G : value.unit}
                onChange={(e) => {
                  const unit = SELECTABLE_UNITS.find((candidate) => candidate === e.target.value);
                  if (unit) onChange({ ...value, unit });
                }}
                className={inputClass}
              >
                {SELECTABLE_UNITS.map((unit) => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
