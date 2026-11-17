import { Trash2 } from "lucide-react";
import { COOKING_LIMITS, COOKING_METHOD_LABELS } from "../../../../core/domain/cooking";
import { CookingDraft } from "../../../../core/logic/cooking/cookingFormLogic";
import { acceptsTemperature, cookedGrams, isRawMethod } from "../../../../core/logic/cooking/cookingLogic";
import { DecimalInput } from "../../../../shared/components/ui/DecimalInput";
import { FormField } from "../../../../shared/components/ui/form/FormField";
import { FORM_INPUT_CLASS as INPUT_CLASS } from "../../../../shared/components/ui/formStyles";

export interface CookingDraftCardProps {
  draft: CookingDraft;
  invalid: boolean;
  onChange: (patch: Partial<CookingDraft>) => void;
  onRemove: () => void;
}

export const CookingDraftCard = ({ draft, invalid, onChange, onRemove }: CookingDraftCardProps) => {
  const label = COOKING_METHOD_LABELS[draft.method];
  const raw = isRawMethod(draft.method);
  return (
    <section className={`flex flex-col gap-3 rounded-2xl border p-3 ${invalid ? "border-red-300" : "border-slate-200"}`}>
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-black text-slate-800">{label}</h3>
        <button
          type="button"
          aria-label={`Retirer le mode ${label}`}
          onClick={onRemove}
          className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
        >
          <Trash2 size={15} />
        </button>
      </div>

      {raw ? (
        <p className="text-xs text-slate-500">Se mange cru : seule une note est possible.</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2">
            <FormField label="Durée min (min)">
              <DecimalInput
                integer
                min={COOKING_LIMITS.minMinutes}
                value={draft.minMinutes}
                onValueChange={(minMinutes) => onChange({ minMinutes })}
                placeholder="10"
                className={INPUT_CLASS}
              />
            </FormField>
            <FormField label="Durée max (min)">
              <DecimalInput
                integer
                min={COOKING_LIMITS.minMinutes}
                value={draft.maxMinutes}
                onValueChange={(maxMinutes) => onChange({ maxMinutes })}
                placeholder="12"
                className={INPUT_CLASS}
              />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {acceptsTemperature(draft.method) && (
              <FormField label="Température (°C)">
                <DecimalInput
                  integer
                  value={draft.temperatureC}
                  onValueChange={(temperatureC) => onChange({ temperatureC })}
                  placeholder="200"
                  className={INPUT_CLASS}
                />
              </FormField>
            )}
            <FormField
              label="Ratio cru → cuit"
              hint={draft.cookedRatio !== null ? `100 g cru ≈ ${Math.round(cookedGrams(100, draft.cookedRatio))} g cuits` : "Ex. 2,5 pour le riz"}
            >
              <DecimalInput
                value={draft.cookedRatio}
                onValueChange={(cookedRatio) => onChange({ cookedRatio })}
                placeholder="2,5"
                className={INPUT_CLASS}
              />
            </FormField>
          </div>
        </>
      )}

      <FormField label="Note (facultative)">
        <input
          value={draft.note ?? ""}
          onChange={(e) => onChange({ note: e.target.value })}
          maxLength={COOKING_LIMITS.maxNoteLength}
          placeholder={raw ? "En salade, râpé…" : "À couvert, retourner à mi-cuisson…"}
          className={INPUT_CLASS}
        />
      </FormField>
    </section>
  );
};
