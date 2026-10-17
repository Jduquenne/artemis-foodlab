import { useState } from "react";
import { FoodList } from "../../../../core/domain/menuGenerator";
import { validateFoodList } from "../../../../core/logic/menuGenerator/habitLogic";
import { FoodChipsField } from "./FoodChipsField";

export interface FoodListEditorProps {
  initial: FoodList;
  lists: readonly FoodList[];
  disabled: boolean;
  onSave: (list: FoodList) => void;
  onCancel: () => void;
}

export const FoodListEditor = ({ initial, lists, disabled, onSave, onCancel }: FoodListEditorProps) => {
  const [draft, setDraft] = useState<FoodList>(initial);
  const [error, setError] = useState<string | null>(null);

  const save = () => {
    const problem = validateFoodList(draft, lists);
    setError(problem);
    if (!problem) onSave({ ...draft, name: draft.name.trim() });
  };

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-orange-200 dark:border-orange-900 p-3">
      <input
        value={draft.name}
        disabled={disabled}
        onChange={(e) => setDraft((current) => ({ ...current, name: e.target.value }))}
        placeholder="Nom de la liste, ex : Poisson blanc"
        aria-label="Nom de la liste"
        className="w-full px-3 py-2 bg-surface border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 disabled:opacity-50"
      />
      <FoodChipsField
        foodIds={draft.foodIds}
        placeholder="Ajouter un aliment…"
        disabled={disabled}
        onChange={(foodIds) => setDraft((current) => ({ ...current, foodIds }))}
      />
      {error && <p className="text-xs font-semibold text-red-500">{error}</p>}
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} disabled={disabled} className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-500 hover:bg-muted disabled:opacity-50">
          Annuler
        </button>
        <button type="button" onClick={save} disabled={disabled} className="px-3 py-1.5 rounded-lg bg-orange-500 text-xs font-bold text-white hover:bg-orange-600 disabled:opacity-50">
          Enregistrer
        </button>
      </div>
    </div>
  );
};
