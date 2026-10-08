import { useState } from "react";
import { validateVariantName } from "../../../core/logic/recipeBuilder/recipeVariantLogic";
import { PhotoField } from "./output/PhotoField";

export interface VariantModalProps {
  sourceName: string;
  onConfirm: (name: string, mealPhoto: File) => void;
  onCancel: () => void;
}

export const VariantModal = ({ sourceName, onConfirm, onCancel }: VariantModalProps) => {
  const [name, setName] = useState(sourceName);
  const [mealPhoto, setMealPhoto] = useState<File | null>(null);
  const nameError = validateVariantName(name, sourceName);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white dark:bg-slate-100 rounded-2xl shadow-2xl p-5 flex flex-col gap-4 modal-center-enter">
        <div>
          <p className="text-xs font-black text-orange-600 uppercase tracking-widest">Créer une variante</p>
          <p className="text-sm text-slate-600 mt-1.5">
            La variante reprend le contenu de « {sourceName} » dans une nouvelle recette, avec son propre nom, sa photo et un nouveau numéro.
          </p>
        </div>

        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-black text-slate-400 uppercase tracking-wide">Nom de la variante</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            className="w-full px-3 py-2 bg-white dark:bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
          />
          {nameError && <span className="text-xs text-red-500">{nameError}</span>}
        </label>

        <PhotoField label="Photo du plat" file={mealPhoto} hasExisting={false} onPick={setMealPhoto} />

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-200 transition-colors"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={() => mealPhoto && onConfirm(name, mealPhoto)}
            disabled={nameError !== null || !mealPhoto}
            className="flex-1 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-bold hover:bg-orange-600 transition-colors disabled:opacity-50"
          >
            Créer la variante
          </button>
        </div>
      </div>
    </div>
  );
};
