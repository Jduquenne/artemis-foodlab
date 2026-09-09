import { useMemo, useState } from "react";
import { Save, X, Check, Loader2, Trash2, AlertTriangle } from "lucide-react";
import { RecipeBuilderState } from "../../../../core/domain/recipeBuilderTypes";
import { getBuilderRecipeCode, summarizeBuilderState, validateBuilderState } from "../../../../core/logic/recipeBuilder/recipeBuilderLogic";
import { typedRecipesDb } from "../../../../core/typed-db/typedRecipesDb";
import { useRecipeBuilderSave } from "../../../../shared/hooks/useRecipeBuilderSave";
import { useRecipeBuilderStore } from "../../../../shared/store/useRecipeBuilderStore";

export interface SaveRecipePanelProps {
  state: RecipeBuilderState;
  mealPhoto: File | null;
  bookPhoto: File | null;
  onSaved: () => void;
}

export const SaveRecipePanel = ({ state, mealPhoto, bookPhoto, onSaved }: SaveRecipePanelProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { status, validationErrors, save, remove, reset } = useRecipeBuilderSave();
  const resetBuilder = useRecipeBuilderStore((s) => s.reset);

  const code = getBuilderRecipeCode(state);
  const existing = typedRecipesDb[code];
  const isExisting = Boolean(existing?.apiId);
  const liveErrors = useMemo(() => validateBuilderState(state), [state]);
  const recap = useMemo(() => summarizeBuilderState(state), [state]);

  const close = () => {
    setIsOpen(false);
    setConfirmDelete(false);
    reset();
  };

  const handleSave = async () => {
    const ok = await save(state, { mealPhoto, bookPhoto });
    if (ok) onSaved();
  };

  const handleDelete = async () => {
    const ok = await remove(code);
    if (ok) {
      resetBuilder();
      close();
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 rounded-xl transition-colors"
      >
        <Save className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Enregistrer</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={close}>
          <div
            className="w-full max-w-lg bg-white dark:bg-slate-100 rounded-2xl shadow-2xl flex flex-col overflow-hidden modal-center-enter"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-slate-100">
              <div>
                <p className="text-xs font-black text-orange-600 uppercase tracking-widest">
                  {isExisting ? "Mettre à jour" : "Créer la recette"}
                </p>
                <p className="text-xs text-slate-400 font-mono mt-0.5">{code}</p>
              </div>
              <button
                type="button"
                onClick={close}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-5 py-4 flex flex-col gap-4 overflow-y-auto">
              {liveErrors.length > 0 && (
                <div className="flex flex-col gap-1 px-3 py-2.5 bg-red-50 dark:bg-red-900/20 rounded-xl">
                  {liveErrors.map((err) => (
                    <span key={err} className="flex items-center gap-1.5 text-xs text-red-600">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      {err}
                    </span>
                  ))}
                </div>
              )}

              <dl className="flex flex-col divide-y divide-slate-100 rounded-xl border border-slate-200 overflow-hidden">
                {recap.map(({ label, value }) => (
                  <div key={label} className="flex gap-3 px-3 py-1.5 text-xs">
                    <dt className="w-24 shrink-0 text-slate-400">{label}</dt>
                    <dd className="flex-1 min-w-0 font-medium text-slate-700 break-words">{value}</dd>
                  </div>
                ))}
              </dl>

              {(mealPhoto || bookPhoto) && (
                <div className="flex flex-col gap-1 px-3 py-2.5 bg-slate-50 dark:bg-slate-200 rounded-xl text-xs text-slate-500">
                  {mealPhoto && <span>Nouvelle photo du plat : {mealPhoto.name}</span>}
                  {bookPhoto && <span>Nouvelle photo du livre : {bookPhoto.name}</span>}
                </div>
              )}

              {status === "error" && validationErrors.length === 0 && (
                <span className="text-xs text-red-500">L'enregistrement a échoué. Réessaie.</span>
              )}
            </div>

            <div className="px-5 py-4 border-t border-slate-100 flex items-center gap-2">
              {isExisting && (
                confirmDelete ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={status === "saving"}
                      className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors disabled:opacity-60"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Confirmer
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(false)}
                      className="px-3 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 rounded-xl transition-colors"
                    >
                      Annuler
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Supprimer
                  </button>
                )
              )}

              <button
                type="button"
                onClick={handleSave}
                disabled={liveErrors.length > 0 || status === "saving"}
                className={`ml-auto flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
                  status === "done"
                    ? "bg-green-50 text-green-600 dark:bg-green-900/20"
                    : "bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50"
                }`}
              >
                {status === "saving" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : status === "done" ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {status === "saving"
                  ? "Enregistrement…"
                  : status === "done"
                    ? "Enregistré"
                    : isExisting
                      ? "Mettre à jour"
                      : "Créer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
